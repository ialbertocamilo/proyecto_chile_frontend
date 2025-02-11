import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../../utils/constant-url-endpoint";
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
        `${constantUrlApiEndpoint}/projects/create`,
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
        setActiveView("ProjectList");
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

  // Componente para cada ítem del sidebar
  const SidebarItem = ({
    stepNumber,
    iconClass,
    title,
  }: {
    stepNumber: number;
    iconClass: string;
    title: string;
  }) => {
    const isSelected = step === stepNumber;
    const activeColor = "#3ca7b7";
    const inactiveColor = "#ccc";
    
    // Se aplica el borde redondo para todos los íconos, sin excepción
    const iconContainerStyle = {
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${isSelected ? activeColor : inactiveColor}`,
      borderRadius: "50%",
      marginRight: "0.5rem",
      fontSize: "1.2rem",
    };

    return (
      <li className="nav-item" style={{ cursor: "pointer" }} onClick={() => setStep(stepNumber)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${isSelected ? activeColor : inactiveColor}`,
            borderRadius: "4px",
            padding: "0.5rem",
            color: isSelected ? activeColor : inactiveColor,
          }}
        >
          <span style={iconContainerStyle}>
            <i className={iconClass}></i>
          </span>
          <span style={{ color: isSelected ? activeColor : inactiveColor, fontWeight: isSelected ? "bold" : "normal" }}>
            {title}
          </span>
        </div>
      </li>
    );
  };

  return (
    <div>
      {/* Encabezado general */}
      <div className="container mt-3">
        <h2 className="fw-bold">Proyecto nuevo</h2>
      </div>

      <div className="d-flex">
        {/* Sidebar sin título */}
        <div
          className="sidebar p-3 shadow"
          style={{
            minHeight: "100vh",
            width: "320px",
            borderRadius: "4px",
          }}
        >
          <ul className="nav flex-column gap-2">
            <SidebarItem stepNumber={1} iconClass="bi bi-person-circle" title="Agregar detalles propietario" />
            <SidebarItem stepNumber={2} iconClass="bi bi-geo-alt" title="Ubicación del proyecto" />
            <SidebarItem stepNumber={3} iconClass="bi bi-file-text" title="Definición de Materiales" />
            <SidebarItem stepNumber={4} iconClass="bi bi-tools" title="Detalles Constructivos" />
            <SidebarItem stepNumber={5} iconClass="bi bi-house" title="Elementos Operables" />
          </ul>
        </div>

        {/* Contenido principal sin título */}
        <div className="container" style={{ marginTop: "0", minHeight: "100vh" }}>
          <div className="card p-4 shadow" style={{ position: "relative", minHeight: "100%" }}>
            {step === 1 && (
              <>
                {/* Contenedor con borde gris claro para los datos */}
                <div
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "1rem",
                  }}
                >
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre del proyecto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name_project}
                        onChange={(e) => setFormData({ ...formData, name_project: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">País</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellidos del propietario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.owner_lastname}
                        onChange={(e) => setFormData({ ...formData, owner_lastname: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Departamento</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.divisions.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            divisions: { ...formData.divisions, department: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Provincia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.divisions.province}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            divisions: { ...formData.divisions, province: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Distrito</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.divisions.district}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            divisions: { ...formData.divisions, district: e.target.value },
                          })
                        }
                      />
                    </div>
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
                  </div>
                  
                  <div className="row mb-3">
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
                    <div className="col-md-6">
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
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">N° viviendas / oficinas por nivel</label>
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
                    <div className="col-md-6">
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
                </div>
                {/* Botón Guardar datos fuera del contenedor con borde */}
                <div className="mt-3 text-end">
                  <button
                    className="btn"
                    onClick={nextStep}
                    style={{
                      backgroundColor: "#3ca7b7",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "12px 20px",
                      fontSize: "1rem",
                      color: "#fff",
                    }}
                    disabled={loading}
                  >
                    Guardar datos
                  </button>
                </div>
              </>
            )}

            {/* Los demás pasos se mantienen sin cambios */}
            {step === 2 && (
              <>
                <h4 className="fw-bold mb-3">Ubicación del proyecto</h4>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <input type="text" className="form-control" placeholder="Buscar ubicación" />
                  </div>
                  <div className="col-md-8">
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
                  <div className="tab-pane fade" id="muros" role="tabpanel" aria-labelledby="muros-tab">
                    <p>Aquí irían los detalles específicos de Muros.</p>
                  </div>
                  <div className="tab-pane fade" id="techumbre" role="tabpanel" aria-labelledby="techumbre-tab">
                    <p>Aquí irían los detalles específicos de Techumbre.</p>
                  </div>
                  <div className="tab-pane fade" id="pisos" role="tabpanel" aria-labelledby="pisos-tab">
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
                <div className="tab-content p-3 border border-top-0" id="ventanasPuertasTabContent">
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
                  <div className="tab-pane fade" id="puertas" role="tabpanel" aria-labelledby="puertas-tab">
                    <p>Aquí podrías mostrar otra tabla con puertas.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="btn btn-secondary me-2" onClick={prevStep}>
                    Anterior
                  </button>
                  <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Enviando..." : "Guardar Proyecto"}
                  </button>
                </div>
              </>
            )}

            {error && <p className="text-danger fw-bold text-center mt-3">{error}</p>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          background-color: #fff;
        }
        .nav-item:hover > div {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default ProjectWorkflow;
//este funciona :) 