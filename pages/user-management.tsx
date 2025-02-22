import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  number_phone: string;
  birthdate: string;
  country: string;
  ubigeo: string;
  role_id: number; // Se actualiza el campo a role_id
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const fetchUsers = useCallback(async () => {
    console.log("Fetching users from backend...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      // Se establece un límite alto para obtener todos los usuarios
      params.append("limit", "500");
      if (searchQuery.trim() !== "") {
        params.append("search", searchQuery);
      }
      const url = `${constantUrlApiEndpoint}/users/?${params.toString()}`;
      console.log("URL de usuarios:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();
      console.log("Usuarios recibidos:", data);
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error en fetchUsers:", message);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, fetchUsers]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
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
          Swal.fire(
            "Eliminado",
            `El usuario (ID: ${id}) ${name} ${lastname} ha sido eliminado.`,
            "success"
          );
          fetchUsers();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Error desconocido";
          Swal.fire("Error", message, "error");
        }
      }
    });
  };

  const handleEditUser = (user: User) => {
    console.log("Editando usuario:", user);
    router.push(`/user-edit?id=${user.id}`);
  };

  // Función para traducir el valor numérico del rol a texto usando role_id
  const getRoleText = (role_id: number) => {
    return role_id === 1 ? "Administrador" : role_id === 2 ? "Operador" : "Desconocido";
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
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
          <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
            Listado de Usuarios
          </h2>
          <div className="input-group mb-3">
            <input
              type="text"
              placeholder="Buscar usuario..."
              className="form-control"
              value={searchQuery}
              onChange={handleSearch}
              style={{
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-base)",
              }}
            />
            <CustomButton
              type="button"
              variant="save"
              onClick={() => router.push("/user-create")}
              style={{
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-base)",
                marginLeft: "1rem",
              }}
            >
              Agregar Usuario
            </CustomButton>
          </div>
          {/* Tabla con scroll interno */}
          <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
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
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u: User) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.lastname}</td>
                      <td>{u.email}</td>
                      <td>{u.number_phone}</td>
                      <td>{u.country}</td>
                      <td>{u.ubigeo}</td>
                      <td>{getRoleText(u.role_id)}</td>
                      <td className="text-center">
                        <div className="action-btn-group">
                          <CustomButton
                            variant="editIcon"
                            onClick={() => handleEditUser(u)}
                            className="action-btn"
                            style={{
                              backgroundColor: "var(--primary-color)",
                              border: `2px solid var(--primary-color)`,
                              fontFamily: "var(--font-family-base)",
                              padding: "0.5rem",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                          <CustomButton
                            variant="deleteIcon"
                            onClick={() =>
                              handleDeleteUser(u.id, u.name, u.lastname)
                            }
                            className="action-btn"
                            style={{
                              fontFamily: "var(--font-family-base)",
                              padding: "0.5rem",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      No hay usuarios o no coinciden con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style jsx>{`
        .action-btn-group {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
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
          font-family: var(--font-family-base);
        }
        .custom-table th,
        .custom-table td {
          border: none;
          padding: 8px;
        }
        .custom-table th {
          color: var(--primary-color);
          font-weight: bold;
          border-bottom: 1px solid #ddd;
          background-color: #fff !important;
          font-family: var(--font-family-base);
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
