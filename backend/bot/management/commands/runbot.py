import os
import django
from django.core.management.base import BaseCommand
import logging

from ...models import Configuration

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from ...bot import run_bot

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Запустить Telegram бота'

    def handle(self, *args, **options):
        logger.info('Bot starting...')
        try:
            logger.info('Configuration created')
            run_bot()
        except Exception as e:
            logger.error(e)



