import os
import logging


from django.db.models import QuerySet
from dotenv import load_dotenv, find_dotenv
from rest_framework.exceptions import APIException
from telebot import types, apihelper

from bot.handlers.invoices import send_good_invoice
from bot.models import Configuration
from bot.telegram_bot import bot
from goods.models import Good


load_dotenv(find_dotenv())

logger = logging.getLogger(__name__)



@bot.callback_query_handler(func=lambda call: call.data.split('_')[-1].isdigit())
def good_callback(callback: types.CallbackQuery):
    good_id = int(callback.data.split('_')[-1])
    chat_id = callback.message.chat.id

    good = Good.objects.prefetch_related('images').get(pk=good_id)
    non_invoice_images = good.images.filter(is_invoice=False)

    if non_invoice_images.exists():
        media_group = []
        files_to_close = []

        try:
            for image in non_invoice_images:
                if image.telegram_file_id:
                    media_group.append(types.InputMediaPhoto(media=image.telegram_file_id))
                else:
                    file_obj = open(image.image.path, 'rb')
                    files_to_close.append(file_obj)
                    media_group.append(types.InputMediaPhoto(media=file_obj))

            sent_messages = bot.send_media_group(chat_id, media_group, timeout=60)


            for i, image in enumerate(non_invoice_images):
                if not image.telegram_file_id and i < len(sent_messages):

                    new_file_id = sent_messages[i].image[-1].file_id
                    image.telegram_file_id = new_file_id
                    image.save(update_fields=['telegram_file_id'])

        except Exception as e:
            logger.error(f"Error sending media group for good {good_id}: {e}")
            bot.send_message(chat_id, "Не удалось загрузить фотографии")
        finally:
            for f in files_to_close:
                f.close()


    bot.send_message(chat_id, text=good.description, parse_mode='HTML')
    send_good_invoice(callback.message, good)

@bot.callback_query_handler(func=lambda call: call.data in ['merchandise', ])
def merchandise_callback(callback: types.CallbackQuery):
    '''Callback that call the merchandise function'''
    merchandise(callback.message)

@bot.message_handler(commands=['store', 'merchandise'])
def merchandise(message: types.Message):
    '''Message using InlineButtons for list all available goods'''

    config = Configuration.objects.get_config()
    store_keyboard = types.InlineKeyboardMarkup()
    goods = Good.objects.filter(available=True)
    for good in goods:
        store_keyboard.add(types.InlineKeyboardButton(
            text=good.title,
            callback_data=f'store_{good.id}',
        ))


    bot.send_message(chat_id=message.chat.id,
                     text=config.merchant_message,
                     reply_markup=store_keyboard,
                     parse_mode='HTML')



