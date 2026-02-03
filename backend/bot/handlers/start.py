from datetime import datetime

import pytz
from telebot import types

from bot.models import Configuration
from bot.telegram_bot import bot
from users.models import User




@bot.message_handler(commands=['start'])
def start_handler(message, interrupt: bool = False):

    config = Configuration.objects.get_config()

    keyboard = types.InlineKeyboardMarkup()

    register_button = types.InlineKeyboardButton(
        text="Регистрация",
        callback_data="register",
    )
    format_button = types.InlineKeyboardButton(
        text="Формат мероприятия",
        callback_data="format",
    )
    ceo_button = types.InlineKeyboardButton(
        text="Сотрудничество",
        callback_data="ceo",
    )
    store_button = types.InlineKeyboardButton(
        text="Мерч",
        callback_data="merchandise",
    )

    keyboard.row(register_button, format_button)
    keyboard.row(ceo_button)
    keyboard.row(store_button)


    bot.send_message(
        message.chat.id,
        text=config.start_message,
        parse_mode="HTML",
        reply_markup=keyboard,
    )
