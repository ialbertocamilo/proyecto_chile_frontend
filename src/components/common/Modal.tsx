import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Título del modal */
  title?: string;
  /** Estilos personalizados para el contenedor del modal */
  modalStyle?: React.CSSProperties;
  /** Estilos personalizados para el overlay */
  overlayStyle?: React.CSSProperties;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  modalStyle,
  overlayStyle,
}) => {
  if (!isOpen) return null;

  // Estilos por defecto para el overlay (fondo semi-transparente)
  const defaultOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  // Estilos por defecto para el modal (con bordes redondeados)
  const defaultModalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    position: 'relative',
    minWidth: '300px',
    maxWidth: '90%',
  };

  return (
    <div
      style={{ ...defaultOverlayStyle, ...overlayStyle }}
      onClick={onClose} // Cierra el modal al hacer clic en el overlay
    >
      <div
        style={{ ...defaultModalStyle, ...modalStyle }}
        onClick={(e) => e.stopPropagation()} // Evita cerrar el modal al hacer clic en su contenido
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        {title && (
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
