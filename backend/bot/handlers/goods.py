import os
import logging
from typing import List
from django.db.models import QuerySet
from dotenv import load_dotenv, find_dotenv
from telebot import types

from bot.handlers.invoices import send_good_invoice
from bot.models import Configuration
from bot.telegram_bot import bot
from goods.models import Good

load_dotenv(find_dotenv())

logger = logging.getLogger(__name__)


@bot.message_handler(commands=['store', 'merchandise'])
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


@bot.callback_query_handler(func=lambda call: call.data in ['merchandise', ])
def merchandise_callback(callback: types.CallbackQuery) -> None:
    '''Перенаправляет коллбэк на функцию обработки сообщения.'''
    merchandise(callback.message)


@bot.callback_query_handler(func=lambda callback: callback.data.isdigit())
def good_callback(callback: types.CallbackQuery) -> None:
    good_id = int(callback.data)
    chat_id = callback.message.chat.id

    good = Good.objects.prefetch_related('images').get(pk=good_id)
    non_invoice_images = good.images.filter(is_invoice=False)

    if non_invoice_images.exists():

        media, files = _prepare_media_group(non_invoice_images, use_cache=True)

        try:
            try:
                sent_msgs = bot.send_media_group(chat_id, media)
                if files:
                    _group_images_and_files_ids(non_invoice_images, sent_msgs)

            except Exception as e:
                logger.warning(f"Cache send failed, retrying with files: {e}")

                for f in files: f.close()

                media, files = _prepare_media_group(non_invoice_images, use_cache=False)
                sent_msgs = bot.send_media_group(chat_id, media)

                _group_images_and_files_ids(non_invoice_images, sent_msgs)
        finally:
            for f in files: f.close()

    bot.send_message(chat_id, text=good.description, parse_mode='HTML')
    send_good_invoice(callback.message, good)


def _group_images_and_files_ids(
        sent_images: QuerySet,
        media_group: List[types.Message]
) -> None:
    """Привязывает file_id из ответа Telegram к объектам в базе."""

    for index, photo in enumerate(sent_images):
        tg_id = media_group[index].photo[-1].file_id

        photo.telegram_file_id = tg_id
        photo.save(update_fields=['telegram_file_id'])


def _prepare_media_group(images: QuerySet, use_cache: bool = True) -> list:
    """Вспомогательная функция для сборки списка InputMediaPhoto."""
    media_group = []
    opened_files = []

    for img in images:

        if use_cache and img.telegram_file_id:
            media_group.append(types.InputMediaPhoto(media=img.telegram_file_id))
        else:
            f = open(img.image.path, 'rb')
            opened_files.append(f)
            media_group.append(types.InputMediaPhoto(media=f))

    return media_group, opened_files




