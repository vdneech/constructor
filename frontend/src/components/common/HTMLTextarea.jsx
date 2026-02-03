import React, { useRef, useState, useEffect } from 'react';
import { renderHighlighted } from '../../utils/htmlFormatter';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';
import { useIsMobile } from '../../hooks';

export default function HTMLTextarea({ 
  value = '', 
  onChange, 
  placeholder,
  htmlTags = 'HTML',
  rows = 12,
  label, 
  required = false,
  hint = null, 
  error = null, 
  style = {}, 
  ...props 
}) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const [focused, setFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const isMobile = useIsMobile();
  
  // Закрытие тултипа при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const insertTag = (openTag, closeTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newValue = `${before}${openTag}${selectedText}${closeTag}${after}`;
    onChange({ target: { value: newValue } });

    setTimeout(() => {
      textarea.focus();
      const cursorOffset = selectedText.length > 0 
        ? openTag.length + selectedText.length + closeTag.length 
        : openTag.length;
      
      const newPos = start + cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const sharedStyles = {
    padding: isMobile ? '16px' : '20px',
    fontSize: isMobile ? '15px' : '16px',
    lineHeight: '1.6',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    width: '100%',
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    border: 'none',
    margin: 0,
    outline: 'none',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  const toolbarTags = [
    { label: '<b>', open: '<b>', close: '</b>', title: 'Жирный текст' },
    { label: '<i>', open: '<i>', close: '</i>', title: 'Курсив' },
    { label: '<code>', open: '<code>', close: '</code>', title: 'Моноширинный код' },
    { label: '<a>', open: '<a href="">', close: '</a>', title: 'Добавить ссылку' },
  ];

  return (
    <div style={{ marginBottom: spacing.lg }}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: spacing.xs, position: 'relative' }}>
        {label && (
          <div style={{ fontSize: 14, fontWeight: 500, color: colors.gray500 }}>
            {label} {required && <span style={{ color: colors.errorText, marginLeft: 2 }}>*</span>}
          </div>
        )}
        
        {/* Бейдж и Тултип */}
        <div style={{ position: 'relative' }} ref={tooltipRef}>
          <div 
            style={styles.htmlBadge} 
            onClick={() => setShowTooltip(!showTooltip)}
          >
            {htmlTags}
          </div>

          {showTooltip && (
            <div style={styles.tooltip}>
              Это текстовое поле поддерживает HTML-форматирование
              <div style={styles.tooltipArrow} />
            </div>
          )}
        </div>
      </div>
      
      <div style={{
        position: 'relative',
        border: `2px solid ${error ? colors.errorText : (focused ? colors.primary : colors.gray200)}`,
        borderRadius: borderRadius.large,
        background: colors.white,
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        boxShadow: focused ? '0 0 0 4px rgba(28, 28, 28, 0.05)' : 'none',
        ...style,
      }}>
        <div
          ref={highlightRef}
          aria-hidden="true"
          style={{
            ...sharedStyles,
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 0, color: colors.gray800, 
            pointerEvents: 'none', overflow: 'hidden',
            backgroundColor: 'transparent',
          }}
          dangerouslySetInnerHTML={{ 
            __html: renderHighlighted(value) + (value.endsWith('\n') ? '&nbsp;' : '') 
          }}
        />
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={rows}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            ...sharedStyles,
            position: 'relative',
            zIndex: 1,
            background: 'transparent',
            color: 'transparent',
            caretColor: colors.primary,
            resize: 'vertical',
            display: 'block',
            overflowY: 'auto',
            
          }}
          {...props}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: spacing.xs }}>
        {toolbarTags.map(tag => (
          <button
            key={tag.label}
            type="button"
            title={tag.title}
            onClick={() => insertTag(tag.open, tag.close)}
            style={styles.tagBtn}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          {error && <div style={{ color: colors.errorText, fontSize: 12, fontWeight: 500 }}>{error}</div>}
          {hint && !error && <div style={{ color: colors.gray400, fontSize: 13, fontWeight: 500}}>{hint}</div>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  tagBtn: {
    padding: '4px 8px',
    background: colors.white,
    border: `1px solid ${colors.gray200}`,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    color: colors.gray500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    outline: 'none',
  },
  htmlBadge: {
    padding: '3px 8px',
    background: colors.gray100,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 800,
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    width: '200px',
    textAlign: 'center',
    zIndex: 100,
    boxShadow: shadows.md,
    lineHeight: '1.4',
    pointerEvents: 'none'
  },
  tooltipArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '5px',
    borderStyle: 'solid',
    borderColor: '#333 transparent transparent transparent'
  }
};