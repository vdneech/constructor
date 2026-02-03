import os

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse


def temporary_media_image():
    from PIL import Image
    import io
    image = Image.new('RGB', (100, 100), color='red')
    image_buffer = io.BytesIO()
    image.save(image_buffer, 'JPEG', quality=95)
    image_buffer.seek(0)

    image_file = SimpleUploadedFile(
        name='test.jpg',
        content=image_buffer.getvalue(),
        content_type='image/jpeg',
    )

    return image_file




@pytest.mark.django_db
class TestGoodsViews:

    def test_get_goods_list(self, authenticated_client):
        url = reverse('goods-list')
        response = authenticated_client.get(url)

        assert response.status_code == 200

    def test_get_goods_detail(self, authenticated_client, good_available):
        url = reverse('goods-detail', args=[good_available.id])
        response = authenticated_client.get(url)
        assert response.status_code == 200

    def test_get_available_goods_list(self, authenticated_client, good_available):
        url = reverse('goods-available')
        response = authenticated_client.get(url)


        assert response.data['count'] == 1
        assert len(response.data['results']) == 1
        result = response.data['results'][0]
        assert result['id'] == good_available.id
        assert result['label'] == good_available.label
        assert response.status_code == 200

    def test_upload_photo(self, authenticated_client, good_available):
        url = reverse('goods-upload-photo', args=[good_available.id])

        data = {
            'photo': temporary_media_image(),
            'is_invoice': True
        }
        response = authenticated_client.post(url, data=data, format='multipart')

        created_photo = good_available.photos.first()

        assert os.path.exists(created_photo.photo.path), 'Файла не существует'
        assert response.status_code == 201
        created_photo.photo.delete()




@pytest.mark.django_db
class TestGoodPhotoViews:

    def test_mark_photo_as_invoice(
            self,
            authenticated_client,
            good_available,
            good_available_photo
    ):
        url = reverse(
            'good-photos-set-invoice',
            args=[good_available.id]
        )

        data = {
            'is_invoice': True
        }

        response = authenticated_client.patch(
            url,
            data=data,
            format='json'
        )

        assert response.status_code == 200

    def test_delete_photo(
            self,
            authenticated_client,
            good_available_photo
    ):
        assert os.path.exists(good_available_photo.photo.path), 'Файла не существует'
        url = reverse('good-photos-detail', args=[good_available_photo.id])

        response = authenticated_client.delete(url)


        assert response.status_code == 204
        assert not os.path.exists(good_available_photo.photo.path), 'Файл не удалился'