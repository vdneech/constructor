import os
import logging
import json
from django.utils import timezone
from django.db.models import QuerySet
from telebot import types, apihelper
from rest_framework.exceptions import APIException
from django.conf import settings

from bot.models import Configuration
from bot.telegram_bot import bot
from config.settings import BASE_URL
from users.models import User
from goods.models import Good  # Импортируем товары

logger = logging.getLogger(__name__)


# --- Вспомогательные функции ---

def _handle_registration_payment(user, chat_id):
    """Логика после оплаты регистрации"""
    user.paid = True
    user.paid_at = timezone.now()
    user.save(update_fields=['paid', 'paid_at'])

    bot.send_message(
        chat_id,
        "<b>Оплата принята!</b>\nТеперь вы зарегистрированы. Ожидайте подтверждения администратором.",
        parse_mode='HTML'
    )
    logger.info(f"User {user.id} paid for registration")


def _handle_good_payment(chat_id, payload):
    """Логика после оплаты конкретного товара"""
    try:

        good_id = int(payload.split('_')[1])
        good = Good.objects.get(id=good_id)

        # Уменьшаем остаток на складе
        if good.quantity > 0:
            good.quantity -= 1
            good.save(update_fields=['quantity'])

        bot.send_message(
            chat_id,
            f"<b>Оплата получена!</b>\nТовар: {good.title}\nМы готовим его к выдаче.",
            parse_mode='HTML'
        )
        logger.info(f"Good {good.id} purchased by {chat_id}")
    except (Good.DoesNotExist, IndexError, ValueError) as e:
        logger.error(f"Error processing good payment for payload {payload}: {e}")


# --- Основные функции инвойсов ---

def send_invoice(message):
    config = Configuration.objects.get_config()
    price_amount = int(config.price * 100)

    bot.send_invoice(
        chat_id=message.chat.id,
        title=config.invoice_title,
        description=config.invoice_description,
        invoice_payload=config.INVOICE_PAYLOAD,
        provider_token=os.getenv('PROVIDER_TOKEN'),
        currency=os.getenv('CURRENCY'),
        prices=[types.LabeledPrice(label=str(config.invoice_label), amount=price_amount)],
        need_email=True,
        send_email_to_provider=True,
        provider_data=config.provider_data,
        photo_url = settings.BASE_URL + config.invoice_image.url if config.invoice_image else None,
    )


def send_good_invoice(message: types.Message, good: Good):
    price_amount = int(good.price * 100)
    try:
        invoice_image = good.images.filter(is_invoice=True).first()
        invoice_image_url = invoice_image.image.url
        bot.send_invoice(
            chat_id=message.chat.id,
            title=good.title,
            description=good.label or good.title,
            invoice_payload=f"good_{good.id}",
            provider_token=os.getenv('PROVIDER_TOKEN'),
            currency=os.getenv('CURRENCY'),
            prices=[types.LabeledPrice(label=str(good.label), amount=price_amount)],
            need_email=True,
            send_email_to_provider=True,
            provider_data=good.provider_data,
            photo_url=settings.BASE_URL + invoice_image_url if invoice_image else None,
        )
    except Exception as e:
        logger.error(f"Good invoice failed: {e}")
        bot.send_message(message.chat.id, "Ошибка при формировании счета.")


# --- Хендлеры ---

@bot.pre_checkout_query_handler(func=lambda query: True)
def checkout(pre_checkout_query):
    payload = pre_checkout_query.invoice_payload
    config = Configuration.objects.get_config()


    if payload.startswith('good_'):
        try:
            good_id = int(payload.split('_')[1])
            good = Good.objects.get(id=good_id)
            if good.quantity <= 0 or not good.available:
                return bot.answer_pre_checkout_query(
                    pre_checkout_query.id,
                    ok=False,
                    error_message="Извините, этот товар только что закончился."
                )
        except Exception:
            return bot.answer_pre_checkout_query(pre_checkout_query.id, ok=False,
                                                 error_message="Ошибка проверки товара.")
    if payload == config.INVOICE_PAYLOAD:
        try:
            chat_id = pre_checkout_query.from_user.id
            user = User.objects.get(telegram_chat_id=chat_id)

            if not user or not user.is_registered:
                return bot.answer_pre_checkout_query(
                    pre_checkout_query.id,
                    ok=False,
                    error_message="Не нашли зарегистрированного пользователя с вашим идентификатором. Пройдите регистрацию и попробуйте снова"
                )
            if user.paid:
                return bot.answer_pre_checkout_query(
                    pre_checkout_query.id,
                    ok=False,
                    error_message="Кажется, вы уже зарегистрированы. Оплатить регистрацию заново у вас не получится."
                )
            if pre_checkout_query.total_amount/100 != config.price:
                return bot.answer_pre_checkout_query(
                    pre_checkout_query.id,
                    ok=False,
                    error_message=f'Цена на регистрацию поменялась. Попробуйте оплатить снова. \n\nЧтобы это сделать, нажмите "Регистрация" в боте.'
                )

        except Exception:
            return bot.answer_pre_checkout_query(pre_checkout_query.id, ok=False,
                                                 error_message="Ошибка проверки регистрации")


    bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)


@bot.message_handler(content_types=['successful_payment'])
def got_payment(message):
    payment = message.successful_payment
    payload = payment.invoice_payload
    chat_id = message.chat.id

    try:
        user = User.objects.get(telegram_chat_id=chat_id)

        if payload == 'registration':
            _handle_registration_payment(user, chat_id)
        elif payload.startswith('good_'):
            _handle_good_payment(chat_id, payload)

    except User.DoesNotExist:
        logger.error(f"Payment from unknown user: {chat_id}")
        bot.send_message(chat_id, "Ошибка: профиль не найден. Свяжитесь с поддержкой.")