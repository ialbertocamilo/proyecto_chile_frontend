import Card from '@/components/common/Card';
import CustomButton from '@/components/common/CustomButton';
import Modal from '@/components/common/Modal';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import CancelButton from '../common/CancelButton';

interface ProjectStatusProps {
    status: string;
    projectId: string;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ status, projectId }) => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const getStatusWithEmoji = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'en proceso') return '🔄';
        if (lowerStatus === 'finalizado') return '✅';
        if (lowerStatus === 'registrado') return '📝';
        return '';
    };

    const handleCalculateResults = () => {
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
                    {status.toLowerCase() === 'en proceso' && (
                        <CustomButton
                            onClick={handleCalculateResults}
                            color="orange"
                        >
                            <span className="material-icons" >calculate</span>
                            Calcular resultados
                        </CustomButton>
                    )}
                </div>
            </Card>
            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title="Confirmación"
            >
                <p>Para realizar el cálculo, asegúrese de que todos los datos del proyecto estén correctamente llenos.</p>
                <div className="modal-actions d-flex justify-content-end gap-2 mt-3">
                    <CancelButton onClick={handleCancel} />
                    <CustomButton onClick={handleConfirm} className="btn btn-primary">Realizar cálculo</CustomButton>
                </div>
            </Modal>
        </>
    );
};

export default ProjectStatus;