// src/components/common/OverlayModal.jsx
import React, { useEffect, useState } from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function OverlayModal({ open, title, onClose, children }) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  // --- ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ) ---
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

  if (!mounted) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

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
      zIndex: 9999,
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s ease',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: '520px',
      // Увеличили высоту для "солидности"
      minHeight: '340px',
      maxHeight: '90vh',

      // Стили Login Page
      backgroundColor: '#1C1C1C',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

      display: 'flex',
      flexDirection: 'column',
      position: 'relative',

      transform: show ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(10px)',
      opacity: show ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',

      // Внутренний паддинг
      padding: '40px',
      boxSizing: 'border-box',
    },
    // Верхняя часть (Иконка + Бренд) - Центрирована
    headerSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    icon: {
      width: '60px',
      height: '120px',
      color: colors.accent,
      marginBottom: '20px', // Большой отступ до текста "Гостевой бот"
      display: 'block',
    },
    brandTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#FFFFFF',
      fontFamily: typography.fontFamily,
      textAlign: 'center',
      lineHeight: 1.2,
    },
    // Секция контента - Выровнена по левому краю
    contentSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Выравнивание влево
      textAlign: 'left',
      flex: 1, // Занимает оставшееся место
    },
    warningTitle: {
      fontSize: '14px',
      textAlign: 'center',
      fontWeight: 500,
      color: colors.gray400,
      fontFamily: typography.fontFamily,
      marginBottom: '12px',
      lineHeight: '1.3',
    },
    description: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: 'rgba(255, 255, 255, 0.6)', // Чуть приглушенный текст
      fontFamily: typography.fontFamily,
      width: '100%',
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

        {/* Шапка: Иконка + Бренд */}
        <div style={styles.headerSection}>
          <svg
            style={styles.icon}
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M6 6.207v9.043a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H6.236a1 1 0 0 1-.447-.106l-.33-.165A.83.83 0 0 1 5 2.488V.75a.75.75 0 0 0-1.5 0v2.083c0 .715.404 1.37 1.044 1.689L5.5 5c.32.32.5.754.5 1.207"/>
            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
          </svg>

          <div style={styles.brandTitle}>Гостевой бот</div>
          {title && <div style={styles.warningTitle}>{title}</div>}
        </div>

        {/* Тело: Заголовок предупреждения + Описание */}
        <div style={styles.contentSection}>


          <div style={styles.description}>
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
