import { X } from 'lucide-react';
import React from 'react';

interface CancelButtonProps {
  onClick: () => void;
  title?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({ 
  onClick, 
  title = 'Cancel' 
}) => {
  return (
    <button 
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: 'var(--primary-color)',
        border: 'none',
        fontSize: '14px',
        borderRadius: '8px',
        padding: '10px 16px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontWeight: 500,
        letterSpacing: '0.3px',
        minWidth: 'max-content',
        whiteSpace: 'normal',
        lineHeight: 1.5,
        height: 'auto'
      }}
      className="btn btn-sm btn-danger mt-2 m-2 hover:opacity-80 transition-opacity duration-200"
    >
      {/* <X size={16} /> */}Cancelar
    </button>
  );
};

export default CancelButton;
