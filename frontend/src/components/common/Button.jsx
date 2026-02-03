// src/components/common/Button.jsx
import React, { useState } from 'react';
import { colors, spacing, borderRadius, shadows, transitions } from '../../styles/theme';
import Spinner from './Spinner';

/**
 * Универсальный компонент кнопки
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'danger'
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} disabled - отключенное состояние
 * @param {boolean} loading - состояние загрузки
 * @param {string} loadingText - текст при загрузке
 * @param {boolean} fullWidth - кнопка на всю ширину
 * @param {React.ReactNode} icon - иконка слева от текста
 * @param {function} onClick - обработчик клика
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {object} style - дополнительные inline стили
 */
export default function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  loadingText,
  fullWidth = false,
  icon = null,
  onClick,
  type = 'button',
  children,
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Базовые стили для всех вариантов
  const baseStyles = {
    fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: transitions.default,
    border: 'none',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    textDecoration: 'none',
    userSelect: 'none',
    position: 'relative',
    boxSizing: 'border-box',
  };

  // Размеры
  const sizeStyles = {
    small: {
      padding: `${spacing.xs}px ${spacing.sm}px`,
      fontSize: 13,
      fontWeight: 600,
      borderRadius: borderRadius.small,
      minHeight: 32,
    },
    medium: {
      padding: `${spacing.sm}px ${spacing.lg}px`,
      fontSize: 15,
      fontWeight: 600,
      borderRadius: borderRadius.medium,
      minHeight: 44,
    },
    large: {
      padding: `${spacing.md}px ${spacing.xl}px`,
      fontSize: 16,
      fontWeight: 700,
      borderRadius: borderRadius.medium,
      minHeight: 52,
    },
  };

  // Варианты цветов
  const variantStyles = {
    primary: {
      default: {
        background: colors.primary,
        color: colors.white,
        boxShadow: shadows.md,
      },
      hover: {
        background: colors.primaryHover,
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 32px rgba(28, 28, 28, 0.25)',
      },
      pressed: {
        transform: 'translateY(0)',
        boxShadow: shadows.sm,
      },
      disabled: {
        background: colors.gray300,
        color: colors.gray500,
        opacity: 0.6,
        boxShadow: 'none',
      },
    },
    secondary: {
      default: {
        background: 'none',
        color: colors.primary,
        boxShadow: 'none',
      },
      hover: {
        background: colors.gray100,
        transform: 'translateY(-1px)',
      },
      pressed: {
        transform: 'translateY(0)',
        background: colors.gray300,
      },
      disabled: {
        background: colors.gray100,
        color: colors.gray400,
        opacity: 0.5,
      },
    },
    danger: {
      default: {
        background: 'none',
        color: colors.errorText,
      },
      hover: {
        transform: 'translateY(-2px)',
      },
      pressed: {
        transform: 'translateY(0)',
        boxShadow: shadows.sm,
      },
      disabled: {
        background: colors.errorBg,
        color: colors.gray400,
        opacity: 0.6,
        boxShadow: 'none',
      },
    },
  };

  // Определяем текущие стили
  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  let currentState = currentVariant.default;
  if (disabled || loading) {
    currentState = { ...currentState, ...currentVariant.disabled };
  } else if (isPressed) {
    currentState = { ...currentState, ...currentVariant.pressed };
  } else if (isHovered) {
    currentState = { ...currentState, ...currentVariant.hover };
  }

  const combinedStyles = {
    ...baseStyles,
    ...currentSize,
    ...currentState,
    ...(fullWidth && { width: '100%' }),
    ...style,
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  // Контент кнопки
  const buttonContent = loading ? (
    <>
      <Spinner size={size === 'small' ? 14 : size === 'large' ? 18 : 16} />
      {loadingText && <span>{loadingText}</span>}
    </>
  ) : (
    <>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </>
  );

  return (
    <button
      type={type}
      style={combinedStyles}
      onClick={handleClick}
      onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
}

/**
 * Кнопка-ссылка для навигации (React Router)
 * 
 * @example
 * <ButtonLink to="/path" variant="primary">Перейти</ButtonLink>
 */
export function ButtonLink({ to, children, onClick, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    onClick?.(e);
    if (to) {
      navigate(to);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

// Импорт для ButtonLink
import { useNavigate } from 'react-router-dom';

/**
 * Кнопка "Назад"
 * 
 * @example
 * <BackButton />
 * <BackButton to="/list" />
 * <BackButton label="← К списку" />
 */
export function BackButton({ to, label = '← Назад', onClick, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      variant="secondary" 
      size="small" 
      onClick={handleClick}
      style={{ 
        background: 'transparent', 
        border: 'none',
        padding: `${spacing.xs}px 0`,
        color: colors.gray500,
        fontWeight: 500,
        boxShadow: 'none',
      }}
      {...props}
    >
      {label}
    </Button>
  );
}