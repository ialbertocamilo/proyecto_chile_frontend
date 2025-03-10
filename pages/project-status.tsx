import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "../public/assets/css/globals.css";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Title from "../src/components/Title";
import useAuth from "../src/hooks/useAuth";

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

  const [sidebarWidth] = useState("300px");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
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
      setFilteredProjects(response.data.projects);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = projects.filter((project: Project) =>
      Object.values(project).join(" ").toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  const handleViewProject = (project_view: Project) => {
    localStorage.setItem("project_id_view", project_view.id.toString());
    localStorage.setItem(
      "project_department_view",
      project_view.divisions?.department || "N/A"
    );
    router.push(`/workflow-part1-view?id=${project_view.id}`);
  };

  return (
    <div >

      <Card>
      <Title text="Administrar proyectos" />
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍︎ Buscar..."
            value={search}
            onChange={handleSearch}
            style={{ fontFamily: "var(--font-family-base)" }}
          />
        </div>
      </Card>
      <Card >
        <div className="table-responsive" style={{ margin: "-20px" }}>
          {error && (
            <p className="text-danger px-4 pt-4" style={{ fontWeight: "normal" }}>
              {error}
            </p>
          )}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Cargando...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table table-mobile" style={{ fontFamily: "var(--font-family-base)" }}>
                <thead>
                  <tr>
                    <th className="d-none d-md-table-cell" style={{ backgroundColor: "#f8f9fa" }}>ID</th>
                    <th style={{ backgroundColor: "#f8f9fa" }}></th>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Nombre del Proyecto</th>
                    <th className="d-none d-md-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Propietario</th>
                    <th className="d-none d-lg-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Tipo de edificación</th>
                    <th className="d-none d-lg-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Tipo de uso principal</th>
                    <th className="d-none d-xl-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Número de niveles</th>
                    <th className="d-none d-xl-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Número de viviendas/oficinas x nivel</th>
                    <th className="d-none d-xl-table-cell" style={{ backgroundColor: "#f8f9fa" }}>Superficie construida (m²)</th>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project: Project) => (
                      <tr key={project.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td className="d-none d-md-table-cell">{project.id || "N/D"}</td>
                        <td></td>
                        <td data-label="Proyecto:">{project.name_project || "No disponible"}</td>
                        <td className="d-none d-md-table-cell">{project.owner_name || "No disponible"}</td>
                        <td className="d-none d-lg-table-cell">{project.building_type || "N/D"}</td>
                        <td className="d-none d-lg-table-cell">{project.main_use_type || "N/D"}</td>
                        <td className="d-none d-xl-table-cell">
                          {project.number_levels !== undefined ? project.number_levels : "N/D"}
                        </td>
                        <td className="d-none d-xl-table-cell">
                          {project.number_homes_per_level !== undefined ? project.number_homes_per_level : "N/D"}
                        </td>
                        <td className="d-none d-xl-table-cell">
                          {project.built_surface !== undefined ? project.built_surface : "N/D"}
                        </td>
                        <td className="text-center">
                          <CustomButton
                            variant="viewIcon"
                            onClick={() => handleViewProject(project)}
                            style={{
                              backgroundColor: "var(--primary-color)",
                              padding: "0.5rem",
                              width: "40px",
                              height: "40px",
                              borderRadius: "4px"
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center text-muted p-4">
                        No hay proyectos disponibles o no coinciden con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectListStatusEditPage;
