import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";
import GooIcons from "../public/GoogleIcons";
import locationData from "../public/locationData"; // Importamos la información de ubicación

// Componente para el Sidebar interno, ahora recibiendo el estado y la función setStep desde el padre
interface SidebarItemProps {
  stepNumber: number;
  iconName: string;
  title: string;
  currentStep: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  primaryColor: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  stepNumber,
  iconName,
  title,
  currentStep,
  setStep,
  primaryColor,
}) => {
  const isSelected = currentStep === stepNumber;
  const activeColor = primaryColor;
  const inactiveColor = "#ccc";

  return (
    <li
      className="nav-item"
      style={{ cursor: "pointer" }}
      onClick={() => setStep(stepNumber)}
    >
      <div
        style={{
          width: "100%",
          height: "100px",
          border: `1px solid ${isSelected ? activeColor : inactiveColor}`,
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: "50px",
          color: isSelected ? activeColor : inactiveColor,
          fontFamily: "var(--font-family-base)",
          fontWeight: "normal",
        }}
      >
        <span style={{ marginRight: "15px", fontSize: "2.5rem", lineHeight: "1" }}>
          <span className="material-icons" style={{ fontSize: "inherit" }}>
            {iconName}
          </span>
        </span>
        <span style={{ fontWeight: "normal", whiteSpace: "normal", width: "180px" }}>
          {title}
        </span>
      </div>
    </li>
  );
};

const NoSSRInteractiveMap = dynamic(
  () => import("../src/components/InteractiveMap"),
  { ssr: false }
);

// Definimos que solo se permite "" | "Perú" | "Chile" en country
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

  // Leer color primario desde CSS
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  useEffect(() => {
    const pColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim() || "#3ca7b7";
    setPrimaryColor(pColor);
  }, []);

  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const [step, setStep] = useState<number>(1);
  const [, setCreatedProjectId] = useState<number | null>(null);

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

  // Objeto para almacenar mensajes de error
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [locationSearch, setLocationSearch] = useState("");

  // Actualiza un campo del formulario y remueve el error si el campo ya tiene valor
  const handleFormInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (value !== "" && value !== 0) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    }
  };

  // Al cambiar país, reiniciamos departamento y provincia y borramos los errores asociados
  const handleCountryChange = (country: Country) => {
    handleFormInputChange("country", country);
    handleFormInputChange("department", "");
    handleFormInputChange("province", "");
    setErrors((prev) => ({ ...prev, country: "", department: "", province: "" }));
  };

  // Al cambiar departamento, reiniciamos provincia y borramos error de provincia
  const handleDepartmentChange = (department: string) => {
    handleFormInputChange("department", department);
    handleFormInputChange("province", "");
    setErrors((prev) => ({ ...prev, department: "", province: "" }));
  };

  // Función que valida cada campo y retorna un objeto de errores
  const validateStep1Fields = (): Partial<Record<keyof FormData, string>> => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name_project.trim()) {
      newErrors.name_project = "El nombre del proyecto es obligatorio";
    }
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = "El nombre del propietario es obligatorio";
    }
    if (!formData.owner_lastname.trim()) {
      newErrors.owner_lastname = "El apellido del propietario es obligatorio";
    }
    if (!formData.country.trim()) {
      newErrors.country = "El país es obligatorio";
    }
    if (!formData.department.trim()) {
      newErrors.department = "El departamento es obligatorio";
    }
    if (!formData.province.trim()) {
      newErrors.province = "La provincia es obligatoria";
    }
    if (!formData.district.trim()) {
      newErrors.district = "El distrito es obligatorio";
    }
    if (!formData.building_type.trim()) {
      newErrors.building_type = "El tipo de edificación es obligatorio";
    }
    if (!formData.main_use_type.trim()) {
      newErrors.main_use_type = "El tipo de uso principal es obligatorio";
    }
    if (formData.number_levels <= 0) {
      newErrors.number_levels = "El número de niveles debe ser mayor a 0";
    }
    if (formData.number_homes_per_level <= 0) {
      newErrors.number_homes_per_level = "El número de viviendas/oficinas debe ser mayor a 0";
    }
    if (formData.built_surface <= 0) {
      newErrors.built_surface = "La superficie construida debe ser mayor a 0";
    }
    return newErrors;
  };

  const handleStep1Submit = () => {
    const fieldErrors = validateStep1Fields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor complete todos los campos obligatorios.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: primaryColor,
      });
      return;
    }
    setStep(2);
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Token no encontrado",
          text: "Por favor inicie sesión.",
          icon: "warning",
          confirmButtonText: "Entendido",
          confirmButtonColor: primaryColor,
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

      console.log("RequestBody:", requestBody);

      const url = `${constantUrlApiEndpoint}/projects/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(url, requestBody, { headers });
      const { project_id, message } = response.data;
      setCreatedProjectId(project_id);

      localStorage.setItem("project_id", project_id.toString());
      localStorage.setItem("project_department", formData.department);

      Swal.fire({
        title: "Proyecto creado",
        text: `ID: ${project_id} / Mensaje: ${message}`,
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: primaryColor,
      }).then(() => {
        router.push(`/project-workflow-part2?project_id=${project_id}`);
      });
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

      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("El Nombre del Proyecto") &&
        errorMessage.includes("ya existe")
      ) {
        setStep(1);
        Swal.fire({
          title: "Ooops...",
          text: "El nombre del proyecto ya existe. Por favor corrija el campo 'Nombre del proyecto'.",
          icon: "error",
          confirmButtonText: "Entendido",
          confirmButtonColor: primaryColor,
        });
        return;
      }

      setStep(1);
      Swal.fire({
        title: "Algo salió mal",
        text: "Falta completar algún campo o hay un error en la información. Por favor revise y complete los campos correctamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: primaryColor,
      });
    }
  };

  const renderMainHeader = () =>
    step <= 2 ? (
      <div className="mb-3">
        <h1
          style={{
            fontSize: "40px",
            fontWeight: "normal",
            fontFamily: "var(--font-family-base)",
            marginTop: "120px",
          }}
        >
          Proyecto nuevo
        </h1>
      </div>
    ) : null;

  return (
    <>
      <GooIcons />
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <TopBar sidebarWidth={sidebarWidth} />
      <div
        className="container"
        style={{
          maxWidth: "1700px",
          marginTop: "90px",
          marginLeft: `calc(${sidebarWidth} + 70px)`,
          marginRight: "50px",
          transition: "margin-left 0.1s ease",
          fontFamily: "var(--font-family-base)",
          fontWeight: "normal",
        }}
      >
        {renderMainHeader()}
        <div className="card shadow w-100" style={{ overflow: "hidden" }}>
          <div className="card-body p-0">
            <div className="d-flex" style={{ alignItems: "stretch", gap: 0 }}>
              <div
                style={{
                  width: "380px",
                  padding: "40px",
                  boxSizing: "border-box",
                }}
              >
                <ul className="nav flex-column" style={{ height: "100%" }}>
                  <SidebarItem
                    stepNumber={1}
                    iconName="assignment_ind"
                    title="Agregar detalles de propietario / proyecto y clasificación de edificaciones"
                    currentStep={step}
                    setStep={setStep}
                    primaryColor={primaryColor}
                  />
                  <SidebarItem
                    stepNumber={2}
                    iconName="location_on"
                    title="Ubicación del proyecto"
                    currentStep={step}
                    setStep={setStep}
                    primaryColor={primaryColor}
                  />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "40px" }}>
                {step === 1 && (
                  <>
                    {/* Paso 1 */}
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
                        />
                        {errors.name_project && (
                          <div className="text-danger mt-1">
                            {errors.name_project}
                          </div>
                        )}
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
                        />
                        {errors.owner_name && (
                          <div className="text-danger mt-1">
                            {errors.owner_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Apellido del propietario
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_lastname}
                          onChange={(e) =>
                            handleFormInputChange("owner_lastname", e.target.value)
                          }
                        />
                        {errors.owner_lastname && (
                          <div className="text-danger mt-1">
                            {errors.owner_lastname}
                          </div>
                        )}
                      </div>
                      {/* Desplegable para País */}
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
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
                        {errors.country && (
                          <div className="text-danger mt-1">{errors.country}</div>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      {/* Desplegable para Departamento */}
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento</label>
                        <select
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => handleDepartmentChange(e.target.value)}
                          disabled={!formData.country}
                        >
                          <option value="">Seleccione un departamento</option>
                          {formData.country &&
                            Object.keys(locationData[formData.country].departments)
                              .map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                        </select>
                        {errors.department && (
                          <div className="text-danger mt-1">
                            {errors.department}
                          </div>
                        )}
                      </div>
                      {/* Desplegable para Provincia */}
                      <div className="col-12 col-md-6">
                        <label className="form-label">Provincia</label>
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
                            (locationData[formData.country].departments[
                              formData.department
                            ] || []).map((prov) => (
                              <option key={prov} value={prov}>
                                {prov}
                              </option>
                            ))}
                        </select>
                        {errors.province && (
                          <div className="text-danger mt-1">
                            {errors.province}
                          </div>
                        )}
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
                        />
                        {errors.district && (
                          <div className="text-danger mt-1">
                            {errors.district}
                          </div>
                        )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Tipo de edificación
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) =>
                            handleFormInputChange("building_type", e.target.value)
                          }
                        />
                        {errors.building_type && (
                          <div className="text-danger mt-1">
                            {errors.building_type}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Tipo de uso principal
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) =>
                            handleFormInputChange("main_use_type", e.target.value)
                          }
                        />
                        {errors.main_use_type && (
                          <div className="text-danger mt-1">
                            {errors.main_use_type}
                          </div>
                        )}
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
                        />
                        {errors.number_levels && (
                          <div className="text-danger mt-1">
                            {errors.number_levels}
                          </div>
                        )}
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
                        />
                        {errors.number_homes_per_level && (
                          <div className="text-danger mt-1">
                            {errors.number_homes_per_level}
                          </div>
                        )}
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
                        />
                        {errors.built_surface && (
                          <div className="text-danger mt-1">
                            {errors.built_surface}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <CustomButton variant="save" onClick={handleStep1Submit}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>
                          sd_card
                        </span>
                        Grabar Datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* Paso 2 */}
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
                          <CustomButton
                            variant="save"
                            style={{
                              width: "30%",
                              height: "50px",
                              marginTop: "30px",
                              fontSize: "15px",
                              padding: "10px 20px",
                            }}
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    const { latitude, longitude } = position.coords;
                                    handleFormInputChange("latitude", latitude);
                                    handleFormInputChange("longitude", longitude);
                                    Swal.fire({
                                      title: "Ubicación obtenida",
                                      text: `Lat: ${latitude}, Lon: ${longitude}`,
                                      icon: "success",
                                      confirmButtonText: "OK",
                                      confirmButtonColor: primaryColor,
                                    });
                                  },
                                  () => {
                                    Swal.fire({
                                      title: "Error",
                                      text: "No se pudo obtener la ubicación.",
                                      icon: "error",
                                      confirmButtonText: "Entendido",
                                      confirmButtonColor: primaryColor,
                                    });
                                  }
                                );
                              } else {
                                Swal.fire({
                                  title: "Error",
                                  text: "Geolocalización no soportada.",
                                  icon: "error",
                                  confirmButtonText: "Entendido",
                                  confirmButtonColor: primaryColor,
                                });
                              }
                            }}
                          >
                            <span className="material-icons" style={{ marginRight: "5px" }}>
                              location_on
                            </span>
                            Ubicación actual
                          </CustomButton>
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
                      <div className="mt-4 text-end">
                        <CustomButton variant="save" onClick={handleCreateProject}>
                          <span className="material-icons" style={{ marginRight: "5px" }}>
                            sd_card
                          </span>
                          Grabar Datos
                        </CustomButton>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: 1px solid #ccc;
        }
        .container {
          font-family: var(--font-family-base);
          font-weight: normal;
        }
      `}</style>
    </>
  );
};

export default ProjectWorkflowPart1;
