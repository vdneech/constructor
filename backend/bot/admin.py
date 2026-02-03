# admin.py
from django.contrib import admin
from django.db.models import Q
from .models import Configuration, RegistrationStep


@admin.register(Configuration)
class ConfigurationAdmin(admin.ModelAdmin):
    """Защищённая админка конфигурации"""

    fields = ('max_users',
    'price',
    'start_message',
    'merchant_message',
    'ceo_message',
    'already_registered_message',
    'end_of_registration',
    'closed_registrations_message',
    'invoice_image',
              )
    # НЕЛЬЗЯ добавлять новые
    def has_add_permission(self, request):
        return not Configuration.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    # НЕЛЬЗЯ удалять массово
    def delete_queryset(self, request, queryset):
        self.message_user(
            request,
            "Глобальная конфигурация не может быть удалена!",
            level='error'
        )

    # save_model НЕ вызывает model.save() напрямую
    def save_model(self, request, obj, form, change):
        # Сохраняем БЕЗ delete() в save()
        super().save_model(request, obj, form, change)  # Обновить кеш

    # ChangeList actions НЕ удаляют
    def delete_selected(self, request, queryset):
        self.message_user(request, "Удаление конфигурации запрещено!", level='error')

    # Только чтение для всех кроме суперюзера
    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_superuser:
            return [field.name for field in obj._meta.fields]
        return []




@admin.register(RegistrationStep)
class RegistrationStepAdmin(admin.ModelAdmin):
    list_display = ("order", "field_name", "field_type", "next_step")
    list_editable = ("next_step", )
    list_display_links = ("order", "field_name")
    ordering = ("order",)

    search_fields = ("field_name", "message_text", "error_message")
    list_filter = ("field_type", )

    # Чтобы выпадашка next_step не грузила все шаги сразу (удобно, когда шагов много)
    autocomplete_fields = ("next_step",)  # Django admin поддерживает autocomplete_fields [web:148]

    fieldsets = (
        (None, {
            "fields": ("order", "field_type", "field_name", "next_step")
        }),
        ("Тексты", {
            "fields": ("message_text", "error_message")
        }),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Ограничим выбор next_step:
        - не показываем самого себя
        - (опционально) показываем только активные шаги
        """
        if db_field.name == "next_step":
            obj_id = request.resolver_match.kwargs.get("object_id")
            qs = RegistrationStep.objects.all()

            if obj_id:
                qs = qs.exclude(pk=obj_id)


            kwargs["queryset"] = qs.order_by("order")

        return super().formfield_for_foreignkey(db_field, request, **kwargs)
