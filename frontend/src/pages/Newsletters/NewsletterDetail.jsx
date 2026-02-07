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
  PageHeader,
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';
import { pageStyles } from "../../styles/pageStyles";

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
  if (task.status !== 'sent' || !channel) return null;

  const isBoth = channel === 'both';
  const isTg = channel === 'telegram';
  const isEmail = channel === 'email';

  const getTooltipText = () => {
    if (isBoth) return "Доставлено по обоим каналам";
    if (isTg) return "Доставлено только в Telegram";
    if (isEmail) return "Доставлено только на Email";
    return "Статус отправки не определен";
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 8, verticalAlign: 'middle' }} ref={tooltipRef}>
      <div
        onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <svg width={isBoth ? "20" : "18"} height={isBoth ? "20" : "18"} fill={colors.successText} viewBox="0 0 16 16">
          {isBoth
            ? <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
            : <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
          }
        </svg>
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
      setNotice({ open: true, type: 'error', text: normalizeApiError(err) });
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
    await newslettersApi.remove(id); // Теперь этот метод существует
    setNotice({ open: true, type: 'success', text: 'Рассылка успешно отменена.' });
    setTimeout(() => navigate('/newsletters'), 1500);
  } catch (err) {
    // ВАЖНО: берем только строку message
    const apiError = normalizeApiError(err);
    setNotice({
      open: true,
      type: 'error',
      text: apiError.message || 'Произошла неизвестная ошибка'
    });
  } finally {
    setCanceling(false);
  }
}, [id, navigate]);

  const sentTasks = useMemo(() => newsletter?.tasks?.filter(t => t.status === 'sent') || [], [newsletter]);
  const failedTasks = useMemo(() => newsletter?.tasks?.filter(t => t.status === 'failed') || [], [newsletter]);

  if (loading) return <div style={styles.center}><Spinner size={40} /></div>;
  if (!newsletter) return null;

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <button onClick={() => navigate('/newsletters')} style={styles.backBtn}>
          ← Назад к списку
        </button>

        <PageHeader
            title={`${newsletter.title}`}
            subtitle={`${STATUS_MAP[newsletter.status]?.label}`}
          isMobile={isMobile}

        />

        <div style={styles.mainContent}>
          {/* Левая колонка - Контент */}
          <div style={styles.leftCol}>
            <div style={styles.contentCard}>
               <div style={styles.channelRow}>
                <span style={styles.nsTitle}>{newsletter.title}</span>
              </div>

              <div
                style={styles.messageBody}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsletter.message) }}
              />

              {newsletter.images?.length > 0 && (
                <div style={styles.imageGallery}>
                  {newsletter.images.map(img => (
                    <div key={img.id} style={styles.imageWrapper}>
                      <img src={newslettersApi.getFileUrl(img.image)} alt="" style={styles.img} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Правая колонка - Параметры и Статистика */}
          <div style={styles.rightCol}>
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Параметры</h3>
              <InfoBlock label="Аудитория" value={newsletter.only_paid ? 'Оплатившие' : 'Все пользователи'} />
              <InfoBlock label="Запланировано на" value={safeLocaleDate(newsletter.scheduled_at) || 'Мгновенно'} />
              <InfoBlock label="Канал отправки" value={CHANNEL_LABELS[newsletter.channel]} />

              {newsletter.status === 'scheduled' && (
                <Button
                  variant="danger"
                  onClick={() => setConfirmCancel(true)}
                  loading={canceling}
                  fullWidth
                  style={{marginTop: spacing.md}}
                >
                  Отменить
                </Button>
              )}
            </div>

            {newsletter.status !== 'scheduled' && (
              <div style={styles.sideCard}>
                <h3 style={styles.sideTitle}>Статистика</h3>
                <div style={styles.statsList}>
                   <StatRow label="Всего" value={newsletter.total} />
                   <StatRow label="Успешно" value={newsletter.sent} color={colors.gray500} />
                   <StatRow label="Ошибки" value={newsletter.failed} color={colors.gray300} />
                </div>
              </div>
            )}
          </div>

            {/* Таблицы пользователей */}
            {!newsletter.status === 'scheduled' || newsletter.tasks?.length > 0 ? (
              <div style={styles.tablesSection}>
                {sentTasks.length > 0 && (
                  <TasksTable title="Успешно отправлено" rows={sentTasks} kind="sent" isMobile={isMobile} />
                )}
                {failedTasks.length > 0 && (
                  <TasksTable title="Отправлено с ошибкой" rows={failedTasks} kind="failed" isMobile={isMobile} />
                )}
              </div>
            ) : null}
          </div>


        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Отмена рассылки"
        message={`Отменить рассылку "${newsletter.title}"?`}
        description="Это действие нельзя будет отменить"
        confirmText="Да, отменить"
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

const InfoBlock = ({ label, value }) => (
  <div style={styles.infoBlock}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

const StatRow = ({ label, value, color }) => (
  <div style={styles.statRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={{ ...styles.statValue, color: color || colors.primary }}>{value}</span>
  </div>
);

const TasksTable = ({ title, rows, kind, isMobile }) => (
  <div style={styles.tableContainer}>
    <h4 style={styles.tableTitle}>{title} — {rows.length}</h4>
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
          </tr>
        </thead>
        <tbody>
          {rows.map(task => (
            <tr key={task.id} style={styles.tr}>
              <td style={styles.tdUser}>
                {task.user?.username || `ID: ${task.user?.id}`}
                {kind === 'sent' && <DeliveryStatusInline task={task} />}
              </td>
              <td style={{ ...styles.tdMeta, textAlign: 'right', color: kind === 'failed' ? colors.danger : colors.gray500 }}>
                {kind === 'sent' ? safeLocaleDate(task.sent_at) : task.error_message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const styles = {
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  topNav: { marginBottom: spacing.sm },
  backBtn: {
    background: 'none',
    border: 'none',
    color: colors.gray400,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '16px',
    fontSize: '14px',
    fontFamily: 'Montserrat',
  },
  mainContent: {
    display: 'flex',
    flexDirection: window.innerWidth < 992 ? 'column' : 'row',
    marginTop: spacing.lg
  },
  leftCol: { flex: 2, minWidth: 0 },
  rightCol: { flex: 1, display: 'flex', flexDirection: 'column',},

  contentCard: {
    background: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    border: `1px solid ${colors.gray100}`,
    marginBottom: spacing.xl
  },
  channelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: spacing.md, alignItems: 'center' },
  channelLabel: { fontSize: '13px', fontWeight: 800, color: colors.gray400, textTransform: 'uppercase', textAlign: 'center' },
  nsTitle: { fontSize: '15px', fontWeight: 700, color: colors.primary, },

  messageBody: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: colors.primary,
    fontWeight: 500,
    whiteSpace: 'pre-wrap',
    marginBottom: spacing.xl
  },
  imageGallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: spacing.md },
  imageWrapper: { aspectRatio: '1', borderRadius: borderRadius.medium, overflow: 'hidden', border: `1px solid ${colors.gray100}` },
  img: { width: '100%', height: '100%', objectFit: 'cover' },

  sideCard: {
    background: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    border: `1px solid ${colors.gray100}`,
    marginBottom: spacing.md,
  },
  sideTitle: { fontSize: '14px', fontWeight: 800, color: colors.primary, textTransform: 'uppercase', marginBottom: spacing.md, borderBottom: `1px solid ${colors.gray50}`, paddingBottom: spacing.xs },

  infoBlock: { marginBottom: spacing.md, display: 'flex', flexDirection: 'column' },
  infoLabel: { fontSize: '12px', fontWeight: 800, color: colors.gray400, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: '14px', fontWeight: 600, color: colors.primary },

  statsList: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statValue: { fontSize: '16px', fontWeight: 800 },

  tablesSection: { display: 'flex', flexDirection: 'column', gap: spacing.xl },
  tableContainer: { },
  tableTitle: { fontSize: '14px', fontWeight: 800, color: colors.primary, textTransform: 'uppercase', marginBottom: spacing.md, textAlign: 'center' },
  tableWrapper: {
    background: colors.white,
    borderRadius: borderRadius.card,
    border: `1px solid ${colors.gray100}`,
    overflow: 'visible' //
},
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 20px', background: colors.gray50, color: colors.gray500, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' },
  tr: { borderBottom: `1px solid ${colors.gray50}` },
  tdUser: { padding: '12px 20px', fontSize: '14px', fontWeight: 700, color: colors.primary },
  tdMeta: { padding: '12px 20px', fontSize: '12px', fontWeight: 600 },

  tooltip: {
    position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#333', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '11px',
    width: '160px', textAlign: 'center', zIndex: 10, boxShadow: shadows.md, lineHeight: 1.3
  },
  tooltipArrow: {
    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
    borderWidth: '5px', borderStyle: 'solid', borderColor: '#333 transparent transparent transparent'
  },
};