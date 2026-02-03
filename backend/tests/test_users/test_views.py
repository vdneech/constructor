import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestUsersViews:

    def test_clean_registrations(self, authenticated_client, bot_user, bot_user_paid):
        url = reverse('users-clean-registrations')
        response = authenticated_client.post(url)

        bot_user.refresh_from_db()
        bot_user_paid.refresh_from_db()

        assert response.status_code == 204
        assert bot_user.is_registered == False
        assert bot_user_paid.is_registered == False

    def test_clean_payments(self, authenticated_client, bot_user_paid):
        url = reverse('users-clean-payments')
        response = authenticated_client.post(url)

        bot_user_paid.refresh_from_db()

        assert response.status_code == 204

        assert bot_user_paid.paid == False


