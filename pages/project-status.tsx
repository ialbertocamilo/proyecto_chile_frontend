import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import Title from "../src/components/Title";
import useAuth from "../src/hooks/useAuth";
import DataTable from "../src/components/DataTable"; // Ajusta la ruta según corresponda
import Breadcrumb from "../src/components/common/Breadcrumb";

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
  [key: string]: unknown;
}

const ProjectListStatusEditPage = () => {
  useAuth();
  const router = useRouter();
  console.log("[ProjectListStatusEditPage] Página cargada y sesión validada.");

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (): Promise<void> => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("[fetchProjects] No estás autenticado. Inicia sesión nuevamente.");
      setError("No estás autenticado. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    try {
      console.log("[fetchProjects] Obteniendo proyectos...");
      const response = await axios.get(`/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[fetchProjects] Proyectos recibidos:", response.data);
      setProjects(response.data.projects);
    } catch (err: unknown) {
      console.error("[fetchProjects] Error al obtener los proyectos:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError((err.response.data as { detail?: string }).detail || "Error al obtener los proyectos.");
      } else {
        setError("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project_view: Project) => {
    localStorage.setItem("project_id_view", project_view.id.toString());
    localStorage.setItem(
      "project_department_view",
      project_view.divisions?.department || "N/A"
    );
    router.push(`/workflow-part1-view?id=${project_view.id}`);
  };

  // Definición de columnas para el DataTable
  const columns = [
    { id: "id", label: "ID", minWidth: 50 },
    { id: "name_project", label: "Nombre del Proyecto", minWidth: 150 },
    { id: "owner_name", label: "Propietario", minWidth: 100 },
    { id: "building_type", label: "Tipo de edificación", minWidth: 100 },
    { id: "main_use_type", label: "Tipo de uso principal", minWidth: 100 },
    { id: "number_levels", label: "Número de niveles", minWidth: 100 },
    { id: "number_homes_per_level", label: "N° viviendas/oficinas x nivel", minWidth: 100 },
    { id: "built_surface", label: "Superficie construida (m²)", minWidth: 100 },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 100,
      cell: ({ row }: { row: Project }) => (
        <div className="text-center">
          <CustomButton
            variant="viewIcon"
            onClick={() => handleViewProject(row)}
            style={{
              backgroundColor: "var(--primary-color)",
              padding: "0.5rem",
              width: "40px",
              height: "40px",
              borderRadius: "4px"
            }}
          />
        </div>
      )
    }
  ];

  return (
    <div>
      <Card>
      <div className="d-flex align-items-center w-100">
        <Title text="Administrar proyectos" />
          <Breadcrumb items={[
            { title: 'Administrar proyectos', href: '/project-status', active: true }
          ]} />
        </div>
      </Card>
      {/* El DataTable se encarga de mostrar la búsqueda, paginación y tabla */}
      <DataTable
        data={projects}
        columns={columns}
        loading={loading}
        pageSize={10}
      />
      {error && (
        <Card>
          <p className="text-danger px-4 pt-4" style={{ fontWeight: "normal" }}>
            {error}
          </p>
        </Card>
      )}
    </div>
  );
};

export default ProjectListStatusEditPage;
