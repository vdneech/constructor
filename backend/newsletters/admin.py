from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from newsletters.models import Newsletter, NewsletterTask, NewsletterImage



class NewsletterTaskInline(admin.TabularInline):
    """Inline админка для задач рассылок"""

    model = NewsletterTask
    extra = 0
    readonly_fields = ['user', 'status', 'channel_sent', 'error_message', 'created_at', 'sent_at']
    fields = ['user', 'status', 'channel_sent', 'error_message']
    can_delete = False



class NewsletterImageInline(admin.TabularInline):
    model = NewsletterImage
    fields = ("image", "image_preview")
    readonly_fields = ("image_preview",)
    extra = 1

    def image_preview(self, obj):
        if not obj or not getattr(obj, "image", None):
            return "—"
        try:
            return format_html(
                '<img src="{}" style="height:60px; width:auto; border-radius:6px; object-fit:cover;" />',
                obj.image.url,
            )
        except Exception:
            return "—"

    image_preview.short_description = "Превью"


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    """Админка для рассылок"""

    list_display = (
        "title",
        "status",
        "channel",
        # "sent_count",
        # "total_recipients",
        # "success_rate",
        # "images_count",
        "created_at",
    )
    list_filter = ("status", "channel", "created_at", "only_paid")
    search_fields = ("title", "message")

    readonly_fields = (
        # "total_recipients",
        # "success_rate",
        "created_at",
        "sent_at",
        # "sent_count",
        # "failed_count",
    )

    fieldsets = (
        ("Основная информация", {"fields": ("title", "message", "channel")}),
        ("Фильтры получателей", {"fields": ("only_paid",)}),
        ("Планирование", {"fields": ("status", "scheduled_at")}),
        (
            "Время",
            {"fields": ("created_at", "sent_at"), "classes": ("collapse",)},
        ),
        # ⚠️ Блок "Изображения" как fieldset НЕ нужен:
        # картинки будут редактироваться в инлайне ниже [web:28].
    )

    inlines = (NewsletterImageInline, NewsletterTaskInline)

    actions = ("mark_as_sent",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Чтобы images_count не делал .count() отдельным запросом на каждую строку (N+1) [web:37]
        return qs.annotate(_images_count=Count("images", distinct=True))

    def images_count(self, obj):
        return getattr(obj, "_images_count", 0)

    images_count.short_description = "Картинок"
    images_count.admin_order_field = "_images_count"

    def mark_as_sent(self, request, queryset):
        queryset.update(status="sent")

    mark_as_sent.short_description = "Отметить как отправленные"


# ==================== ЗАДАЧИ РАССЫЛОК ====================

@admin.register(NewsletterTask)
class NewsletterTaskAdmin(admin.ModelAdmin):
    """Админка для задач рассылок"""

    list_display = [
        'newsletter', 'user', 'status', 'channel_sent',
        'created_at', 'sent_at'
    ]

    list_filter = ['status', 'channel_sent', 'created_at']

    search_fields = ['user__username', 'user__email', 'newsletter__title']

    readonly_fields = [
        'newsletter', 'user', 'created_at', 'sent_at'
    ]

    fieldsets = (
        ('Информация', {
            'fields': ('newsletter', 'user', 'status', 'channel_sent')
        }),
        ('Ошибка (если есть)', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Время', {
            'fields': ('created_at', 'sent_at'),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        return False




