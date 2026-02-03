// components/common/EmptyStateCard.jsx
import React, { useState } from 'react';
import { colors, borderRadius, spacing, shadows, transitions } from '../../styles/theme';

/**
 * EmptyStateCard - карточка создания нового элемента + пустое состояние
 * Строго по ТЗ 4.3.1 EmptyState Card / Create Card
 */
export default function EmptyStateCard({
  title,
  description,
  onClick,
  icon = '+',
  isMobile = false,
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    background: colors.background,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: transitions.default,
    border: `2px dashed ${colors.gray300}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 440,
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
    boxShadow: isHovered ? shadows.cardHover : shadows.card,
    width: '100%',
    ...style,
  };

  const iconStyle = {
    width: 80,
    height: 80,
    margin: `0 auto ${spacing.lg}px`,
    borderRadius: borderRadius.card,
    background: colors.white,
    border: `2px dashed ${colors.gray200}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
    fontWeight: 300,
    color: colors.gray400,
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  };

  const descriptionStyle = {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: 500,
    lineHeight: 1.5,
    textAlign: 'center',
    maxWidth: 300,
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ textAlign: 'center', padding: spacing.lg }}>
        <div style={iconStyle}>{icon}</div>
        <div style={titleStyle}>{title}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>
    </div>
  );
}