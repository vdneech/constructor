/**
 * Дизайн-система согласно разделу 3 ТЗ
 */

// 3.1 Цветовая палитра
export const colors = {
  background: '#FAFAFA',
  primary: '#1C1C1C',
  primaryHover: '#0F0F0F',
  primaryDark: '#434343', // Для danger hover
  accent: '#F8F7E2',
  white: '#FFFFFF',

  // Grayscale
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',

  // Success
  success: '#166534',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  successText: '#166534',

  // Error
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#DC2626',

  // Warning
  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningBorder: '#FCD34D',
  warningText: '#D97706',

  // Info
  info: '#1E40AF',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',
  infoText: '#1E40AF',
};

// 3.2 Типографика
export const typography = {
  fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  h1: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },
  h1Mobile: {
    fontSize: 24,
  },
  h2: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: 18,
    fontWeight: 600,
  },
  body: {
    fontSize: 16,
    fontWeight: 500,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.gray500,
  },
  helper: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.gray400,
  },
  muted: {
    fontSize: 15,
    fontWeight: 500,
    color: colors.gray500,
  },
};

// Transitions
export const transitions = {
  default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  card: '0 10px 40px rgba(0, 0, 0, 0.05)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
  modal: '0 20px 40px rgba(0, 0, 0, 0.2)',
  button: '0 8px 24px rgba(28, 28, 28, 0.15)',
  buttonHover: '0 12px 32px rgba(28, 28, 28, 0.25)',
  focus: '0 0 0 3px rgba(28, 28, 28, 0.1)',
};

// Border radius
export const borderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  photo: 12, // Для фото
  card: 20,
  cardMobile: 16,
  rounded: 999,
};

// Spacing
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Breakpoints
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
};

export const zIndex = {
  card: 10,
  header: 50,
  modal: 100,
  toast: 200,
};