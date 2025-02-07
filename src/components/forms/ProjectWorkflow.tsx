import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import Swal from "sweetalert2";

interface ProjectWorkflowProps {
  setActiveView: (view: string) => void;
}
const ProjectWorkflow = ({ setActiveView }: ProjectWorkflowProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    country: "",
    divisions: {
      department: "",
      province: "",
      district: "",
    },
    name_project: "",
    owner_name: "",
    owner_lastname: "",
    constants_ids: [] as number[], 
    building_type: "",
    main_use_type: "",
    number_levels: 0,
    number_homes_per_level: 0,
    built_surface: 0,
    latitude: 0,
    longitude: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://deuman-backend.svgdev.tech/projects/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Proyecto creado con éxito:", response.data);

      Swal.fire({
        icon: "success",
        title: "Proyecto registrado",
        text: "¡El proyecto se ha creado correctamente!",
        confirmButtonText: "Ver Lista de Proyectos",
      }).then(() => {
        setActiveView("ProjectList"); // cambia la vista activa del Dashboard
      });

    } catch (err: any) {
      console.error("Error al registrar el proyecto:", err.response?.data || err.message);

      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((item: any) => item.msg).join(", ");
        setError(messages);
      } else if (typeof detail === "object") {
        setError(JSON.stringify(detail));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Hubo un problema al registrar el proyecto.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      {/* Barra lateral */}
      <div className="sidebar p-3 shadow" style={{ minHeight: "100vh", width: "300px" }}>
        <h5 className="fw-bold mb-4">Formulario</h5>
        <ul className="nav flex-column gap-2">
          <li
            className={`nav-item d-flex align-items-center ${
              step === 1 ? "fw-bold text-primary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setStep(1)}
          >
            <i className="bi bi-person-fill me-2"></i>
            <span>Agregar detalles propietario</span>
          </li>
          <li
            className={`nav-item d-flex align-items-center ${
              step === 2 ? "fw-bold text-primary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setStep(2)}
          >
            <i className="bi bi-geo-alt me-2"></i>
            <span>Ubicación del proyecto</span>
          </li>
          <li
            className={`nav-item d-flex align-items-center ${
              step === 3 ? "fw-bold text-primary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setStep(3)}
          >
            <i className="bi bi-file-text me-2"></i>
            <span>Definición de Materiales</span>
          </li>
          <li
            className={`nav-item d-flex align-items-center ${
              step === 4 ? "fw-bold text-primary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setStep(4)}
          >
            <i className="bi bi-tools me-2"></i>
            <span>Detalles Constructivos</span>
          </li>
          <li
            className={`nav-item d-flex align-items-center ${
              step === 5 ? "fw-bold text-primary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setStep(5)}
          >
            <i className="bi bi-house me-2"></i>
            <span>Elementos Operables</span>
          </li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="container mt-4">
        <div className="card p-4 shadow">
          {/* Paso 1: Datos del Propietario / Clasificación */}
          {step === 1 && (
            <>
              <h4 className="fw-bold mb-3">Crear nuevo proyecto</h4>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre del proyecto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name_project}
                    onChange={(e) =>
                      setFormData({ ...formData, name_project: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">País</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nombres del propietario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.owner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Apellidos del propietario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.owner_lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_lastname: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Divisions: department, province, district */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Departamento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.divisions.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        divisions: {
                          ...formData.divisions,
                          department: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Provincia</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.divisions.province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        divisions: {
                          ...formData.divisions,
                          province: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Distrito</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.divisions.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        divisions: {
                          ...formData.divisions,
                          district: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Tipo de edificación</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.building_type}
                    onChange={(e) =>
                      setFormData({ ...formData, building_type: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Uso principal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.main_use_type}
                    onChange={(e) =>
                      setFormData({ ...formData, main_use_type: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Número de niveles</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.number_levels}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        number_levels: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    N° viviendas / oficinas por nivel
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.number_homes_per_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        number_homes_per_level: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Superficie construida (m2)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.built_surface}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        built_surface: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-primary" onClick={nextStep}>
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* Paso 2: Ubicación del proyecto */}
          {step === 2 && (
            <>
              <h4 className="fw-bold mb-3">Ubicación del proyecto</h4>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar ubicación"
                  />
                </div>
                <div className="col-md-8">
                  {/* Mapa de ejemplo */}
                  <img src="/assets/images/maps.jpg" className="img-fluid" alt="Mapa" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Datos de ubicaciones encontradas</label>
                  <textarea className="form-control mb-2" rows={5}></textarea>
                  <button
                    className="btn btn-info w-100"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        latitude: -12.0464,
                        longitude: -77.0428,
                      });
                      alert("Ubicación asignada de prueba (Lima)");
                    }}
                  >
                    Ubicación actual
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-secondary me-2" onClick={prevStep}>
                  Anterior
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* Paso 3: Definición de Materiales */}
          {step === 3 && (
            <>
              <h4 className="fw-bold mb-3">Definición de Materiales</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Nombre Material</th>
                    <th>Conductividad (W/mk)</th>
                    <th>Calor específico (J/kgk)</th>
                    <th>Densidad (kg/m3)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hormigón Armado</td>
                    <td>1.63</td>
                    <td>1.63</td>
                    <td>2400</td>
                  </tr>
                  <tr>
                    <td>P.E 10kg/m3</td>
                    <td>0.043</td>
                    <td>0.043</td>
                    <td>10</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4">
                <button className="btn btn-secondary me-2" onClick={prevStep}>
                  Anterior
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* Paso 4: Detalles Constructivos*/}
          {step === 4 && (
            <>
              <h4 className="fw-bold mb-3">Detalles Constructivos</h4>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="detalles-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#detalles"
                    type="button"
                    role="tab"
                    aria-controls="detalles"
                    aria-selected="true"
                  >
                    Detalles
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="muros-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#muros"
                    type="button"
                    role="tab"
                    aria-controls="muros"
                    aria-selected="false"
                  >
                    Muros
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="techumbre-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#techumbre"
                    type="button"
                    role="tab"
                    aria-controls="techumbre"
                    aria-selected="false"
                  >
                    Techumbre
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="pisos-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#pisos"
                    type="button"
                    role="tab"
                    aria-controls="pisos"
                    aria-selected="false"
                  >
                    Pisos
                  </button>
                </li>
              </ul>

              <div className="tab-content p-3 border border-top-0" id="myTabContent">
                {/* Detalles */}
                <div
                  className="tab-pane fade show active"
                  id="detalles"
                  role="tabpanel"
                  aria-labelledby="detalles-tab"
                >
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ubicación detalle</th>
                        <th>Nombre detalle</th>
                        <th>Capas de interior a exterior</th>
                        <th>Espesor capa (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Techo</td>
                        <td>Techo Base</td>
                        <td>Hormigón Armado</td>
                        <td>10.0</td>
                      </tr>
                      <tr>
                        <td>Muro</td>
                        <td>Muro Base</td>
                        <td>Hormigón Armado</td>
                        <td>10.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Muros */}
                <div
                  className="tab-pane fade"
                  id="muros"
                  role="tabpanel"
                  aria-labelledby="muros-tab"
                >
                  <p>Aquí irían los detalles específicos de Muros.</p>
                </div>
                {/* Techumbre */}
                <div
                  className="tab-pane fade"
                  id="techumbre"
                  role="tabpanel"
                  aria-labelledby="techumbre-tab"
                >
                  <p>Aquí irían los detalles específicos de Techumbre.</p>
                </div>
                {/* Pisos */}
                <div
                  className="tab-pane fade"
                  id="pisos"
                  role="tabpanel"
                  aria-labelledby="pisos-tab"
                >
                  <p>Aquí irían los detalles específicos de Pisos.</p>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-secondary me-2" onClick={prevStep}>
                  Anterior
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* Paso 5: Elementos Operables (Ventanas/Puertas) */}
          {step === 5 && (
            <>
              <h4 className="fw-bold mb-3">Elementos Operables</h4>
              <ul className="nav nav-tabs" id="ventanasPuertasTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="ventanas-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#ventanas"
                    type="button"
                    role="tab"
                    aria-controls="ventanas"
                    aria-selected="true"
                  >
                    Ventanas
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="puertas-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#puertas"
                    type="button"
                    role="tab"
                    aria-controls="puertas"
                    aria-selected="false"
                  >
                    Puertas
                  </button>
                </li>
              </ul>

              <div
                className="tab-content p-3 border border-top-0"
                id="ventanasPuertasTabContent"
              >
                {/* Tabla Ventanas */}
                <div
                  className="tab-pane fade show active"
                  id="ventanas"
                  role="tabpanel"
                  aria-labelledby="ventanas-tab"
                >
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Nombre Elemento</th>
                        <th>U Vidrio [W/m2K]</th>
                        <th>FS Vidrio</th>
                        <th>Tipo Cierre</th>
                        <th>Tipo Marco</th>
                        <th>U Marco [W/m2K]</th>
                        <th>FM [%]</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>V Base</td>
                        <td>5.70</td>
                        <td>0.87</td>
                        <td>Corredera</td>
                        <td>Fierro</td>
                        <td>5.70</td>
                        <td>75%</td>
                      </tr>
                      <tr>
                        <td>VM-Mad</td>
                        <td>5.80</td>
                        <td>0.87</td>
                        <td>Corredera</td>
                        <td>Madera Sin RPT</td>
                        <td>2.60</td>
                        <td>75%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Tabla Puertas */}
                <div
                  className="tab-pane fade"
                  id="puertas"
                  role="tabpanel"
                  aria-labelledby="puertas-tab"
                >
                  <p>Aquí podrías mostrar otra tabla con puertas.</p>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-secondary me-2" onClick={prevStep}>
                  Anterior
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Guardar Proyecto"}
                </button>
              </div>
            </>
          )}

          {error && <p className="text-danger fw-bold text-center mt-3">{error}</p>}
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          background-color: #fff;
        }
        .nav-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default ProjectWorkflow;
