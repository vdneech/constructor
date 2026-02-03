import React, { useState } from 'react';
import { colors, borderRadius, spacing } from '../../styles/theme';

/**
 * Компонент IconButton - кнопка с иконкой
 */
export default function IconButton({ 
  icon, 
  onClick, 
  variant = 'primary', // primary | secondary | danger
  size = 'md', // sm | md | lg
  title = '',
  disabled = false,
  style = {},
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: {
      background: colors.primary,
      color: colors.white,
      hoverBackground: '#0F0F0F',
    },
    secondary: {
      background: colors.gray100,
      color: colors.primary,
      hoverBackground: colors.gray200,
    },
    danger: {
      background: colors.errorBg,
      color: colors.errorText,
      hoverBackground: '#FEE2E2',
      border: `1px solid ${colors.errorBorder}`,
    },
  };

  const sizes = {
    sm: {
      width: 32,
      height: 32,
      fontSize: 14,
    },
    md: {
      width: 40,
      height: 40,
      fontSize: 16,
    },
    lg: {
      width: 48,
      height: 48,
      fontSize: 18,
    },
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  const baseStyle = {
    width: sizeStyles.width,
    height: sizeStyles.height,
    fontSize: sizeStyles.fontSize,
    borderRadius: borderRadius.medium,
    border: variantStyles.border || 'none',
    background: isHovered && !disabled ? variantStyles.hoverBackground : variantStyles.background,
    color: variantStyles.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
    ...style,
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      {...props}
    >
      {icon}
    </button>
  );
}
