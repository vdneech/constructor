// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { Button, ErrorPage } from '../components/common';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    username: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFatalError, setIsFatalError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { access, refresh } = await authApi.login({
        username: form.username.trim(),
        password: form.password,
      });

      if (!access || !refresh) {
        throw new Error('Некорректный ответ сервера');
      }

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      navigate('/analytics', { replace: true });
    } catch (err) {
      console.error('LOGIN_ERROR', err);

      // Если сервер упал или вернул 500
      if (!err.response || err.response.status >= 500) {
        setIsFatalError(true);
        return;
      }

      // Обработка логических ошибок (400, 401, 403)
      const data = err.response?.data;
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Неверный логин или пароль');
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors) {
        setError(data.non_field_errors.join(' '));
      } else {
        setError('Ошибка авторизации. Проверьте данные.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Если поймали 500-ю или обрыв сети
  if (isFatalError) {
    return <ErrorPage code="500" />;
  }

  const isDisabled = !form.username.trim() || !form.password.trim() || loading;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img 
            src="/logo 512x512.png"
            width="100"
            alt="Logo"
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 style={styles.title}>Гостевой Бот</h1>
          <p style={styles.subtitle}>
            Введите логин и пароль администратора
          </p>
        </div>

        {/* Form */}
        <div style={styles.formContainer}>
          {error && (
            <div style={styles.errorBox}>
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                style={styles.errorClose}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <InputField
              label="Логин"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
              disabled={loading}
            />

            <InputField
              label="Пароль"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
            />

            <Button
              variant="primary"
              type="submit"
              disabled={isDisabled}
              loading={loading}
              loadingText="Вход..."
              fullWidth
            >
              Войти
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Компонент для input полей
function InputField({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  autoComplete, 
  autoFocus, 
  disabled 
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...styles.input,
          borderColor: focused ? colors.primary : colors.gray200,
          boxShadow: focused ? shadows.focus : 'none',
        }}
      />
    </div>
  );
}

// Все стили в одном месте
const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background,
    padding: spacing.lg,
    fontFamily: typography.fontFamily,
    zIndex: 2000,
  },
  
  card: {
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    background: colors.white,
    borderRadius: borderRadius.xlarge,
    boxShadow: shadows.modal,
    overflow: 'hidden',
  },
  
  header: {
    background: colors.primary,
    padding: `${spacing.xxxl}px ${spacing.xl}px ${spacing.xl}px`,
    textAlign: 'center',
  },
  
  logo: {
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
    display: 'block',
    margin: `0 auto ${spacing.lg}px`,
  },
  
  title: {
    fontSize: 23,
    fontWeight: 700,
    color: colors.accent,
    margin: `0 0 ${spacing.xs}px 0`,
    lineHeight: 1.2,
  },
  
  subtitle: {
    fontSize: 15,
    color: 'rgba(248, 247, 226, 0.8)',
    margin: 0,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  
  formContainer: {
    padding: spacing.xl,
  },
  
  errorBox: {
    background: colors.errorBg,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: borderRadius.medium,
    padding: `${spacing.md}px ${spacing.lg}px`,
    marginBottom: spacing.lg,
    color: colors.errorText,
    fontSize: 14,
    lineHeight: 1.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 500,
  },
  
  errorClose: {
    background: 'transparent',
    border: 'none',
    color: colors.errorText,
    fontSize: 22,
    cursor: 'pointer',
    padding: `0 ${spacing.xs}px`,
    lineHeight: 1,
    marginLeft: spacing.sm,
    transition: 'opacity 0.2s ease',
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  
  input: {
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    border: `2px solid ${colors.gray200}`,
    borderRadius: borderRadius.medium,
    fontSize: 16,
    fontFamily: typography.fontFamily,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    background: colors.white,
    outline: 'none',
    boxSizing: 'border-box',
    color: colors.primary,
  },
};