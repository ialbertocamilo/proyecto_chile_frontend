import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/router";
import Card from "../src/components/common/Card";
import GooIcons from "../public/GoogleIcons";
import locationData from "../public/locationData";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import Title from "../src/components/Title";
import { AdminSidebar } from "../src/components/administration/AdminSidebar"; // Nuevo componente de sidebar
import Breadcrumb from "../src/components/common/Breadcrumb";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader"; // Importamos el nuevo componente

// Cargamos el mapa sin SSR
const NoSSRInteractiveMap = dynamic(() => import("../src/components/InteractiveMap"), {
  ssr: false,
});

type Country = "" | "Perú" | "Chile";

interface FormData {
  name_project: string;
  owner_name: string;
  owner_lastname: string;
  country: Country;
  department: string;
  province: string;
  district: string;
  building_type: string;
  main_use_type: string;
  number_levels: number;
  number_homes_per_level: number;
  built_surface: number;
  latitude: number;
  longitude: number;
}

const initialFormData: FormData = {
  name_project: "",
  owner_name: "",
  owner_lastname: "",
  country: "",
  department: "",
  province: "",
  district: "",
  building_type: "",
  main_use_type: "",
  number_levels: 0,
  number_homes_per_level: 0,
  built_surface: 0,
  latitude: -33.4589314398474,
  longitude: -70.6703553846175,
};

const ProjectWorkflowPart1: React.FC = () => {
  useAuth();
  const router = useRouter();
  const isViewOnly = true; // Forzar el modo de vista

  const [, setPrimaryColor] = useState("#3ca7b7");
  const [step, setStep] = useState<number>(1);
  const [locationSearch, setLocationSearch] = useState("");
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Estado para almacenar datos del header del proyecto
  const [projectHeaderData, setProjectHeaderData] = useState({
    projectName: "",
    region: "",
  });

  useEffect(() => {
    const pColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim() || "#3ca7b7";
    setPrimaryColor(pColor);
  }, []);

  // Obtener datos del localStorage para el header del proyecto
  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("project_name_view") || "";
      const region = localStorage.getItem("project_department_view") || "";
      setProjectHeaderData({ projectName: name, region: region });
    }
  }, []);

  // Actualiza el step en modo vista si se pasa como query
  useEffect(() => {
    if (router.isReady && isViewOnly) {
      const stepQuery = router.query.step;
      if (stepQuery) {
        const stepNumber = parseInt(stepQuery as string, 10);
        if (!isNaN(stepNumber)) {
          setStep(stepNumber);
        }
      }
    }
  }, [router.isReady, router.query.step, isViewOnly]);

  // Carga de datos del proyecto si se está visualizando
  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.id) {
      setFormData(initialFormData);
      return;
    }
    const projectIdParam = router.query.id;
    const projectIdStr = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data: projectData } = await axios.get(
          `${constantUrlApiEndpoint}/projects/${projectIdStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFormData({
          name_project: projectData.name_project || "",
          owner_name: projectData.owner_name || "",
          owner_lastname: projectData.owner_lastname || "",
          country: projectData.country || "",
          department: projectData.divisions?.department || "",
          province: projectData.divisions?.province || "",
          district: projectData.divisions?.district || "",
          building_type: projectData.building_type || "",
          main_use_type: projectData.main_use_type || "",
          number_levels: projectData.number_levels || 0,
          number_homes_per_level: projectData.number_homes_per_level || 0,
          built_surface: projectData.built_surface || 0,
          latitude: projectData.latitude || -33.4589314398474,
          longitude: projectData.longitude || -70.6703553846175,
        });
      } catch (error: unknown) {
        console.error("Error fetching project data", error);
      }
    };
    fetchProjectData();
  }, [router.isReady, router.query.id]);

  // Función para obtener el id del proyecto desde localStorage
  const getProjectId = () => localStorage.getItem("project_id_view") || "";

  // Definición de los pasos para la sidebar (modo vista)
  const steps = [
    {
      stepNumber: 1,
      iconName: "assignment_ind",
      title: "Agregar detalles de propietario / proyecto y clasificación de edificaciones",
    },
    {
      stepNumber: 2,
      iconName: "location_on",
      title: "Ubicación del proyecto",
    },
    {
      stepNumber: 6,
      iconName: "build",
      title: "Detalles constructivos",
    },
    {
      stepNumber: 7,
      iconName: "design_services",
      title: "Recinto",
    },
  ];

  // Función para manejar el cambio de paso en la sidebar
  const handleSidebarStepChange = (newStep: number) => {
    const projectId = getProjectId();
    if (newStep === 1 || newStep === 2) {
      // Para pasos 1 y 2 usamos la misma ruta
      router.push(`/workflow-part1-view?id=${projectId}&step=${newStep}`);
    } else if (newStep === 6) {
      router.push(`/workflow-part2-view?id=${projectId}&step=4`);
    } else if (newStep === 7) {
      router.push(`/workflow-part2-view?id=${projectId}&step=7`);
    }
  };

  // Render del encabezado principal
  const renderMainHeader = () => {
    return (
      <Card className="header-card">
        <div className="d-flex flex-column w-100">
          <Title text="Vista de Proyecto" />
          <div className="d-flex justify-content-between align-items-center w-100">
            <ProjectInfoHeader
              projectName={projectHeaderData.projectName}
              region={projectHeaderData.region}
            />
            <Breadcrumb
              items={[
                {
                  title: "Vista de Proyecto",
                  href: "/",
                  active: true,
                },
              ]}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <GooIcons />
      <div>
        <div>{renderMainHeader()}</div>
        <Card>
          <div>
            <div className="d-flex flex-wrap" style={{ alignItems: "stretch", gap: 0 }}>
              {/* Se utiliza el AdminSidebar para renderizar dinámicamente los pasos */}
              <AdminSidebar activeStep={step} onStepChange={handleSidebarStepChange} steps={steps} />
              <div className="content p-4" style={{ flex: 1 }}>
                {step === 1 && (
                  <>
                    {/* Paso 1: Datos generales */}
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del proyecto</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          disabled={true}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Apellido del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_lastname}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
                        <select className="form-control" value={formData.country} disabled={true}>
                          <option value="">Seleccione un país</option>
                          {Object.keys(locationData).map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento</label>
                        <select className="form-control" value={formData.department} disabled={true}>
                          <option value="">Seleccione un departamento</option>
                          {formData.country &&
                            Object.keys(locationData[formData.country]?.departments || {}).map(
                              (dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Provincia</label>
                        <select className="form-control" value={formData.province} disabled={true}>
                          <option value="">Seleccione una provincia</option>
                          {formData.country &&
                            formData.department &&
                            (locationData[formData.country]?.departments?.[formData.department] || []).map(
                              (prov) => (
                                <option key={prov} value={prov}>
                                  {prov}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Distrito</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.district}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de edificación</label>
                        <select className="form-control" value={formData.building_type} disabled={true}>
                          <option value="">Seleccione un tipo de edificación</option>
                          <option value="Unifamiliar">Unifamiliar</option>
                          <option value="Duplex">Duplex</option>
                          <option value="Vertical / Departamentos">Vertical / Departamentos</option>
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de uso principal</label>
                        <select className="form-control" value={formData.main_use_type} disabled={true}>
                          <option value="">Seleccione un tipo de uso</option>
                          <option value="Viviendas">Viviendas</option>
                          <option value="Oficinas">Oficinas</option>
                          <option value="Terciarios">Terciarios</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de niveles</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.number_levels}
                          disabled={true}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de viviendas / oficinas x nivel</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Superficie construida (m²)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.built_surface}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* Paso 2: Ubicación */}
                    <div
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "30px",
                        marginBottom: "20px",
                      }}
                    >
                      <div className="row">
                        <div className="col-12 mb-3">
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              className="form-control"
                              value={locationSearch}
                              onChange={(e) => setLocationSearch(e.target.value)}
                              style={{ paddingLeft: "40px" }}
                              disabled={true}
                            />
                            <span
                              className="material-icons"
                              style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#ccc",
                              }}
                            >
                              search
                            </span>
                          </div>
                        </div>
                        <div className="col-12 col-md-8 mb-3">
                          <div style={{ pointerEvents: "none" }}>
                            <NoSSRInteractiveMap
                              onLocationSelect={() => {}}
                              initialLat={formData.latitude}
                              initialLng={formData.longitude}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <label
                            className="form-label"
                            style={{
                              width: "100%",
                              height: "20px",
                              marginTop: "20px",
                            }}
                          >
                            Datos de ubicaciones encontradas
                          </label>
                          <textarea
                            className="form-control mb-2"
                            rows={5}
                            value={`Latitud: ${formData.latitude}, Longitud: ${formData.longitude}`}
                            readOnly
                            style={{
                              width: "100%",
                              height: "100px",
                              marginTop: "0px",
                            }}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="d-flex">
                          {/* Aquí podrías agregar botones o acciones adicionales si fuera necesario */}
                        </div>
                        <div className="d-flex">
                          {/* Alternativa para otros botones */}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <style jsx>{`
        .container {
          font-family: var(--font-family-base);
          font-weight: normal;
        }
      `}</style>
    </>
  );
};

export default ProjectWorkflowPart1;
