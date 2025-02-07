import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface ProjectListProps {
  setActiveView: (view: string) => void;
}

const modalWidth = "90%";   
const modalHeight = "auto"; 

const countryOptions = ["Perú", "Chile", "Argentina", "Brasil"];
const departmentOptions = ["Lima", "Arequipa", "Cusco"]; 
const provinceOptions = ["Provincia 1", "Provincia 2", "Provincia 3"]; 
const districtOptions = ["Distrito 1", "Distrito 2", "Distrito 3"]; 

const ProjectList = ({ setActiveView }: ProjectListProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 5; 
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProjectData, setEditProjectData] = useState<any>({});

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const fetchProjects = async (page: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("🔴 No se encontró un token en localStorage.");
      setError("No estás autenticado. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    try {
      console.log("📡 Obteniendo proyectos, página:", page);
      const response = await axios.get("http://deuman-backend.svgdev.tech/projects", {
        params: { limit, num_pag: page },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Proyectos recibidos:", response.data);
      setProjects(response.data.projects);
      setFilteredProjects(response.data.projects);
      setTotalPages(response.data.total_pages);
      setCurrentPage(response.data.current_page);
    } catch (err: any) {
      console.error("Error al obtener los proyectos:", err);
      if (err.response) {
        setError(err.response.data.detail || "Error al obtener los proyectos.");
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
    const filtered = projects.filter((project) =>
      Object.values(project).join(" ").toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleOpenEditModal = (project: any) => {
    const dataToEdit = {
      id: project.id,
      country: project.country || "",
      divisions: {
        district: project.divisions?.district || "",
        province: project.divisions?.province || "",
        department: project.divisions?.department || "",
      },
      name_project: project.name_project || "",
      owner_name: project.owner_name || "",
      owner_lastname: project.owner_lastname || "",
      building_type: project.building_type || "",
      main_use_type: project.main_use_type || "",
      number_levels: project.number_levels || 0,
      number_homes_per_level: project.number_homes_per_level || 0,
      built_surface: project.built_surface || 0,
      latitude: project.latitude || 0,
      longitude: project.longitude || 0,
    };

    setEditProjectData(dataToEdit);
    setShowEditModal(true);
    setError(null);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditProjectData({ ...editProjectData, [field]: value });
  };

  const handleEditDivisionChange = (subfield: string, value: any) => {
    setEditProjectData({
      ...editProjectData,
      divisions: { ...editProjectData.divisions, [subfield]: value },
    });
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }
    if (!editProjectData.id) {
      setError("El ID del proyecto no está definido.");
      return;
    }
    try {
      const url = `http://deuman-backend.svgdev.tech/my-projects/${editProjectData.id}/update`;
      const updatedData = {
        country: editProjectData.country,
        divisions: editProjectData.divisions,
        name_project: editProjectData.name_project,
        owner_name: editProjectData.owner_name,
        owner_lastname: editProjectData.owner_lastname,
        building_type: editProjectData.building_type,
        main_use_type: editProjectData.main_use_type,
        number_levels: Number(editProjectData.number_levels),
        number_homes_per_level: Number(editProjectData.number_homes_per_level),
        built_surface: Number(editProjectData.built_surface),
        latitude: Number(editProjectData.latitude),
        longitude: Number(editProjectData.longitude),
      };

      await axios.put(url, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.fire({
        title: "¡Proyecto editado correctamente!",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        setShowEditModal(false);
        fetchProjects(currentPage);
      });
    } catch (err: any) {
      console.error("Error al editar el proyecto:", err);
      setError("Ocurrió un error al editar el proyecto.");
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al editar el proyecto.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleDelete = async (projectId: number, projectName: string) => {
    const result = await Swal.fire({
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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }
    try {
      const url = `http://deuman-backend.svgdev.tech/project/${projectId}/delete`;
      await axios.delete(url, {
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
      fetchProjects(currentPage);
    } catch (err: any) {
      console.error("Error al eliminar proyecto:", err);
      setError("No se pudo eliminar el proyecto.");
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el proyecto.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
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
    <div>
      <style jsx>{`
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
        .custom-btn {
          background-color: #3ca7b7 !important;
          border: 2px solid #3ca7b7 !important;
          border-radius: 0.5rem !important;
          padding: 12px !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #fff !important;
          cursor: pointer;
        }
        .custom-btn:hover {
          background-color: #359aa9 !important;
          border-color: #359aa9 !important;
        }
        .custom-btn-delete {
          background-color: #dc3545 !important;
          border: 2px solid #dc3545 !important;
          border-radius: 0.5rem !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #fff !important;
          cursor: pointer;
        }
        .custom-btn-delete:hover {
          background-color: #c82333 !important;
          border-color: #c82333 !important;
        }
        .action-btn-group {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }
        .status-badge {
          display: inline-block;
          font-size: 1.1rem;
          font-weight: bold;
          padding: 8px 16px;
          border-radius: 0.5rem;
        }
        .modal-btn-cancel {
          background-color: #dc3545;
          border: 2px solid #dc3545;
          color: #fff;
          padding: 10px 20px;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: background-color 0.3s ease;
          margin-right: 10px;
        }
        .modal-btn-cancel:hover {
          background-color: #c82333;
          border-color: #c82333;
        }
        .modal-btn-save {
          background-color: #3ca7b7;
          border: 2px solid #3ca7b7;
          color: #fff;
          padding: 10px 20px;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }
        .modal-btn-save:hover {
          background-color: #329ca1;
          border-color: #329ca1;
        }
        /* Estilos para la sección de "Cargando..." */
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 80vh;
        }
        .loading-spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3ca7b7;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-text {
          font-size: 1.5rem;
          color: #3ca7b7;
          font-weight: bold;
        }
      `}</style>

      <h4 className="fw-bold">Listado de proyectos</h4>
      {error && <p className="text-danger fw-bold">{error}</p>}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Cargando...</div>
        </div>
      ) : (
        <>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔍︎"
              value={search}
              onChange={handleSearch}
            />
            <button
              className="btn custom-project-btn"
              onClick={() => setActiveView("projectWorkflow")}
            >
              + Proyecto Nuevo
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado del Proyecto</th>
                  <th>Nombre del proyecto</th>
                  <th>Propietario</th>
                  <th>Diseñador</th>
                  <th>Director responsable</th>
                  <th>Dirección</th>
                  <th>Departamento</th>
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
                          style={getStatusStyle(project.status)}
                        >
                          {project.status || "No disponible"}
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
                          <button
                            className="custom-btn action-btn me-2"
                            onClick={() => handleOpenEditModal(project)}
                          >
                            <i className="bi bi-pencil" style={{ color: "#fff" }}></i>
                          </button>
                          <button
                            className="custom-btn-delete action-btn"
                            onClick={() => handleDelete(project.id, project.name_project)}
                          >
                            <i className="bi bi-trash" style={{ color: "#fff" }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      No hay proyectos disponibles o no coinciden con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center align-items-center mt-3">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary ms-2"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {showEditModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{
              display: "block",
              marginTop: "40px",
              marginLeft: "20px",
              width: modalWidth,
              height: modalHeight,
            }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-lg" role="document" style={{ width: "100%" }}>
              <div className="modal-content" style={{ height: "100%" }}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar Proyecto #{editProjectData.id}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">País</label>
                      <select
                        className="form-select"
                        value={editProjectData.country}
                        onChange={(e) => handleEditChange("country", e.target.value)}
                      >
                        <option value="">Seleccione un país</option>
                        {countryOptions.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Departamento</label>
                      <select
                        className="form-select"
                        value={editProjectData.divisions?.department}
                        onChange={(e) => handleEditDivisionChange("department", e.target.value)}
                      >
                        <option value="">Seleccione un departamento</option>
                        {departmentOptions.map((dep) => (
                          <option key={dep} value={dep}>
                            {dep}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Provincia</label>
                      <select
                        className="form-select"
                        value={editProjectData.divisions?.province}
                        onChange={(e) => handleEditDivisionChange("province", e.target.value)}
                      >
                        <option value="">Seleccione una provincia</option>
                        {provinceOptions.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Distrito</label>
                      <select
                        className="form-select"
                        value={editProjectData.divisions?.district}
                        onChange={(e) => handleEditDivisionChange("district", e.target.value)}
                      >
                        <option value="">Seleccione un distrito</option>
                        {districtOptions.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Nombre del Proyecto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.name_project}
                        onChange={(e) => handleEditChange("name_project", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Propietario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.owner_name}
                        onChange={(e) => handleEditChange("owner_name", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Apellido Propietario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.owner_lastname}
                        onChange={(e) => handleEditChange("owner_lastname", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Tipo de Edificación</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.building_type}
                        onChange={(e) => handleEditChange("building_type", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Uso Principal</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.main_use_type}
                        onChange={(e) => handleEditChange("main_use_type", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Niveles</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.number_levels}
                        onChange={(e) => handleEditChange("number_levels", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Viviendas x Nivel</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.number_homes_per_level}
                        onChange={(e) => handleEditChange("number_homes_per_level", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Superficie (m2)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.built_surface}
                        onChange={(e) => handleEditChange("built_surface", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.latitude}
                        onChange={(e) => handleEditChange("latitude", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Longitude</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.longitude}
                        onChange={(e) => handleEditChange("longitude", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="modal-btn-cancel" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button className="modal-btn-save" onClick={handleEditSubmit}>
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectList;
