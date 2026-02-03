import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { newslettersApi } from '../../services/api';
import { 
  Button, 
  Input, 
  Checkbox, 
  HTMLTextarea,
  Select,
  PageHeader,
  NoticeModal,
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils'; // Удален buildFormData
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

const MAX_IMAGES = 2;

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'both', label: 'Email и Telegram' },
];

export default function CreateNewsletter() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    channel: 'both',
    only_paid: false,
    scheduled_at: '',
  });

  const [images, setImages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGES) {
      setNotice({ open: true, type: 'error', text: `Максимум ${MAX_IMAGES} изображения.` });
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // 1. Создаем рассылку (JSON запрос)
      // Бэкенд сам решит: sending (countdown 5) или scheduled (eta)
      const newsletterData = {
        ...form,
        scheduled_at: form.scheduled_at || null
      };
      
      const createdNewsletter = await newslettersApi.create(newsletterData);
      const newsletterId = createdNewsletter.id;

      // 2. Поочередно загружаем фото, если они есть
      if (images.length > 0) {
        for (const img of images) {
          const imgFormData = new FormData();
          imgFormData.append('image', img.file);
          await newslettersApi.uploadImage(newsletterId, imgFormData);
        }
      }

      // 3. Выводим успех
      const isScheduled = form.scheduled_at && form.scheduled_at.trim() !== '';
      setNotice({ 
        open: true, 
        type: 'success', 
        text: isScheduled ? 'Рассылка успешно запланирована!' : 'Рассылка отправлена в очередь!' 
      });

      setTimeout(() => navigate('/newsletters'), 1500);
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data);
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <PageHeader
          title="Отправить рассылку"
          subtitle="Рассылка отправляется всем пользователям через выбранные каналы связи."
          isMobile={isMobile}
        />

        <div style={dynamicStyles.card}>
          <form onSubmit={handleSubmit}>
            <div style={dynamicStyles.topFields}>
              <Input
                label="Заголовок"
                required
                value={form.title}
                error={errors.title?.[0]}
                onChange={handleChange('title')}
                placeholder="Заголовок рассылки"
                hint="Используется как тема письма и заголовок сообщения"
              />
              <Select
                label="Канал отправки"
                required
                value={form.channel}
                error={errors.channel?.[0]}
                onChange={handleChange('channel')}
                options={CHANNEL_OPTIONS}
              />
            </div>

            <HTMLTextarea
              label="Текст сообщения"
              required
              value={form.message}
              error={errors.message?.[0]}
              onChange={handleChange('message')}
              placeholder="Введите текст сообщения..."
              rows={10}
              hint="Эти сообщения HTML-форматируемые и поддерживают стандартные теги."
            />

            <div style={styles.divider} />

            <div style={{ marginBottom: spacing.xl }}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Изображения</h3>
                <span style={styles.photoCount}>{images.length} из {MAX_IMAGES}</span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
              />
              
              <div style={dynamicStyles.photoGrid}>
                {images.map((img, idx) => (
                  <div key={idx} style={styles.photoCard}>
                    <img src={img.preview} alt="" style={styles.img} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)} 
                      style={styles.deleteBtn}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                
                {images.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current.click()} 
                    style={{
                      ...styles.emptyPhotoCard,
                      transform: isPhotoHovered ? 'translateY(-4px)' : 'translateY(0px)',
                      boxShadow: isPhotoHovered ? shadows.md : 'none'
                    }}
                    onMouseEnter={() => setIsPhotoHovered(true)}
                    onMouseLeave={() => setIsPhotoHovered(false)}
                  >
                    <div style={styles.emptyIconBox}>+</div>
                    <h3 style={styles.emptyTitle}>Добавить фото</h3>
                    <p style={styles.emptySubtext}>Изображения для рассылки</p>
                  </div>
                ) : images.length < MAX_IMAGES ? (
                  <div onClick={() => fileInputRef.current.click()} style={styles.smallUploadCard}>
                    <span style={{ fontSize: 24, color: colors.gray400 }}>+</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div style={styles.divider} />

            <div style={dynamicStyles.topFields}>
              <Input
                label="Запланировать отправку"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={handleChange('scheduled_at')}
                hint="Оставьте пустым для мгновенной отправки"
              />
              <div style={{ alignSelf: 'center', paddingTop: isMobile ? 0 : spacing.sm }}>
                <Checkbox
                  checked={form.only_paid}
                  onChange={() => setForm((prev) => ({ ...prev, only_paid: !prev.only_paid }))}
                  title="Только платящим"
                  description="Рассылка для тех, кто завершил оплату"
                />
              </div>
            </div>

            <div style={{ marginTop: spacing.xl }}>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
                fullWidth
                disabled={!form.title || !form.message}
              >
                {form.scheduled_at ? 'Запланировать рассылку' : 'Отправить рассылку сейчас'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <NoticeModal 
        open={notice.open} 
        type={notice.type} 
        text={notice.text} 
        onClose={() => setNotice({ ...notice, open: false })} 
      />
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
  divider: { height: 1, background: colors.gray100, margin: '32px 0' },
  sectionHeader: { display: 'flex', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: colors.gray500, marginRight: spacing.xs },
  photoCount: { fontSize: 12, fontWeight: 600, color: colors.gray400, background: colors.gray100, padding: '2px 8px', borderRadius: 8 },
  
  photoCard: { background: colors.white, position: 'relative', aspectRatio: '1/1', borderRadius: borderRadius.large, overflow: 'hidden', border: `1px solid ${colors.gray200}` },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, background: colors.primary, border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: shadows.sm },

  emptyPhotoCard: { 
    gridColumn: '1 / -1', 
    minHeight: 300, 
    border: `2px dashed ${colors.gray200}`, 
    borderRadius: borderRadius.large, 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    background: 'rgb(250, 250, 250)',
    transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  emptyIconBox: {
    width: 60, height: 60, marginBottom: '12px', borderRadius: '15px', background: colors.white,
    border: `2px dashed ${colors.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 30, fontWeight: 300, color: colors.gray400,
  },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: colors.primary, margin: 0 },
  emptySubtext: { fontSize: 12, color: colors.gray500, marginTop: 4, fontWeight: 500 },
  
  smallUploadCard: { aspectRatio: '1/1', border: `2px dashed ${colors.gray200}`, borderRadius: borderRadius.large, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: colors.gray50 },
};