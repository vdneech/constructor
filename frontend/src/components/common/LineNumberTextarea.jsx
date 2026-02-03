import React, { useCallback, useRef, useState } from 'react';
import { colors, borderRadius, spacing } from '../../styles/theme';

/**
 * Компонент LineNumberTextarea - textarea с номерами строк
 */
export default function LineNumberTextarea({
  value = '',
  onChange,
  rows = 10,
  placeholder = '',
  disabled = false,
  spellCheck = false,
  hint = '',
  style = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Подсчет количества строк
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, rows) }, (_, i) => i + 1);

  // Синхронизация скролла
  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          border: focused ? `2px solid ${colors.primary}` : `2px solid ${colors.gray200}`,
          borderRadius: borderRadius.large,
          background: colors.white,
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          display: 'flex',
          fontFamily: 'monospace',
          ...style,
        }}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          style={{
            padding: `${spacing.md}px ${spacing.sm}px`,
            background: colors.gray100,
            color: colors.gray400,
            fontSize: 14,
            lineHeight: 1.6,
            textAlign: 'right',
            userSelect: 'none',
            overflow: 'hidden',
            borderRight: `1px solid ${colors.gray200}`,
            minWidth: 48,
          }}
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={spellCheck}
          onScroll={handleScroll}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            width: '100%',
            padding: `${spacing.md}px ${spacing.md}px`,
            border: 'none',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            background: 'transparent',
            color: colors.primary,
            fontFamily: 'monospace',
            minHeight: `${rows * 24}px`,
          }}
          {...props}
        />
      </div>

      {hint && (
        <div
          style={{
            marginTop: spacing.xs,
            color: colors.gray400,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
