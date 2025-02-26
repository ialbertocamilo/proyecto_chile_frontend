import React, { useState } from "react";
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

const NoSSRInteractiveMap = dynamic(() => import("../src/components/InteractiveMap"), { ssr: false });

interface FormData {
  name_project: string;
  owner_name: string;
  owner_lastname: string;
  country: string;
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
  const [locationSearch, setLocationSearch] = useState("");

  const handleFormInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = (): boolean => {
    if (
      !formData.name_project.trim() ||
      !formData.owner_name.trim() ||
      !formData.owner_lastname.trim() ||
      !formData.country.trim() ||
      !formData.department.trim() ||
      !formData.province.trim() ||
      !formData.district.trim() ||
      !formData.building_type.trim() ||
      !formData.main_use_type.trim() ||
      formData.number_levels <= 0 ||
      formData.number_homes_per_level <= 0 ||
      formData.built_surface <= 0
    ) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor complete todos los campos obligatorios.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    return true;
  };

  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2);
    }
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
          confirmButtonColor: "#3085d6",
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
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
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
        confirmButtonColor: "#3085d6",
      }).then(() => {
        router.push(`/project-workflow-part2?project_id=${project_id}`);
      });
    } catch (error: unknown) {
      console.error("Error en handleCreateProject:", error);
      let errorMessage: string | object = "Error desconocido";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
        console.error("Error response data:", error.response?.data);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (typeof errorMessage !== "string") {
        errorMessage = JSON.stringify(errorMessage);
      }

      // Si el error es por nombre duplicado, regresa al paso 1 y muestra un mensaje amigable
      if (errorMessage.includes("El Nombre del Proyecto") && errorMessage.includes("ya existe")) {
        setStep(1);
        Swal.fire({
          title: "Ooops...",
          text: "El nombre del proyecto ya existe. Por favor corrija el campo 'Nombre del proyecto'.",
          icon: "error",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Para otros errores, regresa al paso 1 y muestra un mensaje con el mismo estilo
      setStep(1);
      Swal.fire({
        title: "Algo salió mal",
        text: "Falta completar algún campo o hay un error en la información. Por favor revise y complete los campos correctamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
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

  const SidebarItem = ({
    stepNumber,
    iconName,
    title,
  }: {
    stepNumber: number;
    iconName: string;
    title: string;
  }) => {
    const isSelected = step === stepNumber;
    const activeColor = "#3ca7b7";
    const inactiveColor = "#ccc";
    return (
      <li className="nav-item" style={{ cursor: "pointer" }} onClick={() => setStep(stepNumber)}>
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
          <span style={{ fontWeight: "normal", whiteSpace: "normal", width: "180px" }}>{title}</span>
        </div>
      </li>
    );
  };

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
                  />
                  <SidebarItem stepNumber={2} iconName="location_on" title="Ubicación del proyecto" />
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
                          onChange={(e) => handleFormInputChange("name_project", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) => handleFormInputChange("owner_name", e.target.value)}
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
                          onChange={(e) => handleFormInputChange("owner_lastname", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => handleFormInputChange("country", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => handleFormInputChange("department", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Provincia</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.province}
                          onChange={(e) => handleFormInputChange("province", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Distrito</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.district}
                          onChange={(e) => handleFormInputChange("district", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de edificación</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) => handleFormInputChange("building_type", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de uso principal</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) => handleFormInputChange("main_use_type", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de niveles</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) =>
                            handleFormInputChange("number_levels", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de viviendas / oficinas x nivel</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          onChange={(e) =>
                            handleFormInputChange("number_homes_per_level", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Superficie construida (m²)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.built_surface}
                          onChange={(e) =>
                            handleFormInputChange("built_surface", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div className="text-end">
                      <CustomButton variant="save" onClick={handleStep1Submit}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
                        Grabar Datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* Paso 2 */}
                    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "30px", marginBottom: "20px" }}>
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
                            style={{ width: "30%", height: "50px", marginTop: "30px", fontSize: "15px", padding: "10px 20px" }}
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
                                      confirmButtonColor: "#3085d6",
                                    });
                                  },
                                  () => {
                                    Swal.fire({
                                      title: "Error",
                                      text: "No se pudo obtener la ubicación.",
                                      icon: "error",
                                      confirmButtonText: "Entendido",
                                      confirmButtonColor: "#3085d6",
                                    });
                                  }
                                );
                              } else {
                                Swal.fire({
                                  title: "Error",
                                  text: "Geolocalización no soportada.",
                                  icon: "error",
                                  confirmButtonText: "Entendido",
                                  confirmButtonColor: "#3085d6",
                                });
                              }
                            }}
                          >
                            <span className="material-icons" style={{ marginRight: "5px" }}>location_on</span>
                            Ubicación actual
                          </CustomButton>
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label" style={{ width: "100%", height: "20px", marginLeft: "-80px", marginTop: "20px" }}>
                            Datos de ubicaciones encontradas
                          </label>
                          <textarea
                            className="form-control mb-2"
                            rows={5}
                            value={`Latitud: ${formData.latitude}, Longitud: ${formData.longitude}`}
                            readOnly
                            style={{ width: "90%", height: "100px", marginLeft: "-80px", marginTop: "0px" }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-end">
                        <CustomButton variant="save" onClick={handleCreateProject}>
                          <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
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
