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
            className="btn btn-sm btn-danger mt-2 hover:opacity-80 transition-opacity duration-200" 
            onClick={onClick}
            title={title}
            aria-label={title}
        >
            <X size={16} />Cancelar
        </button>
    );
};

export default CancelButton;