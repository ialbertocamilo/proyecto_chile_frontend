import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Swal, { SweetAlertResult } from "sweetalert2";
import { notify } from "@/utils/notify";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import DataTable from "../src/components/DataTable";

interface Divisions {
  department?: string;
  province?: string;
  district?: string;
}

export interface Project {
  id: number;
  status?: string;
  name_project?: string;
  owner_name?: string;
  designer_name?: string;
  director_name?: string;
  address?: string;
  country?: string;
  divisions?: Divisions;
  owner_lastname?: string;
  building_type?: string;
  main_use_type?: string;
  number_levels?: number;
  number_homes_per_level?: number;
  built_surface?: number;
  latitude?: number;
  longitude?: number;
}

interface ErrorResponse {
  detail?: string;
}

const ProjectListPage = () => {
  useAuth();
  console.log("[ProjectListPage] Página cargada y sesión validada.");

  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (): Promise<void> => {
    setLoading(true);
    const token: string | null = localStorage.getItem("token");
    if (!token) {
      console.error("[fetchProjects] No se encontró un token en localStorage.");
      setError("No estás autenticado. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    try {
      console.log("[fetchProjects] 📡 Obteniendo proyectos...");
      const response = await axios.get<{ projects: Project[] }>("/api/projects_user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("[fetchProjects] Proyectos recibidos:", response.data);
      setProjects(response.data.projects);
    } catch (err: unknown) {
      console.error("[fetchProjects] Error al obtener los proyectos:", err);
      if (axios.isAxiosError(err) && err.response) {
        const errorResponse = err.response.data as ErrorResponse;
        setError(errorResponse.detail || "Error al obtener los proyectos.");
      } else {
        setError("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToWorkflow = (project_edit: Project): void => {
    console.log(
      "[handleGoToWorkflow] Navegando al workflow para el proyecto:",
      project_edit.id
    );
    localStorage.setItem("project_id_edit", String(project_edit.id));
    localStorage.setItem(
      "project_department_edit",
      project_edit.divisions?.department || ""
    );
    router.push(`/workflow-part1-edit?id=${project_edit.id}`);
  };

  const handleDelete = async (
    projectId: number,
    projectName: string
  ): Promise<void> => {
    const result: SweetAlertResult = await Swal.fire({
      title: "¿Estás seguro de eliminar este proyecto?",
      text: `ID: ${projectId} - Nombre: ${projectName}\nEsta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    const token: string | null = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/project/${projectId}/delete`;
      await axios.delete<void>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      notify("¡Proyecto eliminado exitosamente!");
      fetchProjects();
    } catch (err: unknown) {
      console.error("[handleDelete] Error al eliminar proyecto:", err);
      setError("No se pudo eliminar el proyecto.");
      notify("No se pudo eliminar el proyecto.");
    }
  };

  const getStatusStyle = (status: string | undefined): React.CSSProperties => {
    const s = status?.toLowerCase();
    if (s === "finalizado") {
      return { backgroundColor: "#ffe8e8", color: "#e45f5f" };
    }
    if (s === "registrado") {
      return { backgroundColor: "#e8ffed", color: "#a9dfb4" };
    }
    if (s === "en proceso") {
      return { backgroundColor: "#fff9e8", color: "#edc68c" };
    }
    return {};
  };

  // Definición de columnas para el DataTable
  const tableColumns = [
    { id: "id", label: "ID", minWidth: 50 },
    {
      id: "status",
      label: "Estado",
      minWidth: 100,
      cell: ({ row }: { row: Project }) => (
        <span
          className="badge status-badge"
          style={{
            ...getStatusStyle(row.status),
            display: "inline-block",
            fontSize: "0.8rem",
            fontWeight: "normal",
            padding: "8px 16px",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-family-base)",
          }}
        >
          {row.status ? row.status.toUpperCase() : "NO DISPONIBLE"}
        </span>
      ),
    },
    {
      id: "name_project",
      label: "Nombre proyecto",
      minWidth: 150,
    },
    {
      id: "owner_name",
      label: "Propietario",
      minWidth: 100,
    },
    {
      id: "designer_name",
      label: "Diseñador",
      minWidth: 100,
    },
    {
      id: "director_name",
      label: "Director",
      minWidth: 100,
    },
    {
      id: "address",
      label: "Dirección",
      minWidth: 150,
    },
    {
      id: "divisions",
      label: "Departamento",
      minWidth: 100,
      cell: ({ row }: { row: Project }) =>
        row.divisions?.department || "No disponible",
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 100,
      cell: ({ row }: { row: Project }) => (
        <div
        >
          <CustomButton
            variant="editIcon"
            onClick={() => handleGoToWorkflow(row)}
            title="Editar en Workflow"
            style={{
              width: "36px",
              height: "36px",
              padding: "0.5rem",
            }}
          />
          <CustomButton
            variant="deleteIcon"
            onClick={() =>
              handleDelete(row.id, row.name_project || "N/D")
            }
            style={{
              width: "36px",
              height: "36px",
              padding: "0.5rem",
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <Card>
        <Title text="Listado de Proyectos" />

        </Card>
          <DataTable
            data={projects}
            columns={tableColumns}
            loading={loading}
            createText="Proyecto Nuevo"
            createUrl="/workflow-part1-create"
            pageSize={10}
            showButton={true}
          />
      </div>

      <style jsx>{`
        /* Estilos personalizados para la tabla, si se necesitan */
        .status-badge {
          font-family: var(--font-family-base);
        }
      `}</style>
    </>
  );
};

export default ProjectListPage;
