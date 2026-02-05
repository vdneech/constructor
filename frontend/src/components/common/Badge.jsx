// components/common/Badge.jsx
import React, { useState } from 'react';
import { colors } from '../../styles/theme';

export default function Badge({
  children,
  variant = 'active', // active | inactive | clickable
  href = null,
  onClick = null,
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isInteractive = variant === 'clickable' || href || onClick;

  const variantStyles = {
    active: {
      background: colors.primary || 'rgb(28, 28, 28)',
      color: '#FFF',
      border: 'none',
      justifyContent: 'center'
    },
    inactive: {
      background: 'transparent',
      color: colors.gray400 || '#9CA3AF',
      border: `2px dashed ${colors.gray200 || '#E5E7EB'}`,
      justifyContent: 'center'
    },
    clickable: {
      background: isHovered ? (colors.primary || '#1C1C1C') : '#F3F4F6',
      color: isHovered ? '#FFF' : (colors.primary || '#1C1C1C'),
      border: 'none',
      cursor: 'pointer',
      justifyContent: 'center'
    },
  };

  const current = variantStyles[variant] || variantStyles.active;

  const baseStyle = {
    padding: '6px 14px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    fontFamily: 'Montserrat, sans-serif',
    textDecoration: 'none',
    ...current,
    ...style,
  };

  const sharedProps = {
    style: baseStyle,
    onMouseEnter: () => isInteractive && setIsHovered(true),
    onMouseLeave: () => isInteractive && setIsHovered(false),
    ...props
  };

  if (href) return <a href={href} {...sharedProps}>{children}</a>;
  if (onClick) return <button type="button" onClick={onClick} {...sharedProps}>{children}</button>;
  return <span {...sharedProps}>{children}</span>;
}