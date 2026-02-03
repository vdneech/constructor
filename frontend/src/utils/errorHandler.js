/**
 * Парсинг ошибок API в читаемый формат
 * Согласно разделу 4.3 ТЗ "Уведомления и ошибки"
 * @param {Error} err - объект ошибки
 * @returns {string} - читаемое сообщение об ошибке
 */
export function parseApiError(err) {
  if (err.response?.data) {
    const data = err.response.data;
    
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    const fieldErrors = [];
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (Array.isArray(val)) {
        fieldErrors.push(`${key}: ${val.join(', ')}`);
      } else {
        fieldErrors.push(`${key}: ${String(val)}`);
      }
    });

    return fieldErrors.length ? fieldErrors.join('\n') : 'Ошибка валидации';
  }
  return err.message || 'Неизвестная ошибка';
}
