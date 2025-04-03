import { Eye } from "lucide-react";
import { useState } from "react";
import Card from "../common/Card";
import Modal from "../common/Modal";

interface DetailedUser {
    id: number;
    name: string;
    email: string;
    last_name: string;
    created_at: string;
    status: boolean;
    project_count: number;
    project_ids: number[];
}

interface DetailedUsersReportProps {
    loading: boolean;
    data: DetailedUser[] | null;
}

export const DetailedUsersReport = ({ loading, data }: DetailedUsersReportProps) => {
    const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
    const [showModal, setShowModal] = useState(false);

    if (loading) {
        return (
            <Card className="chart-card p-4 text-center h-100">
                <h5>Usuarios con más proyectos registrados</h5>
                <div className="spinner-border primary-db" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </Card>
        );
    }

    const handleViewProjects = (user: DetailedUser) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    return (
        <Card>
            <h5 className="mb-4">Usuarios con más proyectos registrados</h5>
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="table table-hover">
                    <tbody>
                        {data?.map((user) => (
                            <tr key={user.id}>
                                <td>{`${user.name} ${user.last_name}`}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${user.status ? 'bg-success' : 'bg-danger'}`}>
                                        {user.status ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>{user.project_count}</td>
                                <td>
                                    <Eye
                                        size={18}
                                        onClick={() => !user.project_count || handleViewProjects(user)}
                                        style={{
                                            cursor: user.project_count ? 'pointer' : 'not-allowed',
                                            color: user.project_count ? 'var(--primary)' : '#ccc',
                                            transition: 'color 0.2s ease'
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Proyectos de ${selectedUser?.name} ${selectedUser?.last_name}`}
            >
                <div className="p-3">
                    <h6>Total de proyectos: {selectedUser?.project_count}</h6>
                    <div className="mt-3">
                        {selectedUser?.project_ids.length ? (
                            <ul className="list-group">
                                {selectedUser.project_ids.map((projectId) => (
                                    <li key={projectId} className="list-group-item">
                                        Proyecto ID: {projectId}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">Este usuario no tiene proyectos asignados.</p>
                        )}
                    </div>
                </div>
            </Modal>
            <style jsx>{`
                .primary-db {
                    background-color: var(--primary-color) !important;
                }
            `}</style>
        </Card>
    );
};
