// src/App.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import CreateNewsletter from './pages/Newsletters/CreateNewsletter';
import NewslettersList from './pages/Newsletters/NewslettersList';
import NewsletterDetail from './pages/Newsletters/NewsletterDetail';
import Analytics from './pages/Analytics';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { authApi } from './services/api';
import GoodsList from './pages/Goods/GoodsList';
import GoodDetail from './pages/Goods/GoodDetail';
import CreateGood from './pages/Goods/CreateGood';
import UsersList from './pages/Users/UsersList';
import BotConfig from './pages/Bot/BotConfig';
import BotRegistrationStepsList from './pages/Bot/BotRegistrationStepsList';
import BotRegistrationStep from './pages/Bot/BotRegistrationStep';
import { ConfirmModal } from './components/common';
import { colors, typography, spacing, borderRadius, shadows } from './styles/theme';

import './App.css';

// ===== CONSTANTS =====
const NAV_ITEMS = [
  { path: '/newsletters/create', label: 'Новая рассылка' },
  { path: '/newsletters', label: 'Рассылки' },
  { path: '/analytics', label: 'Аналитика' },
  { path: '/goods', label: 'Товары' },
  { path: '/users', label: 'Пользователи' },
  { path: '/bot', label: 'Конфигурация бота' },
];

const MOBILE_BREAKPOINT = 1024;

const STYLES = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    width: '280px',
    background: colors.primary,
    zIndex: 1200,
    boxShadow: shadows.card,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileSidebar: {
    position: 'fixed',
    top: '70px', // Было 64px, теперь синхронно с хедером 70px
    left: 0,
    bottom: 0,
    width: '280px',
    background: colors.primary,
    zIndex: 1001,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${spacing.lg}px`,
    // Убираем env(safe-area-inset-top) из padding, 
    // чтобы высота была фиксированно 70px, либо учитываем её в общей высоте
    zIndex: 1100,
  }
};

// ===== COMPONENTS =====

/**
 * Измененный компонент: Загружает логотип из папки public.
 * Стили сохранены в точности.
 */
function LogoComponent({ size }) {
  const [logoError, setLogoError] = useState(false);
  const logoPath = '/logo 512x512.png';

  if (logoError) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: size > 40 ? borderRadius.large : borderRadius.medium,
          background: colors.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size > 40 ? '24px' : '14px',
          fontWeight: 550,
          color: colors.primary,
          flexShrink: 0,
        }}
      >
        GFS
      </div>
    );
  }

  return (
    <img
      src={logoPath}
      width={size}
      height={size}
      alt="Logo"
      style={{ 
        borderRadius: size > 40 ? borderRadius.large : borderRadius.medium, 
        flexShrink: 0,
        objectFit: 'cover'
      }}
      onError={() => setLogoError(true)}
    />
  );
}

function LogoutButton({ onLogoutClick }) {
  return (
    <button
      onClick={onLogoutClick}
      style={{
        width: '100%',
        padding: `${spacing.sm}px ${spacing.lg}px`,
        background: 'transparent',
        border: 'none',
        color: colors.accent,
        textAlign: 'left',
        fontSize: '15px',
        fontWeight: 500,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderRadius: borderRadius.medium,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(248, 247, 226, 0.1)';
        e.currentTarget.style.color = colors.white;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = colors.accent;
      }}
    >
      Выйти
    </button>
  );
}

function SidebarContent({ onNavClick, onLogoutClick, currentPath }) {
  const isActive = useCallback(
    (path) => currentPath === path || (path === '/analytics' && currentPath === '/'),
    [currentPath]
  );

  const getNavLinkStyle = useCallback(
    (path) => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      width: '100%',
      padding: `${spacing.sm}px ${spacing.lg}px`,
      background: isActive(path) ? colors.accent : 'transparent',
      color: isActive(path) ? colors.primary : colors.accent,
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: isActive(path) ? 500 : 500,
      fontFamily: typography.fontFamily,
      cursor: 'pointer',
      border: 'none',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      marginBottom: spacing.xs,
      borderRadius: borderRadius.small,
    }),
    [isActive]
  );

  return (
    <div 
      style={{ 
        padding: `${spacing.xl}px 0`, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          gap: spacing.sm,
          borderBottom: `1px solid rgba(248, 247, 226, 0.2)`,
        }}
      >
        <LogoComponent size={90} />
      </div>

      <nav style={{ padding: `${spacing.lg}px ${spacing.sm}px`, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavClick(item.path)}
            style={getNavLinkStyle(item.path)}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(248, 247, 226, 0.1)';
                e.currentTarget.style.color = colors.white;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.accent;
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: `0 ${spacing.sm}px ${spacing.lg}px` }}>
        <LogoutButton onLogoutClick={onLogoutClick} />
      </div>
    </div>
  );
}

function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = useAuth();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
      
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('[data-mobile-menu-button]')
      ) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(
    (path) => {
      navigate(path);
      setMobileOpen(false);
    },
    [navigate]
  );

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleLogoutClick = useCallback(() => {
    setIsLogoutDialogOpen(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setLoggingOut(true);
    const refresh = localStorage.getItem('refreshToken');
    
    try {
      if (refresh) {
        await authApi.blacklist({ refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setLoggingOut(false);
      setIsLogoutDialogOpen(false);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!isAuth || location.pathname === '/login') {
    return null;
  }

  return (
    <>
      {!isMobile && (
        <div style={STYLES.sidebar}>
          <SidebarContent 
            onNavClick={handleNavClick} 
            onLogoutClick={handleLogoutClick}
            currentPath={location.pathname} 
          />
        </div>
      )}

      {isMobile && (
        <>
          <div style={STYLES.mobileHeader}>
            <button
              data-mobile-menu-button
              onClick={toggleMobileMenu}
              style={{
                width: '44px',
                height: '44px',
                border: 'none',
                background: 'transparent',
                color: colors.accent,
                cursor: 'pointer',
                borderRadius: borderRadius.medium,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 300,
                transition: 'background 0.2s ease',
              }}
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {mobileOpen ? '×' : '≡'}
            </button>
            <LogoComponent size={44} />
          </div>

          <div
            style={{
              ...STYLES.overlay,
              opacity: mobileOpen ? 1 : 0,
              pointerEvents: mobileOpen ? 'auto' : 'none',
            }}
            onClick={() => setMobileOpen(false)}
          />

          <div
            ref={sidebarRef}
            style={{
              ...STYLES.mobileSidebar,
              transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            <SidebarContent 
              onNavClick={handleNavClick} 
              onLogoutClick={handleLogoutClick}
              currentPath={location.pathname} 
            />
          </div>
        </>
      )}

      <ConfirmModal
        open={isLogoutDialogOpen}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти из аккаунта?"
        onClose={() => !loggingOut && setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        confirmText="Выйти"
        cancelText="Отмена"
        loading={loggingOut}
      />
    </>
  );
}


function AppRoutes() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        marginLeft: isMobile ? 0 : '280px',
        // Добавляем отступ сверху на мобилках, чтобы контент не нырял под хедер
        // Используем flex-direction: column и flex: 1, чтобы контент занимал остаток
        display: 'flex',
        flexDirection: 'column',
        background: colors.background,
        transition: 'all 0.3s ease',
        // Важно: чтобы padding не раздувал высоту
        boxSizing: 'border-box', 
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/analytics" replace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/newsletters/create" element={<CreateNewsletter />} />
          <Route path="/newsletters" element={<NewslettersList />} />
          <Route path="/newsletters/:id" element={<NewsletterDetail />} />
          <Route path="/goods" element={<GoodsList />} />
          <Route path="/goods/new" element={<CreateGood />} />
          <Route path="/goods/:id" element={<GoodDetail />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/bot" element={<BotConfig />} />
          <Route path="/bot/registration" element={<BotRegistrationStepsList />} />
          <Route path="/bot/registration/new" element={<BotRegistrationStep />} />
          <Route path="/bot/registration/:id" element={<BotRegistrationStep />} />
        </Route>
      </Routes>
    </div>
  );
}


function App() {
  return (
    <Router>
      <div
        style={{
          background: colors.background,
          fontFamily: typography.fontFamily,
          color: colors.primary,
        }}
      >
        <Navigation />
        <AppRoutes />
      </div>
    </Router>
  );
}


export default App;