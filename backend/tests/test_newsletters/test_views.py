

import pytest
from django.urls import reverse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status


class TestNewsletterViews:

    @pytest.mark.django_db
    def test_send_now(self, api_client):
        url = reverse('api:newsletters-send-now')
        data = {
            'title': 'Test',
            'channel': 'telegram',
            'message': 'Test message',
        }
        response = api_client.post(url, data, format='json')


        assert response.status_code == status.HTTP_201_CREATED


    @pytest.mark.django_db
    def test_schedule_newsletter(self, api_client):
        url = reverse('api:newsletters-schedule')
        date_to_schedule = timezone.now() + timezone.timedelta(days=1)
        data = {
            'title': 'Test',
            'channel': 'telegram',
            'message': 'Test message',
            'scheduled_at': date_to_schedule,
        }
        response = api_client.post(url, data, format='json')
        response_data = response.json()

        response_dt = parse_datetime(response_data['newsletter']['scheduled_at'])
        response_dt = timezone.make_naive(response_dt, timezone.utc)
        expected_dt = timezone.make_naive(date_to_schedule, timezone.utc)

        assert response_dt == expected_dt
        assert response.status_code == status.HTTP_201_CREATED
