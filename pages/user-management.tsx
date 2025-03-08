import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../public/assets/css/globals.css";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Title from "../src/components/Title";
import useAuth from "../src/hooks/useAuth";
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
  role_id: number;
  active: boolean;
}

const UserManagement = () => {
  useAuth();
  console.log("[UserManagement] Página cargada y sesión validada.");

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [sidebarWidth] = useState("300px");

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

  const getRoleText = (role_id: number) => {
    return role_id === 1
      ? "Administrador"
      : role_id === 2
      ? "Operador"
      : "Desconocido";
  };

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
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      Swal.fire("Error", message, "error");
    }
  };

  const handleActiveChange = async (
    e: ChangeEvent<HTMLInputElement>,
    userId: number,
    roleId: number
  ) => {
    if (roleId === 1) {
      Swal.fire(
        "Acción no permitida",
        "No se puede modificar el estado de un administrador",
        "warning"
      );
      e.target.checked = !e.target.checked;
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
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[handleActiveChange] Error:", message);
      Swal.fire("Error", message, "error");
    }
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} />
      <div className="d-flex flex-column flex-grow-1">
        <TopBar sidebarWidth={sidebarWidth} />

        {/* Contenedor fluid para respetar el diseño del primer código */}
        <div className="container-fluid">
          {/* custom-container centrado y con max-width */}
          <div className="custom-container" style={{paddingLeft: "2em"}}>

    
            {/* Card que contiene la tabla de usuarios */}
            <div className="container-fluid px-2 px-sm-4">
              <div className="custom-container" style={{ marginTop: "80px" }}>
                <Title text="Listado de Usuarios" />
                <Card style={{ height: "auto", padding: "10px", margin: "0 10px" }}>
                  <div className="input-group ">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍︎ Buscar..."
                      value={searchQuery}
                      onChange={handleSearch}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                    <div className="search-btn">
                      <CustomButton
                        type="button"
                        variant="save"
                        onClick={() => router.push("/user-create")}
                        style={{
                          minWidth: "150px",
                          height: "40px",
                          fontFamily: "var(--font-family-base)",
                          fontSize: "var(--font-size-base)",
                          borderRadius: "8px",
                        }}
                      >
                        Agregar Usuario
                      </CustomButton>
                    </div>
                  </div>
                </Card>
                <Card style={{ marginTop: "20px", margin: "20px 10px",  borderRadius: "8px"}}>
                  <div className="table-responsive" style={{ margin: "-20px" }}>
                    <table className="custom-table table-mobile" style={{ fontFamily: "var(--font-family-base)" }}>
  <thead>
    <tr>
      <th className="d-none d-md-table-cell" style={{ backgroundColor: "#f8f9fa" }}>ID</th>
      <th style={{ backgroundColor: "#f8f9fa" }}>Nombre</th>
      <th style={{ backgroundColor: "#f8f9fa" }}>Apellidos</th>
      <th className="d-none d-md-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Email</th>
      <th className="d-none d-lg-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Teléfono</th>
      <th className="d-none d-lg-table-cell" style={{ backgroundColor: "#f8f9fa" }}>País</th>
      <th className="d-none d-xl-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Ubigeo</th>
      <th style={{ backgroundColor: "#f8f9fa" }}>Rol</th>
      <th style={{ backgroundColor: "#f8f9fa" }}>Estado</th>
    </tr>
  </thead>
  <tbody>
    {users.length > 0 ? (
      users.map((u) => (
        <tr key={u.id}>
          <td className="d-none d-md-table-cell">{u.id}</td>
          <td>{u.name}</td>
          <td>{u.lastname}</td>
          <td className="d-none d-md-table-cell">{u.email}</td>
          <td className="d-none d-lg-table-cell">{u.number_phone}</td>
          <td className="d-none d-lg-table-cell">{u.country}</td>
          <td className="d-none d-xl-table-cell">{u.ubigeo}</td>
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
                onChange={(e) => handleActiveChange(e, u.id, u.role_id)}
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
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`


        /* Card para la barra de búsqueda */
        .search-card {
          margin-bottom: 20px !important;
          width: 100% !important;
        }
        .search-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        /* Scroll */
        .scrollable-table {
          max-height: 550px;
          overflow-y: auto;
        }
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

        /* Switch */
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
        }
        .slider::before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: 0.2s;
        }
        input:checked + .slider {
          background-color: #89e790;
        }
        input:checked + .slider::before {
          transform: translateX(25px);
        }

        /* Responsivo */
        @media (max-width: 992px) {
          .custom-container {
            margin: 60px auto 30px;
          }
          .custom-table thead th,
        }
        @media (max-width: 768px) {
          .custom-container {
            margin: 40px auto 20px;
          }
          .switch {
            width: 45px;
            height: 25px;
          }
          .slider::before {
            width: 21px;
            height: 21px;
          }
          input:checked + .slider::before {
            transform: translateX(18px);
          }
        }
        @media (max-width: 480px) {
          .custom-container {
            margin: 30px auto 20px;
            padding: 0 10px;
          }
          .switch {
            width: 40px;
            height: 20px;
          }
          .slider::before {
            width: 18px;
            height: 18px;
          }
          input:checked + .slider::before {
            transform: translateX(16px);
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
