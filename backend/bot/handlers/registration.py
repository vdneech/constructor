import logging
import os

import pytz
from datetime import datetime

from django.db.models import QuerySet
from django.utils import timezone

from bot.handlers.invoices import send_invoice
from bot.telegram_bot import bot
from users.models import User
from telebot import types
from bot.models import RegistrationStep, Configuration
from django.db import transaction



logger = logging.getLogger(__name__)
MOSCOW_TZ = pytz.timezone('Europe/Moscow')








def extract_value(message, step: RegistrationStep) -> str:
    if step.field_type == 'phone':
        if getattr(message, 'contact', None) and message.contact.phone_number:
            return message.contact.phone_number
        return (message.text or '').strip()

    return (message.text or '').strip()


def is_in_registration(message):
    '''Проверка регистрации и обработка сообщений с / вначале'''
    if message.content_type == 'text' and message.text and message.text.startswith('/'):
        return False

    return User.objects.filter(
        telegram_chat_id=message.from_user.id,
        is_registered=False,
        registration_step__isnull=False
    ).exists()


@bot.message_handler(func=is_in_registration, content_types=['text', 'contact'])
def registration_message_handler(message: types.Message):
    user = User.objects.select_related('registration_step').get(
        telegram_chat_id=message.from_user.id
    )
    step = user.registration_step

    # на всякий случай (если данные в БД съехали)
    if user.is_registered or step is None:
        bot.send_message(message.chat.id, "Регистрация уже завершена.")
        return

    raw = extract_value(message, step)

    ok, validated_or_error = step.validate_data(raw)
    if not ok:
        bot.send_message(message.chat.id, validated_or_error, parse_mode='HTML')
        return

    # сохраняем значение + двигаем шаг атомарно
    with transaction.atomic():
        step.save_to_user(user, validated_or_error)

        next_step = step.next_step
        user.registration_step = next_step

        if next_step is None:
            user.is_registered = True
            user.save(update_fields=['registration_step', 'is_registered'])
        else:
            user.save(update_fields=['registration_step'])

    # отвечаем пользователю
    if user.is_registered:
        bot.send_message(message.chat.id, "Отлично! Регистрация завершена, формирую инвойс…")
        send_invoice(
            message
        )
    else:
        bot.send_message(
            message.chat.id,
            user.registration_step.message_text,
            parse_mode='HTML'
        )





def check_date(config) -> bool:
    if not config.end_of_registration:
        logger.info('Дата не стоит')
        return True

    elif config.end_of_registration < timezone.now().date():
        logger.info('Дата истекла')
        return False
    return True

def check_max_users(config) -> bool:
    count = User.objects.all().count()
    if count <= config.max_users:
        logger.info('Все ок')
        return False

    logger.info('Юзеров уже много')
    return True

@bot.callback_query_handler(func=lambda call: call.data == "register")
def registration_entry(call: types.CallbackQuery):
    """Старт регистрации при нажатии на кнопку 'Регистрация' в меню."""



    chat_id = call.message.chat.id
    config = Configuration.objects.get_config()

    if check_date(config) and check_max_users(config):
        bot.send_message(
            chat_id=chat_id,
            text=config.closed_registrations_message
        )
        return


    if config.end_of_registration and config.end_of_registration <= timezone.now().date():
        bot.send_message(
            chat_id=chat_id,
            text=config.closed_registrations_message,
            parse_mode='HTML'
        )
        return

    user, created = User.objects.get_or_create(
        telegram_chat_id=chat_id,
        username=call.from_user.username or f'guest{chat_id} — пользователь без ника'
    )
    if created:
        logger.info(f'User({chat_id}) was registrated')

    if user.is_registered:
        if not user.paid:
            bot.send_message(
                chat_id=chat_id,
                text='Регистрация прошла, но ты все еще не зарегистрирован')
            send_invoice(call.message)
            return

        bot.send_message(
            chat_id=call.message.chat.id,
            text=config.already_registered_message)
        return

    registration_step = RegistrationStep.objects.order_by('order').first()

    if not registration_step:
        bot.send_message(
            chat_id=call.message.chat.id,
            text=config.closed_registrations_message
        )
        return

    user.registration_step = registration_step
    user.save(update_fields=['registration_step', ])

    bot.send_message(
        chat_id=call.message.chat.id,
        text=registration_step.message_text,
        parse_mode='HTML'
    )
