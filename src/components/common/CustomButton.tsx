import React, { ButtonHTMLAttributes, FC } from 'react';
import GoogleIcons from '../../../public/GoogleIcons';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'save' | 'back' | 'delete' | 'editIcon' | 'deleteIcon' | 'backIcon' | 'forwardIcon' | 'addIcon' | 'listIcon' | 'cancelIcon';
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
      <span className="btn-icon-content material-icons">edit</span>
    );
  } else if (variant === 'deleteIcon') {
    content = (
      <span className="btn-icon-content material-icons">delete</span>
    );
  } else if (variant === 'backIcon') {
    content = (
      <span className="btn-icon-content material-icons">arrow_back</span>
    );
  } else if (variant === 'forwardIcon') {
    content = (
      <span className="btn-icon-content material-icons">arrow_forward</span>
    );
  } else if (variant === 'addIcon') {
    content = (
      <span className="btn-icon-content material-icons">add</span>
    );
  } else if (variant === 'listIcon') {
    content = (
      <span className="btn-icon-content material-icons">format_list_bulleted</span>
    );
  } else if (variant === 'cancelIcon') {
    content = (
      <span className="btn-icon-content material-icons">close</span>
    );
  }

  const variantClass = `btn-${variant}`;
  const disabledClass = disabled || isLoading ? 'disabled' : '';

  return (
    <>
      {/* Carga la hoja de estilos de Material Icons */}
      <GoogleIcons />
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
        /* Variantes de color usando CSS variables */
        .btn-save {
          background-color: var(--btn-save-bg);
          color: #ffffff;
        }
        .btn-save:hover {
          background-color: var(--btn-save-hover-bg);
        }
        .btn-back {
          background-color: var(--btn-back-bg);
          color: #ffffff;
        }
        .btn-back:hover {
          background-color: var(--btn-back-hover-bg);
        }
        .btn-delete {
          background-color: var(--btn-delete-bg);
          color: #ffffff;
        }
        .btn-delete:hover {
          background-color: var(--btn-delete-hover-bg);
        }
        .btn-editIcon {
          background-color: var(--btn-save-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-editIcon:hover {
          background-color: var(--btn-save-hover-bg);
        }
        .btn-deleteIcon {
          background-color: var(--btn-delete-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-deleteIcon:hover {
          background-color: var(--btn-delete-hover-bg);
        }
        .btn-backIcon {
          background-color: var(--btn-save-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-backIcon:hover {
          background-color: var(--btn-save-hover-bg);
        }
        .btn-forwardIcon {
          background-color: var(--btn-save-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-forwardIcon:hover {
          background-color: var(--btn-save-hover-bg);
        }
        .btn-addIcon {
          background-color: var(--btn-save-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-addIcon:hover {
          background-color: var(--btn-save-hover-bg);
        }
        .btn-listIcon {
          background-color: var(--btn-save-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-listIcon:hover {
          background-color: var(--btn-save-hover-bg);
        }
        .btn-cancelIcon {
          background-color: var(--btn-delete-bg);
          color: #ffffff;
          padding: 0.5rem 1rem;
        }
        .btn-cancelIcon:hover {
          background-color: var(--btn-delete-hover-bg);
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
          font-size: 20px;
        }
        .material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 20px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        .btn-label {
          display: inline-block;
          max-width: 0;
          overflow: hidden;
          opacity: 0;
          margin-left: 0;
          white-space: nowrap;
          transition: max-width 0.3s ease, opacity 0.3s ease, margin-left 0.3s ease;
        }
        .btn:hover .btn-label {
          max-width: 100px;
          opacity: 1;
          margin-left: 0.5rem;
        }
      `}</style>
    </>
  );
};

export default CustomButton;
