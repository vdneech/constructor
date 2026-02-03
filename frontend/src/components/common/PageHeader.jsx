// components/common/PageHeader.jsx
import React from 'react';
import { colors, spacing } from '../../styles/theme';

export default function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  isMobile,
  actionsInline = false,
  style 
}) {
  // Контентная часть (заголовок + подзаголовок)
  const renderContent = () => (
    <div style={styles.content}>
      <h1 style={{ ...styles.title, ...(isMobile && styles.titleMobile) }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ ...styles.subtitle, ...(isMobile && styles.subtitleMobile) }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  // Если actions в одной строке и не мобилка
  if (actionsInline && !isMobile) {
    return (
      <div style={{ ...styles.container, ...style }}>
        <div style={styles.inlineRow}>
          {renderContent()}
          {actions && (
            <div style={styles.actionsInline}>
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Стандартный вертикальный вид
  return (
    <div style={{ ...styles.container, ...(isMobile && styles.containerMobile), ...style }}>
      {renderContent()}
      {actions && (
        <div style={{ ...styles.actions, ...(isMobile && styles.actionsMobile) }}>
          {actions}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: 32,
    width: '100%',
  },

  containerMobile: {
    marginBottom: 24,
  },

  inlineRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Чтобы кнопки не растягивались по высоте заголовка
    gap: spacing.md,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    margin: 0,
    fontSize: '32px', // Прямое соответствие твоему Analytics.jsx
    fontWeight: 700,
    color: '#1C1C1C', // Твой основной черный
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },

  titleMobile: {
    fontSize: '24px',
  },

  subtitle: {
    margin: '6px 0 0 0',
    color: '#6B7280', // Цвет из Analytics.jsx (gray500 в теме обычно такой же)
    fontSize: '15px',
    fontWeight: 500,
    lineHeight: 1.6,
  },

  subtitleMobile: {
    fontSize: '14px',
  },

  actions: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: 24, // Оптимизировано под твой дизайн
  },

  actionsMobile: {
    width: '100%',
    flexDirection: 'column',
    marginTop: 16,
  },

  actionsInline: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
};