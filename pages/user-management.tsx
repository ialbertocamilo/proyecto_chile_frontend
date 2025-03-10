import Checkbox from "@/components/common/Checkbox";
import DataTable from "@/components/DataTable";
import { useApi } from "@/hooks/useApi";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Card from "../src/components/common/Card";
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
  const [users, setUsers] = useState<User[]>([]);
  const { put } = useApi();

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("[fetchUsers] No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("limit", "500");
      const url = `${constantUrlApiEndpoint}/users/?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();
      // Update to handle the nested users array in the response
      const usersArray = data.users || [];
      setUsers(usersArray);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[fetchUsers] Error:", message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleText = (role_id: number) => {
    return role_id === 1 ? "Administrador" : role_id === 2 ? "Operador" : "Desconocido";
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No se encontró token", "error");
      return;
    }
    try {
      const response = await fetch(`${constantUrlApiEndpoint}/user/${userId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_id: newRoleId }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el rol del usuario");
      }
      await response.json();
      Swal.fire("Actualizado", `Usuario actualizado al rol de ${getRoleText(newRoleId)}`, "success");
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      Swal.fire("Error", message, "error");
    }
  };

  const handleActiveChange = async (userId: number, roleId: number, isActive: boolean) => {
    if (roleId === 1) {
      Swal.fire(
        "Acción no permitida",
        "No se puede modificar el estado de un administrador",
        "warning"
      );
      return;
    }

    try {
      const response = await put(`/user/${userId}/update-status`, { active: isActive });
      if (response) {
        fetchUsers();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[handleActiveChange] Error:", message);
      Swal.fire("Error", message, "error");
    }
  };

  const columns = [
    { id: "id", label: "ID", minWidth: "2em" },
    { id: "email", label: "Correo Electrónico", minWidth: "2em" },
    {
      id: "birthdate",
      label: "Fecha de Nacimiento",
      minWidth: "2em",
      format: (value: string) => value ? new Date(value).toLocaleDateString('es-ES') : 'No disponible'
    },
    {
      id: "ubigeo",
      label: "Ubigeo",
      minWidth: "2em",
      format: (value: string) => value || 'No disponible'
    },
    {
      id: "direccion",
      label: "Dirección",
      minWidth: "2em",
      format: (value: string) => value || 'No disponible'
    },
    {
      id: "role_id",
      label: "Rol",
      minWidth: "2em",
      cell: ({ row }: { row: User }) => (
        <select
          value={row.role_id}
          onChange={(e) => handleRoleChange(row.id, parseInt(e.target.value))}
          className="w-full px-4 py-2 text-sm text-primary border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
        >
          <option value={1} className="py-2 hover:bg-gray-100">
            Administrador
          </option>
          <option value={2} className="py-2 hover:bg-gray-100">
            Operador
          </option>
        </select>
      )
    },
    {
      id: "active",
      label: "Estado",
      minWidth: "2em",
      cell: ({ row }: { row: User }) => {
        return <Checkbox
          checked={row.active}
          onChange={() => handleActiveChange(row.id, row.role_id, !row.active)}
          label={""}
          tooltip="Modificar el estado del usuario"
        />
      }

    }
  ];

  return (
    <>
      <div>
        
          <Title text="Listado de Usuarios" />
        
        <DataTable
          columns={columns.map(col => ({
            ...col,
            minWidth: parseInt(col.minWidth) || undefined
          }))}
          data={users}
          pageSize={10}
          enableSorting
          enableFiltering
          enableColumnVisibility
          createText="Crear usuario"
          createUrl="/user-create"
        />
      </div>
    </>
  );
};

export default UserManagement;
