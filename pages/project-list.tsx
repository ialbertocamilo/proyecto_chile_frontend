import Breadcrumb from "@/components/common/Breadcrumb";
import { notify } from "@/utils/notify";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import DataTable from "../src/components/DataTable";
import Title from "../src/components/Title";
import useAuth from "../src/hooks/useAuth";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import ModalCreate from "@/components/common/ModalCreate";

import WelcomeCard from "@/components/CardWelcome";
import ChartProjectCreated from "@/components/ChartProjectCreated";

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

  // Estados para controlar el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; name: string } | null>(null);

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
    console.log("[handleGoToWorkflow] Navegando al workflow para el proyecto:", project_edit.id);
    localStorage.setItem("project_id_edit", String(project_edit.id));
    localStorage.setItem("project_department_edit", project_edit.divisions?.department || "");
    router.push(`/workflow-part1-edit?id=${project_edit.id}`);
  };

  // Función para abrir el modal de confirmación
  const handleDelete = (projectId: number, projectName: string): void => {
    setProjectToDelete({ id: projectId, name: projectName });
    setShowDeleteModal(true);
  };

  // Función que se ejecuta al confirmar la eliminación en el modal
  const confirmDelete = async (): Promise<void> => {
    if (!projectToDelete) return;

    const token: string | null = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      setShowDeleteModal(false);
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/project/${projectToDelete.id}/delete`;
      await axios.delete<void>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      notify("¡Proyecto eliminado exitosamente!");
      fetchProjects();
    } catch (err: unknown) {
      console.error("[confirmDelete] Error al eliminar proyecto:", err);
      setError("No se pudo eliminar el proyecto.");
      notify("No se pudo eliminar el proyecto.");
    } finally {
      setShowDeleteModal(false);
      setProjectToDelete(null);
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
        <div className="buttons-container">
          <CustomButton
            variant="editIcon"
            className="btn-table"
            onClick={() => handleGoToWorkflow(row)}
            title="Editar en Workflow"
          />
          <CustomButton
            variant="deleteIcon"
            className="btn-table"
            onClick={() => handleDelete(row.id, row.name_project || "N/D")}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <Card>
          <div className="d-flex align-items-center w-100">
            <Title text="Listado de Proyectos" />
            <Breadcrumb items={[{ title: 'Proyectos', href: '/project-list', active: true }]} />
          </div>
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

        {/* Sección para los nuevos componentes en columnas laterales */}
        <div className="row mt-4">
          <div className="col-md-9">
            <ChartProjectCreated />
          </div>
          <div className="col-md-3">
            <WelcomeCard />
          </div>
          
        </div>
      </div>

      {/* Modal de confirmación para eliminar proyecto */}
      {showDeleteModal && projectToDelete && (
        <ModalCreate
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
          }}
          onSave={confirmDelete}
          title="Confirmar eliminación"
          saveLabel="Eliminar"
        >
          <p>
            ¿Estás seguro de eliminar el proyecto{" "}
            <strong>{projectToDelete.name}</strong> (ID: {projectToDelete.id})? <br />
            Esta acción no se puede deshacer.
          </p>
        </ModalCreate>
      )}

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
