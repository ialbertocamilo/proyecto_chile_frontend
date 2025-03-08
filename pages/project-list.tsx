import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Swal, { SweetAlertResult } from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";

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
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
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
      const values: Array<string | number | boolean | null | undefined> =
        Object.values(project);
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

  const handleGoToWorkflow = (project_edit: Project): void => {
    console.log("[handleGoToWorkflow] Navegando al workflow para el proyecto:", project_edit.id);
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
      const url = `${constantUrlApiEndpoint}/projects/${projectId}/delete`;
      await axios.delete<void>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("¡Proyecto eliminado exitosamente!");
      fetchProjects();
    } catch (err: unknown) {
      console.error("[handleDelete] Error al eliminar proyecto:", err);
      setError("No se pudo eliminar el proyecto.");
      toast.error("No se pudo eliminar el proyecto.");
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
    <>
      <Navbar setActiveView={() => {}} />
      <TopBar sidebarWidth="80px" />

      {/* Contenedor principal */}
      <div
        className="container custom-container"
        style={{
          maxWidth: "1780px",
          marginLeft: "103px",
          marginRight: "0px",
          transition: "margin-left 0.1s ease",
          fontFamily: "var(--font-family-base)",
        }}
      >
        {/* Título en componente Title */}
        <Title text="Listado de Proyectos" />

        {/* Card para la búsqueda (manteniendo height: 10vh) */}
        <Card
  style={{
    height: "10vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "0 2rem",
  }}
>
  {/* Eliminé maxWidth para ocupar el 100% real */}
  <div
    style={{
      position: "relative",
      width: "100%", 
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* Input expandido completamente */}
    <input
      type="text"
      className="form-control"
      placeholder="Buscar..."
      value={search}
      onChange={handleSearch}
      style={{
        flexGrow: 1,
        height: "50px",
        borderRadius: "12px",
        fontSize: "16px",
        border: "1px solid #ddd",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        paddingLeft: "1rem",
        paddingRight: "4rem", // Espacio para el botón
        width: "100%", // explícito para mayor claridad
      }}
    />

    {/* Botón posicionado dentro del input */}
    <CustomButton
      variant="save"
      onClick={() => router.push("/workflow-part1-create")}
      className="new-project-btn"
      style={{
        position: "absolute",
        right: "5px",
        top: "50%",
        transform: "translateY(-50%)",
        height: "40px",
        fontSize: "14px",
        padding: "0 15px",
        borderRadius: "8px",
      }}
    >
      + Proyecto Nuevo
    </CustomButton>
  </div>
</Card>








        {/* Card para la tabla de proyectos */}
        <Card style={{ height: "auto" }}>
          <div className="card-body">
            {error && <p className="text-danger">{error}</p>}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Cargando...</div>
              </div>
            ) : (
              <div
                className="table-responsive scrollable-table"
                style={{ maxHeight: "500px", overflow: "auto" }}
              >
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th className="table-header">ID</th>
                      <th className="table-header">Estado</th>
                      <th className="table-header">Nombre proyecto</th>
                      <th className="table-header">Propietario</th>
                      <th className="table-header">Diseñador</th>
                      <th className="table-header">Director</th>
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
                                display: "inline-block",
                                fontSize: "0.8rem",
                                fontWeight: "normal",
                                padding: "8px 16px",
                                borderRadius: "0.5rem",
                                fontFamily: "var(--font-family-base)",
                              }}
                            >
                              {project.status
                                ? project.status.toUpperCase()
                                : "NO DISPONIBLE"}
                            </span>
                          </td>
                          <td>{project.name_project || "No disponible"}</td>
                          <td>{project.owner_name || "No disponible"}</td>
                          <td>{project.designer_name || "N/D"}</td>
                          <td>{project.director_name || "N/D"}</td>
                          <td>{project.address || "N/D"}</td>
                          <td>
                            {project.divisions?.department || "No disponible"}
                          </td>
                          <td className="text-center">
                            <div
                              className="action-btn-group"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <CustomButton
                                variant="editIcon"
                                onClick={() => handleGoToWorkflow(project)}
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
                                  handleDelete(
                                    project.id,
                                    project.name_project || "N/D"
                                  )
                                }
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  padding: "0.5rem",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center text-muted">
                          No hay proyectos disponibles o no coinciden con la
                          búsqueda.
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

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        /* ================================
           ESTILOS GENERALES Y DE LA TABLA
           ================================ */
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
          white-space: nowrap;
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
        .search-wwraper
        .table-header {
          color: #f5f5f5;
          font-size: 13px;
          font-weight: bold;
        }
        .status-badge {
          font-family: var(--font-family-base);
        }

        /* Spinner de carga */
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 200px;
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
          font-size: 1.2rem;
          color: var(--primary-color);
        }

        /* ===========================
           AJUSTES RESPONSIVE
           =========================== */
        @media (max-width: 1024px) {
          .custom-container {
            margin-left: 50px;
            margin-right: 20px;
          }
        }
        @media (max-width: 768px) {
          .custom-container {
            margin-left: 10px;
            margin-right: 10px;
          }
          input.form-control {
            height: 40px !important;
            font-size: 14px;
            padding-right: 110px !important;
          }
          .new-project-btn {
            height: 36px !important;
            font-size: 13px !important;
            right: 1rem !important;
          }
          .page-title {
            font-size: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .custom-container {
            margin-left: 10px;
            margin-right: 10px;
          }
          /* Ajustamos el card y la barra de búsqueda */
          .card {
            height: auto !important;
          }
          .new-project-btn {
            position: static !important;
            width: 100% !important;
            margin-top: 0.5rem !important;
          }
          input.form-control {
            width: 100% !important;
            margin-bottom: 0.5rem;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default ProjectListPage;
