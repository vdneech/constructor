/**
 * Создает FormData из объекта формы
 * Согласно разделу 7.1 ТЗ "Правила работы с формами"
 * Опциональные поля не добавляются, если пустые
 */
export function buildFormData(data) {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    // Пропускаем пустые значения
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Обработка массивов (например, файлов)
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item);
      });
      return;
    }

    // Обработка boolean
    if (typeof value === 'boolean') {
      formData.append(key, value);
      return;
    }

    // Обычные значения
    formData.append(key, value);
  });

  return formData;
}
