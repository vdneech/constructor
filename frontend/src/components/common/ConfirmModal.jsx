// components/common/ConfirmModal.jsx
import React from 'react';
import OverlayModal from './OverlayModal';
import Button from './Button';
import { colors, spacing } from '../../styles/theme';
import { useIsMobile } from "../../hooks"; // Убедитесь, что путь верный

export default function ConfirmModal({
  open,
  title = 'Подтверждение',
  message,
  description,
  onClose,
  onConfirm,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  loading = false,
}) {
  // 1. Хук вызывается внутри компонента
  const isMobile = useIsMobile();

  return (
    <OverlayModal open={open} title={title} onClose={onClose}>
      <div style={styles.message}>
        {message}
      </div>

      {description && (
        <div style={styles.description}>
          {description}
        </div>
      )}

      {/* 2. Логику стилей пишем прямо здесь, смешивая статические стили styles.actions и динамические */}
      <div style={{
        ...styles.actions,
        flexDirection: isMobile ? 'column' : 'row-reverse',
        width: isMobile ? '100%' : 'auto',
        justifyContent: 'space-around'
      }}>

        {/* Кнопки. На мобильном порядок будет сверху вниз (из-за column),
            поэтому Confirm будет первой, Cancel второй. */}
        <Button
          variant="danger"
          fullWidth={isMobile} // На ПК кнопка не должна быть на всю ширину
          onClick={onConfirm}
          loading={loading}
          loadingText="Загрузка..."
          style={styles.confirmButton}
        >
          {confirmText}
        </Button>

        <Button
          fullWidth={isMobile}
          onClick={onClose}
          disabled={loading}
          style={styles.cancelButton}
        >
          {cancelText}
        </Button>

      </div>
    </OverlayModal>
  );
}

// 3. Статические стили (здесь нет isMobile)
const styles = {
  message: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 500,
  },
  description: {
    color: colors.gray500,
    fontSize: 14,
    fontWeight: 500,
    marginBottom: spacing.md,
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
  },
  cancelButton: {
    boxShadow: 'none',
    background: 'none',
    fontSize: 16,
  },
  confirmButton: {
    fontSize: 16,
  },
};
