// pages/CreateGood.jsx - РЕФАКТОРИНГ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goodsApi } from '../../services/api';
import { Button, Input, HTMLTextarea, PageHeader, NoticeModal } from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors } from '../../styles/theme';

export default function CreateGood() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // ✅ Используем хук вместо useState

  const [form, setForm] = useState({
    title: '',
    label: '',
    price: '',
    description: '',
    quantity: 0,
    available: true,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      label: form.label.trim(),
      price: parseFloat(form.price) || 0,
      description: form.description.trim(),
      quantity: parseInt(form.quantity) || 0,
      available: form.available,
    };

    try {
      const createdGood = await goodsApi.create(payload);
      navigate(`/goods/${createdGood.id}`, { replace: true });
    } catch (err) {
      const serverError = err.response?.data;
      if (typeof serverError === 'object') {
        setErrors(serverError);
      }
      setNotice({ open: true, type: 'error', text: parseApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Используем pageStyles вместо inline стилей
  const dynamicStyles = {
    card: {
      ...pageStyles.card,
      ...(isMobile && pageStyles.cardMobile),
    },
    fieldRow: {
      ...pageStyles.fieldRow,
      ...(isMobile && pageStyles.fieldRowMobile),
    },
  };

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        {/* ✅ Добавили PageHeader */}
        <PageHeader
          title="Создание товара"
          subtitle="Заполните информацию о товаре. Фотографии можно будет добавить после создания."
          isMobile={isMobile}
        />

        <div style={dynamicStyles.card}>
          <form onSubmit={handleSubmit} style={pageStyles.form}>
            {/* Название и лейбл */}
            <div style={dynamicStyles.fieldRow}>
              <Input
                label="Название товара"
                required
                value={form.title}
                onChange={handleChange('title')}
                error={errors.title}
                placeholder="Кружка с логотипом"
              />
              <Input
                label="Лейбл (короткое название)"
                required
                value={form.label}
                onChange={handleChange('label')}
                error={errors.label}
                placeholder="Кружка"
              />
            </div>

            {/* Цена и количество */}
            <div style={dynamicStyles.fieldRow}>
              <Input
                label="Цена (₽)"
                type="number"
                required
                value={form.price}
                onChange={handleChange('price')}
                error={errors.price}
                placeholder="500"
              />
              <Input
                label="Количество"
                type="number"
                required
                value={form.quantity}
                onChange={handleChange('quantity')}
                error={errors.quantity}
                placeholder="10"
              />
            </div>

            {/* Описание */}
            <HTMLTextarea
              label="Описание"
              value={form.description}
              onChange={handleChange('description')}
              error={errors.description}
              placeholder="Описание товара в формате HTML"
              minHeight={200}
            />

            {/* Кнопки */}
            <div style={pageStyles.formActions}>
              <Button
                type="submit"
                loading={saving}
                disabled={!form.title.trim() || !form.label.trim()}
                fullWidth
              >
                Создать товар
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/goods')}
                disabled={saving}
                fullWidth
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </div>

      <NoticeModal
        open={notice.open}
        type={notice.type}
        text={notice.text}
        onClose={() => setNotice({ ...notice, open: false })}
      />
    </div>
  );
}