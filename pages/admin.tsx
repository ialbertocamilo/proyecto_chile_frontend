import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // You can add authentication check here
        checkAuth();
        fetchUserData();
    }, []);

    const checkAuth = () => {
        // Add your authentication logic here
        // For example, check if user has valid token
        const isAuthenticated = true; // Replace with actual auth check
        if (!isAuthenticated) {
            router.push('/login');
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/admin/user-data');
            setUserData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Add logout logic here
        router.push('/login');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1>Panel de Administración</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
            }}>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2>Resumen</h2>
                    {/* Add your dashboard content here */}
                    <p>Bienvenido al panel de administración</p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2>Acciones Rápidas</h2>
                    <button
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '1rem'
                        }}
                        onClick={() => router.push('/admin/users')}
                    >
                        Gestionar Usuarios
                    </button>
                    <button
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        onClick={() => router.push('/admin/settings')}
                    >
                        Configuración
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;