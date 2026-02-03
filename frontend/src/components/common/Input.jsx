import React, { useState } from 'react';
import { inputBase, inputMobile, inputStates } from '../../styles/commonStyles';
import { colors, spacing } from '../../styles/theme';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * Текстовое поле согласно разделу 3.3 ТЗ
 */
export default function Input({
  label,
  required = false,
  error = null,
  hint = null,
  style = {},
  multiline, // ✅ Извлекаем отдельно, чтобы не передавать в DOM
  ...props // Остальные пропсы идут в input
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  const inputStyle = {
    ...inputBase,
    ...(isMobile && inputMobile),
    ...(isFocused ? inputStates.focus : inputStates.default),
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
    minHeight: 35,
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
      <input
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props} // ✅ multiline уже исключен из props
      />
      {hint && !error && <div style={hintStyle}>{hint}</div>}
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}