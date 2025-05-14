import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { ProgressBar } from './ProgressBar';

interface CreationStatus {
    inProgress: boolean;
    completedRooms: number;
    totalRooms: number;
    currentRoom?: string;
    currentPhase?: 'walls' | 'floors' | 'ceilings' | 'doors' | 'windows' | 'creating-room';
    currentComponent?: string;
    progress: {
        rooms: number;
        walls: number;
        floors: number;
        ceilings: number;
        doors: number;
        windows: number;
    };
    errors: { message: string; context: string }[];
}

interface ProjectStatusPanelProps {
    creationStatus: CreationStatus;
}

export const ProjectStatusPanel: React.FC<ProjectStatusPanelProps> = ({ creationStatus }) => {
    const getPhaseText = (phase?: string): string => {
        if (!phase) return '';

        switch (phase) {
            case 'walls': return 'Muros';
            case 'floors': return 'Pisos';
            case 'ceilings': return 'Techos';
            case 'doors': return 'Puertas';
            case 'windows': return 'Ventanas';
            case 'creating-room': return 'Creando recinto';
            default: return '';
        }
    };

    return (
        <Row className="mt-2">
            <Col>
                <div className="card">
                    <div className="card-body">
                        <h6 className="card-title">Estado de Progreso</h6>

                        {creationStatus.currentRoom && (
                            <div className="alert alert-info py-2">
                                <strong>Recinto actual:</strong> {creationStatus.currentRoom}
                                {creationStatus.currentPhase && (
                                    <span className="ms-2">
                                        - <em>{getPhaseText(creationStatus.currentPhase)}</em>
                                    </span>
                                )}
                            </div>
                        )}

                        {creationStatus.currentComponent && (
                            <div className="mb-3">
                                <strong>Actividad actual:</strong> {creationStatus.currentComponent}
                            </div>
                        )}

                        {/* Overall room progress */}
                        <ProgressBar
                            label="Recintos"
                            value={creationStatus.completedRooms}
                            max={creationStatus.totalRooms}
                            variant="success"
                        />

                        {/* Component-level progress */}
                        <div className="mt-3">
                            <h6>Elementos creados:</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <small>Muros: {creationStatus.progress.walls}</small>
                                </div>
                                <div className="col-md-6">
                                    <small>Pisos: {creationStatus.progress.floors}</small>
                                </div>
                                <div className="col-md-6">
                                    <small>Techos: {creationStatus.progress.ceilings}</small>
                                </div>
                                <div className="col-md-6">
                                    <small>Puertas: {creationStatus.progress.doors}</small>
                                </div>
                                <div className="col-md-6">
                                    <small>Ventanas: {creationStatus.progress.windows}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
    );
};
