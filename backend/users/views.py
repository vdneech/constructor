import logging
import csv

from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse

from bot.models import RegistrationStep
from users.models import User
from users.serializers import UserSerializer

logger = logging.getLogger('gfs')


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для управления пользователями"""

    serializer_class = UserSerializer

    def get_queryset(self):
        """Базовый queryset с сортировкой по активности"""
        return User.objects.order_by('-is_registered', '-paid', 'is_superuser')


    @action(detail=False, methods=['post'], url_path='clean-registrations')
    @transaction.atomic
    def clean_registrations(self, request):
        '''Атомарный сброс всех регистраций'''
        queryset = self.get_queryset()

        count = queryset.update(
            is_registered=False,
            registration_step=None,
            paid=False,
            paid_at=None
        )

        logger.warning(
            "Registrations cleaned by admin",
            extra={
                "action": "CLEAN_REGISTRATIONS",
                "user_id": request.user.id,
                "count": count,
                "status": "SUCCESS"
            }
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=False, methods=['post'], url_path='clean-payments')
    @transaction.atomic
    def clean_payments(self, request):
        """Атомарный сброс всех оплат"""

        queryset = self.get_queryset()
        count = queryset.update(
            paid=False,
            paid_at=None)

        logger.warning(
            "Payments cleaned by admin",
            extra={
                "action": "CLEAN_PAYMENTS",
                "user_id": request.user.id,
                "count": count,
                "status": "SUCCESS"
            }
        )
        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['get'], url_path='csv')
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users.csv"'
        response.write('\ufeff')
        writer = csv.writer(response, delimiter=';')


        steps = RegistrationStep.objects.filter(field_type='text').order_by('order')
        extras_keys = [step.field_name for step in steps]

        writer.writerow([
                'Telegram',
                'Email',
                'Оплата',
                'Дата оплаты',
                'Дата регистрации'
            ] + extras_keys
        )

        total_count = 0
        paid_count = 0

        for user in self.get_queryset().iterator():
            total_count += 1
            if user.paid: paid_count += 1

            row = [
                user.username,
                user.email,
                'Да' if user.paid else 'Нет',
                user.paid_at.strftime('%Y-%m-%d %H:%M') if user.paid and user.paid_at else '',
                user.created_at.strftime('%Y-%m-%d') if user.created_at else '',
            ]

            user_extras = user.extras or {}
            for key in extras_keys:
                row.append(user_extras.get(key, ''))

            writer.writerow(row)

        writer.writerow([])
        writer.writerow(['Всего пользователей', 'Оплативших'])
        writer.writerow([total_count, paid_count])

        logger.info(f"ACTION=EXPORT_CSV STATUS=SUCCESS USER_ID={request.user.id} COUNT={total_count}")
        return response
