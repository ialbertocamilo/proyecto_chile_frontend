import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Swal, { SweetAlertResult } from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
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
}

interface ErrorResponse {
  detail?: string;
}

const ProjectListPage = () => {
  useAuth();
  console.log("[ProjectListPage] Página cargada y sesión validada.");

  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState<string>("300px");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Constantes para el manejo de estilos de las cards
  const CARD_WIDTH = "135%"; // Ancho de ambas cards
  const CARD_MARGIN_LEFT = "0px"; // Margen izquierdo
  const CARD_MARGIN_RIGHT = "0px"; // Margen derecho
  const CARD_MARGIN_TOP = "0px"; // Margen superior
  const CARD_MARGIN_BOTTOM = "0px"; // Margen inferior
  const CARD_BORDER_RADIUS = "16px"; // Borde redondeado
  const CARD_BOX_SHADOW = "0 2px 10px rgba(0,0,0,0.1)"; // Sombra de las cards
  const CARD_BORDER_COLOR = "#d3d3d3"; // Color del borde

  // Objeto de estilos que se aplicará a ambas cards
  const cardStyle = {
    width: CARD_WIDTH,
    marginLeft: CARD_MARGIN_LEFT,
    marginRight: CARD_MARGIN_RIGHT,
    marginTop: CARD_MARGIN_TOP,
    marginBottom: CARD_MARGIN_BOTTOM,
    borderRadius: CARD_BORDER_RADIUS,
    boxShadow: CARD_BOX_SHADOW,
    border: `1px solid ${CARD_BORDER_COLOR}`,
  };

  const CONTAINER_MARGIN_LEFT = "20px"; 

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
      const response = await axios.get<{ projects: Project[] }>(
        `${constantUrlApiEndpoint}/user/projects`,
        {
          params: { limit: 999999, num_pag: 1 },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("[fetchProjects] Proyectos recibidos:", response.data);
      setProjects(response.data.projects);
      setFilteredProjects(response.data.projects);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query: string = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = projects.filter((project: Project) => {
      const values: Array<string | number | boolean | null | undefined> = Object.values(project);
      const combined: string = values
        .map((val: string | number | boolean | null | undefined): string => {
          if (val === undefined || val === null) return "";
          if (typeof val === "object") return JSON.stringify(val);
          return String(val);
        })
        .join(" ")
        .toLowerCase();
      return combined.includes(query);
    });
    setFilteredProjects(filtered);
  };

  const handleGoToWorkflow = (project: Project): void => {
    console.log("[handleGoToWorkflow] Navegando al workflow para el proyecto:", project.id);
    localStorage.setItem("project_id", String(project.id));
    localStorage.setItem("project_department", project.divisions?.department || "");
    router.push(`/project-workflow-part1?id=${project.id}`);
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
      const url = `${constantUrlApiEndpoint}/projects/${projectId}/delete`;
      await axios.delete<void>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire({
        title: "¡Proyecto eliminado exitosamente!",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      fetchProjects();
    } catch (err: unknown) {
      console.error("[handleDelete] Error al eliminar proyecto:", err);
      setError("No se pudo eliminar el proyecto.");
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el proyecto.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
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

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)", fontWeight: "normal" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div className="d-flex flex-column flex-grow-1" style={{ marginLeft: sidebarWidth, width: "100%" }}>
        <TopBar sidebarWidth={sidebarWidth} />
        <div
          className="container p-4"
          style={{
            marginTop: "100px",
            marginLeft: CONTAINER_MARGIN_LEFT,
            fontFamily: "var(--font-family-base)",
            fontWeight: "normal",
          }}
        >
          {error && (
            <p className="text-danger">{error}</p>
          )}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Cargando...</div>
            </div>
          ) : (
            <>
              {/* Card para el título y búsqueda */}
              <div className="card mb-4" style={cardStyle}>
                <div className="card-body">
                  <h4 style={{ fontSize: "30px", fontFamily: "var(--font-family-base)", fontWeight: "normal" }}>
                    Listado de proyectos
                  </h4>
                  <div style={{ position: "relative", width: "100%", marginTop: "20px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar..."
                      value={search}
                      onChange={handleSearch}
                      style={{
                        width: "100%",
                        height: "70px",
                        borderRadius: "12px",
                        paddingLeft: "2.5rem",
                        paddingRight: "150px",
                        fontSize: "16px",
                        border: "1px solid #ddd",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#aaa",
                        fontSize: "24px",
                      }}
                    >
                      🔍︎
                    </span>
                    <CustomButton
                      variant="save"
                      onClick={() => router.push("/project-workflow-part1")}
                      style={{
                        position: "absolute",
                        right: "30px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "36px",
                        fontSize: "14px",
                        padding: "0 15px",
                        borderRadius: "8px",
                      }}
                    >
                      + Proyecto Nuevo
                    </CustomButton>
                  </div>
                </div>
              </div>

              {/* Card para la tabla de proyectos */}
              <div className="card" style={cardStyle}>
                <div className="card-body">
                  <div className="table-responsive scrollable-table" style={{ marginTop: "16px" }}>
                    <table className="custom-table" style={{ fontFamily: "var(--font-family-base)", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="table-header">ID</th>
                          <th className="table-header">Estado del <br /> proyecto</th>
                          <th className="table-header">Nombre del <br /> proyecto</th>
                          <th className="table-header">Nombre del <br /> propietario</th>
                          <th className="table-header">Nombre del <br /> Diseñador</th>
                          <th className="table-header">Director responsable <br /> De las obras</th>
                          <th className="table-header">Dirección</th>
                          <th className="table-header">Departamento</th>
                          <th className="table-header">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((project: Project) => (
                            <tr key={project.id}>
                              <td>{project.id || "N/D"}</td>
                              <td>
                                <span
                                  className="badge status-badge"
                                  style={{
                                    ...getStatusStyle(project.status),
                                    fontSize: "0.8rem",
                                    fontFamily: "var(--font-family-base)",
                                    fontWeight: "normal",
                                  }}
                                >
                                  {project.status ? project.status.toUpperCase() : "NO DISPONIBLE"}
                                </span>
                              </td>
                              <td>{project.name_project || "No disponible"}</td>
                              <td>{project.owner_name || "No disponible"}</td>
                              <td>{project.designer_name || "N/D"}</td>
                              <td>{project.director_name || "N/D"}</td>
                              <td>{project.address || "N/D"}</td>
                              <td>{project.divisions?.department || "No disponible"}</td>
                              <td className="text-center">
                                <div className="action-btn-group">
                                  <CustomButton
                                    variant="editIcon"
                                    onClick={() => handleGoToWorkflow(project)}
                                    style={{
                                      backgroundColor: "var(--primary-color)",
                                      border: `2px solid var(--primary-color)`,
                                      fontFamily: "var(--font-family-base)",
                                      padding: "0.5rem",
                                      width: "40px",
                                      height: "40px",
                                    }}
                                    title="Editar en Workflow"
                                  />
                                  <CustomButton
                                    variant="deleteIcon"
                                    onClick={() =>
                                      handleDelete(project.id, project.name_project || "N/D")
                                    }
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
                            <td colSpan={9} className="text-center text-muted" style={{ fontFamily: "var(--font-family-base)", fontWeight: "normal" }}>
                              No hay proyectos disponibles o no coinciden con la búsqueda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
          <style jsx>{`
            .table-header {
              color: #f5f5f5;
              font-size: 13px;
              font-weight: bold;
            }
            .custom-project-btn {
              background-color: #3ca7b7;
              border: 1px solid #3ca7b7;
              color: #fff;
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
              transition: background-color 0.3s ease;
            }
            .custom-project-btn:hover {
              background-color: #329ca1;
            }
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
            }
            .custom-table thead th {
              background-color: #ffff;
              font-weight: normal;
              color: #666;
              position: sticky;
              top: 0;
              z-index: 1;
            }
            .custom-table tbody tr {
              background-color: #fff;
              overflow: hidden;
            }
            .custom-table tbody tr td:first-child {
              border-top-left-radius: ${CARD_BORDER_RADIUS};
              border-bottom-left-radius: ${CARD_BORDER_RADIUS};
            }
            .custom-table tbody tr td:last-child {
              border-top-right-radius: ${CARD_BORDER_RADIUS};
              border-bottom-right-radius: ${CARD_BORDER_RADIUS};
            }
            /* Centrado de iconos en la columna de acciones */
            .action-btn-group {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 0.5rem;
            }
            .status-badge {
              display: inline-block;
              font-size: 1.1rem;
              font-weight: normal;
              padding: 8px 16px;
              border-radius: 0.5rem;
              font-family: var(--font-family-base);
            }
            .loading-container {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 80vh;
              font-family: var(--font-family-base);
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
              font-family: var(--font-family-base);
            }
            .scrollable-table {
              max-height: 500px;
              overflow-y: auto;
            }
            /* Personalización del scrollbar para Chrome y navegadores WebKit */
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
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ProjectListPage;
