import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import NewsletterImage

@receiver(post_delete, sender=NewsletterImage)
def delete_physical_file(sender, instance, **kwargs):
    """Удаляет файл с диска, когда запись NewsletterImage удалена"""
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)