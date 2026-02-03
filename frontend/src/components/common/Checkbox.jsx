import React from 'react';
import { checkCard } from '../../styles/commonStyles';
import { borderRadius, colors } from '../../styles/theme';

/**
 * Checkbox с описанием согласно дизайн-системе ТЗ
 */
export default function Checkbox({ 
  checked, 
  onChange, 
  title, 
  description,
  style = {},
  ...props 
}) {
  const checkRowStyle = {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    cursor: 'pointer',
  };

  const checkboxStyle = {
    width: 20,
    height: 20,
    marginTop: 2,
    accentColor: colors.primary,
    cursor: 'pointer',
    flexShrink: 0,
  };

  const checkTitleStyle = {
    fontWeight: 700,
    color: colors.primary,
    fontSize: 15,
  };

  const checkHintStyle = {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 500,
    color: colors.gray500,
  };

  return (
    <div style={{ ...checkCard, ...style }}>
      <label style={checkRowStyle}>
        <input
          type="checkbox"
          style={checkboxStyle}
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div>
          <div style={checkTitleStyle}>{title}</div>
          {description && <div style={checkHintStyle}>{description}</div>}
        </div>
      </label>
    </div>
  );
}
