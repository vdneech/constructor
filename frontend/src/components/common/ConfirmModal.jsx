// components/common/ConfirmModal.jsx
import React from 'react';
import OverlayModal from './OverlayModal';
import Button from './Button';
import { colors, spacing } from '../../styles/theme';

/**
 * Модальное окно подтверждения деструктивного действия
 * @param {string} title - Заголовок модалки
 * @param {string} message - Основной вопрос
 * @param {string} description - Дополнительное описание (необязательно)
 * @param {function} onConfirm - Колбэк подтверждения
 * @param {function} onClose - Колбэк закрытия
 * @param {string} confirmText - Текст кнопки подтверждения
 * @param {string} cancelText - Текст кнопки отмены
 * @param {boolean} loading - Состояние загрузки
 * @param {boolean} open - Показать/скрыть
 */
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

      <div style={styles.actions}>
        
        <Button
          variant="primary"
          fullWidth
          onClick={onClose}
          disabled={loading}
          style={styles.cancelButton}
        >
          {cancelText}
        </Button>

        <Button
          variant="danger"
          fullWidth
          onClick={onConfirm}
          loading={loading}
          loadingText="Загрузка..."
          style={styles.confirmButton}
        >
          {confirmText}
        </Button>

        
      </div>
    </OverlayModal>
  );
}

const styles = {
  message: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 600, // ← ИСПРАВЛЕНО: было 550
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    color: colors.gray500,
    fontSize: 15,
    fontWeight: 500,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelButton: {
    fontSize: 16,
  },
  confirmButton: {
    fontSize: 16,
  },
};
