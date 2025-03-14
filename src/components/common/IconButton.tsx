import { LucideIcon } from 'lucide-react';
import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  disabled?: boolean;
  className?: string;
  text?: string;
  tooltip?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  icon: Icon, 
  disabled = false, 
  className = '',
  text,
  tooltip
}) => {
  return (
    <button
      style={{
        backgroundColor: 'var(--btn-save-bg)',
        color: '#fff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(0)'
      }}
      className={`btn btn-primary ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      <Icon size={16} />
      {text && <span>{text}</span>}
    </button>
  );
};

export default IconButton;
