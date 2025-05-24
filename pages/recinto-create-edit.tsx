import RecintoCaractersComponent from "@/components/RecintoCaractersComponentEdit";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import Breadcrumb from "@/components/common/Breadcrumb";
import { notify } from "@/utils/notify";
import React, { useEffect, useState } from "react";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { useApi } from "@/hooks/useApi";

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
  level_id: string; // Add this line
}

const LOCAL_STORAGE_KEY = "recintoFormData";

const RecintoCreateEdit: React.FC = () => {
  const [projectName, setProjectName] = useState<string>("Nombre del Proyecto");
  const [projectDepartment, setProjectDepartment] = useState<string>("Región");
  const [projectId, setProjectId] = useState<string>("");

  // Estado para controlar si el recinto fue creado
  const [isRecintoCreated, setIsRecintoCreated] = useState<boolean>(false);

  // ---------------------------
  //  Estado para los campos del formulario restantes
  // ---------------------------
  const [nombreRecinto, setNombreRecinto] = useState<string>("");
  const [perfilOcupacion, setPerfilOcupacion] = useState<number>(0);
  const [alturaPromedio, setAlturaPromedio] = useState<string>(""); // Se enviará como número
  const [sensorCo2, setSensorCo2] = useState<boolean>(false);
  const [levelId, setLevelId] = useState<string>("");
  const [enclosureProfiles, setEnclosureProfiles] = useState<IEnclosureProfile[]>([]);

  // ---------------------------
  //  Recuperar datos del proyecto y del formulario guardados en localStorage
  // ---------------------------
  useEffect(() => {
    const name = localStorage.getItem("project_name_edit") || "Nombre del Proyecto";
    const department = localStorage.getItem("project_department_edit") || "Región";
    const pid = localStorage.getItem("project_id") || "";
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
      setLevelId(data.level_id || ""); // Add this line
    }

    // Verificar si el recinto ya fue creado
    const recintoId = localStorage.getItem("recinto_id");
    if (recintoId) {
      setIsRecintoCreated(true);
    }
  }, []);

  // ---------------------------
  //  Guardar cambios en el formulario en el localStorage
  // ---------------------------
  useEffect(() => {
    const formData: IFormData = {
      nombreRecinto,
      perfilOcupacion,
      alturaPromedio,
      sensorCo2,
      level_id: levelId, // Add this line
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [nombreRecinto, perfilOcupacion, alturaPromedio, sensorCo2, levelId]); // Add levelId to dependencies

  // ---------------------------
  //  useEffect para cargar Perfiles de ocupación (desplegable)
  // ---------------------------
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

  const { put } = useApi();
  
  const actualizarStatus = async () => {
    try {
      const project_id = localStorage.getItem("project_id");
      if (!project_id) {
        notify("No se encontró el project_id.");
        return;
      }
      console.log("ProjectId: ", project_id)
      // Construir la URL del endpoint con el project_id
      const url = `/project/${project_id}/status`;
      // Enviar la solicitud PUT con el status
      await put(url, { status: "en proceso" });
    } catch (error) {
      console.error("Error al actualizar el status:", error);
      notify("Error al actualizar el estado del proyecto.");
    }
  };

  const handleSave = async () => {
    // Se reemplaza la coma por el punto para que parseFloat funcione correctamente
    const normalizedAlturaPromedio = alturaPromedio.replace(/,/g, ".");
    const altura = parseFloat(normalizedAlturaPromedio);
    if (
      !nombreRecinto.trim() ||
      !perfilOcupacion ||
      !alturaPromedio.trim() ||
      isNaN(altura) ||
      altura <= 0
    ) {
      notify(
        "Por favor, complete todos los campos requeridos y asegúrese que la altura sea un número positivo"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const payload = {
        name_enclosure: nombreRecinto,
        occupation_profile_id: perfilOcupacion,
        height: altura,
        co2_sensor: sensorCo2 ? "Si" : "No",
        level_id: parseInt(levelId) || 0, // Add this line
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

      // Se guarda el id del recinto en el localStorage con la llave "recinto_id"
      localStorage.setItem("recinto_id", result.id.toString());

      notify("Recinto creado correctamente");
      actualizarStatus();
      // En lugar de recargar la página, actualizamos el estado para mostrar la Card de características térmicas
      setIsRecintoCreated(true);
    } catch (error) {
      console.error("Error en handleSave:", error);
      notify("Error al guardar los datos");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      {/* Card del título y encabezado del proyecto */}
      <Card>
        <div>
          <Title text="Crear Nuevo Recinto" />
          <div className="d-flex justify-content-between align-items-center">
            <ProjectInfoHeader
              projectName={projectName}
              region={projectDepartment}
              project_id={projectId ?? ""}
            />
            <Breadcrumb
              items={[
                { title: "Inicio", href: "/" },
                { title: "Nuevo Recinto", href: "/recinto-create-edit" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Card con los campos de "Características de la edificación" */}
      <Card>
        <div>
          <Title text="Características de la edificación" />
          <div className="row mt-4">
            {/* Campo: Nombre Recinto */}
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

            {/* Campo: Perfil de Ocupación */}
            <div className="col-6 mb-3">
              <label htmlFor="perfilOcupacion" className="form-label">
                Perfil de ocupación
              </label>
              <select
                id="perfilOcupacion"
                className="form-select"
                value={perfilOcupacion || ""}
                onChange={(e) =>
                  setPerfilOcupacion(parseInt(e.target.value))
                }
              >
                <option value="">Seleccione un perfil de ocupación</option>
                {enclosureProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo: Altura Promedio Recinto */}
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
                  // Permitir solo dígitos, punto y coma
                  const regex = /^[0-9.,]*$/;
                  if (regex.test(value)) {
                    setAlturaPromedio(value);
                  }
                }}
              />
            </div>

            {/* Campo: Nivel de Recinto */}
            <div className="col-6 mb-3">
              <label htmlFor="levelId" className="form-label">
                Nivel de Recinto
              </label>
              <input
                id="levelId"
                type="number"
                className="form-control"
                placeholder="Ej: 1"
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                min="0"
              />
            </div>

            {/* Campo: Sensor CO2 */}
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

          {/* Botones: Regresar a la izquierda y Guardar a la derecha */}
          <div className="d-flex justify-content-between">
            <CustomButton variant="back" onClick={handleBack}>
              Regresar
            </CustomButton>
            <CustomButton variant="save" onClick={handleSave}>
              Guardar
            </CustomButton>
          </div>
        </div>
      </Card>

      {/* Nueva Card para "Características térmicas de la envolvente"
          Se muestra solo si el recinto ya fue creado */}
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

export default RecintoCreateEdit;
