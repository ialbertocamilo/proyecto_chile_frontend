// recinto-edit-mode-create.tsx

import RecintoCaractersComponent from "@/components/RecintoCaractersComponentEdit";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import Breadcrumb from "@/components/common/Breadcrumb";
import { notify } from "@/utils/notify";
import React, { useEffect, useState } from "react";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

interface IRegion {
  id: number;
  nombre_region: string;
}

interface IComuna {
  id: number;
  nombre_comuna: string;
  latitud: number;
  longitud: number;
  zonas_termicas: string[];
  region_id: number;
}

interface IEnclosureProfile {
  id: number;
  code: string;
  name: string;
  // ... otros campos que pudiera tener la respuesta
}

export interface IFormData {
  selectedRegion: string;
  selectedComuna: string;
  selectedZonaTermica: string;
  nombreRecinto: string;
  perfilOcupacion: number;
  alturaPromedio: string;
  sensorCo2: boolean;
}

const LOCAL_STORAGE_KEY = "recintoFormData";

const RecintoEditModeCreate: React.FC = () => {
  const [projectName, setProjectName] = useState<string>("Nombre del Proyecto");
  const [projectDepartment, setProjectDepartment] = useState<string>("Región");
  const [projectId, setProjectId] = useState<string>("");

  // ---------------------------
  //  Estados para los desplegables y formulario
  // ---------------------------
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [comunas, setComunas] = useState<IComuna[]>([]);
  const [selectedComuna, setSelectedComuna] = useState<string>("");
  const [zonasTermicas, setZonasTermicas] = useState<string[]>([]);
  const [selectedZonaTermica, setSelectedZonaTermica] = useState<string>("");

  // ---------------------------
  //  Perfiles de ocupación (desplegable)
  // ---------------------------
  const [enclosureProfiles, setEnclosureProfiles] = useState<IEnclosureProfile[]>([]);
  const [perfilOcupacion, setPerfilOcupacion] = useState<number>(0);

  // ---------------------------
  //  Otros campos del formulario
  // ---------------------------
  const [nombreRecinto, setNombreRecinto] = useState<string>("");
  const [alturaPromedio, setAlturaPromedio] = useState<string>(""); // Se enviará como número
  const [sensorCo2, setSensorCo2] = useState<boolean>(false);

  // ---------------------------
  //  Recuperar datos del proyecto y del formulario (si existen) del localStorage
  // ---------------------------
  useEffect(() => {
    const name = localStorage.getItem("project_name") || "Nombre del Proyecto";
    const department = localStorage.getItem("project_department") || "Región";
    const pid = localStorage.getItem("project_id") || "";
    setProjectName(name);
    setProjectDepartment(department);
    setProjectId(pid);

    // Recuperar datos del formulario guardados en "recintoFormData"
    const savedFormData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFormData) {
      const data: IFormData = JSON.parse(savedFormData);
      setSelectedRegion(data.selectedRegion);
      setSelectedComuna(data.selectedComuna);
      setSelectedZonaTermica(data.selectedZonaTermica);
      setNombreRecinto(data.nombreRecinto);
      setPerfilOcupacion(data.perfilOcupacion);
      setAlturaPromedio(data.alturaPromedio);
      setSensorCo2(data.sensorCo2);
    }
  }, []);

  // ---------------------------
  //  Guardar cambios en el formulario en el localStorage
  // ---------------------------
  useEffect(() => {
    const formData: IFormData = {
      selectedRegion,
      selectedComuna,
      selectedZonaTermica,
      nombreRecinto,
      perfilOcupacion,
      alturaPromedio,
      sensorCo2,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [selectedRegion, selectedComuna, selectedZonaTermica, nombreRecinto, perfilOcupacion, alturaPromedio, sensorCo2]);

  // ---------------------------
  //  useEffect para cargar Regiones
  // ---------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchRegions = async () => {
      try {
        const response = await fetch(`${constantUrlApiEndpoint}/regiones`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al cargar las regiones");
        }
        const data = await response.json();
        setRegions(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRegions();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedRegion) {
      setComunas([]);
      return;
    }

    const fetchComunas = async () => {
      try {
        const response = await fetch(
          `${constantUrlApiEndpoint}/comunas/${selectedRegion}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al cargar las comunas");
        }
        const data = await response.json();
        setComunas(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComunas();
  }, [selectedRegion]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedComuna) {
      setZonasTermicas([]);
      return;
    }

    const fetchZonasTermicas = async () => {
      try {
        const response = await fetch(
          `${constantUrlApiEndpoint}/zonas-termicas/${selectedComuna}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al cargar las zonas térmicas");
        }
        const data = await response.json();
        setZonasTermicas(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchZonasTermicas();
  }, [selectedComuna]);

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
    // Validación de campos obligatorios
    // Se debe reemplazar la coma por punto para la conversión a número si es necesario.
    const normalizedHeight = alturaPromedio.replace(",", ".");
    const altura = parseFloat(normalizedHeight);
    if (
      !selectedRegion ||
      !selectedComuna ||
      !selectedZonaTermica ||
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

      const recintoId = localStorage.getItem("recinto_id");
      if (!recintoId) {
        notify("ID del recinto no encontrado");
        return;
      }

      const payload = {
        name_enclosure: nombreRecinto,
        region_id: parseInt(selectedRegion),
        comuna_id: parseInt(selectedComuna),
        zona_termica: selectedZonaTermica,
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
      {/* Card del título y encabezado del proyecto */}
      <Card>
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Title text="Edición de Recinto" />
              <ProjectInfoHeader
                projectName={projectName}
                region={projectDepartment}
              />
            </div>
            <Breadcrumb
              items={[
                { title: "Inicio", href: "/" },
                { title: "Edición de Recinto", href: "/recinto-edit-mode-create" },
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
            {/* 1. Nombre proyecto */}
            <div className="col-6 mb-3">
              <label htmlFor="projectName" className="form-label">
                Nombre proyecto
              </label>
              <input
                id="projectName"
                type="text"
                className="form-control"
                placeholder="Nombre del Proyecto"
                value={projectName}
                readOnly
              />
            </div>

            {/* 2. Región (desplegable) */}
            <div className="col-6 mb-3">
              <label htmlFor="region" className="form-label">
                Región
              </label>
              <select
                id="region"
                className="form-select"
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  // Limpiar campos dependientes
                  setSelectedComuna("");
                  setSelectedZonaTermica("");
                }}
              >
                <option value="">Seleccione una región</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nombre_region}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Comuna (desplegable) */}
            <div className="col-6 mb-3">
              <label htmlFor="comuna" className="form-label">
                Comuna
              </label>
              <select
                id="comuna"
                className="form-select"
                value={selectedComuna}
                onChange={(e) => {
                  setSelectedComuna(e.target.value);
                  setSelectedZonaTermica("");
                }}
                disabled={!selectedRegion}
              >
                <option value="">Seleccione una comuna</option>
                {comunas.map((comuna) => (
                  <option key={comuna.id} value={comuna.id}>
                    {comuna.nombre_comuna}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Zona Térmica Proyecto (desplegable) */}
            <div className="col-6 mb-3">
              <label htmlFor="zonaTermica" className="form-label">
                Zona Térmica Proyecto
              </label>
              <select
                id="zonaTermica"
                className="form-select"
                value={selectedZonaTermica}
                onChange={(e) => setSelectedZonaTermica(e.target.value)}
                disabled={!selectedComuna}
              >
                <option value="">Seleccione zona térmica</option>
                {zonasTermicas.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="col-6 mb-3">
              <label htmlFor="alturaPromedio" className="form-label">
                Altura Promedio Recinto
              </label>
              <input
                id="alturaPromedio"
                type="text"
                className="form-control"
                placeholder="Ej: 2.5 (en metros)"
                value={alturaPromedio}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo se permiten números, punto y coma
                  const regex = /^[0-9.,]*$/;
                  if (regex.test(value)) {
                    setAlturaPromedio(value);
                  }
                }}
              />
            </div>

            {/* Sensor CO2 */}
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

export default RecintoEditModeCreate;