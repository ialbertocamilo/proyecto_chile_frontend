import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/router";
import CustomButton from "../src/components/common/CustomButton";
import Card from "../src/components/common/Card";
import GooIcons from "../public/GoogleIcons";
import locationData from "../public/locationData";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import SidebarItemComponent from "../src/components/common/SidebarItemComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "../src/components/Title";
import { useApi } from "@/hooks/useApi";

// Cargamos el mapa sin SSR aa
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

interface Project {
  name_project: string;
  // Puedes agregar más propiedades según tu modelo
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
  const mode = (router.query.mode as string) || (router.query.id ? "edit" : "create");

  const [, setPrimaryColor] = useState("#3ca7b7");
  const sidebarWidth = "300px";
  const [step, setStep] = useState<number>(1);
  const [locationSearch, setLocationSearch] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");

  useEffect(() => {
    const pColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim() || "#3ca7b7";
    setPrimaryColor(pColor);
  }, []);

  // Actualiza el step si se pasa en la query
  useEffect(() => {
    if (router.query.step) {
      const queryStep = parseInt(router.query.step as string, 10);
      if (!isNaN(queryStep)) {
        setStep(queryStep);
      }
    }
  }, [router.query.step]);

  // Carga datos del proyecto si se está editando
  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.id || mode === "create") {
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
  }, [router.isReady, router.query.id, mode]);

  const handleFormInputChange = useCallback(
    (field: keyof FormData, value: string | number) => {
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
      if (submitted && value !== "" && value !== 0) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [submitted]
  );

  const handleCountryChange = useCallback(
    (country: Country) => {
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
    [handleFormInputChange]
  );

  const handleDepartmentChange = useCallback(
    (department: string) => {
      handleFormInputChange("department", department);
      handleFormInputChange("province", "");
      setErrors((prev) => ({ ...prev, department: "", province: "" }));
    },
    [handleFormInputChange]
  );

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

  const {get,post,del } =useApi()
  const checkProjectNameExists = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await get(`/user/projects/`);
      const projects: Project[] = (response as { data: { projects: Project[] } }).data.projects || [];
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

  const handleGeolocation = () => {
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

  const enviarProyecto = async () => {
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
        country: formData.country || "Perú",
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

  const handleStep1Action = async () => {
    setSubmitted(true);
    const fieldErrors = validateStep1Fields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
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
    if (router.query.id) {
      await enviarProyecto();
    }
    if (!router.query.id) {
      setStep(2);
    }
  };

  const renderMainHeader = () => {
    return (
      <Title text={router.query.id ? "Edición de Proyecto" : "Proyecto nuevo"} />
    );
  };
  

  return (
    <>
      <GooIcons />
      <div
        className="container"
        style={{
          maxWidth: "1700px",
          marginTop: "90px",
          marginLeft: "110px",
          marginRight: "50px",
          transition: "margin-left 0.1s ease",
          fontFamily: "var(--font-family-base)",
          fontWeight: "normal",
        }}
      >
          <div>{renderMainHeader()}</div>
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
                    onClickAction={() => setStep(1)}
                  />
                  <SidebarItemComponent
                    stepNumber={2}
                    iconName="location_on"
                    title="Ubicación del proyecto"
                    activeStep={step}
                    onClickAction={() => setStep(2)}
                  />
                  <SidebarItemComponent
                    stepNumber={3}
                    iconName="build"
                    title="Detalles constructivos"
                    activeStep={step}
                    onClickAction={() =>
                      router.push(`/workflow-part2-edit?id=${router.query.id}&step=4`)
                    }
                  />
                  <SidebarItemComponent
                    stepNumber={4}
                    iconName="design_services"
                    title="Recinto"
                    activeStep={step}
                    onClickAction={() =>
                      router.push(`/workflow-part2-edit?id=${router.query.id}&step=7`)
                    }
                  />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "40px" }}>
                {step === 1 && (
                  <>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Nombre del proyecto{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          onChange={(e) =>
                            handleFormInputChange("name_project", e.target.value)
                          }
                          style={
                            submitted && errors.name_project ? { borderColor: "red" } : undefined
                          }
                        />
                        {submitted && errors.name_project && (
                          <small className="text-danger">{errors.name_project}</small>
                        )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Nombre del propietario{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) =>
                            handleFormInputChange("owner_name", e.target.value)
                          }
                        />
                        {router.query.id &&
                          submitted &&
                          errors.owner_name && (
                            <small className="text-danger">{errors.owner_name}</small>
                          )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Apellido del propietario{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_lastname}
                          onChange={(e) =>
                            handleFormInputChange("owner_lastname", e.target.value)
                          }
                        />
                        {router.query.id &&
                          submitted &&
                          errors.owner_lastname && (
                            <small className="text-danger">{errors.owner_lastname}</small>
                          )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          País{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <select
                          className="form-control"
                          value={formData.country}
                          onChange={(e) =>
                            handleCountryChange(e.target.value as Country)
                          }
                        >
                          <option value="">Seleccione un país</option>
                          {Object.keys(locationData).map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        {router.query.id &&
                          submitted &&
                          errors.country && (
                            <small className="text-danger">{errors.country}</small>
                          )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Departamento{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <select
                          className="form-control"
                          value={formData.department}
                          onChange={(e) =>
                            handleDepartmentChange(e.target.value)
                          }
                          disabled={!formData.country}
                        >
                          <option value="">Seleccione un departamento</option>
                          {formData.country &&
                            Object.keys(locationData[formData.country]?.departments || {}).map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                        </select>
                        {router.query.id &&
                          submitted &&
                          errors.department && (
                            <small className="text-danger">{errors.department}</small>
                          )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Provincia{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <select
                          className="form-control"
                          value={formData.province}
                          onChange={(e) =>
                            handleFormInputChange("province", e.target.value)
                          }
                          disabled={!formData.department}
                        >
                          <option value="">Seleccione una provincia</option>
                          {formData.country &&
                            formData.department &&
                            (locationData[formData.country]?.departments?.[formData.department] || []).map((prov) => (
                              <option key={prov} value={prov}>
                                {prov}
                              </option>
                            ))}
                        </select>
                        {router.query.id &&
                          submitted &&
                          errors.province && (
                            <small className="text-danger">{errors.province}</small>
                          )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Distrito{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.district}
                          onChange={(e) =>
                            handleFormInputChange("district", e.target.value)
                          }
                        />
                        {router.query.id &&
                          submitted &&
                          errors.district && (
                            <small className="text-danger">{errors.district}</small>
                          )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Tipo de edificación{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <select
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) =>
                            handleFormInputChange("building_type", e.target.value)
                          }
                        >
                          <option value="">Seleccione un tipo de edificación</option>
                          <option value="Unifamiliar">Unifamiliar</option>
                          <option value="Duplex">Duplex</option>
                          <option value="Vertical / Departamentos">Vertical / Departamentos</option>
                        </select>
                        {router.query.id &&
                          submitted &&
                          errors.building_type && (
                            <small className="text-danger">{errors.building_type}</small>
                          )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Tipo de uso principal{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <select
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) =>
                            handleFormInputChange("main_use_type", e.target.value)
                          }
                        >
                          <option value="">Seleccione un tipo de uso</option>
                          <option value="Viviendas">Viviendas</option>
                          <option value="Oficinas">Oficinas</option>
                          <option value="Terciarios">Terciarios</option>
                        </select>
                        {router.query.id &&
                          submitted &&
                          errors.main_use_type && (
                            <small className="text-danger">{errors.main_use_type}</small>
                          )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Número de niveles{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) =>
                            handleFormInputChange("number_levels", parseInt(e.target.value) || 0)
                          }
                        />
                        {router.query.id &&
                          submitted &&
                          errors.number_levels && (
                            <small className="text-danger">{errors.number_levels}</small>
                          )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Número de viviendas / oficinas x nivel{" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          onChange={(e) =>
                            handleFormInputChange("number_homes_per_level", parseInt(e.target.value) || 0)
                          }
                        />
                        {router.query.id &&
                          submitted &&
                          errors.number_homes_per_level && (
                            <small className="text-danger">{errors.number_homes_per_level}</small>
                          )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Superficie construida (m²){" "}
                          {!router.query.id && <span style={{ color: "red" }}>*</span>}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.built_surface}
                          onChange={(e) =>
                            handleFormInputChange("built_surface", parseFloat(e.target.value) || 0)
                          }
                        />
                        {router.query.id &&
                          submitted &&
                          errors.built_surface && (
                            <small className="text-danger">{errors.built_surface}</small>
                          )}
                      </div>
                    </div>
                    {globalError && (
                      <div className="alert alert-danger" role="alert">
                        {globalError}
                      </div>
                    )}
                    {router.query.id ? (
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <CustomButton
                          variant="save"
                          onClick={handleStep1Action}
                          style={{ height: "50px" }}
                        >
                          <span className="material-icons" style={{ marginRight: "5px" }}>
                            save_as
                          </span>
                          Actualizar Datos
                        </CustomButton>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>
                          <small>(*) Campos Obligatorios</small>
                        </div>
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
                  </>
                )}

                {step === 2 && (
                  <>
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
                          <NoSSRInteractiveMap
                            onLocationSelect={(latlng) => {
                              handleFormInputChange("latitude", latlng.lat);
                              handleFormInputChange("longitude", latlng.lng);
                            }}
                            initialLat={formData.latitude}
                            initialLng={formData.longitude}
                          />
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
                            variant="save"
                            onClick={handleGeolocation}
                            style={{ marginLeft: "10px", height: "50px", width: "200px" }}
                          >
                            <span className="material-icons" style={{ marginRight: "5px" }}>
                              location_on
                            </span>
                            Ubicación actual
                          </CustomButton>
                        </div>
                        <div className="d-flex">
                          {router.query.id ? (
                            <>
                              <CustomButton
                                variant="save"
                                onClick={enviarProyecto}
                                style={{ height: "50px" }}
                              >
                                <span className="material-icons" style={{ marginRight: "5px" }}>
                                  save_as
                                </span>
                                Actualizar Datos
                              </CustomButton>
                            </>
                          ) : (
                            <CustomButton
                              variant="save"
                              onClick={enviarProyecto}
                              style={{ height: "50px" }}
                              disabled={loading}
                            >
                              <span className="material-icons" style={{ marginRight: "5px" }}>
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
