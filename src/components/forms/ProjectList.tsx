import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface ProjectListProps {
  setActiveView: (view: string) => void;
}

// Arrays de opciones para los select
const countryOptions = ["Perú", "Chile", "Argentina", "Brasil"];
const departmentOptions = ["Lima", "Arequipa", "Cusco"]; // Ejemplo para Perú
const provinceOptions = ["Provincia 1", "Provincia 2", "Provincia 3"]; // Ejemplo
const districtOptions = ["Distrito 1", "Distrito 2", "Distrito 3"]; // Ejemplo

const ProjectList = ({ setActiveView }: ProjectListProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 5; // cantidad de elementos por página

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProjectData, setEditProjectData] = useState<any>({}); // datos del proyecto en edición

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  // Función para cargar proyectos con paginación
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
        params: {
          limit,
          num_pag: page,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Proyectos recibidos:", response.data);
      // Se asume que el backend retorna { total_results, total_pages, current_page, per_page, projects: [...] }
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

  // Filtro de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = projects.filter((project) =>
      Object.values(project).join(" ").toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Abrir modal de edición y cargar los datos actuales del proyecto
  const handleOpenEditModal = (project: any) => {
    const dataToEdit = {
      id: project.id, // Aseguramos que el ID se coloque correctamente
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

  // Manejar cambios en el formulario del modal para campos simples
  const handleEditChange = (field: string, value: any) => {
    setEditProjectData({
      ...editProjectData,
      [field]: value,
    });
  };

  // Para campos anidados en divisions
  const handleEditDivisionChange = (subfield: string, value: any) => {
    setEditProjectData({
      ...editProjectData,
      divisions: {
        ...editProjectData.divisions,
        [subfield]: value,
      },
    });
  };

  // Guardar cambios (PUT) usando el nuevo endpoint para la edición
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
      console.log("Actualizando proyecto con id:", editProjectData.id);
      const url = `http://deuman-backend.svgdev.tech/my-projects/${editProjectData.id}/update`;
      console.log("Endpoint URL:", url);

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

      console.log("Payload to update:", updatedData);

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
        // Se vuelve a cargar la página actual
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

  // Eliminar proyecto
  const handleDelete = async (projectId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar este proyecto?",
      text: "Esta acción no se puede deshacer.",
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

  // Cerrar modal sin cambios
  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  return (
    <div>
      <h4 className="fw-bold">Listado de proyectos</h4>
      {error && <p className="text-danger fw-bold">{error}</p>}
      {loading ? (
        <p className="text-primary fw-bold">🔄 Cargando proyectos...</p>
      ) : (
        <>
          {/* Barra de búsqueda */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar proyecto..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          {/* Tabla de proyectos */}
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
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
                          className={`badge bg-${
                            project.status?.toLowerCase() === "rechazado" ? "danger" : "success"
                          }`}
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
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleOpenEditModal(project)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(project.id)}
                        >
                          Eliminar
                        </button>
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
          {/* Controles de paginación */}
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

      {/* Botón para nuevo proyecto */}
      <button className="btn btn-primary mt-3" onClick={() => setActiveView("projectWorkflow")}>
        + Proyecto Nuevo
      </button>

      {/* Modal flotante para editar */}
      {showEditModal && (
        <>
          {/* Fondo del modal */}
          <div className="modal-backdrop fade show"></div>
          {/* Modal */}
          <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Proyecto #{editProjectData.id}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  {/* Select para País y División */}
                  <div className="row g-2 mb-3">
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
                  </div>
                  <div className="row g-2 mb-3">
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
                  </div>
                  {/* Resto de los campos */}
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre del Proyecto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.name_project}
                        onChange={(e) => handleEditChange("name_project", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Propietario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.owner_name}
                        onChange={(e) => handleEditChange("owner_name", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Apellido Propietario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.owner_lastname}
                        onChange={(e) => handleEditChange("owner_lastname", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tipo de Edificación</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProjectData.building_type}
                        onChange={(e) => handleEditChange("building_type", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
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
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Superficie (m2)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.built_surface}
                        onChange={(e) => handleEditChange("built_surface", e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editProjectData.latitude}
                        onChange={(e) => handleEditChange("latitude", e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
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
                  <button className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={handleEditSubmit}>
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
