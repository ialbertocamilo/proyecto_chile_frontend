import { LucideIcon } from 'lucide-react';
import React, { ButtonHTMLAttributes, FC } from 'react';
import GoogleIcons from '../../../public/GoogleIcons';

interface CustomButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?:
  | 'save'
  | 'back'
  | 'delete'
  | 'editIcon'
  | 'deleteIcon'
  | 'backIcon'
  | 'forwardIcon'
  | 'addIcon'
  | 'listIcon'
  | 'cancelIcon'
  | 'viewIcon';
  type?: 'button' | 'submit';
  isLoading?: boolean;
  margin?: string;
  icon?: LucideIcon;
  iconSize?: number;
}

const CustomButton: FC<CustomButtonProps> = ({
  variant = 'save',
  isLoading = false,
  children,
  className = '',
  disabled,
  margin = '0.5rem',
  icon: Icon,
  iconSize = 16,
  type = 'button',
  ...rest
}) => {
  let content: React.ReactNode = children;
  let tooltipText = '';

  if (variant === 'editIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>edit</span>;
    tooltipText = 'Editar';
  } else if (variant === 'deleteIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>delete</span>;
    tooltipText = 'Eliminar';
  } else if (variant === 'backIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>arrow_back</span>;
    tooltipText = 'Volver';
  } else if (variant === 'forwardIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>arrow_forward</span>;
    tooltipText = 'Siguiente';
  } else if (variant === 'addIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>add</span>;
    tooltipText = 'Agregar';
  } else if (variant === 'listIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>format_list_bulleted</span>;
    tooltipText = 'Ver lista';
  } else if (variant === 'cancelIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>close</span>;
    tooltipText = 'Cancelar';
  } else if (variant === 'viewIcon') {
    content = <span className="btn-icon-content material-icons" style={{ fontSize: "1.5rem" }}>visibility</span>;
    tooltipText = 'Ver detalles';
  }

  const variantClass = `btn-${variant}`;
  const disabledClass = disabled || isLoading ? 'disabled' : '';

  return (
    <>
      <GoogleIcons />
      <button
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        style={{ margin }}
        className={`button btn-small px-4 btn btn-primary ${variantClass} ${className} ${disabledClass}`}
        title={tooltipText}
        {...rest}
      >
        {isLoading ? <span className="loading">Cargando...</span> : (
          <>
            {Icon && <Icon size={iconSize} className="me-2" />}
            {content}
          </>
        )}
      </button>
      <style jsx>{`
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease, transform 0.3s ease;
          background-color: var(--btn-save-bg) !important; 
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
        }


.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-large {
  padding: 15px 30px;
  font-size: 18px;
}
  
        .btn:hover {
          background-color: var(--btn-save-hover-bg) !important;
          transform: scale(1.05);
        }

        .btn:active {
          transform: scale(0.95);
        }

        .btn-icon-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .btn-icon-content:hover {
          transform: rotate(360deg);
        }

        .loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default CustomButton;