import React from 'react';
import { Button } from './index';
import { colors, spacing } from '../../styles/theme';
import { useIsMobile } from '../../hooks';

/**
 * @param {string} code - Код ошибки (404, 500, etc)
 * @param {string} title - Заголовок
 * @param {string} message - Описание проблемы
 */
export default function ErrorPage({ code = '404', title, message }) {
  const isMobile = useIsMobile();

  const defaultContent = {
    '404': {
      title: 'Страница не найдена',
      message: 'Похоже, эта страница была удалена или никогда не существовала.'
    },
    '403': {
      title: 'Доступ ограничен',
      message: 'У вас недостаточно прав для просмотра этого раздела.'
    },
    '500': {
      title: 'Ошибка сервера',
      message: 'Мы уже в курсе и работаем над исправлением.'
    }
  };

  const content = {
    title: title || defaultContent[code]?.title || 'Произошла ошибка',
    message: message || defaultContent[code]?.message || 'Что-то пошло не так.'
  };

  // Функция для обновления текущей страницы
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, width: isMobile ? '100%' : '100vh' }}>
        <div style={styles.code}>{code}</div>
        <h1 style={styles.title}>{content.title}</h1>
        <p style={styles.message}>{content.message}</p>
        
        <div style={styles.actions}>
          <Button 
            variant="primary" 
            onClick={handleRefresh}
            style={styles.fullWidth}
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    // boxSizing гарантирует, что padding не вытолкнет контент за пределы высоты
    boxSizing: 'border-box', 
    minHeight: 'calc(100vh - 160px)', // Немного увеличим запас на всякий случай
    padding: spacing.lg,
    overflow: 'hidden', // Страховка от вылетов контента
  },
  card: {
    background: 'transparent', // Без фона
    textAlign: 'center',
  },
  code: {
    fontSize: 80,
    fontWeight: 900,
    color: colors.gray200,
    lineHeight: 1,
    marginBottom: spacing.md,
    letterSpacing: '-2px',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 15,
    color: colors.gray500,
    lineHeight: 1.6,
    marginBottom: spacing.xxl,
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  }
};