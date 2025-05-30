// recinto-create.tsx
import RecintoCaractersComponent from "@/components/RecintoCaractersComponent";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import { useRecintos } from "@/context/RecintosContext";
import { useApi } from "@/hooks/useApi";
import { Recinto } from "@/types/recinto";
import { notify } from "@/utils/notify";
import React, { useEffect, useState } from "react";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

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
  const { put } = useApi();

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
      // actualizarStatus(); // El estado del proyecto ahora se actualiza al guardar Agua Caliente Sanitaria
      setIsRecintoCreated(true);
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

      {/* Card con los campos de "Características de la edificación" */}
      <Card>
        <div>
          <Title text="Características de la edificación" />
          <div className="row mt-4">
            {/*
              Se ha eliminado el campo "Nombre proyecto"
            */}
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
              >
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <CustomButton variant="back" onClick={handleBack}>
              Regresar
            </CustomButton>
            <div>
              <CustomButton onClick={handleCrearNuevoRecinto} className="me-2" style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}>
                Nuevo recinto
              </CustomButton>
              <CustomButton variant="save" onClick={handleSave}>
                Guardar
              </CustomButton>
            </div>
          </div>
        </div>
      </Card>

      {isRecintoCreated && (
        <Card>
          <div>
            <Title text="Características térmicas de la envolvente" />
            <RecintoCaractersComponent />
          </div>
        </Card>
      )}
    </>
  );
};

export default RecintoCreate;
