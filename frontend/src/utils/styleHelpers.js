// utils/styleHelpers.js - НОВЫЙ ФАЙЛ

import { pageStyles } from '../styles/pageStyles';

/**
 * Универсальный хелпер для создания dynamicStyles
 * Использование:
 * 
 * const styles = createDynamicStyles(isMobile, {
 *   card: [pageStyles.card, pageStyles.cardMobile],
 *   fieldRow: [pageStyles.fieldRow, pageStyles.fieldRowMobile],
 *   photoGrid: [pageStyles.photoGrid, pageStyles.photoGridMobile],
 * });
 */
export function createDynamicStyles(isMobile, styleMap) {
  const result = {};

  Object.keys(styleMap).forEach(key => {
    const [desktop, mobile] = styleMap[key];
    result[key] = {
      ...desktop,
      ...(isMobile && mobile),
    };
  });

  return result;
}

// ПРИМЕР ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТЕ:
import { createDynamicStyles } from '../../utils/styleHelpers';

export default function MyPage() {
  const isMobile = useIsMobile();

  const styles = createDynamicStyles(isMobile, {
    card: [pageStyles.card, pageStyles.cardMobile],
    fieldRow: [pageStyles.fieldRow, pageStyles.fieldRowMobile],
    photoGrid: [pageStyles.photoGrid, pageStyles.photoGridMobile],
  });

  return (
    <div style={styles.card}>
      <div style={styles.fieldRow}>
        {/* ... */}
      </div>
    </div>
  );
}