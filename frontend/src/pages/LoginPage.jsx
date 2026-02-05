// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { ErrorPage, Spinner } from '../components/common';
import { colors, spacing, borderRadius, typography, transitions } from '../styles/theme';

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFatalError, setIsFatalError] = useState(false);

  // Состояние фокуса теперь храним для каждого поля отдельно, чтобы менять стиль именно у него
  const [focusedField, setFocusedField] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;

    setError(null);
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 400));

      const { access, refresh } = await authApi.login({
        username: form.username.trim(),
        password: form.password,
      });

      if (!access || !refresh) throw new Error('Token error');

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      navigate('/analytics', { replace: true });
    } catch (err) {
      console.error('LOGIN_ERROR', err);
      if (!err.response || err.response.status >= 500) {
        setIsFatalError(true);
        return;
      }
      const data = err.response?.data;
      let msg = 'Проверьте данные входа';
      if (err.response.status === 401) msg = 'Неверный логин или пароль';
      else if (data?.detail) msg = data.detail;
      setError(msg);
      setLoading(false);
    }
  };

  if (isFatalError) return <ErrorPage code="500" />;

  const isDisabled = loading || !form.username || !form.password;

  return (
    <div style={darkStyles.page}>
      {/* Глобальные стили для фикса автозаполнения */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #2A2A2A inset !important;
            -webkit-text-fill-color: white !important;
            border-radius: ${borderRadius.large}px !important;
        }
      `}</style>

      <div style={{
        ...darkStyles.card,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      }}>

        <div style={darkStyles.header}>
          <div style={darkStyles.logoWrapper}>
            <img src="/logo 512x512.png" alt="Logo" style={darkStyles.logo} />
          </div>
          <h1 style={darkStyles.title}>Гостевой бот</h1>
          <p style={darkStyles.subtitle}>Панель администратора</p>
        </div>

        <form onSubmit={handleSubmit} style={darkStyles.form}>
          <div style={darkStyles.inputsContainer}>
            {/* ЛОГИН */}
            <input
              name="username"
              type="text"
              placeholder="Имя пользователя"
              value={form.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              autoComplete="username"
              style={{
                ...darkStyles.input,
                border: `1px solid ${error ? '#EF4444' : (focusedField === 'username' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)')}`,
                backgroundColor: focusedField === 'username' ? '#2A2A2A' : '#222222',
              }}
            />

            {/* ПАРОЛЬ */}
            <input
              name="password"
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              autoComplete="current-password"
              style={{
                ...darkStyles.input,
                border: `1px solid ${error ? '#EF4444' : (focusedField === 'password' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)')}`,
                backgroundColor: focusedField === 'password' ? '#2A2A2A' : '#222222',
              }}
            />
          </div>

          <div style={{
            ...darkStyles.errorContainer,
            height: error ? 'auto' : 0,
            opacity: error ? 1 : 0,
            marginBottom: error ? spacing.md : 0,
          }}>
            <div style={darkStyles.errorContent}>
              {error}
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              ...darkStyles.submitButton,
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <Spinner size={20} color="#1C1C1C" /> : 'Войти'}
          </button>
        </form>

        <div style={darkStyles.footer}>
          dev by vdneech
        </div>
      </div>
    </div>
  );
}

const darkStyles = {
  page: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    background: '#121212',
    fontFamily: typography.fontFamily,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    color: '#FFFFFF',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: '#1C1C1C',
    borderRadius: borderRadius.card,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    padding: spacing.xl,
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    border: '1px solid rgba(255,255,255,0.05)',
    maxHeight: '100vh',
    overflowY: 'auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    width: 120,
    margin: '0 auto',
    borderRadius: borderRadius.photo,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  // Теперь стили применяются прямо к input
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: borderRadius.large, // Скругление прямо у инпута
    fontSize: 15,
    fontFamily: typography.fontFamily,
    color: '#FFFFFF',
    outline: 'none',
    fontWeight: 500,
    boxSizing: 'border-box', // Важно, чтобы padding не ломал ширину
  },
  errorContainer: {
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  errorContent: {
    color: colors.error,
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: colors.white,
    color: colors.primary,
    border: 'none',
    borderRadius: borderRadius.large,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: typography.fontFamily,
    transition: transitions.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 500,
  },
};
