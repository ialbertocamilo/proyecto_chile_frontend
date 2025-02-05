import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";

type User = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  number_phone: string;
  birthdate: string;
  country: string;
  ubigeo: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Se vuelve a cargar la lista cada vez que cambie la página o la búsqueda
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  // Función para obtener los usuarios desde el backend usando paginación y búsqueda
  const fetchUsers = async () => {
    console.log("Fetching users from backend...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró un token en localStorage.");
      return;
    }

    try {
      // Construimos los parámetros de consulta
      const params = new URLSearchParams();
      params.append("limit", "5");
      params.append("num_pag", String(currentPage));
      if (searchQuery.trim() !== "") {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `http://deuman-backend.svgdev.tech/users/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }

      const data = await response.json();
      console.log("Usuarios recibidos:", data);

      // Se asume que la respuesta tiene la forma:
      // { total_results, total_pages, current_page, per_page, users: [ ... ] }
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
      setTotalPages(data.total_pages || 1);
    } catch (error: any) {
      console.error("❌ Error en fetchUsers:", error.message);
    }
  };

  // Actualiza el estado de búsqueda y reinicia la paginación a la página 1
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Elimina un usuario
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    console.log(`🗑 Eliminando usuario con ID: ${id}`);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No se encontró un token en localStorage.");
      return;
    }

    try {
      const response = await fetch(
        `http://deuman-backend.svgdev.tech/user/${id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔄 Response status:", response.status);
      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      console.log(`✅ Usuario con ID: ${id} eliminado correctamente`);
      // Vuelve a obtener la lista actualizada de usuarios
      fetchUsers();
    } catch (error: any) {
      console.error("❌ Error en handleDeleteUser:", error.message);
    }
  };

  // Redirige a la página de edición del usuario
  const handleEditUser = (user: User) => {
    console.log("Editando usuario:", user);
    router.push(`/user-edit?id=${user.id}`);
  };

  // Funciones para avanzar o retroceder en la paginación
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} />
      <div className="d-flex flex-column flex-grow-1">
        <TopBar />
        <div className="container mt-4">
          <h2 className="fw-bold text-primary text-center mb-4">
            Gestión de Usuarios
          </h2>

          {/* Buscador */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Buscar usuario..."
              className="form-control"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="mb-4 text-center">
            <Button
              text="Agregar Usuario"
              onClick={() => router.push("/user-create")}
              className="btn-success"
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>País</th>
                  <th>Ubigeo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.lastname}</td>
                      <td>{u.email}</td>
                      <td>{u.number_phone}</td>
                      <td>{u.country}</td>
                      <td>{u.ubigeo}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleEditUser(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      No hay usuarios o no coinciden con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <div className="d-flex justify-content-center align-items-center mt-4">
            <button
              className="btn btn-outline-primary me-2"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="btn btn-outline-primary ms-2"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
