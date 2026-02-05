// src/App.js
import React, {useState, useEffect, useCallback} from 'react';
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
import {useAuth} from './hooks/useAuth';
import {authApi} from './services/api';
import GoodsList from './pages/Goods/GoodsList';
import GoodDetail from './pages/Goods/GoodDetail';
import CreateGood from './pages/Goods/CreateGood';
import UsersList from './pages/Users/UsersList';
import BotConfig from './pages/Bot/BotConfig';
import BotRegistrationStepsList from './pages/Bot/BotRegistrationStepsList';
import BotRegistrationStep from './pages/Bot/BotRegistrationStep';
import {ConfirmModal, ErrorPage} from './components/common';
import {colors, typography, spacing, borderRadius, shadows} from './styles/theme';

import './App.css';

// ===== ICONS =====
const Icons = {
    NewNewsletter: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path
                d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"/>
        </svg>
    ),
    Newsletters: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-envelope"
             viewBox="0 0 16 16">
            <path
                d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
        </svg>
    ),
    Analytics: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd"
                  d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07"/>
        </svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-people"
             viewBox="0 0 16 16">
            <path
                d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
        </svg>
    ),
    Goods: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-bag"
             viewBox="0 0 16 16">
            <path
                d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
        </svg>

    ),
    Bot: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-gear"
             viewBox="0 0 16 16">
            <path
                d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
            <path
                d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
        </svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
            <path fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
        </svg>
    )
};

// ===== CONSTANTS =====
const NAV_ITEMS = [
    {path: '/analytics', label: 'Аналитика', icon: Icons.Analytics},
    {path: '/newsletters/create', label: 'Новая рассылка', icon: Icons.NewNewsletter}, // Короткое название для мобилки
    {path: '/newsletters', label: 'Рассылки', icon: Icons.Newsletters},
    {path: '/bot', label: 'Конфигурация бота', icon: Icons.Bot},
    {path: '/goods', label: 'Товары', icon: Icons.Goods},
    {path: '/users', label: 'Пользователи', icon: Icons.Users},
];

const MOBILE_BREAKPOINT = 1024;

const STYLES = {
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
    // Стиль для нижней навигации
    bottomNav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: colors.primary,
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0',
        // Важно для iPhone X+: отступ для полоски "домой"
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
    },
    bottomNavItem: {
        background: 'transparent',
        border: 'none',
        color: colors.accent,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        gap: '4px',
        fontSize: '10px',
        flex: 1,
        cursor: 'pointer',
        opacity: 0.6,
        transition: 'opacity 0.2s',
    },
    bottomNavItemActive: {
        opacity: 1,
        fontWeight: 600,
    }
};

// ===== COMPONENTS =====

function LogoComponent({size}) {
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

function SidebarContent({onNavClick, onLogoutClick, currentPath}) {
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
                <LogoComponent size={90}/>
            </div>

            <nav style={{padding: `${spacing.lg}px ${spacing.sm}px`, flex: 1}}>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => onNavClick(item.path)}
                        style={getNavLinkStyle(item.path)}

                    >
                        {/* Иконка для десктопа (слева от текста) */}
                        <span style={{display: 'flex'}}><item.icon/></span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div style={{padding: `0 ${spacing.sm}px ${spacing.lg}px`}}>
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm
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
                    <Icons.Logout/>
                    Выйти
                </button>
            </div>
        </div>
    );
}

function Navigation() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isAuth = useAuth();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavClick = useCallback(
        (path) => {
            navigate(path);
        },
        [navigate]
    );

    const handleLogoutClick = useCallback(() => {
        setIsLogoutDialogOpen(true);
    }, []);

    const handleConfirmLogout = useCallback(async () => {
        setLoggingOut(true);
        const refresh = localStorage.getItem('refreshToken');
        try {
            if (refresh) await authApi.blacklist({refresh});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setLoggingOut(false);
            setIsLogoutDialogOpen(false);
            navigate('/login', {replace: true});
        }
    }, [navigate]);

    const isActive = (path) => location.pathname === path || (path === '/analytics' && location.pathname === '/');

    if (!isAuth || location.pathname === '/login') {
        return null;
    }

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            {!isMobile && (
                <div style={STYLES.sidebar}>
                    <SidebarContent
                        onNavClick={handleNavClick}
                        onLogoutClick={handleLogoutClick}
                        currentPath={location.pathname}
                    />
                </div>
            )}

            {/* MOBILE BOTTOM NAVIGATION */}
            {isMobile && (
                <div style={STYLES.bottomNav}>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            style={{
                                ...STYLES.bottomNavItem,
                                ...(isActive(item.path) ? STYLES.bottomNavItemActive : {})
                            }}
                        >
                            <item.icon/>
                            {/* <span style={{marginTop: 2}}>{item.label}</span>  Можно раскомментить, если нужны подписи */}
                        </button>
                    ))}

                    <button
                        onClick={handleLogoutClick}
                        style={STYLES.bottomNavItem}
                    >
                        <Icons.Logout/>
                        {/* <span style={{marginTop: 2}}>Выйти</span> */}
                    </button>
                </div>
            )}

            <ConfirmModal
                open={isLogoutDialogOpen}
                title="Выход из аккаунта"
                message="Вы уверены, что хотите выйти?"
                description="Позже придется вводить пароль снова"
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
                // На десктопе отступ слева, на мобилке - отступ снизу
                marginLeft: isMobile ? 0 : '280px',
                paddingBottom: isMobile ? '20px' : 0,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: colors.background,
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
            }}
        >
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>

                <Route element={<ProtectedRoute/>}>
                    <Route path="/" element={<Navigate to="/analytics" replace/>}/>
                    <Route path="/analytics" element={<Analytics/>}/>
                    <Route path="/newsletters/create" element={<CreateNewsletter/>}/>
                    <Route path="/newsletters" element={<NewslettersList/>}/>
                    <Route path="/newsletters/:id" element={<NewsletterDetail/>}/>
                    <Route path="/goods" element={<GoodsList/>}/>
                    <Route path="/goods/new" element={<CreateGood/>}/>
                    <Route path="/goods/:id" element={<GoodDetail/>}/>
                    <Route path="/users" element={<UsersList/>}/>
                    <Route path="/bot" element={<BotConfig/>}/>
                    <Route path="/bot/registration" element={<BotRegistrationStepsList/>}/>
                    <Route path="/bot/registration/new" element={<BotRegistrationStep/>}/>
                    <Route path="/bot/registration/:id" element={<BotRegistrationStep/>}/>
                </Route>

                <Route path="*" element={<ErrorPage code="404"/>}/>
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
                <Navigation/>
                <AppRoutes/>
            </div>
        </Router>
    );
}

export default App;
