import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";

// Importa tu componente existente para cargar Google Icons
import GooIcons from "../public/GoogleIcons";

/** Tipos e interfaces necesarias **/
interface MaterialAtributs {
  name: string;
  conductivity: number;
  specific_heat: number;
  density: number;
}

export interface Material {
  id: number;
  atributs: MaterialAtributs;
}

export interface ElementBase {
  id: number;
  type: "window" | "door";
  name_element: string;
  u_marco: number;
  fm: number;
  atributs: {
    u_vidrio?: number;
    fs_vidrio?: number;
    frame_type?: string;
    clousure_type?: string;
    u_puerta_opaca?: number;
    porcentaje_vidrio?: number;
    name_ventana?: string;
  };
}

/** Función para leer variables CSS con un valor fallback **/
function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

/** Página de workflow **/
const ProjectWorkflowPart2: React.FC = () => {
  useAuth();
  const router = useRouter();

  // Estados para la cabecera del proyecto
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectDepartment, setProjectDepartment] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    const storedDepartment = localStorage.getItem("project_department");
    if (storedProjectId) {
      setProjectId(Number(storedProjectId));
    }
    if (storedDepartment) {
      setProjectDepartment(storedDepartment);
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded && projectId === null) {
      Swal.fire(
        "Ningún proyecto está seleccionado",
        "Serás redirigido a la creación de proyecto",
        "warning"
      ).then(() => {
        router.push("/project-workflow-part1");
      });
    }
  }, [hasLoaded, projectId, router]);

  // Estado para los pasos (3, 5 y 6)
  const [step, setStep] = useState<number>(3);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  /** Estados para Lista de materiales (Step 3) **/
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [showNewMaterialRow, setShowNewMaterialRow] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });
  const [materialSearch, setMaterialSearch] = useState("");

  /** Estados para Elementos translúcidos (Step 5) **/
  const [modalElementType, setModalElementType] = useState<string>("ventanas");
  const [elementsList, setElementsList] = useState<ElementBase[]>([]);
  const [showNewWindowRow, setShowNewWindowRow] = useState(false);
  const [showNewDoorRow, setShowNewDoorRow] = useState(false);
  const [windowData, setWindowData] = useState({
    name_element: "",
    u_vidrio: 0,
    fs_vidrio: 0,
    clousure_type: "Corredera",
    frame_type: "",
    u_marco: 0,
    fm: 0,
  });
  const [doorData, setDoorData] = useState({
    name_element: "",
    ventana_id: 0,
    name_ventana: "",
    u_puerta_opaca: 0,
    porcentaje_vidrio: 0,
    u_marco: 0,
    fm: 0,
  });
  const [allWindowsForDoor, setAllWindowsForDoor] = useState<ElementBase[]>([]);
  const [elementSearch, setElementSearch] = useState("");

  /** Estados para Tipología y Perfil de uso (Step 6) **/
  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");

  // Estado para el color primario
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);

  // -------------------------------
  // Funciones API
  // -------------------------------
  const fetchMaterialsList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      let allMaterials: Material[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const url = `${constantUrlApiEndpoint}/constants/?page=${page}&per_page=100`;
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(url, { headers });
        const currentData = response.data.constants || [];
        allMaterials = [...allMaterials, ...currentData];
        if (currentData.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      setMaterialsList(allMaterials);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error al obtener materiales:", error);
        Swal.fire("Error", "Error al obtener materiales. Ver consola.");
      } else {
        console.error("Error inesperado:", error);
      }
    }
  };

  const handleCreateMaterial = async () => {
    if (
      newMaterialData.name.trim() === "" ||
      newMaterialData.conductivity <= 0 ||
      newMaterialData.specific_heat <= 0 ||
      newMaterialData.density <= 0
    ) {
      Swal.fire("Campos incompletos", "Por favor complete todos los campos de material", "warning");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const requestBody = {
        atributs: {
          name: newMaterialData.name,
          density: newMaterialData.density,
          conductivity: newMaterialData.conductivity,
          specific_heat: newMaterialData.specific_heat,
        },
        name: "materials",
        type: "definition materials",
      };
      const url = `${constantUrlApiEndpoint}/constants/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json",
      };
      const response = await axios.post(url, requestBody, { headers });
      if (response.status === 200) {
        Swal.fire("Material creado", "Se ha creado el material correctamente", "success");
        await fetchMaterialsList();
        setShowNewMaterialRow(false);
        setNewMaterialData({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error al crear material", error.response?.data?.detail || error.message, "error");
      } else {
        Swal.fire("Error al crear material", "Error desconocido", "error");
      }
    }
  };

  const fetchElements = async (type: "window" | "door") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/elements/?type=${type}`;
      const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
      const response = await axios.get(url, { headers });
      setElementsList(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire(
          `Error al obtener ${type === "window" ? "ventanas" : "puertas"}`,
          error.response?.data?.detail || error.message,
          "error"
        );
      } else {
        Swal.fire("Error", "Error desconocido", "error");
      }
    }
  };

  const fetchAllWindowsForDoor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/elements/?type=window`;
      const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
      const response = await axios.get(url, { headers });
      setAllWindowsForDoor(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener ventanas para puerta:", error);
      Swal.fire("Error", "Error al obtener ventanas para puerta. Ver consola.");
    }
  };

  const handleCreateWindowElement = async () => {
    if (
      windowData.name_element.trim() === "" ||
      windowData.u_vidrio <= 0 ||
      windowData.fs_vidrio <= 0 ||
      windowData.u_marco <= 0 ||
      windowData.fm < 0 ||
      windowData.fm > 100 ||
      windowData.clousure_type.trim() === "" ||
      windowData.frame_type.trim() === ""
    ) {
      Swal.fire("Campos incompletos", "Por favor complete todos los campos de la ventana", "warning");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    const body = {
      name_element: windowData.name_element,
      type: "window",
      atributs: {
        u_vidrio: windowData.u_vidrio,
        fs_vidrio: windowData.fs_vidrio,
        clousure_type: windowData.clousure_type,
        frame_type: windowData.frame_type,
      },
      u_marco: windowData.u_marco,
      fm: windowData.fm,
    };
    try {
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      Swal.fire("Ventana creada", `La ventana "${windowData.name_element}" ha sido creada.`, "success");
      setShowNewWindowRow(false);
      setWindowData({
        name_element: "",
        u_vidrio: 0,
        fs_vidrio: 0,
        clousure_type: "Corredera",
        frame_type: "",
        u_marco: 0,
        fm: 0,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  const handleCreateDoorElement = async () => {
    if (
      doorData.name_element.trim() === "" ||
      doorData.u_puerta_opaca <= 0 ||
      doorData.porcentaje_vidrio < 0 ||
      doorData.porcentaje_vidrio > 100 ||
      doorData.u_marco <= 0 ||
      doorData.fm < 0 ||
      doorData.fm > 100 ||
      doorData.ventana_id === 0
    ) {
      Swal.fire("Campos incompletos", "Por favor complete todos los campos de la puerta", "warning");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    const body = {
      name_element: doorData.name_element,
      type: "door",
      atributs: {
        ventana_id: doorData.ventana_id,
        name_ventana: doorData.name_ventana,
        u_puerta_opaca: doorData.u_puerta_opaca,
        porcentaje_vidrio: doorData.porcentaje_vidrio,
      },
      u_marco: doorData.u_marco,
      fm: doorData.fm,
    };
    try {
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      Swal.fire("Puerta creada", `La puerta "${doorData.name_element}" ha sido creada.`, "success");
      setShowNewDoorRow(false);
      setDoorData({
        name_element: "",
        ventana_id: 0,
        name_ventana: "",
        u_puerta_opaca: 0,
        porcentaje_vidrio: 0,
        u_marco: 0,
        fm: 0,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  // Función para mostrar alerta, guardar datos y redirigir al siguiente step.
  // En step 6 se redirige a "project-list".
  const handleStep1Submit = () => {
    Swal.fire("Datos guardados", "Datos guardados con éxito", "success").then(() => {
      if (step === 3) {
        setStep(5);
      } else if (step === 5) {
        setStep(6);
      } else if (step === 6) {
        router.push("/project-list");
      }
    });
  };

  // -------------------------------
  // Efectos para cargar datos
  // -------------------------------
  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList();
    }
  }, [step]);

  useEffect(() => {
    if (step === 5) {
      fetchElements(modalElementType === "ventanas" ? "window" : "door");
    }
  }, [step, modalElementType]);

  useEffect(() => {
    if (step === 5 && modalElementType === "puertas") {
      fetchAllWindowsForDoor();
    }
  }, [step, modalElementType]);

  // -------------------------------
  // Renderizado de la interfaz
  // -------------------------------
  const renderMainHeader = () =>
    step >= 3 ? (
      <div className="mb-3">
        <h2
          style={{
            fontSize: "40px",
            marginTop: "130px",
            fontWeight: "normal",
            fontFamily: "var(--font-family-base)",
          }}
        >
          Datos de entrada
        </h2>
        <div className="d-flex align-items-center gap-4 mt-4">
          <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>Proyecto:</span>
          <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
            {`Edificación Nº ${projectId ?? "xxxxx"}`}
          </CustomButton>
          {projectDepartment && (
            <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
              {`Departamento: ${projectDepartment}`}
            </CustomButton>
          )}
        </div>
      </div>
    ) : null;

  // Componente SidebarItem (menú lateral)
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
    const activeColor = primaryColor;
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
          <span style={{ marginRight: "15px", fontSize: "2rem" }}>
            <span className="material-icons">{iconName}</span>
          </span>
          <span style={{ fontWeight: "normal" }}>{title}</span>
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
        }}
      >
        {renderMainHeader()}
        <div className="card shadow w-100" style={{ overflow: "hidden" }}>
          <div className="card-body p-0">
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
                  <SidebarItem stepNumber={3} iconName="imagesearch_roller" title="Lista de materiales" />
                  <SidebarItem stepNumber={5} iconName="home" title="Elementos translúcidos" />
                  <SidebarItem stepNumber={6} iconName="deck" title="Perfil de uso" />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "20px" }}>
                {/* Step 3: Lista de materiales */}
                {step === 3 && (
                  <>
                    {/* Cabecera: Barra de búsqueda a la izquierda y botón "+Nuevo" en la esquina superior derecha */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div style={{ flex: 1, marginRight: "10px" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar material..."
                          value={materialSearch}
                          onChange={(e) => setMaterialSearch(e.target.value)}
                        />
                      </div>
                      <CustomButton
                        variant="save"
                        onClick={() => setShowNewMaterialRow((prev) => !prev)}
                        style={{ borderRadius: "5px", width: "180px" }}
                      >
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>

                    {/* Tabla de materiales */}
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                      <table className="table table-bordered table-striped" style={{ tableLayout: "fixed" }}>
                        <thead>
                          <tr>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Material</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Conductividad (W/m2K)</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Calor específico (J/kgK)</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Densidad (kg/m3)</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showNewMaterialRow && (
                            <tr>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nombre"
                                  value={newMaterialData.name}
                                  onChange={(e) =>
                                    setNewMaterialData((prev) => ({ ...prev, name: e.target.value }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Conductividad"
                                  value={newMaterialData.conductivity}
                                  onChange={(e) =>
                                    setNewMaterialData((prev) => ({
                                      ...prev,
                                      conductivity: parseFloat(e.target.value),
                                    }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Calor específico"
                                  value={newMaterialData.specific_heat}
                                  onChange={(e) =>
                                    setNewMaterialData((prev) => ({
                                      ...prev,
                                      specific_heat: parseFloat(e.target.value),
                                    }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Densidad"
                                  value={newMaterialData.density}
                                  onChange={(e) =>
                                    setNewMaterialData((prev) => ({ ...prev, density: parseFloat(e.target.value) }))
                                  }
                                />
                              </td>
                              <td className="d-flex gap-2 justify-content-center">
                                <CustomButton
                                  variant="save"
                                  onClick={handleCreateMaterial}
                                  style={{ borderRadius: "5px", width: "180px" }}
                                >
                                  <span className="material-icons">add</span>
                                </CustomButton>
                                <CustomButton
                                  variant="cancelIcon"
                                  onClick={() => setShowNewMaterialRow(false)}
                                  style={{ borderRadius: "5px", width: "180px" }}
                                >
                                  <span className="material-icons">cancel</span>
                                </CustomButton>
                              </td>
                            </tr>
                          )}
                          {materialsList
                            .filter((mat) =>
                              mat.atributs.name.toLowerCase().includes(materialSearch.toLowerCase())
                            )
                            .map((mat, idx) => {
                              const { name, conductivity, specific_heat, density } = mat.atributs;
                              return (
                                <tr key={idx}>
                                  <td>{name}</td>
                                  <td>{conductivity}</td>
                                  <td>{specific_heat}</td>
                                  <td>{density}</td>
                                  <td>
                                    <span className="material-icons" style={{ color: "#ccc" }}>
                                      visibility
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    {/* Botón "Grabar Datos" en la esquina inferior derecha */}
                    <div className="mt-3 text-end">
                      <CustomButton
                        variant="save"
                        onClick={handleStep1Submit}
                        style={{ borderRadius: "5px", width: "180px" }}
                      >
                        <span className="material-icons" style={{ marginRight: "5px" }}>
                          sd_card
                        </span>
                        Grabar Datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Step 5: Elementos translúcidos */}
                {step === 5 && (
                  <>
                    {/* Encabezado: campo de búsqueda a la izquierda y botón "+Nuevo" a la derecha */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div style={{ flex: 1, marginRight: "10px" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar elemento..."
                          value={elementSearch}
                          onChange={(e) => setElementSearch(e.target.value)}
                        />
                      </div>
                      <CustomButton
                        variant="save"
                        onClick={() => {
                          if (modalElementType === "ventanas") {
                            setShowNewWindowRow((prev) => !prev);
                          } else {
                            setShowNewDoorRow((prev) => !prev);
                          }
                        }}
                        style={{ borderRadius: "5px", width: "180px" }}
                      >
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>
                    {/* Pestañas */}
                    <div className="d-flex justify-content-start align-items-center mb-2">
                      {["Ventanas", "Puertas"].map((tab) => (
                        <button
                          key={tab}
                          style={{
                            flex: 1,
                            padding: "10px",
                            backgroundColor: "#fff",
                            color: modalElementType === tab.toLowerCase() ? primaryColor : "var(--secondary-color)",
                            border: "none",
                            cursor: "pointer",
                            borderBottom: modalElementType === tab.toLowerCase() ? `3px solid ${primaryColor}` : "none",
                            fontFamily: "var(--font-family-base)",
                            fontWeight: "normal",
                          }}
                          onClick={() => setModalElementType(tab.toLowerCase())}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    {/* Tabla de elementos translúcidos */}
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                      <table className="table table-bordered table-striped" style={{ tableLayout: "fixed" }}>
                        <thead>
                          {modalElementType === "ventanas" ? (
                            <tr>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Vidrio [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FS Vidrio</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Tipo Cierre</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Tipo Marco</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                            </tr>
                          ) : (
                            <tr>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Puerta opaca [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Ventana</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>% Vidrio</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {modalElementType === "ventanas" && showNewWindowRow && (
                            <tr>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nombre"
                                  value={windowData.name_element}
                                  onChange={(e) =>
                                    setWindowData((prev) => ({ ...prev, name_element: e.target.value }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="U Vidrio"
                                  value={windowData.u_vidrio}
                                  onChange={(e) =>
                                    setWindowData((prev) => ({ ...prev, u_vidrio: parseFloat(e.target.value) }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="FS Vidrio"
                                  value={windowData.fs_vidrio}
                                  onChange={(e) =>
                                    setWindowData((prev) => ({ ...prev, fs_vidrio: parseFloat(e.target.value) }))
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={windowData.clousure_type}
                                  onChange={(e) =>
                                    setWindowData((prev) => ({ ...prev, clousure_type: e.target.value }))
                                  }
                                >
                                  <option value="Abatir">Abatir</option>
                                  <option value="Corredera">Corredera</option>
                                  <option value="Fija">Fija</option>
                                  <option value="Guillotina">Guillotina</option>
                                  <option value="Proyectante">Proyectante</option>
                                </select>
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={windowData.frame_type}
                                  onChange={(e) =>
                                    setWindowData((prev) => ({ ...prev, frame_type: e.target.value }))
                                  }
                                >
                                  <option value="">Seleccione</option>
                                  <option value="Fierro">Fierro</option>
                                  <option value="Madera Con RPT">Madera Con RPT</option>
                                  <option value="Madera Sin RPT">Madera Sin RPT</option>
                                  <option value="Metalico Con RPT">Metalico Con RPT</option>
                                  <option value="Metalico Sin RPT">Metalico Sin RPT</option>
                                  <option value="PVC Con RPT">PVC Con RPT</option>
                                  <option value="PVC Sin RPT">PVC Sin RPT</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="U Marco"
                                  value={windowData.u_marco}
                                  onChange={(e) =>
                                    setWindowData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="FM"
                                  min="0"
                                  max="100"
                                  value={windowData.fm}
                                  onChange={(e) => {
                                    let value = parseFloat(e.target.value);
                                    if (isNaN(value)) value = 0;
                                    if (value > 100) value = 100;
                                    if (value < 0) value = 0;
                                    setWindowData((prev) => ({ ...prev, fm: value }));
                                  }}
                                />
                              </td>
                              <td className="d-flex gap-2 justify-content-center">
                                <CustomButton
                                  variant="save"
                                  onClick={handleCreateWindowElement}
                                  style={{ borderRadius: "5px", width: "180px" }}
                                >
                                  <span className="material-icons">add</span>
                                </CustomButton>
                                <CustomButton
                                  variant="cancelIcon"
                                  onClick={() => setShowNewWindowRow(false)}
                                  style={{ borderRadius: "5px", width: "180px" }}
                                >
                                  <span className="material-icons">cancel</span>
                                </CustomButton>
                              </td>
                            </tr>
                          )}
                          {modalElementType === "puertas" && showNewDoorRow && (
                            <tr>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nombre"
                                  value={doorData.name_element}
                                  onChange={(e) =>
                                    setDoorData((prev) => ({ ...prev, name_element: e.target.value }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="U Puerta opaca"
                                  value={doorData.u_puerta_opaca}
                                  onChange={(e) =>
                                    setDoorData((prev) => ({ ...prev, u_puerta_opaca: parseFloat(e.target.value) }))
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={doorData.ventana_id || ""}
                                  onChange={(e) => {
                                    const winId = parseInt(e.target.value);
                                    setDoorData((prev) => ({
                                      ...prev,
                                      ventana_id: winId,
                                      name_ventana: allWindowsForDoor.find((win) => win.id === winId)?.name_element || "",
                                    }));
                                  }}
                                >
                                  <option value="">Seleccione</option>
                                  {allWindowsForDoor.map((win) => (
                                    <option key={win.id} value={win.id}>
                                      {win.name_element}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="% Vidrio"
                                  min="0"
                                  max="100"
                                  value={doorData.porcentaje_vidrio}
                                  onChange={(e) => {
                                    let value = parseFloat(e.target.value);
                                    if (isNaN(value)) value = 0;
                                    if (value > 100) value = 100;
                                    if (value < 0) value = 0;
                                    setDoorData((prev) => ({ ...prev, porcentaje_vidrio: value }));
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="U Marco"
                                  value={doorData.u_marco}
                                  onChange={(e) =>
                                    setDoorData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="FM"
                                  min="0"
                                  max="100"
                                  value={doorData.fm}
                                  onChange={(e) => {
                                    let value = parseFloat(e.target.value);
                                    if (isNaN(value)) value = 0;
                                    if (value > 100) value = 100;
                                    if (value < 0) value = 0;
                                    setDoorData((prev) => ({ ...prev, fm: value }));
                                  }}
                                />
                              </td>
                              <td className="d-flex gap-2 justify-content-center">
                                <CustomButton
                                  variant="save"
                                  onClick={handleCreateDoorElement}
                                  style={{ borderRadius: "5px", width: "180px" }}
                                >
                                  <span className="material-icons">add</span>
                                </CustomButton>
                                <CustomButton
                                  variant="cancelIcon"
                                  onClick={() => setShowNewDoorRow(false)}
                                  style={{ borderRadius: "5px", width: "180px" }}
                                >
                                  <span className="material-icons">cancel</span>
                                </CustomButton>
                              </td>
                            </tr>
                          )}
                          {elementsList
                            .filter((el) =>
                              el.name_element.toLowerCase().includes(elementSearch.toLowerCase())
                            )
                            .map((el, idx) => (
                              <tr key={idx}>
                                {modalElementType === "ventanas" ? (
                                  <>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs.u_vidrio}</td>
                                    <td>{el.atributs.fs_vidrio}</td>
                                    <td>{el.atributs.clousure_type}</td>
                                    <td>{el.atributs.frame_type}</td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                    <td>
                                      <span className="material-icons" style={{ color: "#ccc" }}>
                                        visibility
                                      </span>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs.u_puerta_opaca}</td>
                                    <td>{el.atributs.name_ventana}</td>
                                    <td>
                                      {el.atributs.porcentaje_vidrio !== undefined
                                        ? ((el.atributs.porcentaje_vidrio as number) * 100).toFixed(0) + "%"
                                        : "0%"}
                                    </td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                    <td>
                                      <span className="material-icons" style={{ color: "#ccc" }}>
                                        visibility
                                      </span>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Botón "Grabar Datos" en la esquina inferior derecha */}
                    <div className="mt-4 text-end">
                      <CustomButton
                        variant="save"
                        onClick={handleStep1Submit}
                        style={{ borderRadius: "5px", width: "180px" }}
                      >
                        <span className="material-icons" style={{ marginRight: "5px" }}>
                          sd_card
                        </span>
                        Grabar Datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Step 6: Perfil de uso */}
                {step === 6 && (
                  <>
                    <h5 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }} className="mb-3">
                      Perfil de uso (Espacio aún en desarrollo, no funcional)
                    </h5>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {[
                        { key: "ventilacion", label: "Ventilación y caudales" },
                        { key: "iluminacion", label: "Iluminación" },
                        { key: "cargas", label: "Cargas internas" },
                        { key: "horario", label: "Horario y Clima" },
                      ].map((tab) => (
                        <li key={tab.key} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color: tabTipologiaRecinto === tab.key ? primaryColor : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabTipologiaRecinto === tab.key ? `3px solid ${primaryColor}` : "none",
                              fontFamily: "var(--font-family-base)",
                              fontWeight: "normal",
                            }}
                            onClick={() => setTabTipologiaRecinto(tab.key)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content border border-top-0 p-3">
                      <p style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                        Contenido para &apos;{tabTipologiaRecinto}&apos;
                      </p>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton
                        variant="save"
                        onClick={() =>
                          Swal.fire("Datos guardados", "Se han guardado los datos de tipología", "success").then(() => {
                            router.push("/project-list");
                          })
                        }
                        style={{ borderRadius: "5px", width: "180px" }}
                      >
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
                        Grabar datos
                      </CustomButton>
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
        .table th,
        .table td {
          text-align: center;
          vertical-align: middle;
        }
        .table thead th {
          background-color: #fff;
          color: var(--primary-color);
        }
        .table-striped tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .table-striped tbody tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      `}</style>
    </>
  );
};

export default ProjectWorkflowPart2;
