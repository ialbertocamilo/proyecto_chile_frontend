import { SaveIcon } from 'lucide-react';
import React from 'react';
import IconButton from './IconButton';

interface SaveButtonProps {
    onClick: () => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    color?: 'inherit' | 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
    tooltip?: string;
    className?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
    onClick,
    disabled = false,
    className = '',
    tooltip = 'Guardar'
}) => {
    return <IconButton
        onClick={onClick}
        icon={SaveIcon}
        text='Continuar'
        disabled={disabled}
        className={className}
        tooltip={tooltip}
    />
};

export default SaveButton;