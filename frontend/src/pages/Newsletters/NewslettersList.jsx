// src/pages/Newsletters/NewslettersList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { newslettersApi } from '../../services/api';
import {
  Spinner,
  Badge,
  PageHeader,
  EmptyStateCard,
  ErrorPage
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

const STATUS_MAP = {
  scheduled: { label: 'Запланирована', variant: 'primary' },
  partial: { label: 'Частично отправлена', variant: 'primary' },
  sending: { label: 'Отправка', variant: 'warning' },
  sent: { label: 'Завершена', variant: 'success' },
  failed: { label: 'Ошибка', variant: 'danger' },
};

export default function NewslettersList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const pollingInterval = useRef(null);

  const loadNewsletters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newslettersApi.list();
      setItems(data?.results || data || []);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async () => {
    try {
      const updates = await newslettersApi.getProgress();
      
      setItems(prevItems => prevItems.map(item => {
        const update = updates.find(u => u.id === item.id);
        if (update && (update.progress !== item.progress || update.status !== item.status)) {
          return { ...item, ...update };
        }
        return item;
      }));

      const stillActive = updates.some(u => u.status === 'sending' || u.status === 'scheduled');
      if (!stillActive && pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    } catch (e) {
      console.error("Ошибка обновления прогресса:", e);
    }
  }, []);

  useEffect(() => {
    loadNewsletters();
  }, [loadNewsletters]);

  useEffect(() => {
    const hasActive = items.some(nl => nl.status === 'sending' || nl.status === 'scheduled');
    if (hasActive && !pollingInterval.current) {
      pollingInterval.current = setInterval(updateProgress, 4000);
    }
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [items, updateProgress]);

  if (error) return <ErrorPage code="500" />;
  if (loading) return <div style={styles.center}><Spinner size={40} /></div>;

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <PageHeader
          title="Рассылки"
          subtitle="Создавайте и отслеживайте прогресс ваших уведомлений."
          isMobile={isMobile}
        />

        {items.length === 0 ? (
          <EmptyStateCard 
            title="Рассылок пока нет" 
            description="Создайте свою первую рассылку для пользователей Telegram и Email"
            onClick={() => navigate('/newsletters/create')}
            isMobile={isMobile}
          />
        ) : (
          <div style={{ 
            ...styles.grid, 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: isMobile ? spacing.md : spacing.xl 
          }}>
            {items.map((nl) => (
              <NewsletterCard 
                key={nl.id} 
                nl={nl} 
                isMobile={isMobile} 
                onClick={() => navigate(`/newsletters/${nl.id}`)}
              />
            ))}
            
            {/* Карточка добавления в конце списка */}
            <EmptyStateCard 
              title="Новая рассылка" 
              description="Запланировать еще одну"
              onClick={() => navigate('/newsletters/create')}
              isMobile={isMobile}
              small
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- КАРТОЧКА РАССЫЛКИ ---------- */

function NewsletterCard({ nl, isMobile, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.round(nl.progress || 0);

  return (
    <div 
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? shadows.md : shadows.card
      }} 
      onClick={onClick}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div style={styles.imageGallery}>
        {nl.image ? (
          <img src={newslettersApi.getFileUrl(nl.image)} alt="" style={styles.img} />
        ) : (
          <div style={styles.noImage}>
            <span style={styles.noImageText}>Без вложений</span>
          </div>
        )}
        <div style={styles.statusBadgeOverlay}>
          <Badge variant={STATUS_MAP[nl.status]?.variant}>
            {STATUS_MAP[nl.status]?.label}
          </Badge>
        </div>
      </div>

      <div style={styles.cardContent}>
        <div style={styles.channelRow}>
          <span style={styles.channelLabel}>
            {nl.channel === 'both' ? 'EMAIL и TELEGRAM' : nl.channel.toUpperCase()}
          </span>
          {nl.only_paid && <Badge variant="warning">VIP</Badge>}
        </div>

        <h3 style={styles.title}>{nl.title}</h3>

        {nl.status !== 'draft' && (
          <div style={styles.progressContainer}>
            <div style={styles.progressLabels}>
              <span style={styles.progressText}>Прогресс</span>
              <span style={styles.progressText}>{percentage}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ 
                ...styles.progressBarFill, 
                width: `${percentage}%`,
                background: colors.primary 
              }} />
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <span style={styles.date}>
            {nl.scheduled_at 
              ? new Date(nl.scheduled_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              : 'Мгновенная'}
          </span>
          {nl.failed > 0 && <span style={styles.failedCount}>Ошибки: {nl.failed}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------- СТИЛИ ---------- */

const styles = {
  center: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh' 
  },
  grid: {
    display: 'grid',
    marginTop: spacing.lg,
  },
  card: {
    background: colors.white,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${colors.gray100}`,
    height: '100%'
  },
  imageGallery: {
    height: '250px',
    background: colors.gray100,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { textAlign: 'center' },
  noImageText: { color: colors.gray400, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' },
  statusBadgeOverlay: { position: 'absolute', top: 12, right: 12 },
  
  cardContent: { padding: spacing.lg, flex: 1, display: 'flex', flexDirection: 'column' },
  channelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs, alignItems: 'center' },
  channelLabel: { fontSize: '10px', fontWeight: 800, color: colors.gray400 },
  
  title: { 
    fontSize: '17px', 
    fontWeight: 700, 
    color: colors.primary, 
    margin: `0 0 ${spacing.md}px 0`,
    lineHeight: 1.3
  },
  progressContainer: { marginBottom: spacing.md, marginTop: 'auto' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  progressText: { fontSize: '10px', fontWeight: 700, color: colors.gray400 },
  progressBarBg: { height: '6px', background: colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', transition: 'width 0.6s ease' },

  footer: { 
    marginTop: spacing.sm, 
    paddingTop: spacing.sm, 
    borderTop: `1px solid ${colors.gray50}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  date: { fontSize: '12px', color: colors.gray400, fontWeight: 500 },
  failedCount: { fontSize: '11px', color: colors.danger, fontWeight: 700 },
};