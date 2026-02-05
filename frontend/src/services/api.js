// src/services/api.js
import axios from 'axios';

// ==================== CONFIG ====================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// В проде лучше не логировать детали ответов/токены
const IS_DEV = process.env.NODE_ENV !== 'production';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// Отдельный клиент для refresh, чтобы не попасть в интерсепторы (и не зациклиться)
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// ==================== TOKEN STORAGE ====================
const tokenStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccess(token) {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeAccess() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefresh(token) {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  removeRefresh() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  clear() {
    this.removeAccess();
    this.removeRefresh();
  },
};

// ==================== ERROR NORMALIZATION ====================
export function normalizeApiError(error) {
  if (!error.response) {
    // Сетевая ошибка (нет интернета)
    return 'Не удалось подключиться к серверу';
  }

  const status = error.response.status;
  const data = error.response.data;

  // Маппинг статус-кодов на человеческие сообщения
  const statusMessages = {
    400: 'Некорректный запрос',
    401: 'Необходима авторизация',
    403: 'Доступ запрещен',
    404: 'Данные не найдены',
    500: 'Внутренняя ошибка сервера',
    502: 'Сервер временно недоступен',
    503: 'Сервис недоступен. Попробуйте позже',
  };

  // Если есть сообщение от API (например data.message или data.error)
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  // Иначе используем маппинг
  return statusMessages[status] || 'Произошла ошибка';
}


// ==================== AUTH FLOW (REFRESH QUEUE) ====================
let isRefreshing = false;
let refreshQueue = [];

function resolveRefreshQueue(error, newAccessToken = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccessToken);
  });
  refreshQueue = [];
}

function hardLogout() {
  tokenStorage.clear();
  // replace — чтобы не возвращаться назад к защищённым страницам
  window.location.replace('/login');
}

// ==================== INTERCEPTORS ====================

// Request: attach access token
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: refresh on 401 (except auth endpoints)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // Если запрос отменён — просто пробрасываем
    if (axios.isCancel?.(error) || error?.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // Если нет данных о запросе — пробрасываем
    if (!originalRequest?.url) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    // Только 401 интересен для refresh
    if (status !== 401) {
      if (IS_DEV) {
        // ✅ ИСПРАВЛЕНИЕ: normalizeApiError возвращает строку, выводим её корректно
        const errorMessage = normalizeApiError(error);
        // eslint-disable-next-line no-console
        console.error('API error:', status, errorMessage, error.response?.data);
      }
      return Promise.reject(error);
    }

    // Не рефрешим токен на эндпоинтах token/*
    const url = String(originalRequest.url);
    const isTokenEndpoint = url.includes('token/');
    if (isTokenEndpoint) {
      return Promise.reject(error);
    }

    // Защита от повторного рефреш-цикла
    if (originalRequest._retry) {
      hardLogout();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      hardLogout();
      return Promise.reject(error);
    }

    // Если refresh уже идёт — ставим запрос в очередь
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    // Запускаем refresh
    isRefreshing = true;

    try {
      const refreshResponse = await refreshClient.post('token/refresh/', { refresh: refreshToken });
      const newAccess = refreshResponse?.data?.access;

      if (!newAccess) {
        throw new Error('No access token in refresh response');
      }

      tokenStorage.setAccess(newAccess);

      // Обновляем дефолтный заголовок и конкретный запрос
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;

      resolveRefreshQueue(null, newAccess);
      return api(originalRequest);
    } catch (refreshError) {
      resolveRefreshQueue(refreshError, null);
      hardLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ==================== HELPERS ====================
const getData = (response) => response.data;

// Чтобы можно было прокинуть signal в api методы без переписывания всего кода
const withConfig = (config) => (config ? { ...config } : undefined);

// ==================== AUTH API ====================
export const authApi = {
  login: (data, config) => api.post('token/', data, withConfig(config)).then(getData),
  refresh: (data, config) => api.post('token/refresh/', data, withConfig(config)).then(getData),
  blacklist: (data, config) => api.post('token/blacklist/', data, withConfig(config)).then(getData),

  logout: async () => {
    const refreshToken = tokenStorage.getRefresh();
    try {
      if (refreshToken) {
        // Не критично, если упадёт
        await api.post('token/blacklist/', { refresh: refreshToken });
      }
    } catch (_) {
      // ignore
    } finally {
      hardLogout();
    }
  },
};


export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  // Берем baseURL из axios (например, http://domain.com/api)
  // и убираем из него /api, чтобы получить корень сервера
  const baseUrl = api.defaults.baseURL.replace(/\/api$/, '').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};

// ==================== GOODS API ====================
export const goodsApi = {
  list: (config) => api.get('goods/', withConfig(config)).then((r) => r.data?.results || []),
  retrieve: (id, config) => api.get(`goods/${id}/`, withConfig(config)).then(getData),
  create: (data, config) => api.post('goods/', data, withConfig(config)).then(getData),
  update: (id, data, config) => api.put(`goods/${id}/`, data, withConfig(config)).then(getData),
  partialUpdate: (id, data, config) => api.patch(`goods/${id}/`, data, withConfig(config)).then(getData),
  remove: (id, config) => api.delete(`goods/${id}/`, withConfig(config)),

  uploadPhoto: (goodId, formData, config) =>
    api.post(`goods/${goodId}/upload-image/`, formData, withConfig(config)).then(getData),
  deletePhoto: (photoId, config) =>
    api.delete(`goods/images/${photoId}/`, withConfig(config)),
  setInvoicePhoto: (photoId, config) =>
    api.patch(`goods/images/${photoId}/set-as-invoice/`, null, withConfig(config)).then(getData),
};

export const imagesApi = {
  // Работаем через GoodImageViewSet (api/goods/images/)
  remove: (id) => api.delete(`goods/images/${id}/`),
  setAsInvoice: (id) => api.patch(`goods/images/${id}/set-as-invoice/`, {}).then(getData),
};

export const newslettersApi = {
  list: (config) => api.get('newsletters/', withConfig(config)).then(getData),
  detail: (id, config) => api.get(`newsletters/${id}/`, withConfig(config)).then(getData),

  remove: (id, config) => api.delete(`newsletters/${id}/`, withConfig(config)),
  // Создание базовой записи рассылки
  create: (data, config) => api.post('newsletters/', data, withConfig(config)).then(getData),
  
  // Загрузка изображения для конкретной рассылки
  uploadImage: (newsletterId, formData, config) => 
    api.post(`newsletters/${newsletterId}/upload-image/`, formData, withConfig(config)).then(getData),

  getProgress: () => api.get('/newsletters/progress/').then(res => res.data),
  getFileUrl: (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return path; // уже будет /media/... или /server-static/...
  }
};

// ==================== TASKS API ====================
export const tasksApi = {
  list: (config) => api.get('newsletter-tasks/', withConfig(config)).then(getData),
  pending: (config) => api.get('newsletter-tasks/pending/', withConfig(config)).then(getData),
  failed: (config) => api.get('newsletter-tasks/failed/', withConfig(config)).then(getData),
};
// ==================== ANALYTICS API ====================
export const analyticsApi = {
  getUsersStats: () => api.get('/analytics/users/').then(res => res.data),
};

// ==================== USERS API ====================
export const usersApi = {
  list: (config) => api.get('users/', withConfig(config)).then(getData),
  retrieve: (id, config) => api.get(`users/${id}/`, withConfig(config)).then(getData),
  update: (id, data, config) => api.put(`users/${id}/`, data, withConfig(config)).then(getData),
  partialUpdate: (id, data, config) => api.patch(`users/${id}/`, data, withConfig(config)).then(getData),
  remove: (id, config) => api.delete(`users/${id}/`, withConfig(config)),

  downloadCSV: (config) => api.get('users/csv/', { responseType: 'blob', ...(config || {}) }),
  cleanRegistrations: (config) => api.post('users/clean-registrations/', null, withConfig(config)).then(getData),
  cleanPayments: (config) => api.post('users/clean-payments/', null, withConfig(config)).then(getData),
};



// ==================== ADMINS API ====================
export const adminsApi = {
  list: (config) => api.get('users/', { params: { only_admins: true }, ...(config || {}) }).then(getData),
  retrieve: (id, config) => api.get(`users/${id}/`, withConfig(config)).then(getData),
  create: (data, config) => api.post('users/', { ...data, is_superuser: true }, withConfig(config)).then(getData),
  update: (id, data, config) => api.put(`users/${id}/`, data, withConfig(config)).then(getData),
  partialUpdate: (id, data, config) => api.patch(`users/${id}/`, data, withConfig(config)).then(getData),
  remove: (id, config) => api.delete(`users/${id}/`, withConfig(config)),
};


// ==================== BOT CONFIG API ====================
export const botConfigApi = {
  get: (config) => api.get('bot/config/', withConfig(config)).then(getData),
  partialUpdate: (data, config) => api.patch('bot/config/', data, withConfig(config)).then(getData),
  uploadInvoiceImage: (formData) => 
    api.post('bot/config/', formData).then(getData),
};



// ==================== REGISTRATION STEPS API ====================
export const registrationStepsApi = {
  list: (config) => api.get('bot/registration-steps/', withConfig(config)).then(getData),
  retrieve: (id, config) => api.get(`bot/registration-steps/${id}/`, withConfig(config)).then(getData),
  create: (data, config) => api.post('bot/registration-steps/', data, withConfig(config)).then(getData),
  update: (id, data, config) => api.put(`bot/registration-steps/${id}/`, data, withConfig(config)).then(getData),
  partialUpdate: (id, data, config) => api.patch(`bot/registration-steps/${id}/`, data, withConfig(config)).then(getData),
  remove: (id, config) => api.delete(`bot/registration-steps/${id}/`, withConfig(config)),

  // DRF action: POST /api/bot/registration-steps/reorder/
  // items - массив объектов [{id: 1, order: 1}, {id: 2, order: 2}, ...]
  reorder: (items, config) =>
    api.post('bot/registration-steps/reorder/', items, withConfig(config)).then(getData),
};


export default api;
