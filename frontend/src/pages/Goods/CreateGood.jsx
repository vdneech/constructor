// src/pages/CreateGood.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { goodsApi } from '../../services/api';
import {
  Button,
  Input,
  Checkbox,
  HTMLTextarea,
  NoticeModal,
  Spinner,
  PageHeader,
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

export default function CreateGood() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    label: '',
    price: '',
    description: '',
    quantity: 0,
    available: true
  });

  // Храним локальные превью файлов
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });
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

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      setNotice({ open: true, type: 'error', text: 'Максимум 3 фотографии.' });
      return;
    }

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      // Если это первое загружаемое фото в массиве, помечаем как инвойс
      is_invoice: images.length === 0 && index === 0
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleSetInvoice = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_invoice: i === index
    })));
  };

  const handleDeleteImage = (e, index) => {
    e.stopPropagation();
    setImages(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      // Если удалили главное фото, назначаем первое оставшееся главным
      if (filtered.length > 0 && !filtered.some(img => img.is_invoice)) {
        filtered[0].is_invoice = true;
      }
      return filtered;
    });
  };

  const handleCreate = async () => {
    setSaving(true);
    setErrors({});
    try {
      // 1. Создаем товар
      const createdGood = await goodsApi.create({
        ...form,
        price: parseFloat(form.price) || 0,
        quantity: parseInt(form.quantity) || 0
      });

      // 2. Загружаем фото по одному (как в Detail)
      if (images.length > 0) {
        for (const imgObj of images) {
          const formData = new FormData();
          formData.append('image', imgObj.file);
          formData.append('is_invoice', imgObj.is_invoice);
          await goodsApi.uploadPhoto(createdGood.id, formData);
        }
      }

      setNotice({ open: true, type: 'success', text: 'Товар успешно создан' });
      setTimeout(() => navigate('/goods'), 1000);
    } catch (e) {
      if (e.response?.data) setErrors(e.response.data);
      setNotice({ open: true, type: 'error', text: parseApiError(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <button onClick={() => navigate('/goods')} style={styles.backBtn}>
          ← Назад к списку
        </button>

        <PageHeader
          title="Новый товар"
          subtitle="Создание товара. Фото с меткой будет отображаться в Telegram чеке."
          isMobile={isMobile}
        />

        <div style={dynamicStyles.card}>
          <div style={dynamicStyles.topFields}>
            <Input
              label="Название чека"
              required
              value={form.title}
              error={errors.title?.[0]}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="make dentistry great again"
              hint="Это название будет на чеке, до 32 символов"
            />

            <Input
              label="Название позиции"
              required
              value={form.label}
              error={errors.label?.[0]}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Кепка"
              hint="Небольшое описание товара, будет отображаться в чеке и под названием товара, до 100 символов"
            />
          </div>

          <HTMLTextarea
            label="Описание"
            required
            value={form.description}
            error={errors.description?.[0]}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Описание товара"
            hint="Будет отправлено в сообщении перед выдачей чека"
          />

          <div style={styles.divider} />

          <div style={{ marginBottom: spacing.xl }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Фотографии</h3>
              <span style={styles.photoCount}>{images.length} из 3</span>
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
              {images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => handleSetInvoice(index)}
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
                    onClick={(e) => handleDeleteImage(e, index)}
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
                  <p style={styles.emptySubtext}>До 3-х изображений, до 500Кб</p>
                </div>
              )}

              {images.length > 0 && images.length < 3 && (
                <div
                  onClick={() => !saving && fileInputRef.current.click()}
                  style={styles.smallUploadCard}
                >
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill={colors.gray300}
                         className="bi bi-upload" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                      <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
                    </svg>
                  </span>
                </div>
              )}
            </div>

            <p style={styles.photoHint}>
              Кликните на фото, чтобы отметить его как главное. Главное фото отображается в чеке.
            </p>
          </div>

          <div style={styles.divider}/>

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
              hint={"Это поле влияет на оплату. Если товар закончился, то пользователь сможет его посмотреть, но купить не получится."}
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
            <Button variant="primary" onClick={handleCreate} loading={saving} fullWidth>
              Создать товар
            </Button>
          </div>
        </div>

        <NoticeModal
          open={notice.open}
          type={notice.type}
          text={notice.text}
          onClose={() => setNotice({ ...notice, open: false })}
        />
      </div>
    </div>
  );
}

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const styles = {
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
    fontSize: '14px',
    fontWeight: 600,
    color: colors.gray500,
    margin: 0,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: '13px',
    color: colors.gray400,
    fontWeight: 500,
    lineHeight: 1.5,
    textAlign: 'center',
    maxWidth: '300px',
  },
  smallUploadCard: {
    aspectRatio: '1/1',
    border: `2px dashed ${colors.gray200}`,
    borderRadius: borderRadius.large,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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