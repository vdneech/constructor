from bot.models import Configuration
from bot.bot import bot
from telebot import types

_DATA = [
    'ceo',
    'format',
]

def _get_text_for_command(command: str) -> str:
    '''Возвращает текст из базы, соответсвующий конкретной команде.'''

    config = Configuration.objects.get_config()
    field_name = command + '_message'
    message = getattr(config, field_name)
    return message


@bot.message_handler(commands=_DATA)
def command_handler(
    message: types.Message = None,
    callback: types.CallbackQuery = None
) -> None:
    '''Обрабатывает входящую команду/коллбэк и отправляет пользователю сообщение из базы.'''

    if message:
        command = message.text[1:] if message.text.startswith('/') else message.text
    elif callback:
        command = callback.data
        message = callback.message


    text = _get_text_for_command(command)

    bot.send_message(
        message.chat.id,
        text=text,
        parse_mode="HTML",
    )

@bot.callback_query_handler(func=lambda callback: callback.data in _DATA)
def callback_handler(callback: types.CallbackQuery) -> None:
    '''Перенаправляет коллбэк на обработчик команды.'''
    command_handler(callback=callback)


