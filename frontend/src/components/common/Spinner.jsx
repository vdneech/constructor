import React from 'react';
import { colors } from '../../styles/theme';

/**
 * Компонент индикатора загрузки (спиннер)
 */
export default function Spinner({ size = 40, style = {} }) {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `4px solid ${colors.gray100}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...style,
  };

  return (
    <>
      <div style={spinnerStyle} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
