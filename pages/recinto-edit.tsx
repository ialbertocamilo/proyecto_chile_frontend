import RecintoCaractersComponent from "@/components/RecintoCaractersComponentEdit";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import Breadcrumb from "@/components/common/Breadcrumb";
import { notify } from "@/utils/notify";
import React, { useEffect, useState } from "react";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

export interface IFormData {
  nombreRecinto: string;
  perfilOcupacion: number;
  alturaPromedio: string;
  sensorCo2: boolean;
}

const LOCAL_STORAGE_KEY = "recintoFormData";

const RecintoEdit: React.FC = () => {
  const [projectName, setProjectName] = useState<string>("Nombre del Proyecto");
  const [projectDepartment, setProjectDepartment] = useState<string>("Región");
  const [projectId, setProjectId] = useState<string>("");

  // ---------------------------
  //  Estados para los campos del formulario restantes
  // ---------------------------
  const [nombreRecinto, setNombreRecinto] = useState<string>("");
  const [perfilOcupacion, setPerfilOcupacion] = useState<number>(0);
  const [alturaPromedio, setAlturaPromedio] = useState<string>(""); // Se enviará como número
  const [sensorCo2, setSensorCo2] = useState<boolean>(false);
  const [enclosureProfiles, setEnclosureProfiles] = useState<
    { id: number; name: string }[]
  >([]);

  // ---------------------------
  //  Recuperar datos del proyecto y del formulario guardados en localStorage
  // ---------------------------
  useEffect(() => {
    const name = localStorage.getItem("project_name_edit") || "Nombre del Proyecto";
    const department = localStorage.getItem("project_department_edit") || "Región";
    const pid = localStorage.getItem("project_id_edit") || "";
    setProjectName(name);
    setProjectDepartment(department);
    setProjectId(pid);

    const savedFormData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFormData) {
      const data: IFormData = JSON.parse(savedFormData);
      setNombreRecinto(data.nombreRecinto);
      setPerfilOcupacion(data.perfilOcupacion);
      setAlturaPromedio(data.alturaPromedio);
      setSensorCo2(data.sensorCo2);
    }
  }, []);

  // ---------------------------
  //  Guardar cambios del formulario en localStorage
  // ---------------------------
  useEffect(() => {
    const formData: IFormData = {
      nombreRecinto,
      perfilOcupacion,
      alturaPromedio,
      sensorCo2,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [nombreRecinto, perfilOcupacion, alturaPromedio, sensorCo2]);

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

  const handleSave = async () => {
    // Se reemplaza la coma por el punto para convertir correctamente el valor a número
    const altura = parseFloat(alturaPromedio.replace(",", "."));
    if (
      !nombreRecinto.trim() ||
      !perfilOcupacion ||
      !alturaPromedio.trim() ||
      isNaN(altura) ||
      altura <= 0
    ) {
      notify(
        "Por favor, complete todos los campos requeridos y asegúrese de que la altura sea un número positivo"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const recintoId = localStorage.getItem("recinto_id");
      if (!recintoId) {
        notify("ID del recinto no encontrado");
        return;
      }

      const payload = {
        name_enclosure: nombreRecinto,
        occupation_profile_id: perfilOcupacion,
        height: altura,
        co2_sensor: sensorCo2 ? "Si" : "No",
      };

      console.log("Payload a enviar:", payload);

      const response = await fetch(
        `${constantUrlApiEndpoint}/enclosure-generals-update/${projectId}/${recintoId}`,
        {
          method: "PUT",
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
        notify(result.detail || "Error al actualizar los datos");
        return;
      }

      notify("Recinto actualizado correctamente");
      // Recargar la página por completo (manteniendo los datos del formulario en localStorage)
      window.location.reload();
    } catch (error) {
      console.error("Error en handleSave:", error);
      notify("Error al actualizar los datos");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      {/* Card del título y encabezado del proyecto con Breadcrumb alineado a la derecha */}
      <Card>
        <div>
          <Title text="Edición de Recinto" />
          <div className="d-flex justify-content-between align-items-center">
            <ProjectInfoHeader
              projectName={projectName}
              region={projectDepartment}
            />
            <Breadcrumb
              items={[
                { title: "Inicio", href: "/" },
                { title: "Editar Recinto", href: "/recinto-edit" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Card con los campos restantes "Características de la edificación" */}
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
                  // Solo se permiten los dígitos 0-9, el punto y la coma
                  const regex = /^[0-9.,]*$/;
                  if (regex.test(value)) {
                    setAlturaPromedio(value);
                  }
                }}
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

          {/* Botones: Regresar a la izquierda y Actualizar Datos a la derecha */}
          <div className="d-flex justify-content-between">
            <CustomButton variant="back" onClick={handleBack}>
              Regresar
            </CustomButton>
            <CustomButton variant="save" onClick={handleSave}>
              Actualizar Datos
            </CustomButton>
          </div>
        </div>
      </Card>

      {/* Card para "Características térmicas de la envolvente" */}
      <Card>
        <div>
          <Title text="Características térmicas de la envolvente" />
          <RecintoCaractersComponent />
        </div>
      </Card>
    </>
  );
};

export default RecintoEdit;
