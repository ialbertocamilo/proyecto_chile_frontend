import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import Card from "../src/components/common/Card";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";
import Title from "../src/components/Title";

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
      const response = await axios.get(`${constantUrlApiEndpoint}/admin/projects`, {
        params: { limit: 999999, num_pag: 1 },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

  // Función para redirigir al modo vista del workflow del proyecto y guardar en el local storage
  const handleViewProject = (project_view: Project) => {
    // Guardamos el project id y el departamento en el local storage
    localStorage.setItem("project_id_view", project_view.id.toString());
    localStorage.setItem(
      "project_department_view",
      project_view.divisions?.department || "N/A"
    );
    // Redirige a la página de workflow en modo "view" con el id del proyecto
    router.push(`/workflow-part1-view?id=${project_view.id}`);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} />
      <div className="d-flex flex-column flex-grow-1" style={{ marginLeft: "100px", width: "100%" }}>
        <TopBar sidebarWidth={sidebarWidth} />
        {/* Contenedor fluido que envuelve el custom-container */}
        <div className="container-fluid">
          <div className="custom-container" style={{ marginTop: "80px" }}>
            <Title text="Administrar proyectos" />
            {/* Card del buscador: se sobrescribe el height para que no use 75vh */}
            <Card style={{ height: "auto", padding: "10px" }}>
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
            {/* Card que contiene la tabla de proyectos */}
            <Card style={{ marginTop: "20px" }}>
              <div>
                {error && (
                  <p className="text-danger" style={{ fontWeight: "normal" }}>
                    {error}
                  </p>
                )}
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Cargando...</div>
                  </div>
                ) : (
                  <div className="table-responsive scrollable-table">
                    <table
                      className="custom-table"
                      style={{ fontFamily: "var(--font-family-base)" }}
                    >
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th></th>
                          <th>Nombre del Proyecto</th>
                          <th>Propietario</th>
                          <th>Tipo de edificación</th>
                          <th>Tipo de uso principal</th>
                          <th>Número de niveles</th>
                          <th>Número de viviendas/oficinas x nivel</th>
                          <th>Superficie construida (m²)</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((project: Project) => (
                            <tr key={project.id}>
                              <td>{project.id || "N/D"}</td>
                              <td></td>
                              <td>{project.name_project || "No disponible"}</td>
                              <td>{project.owner_name || "No disponible"}</td>
                              <td>{project.building_type || "N/D"}</td>
                              <td>{project.main_use_type || "N/D"}</td>
                              <td>
                                {project.number_levels !== undefined
                                  ? project.number_levels
                                  : "N/D"}
                              </td>
                              <td>
                                {project.number_homes_per_level !== undefined
                                  ? project.number_homes_per_level
                                  : "N/D"}
                              </td>
                              <td>
                                {project.built_surface !== undefined
                                  ? project.built_surface
                                  : "N/D"}
                              </td>
                              <td className="d-flex justify-content-center">
                                {/* Botón para activar el modo vista */}
                                <CustomButton
                                  variant="viewIcon"
                                  onClick={() => handleViewProject(project)}
                                  style={{
                                    backgroundColor: "var(--primary-color)",
                                    padding: "0.5rem",
                                    width: "40px",
                                    height: "40px",
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={10} className="text-center text-muted">
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
        </div>
      </div>

      <style jsx>{`
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }
        .custom-table th,
        .custom-table td {
          padding: 8px;
          text-align: center;
          vertical-align: middle;
          border: none;
        }
        .custom-table thead th {
          background-color: #ffff;
          color: #666;
          font-weight: normal;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .custom-table tbody tr {
          background-color: #fff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }
        .custom-table tbody tr td:first-child {
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }
        .custom-table tbody tr td:last-child {
          border-top-right-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 80vh;
        }
        .loading-spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid var(--primary-color);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .loading-text {
          font-size: 1.5rem;
          color: var(--primary-color);
          font-weight: normal;
        }
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
        /* Estilos actualizados para el custom-container */
        .custom-container {
          width: 100%;
          max-width: 1780px;
          margin: 80px auto 50px;
          padding: 0 15px;
          box-sizing: border-box;
        }
        /* Opcional: Puedes ajustar el container-fluid si es necesario */
        .container-fluid {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
};

export default ProjectListStatusEditPage;
