from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from goods.models import GoodImage

@receiver(pre_save, sender=GoodImage)
def goodimage_delete_old_file_on_change(sender, instance: GoodImage, **kwargs):
    if not instance.pk:
        return

    try:
        old = GoodImage.objects.get(pk=instance.pk)
    except GoodImage.DoesNotExist:
        return

    if old.image and instance.image and old.image.name != instance.image.name:
        old.image.delete(save=False)

@receiver(post_delete, sender=GoodImage)
def goodimage_delete_file_on_delete(sender, instance: GoodImage, **kwargs):
    if instance.image:
        instance.image.delete(save=False)