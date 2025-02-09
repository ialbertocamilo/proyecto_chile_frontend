import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

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
  
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const fetchUsers = async () => {
    console.log("Fetching users from backend...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("limit", "5");
      params.append("num_pag", String(currentPage));
      if (searchQuery.trim() !== "") {
        params.append("search", searchQuery);
      }
      const response = await fetch(
        `${constantUrlApiEndpoint}/users/?${params.toString()}`,
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
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalPages(data.total_pages || 1);
    } catch (error: any) {
      console.error("❌ Error en fetchUsers:", error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDeleteUser = async (id: number, name: string, lastname: string) => {
    Swal.fire({
      title: "Confirmar eliminación",
      text: `¿Estás seguro de eliminar el usuario (ID: ${id}) ${name} ${lastname}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Error", "No se encontró token", "error");
          return;
        }
        try {
          const response = await fetch(
            `${constantUrlApiEndpoint}/user/${id}/delete`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Error al eliminar usuario");
          }
          Swal.fire("Eliminado", `El usuario (ID: ${id}) ${name} ${lastname} ha sido eliminado.`, "success");
          fetchUsers();
        } catch (error: any) {
          Swal.fire("Error", error.message || "Error al eliminar usuario", "error");
        }
      }
    });
  };

  const handleEditUser = (user: User) => {
    console.log("Editando usuario:", user);
    router.push(`/user-edit?id=${user.id}`);
  };

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
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth, 
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "60px" }}>
          <h2 className="fw-bold mb-4" style={{ color: "#000" }}>
            Administración de Usuarios
          </h2>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Buscar usuario..."
              className="form-control"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="mb-4 text-end">
            <button
              onClick={() => router.push("/user-create")}
              className="custom-btn"
            >
              Agregar Usuario
            </button>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
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
                        <div className="action-btn-group">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="custom-btn action-btn"
                            style={{
                              backgroundColor: "#3ca7b7",
                              border: "2px solid #3ca7b7",
                            }}
                          >
                            <i className="bi bi-pencil" style={{ color: "#fff" }}></i>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name, u.lastname)}
                            className="custom-btn-delete action-btn"
                          >
                            <i className="bi bi-trash" style={{ color: "#fff" }}></i>
                          </button>
                        </div>
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
          <div className="d-flex justify-content-center align-items-center mt-4">
            <button
              className="custom-btn-outline me-2"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="custom-btn-outline ms-2"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-btn {
          background-color: #3ca7b7 !important;
          border: 2px solid #3ca7b7 !important;
          border-radius: 0.5rem !important;
          padding: 12px !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #fff !important;
          cursor: pointer;
        }
        .custom-btn:hover {
          background-color: #359aa9 !important;
          border-color: #359aa9 !important;
        }
        .custom-btn-outline {
          background-color: transparent !important;
          border: 2px solid #3ca7b7 !important;
          border-radius: 0.5rem !important;
          padding: 12px !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #3ca7b7 !important;
          cursor: pointer;
        }
        .custom-btn-outline:hover {
          background-color: #3ca7b7 !important;
          color: #fff !important;
        }
        .custom-btn-delete {
          background-color: #dc3545 !important;
          border: 2px solid #dc3545 !important;
          border-radius: 0.5rem !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #fff !important;
          cursor: pointer;
        }
        .custom-btn-delete:hover {
          background-color: #c82333 !important;
          border-color: #c82333 !important;
        }
        .action-btn-group {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }
        .custom-table {
          width: 100%;
          border: 1px solid #ddd;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff !important;
          border-radius: 8px;
          overflow: hidden;
        }
        .custom-table th,
        .custom-table td {
          border: none;
          padding: 8px;
        }
        .custom-table th {
          color: #3ca7b7;
          font-weight: bold;
          border-bottom: 1px solid #ddd;
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
