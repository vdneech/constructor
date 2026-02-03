import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationStepsApi } from '../../services/api';
import {
  NoticeModal,
  Spinner,
  PageHeader,
  Button,
} from '../../components/common';
import { useIsMobile } from '../../hooks'; // Добавляем хук
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles'; // Импортируем системные стили
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

const ArrowIcon = ({ direction = 'up' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: direction === 'down' ? 'rotate(180deg)' : 'none' }}>
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function BotRegistrationStepsList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Определяем мобилку
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderState, setReorderState] = useState('idle');
  const [notice, setNotice] = useState({ open: false, type: 'success', text: '' });

  const loadSteps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await registrationStepsApi.list();
      const list = Array.isArray(data) ? data : data?.results || [];
      setItems([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (e) {
      setNotice({ open: true, type: 'error', text: parseApiError(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSteps(); }, [loadSteps]);

  const moveStep = (e, index, direction) => {
    e.stopPropagation();
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    setReorderState('dirty');
  };

  const handleSaveOrder = async () => {
    setReorderState('saving');
    try {
      const payload = items.map((item, index) => ({ id: item.id, order: index + 1 }));
      await registrationStepsApi.reorder(payload);
      setReorderState('idle');
      setNotice({ open: true, type: 'success', text: 'Порядок успешно сохранен' });
    } catch (e) {
      setNotice({ open: true, type: 'error', text: parseApiError(e) });
      setReorderState('dirty');
    }
  };

  if (loading) return <div style={styles.center}><Spinner size={40} /></div>;

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <PageHeader 
          title="Регистрация" 
          subtitle="Настройка последовательности вопросов бота"
          isMobile={isMobile}
        />

        <div style={styles.list}>
          {/* Кастомный Create Card (в стиле пустых карточек из Config) */}
          <div 
            style={{...styles.createCard, ...(isMobile && styles.createCardMobile)}} 
            onClick={() => navigate('/bot/registration/new')}
          >
            
            <div style={styles.createTextContainer}>
              <h3 style={styles.createTitle}>Добавить новый шаг</h3>
              <p style={styles.createSub}>Нажмите, чтобы создать новый вопрос для пользователя</p>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={item.id} style={{...styles.item, ...(isMobile && styles.itemMobile)}}>
              <div style={styles.controls}>
                <button 
                  style={{ ...styles.moveBtn, visibility: index === 0 ? 'hidden' : 'visible' }} 
                  onClick={(e) => moveStep(e, index, 'up')}
                >
                  <ArrowIcon direction="up" />
                </button>
                <div style={styles.orderLabel}>{index + 1}</div>
                <button 
                  style={{ ...styles.moveBtn, visibility: index === items.length - 1 ? 'hidden' : 'visible' }} 
                  onClick={(e) => moveStep(e, index, 'down')}
                >
                  <ArrowIcon direction="down" />
                </button>
              </div>

              <div style={styles.content} onClick={() => navigate(`/bot/registration/${item.id}`)}>
                <div style={styles.cardHeader}>
                  <span style={styles.stepType}>
                    {item.field_type === 'text' ? 'Свой вопрос' : 'Системное поле'}
                  </span>
                </div>
                <h3 style={styles.title}>{item.field_name || 'Текстовое поле'}</h3>
                <p style={styles.preview}>
                  {item.message_text.replace(/<[^>]*>/g, '').substring(0, 70)}...
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Футер с кнопкой сохранения - теперь он выровнен по ширине контейнера */}
        {reorderState !== 'idle' && (
            <Button
              variant="primary"
              fullWidth
              style={{marginTop: spacing.md}}
              loading={reorderState === 'saving'}
              loadingText="Сохранение..."
              onClick={handleSaveOrder}
            >
              Сохранить порядок шагов
            </Button>

        )}
      </div>

      <NoticeModal
        title="Регистрация"
        open={notice.open} 
        type={notice.type} 
        text={notice.text} 
        onClose={() => setNotice(prev => ({ ...prev, open: false }))} 
      />
    </div>
  );
}

const styles = {
  center: { display: 'flex', justifyContent: 'center', padding: '100px' },
  list: { display: 'flex', flexDirection: 'column', gap: spacing.md, marginTop: spacing.xl },
  
  // Кнопка добавления в стиле Config Empty Card
  createCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    background: '#FAFAFA',
    border: `2px dashed ${colors.gray200}`,
    borderRadius: borderRadius.large,
    cursor: 'pointer',
    marginBottom: spacing.xs,
    transition: '0.2s ease',
    gap: spacing.md
  },
  createTitle: { fontSize: '15px', fontWeight: 700, color: colors.primary, margin: 0 },
  createSub: { fontSize: '12px', color: colors.gray400, margin: '2px 0 0 0', fontWeight: 500 },

  // Карточки шагов
  item: {
    display: 'flex',
    background: colors.white,
    borderRadius: borderRadius.large,
    border: `1px solid ${colors.gray100}`,
    overflow: 'hidden',
    boxShadow: shadows.sm,
    transition: 'transform 0.2s ease',
  },
  controls: {
    width: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.primary,
    gap: '4px',
  },
  moveBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    transition: '0.2s',
    ':hover': { color: colors.white }
  },
  orderLabel: { fontSize: '14px', fontWeight: 800, color: colors.white },
  
  content: { flex: 1, padding: '16px 20px', cursor: 'pointer' },
  stepType: { fontSize: '10px', fontWeight: 700, color: colors.gray400, textTransform: 'uppercase', letterSpacing: '0.5px' },
  title: { fontSize: '16px', fontWeight: 700, color: colors.primary, margin: '2px 0 4px 0' },
  preview: { fontSize: '13px', color: colors.gray500, lineHeight: '1.4', margin: 0, fontWeight: 500 },

  // Тот самый Sticky Footer для кнопки
  stickyFooter: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 40px)',
    maxWidth: '800px', // Идентично pageStyles.container
    zIndex: 100,
  },
  stickyFooterMobile: {
    bottom: 16,
    width: 'calc(100% - 32px)',
  }
};