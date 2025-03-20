import Checkbox from "@/components/common/Checkbox";
import DataTable from "@/components/DataTable";
import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import { useCallback, useEffect, useState } from "react";
import Card from "../src/components/common/Card";
import Title from "../src/components/Title";
import useAuth from "../src/hooks/useAuth";
import Breadcrumb from "../src/components/common/Breadcrumb";

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
  const { put, get } = useApi();

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("[fetchUsers] No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("limit", "500");
      const url = `/users/?${params.toString()}`;
      const response = await get(url);
      const usersArray = response?.users || [];
      setUsers(usersArray);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[fetchUsers] Error:", message);
    }
  }, [get]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleText = (role_id: number) => {
    return role_id === 1 ? "Administrador" : role_id === 2 ? "Operador" : "Desconocido";
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      const response = await put(`/user/${userId}/update`, { role_id: newRoleId });
      if (response) {
        notify(`Usuario actualizado al rol de ${getRoleText(newRoleId)}`, "success");
        fetchUsers();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      notify(message);
    }
  };

  const handleActiveChange = async (userId: number, roleId: number, isActive: boolean) => {
    if (roleId === 1) {
      notify(
        "Acción no permitida, No se puede modificar el estado de un administrador"
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
      notify("Error");
    }
  };

  const columns = [
    { id: "id", label: "ID", minWidth: "2em" },
    { id: "email", label: "Correo Electrónico", minWidth: "2em" },
    {
      id: "birthdate",
      label: "Fecha de Nacimiento",
      minWidth: "2em",
      format: (value: string) =>
        value ? new Date(value).toLocaleDateString("es-ES") : "No disponible"
    },
    {
      id: "ubigeo",
      label: "Ubigeo",
      minWidth: "2em",
      format: (value: string) => value || "No disponible"
    },
    {
      id: "direccion",
      label: "Dirección",
      minWidth: "2em",
      format: (value: string) => value || "No disponible"
    },
    {
      id: "role_id",
      label: "Rol",
      minWidth: "2em",
      cell: ({ row }: { row: User }) => (
        <select
          value={row.role_id}
          onChange={(e) => handleRoleChange(row.id, parseInt(e.target.value))}
          className="w-full px-4 py-2 text-sm text-muted border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
        >
          <option value={1} className="py-2 text-muted">
            Administrador
          </option>
          <option value={2} className="py-2 text-muted">
            Operador
          </option>
        </select>
      )
    },
    {
      id: "active",
      label: "Estado",
      minWidth: "2em",
      cell: ({ row }: { row: User }) => (
        <Checkbox
          checked={row.active}
          onChange={() => handleActiveChange(row.id, row.role_id, !row.active)}
          label={""}
          tooltip="Modificar el estado del usuario"
        />
      )
    }
  ];

  return (
    <>
      <Card>
        <div className="d-flex align-items-center w-100">
          <Title text="Listado de usuarios" />
          <Breadcrumb items={[
            { title: 'Dashboard', href: '/dashboard', active: false },
            { title: 'Gestión de usuarios', href: '/user-management' }
          ]} />
        </div>
      </Card>
      <DataTable
        columns={columns.map((col) => ({
          ...col,
          minWidth: parseInt(col.minWidth) || undefined
        }))}
        data={users}
        pageSize={10}
        enableSorting
        enableFiltering
        enableColumnVisibility
        showButton={true}
        createText="Crear usuario"
        createUrl="/user-create"
      />
    </>
  );
};

export default UserManagement;
