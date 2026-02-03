// components/common/NoticeModal.jsx
import React, { useEffect } from 'react';
import { colors, shadows, borderRadius, spacing } from '../../styles/theme';
import { useIsMobile } from '../../hooks/useIsMobile';
import Button from './Button';

/**
 * Модальное окно уведомления
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - Заголовок (необязательно)
 * @param {string} text - Основной текст
 * @param {function} onClose - Колбэк закрытия
 * @param {boolean} open - Показать/скрыть
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

  // Блокировка скролла body
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  // Автозакрытие для success-уведомлений
  useEffect(() => {
    if (!open || !autoClose) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [open, autoClose, autoCloseDelay, onClose]);

  if (!open) return null;

  // Конфигурация для разных типов
  const typeConfig = {
    success: {
      iconBg: colors.successBg,
      iconColor: colors.successText,
      icon: '✓',
      defaultTitle: 'Успешно'
    },
    error: {
      iconBg: colors.errorBg,
      iconColor: colors.errorText,
      icon: '✕',
      defaultTitle: 'Ошибка'
    },
    warning: {
      iconBg: colors.warningBg,
      iconColor: colors.warningText,
      icon: '⚠',
      defaultTitle: 'Внимание'
    },
    info: {
      iconBg: colors.infoBg,
      iconColor: colors.infoText,
      icon: 'ℹ',
      defaultTitle: 'Информация'
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div style={{
        ...styles.card,
        ...(isMobile && styles.cardMobile)
      }}>
        <div style={{
          ...styles.icon,
          background: config.iconBg,
          color: config.iconColor
        }}>
          {config.icon}
        </div>

        {(title || config.defaultTitle) && (
          <div style={styles.title}>
            {title || config.defaultTitle}
          </div>
        )}

        <div style={styles.text}>
          {text}
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={onClose}
          style={styles.button}
        >
          Понятно
        </Button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2200,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: colors.white,
    borderRadius: borderRadius.card,
    padding: 28,
    boxShadow: shadows.modal,
    textAlign: 'center',
  },
  cardMobile: {
    borderRadius: borderRadius.cardMobile,
    padding: spacing.xl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.rounded,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 26,
    margin: `0 auto ${spacing.md}px`,
  },
  title: {
    color: colors.primary,
    fontWeight: 700,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  text: {
    margin: `0 0 ${spacing.lg}px 0`,
    color: colors.gray500,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  button: {
    fontSize: 16,
  }
};
