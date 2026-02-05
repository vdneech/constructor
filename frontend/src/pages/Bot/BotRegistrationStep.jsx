// pages/Bot/BotRegistrationStep.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pageStyles } from '../../styles/pageStyles';
import { PageHeader } from '../../components/common';
import { registrationStepsApi } from '../../services/api';
import {
  Button,
  Input,
  Select,
  HTMLTextarea,
  NoticeModal,
  ConfirmModal,
  Spinner,
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { colors, typography, shadows, borderRadius, spacing } from '../../styles/theme';

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Телефон' },
  { value: 'fullname', label: 'ФИО' },
  { value: 'date', label: 'Дата' },
];

const TYPE_HINT = 'Тип поля влияет на проверку значения, которое вводит пользователь. Текстовые значения не проверяются и пользователь сможет ввести все, что захочет';

export default function BotRegistrationStep() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({
    message_text: '',
    field_type: 'email',
    field_name: '',
    error_message: 'Некорректные данные',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const showFieldName = form.field_type === 'text';

  const canSave = useMemo(() => {
    if (loading || saving) return false;
    if (!String(form.message_text || '').trim()) return false;
    if (!String(form.error_message || '').trim()) return false;
    if (!String(form.field_type || '').trim()) return false;
    return true;
  }, [form, loading, saving]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (isNew) return;
      setLoading(true);
      try {
        const data = await registrationStepsApi.retrieve(id);
        if (!mounted) return;
        setForm({
          message_text: data.message_text ?? '',
          field_type: data.field_type ?? 'email',
          field_name: data.field_name ?? '',
          error_message: data.error_message ?? 'Некорректные данные',
        });
      } catch (e) {
        if (mounted) {
          setNotice({ open: true, type: 'error', text: parseApiError(e) });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id, isNew]);

  const setField = useCallback(
    (name) => (e) => {
      const v = e?.target?.value ?? '';
      setForm((prev) => ({ ...prev, [name]: v }));
    },
    []
  );

  const handleFieldTypeChange = useCallback((e) => {
    const nextType = e?.target?.value ?? '';
    setForm((prev) => ({
      ...prev,
      field_type: nextType,
      field_name: nextType === 'text' ? prev.field_name : '',
    }));
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canSave) {
        setNotice({ open: true, type: 'error', text: 'Заполните обязательные поля' });
        return;
      }

      setSaving(true);
      try {
        const payload = {
          ...(isNew ? { order: 0 } : {}),
          message_text: form.message_text,
          field_type: form.field_type,
          ...(form.field_type === 'text' && String(form.field_name || '').trim()
            ? { field_name: String(form.field_name).trim() }
            : {}),
          error_message: form.error_message,
        };

        if (isNew) {
          await registrationStepsApi.create(payload);
          const data = await registrationStepsApi.list();
          const list = Array.isArray(data) ? data : data?.results || [];
          
          if (list.length > 0) {
            const reorderPayload = list
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((step, idx) => ({ id: step.id, order: idx + 1 }));
            await registrationStepsApi.reorder(reorderPayload);
          }

          setNotice({ open: true, type: 'success', text: 'Шаг успешно создан' });
        } else {
          await registrationStepsApi.partialUpdate(id, payload);
          setNotice({ open: true, type: 'success', text: 'Шаг успешно сохранён' });
        }

        setTimeout(() => navigate('/bot/registration'), 1500);
      } catch (e2) {
        setNotice({ open: true, type: 'error', text: parseApiError(e2) });
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, id, isNew, navigate]
  );

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await registrationStepsApi.remove(id);
      const data = await registrationStepsApi.list();
      const list = Array.isArray(data) ? data : data?.results || [];
      
      if (list.length > 0) {
        const reorderPayload = list
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((step, idx) => ({ id: step.id, order: idx + 1 }));
        await registrationStepsApi.reorder(reorderPayload);
      }

      navigate('/bot/registration');
    } catch (e) {
      setNotice({ open: true, type: 'error', text: parseApiError(e) });
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [id, navigate]);

  const dynamicStyles = {
    card: {
      ...pageStyles.card,
      ...(isMobile && pageStyles.cardMobile),
    }
  };

  return (
  <div style={pageStyles.page}>
    <div style={pageStyles.container}>
      <PageHeader
        title={isNew ? 'Новый шаг регистрации' : 'Редактирование шага'}
        subtitle={
          isNew 
            ? 'Новый шаг автоматически окажется первым в анкетировании. Чтобы изменить порядок, перетащите новый шаг в нужное место.'
            : 'Измените параметры шага и сохраните изменения.'
        }
        isMobile={isMobile}
      />



        <form onSubmit={handleSave} style={{ ...styles.card, ...(isMobile && styles.cardMobile) }}>
          {loading && (
            <div style={{ position: 'absolute', zIndex: 10 }}>
              <Spinner size={30} color={colors.primary} />
            </div>
          )}

          <Select
            label="Тип поля"
            required
            value={form.field_type}
            onChange={handleFieldTypeChange}
            options={FIELD_TYPES}
            hint={TYPE_HINT}
          />

          {showFieldName && (
            <Input
              label="Название переменной"
              required
              value={form.field_name}
              onChange={setField('field_name')}
              placeholder="например: has_cat"
              hint="Латиницей, без пробелов. Сохраняется как настраиваемое поле пользователя (extras), к которому можно потом обратиться в рассылках через <b>{has_cat}</b>"
            />
          )}

          <HTMLTextarea
            label="Сообщение пользователю"
            required
            value={form.message_text}
            onChange={setField('message_text')}
            rows={6}
            placeholder="Введите ваше имя"
          />

          <HTMLTextarea
            label="Сообщение об ошибке"
            value={form.error_message}
            onChange={setField('error_message')}
            rows={4}
            placeholder="Имя должно состоять из имени и фамилии!"
            hint="Будет отправлено пользователю, если данные некорректны — например, вместо телефона пришёл текст"
          />

          <Button
            variant="primary"
            type="submit"
            disabled={!canSave}
            loading={saving}
            loadingText="Сохранение..."
            fullWidth
          >
            Сохранить
          </Button>

          {!isNew && (
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              disabled={loading || deleting}
              style={isMobile ? styles.btnMobile : {}}
            >
              Удалить шаг
            </Button>
          )}
        </form>

        {/* Delete Modal */}
        <ConfirmModal
          open={deleteModalOpen}
          title="Удаление шага"
          message="Вы уверены, что хотите удалить этот шаг?"
          description="Это действие нельзя будет отменить."
          confirmText="Удалить"
          cancelText="Отмена"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => !deleting && setDeleteModalOpen(false)}
        />

        {/* Notice Modal */}
        <NoticeModal
          open={notice.open}
          type={notice.type}
          text={notice.text}
          onClose={() => setNotice({ ...notice, open: false })}
          autoClose={notice.type === 'success'}
        />
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  page: {
    minHeight: '100vh',
    background: colors.background,
    fontFamily: typography.fontFamily,
    padding: `${spacing.xxxl}px ${spacing.lg}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  wrap: {
    maxWidth: '900px',
    width: '100%',
  },
  top: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  topMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  h1: {
    margin: 0,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.primary,
    letterSpacing: typography.h1.letterSpacing,
  },
  h1Mobile: {
    fontSize: typography.h1Mobile.fontSize,
  },
  sub: {
    margin: '6px 0 0 0',
    color: colors.gray500,
    fontSize: 15,
    lineHeight: 1.6,
  },
  btnMobile: {
    width: '100%',
    justifyContent: 'center',
    padding: `10px ${spacing.md}px`,
    borderRadius: borderRadius.small,
  },
  card: {
    background: colors.white,
    padding: spacing.xxxl,
    borderRadius: borderRadius.card,
    boxShadow: shadows.card,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  cardMobile: {
    padding: spacing.xl,
    borderRadius: borderRadius.cardMobile,
  },
};
