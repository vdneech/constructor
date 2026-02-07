import os
import logging
from typing import List
from django.db.models import QuerySet
from dotenv import load_dotenv, find_dotenv
from telebot import types

from bot.handlers.invoices import send_good_invoice
from bot.models import Configuration
from bot.bot import bot
from goods.models import Good

load_dotenv(find_dotenv())

logger = logging.getLogger(__name__)


_KEYS = [
    'store',
    'merchandise'
]

@bot.message_handler(commands=_KEYS)
def merchandise(message: types.Message) -> None:
    '''Отправляет сообщение со списком Callback-кнопок доступных товаров.'''

    config = Configuration.objects.get_config()
    goods = Good.objects.filter(available=True).values('title', 'id')

    keyboard = types.InlineKeyboardMarkup()

    for good in goods:
        button = types.InlineKeyboardButton(
            text=good['title'],
            callback_data=str(good['id'])
        )
        keyboard.add(button)

    bot.send_message(
        chat_id=message.chat.id,
        text=config.merchant_message,
        reply_markup=keyboard,
        parse_mode='HTML'
    )


@bot.callback_query_handler(func=lambda callback: callback.data in _KEYS)
def merchandise_callback(callback: types.CallbackQuery) -> None:
    '''Перенаправляет коллбэк на функцию обработки сообщения.'''
    merchandise(callback.message)


@bot.callback_query_handler(func=lambda callback: callback.data.isdigit())
def good_callback(callback: types.CallbackQuery) -> None:
    '''Отправка медиа группы с кешированием и сообщения, следующего после нее.'''
    good_id = int(callback.data)
    chat_id = callback.message.chat.id

    good = Good.objects.prefetch_related('images').get(pk=good_id)
    non_invoice_images = good.images.filter(is_invoice=False)

    if non_invoice_images.exists():

        bot.send_cached_media_group(chat_id=chat_id, queryset_of_images=non_invoice_images)

    bot.send_message(chat_id, text=good.description, parse_mode='HTML')
    send_good_invoice(callback.message, good)





