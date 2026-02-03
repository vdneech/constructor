// pages/Newsletters/NewsletterDetail.jsx
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

import { newslettersApi, normalizeApiError } from '../../services/api';
import {
  Button,
  Badge,
  NoticeModal,
  ConfirmModal,
  Spinner,
  EmptyStateCard,
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

const STATUS_MAP = {
  scheduled: { label: 'Запланирована', variant: 'primary' },
  partial: { label: 'Частично отправлена', variant: 'primary' },
  sending: { label: 'Отправка', variant: 'warning' },
  sent: { label: 'Завершена', variant: 'success' },
  failed: { label: 'Ошибка', variant: 'danger' },
};

const CHANNEL_LABELS = {
  'email': 'Email',
  'telegram': 'Telegram',
  'both': 'Email и Telegram'
};

function safeLocaleDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Компонент иконки статуса внутри строки пользователя
const DeliveryStatusInline = ({ task }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const channel = task.channel_sent;
  const isBoth = channel === 'both';
  const isTg = channel === 'telegram';
  const isEmail = channel === 'email';

  const getTooltipText = () => {
    if (isBoth) return "Доставлено по обоим каналам";
    if (isTg) return "Доставлено только в Telegram";
    if (isEmail) return "Доставлено только на Email";
    return "Статус отправки не определен";
  };

  if (task.status !== 'sent' || !channel) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 8, verticalAlign: 'middle' }} ref={tooltipRef}>
      <div
        onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        {isBoth ? (
          <svg width="20" height="20" fill={colors.successText} viewBox="0 0 16 16">
            <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
          </svg>
        ) : (
          <svg width="18" height="18" fill={colors.successText} viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
          </svg>
        )}
      </div>
      {showTooltip && (
        <div style={styles.tooltip}>
          {getTooltipText()}
          <div style={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

export default function NewsletterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const loadNewsletter = useCallback(async () => {
    try {
      setLoading(true);
      const data = await newslettersApi.detail(id);
      setNewsletter(data);
    } catch (err) {
      setNotice({ open: true, type: 'error', text: normalizeApiError(err.message) });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNewsletter();
  }, [loadNewsletter]);

  const handleCancelNewsletter = useCallback(async () => {
    setConfirmCancel(false);
    setCanceling(true);
    try {
      await newslettersApi.remove(id);
      setNotice({ open: true, type: 'success', text: 'Рассылка успешно отменена.' });
      setTimeout(() => navigate('/newsletters'), 1500);
    } catch (err) {
      setNotice({ open: true, type: 'error', text: normalizeApiError(err.message) });
    } finally {
      setCanceling(false);
    }
  }, [id, navigate]);

  const sentTasks = useMemo(
    () => newsletter?.tasks?.filter(t => t.status === 'sent') || [],
    [newsletter]
  );

  const failedTasks = useMemo(
    () => newsletter?.tasks?.filter(t => t.status === 'failed') || [],
    [newsletter]
  );

  if (loading) {
    return (
      <div style={styles.center}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!newsletter) return null;

  const isScheduled = newsletter.status === 'scheduled';

  return (
    <div style={{ ...styles.page, padding: isMobile ? '16px' : '40px' }}>
      <div style={styles.topRow}>
        <button onClick={() => navigate('/newsletters')} style={styles.backBtn}>
          ← Назад
        </button>
        <Badge variant={STATUS_MAP[newsletter.status]?.variant}>
          {STATUS_MAP[newsletter.status]?.label}
        </Badge>
      </div>

      {/* Main Card */}
      <div style={styles.mainCard}>
        <div style={styles.cardHeader}>
          <div style={styles.channelTag}>
            {CHANNEL_LABELS[newsletter.channel]}
          </div>
          <h1 style={{ ...styles.title, fontSize: isMobile ? '22px' : '26px' }}>
            {newsletter.title}
          </h1>
        </div>

        <div
          style={styles.messageContent}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsletter.message) }}
        />

        {newsletter.images?.length > 0 && (
          <div style={{ ...styles.imageGallery, flexDirection: isMobile ? 'column' : 'row' }}>
            {newsletter.images.map(img => (
              <div key={img.id} style={styles.imageWrapper}>
                <img src={newslettersApi.getFileUrl(img.image)} alt="" style={styles.img} />
              </div>
            ))}
          </div>
        )}

        <div style={{ ...styles.metaGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <InfoBlock label="Аудитория" value={newsletter.only_paid ? 'Только оплатившие' : 'Все пользователи'} />
          {newsletter.scheduled_at && (
            <InfoBlock label="Время отправки" value={safeLocaleDate(newsletter.scheduled_at)} />
          )}
        </div>

        {isScheduled && (
          <div style={styles.actionBox}>
            <Button
              variant="danger"
              onClick={() => setConfirmCancel(true)}
              loading={canceling}
              fullWidth
            >
              Отменить рассылку
            </Button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {!isScheduled && (
        <div style={styles.statsSection}>
          <h2 style={styles.sectionTitle}>Статистика</h2>
          <div style={{ ...styles.statsGrid, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <StatCard label="Всего" value={newsletter.total} color={colors.primary} />
            <StatCard label="Отправлено" value={newsletter.sent} color={colors.successText} />
            <StatCard label="Ошибки" value={newsletter.failed} color={colors.errorText} />
            <StatCard label="Прогресс" value={`${Math.round(newsletter.progress)}%`} color="#000" />
          </div>
        </div>
      )}

      {/* Tasks Tables */}
      {sentTasks.length > 0 && (
        <TasksTable
          title="Успешно отправленные"
          subtitle="Пользователи, которые получили рассылку"
          rows={sentTasks}
          kind="sent"
          isMobile={isMobile}
        />
      )}

      {failedTasks.length > 0 && (
        <TasksTable
          title="Не отправленные"
          subtitle="Пользователи, которым не удалось отправить сообщение"
          rows={failedTasks}
          kind="failed"
          isMobile={isMobile}
        />
      )}

      {sentTasks.length === 0 && failedTasks.length === 0 && !isScheduled && (
        <EmptyStateCard
          title="Пока нет данных"
          description="Рассылка еще не началась или данные загружаются"
        />
      )}

      {/* Modals */}
      <ConfirmModal
        open={confirmCancel}
        title="Отмена рассылки"
        message="Вы уверены, что хотите отменить эту рассылку?"
        description="Это действие нельзя будет отменить."
        confirmText="Отменить рассылку"
        cancelText="Назад"
        loading={canceling}
        onConfirm={handleCancelNewsletter}
        onClose={() => setConfirmCancel(false)}
      />

      <NoticeModal
        open={notice.open}
        type={notice.type}
        text={notice.text}
        onClose={() => setNotice({ ...notice, open: false })}
      />
    </div>
  );
}

// Helper components
const InfoBlock = ({ label, value }) => (
  <div style={styles.infoBlock}>
    <div style={styles.infoLabel}>{label}</div>
    <div style={styles.infoValue}>{value}</div>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div style={styles.statCard}>
    <div style={styles.statLabel}>{label}</div>
    <div style={{ ...styles.statValue, color }}>{value}</div>
  </div>
);

const TasksTable = ({ title, subtitle, rows, kind, isMobile }) => (
  <div style={styles.tableSection}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    <p style={styles.sectionSubtitle}>{subtitle}</p>
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Пользователь</th>
            <th style={{ ...styles.th, textAlign: 'center' }}>
              {kind === 'sent' ? 'Время' : 'Ошибка'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(task => (
            <tr key={task.id} style={styles.tr}>
              <td style={{ ...styles.tdStrong, padding: isMobile ? '12px 16px' : '14px 20px' }}>
                {task.user?.username || `ID: ${task.user?.id}`}
                {kind === 'sent' && <DeliveryStatusInline task={task} />}
              </td>
              <td style={{
                ...(kind === 'sent' ? styles.tdDate : styles.tdError),
                textAlign: 'center',
                padding: isMobile ? '12px 16px' : '14px 20px'
              }}>
                {kind === 'sent' ? safeLocaleDate(task.sent_at) : task.error_message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Styles
const styles = {
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: colors.gray400,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'Montserrat',
  },
  mainCard: {
    background: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    boxShadow: shadows.card,
    border: `1px solid ${colors.gray100}`,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  channelTag: {
    fontSize: '11px',
    fontWeight: 800,
    color: colors.primary,
    opacity: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontWeight: 800,
    color: colors.primary,
    margin: 0,
  },
  messageContent: {
    fontSize: '15px',
    lineHeight: 1.6,
    fontWeight: 500,
    marginBottom: spacing.xl,
    whiteSpace: 'pre-wrap',
  },
  imageGallery: {
    display: 'flex',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  imageWrapper: {
    flex: 1,
    aspectRatio: '4/5',
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    border: `1px solid ${colors.gray100}`,
    background: colors.gray50,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  metaGrid: {
    display: 'grid',
    gap: spacing.lg,
    paddingTop: spacing.lg,
    borderTop: `1px solid ${colors.gray50}`,
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '11px',
    color: colors.gray400,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: '14px',
    color: colors.primary,
    fontWeight: 600,
  },
  actionBox: {
    marginTop: spacing.xl,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: colors.gray400,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    display: 'grid',
    gap: spacing.md,
  },
  statCard: {
    background: '#fcfcfc',
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    textAlign: 'center',
    border: `1px solid ${colors.gray200}`,
  },
  statLabel: {
    fontSize: '11px',
    color: colors.gray400,
    fontWeight: 700,
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 800,
  },
  tableSection: {
    marginBottom: spacing.xl,
  },
  tableWrapper: {
    background: colors.white,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    border: `1px solid ${colors.gray100}`,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 20px',
    background: colors.gray50,
    color: colors.gray500,
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  tr: {
    borderBottom: `1px solid ${colors.gray50}`,
  },
  tdStrong: {
    fontSize: '14px',
    color: colors.primary,
    fontWeight: 700,
  },
  tdDate: {
    fontSize: '13px',
    color: colors.gray600,
    fontWeight: 600,
  },
  tdError: {
    fontSize: '12px',
    color: colors.errorText,
    fontWeight: 600,
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    width: '160px',
    textAlign: 'center',
    zIndex: 10,
    boxShadow: shadows.md,
    lineHeight: 1.3,
    fontWeight: 500,
  },
  tooltipArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '5px',
    borderStyle: 'solid',
    borderColor: '#333 transparent transparent transparent',
  },
};
