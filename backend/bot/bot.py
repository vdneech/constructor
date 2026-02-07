import logging

from django.db.models.query import QuerySet
from typing import List
from telebot import types

import telebot
import os
from dotenv import load_dotenv, find_dotenv
from telebot import apihelper



load_dotenv(find_dotenv())

BOT_TOKEN = os.getenv('BOT_TOKEN') or ''

class TeleBot(telebot.TeleBot):

    def _group_images_and_files_ids(
            self,
            sent_images: QuerySet,
            media_group: List[types.Message]
    ) -> None:
        """Привязывает file_id из ответа Telegram к объектам в базе."""

        for index, photo in enumerate(sent_images):
            tg_id = media_group[index].photo[-1].file_id

            photo.telegram_file_id = tg_id
            photo.save(update_fields=['telegram_file_id'])

    def _prepare_media_group(self, images: QuerySet, use_cache: bool = True) -> list:
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

    def send_cached_media_group(
            self,
            queryset_of_images: QuerySet,
            chat_id: int,
    ) -> List[types.Message]:
        '''Отправка media_group с использованием telegram_chat_id картинки'''

        media, files = self._prepare_media_group(queryset_of_images, use_cache=True)

        try:
            try:
                sent_msgs = self.send_media_group(chat_id, media, timeout=60)
                if files:
                    self._group_images_and_files_ids(queryset_of_images, sent_msgs)
                return sent_msgs
            except telebot.apihelper.ApiTelegramException:
                for f in files: f.close()

                media, files = self._prepare_media_group(queryset_of_images, use_cache=False)
                sent_msgs = self.send_media_group(chat_id, media, timeout=60)

                self._group_images_and_files_ids(queryset_of_images, sent_msgs)
                return sent_msgs
        finally:
            for f in files: f.close()


bot = TeleBot(BOT_TOKEN)

logger = logging.getLogger(__name__)



def run_bot() -> None:
    """Выполняет запуск бота из команды manage.py. """
    try:
        from bot import handlers
        logger.info('Bot is succesfully launched!')
        bot.infinity_polling(20)
    except Exception as e:
        logger.warning(f'Stopped with error: {e}')
    finally:
        logger.info('Bot complete')


if __name__ == '__main__':
    run_bot()