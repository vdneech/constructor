import React from 'react';
import { Button } from './index';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function NetworkErrorPage({ onRetry }) {
  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        {/* Иконка перечеркнутого Wi-Fi или облака */}
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={colors.gray300} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>

      <h1 style={styles.title}>Нет соединения</h1>
      <p style={styles.text}>
        Не удалось подключиться к серверу. Проверьте настройки интернета или попробуйте обновить страницу.
      </p>

      <Button 
        variant="primary" 
        onClick={onRetry || (() => window.location.reload())}
        style={styles.button}
      >
        Попробовать снова
      </Button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: colors.white,
    padding: spacing.xl,
    textAlign: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: '40px',
    background: colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 16,
    color: colors.gray500,
    maxWidth: 300,
    lineHeight: 1.5,
    marginBottom: spacing.xxxl,
  },
  button: {
    minWidth: 200,
    boxShadow: `0 10px 20px ${colors.primary}33`,
  }
};