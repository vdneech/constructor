// pages/Users/UsersList.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usersApi } from '../../services/api';
import { 
  Button, 
  Input, 
  Checkbox, 
  OverlayModal, 
  NoticeModal,
  ConfirmModal,
  Badge,
  IconButton,
  LineNumberTextarea,
  EditIcon,
  DeleteIcon,
  PageHeader,
  ErrorPage,
  NetworkErrorPage,
  Spinner
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { colors, typography, shadows, borderRadius, spacing } from '../../styles/theme';



/* ---------- MAIN COMPONENT ---------- */



export default function UsersList() {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);


  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [extrasText, setExtrasText] = useState('{}');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);


  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);


  const [cleanRegistrationsOpen, setCleanRegistrationsOpen] = useState(false);
  const [cleanPaymentsOpen, setCleanPaymentsOpen] = useState(false);
  const [cleaningRegistrations, setCleaningRegistrations] = useState(false);
  const [cleaningPayments, setCleaningPayments] = useState(false);
  const [cleanError, setCleanError] = useState(null);


  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState('');


  const isMobile = useIsMobile();



  // Effects
  useEffect(() => {
    loadUsers();
  }, []);



  // Handlers
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);


    try {
      const data = await usersApi.list();


      let results = [];
      if (data?.results) {
        results = data.results;


        let next = data.next;
        while (next) {
          const page = await fetch(next, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          }).then((r) => r.json());
          results = [...results, ...(page?.results || [])];
          next = page?.next;
        }
      } else if (Array.isArray(data)) {
        results = data;
      }


      // Показываем всех пользователей, включая суперюзеров
      setUsers(results);
    } catch (e) {
      console.error(e);
      setLoadError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }, []);


  const openEdit = useCallback((user) => {
    setEditError(null);
    setEditUser({ ...user });


    const extras = user?.extras && typeof user.extras === 'object' ? user.extras : {};
    setExtrasText(JSON.stringify(extras, null, 2));
    setEditOpen(true);
  }, []);


  const closeEdit = useCallback(() => {
    if (saving) return;
    setEditOpen(false);
    setEditUser(null);
    setExtrasText('{}');
    setEditError(null);
  }, [saving]);


  const openDelete = useCallback((user) => {
    setDeleteError(null);
    setDeleteUser(user);
    setDeleteOpen(true);
  }, []);


  const closeDelete = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteUser(null);
    setDeleteError(null);
  }, [deleting]);


  const openCleanRegistrations = useCallback(() => {
    setCleanError(null);
    setCleanRegistrationsOpen(true);
  }, []);


  const closeCleanRegistrations = useCallback(() => {
    if (cleaningRegistrations) return;
    setCleanRegistrationsOpen(false);
    setCleanError(null);
  }, [cleaningRegistrations]);


  const openCleanPayments = useCallback(() => {
    setCleanError(null);
    setCleanPaymentsOpen(true);
  }, []);


  const closeCleanPayments = useCallback(() => {
    if (cleaningPayments) return;
    setCleanPaymentsOpen(false);
    setCleanError(null);
  }, [cleaningPayments]);


  const formatExtras = useCallback(() => {
    try {
      const obj = extrasText.trim() ? JSON.parse(extrasText) : {};
      setExtrasText(JSON.stringify(obj, null, 2));
      setEditError(null);
    } catch (e) {
      setEditError(`Настраиваемые поля: невалидный JSON\n${e.message}`);
    }
  }, [extrasText]);


  const handleSaveUser = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editUser) return;


      setEditError(null);


      let extrasObj = {};
      try {
        extrasObj = extrasText.trim() ? JSON.parse(extrasText) : {};
      } catch (parseErr) {
        setEditError(`Extras: невалидный JSON\n${parseErr.message}`);
        return;
      }


      if (extrasObj === null || Array.isArray(extrasObj) || typeof extrasObj !== 'object') {
        setEditError('Extras: должен быть JSON-объектом (например {"has_cat": "да"})');
        return;
      }


      setSaving(true);
      try {
        const payload = {
          username: editUser.username,
          email: editUser.email,
          phone: editUser.phone,
          is_registered: !!editUser.is_registered,
          paid: !!editUser.paid,
          extras: extrasObj,
        };


        await usersApi.update(editUser.id, payload);
        await loadUsers();


        setEditOpen(false);
        setSuccessText(`Пользователь @${editUser.username} обновлён`);
        setSuccessOpen(true);
      } catch (err) {
        console.error(err);
        setEditError(parseApiError(err));
      } finally {
        setSaving(false);
      }
    },
    [editUser, extrasText, loadUsers]
  );


  const handleConfirmDelete = useCallback(async () => {
    if (!deleteUser) return;


    setDeleteError(null);
    setDeleting(true);
    try {
      await usersApi.remove(deleteUser.id);
      await loadUsers();


      setDeleteOpen(false);
      setSuccessText(`Пользователь @${deleteUser.username} удалён`);
      setSuccessOpen(true);
    } catch (err) {
      console.error(err);
      setDeleteError(parseApiError(err));
    } finally {
      setDeleting(false);
    }
  }, [deleteUser, loadUsers]);


  const handleDeleteFromEdit = useCallback(() => {
    if (!editUser) return;
    
    // Закрываем модалку редактирования и открываем модалку подтверждения удаления
    setDeleteUser(editUser);
    setEditOpen(false);
    setDeleteOpen(true);
  }, [editUser]);


  const handleConfirmCleanRegistrations = useCallback(async () => {
    setCleanError(null);
    setCleaningRegistrations(true);
    try {
      await usersApi.cleanRegistrations();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setCleanError(parseApiError(err));
    } finally {
      setCleaningRegistrations(false);
    }
  }, []);


  const handleConfirmCleanPayments = useCallback(async () => {
    setCleanError(null);
    setCleaningPayments(true);
    try {
      await usersApi.cleanPayments();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setCleanError(parseApiError(err));
    } finally {
      setCleaningPayments(false);
    }
  }, []);



  // Computed
  // Computed
  const list = useMemo(() => users, [users]);

  // --- ЛОГИКА ОБРАБОТКИ ОШИБОК И ЗАГРУЗКИ ---

  if (loadError) {
    // Преобразуем ошибку в строку для надежного поиска подстрок
    const currentError = String(loadError);

    // 1. Проверка на сетевую ошибку (Network Error)
    if (
      currentError.includes('Network Error') || 
      currentError.includes('сетевая') || 
      currentError.includes('Failed to fetch') ||
      currentError === 'null' // Если parseApiError вернул строку "null"
    ) {
      return <NetworkErrorPage onRetry={loadUsers} />;
    }

    // 2. Проверка на обычные серверные ошибки (4xx, 5xx)
    return (
      <ErrorPage 
        code="500" 
        title="Ошибка загрузки" 
        message={currentError} 
      />
    );
  }

  // 3. Состояние загрузки (Spinner теперь импортирован выше)
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: colors.background,
      }}>
        <Spinner size={40} />
        <div style={{ marginTop: 20, color: colors.gray500, fontWeight: 500 }}>
          Загрузка пользователей...
        </div>
      </div>
    );
  }

    
if (loading) {
  return (
    <div style={styles.center}>
      <Spinner size={40} />
      <div style={{ marginTop: 20, color: colors.gray500 }}>Загрузка пользователей...</div>
    </div>
  );
}
  // JSX
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* Header */}
        <PageHeader
          title="Пользователи"
          subtitle="Для редактирования нажмите на карточку"
          isMobile={isMobile}
          actionsInline={true}
          actions={
              <>
                <Button

                  onClick={openCleanRegistrations}
                  style={isMobile ? { width: '100%' } : {}}
                >
                  Стереть все регистрации
                </Button>
                <Button 
                  onClick={openCleanPayments}
                  style={isMobile ? { width: '100%' } : {}}
                >
                  Убрать все оплаты
                </Button>
              </>
            }
        />


        {/* Main Card */}
        <div style={{ ...styles.card, ...(isMobile && styles.cardMobile) }}>
          


          {loading ? (
            <div style={styles.muted}>Загрузка...</div>
          ) : list.length === 0 ? (
            <div style={styles.muted}>Пользователи не найдены</div>
          ) : (
            <div style={styles.list}>
              {list.map((u) => {
                const usernameAt = u.username ? `@${u.username}` : '—';
                const phone = (u.phone || '').trim();


                return (
                  <div key={u.id} style={{ ...styles.row, ...(isMobile && styles.rowMobile) }}>
                    {/* Left Side - User Info */}
                    <div 
                      style={{ 
                        ...styles.left, 
                        ...(isMobile && styles.leftMobile),
                        ...(isMobile && !u.is_superuser && styles.leftClickable)
                      }}
                      onClick={isMobile && !u.is_superuser ? () => openEdit(u) : undefined}
                    >
                      <div style={styles.usernameRow}>
                        <div style={styles.username}>{usernameAt}</div>
                        {u.is_superuser && (
                          <Badge 
                            variant="primary"
                            style={styles.adminBadge}
                          >
                            Админ
                          </Badge>
                        )}
                      </div>


                      <div style={{ ...styles.badges, ...(isMobile && styles.badgesMobile) }}>
                        {/* Registration Status */}
                        {u.is_registered ? (
                          <Badge 
                            variant="primary"
                            style={isMobile ? styles.badgeMobile : {}}
                          >
                            Зарегистрирован
                          </Badge>
                        ) : (
                          <Badge 
                            style={{
                              background: colors.background,
                              border: `2px dashed ${colors.gray300}`,
                              color: colors.gray500,
                              ...(isMobile && styles.badgeMobile),
                            }}
                          >
                            Не зарегистрирован
                          </Badge>
                        )}


                        {/* Payment Status */}
                        {u.paid ? (
                          <Badge 
                            variant="primary"
                            style={isMobile ? styles.badgeMobile : {}}
                          >
                            Оплачено
                          </Badge>
                        ) : (
                          <Badge 
                            style={{
                              background: colors.background,
                              border: `2px dashed ${colors.gray300}`,
                              color: colors.gray500,
                              ...(isMobile && styles.badgeMobile),
                            }}
                          >
                            Не оплачено
                          </Badge>
                        )}


                        {/* Phone */}
                        {phone ? (
                          <Badge 
                            href={`tel:${phone}`}
                            style={{
                              background: colors.background,
                              border: `1px solid ${colors.gray200}`,
                              color: colors.primary,
                              ...(isMobile && styles.badgeMobile),
                            }}
                          >
                            {phone}
                          </Badge>
                        ) : (
                          <Badge 
                            style={{
                              background: colors.background,
                              border: `1px solid ${colors.gray200}`,
                              color: colors.gray400,
                              ...(isMobile && styles.badgeMobile),
                            }}
                          >
                            Телефон: —
                          </Badge>
                        )}
                      </div>
                    </div>


                    {/* Right Side - Action Buttons (только на десктопе и не для админов) */}
                    {!isMobile && !u.is_superuser && (
                      <div style={styles.right}>
                        <IconButton
                          icon={<DeleteIcon size={18} />}
                          variant="secondary"
                          title="Удалить пользователя"
                          onClick={() => openDelete(u)}
                        />
                        <IconButton
                          icon={<EditIcon size={18} />}
                          variant="primary"
                          title="Изменить пользователя"
                          onClick={() => openEdit(u)}
                        />
                        
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Edit Modal */}
        <OverlayModal open={editOpen} title="Редактирование пользователя" onClose={closeEdit}>
          <form onSubmit={handleSaveUser} style={styles.form}>
            


            <Input
              label="Имя пользователя"
              type="text"
              required
              value={editUser?.username || ''}
              onChange={(e) => setEditUser((prev) => ({ ...prev, username: e.target.value }))}
            />


            <div style={{ ...styles.row2, ...(isMobile && styles.row2Mobile) }}>
              <Input
                label="Email"
                type="email"
                value={editUser?.email || ''}
                onChange={(e) => setEditUser((prev) => ({ ...prev, email: e.target.value }))}
              />


              <Input
                label="Телефон"
                type="text"
                value={editUser?.phone || ''}
                onChange={(e) => setEditUser((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Например: +79991234567"
              />
            </div>


            <Checkbox
              checked={!!editUser?.is_registered}
              onChange={() => setEditUser((prev) => ({ ...prev, is_registered: !prev.is_registered }))}
              title="Регистрация пройдена"
              description="Отметить, если пользователь прошёл регистрацию"
            />


            <Checkbox
              checked={!!editUser?.paid}
              onChange={() => setEditUser((prev) => ({ ...prev, paid: !prev.paid }))}
              title="Взнос оплачен"
              description="Отметить, если оплата подтверждена"
            />


            <div>
              <div style={styles.labelRow}>
                <label style={styles.label}>Настраиваемые поля</label>
                <Button 
                  variant="secondary" 
                  onClick={formatExtras}
                  style={styles.btnSmall}
                >
                  Форматировать
                </Button>
              </div>


              <LineNumberTextarea
                value={extrasText}
                onChange={(e) => setExtrasText(e.target.value)}
                rows={9}
                spellCheck={false}
                placeholder='{"has_cat": "да"}'
                hint="Должен быть JSON-объект. Можно редактировать любые ключи."
              />
            </div>


            <div style={styles.formActions}>
              <Button 
                variant="secondary" 
                onClick={handleDeleteFromEdit}
                disabled={saving || deleting}
              >
                Удалить пользователя
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                loading={saving}
                loadingText="Сохранение..."
                disabled={deleting}
              >
                Сохранить
              </Button>
            </div>
          </form>
        </OverlayModal>


        {/* Delete Modal */}
        <ConfirmModal
          open={deleteOpen}
          title="Удаление пользователя"
          message={`Вы уверены, что хотите удалить пользователя ${deleteUser?.username}?`}
          description="Это действие нельзя будет отменить."
          onClose={closeDelete}
          onConfirm={handleConfirmDelete}
          confirmText="Удалить"
          cancelText="Отмена"
          loading={deleting}
        />


        {/* Clean Registrations Modal */}
        <ConfirmModal
          open={cleanRegistrationsOpen}
          title="Стереть все регистрации"
          message="Стереть все регистрации пользователей?"
          description="Это действие нельзя отменить."
          onClose={closeCleanRegistrations}
          onConfirm={handleConfirmCleanRegistrations}
          confirmText="Стереть"
          cancelText="Отмена"
          loading={cleaningRegistrations}
          loadingText="Стираю..."
          error={cleanError}
          onErrorClose={() => setCleanError(null)}
        />


        {/* Clean Payments Modal */}
        <ConfirmModal
          open={cleanPaymentsOpen}
          title="Убрать все оплаты"
          message="Убрать все оплаты пользователей?"
          description="Это действие нельзя отменить."
          onClose={closeCleanPayments}
          onConfirm={handleConfirmCleanPayments}
          confirmText="Убрать"
          cancelText="Отмена"
          loading={cleaningPayments}
          loadingText="Убираю..."
          error={cleanError}
          onErrorClose={() => setCleanError(null)}
        />


        {/* Success Modal */}
        <NoticeModal
          open={successOpen}
          type="success"
          title="Успешно!"
          text={successText}
          onClose={() => setSuccessOpen(false)}
        />
      </div>
    </div>
  );
}



/* ---------- STYLES ---------- */
const styles = {
  // Page Layout
  page: {
    minHeight: '100vh',
    background: colors.background,
    fontFamily: typography.fontFamily,
    padding: `${spacing.xxxl}px ${spacing.lg}px`,
  },
  wrap: {
    maxWidth: '120vh',
    margin: '0 auto',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: colors.background,
  },

  // Card
  card: {
    background: colors.white,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    padding: spacing.xxxl,
  },
  cardMobile: {
    padding: spacing.lg,
    borderRadius: borderRadius.cardMobile,
  },
  muted: {
    color: colors.gray500,
    fontSize: 15,
    fontWeight: 500,
  },

  // List
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    padding: '18px 0',
    borderBottom: `1px solid ${colors.gray100}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  rowMobile: {
    padding: '14px 0',
  },
  left: {
    minWidth: 'min(520px, 100%)',
    flex: 1,
  },
  leftMobile: {
    width: '100%',
  },
  leftClickable: {
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    ':active': {
      opacity: 0.7,
    },
  },
  usernameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  username: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 600,
  },
  adminBadge: {
    fontSize: 12,
    padding: `4px ${spacing.xs}px`,
    background: colors.gray100,
    color: colors.gray400,
    borderRadius: 6,
  },
  badges: {
    marginTop: 10,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgesMobile: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    margin: '20px 0',
  },
  badgeMobile: {
    width: '100%',
    justifyContent: 'center',
  },
  right: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
  },

  // Form Elements
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },
  label: {
    display: 'block',
    marginBottom: 0,
    fontSize: 14,
    fontWeight: 600,
    color: colors.gray500,
    letterSpacing: '0.025em',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  btnSmall: {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: borderRadius.small,
    fontSize: 13,
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
    alignItems: 'end',
  },
  row2Mobile: {
    gridTemplateColumns: '1fr',
  },
  formActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.errorText,
    background: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'pre-wrap',
  },
};
