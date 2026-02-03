import { colors, typography, transitions, shadows, borderRadius, spacing } from './theme';

/**
 * Общие стили для переиспользования
 * Согласно разделу 3.3 ТЗ "Компоненты форм"
 */

// Состояния input/textarea
export const inputStates = {
  default: {
    border: `2px solid ${colors.gray200}`,
    background: colors.background,
  },
  focus: {
    borderColor: colors.primary,
    background: colors.white,
    boxShadow: shadows.focus,
  },
};

// Базовые стили кнопок
export const buttonBase = {
  fontFamily: typography.fontFamily,
  cursor: 'pointer',
  transition: transitions.default,
  border: 'none',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
};

// Стили Primary кнопки
export const buttonPrimary = {
  ...buttonBase,
  background: colors.primary,
  color: colors.white,
  padding: `${spacing.md}px ${spacing.lg}px`,
  borderRadius: borderRadius.large,
  fontSize: 14,
  boxShadow: shadows.button,
};

export const buttonPrimaryHover = {
  background: colors.primaryHover,
  transform: 'translateY(-2px)',
  boxShadow: shadows.buttonHover,
};

export const buttonPrimaryDisabled = {
  background: colors.gray300,
  color: colors.gray400,
  opacity: 0.6,
  cursor: 'not-allowed',
  boxShadow: 'none',
};

// Стили Secondary кнопки
export const buttonSecondary = {
  ...buttonBase,
  background: '#F8F9FA',
  border: `2px dashed #E9ECEF`,
  color: colors.primary,
  padding: `${spacing.sm}px ${spacing.lg}px`,
  borderRadius: borderRadius.medium,
  fontSize: 14,
  fontWeight: 700,
};

export const buttonSecondaryHover = {
  background: '#E9ECEF',
  border: `2px dashed #E9ECEF`,
};

export const buttonSecondaryDisabled = {
  border: `2px dashed ${colors.gray300}`,
  color: colors.gray400,
  opacity: 0.6,
  cursor: 'not-allowed',
};

// Стили Danger кнопки
export const buttonDanger = {
  ...buttonBase,
  background: 'none',
  color: colors.primary,
  padding: `${spacing.sm}px ${spacing.lg}px`,
  borderRadius: borderRadius.medium,
  fontSize: 14,
  fontWeight: 600,
};

export const buttonDangerHover = {
  background: colors.errorBg,
  borderColor: colors.errorText,
};

// Стили для input/textarea
export const inputBase = {
  width: '100%',
  padding: `${spacing.md}px ${spacing.lg}px`,
  border: `2px solid ${colors.gray200}`,
  borderRadius: borderRadius.large,
  background: colors.background,
  fontSize: 16,
  fontWeight: 500,
  color: colors.primary,
  fontFamily: typography.fontFamily,
  outline: 'none',
  boxSizing: 'border-box',
  transition: transitions.default,
};

export const inputMobile = {
  fontSize: 14,
  padding: `14px ${spacing.md}px`,
};

// Стили для textarea
export const textareaBase = {
  ...inputBase,
  fontSize: 14,
  fontFamily: typography.fontFamilyMono,
  resize: 'vertical',
  minHeight: 160,
};

// Стили для checkbox card
export const checkCard = {
  border: `2px solid ${colors.gray200}`,
  borderRadius: borderRadius.large,
  background: colors.background,
  padding: `14px ${spacing.md}px`,
};

// Стили для модальных окон
export const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 2000,
  padding: '20px 16px',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const modalCard = {
  width: '100%',
  maxWidth: 520,
  background: colors.white,
  borderRadius: borderRadius.card,
  boxShadow: shadows.modal,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
};

export const modalCardMobile = {
  borderRadius: borderRadius.cardMobile,
};
