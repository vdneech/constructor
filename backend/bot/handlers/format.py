from telebot import types
from bot.telegram_bot import bot
from bot.models import Configuration


@bot.message_handler(commands=['format'])
def format_handler(message):
    config = Configuration.objects.get_config()

    bot.send_message(
        message.chat.id,
        text=config.format_message,
        parse_mode="HTML",
    )

@bot.callback_query_handler(func=lambda call: call.data in ['format', ])
def format_callback(call: types.CallbackQuery):
    format_handler(call.message)