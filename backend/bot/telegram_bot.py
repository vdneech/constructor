import logging

import requests
import telebot
import os
from dotenv import load_dotenv, find_dotenv
from telebot import apihelper


load_dotenv(find_dotenv())

BOT_TOKEN = os.getenv('BOT_TOKEN')

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN is empty")

bot = telebot.TeleBot(BOT_TOKEN)

logger = logging.getLogger(__name__)

from bot.handlers import registration, invoices, start, goods, ceo, format


def run_bot():
    """Запустить бота"""
    try:
        logger.info('Bot is succesfully launched!')
        bot.infinity_polling(20)
    except KeyboardInterrupt:
        logger.info('Bot stopped by user')
    except apihelper.ApiTelegramException as e:
        logger.error(f'Telegram API error: {e}')
    except requests.exceptions.ConnectTimeout as e:
        logger.warning(f'Network error, connection timed out: {e}')
    except Exception as e:
        logger.warning(f'Unexpected error: {e}')
    finally:
        logger.info('Bot complete')


if __name__ == '__main__':
    run_bot()