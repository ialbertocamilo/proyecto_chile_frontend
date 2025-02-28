import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";

const modalWidth = "90%";
const modalHeight = "auto";

// Constantes para los estilos de las cards
const CARD_WIDTH = "135%";
const CARD_MARGIN_LEFT = "-18%";
const CARD_MARGIN_RIGHT = "20px";
const CARD_MARGIN_TOP = "20px";
const CARD_MARGIN_BOTTOM = "20px";
const CARD_BORDER_RADIUS = "16px";
const CARD_BOX_SHADOW = "0 2px 10px rgba(0, 0, 0, 0.1)";
const CARD_BORDER_COLOR = "#d3d3d3";

// Objeto para los estilos de las cards
const cardStyle = {
  width: CARD_WIDTH,
  marginLeft: CARD_MARGIN_LEFT,
  marginRight: CARD_MARGIN_RIGHT,
  marginTop: CARD_MARGIN_TOP,
  marginBottom: CARD_MARGIN_BOTTOM,
  borderRadius: CARD_BORDER_RADIUS,
  boxShadow: CARD_BOX_SHADOW,
  border: `1px solid ${CARD_BORDER_COLOR}`,
  padding: "20px",
  backgroundColor: "#fff",
};

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

  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editStatusProjectId, setEditStatusProjectId] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const statusOptions = ["registrado", "finalizado", "en proceso"];

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
        setError(
          (err.response.data as { detail?: string }).detail ||
            "Error al obtener los proyectos."
        );
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


  const closeStatusModal = () => {
    console.log("[closeStatusModal] Cerrando modal de edición de estado.");
    setShowStatusModal(false);
    setEditStatusProjectId(null);
    setCurrentStatus("");
  };

  const handleStatusUpdate = async () => {
    if (!editStatusProjectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/project/${editStatusProjectId}/status`;
      const data = { status: currentStatus };
      console.log(
        "[handleStatusUpdate] Actualizando estado para el proyecto:",
        editStatusProjectId,
        "con data:",
        data
      );
      await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire({
        title: "¡Proyecto actualizado correctamente!",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        closeStatusModal();
        fetchProjects();
      });
    } catch (err: unknown) {
      console.error("[handleStatusUpdate] Error al actualizar el estado del proyecto:", err);
      setError("Ocurrió un error al actualizar el estado del proyecto.");
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al actualizar el estado del proyecto.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  // Función para redirigir al modo vista del workflow del proyecto
  const handleViewProject = (project: Project) => {
    // Redirige a la página de workflow en modo "view" con el id del proyecto
    router.push(`/project-workflow-part1?mode=view&id=${project.id}`);
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ marginLeft: sidebarWidth, width: "100%" }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "100px" }}>
          {/* Card para el título */}
          <div style={cardStyle}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2
                className="fw-normal"
                style={{
                  color: "#4B5563",
                  margin: 0,
                  fontFamily: "var(--font-family-base)",
                  fontWeight: "normal",
                }}
              >
                Administrar proyectos
              </h2>
            </div>
          </div>

          {/* Card para la tabla de proyectos */}
          <div style={cardStyle}>
            {error && <p className="text-danger" style={{ fontWeight: "normal" }}>{error}</p>}
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
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Cargando...</div>
              </div>
            ) : (
              <div className="table-responsive scrollable-table">
                <table className="custom-table" style={{ fontFamily: "var(--font-family-base)" }}>
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
                            {project.number_levels !== undefined ? project.number_levels : "N/D"}
                          </td>
                          <td>
                            {project.number_homes_per_level !== undefined
                              ? project.number_homes_per_level
                              : "N/D"}
                          </td>
                          <td>
                            {project.built_surface !== undefined ? project.built_surface : "N/D"}
                          </td>
                          <td className="d-flex justify-content-center">
                            {/* Botón para activar el modo vista (redirige a project-workflow-part1 con mode=view) */}
                            <CustomButton
                              variant="viewIcon"
                              onClick={() => handleViewProject(project)}
                              style={{
                                backgroundColor: "var(--primary-color)",
                                border: `2px solid var(--primary-color)`,
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
        </div>

        {showStatusModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div
              className="modal fade show"
              style={{
                display: "block",
                marginTop: "250px",
                marginLeft: "20px",
                width: modalWidth,
                height: modalHeight,
                fontFamily: "var(--font-family-base)",
              }}
              tabIndex={-1}
              role="dialog"
            >
              <div className="modal-dialog modal-lg" role="document" style={{ width: "100%" }}>
                <div className="modal-content" style={{ fontFamily: "var(--font-family-base)" }}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Editar Estado del Proyecto #{editStatusProjectId}
                    </h5>
                    <button type="button" className="btn-close" onClick={closeStatusModal}></button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="editStatus" className="form-label">
                        Estado del Proyecto
                      </label>
                      <select
                        id="editStatus"
                        className="form-select"
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                        style={{ fontFamily: "var(--font-family-base)" }}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <CustomButton variant="back" onClick={closeStatusModal}>
                      Cancelar
                    </CustomButton>
                    <CustomButton variant="save" onClick={handleStatusUpdate}>
                      Guardar Cambios
                    </CustomButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
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
          .status-badge {
            display: inline-block;
            font-size: 1.1rem;
            font-weight: normal;
            padding: 8px 16px;
            border-radius: 0.5rem;
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
            max-height: 500px;
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
        `}</style>
      </div>
    </div>
  );
};

export default ProjectListStatusEditPage;
