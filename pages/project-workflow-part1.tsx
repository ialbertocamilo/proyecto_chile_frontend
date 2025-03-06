import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from 'react-toastify';
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

const ProjectWorkflowPart1: React.FC = () => {
  useAuth();
  const router = useRouter();
  const mode = router.query.mode as string;
  const isViewMode = mode === "view";

  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const sidebarWidth = "300px";
  const [step, setStep] = useState<number>(1);
  const [, setCreatedProjectId] = useState<number | null>(null);
  const [locationSearch, setLocationSearch] = useState("");

  const [formData, setFormData] = useState<FormData>({
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
  });

  const [, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    const pColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim() || "#3ca7b7";
    setPrimaryColor(pColor);
  }, []);

  useEffect(() => {
    if (router.isReady && isViewMode) {
      const stepQuery = router.query.step;
      if (stepQuery) {
        const stepNumber = parseInt(stepQuery as string, 10);
        if (!isNaN(stepNumber)) {
          setStep(stepNumber);
        }
      }
    }
  }, [router.isReady, router.query.step, isViewMode]);

  useEffect(() => {
    let projectIdParam = router.query.id;
    if (!projectIdParam) {
      projectIdParam = localStorage.getItem("project_id") ?? undefined;
    }
    
    if (projectIdParam) {
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
          toast.error("No se pudieron cargar los datos del proyecto.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      };
      fetchProjectData();
    }
  }, [router.query.id, primaryColor]);

  const handleFormInputChange = (
    field: keyof FormData,
    value: string | number
  ) => {
    if (isViewMode) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (value !== "" && value !== 0) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCountryChange = (country: Country) => {
    if (isViewMode) return;
    handleFormInputChange("country", country);
    handleFormInputChange("department", "");
    handleFormInputChange("province", "");
    setErrors((prev) => ({
      ...prev,
      country: "",
      department: "",
      province: "",
    }));
  };

  const handleDepartmentChange = (department: string) => {
    if (isViewMode) return;
    handleFormInputChange("department", department);
    handleFormInputChange("province", "");
    setErrors((prev) => ({ ...prev, department: "", province: "" }));
  };

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
      newErrors.number_levels = "El número de niveles debe ser mayor a 0";
    if (formData.number_homes_per_level <= 0)
      newErrors.number_homes_per_level =
        "El número de viviendas/oficinas debe ser mayor a 0";
    if (formData.built_surface <= 0)
      newErrors.built_surface =
        "La superficie construida debe ser mayor a 0";
    return newErrors;
  };

  const handleGeolocation = () => {
    if (isViewMode) return;
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleFormInputChange("latitude", latitude);
        handleFormInputChange("longitude", longitude);
        toast.success(`Lat: ${latitude}, Lon: ${longitude}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      },
      () => {
        toast.error("No se pudo obtener la ubicación.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    );
  };

  const handleStep1Action = async () => {
    if (isViewMode) return;
    const fieldErrors = validateStep1Fields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.warning("Por favor complete todos los campos obligatorios.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    if (router.query.id) {
      await handleUpdateProject();
    }
    goToStep2();
  };

  const goToStep2 = () => setStep(2);

  const handleCreateProject = async () => {
    if (isViewMode) return;
    const fieldErrors = validateStep1Fields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.warning("Por favor complete todos los campos obligatorios.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Por favor inicie sesión.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
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

      console.log("RequestBody (creación):", requestBody);

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

      const { project_id, message } = data;
      setCreatedProjectId(project_id);
      localStorage.setItem("project_id", project_id.toString());
      localStorage.setItem("project_department", formData.department);

      toast.success(`ID: ${project_id} / Mensaje: ${message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      router.push(`/project-workflow-part2?project_id=${project_id}`);
    } catch (error: unknown) {
      console.error("Error en handleCreateProject:", error);
      let errorMessage: string | object = "Error desconocido";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (typeof errorMessage !== "string") {
        errorMessage = JSON.stringify(errorMessage);
      }
      toast.error(errorMessage as string, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleUpdateProject = async () => {
    if (isViewMode) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Por favor inicie sesión.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
      const projectIdParam = Array.isArray(router.query.id)
        ? router.query.id[0]
        : router.query.id || localStorage.getItem("project_id");
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

      console.log("RequestBody (actualización):", requestBody);

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

      toast.success(data.message || "Proyecto actualizado correctamente.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error: unknown) {
      console.error("Error en handleUpdateProject:", error);
      let errorMessage: string | object = "Error desconocido";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (typeof errorMessage !== "string") {
        errorMessage = JSON.stringify(errorMessage);
      }
      toast.error(errorMessage as string, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const renderMainHeader = () => {
    if (isViewMode) {
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
                    onClickAction={() => setStep(1)}
                  />
                  <SidebarItemComponent
                    stepNumber={2}
                    iconName="location_on"
                    title="Ubicación del proyecto"
                    activeStep={step}
                    onClickAction={() => setStep(2)}
                  />
                  {isViewMode && (
                    <>
                      <SidebarItemComponent
                        stepNumber={3}
                        iconName="imagesearch_roller"
                        title="Lista de materiales"
                        activeStep={step}
                        onClickAction={() =>
                          router.push("/project-workflow-part2?mode=view&step=3")
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={4}
                        iconName="home"
                        title="Elementos translúcidos"
                        activeStep={step}
                        onClickAction={() =>
                          router.push("/project-workflow-part2?mode=view&step=5")
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={5}
                        iconName="deck"
                        title="Perfil de uso"
                        activeStep={step}
                        onClickAction={() =>
                          router.push("/project-workflow-part2?mode=view&step=6")
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={6}
                        iconName="build"
                        title="Detalles constructivos"
                        activeStep={step}
                        onClickAction={() =>
                          router.push("/project-workflow-part3?mode=view&step=4")
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={7}
                        iconName="design_services"
                        title="Recinto"
                        activeStep={step}
                        onClickAction={() =>
                          router.push("/project-workflow-part3?mode=view&step=7")
                        }
                      />
                    </>
                  )}
                </ul>
              </div>
              <div style={{ flex: 1, padding: "40px" }}>
                {step === 1 && (
                  <>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del proyecto</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          onChange={(e) =>
                            handleFormInputChange("name_project", e.target.value)
                          }
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) =>
                            handleFormInputChange("owner_name", e.target.value)
                          }
                          disabled={isViewMode}
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
                          onChange={(e) =>
                            handleFormInputChange("owner_lastname", e.target.value)
                          }
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
                        <select
                          className="form-control"
                          value={formData.country}
                          onChange={(e) =>
                            handleCountryChange(e.target.value as Country)
                          }
                          disabled={isViewMode}
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
                        <label className="form-label">Departamento</label>
                        <select
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => handleDepartmentChange(e.target.value)}
                          disabled={!formData.country || isViewMode}
                        >
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
                        <select
                          className="form-control"
                          value={formData.province}
                          onChange={(e) =>
                            handleFormInputChange("province", e.target.value)
                          }
                          disabled={!formData.department || isViewMode}
                        >
                          <option value="">Seleccione una provincia</option>
                          {formData.country &&
                            formData.department &&
                            (locationData[formData.country]?.departments?.[formData.department] ||
                              []).map((prov) => (
                                <option key={prov} value={prov}>
                                  {prov}
                                </option>
                              ))}
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
                          onChange={(e) =>
                            handleFormInputChange("district", e.target.value)
                          }
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de edificación</label>
                        <select
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) =>
                            handleFormInputChange("building_type", e.target.value)
                          }
                          disabled={isViewMode}
                        >
                          <option value="">Seleccione un tipo de edificación</option>
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
                        <label className="form-label">Tipo de uso principal</label>
                        <select
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) =>
                            handleFormInputChange("main_use_type", e.target.value)
                          }
                          disabled={isViewMode}
                        >
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
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) =>
                            handleFormInputChange(
                              "number_levels",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Número de viviendas / oficinas x nivel
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          onChange={(e) =>
                            handleFormInputChange(
                              "number_homes_per_level",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Superficie construida (m²)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.built_surface}
                          onChange={(e) =>
                            handleFormInputChange(
                              "built_surface",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    {isViewMode ? (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <CustomButton
                          variant="backIcon"
                          onClick={() => router.back()}
                          style={{ height: "50px" }}
                        >
                          Atrás
                        </CustomButton>
                        <CustomButton
                          variant="forwardIcon"
                          onClick={goToStep2}
                          style={{ height: "50px" }}
                        >
                          Siguiente
                        </CustomButton>
                      </div>
                    ) : router.query.id ? (
                      <div className="d-flex justify-content-end align-items-center mt-4" style={{ gap: "10px" }}>
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
                        <CustomButton
                          variant="forwardIcon"
                          onClick={goToStep2}
                          style={{ marginLeft: "10px", height: "50px" }}
                        >
                          Siguiente
                        </CustomButton>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-end align-items-center mt-4">
                       <CustomButton
                          variant="save"
                          onClick={handleStep1Action} 
                          style={{ height: "50px" }}
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
                              disabled={isViewMode}
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
                          <div style={{ pointerEvents: isViewMode ? "none" : "auto" }}>
                            <NoSSRInteractiveMap
                              onLocationSelect={(latlng) => {
                                if (!isViewMode) {
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
                            onClick={() => setStep(1)}
                            style={{ height: "50px" }}
                          >
                            Atrás
                          </CustomButton>
                          {!isViewMode && (
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
                          )}
                        </div>
                        <div className="d-flex">
                          {isViewMode ? (
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
                                onClick={handleUpdateProject}
                                style={{ height: "50px" }}
                              >
                                <span className="material-icons" style={{ marginRight: "5px" }}>
                                  save_as
                                </span>
                                Actualizar Datos
                              </CustomButton>
                              <CustomButton
                                variant="forwardIcon"
                                onClick={() =>
                                  router.push(
                                    `/project-workflow-part2?project_id=${
                                      router.query.id || localStorage.getItem("project_id")
                                    }`
                                  )
                                }
                                style={{ marginLeft: "10px", height: "50px" }}
                              >
                                Siguiente
                              </CustomButton>
                            </>
                          ) : (
                            <CustomButton
                              variant="save"
                              onClick={handleCreateProject}
                              style={{ height: "50px" }}
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