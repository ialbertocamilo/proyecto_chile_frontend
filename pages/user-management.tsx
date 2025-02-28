import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  number_phone: string;
  birthdate: string;
  country: string;
  ubigeo: string;
  role_id: number;
  active: boolean;
}

const UserManagement = () => {
  // Validación de sesión
  useAuth();
  console.log("[UserManagement] Página cargada y sesión validada.");

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const CARD_WIDTH = "135%"; // Reducido para evitar desbordamiento
  const CARD_MARGIN_LEFT = "-18%"; // Alinear más a la izquierda
  const CARD_MARGIN_RIGHT = "auto";
  const CARD_MARGIN_TOP = "7px";
  const CARD_MARGIN_BOTTOM = "0px";
  const CARD_BORDER_RADIUS = "16px";
  const CARD_BOX_SHADOW = "0 2px 10px rgba(0,0,0,0.1)";
  const CARD_BORDER_COLOR = "#d3d3d3";
  const CONTAINER_MARGIN_LEFT = "10px";

  const cardStyle = {
    width: CARD_WIDTH,
    margin: `${CARD_MARGIN_TOP} ${CARD_MARGIN_RIGHT} ${CARD_MARGIN_BOTTOM} ${CARD_MARGIN_LEFT}`,
    borderRadius: CARD_BORDER_RADIUS,
    boxShadow: CARD_BOX_SHADOW,
    border: `1px solid ${CARD_BORDER_COLOR}`,
    padding: "20px",
    backgroundColor: "#fff",
  };

  // Si deseas modificar el margen izquierdo del contenedor principal (además del sidebar)

  const fetchUsers = useCallback(async () => {
    console.log("[fetchUsers] Fetching users from backend...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("[fetchUsers] No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("limit", "500");
      if (searchQuery.trim() !== "") {
        params.append("search", searchQuery);
      }
      const url = `${constantUrlApiEndpoint}/users/?${params.toString()}`;
      console.log("[fetchUsers] URL de usuarios:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[fetchUsers] Response status:", response.status);
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();
      console.log("[fetchUsers] Usuarios recibidos:", data);
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[fetchUsers] Error en fetchUsers:", message);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, fetchUsers]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    console.log("[handleSearch] Buscando:", query);
    setSearchQuery(query);
  };

  /* const handleDeleteUser = async (id: number, name: string, lastname: string) => {
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
          console.log("[handleDeleteUser] Eliminando usuario con ID:", id);
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
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          Swal.fire("Error", message, "error");
        }
      }
    });
  };

  const handleEditUser = (user: User) => {
    console.log("[handleEditUser] Editando usuario:", user);
    router.push(`/user-edit?id=${user.id}`);
  }; */

  // Función para traducir el valor numérico del rol a texto
  const getRoleText = (role_id: number) => {
    return role_id === 1
      ? "Administrador"
      : role_id === 2
      ? "Operador"
      : "Desconocido";
  };

  // Función para manejar el cambio de rol desde el desplegable
  const handleRoleChange = async (
    e: ChangeEvent<HTMLSelectElement>,
    userId: number
  ) => {
    const newRoleId = parseInt(e.target.value);
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No se encontró token", "error");
      return;
    }
    try {
      console.log(
        "[handleRoleChange] Actualizando rol del usuario con ID:",
        userId,
        "a",
        newRoleId
      );
      const response = await fetch(
        `${constantUrlApiEndpoint}/user/${userId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_id: newRoleId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al actualizar el rol del usuario");
      }
      const data = await response.json();
      console.log("[handleRoleChange] Respuesta:", data);
      Swal.fire(
        "Actualizado",
        `Usuario actualizado al rol de ${getRoleText(newRoleId)}`,
        "success"
      );
      // Actualizamos la lista de usuarios
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      Swal.fire("Error", message, "error");
    }
  };

  const handleActiveChange = async (
    e: ChangeEvent<HTMLInputElement>,
    userId: number,
    roleId: number // Agregamos el rol del usuario
  ) => {
    if (roleId === 1) {
      Swal.fire(
        "Acción no permitida",
        "No se puede modificar el estado de un administrador",
        "warning"
      );
      e.target.checked = !e.target.checked; // Revertir el cambio en el switch
      return;
    }

    const isActive = e.target.checked;
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Error", "No se encontró token", "error");
      return;
    }

    try {
      console.log(
        `[handleActiveChange] Actualizando estado del usuario con ID: ${userId} a ${
          isActive ? "activo" : "inactivo"
        }`
      );

      const response = await fetch(
        `${constantUrlApiEndpoint}/user/${userId}/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ active: isActive }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar el estado del usuario"
        );
      }

      console.log("[handleActiveChange] Estado actualizado correctamente");
      fetchUsers(); // Recargar la lista de usuarios para reflejar el cambio
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[handleActiveChange] Error:", message);
      Swal.fire("Error", message, "error");
    }
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
          paddingLeft: CONTAINER_MARGIN_LEFT,
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "100px" }}>
        <div style={cardStyle}>
          <h2 className="fw-normal mb-4" style={{ color: "var(--text-color)" }}>
            Listado de Usuarios
          </h2>
          <div
            className="input-group mb-3"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              overflow: "hidden",
              height: "70px", /* Hace la barra de búsqueda más gruesa */
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Buscar..."
              className="form-control"
              value={searchQuery}
              onChange={handleSearch}
              style={{
                flexGrow: 1,
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-base)",
                height: "100%", /* Asegura que ocupe todo el alto */
                boxShadow: "none",
                paddingLeft: "1rem",
                borderRadius: "8px", /* Bordes redondeados */
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <CustomButton
                type="button"
                variant="save"
                onClick={() => router.push("/user-create")}
                style={{
                  minWidth: "150px", /* Botón más notorio */
                  height: "40px", /* Más pequeño que la barra */
                  fontFamily: "var(--font-family-base)",
                  fontSize: "var(--font-size-base)",
                  borderRadius: "8px", /* Bordes redondeados */
                }}
              >
                Agregar Usuario
              </CustomButton>
            </div>
          </div>
        </div>
          {/* Segunda Card: Tabla de Usuarios */}
          <div style={{ ...cardStyle, marginTop: "20px" }}>
            <div
              className="table-responsive scrollable-table"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
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
                    <th>Estado</th>
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
                        <td>
                          <select
                            value={u.role_id}
                            onChange={(e) => handleRoleChange(e, u.id)}
                            style={{
                              padding: "0.3rem",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                            }}
                          >
                            <option value="1">Administrador</option>
                            <option value="2">Operador</option>
                          </select>
                        </td>
                        <td className="text-center">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={u.active}
                              onChange={(e) =>
                                handleActiveChange(e, u.id, u.role_id)
                              }
                            />
                            <span className="slider"></span>
                          </label>
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
      </div>

      <style jsx>{`
        .scrollable-table::-webkit-scrollbar {
          width: 10px;
        }
        .scrollable-table::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollable-table::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .scrollable-table::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          font-family: var(--font-family-base);
        }
        .custom-table th,
        .custom-table td {
          padding: 15px;
          text-align: center; /* Centra tanto los encabezados como el contenido */
        }
        .custom-table th {
          background-color: #fff;
          color: #666;
          font-weight: normal;
          font-size: 0.9rem; /* Reduce el tamaño de los encabezados */
        }
        .custom-table tbody tr {
          border-bottom: none; /* Elimina los bordes entre filas */
        }
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

        .switch {
          position: relative;
          display: inline-block;
          width: 55px;
          height: 30px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #f65a82;
          border-radius: 30px;
          transition: 0.2s;
          /* box-shadow: inset 3px 3px 8px rgba(51, 5, 5, 0.8); */ /* Sombra más oscura */
        }

        /* Estado inactivo */
        .slider::before {
          position: absolute;
          content: ""; /* Letra en estado inactivo */
          height: 26px;
          width: 26px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: black;
          /* box-shadow: inset -2px -2px 6px rgba(51, 5, 5, 0.5); */ /* Sombra más oscura */
        }

        /* Estado activo */
        input:checked + .slider {
          background-color: #89e790;
          /* background-color: #3ca7b7; */
          /* box-shadow: inset 3px 3px 8px rgba(0, 82, 94, 0.5); */ /* Sombra más oscura */
        }

        input:checked + .slider::before {
          transform: translateX(25px);
          /* box-shadow: inset -2px -2px 6px rgba(0, 82, 94, 0.5); */ /* Sombra más oscura */
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
