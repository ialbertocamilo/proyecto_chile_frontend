import React from 'react';
import { useRouter } from 'next/router'; // Adjust if using a different router
import {Tooltip} from 'react-tooltip'; 
import CustomButton from './common/CustomButton';
import { ArrowLeft, Save } from 'lucide-react';


interface CreateButtonProps {
    backRoute: string;
    onSaveClick?: () => void;
    submitType?: boolean;
    saveText?: string;
    backTooltip?: string;
    saveTooltip?: string;
}

const CreateButton: React.FC<CreateButtonProps> = ({
    backRoute,
    onSaveClick,
    submitType = true,
    saveText = "Crear",
    backTooltip = "Volver",
    saveTooltip = "Guardar",
}) => {
    const router = useRouter();

    const handleSaveClick = (e: React.MouseEvent) => {
        if (!submitType && onSaveClick) {
            e.preventDefault();
            onSaveClick();
        }
    };

    return (
        <div className="d-flex gap-2">
            <div data-tip={backTooltip}>
                <CustomButton
                    type="button"
                    onClick={() => router.push(backRoute)}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                </CustomButton>
            </div>
            
            <div data-tip={saveTooltip}>
                <CustomButton
                    type={submitType ? "submit" : "button"}
                    variant="save"
                    onClick={!submitType ? handleSaveClick : undefined}
                >
                    <Save className="w-4 h-4 mr-1" />
                    <span className="d-none d-sm-inline">{saveText}</span>
                </CustomButton>
            </div>
            
            <Tooltip />
        </div>
    );
};

export default CreateButton;