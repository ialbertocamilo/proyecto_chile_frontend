import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

interface UserData {
  name: string;
  email: string;
  // Puedes agregar otros campos según la respuesta del API
}

const AdminDashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación directamente en el useEffect
    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/login');
      return;
    }

    // Función para obtener datos del usuario
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${constantUrlApiEndpoint}/admin/user-data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('❌ Error obteniendo datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return <div className="text-center mt-5"><h4>Cargando...</h4></div>;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary">Panel de Administración</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
        </button>
      </div>

      {/* Grid de Widgets */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h4 className="fw-bold">Bienvenido, {userData?.name || "Administrador"} 👋</h4>
            <p className="text-muted">Correo: {userData?.email}</p>
            <p>Accede a las herramientas de administración desde aquí.</p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h4 className="fw-bold">Acciones Rápidas</h4>
            <button className="btn btn-primary w-100 mb-2" onClick={() => router.push('/admin/users')}>
              <i className="bi bi-people-fill me-2"></i> Gestionar Usuarios
            </button>
            <button className="btn btn-success w-100" onClick={() => router.push('/admin/settings')}>
              <i className="bi bi-gear-fill me-2"></i> Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
