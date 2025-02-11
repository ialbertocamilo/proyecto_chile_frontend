// src/components/common/CustomButton.tsx
import React, { ButtonHTMLAttributes, FC } from 'react';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'save' | 'back' | 'delete' | 'editIcon' | 'deleteIcon' | 'backIcon' | 'forwardIcon' | 'addIcon';
  isLoading?: boolean;
  margin?: string;
}

const CustomButton: FC<CustomButtonProps> = ({
  variant = 'save',
  isLoading = false,
  children,
  className = '',
  disabled,
  margin = '0.5rem',
  ...rest
}) => {
  let content: React.ReactNode = children;
  if (variant === 'editIcon') {
    content = (
      <>
        <span className="btn-icon-content">
          {/* icono de editar */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </span>
      </>
    );
  } else if (variant === 'deleteIcon') {
    content = (
      <>
        <span className="btn-icon-content">
          {/* icono de borrar */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z" />
          </svg>
        </span>
      </>
    );
  } else if (variant === 'backIcon') {
    content = (
      <>
        <span className="btn-icon-content">
          {/* icono de regresar (flecha izquierda) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      </>
    );
  } else if (variant === 'forwardIcon') {
    content = (
      <>
        <span className="btn-icon-content">
          {/* icono de avanzar (flecha derecha) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </>
    );
  } else if (variant === 'addIcon') {
    content = (
      <>
        <span className="btn-icon-content">
          {/* Ícono de agregar */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </>
    );
  }

  const variantClass = `btn-${variant}`;
  const disabledClass = disabled || isLoading ? 'disabled' : '';

  return (
    <>
      <button
        type="button"
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        style={{ margin }}
        className={`btn ${variantClass} ${className} ${disabledClass}`}
        {...rest}
      >
        {isLoading ? <span className="loading">Cargando...</span> : content}
      </button>
      <style jsx>{`
        .btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease, transform 0.2s ease;
          cursor: pointer;
          outline: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        /* Variantes de color */
        .btn-save {
          background-color: #3ca7b7;
          color: #ffffff;
        }
        .btn-save:hover {
          background-color: #359ea7;
        }
        .btn-back {
          background-color: #6b7280;
          color: #ffffff;
        }
        .btn-back:hover {
          background-color: #4b5563;
        }
        .btn-delete {
          background-color: #ef4444;
          color: #ffffff;
        }
        .btn-delete:hover {
          background-color: #dc2626;
        }
        .btn-editIcon {
          background-color: #3ca7b7;
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-editIcon:hover {
          background-color: #359ea7;
        }
        .btn-deleteIcon {
          background-color: #ef4444;
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-deleteIcon:hover {
          background-color: #dc2626;
        }
        .btn-backIcon {
          background-color: #3ca7b7;
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-backIcon:hover {
          background-color: #359ea7;
        }
        .btn-forwardIcon {
          background-color: #3ca7b7;
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-forwardIcon:hover {
          background-color: #359ea7;
        }
        .btn-addIcon {
          background-color: #3ca7b7;
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-addIcon:hover {
          background-color: #359ea7;
        }
        .disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .loading {
          font-style: italic;
        }
        /* Estilos para botones con ícono */
        .btn-icon-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px; /* ancho fijo para mostrar solo el ícono */
        }
        .icon {
          display: block;
        }
        /* La etiqueta se oculta inicialmente con max-width y opacity */
        .btn-label {
          display: inline-block;
          max-width: 0;
          overflow: hidden;
          opacity: 0;
          margin-left: 0;
          white-space: nowrap;
          transition: max-width 0.3s ease, opacity 0.3s ease, margin-left 0.3s ease;
        }
        /* Al hacer hover sobre el botón, se expande la etiqueta */
        .btn:hover .btn-label {
          max-width: 100px; /* Ajusta según el ancho requerido */
          opacity: 1;
          margin-left: 0.5rem;
        }
      `}</style>
    </>
  );
};

export default CustomButton;
