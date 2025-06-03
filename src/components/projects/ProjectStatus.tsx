import Card from '@/components/common/Card';
import CustomButton from '@/components/common/CustomButton';
import Modal from '@/components/common/Modal';
import { validateProject } from "@/service/validate-project";
import { notify } from "@/utils/notify";
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CancelButton from '../common/CancelButton';

interface ProjectStatusProps {
    status: string;
    projectId: string;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ status, projectId }) => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isProjectValid, setIsProjectValid] = useState<boolean>(true);
    const [validationErrorMessage, setValidationErrorMessage] = useState<string>("");
    const [isValidating, setIsValidating] = useState<boolean>(false);

    useEffect(() => {
        // Validate project when component mounts
        if (status.toLowerCase() === 'en proceso') {
            validateProjectStatus();
        }
    }, [projectId]);

    const validateProjectStatus = async () => {
        try {
            setIsValidating(true);
            const validationResult = await validateProject(parseInt(projectId), true);
            setIsProjectValid(validationResult.valid);

            if (!validationResult.valid) {
                // Create error message with details about failed enclosures
                let errorMessage = "El proyecto no cumple con todos los requisitos necesarios para el cálculo:";

                if (validationResult.failed_enclosures && validationResult.failed_enclosures.length > 0) {
                    errorMessage += "\n\n- Hay recintos sin los elementos constructivos requeridos.";
                }

                setValidationErrorMessage(errorMessage);
            }
        } catch (error) {
            console.error("Error validating project:", error);
            setIsProjectValid(false);
            setValidationErrorMessage("Error al validar el proyecto. Inténtelo nuevamente.");
        } finally {
            setIsValidating(false);
        }
    };

    const getStatusWithEmoji = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'en proceso') return '🔄';
        if (lowerStatus === 'finalizado') return '✅';
        if (lowerStatus === 'registrado') return '📝';
        return '';
    }; const handleCalculateResults = async () => {
        if (!isProjectValid) {
            // If project is invalid, show the error message
            notify(validationErrorMessage, "error");
            return;
        }

        // If project is valid, show the confirmation modal
        setShowModal(true);
    };

    const handleConfirm = () => {
        setShowModal(false);
        router.push(`/calculation-result?id=${projectId}`);
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    return (
        <>
            <Card>
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center gap-2 mx-0">
                        Estado: <span><strong>{getStatusWithEmoji(status)} {status.toUpperCase()}</strong></span>
                    </div>
                    {status.toLowerCase() === 'en proceso' && (<div className={!isProjectValid ? "disabled-button-wrapper" : ""}>
                        <CustomButton
                            onClick={handleCalculateResults}
                            color="orange"
                            disabled={isValidating}
                            className={!isProjectValid ? "calculate-button" : ""}
                        >
                            <span className="material-icons">calculate</span>
                            {isValidating ? "Validando..." : "Calcular resultados"}
                        </CustomButton>
                    </div>
                    )}
                </div>
            </Card>
            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title="Confirmación"
            >
                <p>Para realizar el cálculo, asegúrese de que todos los datos del proyecto estén correctamente llenos.</p>
                <div className="modal-actions d-flex justify-content-between gap-2 mt-3">
                    <CancelButton onClick={handleCancel} />
                    <CustomButton onClick={handleConfirm} className="btn btn-primary">Realizar cálculo</CustomButton>
                </div>
            </Modal>
        </>
    );
};

export default ProjectStatus;