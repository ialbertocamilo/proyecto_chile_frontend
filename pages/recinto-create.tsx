// recinto-create.tsx
import RecintoCaractersComponent from "@/components/RecintoCaractersComponent";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import { useRecintos } from "@/context/RecintosContext";
import { useApi } from "@/hooks/useApi";
import { Recinto } from "@/types/recinto";
import { notify } from "@/utils/notify";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap icons
import React, { useEffect, useState } from "react";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import {ArrowLeft, Plus, Save} from "lucide-react";

// Styles for the collapsible section
const styles = {
  collapsibleHeader: {
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  smallerForm: {
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  }
};

interface IEnclosureProfile {
  id: number;
  code: string;
  name: string;
  // ... otros campos que pudiera tener la respuesta
}

interface IFormData {
  nombreRecinto: string;
  perfilOcupacion: number;
  alturaPromedio: string;
  sensorCo2: boolean;
  level: string;
}

const LOCAL_STORAGE_KEY = "recintoFormData";

const RecintoCreate: React.FC = () => {
  const { addRecinto } = useRecintos();
  const { put: _put } = useApi(); // Using _put to avoid unused variable warning

  // Se mantiene projectDepartment y projectId, en caso de que sean necesarios para otros componentes
  const [projectName, setProjectName] = useState<string>("Nombre del Proyecto");
  const [projectDepartment, setProjectDepartment] = useState<string>("Región");
  const [projectId, setProjectId] = useState<string>("");

  // Estados para el formulario sin los campos de región, comuna, zona térmica y nombre proyecto
  const [nombreRecinto, setNombreRecinto] = useState<string>("");
  const [perfilOcupacion, setPerfilOcupacion] = useState<number>(0);
  const [alturaPromedio, setAlturaPromedio] = useState<string>("");
  const [sensorCo2, setSensorCo2] = useState<boolean>(false);
  const [level, setLevel] = useState<string>("");

  // Perfiles de ocupación (desplegable)
  const [enclosureProfiles, setEnclosureProfiles] = useState<IEnclosureProfile[]>([]);

  // Estado para controlar si ya se creó el recinto
  const [isRecintoCreated, setIsRecintoCreated] = useState<boolean>(false);
  // Estado para controlar el colapso de la sección de características
  const [isEdificacionExpanded, setIsEdificacionExpanded] = useState<boolean>(true);
  // Estado para controlar el colapso de la sección de características térmicas
  const [isThermalExpanded, setIsThermalExpanded] = useState<boolean>(true);

  // Función para alternar la visibilidad de la sección de edificación
  const toggleEdificacionSection = () => {
    setIsEdificacionExpanded(!isEdificacionExpanded);
  };

  // Función para alternar la visibilidad de la sección de características térmicas
  const toggleThermalSection = () => {
    setIsThermalExpanded(!isThermalExpanded);
  };

  // Recuperar datos del proyecto y del formulario (si existen) del localStorage
  useEffect(() => {
    const name = localStorage.getItem("project_name") || "Nombre del Proyecto";
    const department = localStorage.getItem("project_department") || "Región";
    const pid = localStorage.getItem("last_created_project") || "";
    setProjectName(name);
    setProjectDepartment(department);
    setProjectId(pid);

    // Recuperar datos del formulario guardados
    const savedFormData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFormData) {
      const data: IFormData = JSON.parse(savedFormData);
      setNombreRecinto(data.nombreRecinto);
      setPerfilOcupacion(data.perfilOcupacion);
      setAlturaPromedio(data.alturaPromedio);
      setSensorCo2(data.sensorCo2);
      setLevel(data.level || "");
    }
  }, []);

  // Verificar si ya se creó un recinto (almacenado en el localStorage)
  useEffect(() => {
    if (localStorage.getItem("recinto_id")) {
      setIsRecintoCreated(true);
      // Si el recinto ya fue creado, colapsamos la sección de edificación
      setIsEdificacionExpanded(false);
    }
  }, []);

  // Guardar cambios en el formulario en el localStorage
  useEffect(() => {
    const formData: IFormData = {
      nombreRecinto,
      perfilOcupacion,
      alturaPromedio,
      sensorCo2,
      level,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [nombreRecinto, perfilOcupacion, alturaPromedio, sensorCo2, level]);

  // useEffect para cargar Perfiles de ocupación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfiles = async () => {
      try {
        const response = await fetch(
          `${constantUrlApiEndpoint}/user/enclosures-typing/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al cargar los perfiles de ocupación");
        }
        const data = await response.json();
        setEnclosureProfiles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfiles();
  }, []);

  const handleSave = async () => {
    // Validación simplificada
    if (
      !nombreRecinto.trim() ||
      !perfilOcupacion ||
      !alturaPromedio.trim() ||
      !level.trim()
    ) {
      notify("Por favor, complete todos los campos requeridos y asegúrese que la altura tenga un formato correcto");
      return;
    }

    const alturaNumerica = parseFloat(alturaPromedio.replace(/,/g, "."));
    if (isNaN(alturaNumerica) || alturaNumerica <= 0) {
      notify("La altura debe ser un número positivo. Verifique el formato ingresado.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      // Construir el payload, agregando valores predeterminados para campos obligatorios según lo requerido por la API
      const payload = {
        name_enclosure: nombreRecinto,
        region_id: 1,         // Valor predeterminado
        comuna_id: 1,         // Valor predeterminado
        zona_termica: "default", // Valor predeterminado
        occupation_profile_id: perfilOcupacion,
        height: alturaNumerica,
        co2_sensor: sensorCo2 ? "Si" : "No",
        level_id: parseInt(level),
      };

      console.log("Payload a enviar:", payload);

      const response = await fetch(
        `${constantUrlApiEndpoint}/enclosure-generals-create/${projectId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Status del response:", response.status);
      console.log("Respuesta del servidor:", result);

      if (!response.ok) {
        notify(result.detail || "Error al guardar los datos");
        return;
      }

      localStorage.setItem("recinto_id", result.id.toString());
      addRecinto(result as Recinto);
      notify("Recinto creado correctamente");

      // En lugar de recargar la página, actualizamos el estado para mostrar la Card de características térmicas
      setIsRecintoCreated(true);

      // Collapsar la sección de características de la edificación después de guardar
      setIsEdificacionExpanded(false);

      // Aseguramos que la sección de características térmicas esté expandida
      setIsThermalExpanded(true);
    } catch (error) {
      console.error("Error en handleSave:", error);
      notify("Error al guardar los datos");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Función para limpiar el formulario y localStorage y recargar la página
  const handleCrearNuevoRecinto = () => {
    setNombreRecinto("");
    setPerfilOcupacion(0);
    setAlturaPromedio("");
    setSensorCo2(false);
    setLevel("");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('recinto_id');
    window.location.reload();
  };

  return (
    <>
      {/* Card con encabezado del proyecto. Se mantiene el componente ProjectInfoHeader, 
          que ahora solo mostrará el departamento o la información necesaria */}
      <Card>
        <div>
          <Title text="Nuevo Recinto" />
          <div className="d-flex align-items-center">
            <ProjectInfoHeader
              projectName={projectName}
              region={projectDepartment}
              project_id={projectId ?? ""}
            />
            <div className="ms-auto">
              <Breadcrumb
                items={[
                  { title: "Inicio", href: "/" },
                  { title: "Nuevo Recinto", href: "/recinto-create" },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Card con los campos de "Características de la edificación" - Collapsible */}
      <Card>
        <div>
          <div className="d-flex justify-content-between align-items-center"
            style={styles.collapsibleHeader}
            onClick={toggleEdificacionSection}>
            <Title text="Características de la edificación" />
            <button className="btn btn-link p-0">
              <i className={`bi ${isEdificacionExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
          </div>

          {isEdificacionExpanded && (
            <>
              <div className="row mt-4" style={isRecintoCreated ? styles.smallerForm : {}}>
                {/* Se ha eliminado el campo "Nombre proyecto" */}
                <div className="col-6 mb-3">
                  <label htmlFor="nombreRecinto" className="form-label">
                    Nombre Recinto
                  </label>
                  <input
                    id="nombreRecinto"
                    type="text"
                    className="form-control"
                    placeholder="Ej: Sala 1"
                    value={nombreRecinto}
                    onChange={(e) => setNombreRecinto(e.target.value)}
                    disabled={isRecintoCreated}
                  />
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="perfilOcupacion" className="form-label">
                    Perfil de ocupación
                  </label>
                  <select
                    id="perfilOcupacion"
                    className="form-select"
                    value={perfilOcupacion || ""}
                    onChange={(e) => setPerfilOcupacion(parseInt(e.target.value))}
                    disabled={isRecintoCreated}
                  >
                    <option value="">Seleccione un perfil de ocupación</option>
                    {enclosureProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="alturaPromedio" className="form-label">
                    Altura Promedio Recinto (m)
                  </label>
                  <input
                    id="alturaPromedio"
                    type="text"
                    className="form-control"
                    placeholder="Ej: 2.5 (en metros)"
                    value={alturaPromedio}
                    onChange={(e) => {
                      const value = e.target.value;
                      const regex = /^[0-9.,]*$/;
                      if (regex.test(value)) {
                        setAlturaPromedio(value);
                      }
                    }}
                    disabled={isRecintoCreated}
                  />
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="level" className="form-label">
                    Nivel de Recinto
                  </label>
                  <input
                    id="level"
                    type="number"
                    className="form-control"
                    placeholder="Ej: 1"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    disabled={isRecintoCreated}
                  />
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="sensorCo2" className="form-label">
                    Sensor CO2
                  </label>
                  <select
                    id="sensorCo2"
                    className="form-select"
                    value={sensorCo2 ? "Si" : "No"}
                    onChange={(e) => setSensorCo2(e.target.value === "Si")}
                    disabled={isRecintoCreated}
                  >
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <CustomButton variant="back" onClick={handleBack}>
            <ArrowLeft className="me-2" size={18} />
            Regresar
          </CustomButton>
          <div>
            <CustomButton onClick={handleCrearNuevoRecinto} className="me-2" color="orange">
              <Plus className="me-2" size={18} />
              Crear otro recinto
            </CustomButton>
          {!isRecintoCreated && (
                    <CustomButton variant="save" onClick={handleSave}>
                      Guardar
                    </CustomButton>
                  )}
          </div>
        </div>
      </Card>

      {/* Card para "Características térmicas de la envolvente" - Solo cuando se crea el recinto */}
      {isRecintoCreated && (
        <Card>
          <div>
            <div className="d-flex justify-content-between align-items-center"
              style={styles.collapsibleHeader}
              onClick={toggleThermalSection}>
              <Title text="Características térmicas de la envolvente" />
              <button className="btn btn-link p-0">
                <i className={`bi ${isThermalExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
              </button>
            </div>
            {isThermalExpanded && (
              <div className="mt-2">
                <RecintoCaractersComponent />
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default RecintoCreate;
