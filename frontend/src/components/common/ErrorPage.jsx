// src/components/common/ErrorPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './index';
import { colors, spacing } from '../../styles/theme';
import { useIsMobile } from '../../hooks';

export default function ErrorPage({ code = '500', title, message }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Конфиг только для текстов
  const defaultContent = {
    '404': {
      title: 'Страница не найдена',
      message: 'Похоже, эта страница была удалена или никогда не существовала.',
    },
    '403': {
      title: 'Доступ ограничен',
      message: 'У вас недостаточно прав для просмотра этого раздела.',
    },
    '500': {
      title: 'Ошибка сервера',
      message: 'Мы уже в курсе и работаем над исправлением.',
    },
    'network': {
      title: 'Нет подключения',
      message: 'Не удалось подключиться к серверу. Проверьте настройки интернета.',
    },
  };

  const config = defaultContent[code] || defaultContent['500'];
  const content = {
    title: title || config.title,
    message: message || config.message,
  };

  const handleGoBack = () => navigate(-1);

  // Выбираем стили
  const currentStyles = {
    container: isMobile ? styles.containerMobile : styles.container,
    code: isMobile ? styles.codeMobile : styles.code,
    title: isMobile ? styles.titleMobile : styles.title,
    message: isMobile ? styles.messageMobile : styles.message,
    buttonWrapper: isMobile ? styles.buttonWrapperMobile : styles.buttonWrapper
  };

  return (
    <div style={currentStyles.container}>
      <h1 style={currentStyles.code}>
        {code === 'network' ? 'Network' : code}
      </h1>
      <h2 style={currentStyles.title}>
        {content.title}
      </h2>
      <p style={currentStyles.message}>
        {content.message}
      </p>

    </div>
  );
}

const styles = {
  // Desktop
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '80vh',
    width: '100%',
    padding: spacing.lg,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  code: {
    fontSize: 120,
    fontWeight: 900,
    color: colors.gray200,
    lineHeight: 1,
    marginBottom: spacing.md,
    letterSpacing: '-2px',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.gray500,
    lineHeight: 1.6,
    marginBottom: spacing.xl,
    fontWeight: 500,
    maxWidth: '500px',
  },

  // Mobile
  containerMobile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 'calc(100vh - 100px)',
    width: '100%',
    padding: spacing.md,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  codeMobile: {
    fontSize: 100,
    fontWeight: 800,
    color: colors.gray200,
    lineHeight: 1,
    marginBottom: spacing.sm,
    letterSpacing: '-1px',
  },
  titleMobile: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  messageMobile: {
    fontSize: 14,
    color: colors.gray500,
    lineHeight: 1.5,
    marginBottom: spacing.lg,
    fontWeight: 500,
    maxWidth: '100%',
  },

};
