// styles/pageStyles.js
import { colors, typography, shadows, borderRadius, spacing } from './theme';

export const pageStyles = {
  // ========== LAYOUT ==========

  // Базовая обертка страницы
  page: {
    minHeight: '100vh',
    background: colors.background,
    fontFamily: typography.fontFamily,
    padding: `100px ${spacing.lg}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  // Контейнер контента
  container: {
    maxWidth: '120vh',
    width: '100%',
  },

  // ========== КАРТОЧКИ ==========

  // Карточка (основной контейнер формы/контента)
  card: {
    background: colors.white,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    padding: spacing.xxxl,
    marginBottom: spacing.xl,
  },

  cardMobile: {
    padding: spacing.lg,
    borderRadius: borderRadius.cardMobile,
  },

  // ========== ФОРМЫ ==========

  // Форма
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },

  // Действия формы (кнопки)
  formActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  // ========== GRID LAYOUTS ==========

  // Ряд из 2-х полей (50/50)
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
  },

  fieldRowMobile: {
    gridTemplateColumns: '1fr',
  },

  // Галерея фото (3 колонки)
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing.md,
  },

  photoGridMobile: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },

  // Секция с content (для invoice и т.д.)
  contentSection: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  contentSectionMobile: {
    gridTemplateColumns: '1fr',
  },

  // ========== TYPOGRAPHY ==========

  // Label для полей
  label: {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: 14,
    fontWeight: 600,
    color: colors.gray500,
    letterSpacing: '0.025em',
  },

  // Вспомогательный текст
  muted: {
    color: colors.gray500,
    fontSize: 15,
    fontWeight: 500,
  },

  // Helper текст под полем
  helper: {
    marginTop: spacing.xs,
    color: colors.gray400,
    fontSize: 13,
    fontWeight: 500,
  },

  // ========== СПИСКИ ==========

  // Список элементов
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },

  // Элемент списка (карточка)
  listItem: {
    background: colors.white,
    borderRadius: borderRadius.large,
    boxShadow: shadows.sm,
    padding: spacing.lg,
    cursor: 'pointer',
    // transition: transitions.default,
  },

  listItemHover: {
    boxShadow: shadows.cardHover,
    transform: 'translateY(-2px)',
  },

  // ========== СЕКЦИИ ==========

  // Секция с заголовком
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
};