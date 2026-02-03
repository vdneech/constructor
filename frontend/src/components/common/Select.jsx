import React, { useState } from 'react';
import { colors, spacing, borderRadius, transitions, shadows } from '../../styles/theme';
import { useIsMobile } from '../../hooks';

/**
 * Кастомный Select согласно разделу 3.3 ТЗ
 */
export default function Select({ 
  label,
  required = false,
  value,
  onChange,
  options = [],
  placeholder = 'Выберите...',
  error = null,
  hint = null,
  style = {},
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  const selectStyle = {
    width: '100%',
    padding: isMobile ? `14px ${spacing.md}px` : `${spacing.md}px ${spacing.lg}px`,
    paddingRight: isMobile ? '40px' : '48px',
    border: `2px solid ${isFocused ? colors.primary : colors.gray200}`,
    borderRadius: borderRadius.large,
    background: isFocused ? colors.white : colors.background,
    fontSize: isMobile ? 15 : 16,
    fontWeight: 500,
    color: value ? colors.primary : colors.gray400,
    fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: transitions.default,
    appearance: 'none',
    cursor: 'pointer',
    boxShadow: isFocused ? shadows.focus : 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%231C1C1C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${spacing.md}px center`,
    ...style,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: 14,
    fontWeight: 500,
    color: colors.gray500,
    letterSpacing: '0.025em',
  };

  const hintStyle = {
    marginTop: spacing.xs,
    color: colors.gray400,
    fontSize: 13,
    fontWeight: 500,
  };

  const errorStyle = {
    marginTop: spacing.xs,
    color: colors.errorText,
    fontSize: 13,
    fontWeight: 500,
  };

  return (
    <div>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: colors.errorText }}> *</span>}
        </label>
      )}
      <select
        style={selectStyle}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div style={errorStyle}>{error}</div>}
      {hint && !error && <div style={hintStyle}>{hint}</div>}
    </div>
  );
}
