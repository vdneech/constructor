from django.core.files.images import get_image_dimensions
from rest_framework import serializers

from bot.models import Configuration, RegistrationStep


class ConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        fields = '__all__'

    def validate_invoice_image(self, value):
        if value:
            # Получаем ширину и высоту
            width, height = get_image_dimensions(value)

            # Проверяем соотношение 4:5 (0.8)
            # Добавляем небольшую погрешность (0.01) на случай неточных пикселей
            expected_ratio = 4 / 5
            actual_ratio = width / height

            if abs(actual_ratio - expected_ratio) > 0.02:
                raise serializers.ValidationError(
                    f"Изображение должно иметь соотношение сторон 4:5 (сейчас {width}x{height})"
                )
        return value


class RegistrationStepSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(required=False, allow_blank=True, allow_null=True, )

    class Meta:
        model = RegistrationStep
        fields = [
            'id', 'order', 'message_text', 'field_type', 'field_name',
            'error_message',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        '''Валидация на текстовый тип: field_name обязателен для field_type'''
        field_type = attrs.get('field_type')
        field_name = attrs.get('field_name')

        if field_type == 'text' and not field_name:
            raise serializers.ValidationError({
                'Название поля': 'Это поле обязательно для выбранного типа'
            })

        if field_type != 'text':

            if not self.instance:
                exists = RegistrationStep.objects.filter(field_type=field_type).exists()
                if exists:
                    raise serializers.ValidationError({
                        'Тип поля': f'Шаг с таким типом уже существует. Можно создать только один шаг каждого типа, кроме текстовых.'
                    })

        return attrs


class RegistrationStepReorderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order = serializers.IntegerField(min_value=1)


class TelegramMessageSerializer(serializers.Serializer):
    text = serializers.CharField(
        max_length=4096,
        required=True,
        min_length=1,
    )

    def validate(self, data):
        if data['text'].isspace():
            raise serializers.ValidationError(
                'Text must not be blank'
            )
        return data