// components/common/ImageUploader.jsx
import React, { useRef, useState } from 'react';
import Spinner from './Spinner';
import { colors, borderRadius, spacing, shadows, transitions } from '../../styles/theme';

const ImageUploader = ({
  src,
  onUpload,
  onDelete,
  loading = false,
  isMain = false,
  onSetMain,
  height = '220px',
  label = 'Загрузить фото',
  className = '',
  style = {},
  children,
}) => {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: height,
    borderRadius: borderRadius.photo,
    overflow: 'hidden',
    cursor: src ? 'default' : 'pointer',
    border: src
      ? (isMain ? `2px solid ${colors.success}` : `1px solid ${colors.gray200}`)
      : `2px dashed ${colors.gray300}`,
    backgroundColor: src ? colors.white : colors.gray100,
    transition: transitions.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    opacity: isHovered ? 1 : 0,
    transition: transitions.default,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const buttonStyle = {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    background: colors.white,
    border: 'none',
    borderRadius: borderRadius.small,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: colors.primary,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={!src ? triggerUpload : undefined}
      onMouseEnter={() => src && setIsHovered(true)}
      onMouseLeave={() => src && setIsHovered(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {loading && <Spinner />}

      {!loading && src && (
        <>
          <img src={src} alt="Preview" style={imageStyle} />
          <div style={overlayStyle}>
            {onSetMain && !isMain && (
              <button
                style={buttonStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetMain();
                }}
              >
                Сделать главным
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...buttonStyle, background: colors.errorBg, color: colors.errorText }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Удалить
              </button>
            )}
          </div>
        </>
      )}

      {!loading && !src && (
        <div style={{ textAlign: 'center', color: colors.gray400, fontSize: 14, fontWeight: 500 }}>
          {children || label}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;