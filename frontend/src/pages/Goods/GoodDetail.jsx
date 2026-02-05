// src/pages/GoodDetail.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { goodsApi, imagesApi } from '../../services/api';
import {
  Button,
  Input,
  Checkbox,
  HTMLTextarea,
  NoticeModal,
  ConfirmModal,
  Spinner,
  PageHeader,
  ErrorPage
} from '../../components/common';


import PageLayout from '../../components/PageLayout';
import { useIsMobile, usePageData } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

export default function GoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = useRef(null);


  const fetchGood = useCallback(() => goodsApi.retrieve(id), [id]);
  const [good, setGood] = useState(null);
  const { data, loading, error, retry } = usePageData(fetchGood, [id]);

  useEffect(() => {
    if (data) {
      setGood(data);
      setForm({
        title: data.title || '',
        label: data.label || '',
        price: data.price ? String(data.price) : '',
        description: data.description || '',
        quantity: data.quantity || 0,
        available: data.available ?? true
      });
      setImages(data.images?.map(img => ({
        id: img.id, preview: img.image, is_invoice: img.is_invoice
      })) || []);
    }
  }, [data]);



  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', label: '', price: '', description: '', quantity: 0, available: true
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);

  const dynamicStyles = {
  card: {
      ...pageStyles.card,
      ...(isMobile && pageStyles.cardMobile),
    },
    topFields: {
      ...pageStyles.fieldRow,
      ...(isMobile && pageStyles.fieldRowMobile),
    },
    photoGrid: {
      ...pageStyles.photoGrid,
      ...(isMobile && pageStyles.photoGridMobile),
    }
  };





  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      setNotice({ open: true, type: 'error', text: 'Максимум 3 фотографии.' });
      return;
    }

    setSaving(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('is_invoice', images.length === 0);
        await goodsApi.uploadPhoto(id, formData);
      }

      const updatedData = await goodsApi.retrieve(id);
      setImages(updatedData.images?.map(img => ({
        id: img.id, preview: img.image, is_invoice: img.is_invoice
      })) || []);
    } catch (err) {
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleSetInvoice = async (photoId) => {
    const oldImages = [...images];
    setImages(prev => prev.map(img => ({ ...img, is_invoice: img.id === photoId })));
    try {
      await imagesApi.setAsInvoice(photoId);
    } catch (err) {
      setImages(oldImages);
      setNotice({ open: true, type: 'error', text: "Ошибка изменения главного фото" });
    }
  };

  const handleDeleteImage = async (e, photoId) => {
    e.stopPropagation();
    try {
      await imagesApi.remove(photoId);
      setImages(prev => prev.filter(img => img.id !== photoId));
    } catch (err) {
      setNotice({ open: true, type: 'error', text: "Не удалось удалить фото" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      await goodsApi.partialUpdate(id, {
        ...form,
        price: parseFloat(form.price) || 0,
        quantity: parseInt(form.quantity) || 0
      });
      setNotice({ open: true, type: 'success', text: 'Изменения сохранены' });
      setTimeout(() => navigate('/goods'), 1000);
    } catch (e) {
      if (e.response?.data) setErrors(e.response.data);
      setNotice({ open: true, type: 'error', text: parseApiError(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSaving(true);
    try {
      await goodsApi.remove(id);
      navigate('/goods');
    } catch (err) {
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };



  return (
    <PageLayout loading={loading} error={error} onRetry={retry}>
      <div style={pageStyles.page}>
        <div style={pageStyles.container}>
          <button onClick={() => navigate('/goods')} style={styles.backBtn}>
            ← Назад к списку
          </button>

          <PageHeader
            title={form.title || 'Товар'}
            subtitle="Редактирование товара. Фото с меткой будет отображаться в Telegram чеке."
            isMobile={isMobile}
          />

          <div style={dynamicStyles.card}>
            <div style={dynamicStyles.topFields}>
              <Input
                label="Название"
                required
                value={form.title}
                error={errors.title?.[0]}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Название товара"
                hint="Это название будет видно в Telegram чеке"
              />

              <Input
                label="Название позиции"
                required
                value={form.label}
                error={errors.label?.[0]}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Label"
                hint="Небольшое описание товара, будет отображаться в чеке"
              />
            </div>

            <HTMLTextarea
              label="Описание"
              required
              value={form.description}
              error={errors.description?.[0]}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание товара"
              hint="Будет отправлено в сообщении перед чеком"
            />

            <div style={styles.divider} />

            <div style={{ marginBottom: spacing.xl }}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Фотографии</h3>
                <span style={styles.photoCount}>{images.length} / 3</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />

              <div style={dynamicStyles.photoGrid}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => handleSetInvoice(img.id)}
                    style={{
                      ...styles.photoCard,
                      borderColor: img.is_invoice ? colors.primary : colors.gray200
                    }}
                  >
                    <img src={img.preview} alt="" style={styles.img} />
                    {img.is_invoice && (
                      <div style={styles.invoiceBadge}>ИНВОЙС</div>
                    )}
                    <button
                      onClick={(e) => handleDeleteImage(e, img.id)}
                      style={styles.deleteBtn}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}

                {images.length === 0 && (
                  <div
                    onClick={() => !saving && fileInputRef.current.click()}
                    style={{
                      ...styles.emptyPhotoCard,
                      transform: isPhotoHovered ? 'translateY(-4px)' : 'translateY(0px)',
                      boxShadow: isPhotoHovered ? 'rgba(0, 0, 0, 0.03) 0px 10px 40px' : 'none',
                    }}
                    onMouseEnter={() => setIsPhotoHovered(true)}
                    onMouseLeave={() => setIsPhotoHovered(false)}
                  >
                    <div style={styles.emptyIconBox}>
                      {saving ? <Spinner size={24} /> : '+'}
                    </div>
                    <h3 style={styles.emptyTitle}>Добавить фото</h3>
                    <p style={styles.emptySubtext}>3-х изображений максимум</p>
                  </div>
                )}

                {images.length > 0 && images.length < 3 && (
                  <div
                    onClick={() => !saving && fileInputRef.current.click()}
                    style={styles.smallUploadCard}
                  >
                    <span style={{ fontSize: 24, color: colors.gray400 }}>+</span>
                  </div>
                )}
              </div>

              <p style={styles.photoHint}>
                Кликните на фото, чтобы отметить его как главное. Главное фото отображается в чеке.
              </p>
            </div>

            <div style={styles.divider} />

            <div style={dynamicStyles.topFields}>
              <Input
                label="Цена, ₽"
                type="number"
                required
                hint="Минимум: 69.00, Максимум: 15000.00"
                value={form.price}
                error={errors.price?.[0]}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              <Input
                label="Количество"
                type="number"
                required
                hint="Доступные единицы товара"
                value={form.quantity}
                error={errors.quantity?.[0]}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            <Checkbox
              checked={form.available}
              onChange={() => setForm((prev) => ({ ...prev, available: !prev.available }))}
              title="Товар доступен для продажи"
              description="Неактивные товары не отображаются в боте"
            />

            <div style={styles.actions}>
              <Button variant="primary" onClick={handleSave} loading={saving} fullWidth>
                Сохранить изменения
              </Button>

              <Button variant="danger" onClick={() => setConfirmDelete(true)} fullWidth>
                Удалить товар
              </Button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <ConfirmModal
            open={confirmDelete}
            title="Удаление товара"
            message="Вы уверены, что хотите удалить этот товар?"
            description="Это действие нельзя будет отменить."
            confirmText="Удалить"
            cancelText="Отмена"
            loading={saving}
            onConfirm={handleDeleteConfirm}
            onClose={() => setConfirmDelete(false)}
          />

          {/* Notice Modal */}
          <NoticeModal
            open={notice.open}
            type={notice.type}
            text={notice.text}
            onClose={() => setNotice({ ...notice, open: false })}
          />
        </div>
      </div>
    </PageLayout>
  );
}

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const styles = {
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: colors.gray400,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '16px',
    fontSize: '14px',
    fontFamily: 'Montserrat',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: colors.gray500,
    marginRight: spacing.xs,
  },
  photoCount: {
    fontSize: '13px',
    fontWeight: 600,
    color: colors.gray400,
    background: colors.gray100,
    padding: '2px 8px',
    borderRadius: '10px',
  },
  photoHint: {
    fontSize: '13px',
    color: colors.gray400,
    lineHeight: 1.5,
    marginBottom: '16px',
    fontWeight: 500,
    marginTop: spacing.xs,
  },
  divider: {
    height: '1px',
    background: colors.gray100,
    margin: '32px 0',
  },
  emptyPhotoCard: {
    gridColumn: '1 / -1',
    minHeight: '300px',
    border: `2px dashed ${colors.gray200}`,
    borderRadius: borderRadius.large,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'rgb(250, 250, 250)',
    transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
  },
  emptyIconBox: {
    width: '80px',
    height: '80px',
    marginBottom: '20px',
    borderRadius: '20px',
    background: 'rgb(255, 255, 255)',
    border: '2px dashed rgb(229, 231, 235)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 300,
    color: 'rgb(156, 163, 175)',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.primary,
    margin: 0,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: '12px',
    color: colors.gray500,
    fontWeight: 500,
    lineHeight: 1.5,
    textAlign: 'center',
    maxWidth: '300px',
    marginTop: spacing.xs,
  },
  smallUploadCard: {
    aspectRatio: '1/1',
    border: `2px dashed ${colors.gray200}`,
    borderRadius: borderRadius.large,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: colors.gray50,
  },
  photoCard: {
    background: colors.white,
    position: 'relative',
    aspectRatio: '1/1',
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    border: '3px solid',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  invoiceBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: colors.primary,
    color: 'white',
    fontSize: '10px',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  deleteBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: colors.primary,
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: shadows.md,
  },
  actions: {
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
};
