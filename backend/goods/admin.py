from django.contrib import admin

from goods.models import Good

from goods.models import GoodImage



@admin.register(Good)
class GoodAdmin(admin.ModelAdmin):
    """Админка для товаров"""

    list_display = ["title", "price", "available", ]

    list_filter = ["available",]

    search_fields = ["title", "label"]


    fieldsets = (
        ("Основная информация", {
            "fields": ("title", "description")
        }),
        ("Платёж", {
            "fields": ("label", "price")
        }),
        ("Статус", {
            "fields": ("available",)
        }),
    )




@admin.register(GoodImage)
class GoodImageAdmin(admin.ModelAdmin):
    """Админка для товаров"""

    list_display = ["good", "image"]


