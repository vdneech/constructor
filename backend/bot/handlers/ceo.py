from telebot import types
from bot.telegram_bot import bot
from bot.models import Configuration


@bot.message_handler(commands=['ceo'])
def ceo_handler(message):
    config = Configuration.objects.get_config()

    bot.send_message(
        message.chat.id,
        text=config.ceo_message,
        parse_mode="HTML",
    )

@bot.callback_query_handler(func=lambda call: call.data in ['ceo', ])
def good_callback(call: types.CallbackQuery):
    ceo_handler(call.message)