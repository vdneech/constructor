import React, { useEffect, useState } from 'react';
import { modalOverlay, modalCard, modalCardMobile } from '../../styles/commonStyles';
import { colors, borderRadius, spacing, typography } from '../../styles/theme';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * Модальное окно с overlay согласно дизайн-системе ТЗ
 */
export default function OverlayModal({ open, title, onClose, children }) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

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

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose?.();
  };

  const modalHeaderStyle = {
    padding: isMobile ? `${spacing.xl}px 18px` : `18px ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.gray200}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    background: colors.primary,
  };

  const modalTitleStyle = {
    color: colors.accent,
    fontWeight: 600,
    lineHeight: 1.2,
  };


  const modalBodyStyle = {
    padding: isMobile ? spacing.md : spacing.lg,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
  };

  return (
    <div 
      style={modalOverlay} 
      onClick={handleBackdropClick} 
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        style={{ ...modalCard, ...(isMobile && modalCardMobile) }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <div style={modalTitleStyle}>{title}</div>
        </div>

        <div style={modalBodyStyle}>{children}</div>
      </div>
    </div>
  );
}
