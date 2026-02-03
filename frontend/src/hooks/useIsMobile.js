import { useState, useEffect } from 'react';

/**
 * Хук для определения мобильного устройства
 * @param {number} breakpoint - точка перелома в пикселях (по умолчанию 768px согласно ТЗ)
 * @returns {boolean} - true если ширина окна <= breakpoint
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
