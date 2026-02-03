import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { botConfigApi } from '../../services/api';
import {
  Button,
  Input,
  HTMLTextarea,
  PageHeader,
  NoticeModal,
  Spinner,
  ErrorPage // Внедрено
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

const getBaseServerUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
};

const SERVER_URL = getBaseServerUrl();

export default function BotConfig() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [config, setConfig] = useState({
    max_users: 100,
    price: 5000,
    invoice_label: '',
    invoice_title: '',
    invoice_description: '',
    invoice_image: null,
    start_message: '',
    merchant_message: '',
    end_of_registration: '',
    closed_registrations_message: '',
    already_registered_message: '',
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null); // Для ErrorPage
  const [saving, setSaving] = useState(false);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });

  const parseDateForInput = (val) => (val ? val.split('T')[0] : '');

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/?api\//, '/').replace(/\/+/g, '/');
    return `${SERVER_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await botConfigApi.get();
        const cleanedData = {};
        Object.keys(data).forEach(key => {
          const val = data[key];
          cleanedData[key] = typeof val === 'string' ? val.trim() : val;
        });

        setConfig({
          ...cleanedData,
          end_of_registration: parseDateForInput(data.end_of_registration)
        });

        if (data.invoice_image) {
          setPreview(getFullImageUrl(data.invoice_image));
        }
      } catch (err) {
        setLoadError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field) => (e) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    const value = e.target.type === 'number' ? 
      (e.target.value === '' ? '' : Number(e.target.value)) : 
      e.target.value;
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      'invoice_label', 'invoice_title', 'invoice_description', 
      'max_users', 'price', 'start_message', 
      'merchant_message', 'closed_registrations_message', 'already_registered_message'
    ];

    requiredFields.forEach(field => {
      if (!config[field] || (typeof config[field] === 'string' && !config[field].trim())) {
        newErrors[field] = 'Поле не может быть пустым';
      }
    });

    if (config.price && (config.price < 69 || config.price > 15000)) {
      newErrors.price = 'Цена должна быть от 69 до 15000 ₽';
    }
    if (config.max_users !== '' && config.max_users <= 0) {
      newErrors.max_users = 'Минимум 1 пользователь';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        setNotice({ open: true, type: 'error', text: 'Максимальный размер 500 КБ' });
        return;
      }
      setConfig(prev => ({ ...prev, invoice_image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDeletePhoto = (e) => {
    e.stopPropagation();
    setConfig(prev => ({ ...prev, invoice_image: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setNotice({ open: true, type: 'error', text: 'Проверьте правильность заполнения полей' });
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(config).forEach(key => {
        if (key === 'invoice_image') {
          if (config[key] instanceof File) formData.append(key, config[key]);
          else if (config[key] === '') formData.append(key, '');
        } else {
          formData.append(key, config[key] || '');
        }
      });
      const updatedData = await botConfigApi.partialUpdate(formData);
      setConfig(prev => ({
        ...prev,
        ...updatedData,
        end_of_registration: parseDateForInput(updatedData.end_of_registration)
      }));
      if (updatedData.invoice_image) setPreview(getFullImageUrl(updatedData.invoice_image));
      setNotice({ open: true, type: 'success', text: 'Конфигурация успешно сохранена' });
    } catch (err) {
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  const dynamicStyles = {
    card: {
      ...pageStyles.card,
      ...(isMobile && pageStyles.cardMobile),
    },
    invoiceSection: {
      ...pageStyles.contentSection,
      ...(isMobile && pageStyles.contentSectionMobile),
    },
    limitsSection: {
      ...pageStyles.section,
    },
    gridTwo: {
      ...pageStyles.fieldRow,
      ...(isMobile && pageStyles.fieldRowMobile),
    }
  };

  if (loadError) return <ErrorPage code="500"/>;
  if (loading) return <div style={styles.center}><Spinner size={40} /></div>;

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <PageHeader
          title="Настройки бота"
          subtitle="Конфигурация платежного чека, лимитов и системных сообщений"
          isMobile={isMobile}
          actions={
            <Button variant="primary" onClick={() => navigate('/bot/registration')} fullWidth>
              Шаги регистрации
            </Button>
          }
        />

        <div style={dynamicStyles.card}>
          <form onSubmit={handleSubmit}>
            
            <div style={dynamicStyles.invoiceSection}>
              <div>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Фото чека</h3>
                </div>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                <div style={styles.photoContainer}>
                  {preview ? (
                    <div onClick={() => fileInputRef.current.click()} style={styles.photoCard}>
                      <img src={preview} alt="Invoice" style={styles.img} />
                      <button type="button" onClick={handleDeletePhoto} style={styles.deleteBtn}>
                        <TrashIcon />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current.click()} 
                      style={{
                        ...styles.emptyPhotoCard,
                        transform: isPhotoHovered ? 'translateY(-4px)' : 'translateY(0px)',
                        boxShadow: isPhotoHovered ? shadows.sm : 'none'
                      }}
                      onMouseEnter={() => setIsPhotoHovered(true)}
                      onMouseLeave={() => setIsPhotoHovered(false)}
                    >
                      <div style={styles.emptyIconBox}>+</div>
                      <h3 style={styles.emptyTitle}></h3>
                    </div>
                  )}
                </div>
                <p style={styles.photoHint}>Рекомендуемое соотношение 4:5, до 500 КБ.</p>
              </div>

              <div style={styles.block}>
                <h3 style={styles.blockTitle}>Параметры чека</h3>
                <Input 
                  label="Название чека" required
                  value={config.invoice_label} 
                  onChange={handleChange('invoice_label')} 
                  error={errors.invoice_label}
                  placeholder="Регистрация"
                  hint="Отобразится в названии чека"
                />
                <Input 
                  label="Название позиции" required
                  value={config.invoice_title} 
                  onChange={handleChange('invoice_title')} 
                  error={errors.invoice_title}
                  placeholder="Регистрация на мероприятие"
                  hint="Заголовок товара в платежной системе"
                />
                <Input
                  label="Краткое описание" required
                  value={config.invoice_description}
                  onChange={handleChange('invoice_description')}
                  error={errors.invoice_description}
                  multiline rows={3}
                  placeholder="За что платит пользователь..."
                />
              </div>
            </div>

            <div style={styles.divider} />

            <div style={dynamicStyles.limitsSection}>
              <h3 style={styles.blockTitle}>Лимиты и сроки</h3>
              <Input 
                label="Максимальное количество пользователей" required
                type="number" 
                value={config.max_users} 
                onChange={handleChange('max_users')}
                error={errors.max_users}
                hint="Регистрация закроется автоматически при достижении лимита"
              />
              <Input 
                label="Стоимость участия, ₽" required
                type="number" 
                value={config.price} 
                onChange={handleChange('price')}
                error={errors.price}
                hint="Диапазон: 69 — 15 000 ₽"
              />
              <Input 
                label="Дата окончания регистрации" 
                type="date" 
                value={config.end_of_registration} 
                onChange={handleChange('end_of_registration')}
                hint="После этой даты бот перестанет принимать новые заявки"
              />
            </div>

            <div style={styles.divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              <HTMLTextarea 
                label="Приветственное сообщение" required
                value={config.start_message} 
                onChange={handleChange('start_message')} 
                error={errors.start_message}
                rows={4} 
                hint="Отправляется при команде /start"
              />

              <HTMLTextarea 
                label="Сообщение выбора мерча" required
                value={config.merchant_message} 
                onChange={handleChange('merchant_message')} 
                error={errors.merchant_message}
                rows={4}
                hint="Отправляется при нажатии на Мерч, а также по команде /store"
              />

              <div style={dynamicStyles.gridTwo}>
                <HTMLTextarea 
                  label="Если регистрации закрыты" required
                  value={config.closed_registrations_message} 
                  onChange={handleChange('closed_registrations_message')} 
                  error={errors.closed_registrations_message}
                  rows={3}
                  hint="Отправляется, если регистрации завершены либо не настроены шаги"
                />
                <HTMLTextarea 
                  label="Если уже зарегистрирован" required
                  value={config.already_registered_message} 
                  onChange={handleChange('already_registered_message')} 
                  error={errors.already_registered_message}
                  rows={3} 
                  hint="Отправляется, если пользователь уже зарегистрирован"
                />
              </div>
            </div>

            <div style={{ marginTop: spacing.xl }}>
              <Button variant="primary" type="submit" loading={saving} fullWidth>
                Сохранить все настройки
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
  center: { display: 'flex', justifyContent: 'center', padding: '100px' },
  sectionHeader: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: colors.gray500, marginRight: spacing.xs },
  photoHint: { fontSize: 12, color: colors.gray400, lineHeight: 1.4, marginBottom: '16px', fontWeight: 500, marginTop: spacing.xs},
  divider: { height: 1, background: colors.gray100, margin: '32px 0' },
  photoContainer: { width: '100%' },
  photoCard: { 
    background: colors.white, 
    position: 'relative', 
    aspectRatio: '4/5', 
    borderRadius: borderRadius.large, 
    overflow: 'hidden', 
    border: `1px solid ${colors.gray200}`,
    cursor: 'pointer'
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  deleteBtn: { 
    position: 'absolute', top: 10, right: 10, background: colors.primary, 
    border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', 
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: shadows.md
  },
  emptyPhotoCard: { 
    width: '100%', aspectRatio: '4/5', border: `2px dashed ${colors.gray200}`, 
    borderRadius: borderRadius.large, display: 'flex', flexDirection: 'column', 
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
    background: 'rgb(250, 250, 250)', transition: '0.2s ease',
  },
  emptyIconBox: {
    width: 48, height: 48, marginBottom: '12px', borderRadius: '12px', background: colors.white,
    border: `2px dashed ${colors.gray200}`, display: 'flex', alignItems: 'center', 
    justifyContent: 'center', fontSize: 24, color: colors.gray400,
  },
  emptyTitle: { fontSize: 14, fontWeight: 700, color: colors.primary, margin: 0 },
  block: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  blockTitle: { 
    fontSize: 14, fontWeight: 700, color: colors.gray800, marginBottom: spacing.xs,
    textTransform: 'uppercase', letterSpacing: '0.5px'
  },
};