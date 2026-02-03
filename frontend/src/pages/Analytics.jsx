import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApi, usersApi } from '../services/api';
import { normalizeApiError } from '../services/api';
import { Button, Spinner, ErrorPage, PageHeader } from '../components/common';
import { useIsMobile } from '../hooks';
import { pageStyles } from '../styles/pageStyles';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

/* ---------- COMPONENTS ---------- */

// ✅ ИСПРАВЛЕНО: убрал useState для isMobile, теперь получаем через пропсы
const StatCard = React.memo(({ label, value, isMobile }) => {
  return (
    <div
      style={{
        background: colors.white,
        padding: isMobile ? spacing.lg : spacing.xl,
        borderRadius: borderRadius.card,
        boxShadow: shadows.card,
      }}
    >
      <div
        style={{
          fontSize: 15,
          marginBottom: spacing.sm,
          color: colors.gray500,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: isMobile ? 32 : 40,
          fontWeight: 700,
          color: colors.primary,
        }}
      >
        {typeof value === 'number' ? value.toLocaleString('ru-RU') : '0'}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

/* ---------- MAIN COMPONENT ---------- */

export default function Analytics() {
  const isMobile = useIsMobile(); // ✅ Используем хук вместо useState

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsApi.getUsersStats();
      setData(response);
    } catch (err) {
      console.error('Analytics error:', err);
      const normalized = normalizeApiError(err);
      setError(normalized.message || '500');
    } finally {
      setLoading(false);
    }
  }, []);

  // Формируем данные для графика
  const chartData = useMemo(() => {
    if (!data?.daily_stats || !Array.isArray(data.daily_stats)) return [];

    const totalUsers = Number(data.total_users) || 0;
    const paidUsers = Number(data.paid_users) || 0;

    const totalInPeriod = data.daily_stats.reduce((acc, curr) => 
      acc + (Number(curr.registrations) || 0), 0);
    const paidInPeriod = data.daily_stats.reduce((acc, curr) => 
      acc + (Number(curr.paid_registrations) || 0), 0);

    let cumulativeUsers = totalUsers - totalInPeriod;
    let cumulativePaid = paidUsers - paidInPeriod;

    return data.daily_stats.map((item) => {
      cumulativeUsers += (Number(item.registrations) || 0);
      cumulativePaid += (Number(item.paid_registrations) || 0);

      return {
        date: new Date(item.day).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        'Регистраций': cumulativeUsers,
        'Оплачено': cumulativePaid,
      };
    });
  }, [data]);

  const conversionRate = useMemo(() => {
    if (!data || data.total_users === 0) return 0;
    return Math.round((data.paid_users / data.total_users) * 100);
  }, [data]);

  const downloadCSV = useCallback(async () => {
    try {
      const response = await usersApi.downloadCSV();
      if (!response?.data) throw new Error('Данные не получены');

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `users_${new Date().toISOString().split('T')[0]}.csv`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const normalized = normalizeApiError(err);
      alert(normalized.message || 'Не удалось скачать файл');
    }
  }, []);

  // ✅ ИСПРАВЛЕНО: используем pageStyles и единую структуру
  const dynamicStyles = {
    card: {
      ...pageStyles.card,
      ...(isMobile && pageStyles.cardMobile),
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: spacing.xl,
      marginBottom: isMobile ? spacing.xxxl : 48,
    },
  };

  if (error) return <ErrorPage code="500" />;

  if (loading) {
    return (
      <div style={pageStyles.page}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        {/* ✅ Добавили PageHeader */}
        <PageHeader
          title="Аналитика"
          subtitle="Отслеживание базы пользователей и процента конверсии в платящих клиентов"
          isMobile={isMobile}
        />

        {/* Карточки статистики */}
        <div style={dynamicStyles.grid}>
          <StatCard label="Всего пользователей" value={data.total_users} isMobile={isMobile} />
          <StatCard label="Оплачено" value={data.paid_users} isMobile={isMobile} />
        </div>

        {/* Конверсия */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? spacing.xxxl : 48,
          }}
        >
          <div
            style={{
              color: colors.primary,
              fontWeight: 700,
              fontSize: isMobile ? 48 : 64,
              marginBottom: spacing.md,
            }}
          >
            {conversionRate}%
          </div>
          <p
            style={{
              color: colors.gray500,
              fontSize: isMobile ? 14 : 15,
              fontWeight: 500,
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Ваш процент конверсии пользователей. Показывает долю зарегистрированных пользователей, которые совершили оплату.
          </p>
        </div>

        {/* График */}
        <div style={dynamicStyles.card}>
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? 18 : 20,
              fontWeight: 600,
              marginBottom: isMobile ? spacing.xl : spacing.xxxl,
              color: colors.primary,
            }}
          >
            Рост пользователей и оплат за 30 дней
          </h2>

          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: isMobile ? 300 : 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.gray100} />
                  <XAxis
                    dataKey="date"
                    stroke={colors.gray500}
                    style={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <YAxis
                    stroke={colors.gray500}
                    style={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.white,
                      border: `1px solid ${colors.gray200}`,
                      borderRadius: borderRadius.large,
                      boxShadow: shadows.card,
                      color: colors.primary,
                      fontFamily: typography.fontFamily,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: spacing.xl }}
                    iconType="line"
                    formatter={(value) => (
                      <span style={{ color: colors.gray500, fontSize: 14, fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="Регистраций"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Оплачено"
                    stroke={colors.gray500}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                color: colors.gray500,
                textAlign: 'center',
                padding: `${spacing.xxxl}px 0`,
              }}
            >
              Нет данных для отображения
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: isMobile ? spacing.xl : spacing.xxxl,
            }}
          >
            <Button
              variant="primary"
              onClick={downloadCSV}
              disabled={data.total_users === 0}
              fullWidth={isMobile}
            >
              <span style={{ marginRight: spacing.xs, fontSize: 18, fontWeight: 'bold' }}>↓</span>
              Скачать CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}