// src/components/common/NoticeModal.jsx
import React, { useEffect, useState } from 'react';
import { colors, spacing, typography } from '../../styles/theme';
import { useIsMobile } from '../../hooks/useIsMobile';
import Button from './Button';

/**
 * Модальное окно уведомления (стиль Login Page / OverlayModal)
 */
export default function NoticeModal({
  open,
  type = 'success',
  title,
  text,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000
}) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  // --- ЛОГИКА АНИМАЦИИ И СКРОЛЛА ---
  useEffect(() => {
    if (open) {
      setMounted(true);
      setTimeout(() => setShow(true), 10);

      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        setMounted(false);
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // --- ЛОГИКА АВТОЗАКРЫТИЯ ---
  useEffect(() => {
    if (!open || !autoClose) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, autoCloseDelay);
    return () => clearTimeout(timer);
  }, [open, autoClose, autoCloseDelay, onClose]);

  if (!mounted) return null;

  // --- КОНФИГУРАЦИЯ ИКОНОК И ЦВЕТОВ ---
  const typeConfig = {
    success: {
      defaultTitle: 'Успешно',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill={colors.accent} viewBox="0 0 16 16" style={{ width: 60}}>
          <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
          <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"/>
        </svg>
      )
    },
    error: {
      defaultTitle: 'Ошибка',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill={colors.accent} viewBox="0 0 16 16" style={{ width: 60 }}>
            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M6 6.75v8.5a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v2.75a.75.75 0 0 0 1.5 0v-2.5a.25.25 0 0 1 .5 0"/>
        </svg>
      )
    },
    // Fallback для warning/info используем как Error, но желтый/синий, либо просто дефолт
    warning: {
      color: colors.warning || '#F59E0B',
      defaultTitle: 'Внимание',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" style={{ width: '100%', height: '100%' }}>
            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M6 6.75v8.5a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v2.75a.75.75 0 0 0 1.5 0v-2.5a.25.25 0 0 1 .5 0"/>
        </svg>
      )
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // --- СТИЛИ ---
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(18, 18, 18, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2200, // Чуть выше обычных модалок
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s ease',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: '460px', // Чуть уже, чем OverlayModal (там 520), для уведомлений так лучше
      minHeight: '340px',
      maxHeight: '90vh',

      backgroundColor: '#1C1C1C',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Центрируем всё содержимое по горизонтали
      position: 'relative',

      transform: show ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(10px)',
      opacity: show ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',

      padding: '40px',
      boxSizing: 'border-box',
    },

    // Секция шапки
    headerSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: spacing.lg,
      width: '100%',
    },
    iconWrapper: {
      height: '100px', // Фиксированная высота для иконки
      width: 'auto',
      color: config.color,
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#FFFFFF',
      fontFamily: typography.fontFamily,
      textAlign: 'center',
      lineHeight: 1.2,
      marginBottom: '4px',
    },
    subTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: colors.gray400, // Серый подзаголовок (Тип уведомления)
      fontFamily: typography.fontFamily,
      textAlign: 'center',
      marginBottom: '20px',
    },

    // Текст сообщения
    text: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: typography.fontFamily,
      textAlign: 'center', // Текст уведомлений лучше смотрится по центру
      marginBottom: spacing.xxl,
      whiteSpace: 'pre-wrap',
    },

    // Кнопка
    buttonContainer: {
      width: '100%',
      marginTop: 'auto', // Прижимаем кнопку к низу, если контента мало
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div style={styles.card} onClick={e => e.stopPropagation()}>

        <div style={styles.headerSection}>
          {/* Иконка */}
          <div style={styles.iconWrapper}>
            {config.icon}
          </div>

          {/* Бренд */}
          <div style={styles.brandTitle}>Гостевой бот</div>

          {/* Подзаголовок (Успешно/Ошибка или кастомный title) */}
          <div style={styles.subTitle}>
            {title || config.defaultTitle}
          </div>
        </div>

        {/* Основной текст */}
        <div style={styles.text}>
          {text}
        </div>

        {/* Кнопка действия */}
        <div style={styles.buttonContainer}>
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
            style={{ fontSize: 16, height: 48, boxShadow: 'none' }}
          >
            Понятно
          </Button>
        </div>

      </div>
    </div>
  );
}
