import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from goods.models import Good, GoodImage
from users.models import User
from newsletters.models import Newsletter


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def bot_user(db):
    return User.objects.create_user(
        username='testuser1',
        email='testuser@example.com',
        password='testpass512',
        first_name='testuser',
        last_name='testuser',
        telegram_chat_id=123456789,
        is_registered=True,

    )

@pytest.fixture
def bot_user_paid(db):
    '''Create test user who paid'''
    return User.objects.create_user(
        email='testuser2@example.com',
        username='testuser2',
        password='testpass512',
        first_name='User',
        last_name='Paid',
        telegram_chat_id=123456788,
        is_registered=True,
        paid=True,
    )

# @pytest.fixture
# def good_unavailable(db):
#     '''Create good'''
#     return Good.objects.create(
#         good_name='test_good_name',
#         available=False,
#         label='cap',
#         price=1000,
#         description='test description',
#     )


# @pytest.fixture
# def good_available(db):
#     return Good.objects.create(
#         good_name='test_good_name',
#         label='cap',
#         price=1000,
#         description='test description',
#     )
#
#
# @pytest.fixture
# def good_available_photo(db, good_available, tmp_path):  # pytest tmp_path!
#     from PIL import Image
#     import io
#     image = Image.new('RGB', (100, 100), color='red')
#     image_buffer = io.BytesIO()
#     image.save(image_buffer, 'JPEG', quality=95)
#     image_buffer.seek(0)
#
#
#     image_file = SimpleUploadedFile(
#         name='test.jpg',
#         content=image_buffer.getvalue(),
#         content_type='image/jpeg',
#     )
#
#     photo = GoodImage.objects.create(
#         good=good_available,
#         photo=image_file,
#         is_invoice=False
#     )
#
#     photo.media_path = photo.photo.path
#     return photo

@pytest.fixture
def authenticated_client(admin_user):

    from rest_framework_simplejwt.tokens import RefreshToken

    api_client = APIClient()

    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(
        HTTP_AUTHORIZATION='Bearer ' + str(refresh.access_token)
    )
    return api_client

