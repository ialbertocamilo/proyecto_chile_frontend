import { LucideIcon } from 'lucide-react';
import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  disabled?: boolean;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon: Icon, disabled = false, className}) => {
  return (
    <button
      style={{
        backgroundColor: 'var(--btn-save-bg)',
        color: '#fff',
        transition: 'background-color 0.3s ease, transform 0.3s ease'
      }}
      className={`btn btn-sm ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon size={16} />
    </button>
  );
};

export default IconButton;
