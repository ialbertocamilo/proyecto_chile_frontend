import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/router";
import CustomButton from "../src/components/common/CustomButton";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Card from "../src/components/common/Card";
import GooIcons from "../public/GoogleIcons";
import locationData from "../public/locationData";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import SidebarItemComponent from "../src/components/common/SidebarItemComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Cargamos el mapa sin SSR
const NoSSRInteractiveMap = dynamic(
  () => import("../src/components/InteractiveMap"),
  { ssr: false }
);

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

// Definimos la interfaz para los proyectos
interface Project {
  name_project: string;
  // Puedes agregar más propiedades según tu modelo
}

// Valor inicial del formulario
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
  // Determina el modo: si existe un id, se asume edición (o vista si mode=view)
  const mode =
    (router.query.mode as string) || (router.query.id ? "edit" : "create");
  const isViewOnly = mode === "view";
  const modeParam = isViewOnly ? `&mode=${mode}` : "";

  const [, setPrimaryColor] = useState("#3ca7b7");
  const sidebarWidth = "300px";
  const [step, setStep] = useState<number>(1);
  const [locationSearch, setLocationSearch] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");

  // Se obtiene el color primario desde CSS o valor por defecto.
  useEffect(() => {
    const pColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim() || "#3ca7b7";
    setPrimaryColor(pColor);
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

  // Si se detecta un id y no estamos en modo creación, se carga la información del proyecto
  useEffect(() => {
    if (!router.query.id || mode === "create") {
      setFormData(initialFormData);
      return;
    }
    const projectIdParam = router.query.id;
    const projectIdStr = Array.isArray(projectIdParam)
      ? projectIdParam[0]
      : projectIdParam;
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
  }, [router.query.id, mode]);

  // Función para manejar cambios en los inputs
  const handleFormInputChange = useCallback(
    (field: keyof FormData, value: string | number) => {
      if (isViewOnly) return;
      // Evitar valores negativos en campos numéricos
      if (
        (field === "number_levels" ||
          field === "number_homes_per_level" ||
          field === "built_surface") &&
        typeof value === "number" &&
        value < 0
      ) {
        value = 0;
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Remover el error del campo si se corrige
      if (submitted && value !== "" && value !== 0) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [isViewOnly, submitted]
  );

  const handleCountryChange = useCallback(
    (country: Country) => {
      if (isViewOnly) return;
      handleFormInputChange("country", country);
      handleFormInputChange("department", "");
      handleFormInputChange("province", "");
      setErrors((prev) => ({
        ...prev,
        country: "",
        department: "",
        province: "",
      }));
    },
    [handleFormInputChange, isViewOnly]
  );

  const handleDepartmentChange = useCallback(
    (department: string) => {
      if (isViewOnly) return;
      handleFormInputChange("department", department);
      handleFormInputChange("province", "");
      setErrors((prev) => ({ ...prev, department: "", province: "" }));
    },
    [handleFormInputChange, isViewOnly]
  );

  // Validación de campos del paso 1
  const validateStep1Fields = (): Partial<Record<keyof FormData, string>> => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name_project.trim())
      newErrors.name_project = "El nombre del proyecto es obligatorio";
    if (!formData.owner_name.trim())
      newErrors.owner_name = "El nombre del propietario es obligatorio";
    if (!formData.owner_lastname.trim())
      newErrors.owner_lastname = "El apellido del propietario es obligatorio";
    if (!formData.country.trim())
      newErrors.country = "El país es obligatorio";
    if (!formData.department.trim())
      newErrors.department = "El departamento es obligatorio";
    if (!formData.province.trim())
      newErrors.province = "La provincia es obligatoria";
    if (!formData.district.trim())
      newErrors.district = "El distrito es obligatorio";
    if (!formData.building_type.trim())
      newErrors.building_type = "El tipo de edificación es obligatorio";
    if (!formData.main_use_type.trim())
      newErrors.main_use_type = "El tipo de uso principal es obligatorio";
    if (formData.number_levels <= 0)
      newErrors.number_levels =
        "El número de niveles debe ser mayor a 0 y no puede ser negativo";
    if (formData.number_homes_per_level <= 0)
      newErrors.number_homes_per_level =
        "El número de viviendas/oficinas debe ser mayor a 0 y no puede ser negativo";
    if (formData.built_surface <= 0)
      newErrors.built_surface =
        "La superficie construida debe ser mayor a 0 y no puede ser negativa";
    return newErrors;
  };

  // Verifica si ya existe un proyecto con el mismo nombre (sin distinguir mayúsculas)
  const checkProjectNameExists = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const { data } = await axios.get(
        `${constantUrlApiEndpoint}/user/projects/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const projects: Project[] = data.projects || [];
      return projects.some(
        (project: Project) =>
          project.name_project.trim().toLowerCase() ===
          formData.name_project.trim().toLowerCase()
      );
    } catch (error) {
      console.error("Error checking project name uniqueness", error);
      return false;
    }
  };

  // Obtención de la ubicación actual mediante geolocalización
  const handleGeolocation = () => {
    if (isViewOnly) return;
    if (!navigator.geolocation) {
      console.error("Geolocalización no soportada.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleFormInputChange("latitude", latitude);
        handleFormInputChange("longitude", longitude);
        console.log(`Lat: ${latitude}, Lon: ${longitude}`);
      },
      () => {
        console.error("No se pudo obtener la ubicación.");
      }
    );
  };

  // Función que unifica la creación y actualización del proyecto
  const enviarProyecto = async () => {
    if (isViewOnly) return;
    setLoading(true);
    setGlobalError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setGlobalError("Por favor inicie sesión.");
        setLoading(false);
        return;
      }
      const requestBody = {
        country: formData.country || "Peru",
        divisions: {
          department: formData.department,
          province: formData.province,
          district: formData.district,
        },
        name_project: formData.name_project,
        owner_name: formData.owner_name,
        owner_lastname: formData.owner_lastname,
        building_type: formData.building_type,
        main_use_type: formData.main_use_type,
        number_levels: formData.number_levels,
        number_homes_per_level: formData.number_homes_per_level,
        built_surface: formData.built_surface,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      console.log("RequestBody:", requestBody);

      if (router.query.id) {
        // Actualización
        const projectIdParam = Array.isArray(router.query.id)
          ? router.query.id[0]
          : router.query.id || localStorage.getItem("project_id");
        const { data } = await axios.put(
          `${constantUrlApiEndpoint}/my-projects/${projectIdParam}/update`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(data.message || "Proyecto actualizado con éxito.");
        toast.success("Proyecto actualizado con éxito.");
      } else {
        // Creación
        const { data } = await axios.post(
          `${constantUrlApiEndpoint}/projects/create`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const { project_id } = data;
        localStorage.setItem("project_id", project_id.toString());
        localStorage.setItem("project_department", formData.department);
        console.log(`Proyecto creado con éxito. ID: ${project_id}`);
        toast.success("Proyecto creado con éxito.");
        // Reiniciamos el formulario y redirigimos
        setFormData(initialFormData);
        router.push(`/project-workflow-part3?project_id=${project_id}`);
      }
    } catch (error: unknown) {
      console.error("Error al enviar el proyecto:", error);
      let errorMessage: string | object = "Error desconocido";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (typeof errorMessage !== "string") {
        errorMessage = JSON.stringify(errorMessage);
      }
      setGlobalError(errorMessage as string);
      toast.error(errorMessage as string);
    }
    setLoading(false);
  };

  // Función para el botón "Continuar" (Paso 1)
  const handleStep1Action = async () => {
    if (isViewOnly) return;
    setSubmitted(true);
    const fieldErrors = validateStep1Fields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    // En modo creación se verifica que el nombre del proyecto sea único
    if (!router.query.id) {
      const nameExists = await checkProjectNameExists();
      if (nameExists) {
        setErrors((prev) => ({
          ...prev,
          name_project: "Este nombre ya existe. Use otro nombre.",
        }));
        return;
      }
    }
    // Si es modo edición se envía la actualización
    if (router.query.id) {
      await enviarProyecto();
    }
    // En modo creación, enviarProyecto redirige automáticamente; en edición se pasa al siguiente step
    // En modo vista, redirigimos a project-workflow-part1 con step=2
    if (isViewOnly) {
      router.push("/project-workflow-part1?mode=view&step=2", undefined, {
        shallow: false,
      });
    } else {
      setStep(2);
    }
  };

  const goToStep2 = () => setStep(2);

  // Función para redirigir a "Agregar detalles de propietario / proyecto y clasificación de edificaciones" en modo vista
  const handleOwnerDetailsRedirect = () => {
    const projectId = router.query.id || localStorage.getItem("project_id");
    if (projectId) {
      router.push(
        `/project-workflow-part1?mode=view&id=${projectId}&step=1`,
        undefined,
        { shallow: false }
      );
    } else {
      toast.error("No se encontró el ID del proyecto.");
    }
  };

  // Función para el botón "Atrás" en el paso 2 en modo vista
  const handleBackToOwnerDetails = () => {
    const projectId = router.query.id || localStorage.getItem("project_id");
    if (projectId) {
      router.push(
        `/project-workflow-part1?mode=view&id=${projectId}&step=1`,
        undefined,
        { shallow: false }
      );
    } else {
      toast.error("No se encontró el ID del proyecto");
    }
  };

  // Render del encabezado principal
  const renderMainHeader = () => {
    if (isViewOnly) {
      return (
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "normal",
            fontFamily: "var(--font-family-base)",
            margin: 0,
            textAlign: "left",
          }}
        >
          Vista de Proyecto
        </h1>
      );
    }
    return (
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "normal",
          fontFamily: "var(--font-family-base)",
          margin: 0,
          textAlign: "left",
        }}
      >
        {router.query.id ? "Edición de Proyecto" : "Proyecto nuevo"}
      </h1>
    );
  };

  return (
    <>
      <GooIcons />
      <Navbar setActiveView={() => {}} />
      <TopBar sidebarWidth={sidebarWidth} />
      <div
        className="container"
        style={{
          maxWidth: "1700px",
          marginTop: "90px",
          marginLeft: "170px",
          marginRight: "50px",
          transition: "margin-left 0.1s ease",
          fontFamily: "var(--font-family-base)",
          fontWeight: "normal",
        }}
      >
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            {renderMainHeader()}
          </div>
        </Card>
        <Card marginTop="15px">
          <div style={{ padding: "0" }}>
            <div className="d-flex" style={{ alignItems: "stretch", gap: 0 }}>
              <div
                style={{
                  width: "380px",
                  padding: "20px",
                  boxSizing: "border-box",
                  borderRight: "1px solid #ccc",
                }}
              >
                <ul className="nav flex-column" style={{ height: "100%" }}>
                  <SidebarItemComponent
                    stepNumber={1}
                    iconName="assignment_ind"
                    title="Agregar detalles de propietario / proyecto y clasificación de edificaciones"
                    activeStep={step}
                    onClickAction={handleOwnerDetailsRedirect}
                  />
                  <SidebarItemComponent
                    stepNumber={2}
                    iconName="location_on"
                    title="Ubicación del proyecto"
                    activeStep={step}
                    onClickAction={() => setStep(2)}
                  />
                  {/* Pasos extras en modo vista */}
                  {isViewOnly && (
                    <>
                      <SidebarItemComponent
                        stepNumber={3}
                        iconName="imagesearch_roller"
                        title="Lista de materiales"
                        activeStep={step}
                        onClickAction={() =>
                          router.push(`/project-workflow-part2?step=3${modeParam}`)
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={4}
                        iconName="home"
                        title="Elementos translúcidos"
                        activeStep={step}
                        onClickAction={() =>
                          router.push(`/project-workflow-part2?step=5${modeParam}`)
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={5}
                        iconName="deck"
                        title="Perfil de uso"
                        activeStep={step}
                        onClickAction={() =>
                          router.push(`/project-workflow-part2?step=6${modeParam}`)
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={6}
                        iconName="build"
                        title="Detalles constructivos"
                        activeStep={step}
                        onClickAction={() =>
                          router.push(`/project-workflow-part3?step=4${modeParam}`)
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={7}
                        iconName="design_services"
                        title="Recinto"
                        activeStep={step}
                        onClickAction={() =>
                          router.push(`/project-workflow-part3?step=7${modeParam}`)
                        }
                      />
                    </>
                  )}
                </ul>
              </div>
              <div style={{ flex: 1, padding: "40px" }}>
                {step === 1 && (
                  <>
                    {/* Paso 1: Datos generales */}
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Nombre del proyecto{" "}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          onChange={(e) =>
                            handleFormInputChange("name_project", e.target.value)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.name_project
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                        {submitted &&
                          errors.name_project === "Este nombre ya existe. Use otro nombre." && (
                            <small className="text-danger">
                              {errors.name_project}
                            </small>
                          )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Nombre del propietario{" "}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) =>
                            handleFormInputChange("owner_name", e.target.value)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.owner_name
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Apellido del propietario{" "}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_lastname}
                          onChange={(e) =>
                            handleFormInputChange("owner_lastname", e.target.value)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.owner_lastname
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          País{" "}
                        </label>
                        <select
                          className="form-control"
                          value={formData.country}
                          onChange={(e) =>
                            handleCountryChange(e.target.value as Country)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.country
                              ? { borderColor: "red" }
                              : undefined
                          }
                        >
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
                        <label className="form-label">
                          Departamento{" "}
                        </label>
                        <select
                          className="form-control"
                          value={formData.department}
                          onChange={(e) =>
                            handleDepartmentChange(e.target.value)
                          }
                          disabled={!formData.country || isViewOnly}
                          style={
                            submitted && errors.department
                              ? { borderColor: "red" }
                              : undefined
                          }
                        >
                          <option value="">Seleccione un departamento</option>
                          {formData.country &&
                            Object.keys(
                              locationData[formData.country]?.departments || {}
                            ).map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Provincia{" "}
                        </label>
                        <select
                          className="form-control"
                          value={formData.province}
                          onChange={(e) =>
                            handleFormInputChange("province", e.target.value)
                          }
                          disabled={!formData.department || isViewOnly}
                          style={
                            submitted && errors.province
                              ? { borderColor: "red" }
                              : undefined
                          }
                        >
                          <option value="">Seleccione una provincia</option>
                          {formData.country &&
                            formData.department &&
                            (locationData[formData.country]?.departments?.[
                              formData.department
                            ] || []).map((prov) => (
                              <option key={prov} value={prov}>
                                {prov}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Distrito{" "}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.district}
                          onChange={(e) =>
                            handleFormInputChange("district", e.target.value)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.district
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Tipo de edificación{" "}
                        </label>
                        <select
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) =>
                            handleFormInputChange("building_type", e.target.value)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.building_type
                              ? { borderColor: "red" }
                              : undefined
                          }
                        >
                          <option value="">
                            Seleccione un tipo de edificación
                          </option>
                          <option value="Unifamiliar">Unifamiliar</option>
                          <option value="Duplex">Duplex</option>
                          <option value="Vertical / Departamentos">
                            Vertical / Departamentos
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Tipo de uso principal{" "}
                        </label>
                        <select
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) =>
                            handleFormInputChange("main_use_type", e.target.value)
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.main_use_type
                              ? { borderColor: "red" }
                              : undefined
                          }
                        >
                          <option value="">Seleccione un tipo de uso</option>
                          <option value="Viviendas">Viviendas</option>
                          <option value="Oficinas">Oficinas</option>
                          <option value="Terciarios">Terciarios</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Número de niveles{" "}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) =>
                            handleFormInputChange(
                              "number_levels",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.number_levels
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Número de viviendas / oficinas x nivel{" "}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          onChange={(e) =>
                            handleFormInputChange(
                              "number_homes_per_level",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.number_homes_per_level
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Superficie construida (m²){" "}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.built_surface}
                          onChange={(e) =>
                            handleFormInputChange(
                              "built_surface",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          disabled={isViewOnly}
                          style={
                            submitted && errors.built_surface
                              ? { borderColor: "red" }
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    {globalError && (
                      <div className="alert alert-danger" role="alert">
                        {globalError}
                      </div>
                    )}
                    {/* En modo vista, el botón "Siguiente" redirige a project-workflow-part1 con step=2 */}
                    {isViewOnly ? (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <CustomButton
                          variant="backIcon"
                          onClick={handleBackToOwnerDetails}
                          style={{ height: "50px" }}
                        >
                          Atrás
                        </CustomButton>
                        <CustomButton
                          variant="forwardIcon"
                          onClick={() =>
                            router.push(
                              "/project-workflow-part1?mode=view&step=2",
                              undefined,
                              { shallow: false }
                            )
                          }
                          style={{ height: "50px" }}
                        >
                          Siguiente
                        </CustomButton>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>
                          {submitted && Object.keys(errors).length > 0 && (
                            <small style={{ color: "red", textAlign: "left" }}>
                              (*) Campos obligatorios
                            </small>
                          )}
                        </div>
                        {router.query.id ? (
                          <div style={{ display: "flex", gap: "10px" }}>
                            <CustomButton
                              variant="save"
                              onClick={handleStep1Action}
                              style={{ height: "50px" }}
                            >
                              <span
                                className="material-icons"
                                style={{ marginRight: "5px" }}
                              >
                                save_as
                              </span>
                              Actualizar Datos
                            </CustomButton>
                            <CustomButton
                              variant="forwardIcon"
                              onClick={goToStep2}
                              style={{ marginLeft: "10px", height: "50px" }}
                            >
                              Siguiente
                            </CustomButton>
                          </div>
                        ) : (
                          <div>
                            <CustomButton
                              variant="save"
                              onClick={handleStep1Action}
                              style={{ height: "50px" }}
                              disabled={loading}
                            >
                              Continuar
                            </CustomButton>
                          </div>
                        )}
                      </div>
                    )}
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
                              disabled={isViewOnly}
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
                          <div
                            style={{
                              pointerEvents: isViewOnly ? "none" : "auto",
                            }}
                          >
                            <NoSSRInteractiveMap
                              onLocationSelect={(latlng) => {
                                if (!isViewOnly) {
                                  handleFormInputChange("latitude", latlng.lat);
                                  handleFormInputChange("longitude", latlng.lng);
                                }
                              }}
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
                              marginLeft: "-80px",
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
                              width: "90%",
                              height: "100px",
                              marginLeft: "-80px",
                              marginTop: "0px",
                            }}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="d-flex">
                          <CustomButton
                            variant="backIcon"
                            onClick={handleBackToOwnerDetails}
                            style={{ height: "50px" }}
                          >
                            Atrás
                          </CustomButton>
                          {!isViewOnly && (
                            <CustomButton
                              variant="save"
                              onClick={handleGeolocation}
                              style={{
                                marginLeft: "10px",
                                height: "50px",
                                width: "200px",
                              }}
                            >
                              <span
                                className="material-icons"
                                style={{ marginRight: "5px" }}
                              >
                                location_on
                              </span>
                              Ubicación actual
                            </CustomButton>
                          )}
                        </div>
                        <div className="d-flex">
                          {isViewOnly ? (
                            <CustomButton
                              variant="forwardIcon"
                              onClick={() =>
                                router.push(
                                  `/project-workflow-part2?project_id=${
                                    router.query.id || localStorage.getItem("project_id")
                                  }&mode=view`
                                )
                              }
                              style={{ height: "50px" }}
                            >
                              Siguiente
                            </CustomButton>
                          ) : router.query.id ? (
                            <>
                              <CustomButton
                                variant="save"
                                onClick={enviarProyecto}
                                style={{ height: "50px" }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ marginRight: "5px" }}
                                >
                                  save_as
                                </span>
                                Actualizar Datos
                              </CustomButton>
                              <CustomButton
                                variant="forwardIcon"
                                onClick={() => {
                                  const projectId = Array.isArray(router.query.id)
                                    ? router.query.id[0]
                                    : router.query.id;
                                  if (projectId) {
                                    localStorage.setItem("project_id", projectId);
                                    router.push(`/project-workflow-part3?project_id=${projectId}&mode=edit`);
                                  } else {
                                    console.error("project_id is undefined");
                                  }
                                }}
                                style={{ marginLeft: "10px", height: "50px" }}
                              >
                                Siguiente
                              </CustomButton>
                            </>
                          ) : (
                            <CustomButton
                              variant="save"
                              onClick={enviarProyecto}
                              style={{ height: "50px" }}
                              disabled={loading}
                            >
                              <span
                                className="material-icons"
                                style={{ marginRight: "5px" }}
                              >
                                sd_card
                              </span>
                              Grabar Datos
                            </CustomButton>
                          )}
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
      {/* Único ToastContainer en la aplicación */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
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
