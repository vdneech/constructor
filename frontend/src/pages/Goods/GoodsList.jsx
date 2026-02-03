// pages/GoodsList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { goodsApi } from '../../services/api';
import { 
  Spinner,
  PageHeader,
  EmptyStateCard,
  ErrorPage // Добавили наш новый компонент
} from '../../components/common';
import { useIsMobile } from '../../hooks';
import { parseApiError } from '../../utils';
import { pageStyles } from '../../styles/pageStyles';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';

export default function GoodsList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Теперь храним строку ошибки здесь

  useEffect(() => {
    loadGoods();
  }, []);

  const loadGoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await goodsApi.list();
      const data = response?.results || response || [];
      setGoods(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const getMainPhoto = useCallback((good) => {
    if (!good?.images?.length) return null;
    const invoicePhoto = good.images.find((img) => img.is_invoice);
    return invoicePhoto ? invoicePhoto.image : good.images[0].image;
  }, []);

  // Если поймали ошибку загрузки — показываем ErrorPage
  if (error) {
    return <ErrorPage code="500"/>;
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <PageHeader
          title="Товары"
          subtitle="Активные товары отобразятся в боте и будут доступны для покупки."
          isMobile={isMobile}
        />

        {goods.length === 0 ? (
          <EmptyStateCard
            title="Добавить товар"
            description="Создайте новый товар для вашего каталога"
            onClick={() => navigate('/goods/new')}
            isMobile={isMobile}
          />
        ) : (
          <div style={{ ...styles.grid, ...(isMobile && styles.gridMobile) }}>
            {goods.map((good) => (
              <GoodCard
                key={good.id}
                good={good}
                mainPhoto={getMainPhoto(good)}
                isMobile={isMobile}
                onClick={() => navigate(`/goods/${good.id}`)}
              />
            ))}

            <EmptyStateCard
              title="Добавить товар"
              description="Создайте еще один товар"
              onClick={() => navigate('/goods/new')}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- GOOD CARD COMPONENT ---------- */

function GoodCard({ good, mainPhoto, isMobile, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasPhoto = !!mainPhoto;

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(good.price || 0);

  return (
    <div
      style={{
        ...styles.goodCard,
        ...(isMobile && styles.goodCardMobile),
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.12)' : shadows.card,
      }}
      onClick={onClick}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div 
        style={{
          ...styles.goodPhoto,
          ...(isMobile && styles.goodPhotoMobile),
          backgroundImage: hasPhoto ? `url(${mainPhoto})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!hasPhoto && (
          <div style={styles.noPhoto}>
            <span style={styles.noPhotoText}>Нет фото</span>
          </div>
        )}
      </div>

      <div style={{ 
        ...(isMobile ? styles.goodContentMobile : styles.goodContent), 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1 
      }}>
        <div style={isMobile ? styles.goodPriceMobile : styles.goodPrice}>
          {formattedPrice}
        </div>

        <h3 style={isMobile ? styles.goodTitleMobile : styles.goodTitle}>
          {good.title || 'Без названия'}
        </h3>

        {good.label && <div style={styles.goodLabel}>{good.label}</div>}

        <div style={{ ...styles.goodInfo, marginTop: isMobile ? spacing.lg : 'auto',}}>
          <div style={{
            ...styles.goodStatus,
            color: good.available ? colors.primary : colors.gray500,
          }}>
            {good.available ? 'Активен' : 'Скрыт'}
          </div>

          <div style={styles.goodQuantity}>
            <span style={{ 
              fontWeight: 700, 
              color: good.quantity > 0 ? colors.grey400 : colors.primary
            }}>
              {good.quantity > 0 ? 'Товар в наличии' : 'Товар закончился'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  center: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh' 
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing.xl },
  gridMobile: { gridTemplateColumns: '1fr', gap: spacing.md },
  goodCard: { 
    background: colors.white, 
    borderRadius: borderRadius.card, 
    boxShadow: shadows.card, 
    overflow: 'hidden', 
    cursor: 'pointer', 
    transition: 'all 0.25s ease', 
    border: `1px solid ${colors.gray100}`,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  goodCardMobile: { borderRadius: borderRadius.cardMobile },
  goodPhoto: { width: '100%', height: 200, background: colors.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  goodPhotoMobile: { height: 300 },
  noPhoto: { padding: spacing.md, border: `1px dashed ${colors.gray300}`, borderRadius: borderRadius.medium },
  noPhotoText: { fontSize: 12, color: colors.gray400, fontWeight: 600 },
  goodContent: { padding: spacing.lg },
  goodContentMobile: { padding: spacing.md },
  goodTitle: { margin: `0 0 ${spacing.xs}px 0`, fontSize: 18, fontWeight: 700, color: colors.primary, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  goodTitleMobile: {margin: `0 0 ${spacing.xs}px 0`, fontSize: 20, fontWeight: 700, marginTop: spacing.xs },
  goodPrice: { fontSize: 18, fontWeight: 550, color: colors.primary, marginBottom: spacing.xs},
  goodPriceMobile: { fontSize: 16, fontWeight: 550, marginBottom: spacing.xs},
  goodInfo: { display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: spacing.sm, borderBottom: `1px solid ${colors.gray50}` },
  goodStatus: { fontSize: 13, fontWeight: 550, color: colors.gray500 },
  goodQuantity: { fontSize: 13, color: colors.gray500, fontWeight: 550},
  goodLabel: { fontSize: 12, color: colors.gray400, fontWeight: 500 }
};