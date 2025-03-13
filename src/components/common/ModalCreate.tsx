// ModalCreate.tsx
import React, { useState, useEffect } from 'react';
import CancelButton from '@/components/common/CancelButton';
import CustomButton from '@/components/common/CustomButton';

interface ModalCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
  /** Título del modal (opcional) */
  title?: string;
  /** Etiqueta para el botón de crear (opcional) */
  saveLabel?: string;
  /** Estilos personalizados para el contenedor del modal (opcional) */
  modalStyle?: React.CSSProperties;
  /** Estilos personalizados para el overlay (opcional) */
  overlayStyle?: React.CSSProperties;
}

const ModalCreate: React.FC<ModalCreateProps> = ({
  isOpen,
  onClose,
  onSave,
  children,
  title,
  saveLabel = 'Crear',
  modalStyle,
  overlayStyle,
}) => {
  // Controla si se ejecuta en el cliente para usar window.innerWidth
  const [isClient, setIsClient] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!isOpen) return null;

  // Estilos por defecto para el overlay (fondo semi-transparente)
  const defaultOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1200,
    backdropFilter: 'blur(3px)',
    transition: 'all 0.3s ease-in-out',
  };

  // Estilos por defecto para el modal (con bordes redondeados)
  const defaultModalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    position: 'relative',
    minWidth: '300px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease-in-out',
  };

  // Ajustes responsivos en función del ancho de la ventana
  const responsiveModalStyle: React.CSSProperties = {
    ...(windowWidth < 768 ? { padding: '20px' } : {}),
    ...(windowWidth < 480 ? { margin: '10px', padding: '16px', borderRadius: '8px' } : {}),
  };

  return (
    <div
      style={{ ...defaultOverlayStyle, ...overlayStyle }}
      onClick={onClose} // Cierra el modal al hacer clic en el overlay
    >
      <div
        style={{ ...defaultModalStyle, ...responsiveModalStyle, ...modalStyle }}
        onClick={(e) => e.stopPropagation()} // Evita cerrar el modal al hacer clic en su contenido
      >
        {/* Botón para cerrar el modal en la esquina superior derecha */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f0f0f0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          aria-label="Cerrar modal"
        >
          ✕
        </button>
        {title && <h4>{title}</h4>}
        {children}
        {/* Footer con botones: cancelar (izquierda) y crear (derecha) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '24px',
          }}
        >
          <CancelButton onClick={onClose} />
          <CustomButton variant="save" onClick={onSave}>
            {saveLabel}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ModalCreate;
