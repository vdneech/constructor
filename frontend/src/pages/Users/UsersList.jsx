// src/pages/Users/UsersList.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { usersApi } from '../../services/api';
import {
  Button,
  Input,
  Checkbox,
  NoticeModal,
  ConfirmModal,
  Badge,
  LineNumberTextarea,
  PageHeader,
  EmptyStateCard
} from '../../components/common';
import PageLayout from '../../components/PageLayout';
import { useIsMobile, usePageData } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/theme';

export default function UsersList() {
  const isMobile = useIsMobile();

  // --- State: Pagination ---
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // --- State: Modals ---
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [extrasText, setExtrasText] = useState('{}');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [cleanRegistrationsOpen, setCleanRegistrationsOpen] = useState(false);
  const [cleanPaymentsOpen, setCleanPaymentsOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });

  const [localUsers, setLocalUsers] = useState([]);

  const fetchUsers = useCallback(() => {
    return usersApi.list({ params: { page } });
  }, [page]);

  const { data, loading, error, retry } = usePageData(fetchUsers, [page]);

  // Обновляем список при получении данных
  useEffect(() => {
    if (data) {
      const results = data.results || data || [];
      setLocalUsers(results);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    }
  }, [data]);

  // Обработка 404
  useEffect(() => {
    if (error && error.originalError?.response?.status === 404 && page > 1) {
      setPage(1);
    }
  }, [error, page]);

  // --- Handlers: Pagination ---
  const handleNext = () => { if (hasNext) setPage(p => p + 1); };
  const handlePrev = () => { if (hasPrev) setPage(p => Math.max(1, p - 1)); };

  // --- Handlers: Edit ---
  const openEdit = (user) => {
    setModalError(null);
    setEditUser({ ...user }); // Копируем пользователя
    const extras = user?.extras && typeof user.extras === 'object' ? user.extras : {};
    setExtrasText(JSON.stringify(extras, null, 2));
    setEditOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setModalError(null);

    let extrasObj = {};
    try {
      extrasObj = extrasText.trim() ? JSON.parse(extrasText) : {};
    } catch (parseErr) {
      setModalError(`Ошибка JSON: ${parseErr.message}`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: editUser.username,
        first_name: editUser.first_name, // Новое поле
        last_name: editUser.last_name,   // Новое поле
        email: editUser.email,
        phone: editUser.phone,
        is_registered: !!editUser.is_registered,
        paid: !!editUser.paid,
        extras: extrasObj,
      };

      await usersApi.update(editUser.id, payload);
      setEditOpen(false);
      setNotice({ open: true, type: 'success', text: `Пользователь ${editUser.username} обновлен` });
      retry();
    } catch (err) {
      setModalError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const formatExtras = () => {
    try {
      const obj = extrasText.trim() ? JSON.parse(extrasText) : {};
      setExtrasText(JSON.stringify(obj, null, 2));
      setModalError(null);
    } catch (e) {
      setModalError(`Невалидный JSON: ${e.message}`);
    }
  };

  // --- Handlers: Delete ---
  const openDelete = (user) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await usersApi.remove(deleteUser.id);
      setDeleteOpen(false);
      setNotice({ open: true, type: 'success', text: 'Пользователь удален' });
      if (editOpen && editUser?.id === deleteUser.id) {
        setEditOpen(false);
      }
      retry();
    } catch (err) {
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
    } finally {
      setDeleting(false);
    }
  };

  // --- Handlers: Batch Actions ---
  const handleBatchAction = async (actionType) => {
    setCleaning(true);
    try {
      if (actionType === 'registrations') {
        await usersApi.cleanRegistrations();
        setCleanRegistrationsOpen(false);
      } else {
        await usersApi.cleanPayments();
        setCleanPaymentsOpen(false);
      }
      setNotice({ open: true, type: 'success', text: 'Операция выполнена успешно' });
      retry();
    } catch (err) {
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
    } finally {
      setCleaning(false);
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: spacing.md,
    maxWidth: '100%',
    width: '100%',
  };

  return (
    <PageLayout loading={loading} error={error} onRetry={retry}>
      <div style={pageStyles.page}>
        <div style={pageStyles.container}>
          <PageHeader
            title="Пользователи"
            subtitle="Управление базой пользователей"
            isMobile={isMobile}
            actions={
              <div style={{ display: 'flex', gap: spacing.sm, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                <Button variant="primary" onClick={() => setCleanRegistrationsOpen(true)} disabled={loading} fullWidth={isMobile}>
                  Сброс регистраций
                </Button>
                <Button variant="primary" onClick={() => setCleanPaymentsOpen(true)} disabled={loading} fullWidth={isMobile}>
                  Сброс оплат
                </Button>
              </div>
            }
          />

          {localUsers.length === 0 ? (
            <EmptyStateCard title="Список пуст" description="Пользователи еще не добавлены в базу." isMobile={isMobile} />
          ) : (
            <>
              <div style={gridStyle}>
                {localUsers.map((user) => (
                  <UserCard key={user.id} user={user} isMobile={isMobile} onEdit={() => openEdit(user)} />
                ))}
              </div>

              <div style={styles.pagination}>
                <Button variant="secondary" disabled={!hasPrev || loading} onClick={handlePrev}>← Назад</Button>
                <div style={styles.pageNumber}>{page}</div>
                <Button variant="secondary" disabled={!hasNext || loading} onClick={handleNext}>Вперед →</Button>
              </div>
            </>
          )}
        </div>

        {/* СПЕЦИАЛЬНАЯ БЕЛАЯ МОДАЛКА РЕДАКТИРОВАНИЯ */}
        <UserEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Редактирование пользователя"
        >
          <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

            {/* Имя пользователя */}
            <Input
              label="Имя пользователя"
              required
              value={editUser?.username || ''}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
            />

            {/* Имя и Фамилия (2 колонки на ПК) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing.md }}>
               <Input
                label="Имя"
                required
                value={editUser?.first_name || ''}
                onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
              />
              <Input
                label="Фамилия"
                required
                value={editUser?.last_name || ''}
                onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
              />
            </div>

            {/* Email и Телефон (2 колонки на ПК) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing.md }}>
              <Input
                label="Email"
                type="email"
                value={editUser?.email || ''}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <Input
                label="Телефон"
                value={editUser?.phone || ''}
                onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              />
            </div>

            {/* Чекбоксы */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, padding: '8px 0' }}>
              <Checkbox
                checked={!!editUser?.is_registered}
                onChange={() => setEditUser({ ...editUser, is_registered: !editUser.is_registered })}
                title="Зарегистрирован"
                description="Пользователь прошел процесс регистрации"
              />
              <Checkbox
                checked={!!editUser?.paid}
                onChange={() => setEditUser({ ...editUser, paid: !editUser.paid })}
                title="Оплачено"
                description="Пользователь оплатил участие"
              />
            </div>

            {/* JSON Extras */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={styles.label}>Дополнительные данные (JSON)</label>
                <Button
                  variant="secondary"
                  onClick={formatExtras}
                  type="button"
                  style={{ padding: '4px 10px', height: 'auto', fontSize: 12 }}
                >
                  Форматировать
                </Button>
              </div>
              <LineNumberTextarea
                value={extrasText}
                onChange={(e) => setExtrasText(e.target.value)}
                rows={6}
                placeholder='{"key": "value"}'
              />
            </div>

            {modalError && <div style={styles.errorBox}>{modalError}</div>}

            {/* Кнопки действий */}
            <div style={{
               display: 'flex',
               flexDirection: isMobile ? 'column-reverse' : 'row', // На мобилках кнопки друг под другом
               justifyContent: 'space-between',
               gap: spacing.md,
               marginTop: spacing.md
            }}>
              <Button
                variant="secondary"
                onClick={() => { setEditOpen(false); openDelete(editUser); }}
                type="button"
                fullWidth={isMobile}
                style={{color: colors.error}}
              >
                Удалить
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={saving}
                fullWidth={isMobile}
              >
                Сохранить изменения
              </Button>
            </div>
          </form>
        </UserEditModal>

        <ConfirmModal
          open={deleteOpen}
          title="Удаление пользователя"
          message={`Вы уверены, что хотите удалить ${deleteUser?.username}?`}
          description="Это действие нельзя отменить."
          confirmText="Удалить"
          cancelText="Отмена"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteOpen(false)}
        />
        <ConfirmModal open={cleanRegistrationsOpen} title="Сброс регистраций" message="Сбросить все регистрации?" confirmText="Сбросить" loading={cleaning} onConfirm={() => handleBatchAction('registrations')} onClose={() => setCleanRegistrationsOpen(false)} />
        <ConfirmModal open={cleanPaymentsOpen} title="Сбросить все оплаты" message="Отменить все оплаты пользователей?" description="Это действие нельзя отменить" confirmText="Сбросить" loading={cleaning} onConfirm={() => handleBatchAction('payments')} onClose={() => setCleanPaymentsOpen(false)} />
        <NoticeModal open={notice.open} type={notice.type} text={notice.text} onClose={() => setNotice({ ...notice, open: false })} />
      </div>
    </PageLayout>
  );
}

// --- СПЕЦИАЛЬНЫЙ КОМПОНЕНТ БЕЛОЙ МОДАЛКИ ДЛЯ ФОРМЫ ---
function UserEditModal({ open, title, onClose, children }) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setTimeout(() => setShow(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        opacity: show ? 1 : 0, transition: 'opacity 0.3s ease',
      }}
      onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: '#FFFFFF', // Белый фон
        color: '#1F2937',           // Темный текст
        width: '100%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex', flexDirection: 'column', position: 'relative',
        transform: show ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }} onClick={e => e.stopPropagation()}>

        {/* Шапка модалки */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #E5E7EB',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: typography.fontFamily }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', padding: 4, display: 'flex'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Тело модалки */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// --- КАРТОЧКА ПОЛЬЗОВАТЕЛЯ (Без изменений) ---
function UserCard({ user, isMobile, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: isHovered && !isMobile ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered && !isMobile ? shadows.md : shadows.card,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onEdit}
    >
      <div style={styles.cardHeader}>
        <div style={{marginLeft: spacing.xs, color: colors.primary}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-fill-gear" viewBox="0 0 16 16">
            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
          </svg>
        </div>
        <div style={styles.headerInfo}>
          <div style={styles.usernameRow}>
            <span style={styles.username} title={user.username}>{ user.first_name || 'Гость'} {user.last_name}</span>
            {user.is_superuser && <label style={styles.adminLabel} htmlFor="">Администратор</label>}
            <label style={styles.userLabel} htmlFor="">@{user.username || 'unknown'}</label>
          </div>
        </div>
      </div>

      <div style={styles.infoGrid}>
        <InfoRow label="EMAIL" value={user.email} />
        <InfoRow label="ТЕЛЕФОН" value={user.phone} />
      </div>

      <div style={styles.badges}>
        <Badge variant={user.is_registered ? 'success' : 'inactive'} style={styles.fullWidthBadge}>Регистрация</Badge>
        <Badge variant={user.paid ? 'warning' : 'inactive'} style={styles.fullWidthBadge}>Оплата</Badge>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <span style={{ color: colors.gray400, fontSize: 12, fontWeight: 800 }}>{label}</span>
    <span style={{ color: colors.text, fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
  </div>
);

const styles = {
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },
  pageNumber: { fontSize: 14, fontWeight: 600, color: colors.gray500 },
  card: {
    background: colors.white,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    padding: spacing.md,
    border: `1px solid ${colors.gray100}`,
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    position: 'relative',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  headerInfo: { flex: 1, overflow: 'hidden' },
  usernameRow: { display: 'flex', flexDirection: 'column' },
  userLabel: { fontWeight: 600, fontSize: 12, color: colors.gray400 },
  adminLabel: { fontWeight: 600, fontSize: 12, color: colors.gray500 },
  username: { fontSize: 16, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.md, background: colors.gray50, padding: spacing.sm, borderRadius: borderRadius.medium },
  badges: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xs, marginTop: 'auto' },
  fullWidthBadge: { width: '100%', display: 'flex', justifyContent: 'center', padding: '6px 4px', boxSizing: 'border-box' },
  label: { fontSize: 14, fontWeight: 500, color: colors.gray500, },
  errorBox: { background: colors.errorBg, color: colors.errorText, padding: spacing.md, borderRadius: borderRadius.medium, fontSize: 13 },
};
