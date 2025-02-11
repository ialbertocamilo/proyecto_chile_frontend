import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";

const ProjectListStatusEditPage = () => {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 5;

  // Estados para el modal de edición de status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editStatusProjectId, setEditStatusProjectId] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const statusOptions = ["registrado", "finalizado", "en proceso"];

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const fetchProjects = async (page: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${constantUrlApiEndpoint}/projects`, {
        params: { limit, num_pag: page },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setProjects(response.data.projects);
      setTotalPages(response.data.total_pages);
      setCurrentPage(response.data.current_page);
    } catch (err: any) {
      console.error("Error al obtener los proyectos:", err);
      setError(err.response?.data?.detail || "Error al obtener los proyectos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
  };

  const filteredProjects = projects.filter((project) =>
    Object.values(project).join(" ").toLowerCase().includes(search)
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const openStatusModal = (project: any) => {
    setEditStatusProjectId(project.id);
    setCurrentStatus(project.status || "registrado");
    setShowStatusModal(true);
    setError(null);
  };

  const closeStatusModal = () => {
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
        fetchProjects(currentPage);
      });
    } catch (err: any) {
      console.error("Error al actualizar el estado del proyecto:", err);
      setError("Ocurrió un error al actualizar el estado del proyecto.");
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al actualizar el estado del proyecto.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const getStatusStyle = (status: string | undefined) => {
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
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div className="d-flex flex-column flex-grow-1" style={{ marginLeft: sidebarWidth, width: "100%" }}>
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "60px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2
              className="fw-bold"
              style={{
                color: "var(--primary-color)",
                margin: 0,
                fontFamily: "var(--font-family-base)",
              }}
            >
              Estado de Proyectos
            </h2>
            <div className="d-flex" style={{ gap: "1rem" }}>
              <CustomButton variant="backIcon" onClick={() => router.push("/dashboard")}>
              </CustomButton>
            </div>
          </div>
          {error && <p className="text-danger fw-bold">{error}</p>}
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
            <div className="table-responsive">
              <table className="custom-table" style={{ fontFamily: "var(--font-family-base)" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Estado del Proyecto</th>
                    <th>Nombre del Proyecto</th>
                    <th>Propietario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.id || "N/D"}</td>
                        <td>
                          <span
                            className="badge status-badge"
                            style={{ ...getStatusStyle(project.status), fontSize: "0.8rem" }}
                          >
                            {(project.status || "No disponible").toUpperCase()}
                          </span>
                        </td>
                        <td>{project.name_project || "No disponible"}</td>
                        <td>{project.owner_name || "No disponible"}</td>
                        <td>
                          <CustomButton
                            variant="editIcon"
                            onClick={() => openStatusModal(project)}
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
                      <td colSpan={5} className="text-center text-muted">
                        No hay proyectos disponibles o no coinciden con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="d-flex justify-content-center align-items-center mt-3">
            <CustomButton variant="backIcon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            <span style={{ margin: "0 1.5rem" }}>
              Página {currentPage} de {totalPages}
            </span>
            <CustomButton variant="forwardIcon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </div>
        </div>

        {showStatusModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div
              className="modal fade show"
              style={{
                display: "block",
                marginTop: "40px",
                marginLeft: "20px",
                width: "90%",
                height: "auto",
                fontFamily: "var(--font-family-base)",
              }}
              tabIndex={-1}
              role="dialog"
            >
              <div className="modal-dialog modal-lg" role="document" style={{ width: "100%" }}>
                <div className="modal-content" style={{ fontFamily: "var(--font-family-base)" }}>
                  <div className="modal-header">
                    <h5 className="modal-title">Editar Estado del Proyecto #{editStatusProjectId}</h5>
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
          .custom-table th {
            color: #a0a0a0;
            font-weight: bold;
            background-color: #fff;
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
            font-weight: bold;
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
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProjectListStatusEditPage;
