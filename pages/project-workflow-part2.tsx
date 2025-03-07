import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Modal from "../src/components/common/Modal";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import useAuth from "../src/hooks/useAuth";
import GooIcons from "../public/GoogleIcons";
import Card from "../src/components/common/Card";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
<ToastContainer position="top-right" autoClose={2000} hideProgressBar />
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
    ventana_id?: number;
  };
}

function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

interface SidebarItemComponentProps {
  stepNumber: number;
  iconName: string;
  title: string;
  onClickAction?: () => void;
}

// Helper para validar porcentajes
const validatePercentage = (value: number) => {
  if (isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const ProjectWorkflowPart2: React.FC = () => {
  useAuth();
  const router = useRouter();
  const mode = router.query.mode as string;
  const isViewMode = mode === "view";

  /** Estados de cabecera del proyecto **/
  const [projectId, setProjectId] = useState<number | null>(null);
  const [, setProjectDepartment] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    const storedDepartment = localStorage.getItem("project_department");
    if (storedProjectId) setProjectId(Number(storedProjectId));
    if (storedDepartment) setProjectDepartment(storedDepartment);
    setHasLoaded(true);
  }, []);

  // Se ha removido la redirección que impedía el acceso cuando no hay project id o department.
  // useEffect(() => {
  //   if (hasLoaded && projectId === null) {
  //     router.push("/project-workflow-part1");
  //   }
  // }, [hasLoaded, projectId, router]);

  /** Estado para el step actual **/
  const [step, setStep] = useState<number>(3);
  useEffect(() => {
    if (router.query.step) {
      const queryStep = parseInt(router.query.step as string, 10);
      if (!isNaN(queryStep)) setStep(queryStep);
    }
  }, [router.query.step]);

  /** Estados para Lista de Materiales (Step 3) **/
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });
  // Estado para el buscador de materiales
  const [materialSearch, setMaterialSearch] = useState("");

  /** Estados para Elementos translúcidos (Step 5) **/
  const [modalElementType, setModalElementType] = useState<string>("ventanas");
  const [elementsList, setElementsList] = useState<ElementBase[]>([]);
  const [showElementModal, setShowElementModal] = useState(false);
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
  // Estado para el buscador de elementos
  const [elementSearch, setElementSearch] = useState("");

  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");

  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);
  const headerCardHeight = "30px";

  /** Funciones API **/
  const fetchMaterialsList = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
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
    } catch (error) {
      console.error("Error al obtener materiales:", error);
      toast.error("Error al obtener materiales");
    }
  }, []);

  const fetchElements = useCallback(async (type: "window" | "door") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const url = `${constantUrlApiEndpoint}/elements/?type=${type}`;
      const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
      const response = await axios.get(url, { headers });
      setElementsList(response.data);
    } catch (error) {
      console.error(`Error al obtener ${type === "window" ? "ventanas" : "puertas"}`, error);
      toast.error(`Error al obtener ${type === "window" ? "ventanas" : "puertas"}`);
    }
  }, []);

  const fetchAllWindowsForDoor = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const url = `${constantUrlApiEndpoint}/elements/?type=window`;
      const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
      const response = await axios.get(url, { headers });
      setAllWindowsForDoor(response.data);
    } catch (error) {
      console.error("Error al obtener ventanas para puerta:", error);
      toast.error("Error al obtener ventanas para puerta");
    }
  }, []);

  /** Funciones para crear nuevos registros **/
  const handleCreateMaterial = async (): Promise<boolean> => {
    if (
      newMaterialData.name.trim() === "" ||
      newMaterialData.conductivity <= 0 ||
      newMaterialData.specific_heat <= 0 ||
      newMaterialData.density <= 0
    ) {
      toast.error("Por favor, complete todos los campos correctamente para crear el material");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
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
        await fetchMaterialsList();
        toast.success("Material creado exitosamente");
        setNewMaterialData({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al crear material:", error);
      toast.warn("Error al crear material");
      return false;
    }
  };

  const handleCreateWindowElement = async (): Promise<boolean> => {
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
      toast.error("Por favor, complete todos los campos correctamente para crear la ventana");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
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
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      setAllWindowsForDoor((prev) => [...prev, response.data.element]);
      toast.success("Ventana creada exitosamente");
      setWindowData({
        name_element: "",
        u_vidrio: 0,
        fs_vidrio: 0,
        clousure_type: "Corredera",
        frame_type: "",
        u_marco: 0,
        fm: 0,
      });
      return true;
    } catch (error) {
      console.error("Error al crear ventana:", error);
      toast.warn("Ese nombre de ventana ya existe");
      return false;
    }
  };

  const handleCreateDoorElement = async (): Promise<boolean> => {
    // Se elimina la validación que obligaba a seleccionar una ventana.
    if (
      doorData.name_element.trim() === "" ||
      doorData.u_puerta_opaca <= 0 ||
      doorData.porcentaje_vidrio < 0 ||
      doorData.porcentaje_vidrio > 100 ||
      doorData.u_marco <= 0 ||
      doorData.fm < 0 ||
      doorData.fm > 100
    ) {
      toast.error("Por favor, complete todos los campos correctamente para crear la puerta");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const body = {
        name_element: doorData.name_element,
        type: "door",
        atributs: {
          ventana_id: doorData.ventana_id,
          name_ventana: doorData.ventana_id ? doorData.name_ventana : "",
          u_puerta_opaca: doorData.u_puerta_opaca,
          // Si no se ha seleccionado ventana, se fija automáticamente el % vidrio a 0
          porcentaje_vidrio: doorData.ventana_id ? doorData.porcentaje_vidrio : 0,
        },
        u_marco: doorData.u_marco,
        fm: doorData.fm,
      };
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      toast.success("Puerta creada exitosamente");
      setDoorData({
        name_element: "",
        ventana_id: 0,
        name_ventana: "",
        u_puerta_opaca: 0,
        porcentaje_vidrio: 0,
        u_marco: 0,
        fm: 0,
      });
      return true;
    } catch (error) {
      console.error("Error al crear puerta:", error);
      // Se muestra mensaje específico en caso de nombre repetido
      toast.warn("Ese nombre de puerta ya existe");
      return false;
    }
  };

  /** Efectos para cargar datos según el step **/
  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList();
    }
  }, [step, fetchMaterialsList]);

  useEffect(() => {
    if (step === 5) {
      fetchElements(modalElementType === "ventanas" ? "window" : "door");
    }
  }, [step, modalElementType, fetchElements]);

  useEffect(() => {
    if (step === 5 && modalElementType === "puertas") {
      fetchAllWindowsForDoor();
    }
  }, [step, modalElementType, fetchAllWindowsForDoor]);

  /** Funciones de navegación entre steps **/
  const handleBackStep = () => {
    if (step === 3) {
      router.push(`/project-workflow-part1${isViewMode ? "?mode=view" : ""}`);
    } else if (step === 5) {
      setStep(3);
    } else if (step === 6) {
      setStep(5);
    }
  };

  const handleNextStep = () => {
    if (step === 3) {
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      router.push(`/project-workflow-part3${isViewMode ? "?mode=view" : ""}`);
    }
  };

  /** Componente SidebarItem **/
  const SidebarItemComponent = ({
    stepNumber,
    iconName,
    title,
    onClickAction,
  }: SidebarItemComponentProps) => {
    const isSelected = step === stepNumber;
    const activeColor = primaryColor;
    const inactiveColor = "#ccc";
    const handleClick = () => {
      if (onClickAction) {
        onClickAction();
      } else {
        setStep(stepNumber);
      }
    };
    return (
      <li className="nav-item" style={{ cursor: "pointer" }} onClick={handleClick}>
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
          }}
        >
          <span style={{ marginRight: "15px", fontSize: "2rem" }}>
            <span className="material-icons">{iconName}</span>
          </span>
          <span>{title}</span>
        </div>
      </li>
    );
  };

  /** Render del header principal **/
  const renderMainHeader = () =>
    step >= 3 && (
      <div className="mb-3" style={{ height: headerCardHeight, padding: "20px", textAlign: "left" }}>
        <h1 style={{ fontSize: "30px", margin: "0 0 20px 0", fontWeight: "normal" }}>
          {isViewMode ? "Vista de datos de entrada" : "Datos de entrada"}
        </h1>
      </div>
    );

  return (
    <>
      <GooIcons />
      <Navbar setActiveView={() => {}} />
      <TopBar sidebarWidth="300px" />
      <div
        className="container custom-container"
        style={{ marginTop: "120px", fontFamily: "var(--font-family-base)" }}
      >
        <Card>
          <div className="card-body p-0">{renderMainHeader()}</div>
        </Card>

        <Card marginTop="15px">
          <div className="card-body p-0">
            <div className="d-flex d-flex-responsive" style={{ alignItems: "stretch", gap: 0 }}>
              {/* Sidebar */}
              <div className="internal-sidebar">
                <ul className="nav flex-column">
                  {isViewMode && (
                    <>
                      <SidebarItemComponent
                        stepNumber={1}
                        iconName="assignment_ind"
                        title="Agregar detalles de propietario / proyecto y clasificación de edificaciones"
                        onClickAction={() =>
                          router.push("/project-workflow-part1?mode=view&step=1")
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={2}
                        iconName="location_on"
                        title="Ubicación del proyecto"
                        onClickAction={() =>
                          router.push("/project-workflow-part1?mode=view&step=2")
                        }
                      />
                    </>
                  )}
                  <SidebarItemComponent stepNumber={3} iconName="imagesearch_roller" title="Lista de materiales" />
                  <SidebarItemComponent stepNumber={5} iconName="home" title="Elementos translúcidos" />
                  <SidebarItemComponent stepNumber={6} iconName="deck" title="Perfil de uso" />
                  {isViewMode && (
                    <>
                      <SidebarItemComponent
                        stepNumber={4}
                        iconName="build"
                        title="Detalles constructivos"
                        onClickAction={() =>
                          router.push("/project-workflow-part3?mode=view&step=4")
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={7}
                        iconName="design_services"
                        title="Recinto"
                        onClickAction={() =>
                          router.push("/project-workflow-part3?mode=view&step=7")
                        }
                      />
                    </>
                  )}
                </ul>
              </div>
              {/* Área de contenido */}
              <div className="content-area">
                {step === 3 && (
                  <>
                    {/* Contenedor para el buscador y el botón (botón alineado a la derecha) */}
                    <div className="d-flex align-items-center p-2">
                      <div style={{ flex: 1, marginRight: "10px" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar material..."
                          value={materialSearch}
                          onChange={(e) => setMaterialSearch(e.target.value)}
                          style={{ height: "40px" }}
                        />
                      </div>
                      {!isViewMode && (
                        <CustomButton
                          variant="save"
                          onClick={() => setShowMaterialModal(true)}
                          style={{ height: "40px" }}
                        >
                          <span className="material-icons">add</span> Nuevo
                        </CustomButton>
                      )}
                    </div>
                    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th style={{ textAlign: "center" }}>Nombre Material</th>
                              <th style={{ textAlign: "center" }}>Conductividad (W/m2K)</th>
                              <th style={{ textAlign: "center" }}>Calor específico (J/kgK)</th>
                              <th style={{ textAlign: "center" }}>Densidad (kg/m3)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materialsList
                              .filter((mat) =>
                                mat.atributs.name.toLowerCase().includes(materialSearch.toLowerCase())
                              )
                              .map((mat, idx) => (
                                <tr key={idx}>
                                  <td>{mat.atributs.name}</td>
                                  <td>{mat.atributs.conductivity}</td>
                                  <td>{mat.atributs.specific_heat}</td>
                                  <td>{mat.atributs.density}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    {/* Contenedor para el buscador y el botón (botón alineado a la derecha) */}
                    <div className="d-flex align-items-center p-2">
                      <div style={{ flex: 1, marginRight: "10px" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar elemento..."
                          value={elementSearch}
                          onChange={(e) => setElementSearch(e.target.value)}
                          style={{ height: "40px" }}
                        />
                      </div>
                      {!isViewMode && (
                        <CustomButton
                          variant="save"
                          onClick={() => setShowElementModal(true)}
                          style={{ height: "40px" }}
                        >
                          <span className="material-icons">add</span> Nuevo
                        </CustomButton>
                      )}
                    </div>
                    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                      <div
                        className="d-flex justify-content-start align-items-center mb-2"
                        style={{ padding: "10px" }}
                      >
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
                              borderBottom:
                                modalElementType === tab.toLowerCase() ? "3px solid " + primaryColor : "none",
                            }}
                            onClick={() => setModalElementType(tab.toLowerCase())}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        <table className="table table-bordered table-striped">
                          <thead>
                            {modalElementType === "ventanas" ? (
                              <tr>
                                <th style={{ textAlign: "center" }}>Nombre Elemento</th>
                                <th style={{ textAlign: "center" }}>U Vidrio [W/m2K]</th>
                                <th style={{ textAlign: "center" }}>FS Vidrio</th>
                                <th style={{ textAlign: "center" }}>Tipo Cierre</th>
                                <th style={{ textAlign: "center" }}>Tipo Marco</th>
                                <th style={{ textAlign: "center" }}>U Marco [W/m2K]</th>
                                <th style={{ textAlign: "center" }}>FM [%]</th>
                              </tr>
                            ) : (
                              <tr>
                                <th style={{ textAlign: "center" }}>Nombre Elemento</th>
                                <th style={{ textAlign: "center" }}>U Puerta opaca [W/m2K]</th>
                                <th style={{ textAlign: "center" }}>Nombre Ventana</th>
                                <th style={{ textAlign: "center" }}>% Vidrio</th>
                                <th style={{ textAlign: "center" }}>U Marco [W/m2K]</th>
                                <th style={{ textAlign: "center" }}>FM [%]</th>
                              </tr>
                            )}
                          </thead>
                          <tbody>
                            {elementsList
                              .filter((el) =>
                                el.name_element.toLowerCase().includes(elementSearch.toLowerCase())
                              )
                              .map((el, idx) =>
                                modalElementType === "ventanas" ? (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs.u_vidrio}</td>
                                    <td>{el.atributs.fs_vidrio}</td>
                                    <td>{el.atributs.clousure_type}</td>
                                    <td>{el.atributs.frame_type}</td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                  </tr>
                                ) : (
                                  <tr key={idx}>
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
                                  </tr>
                                )
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <h5 className="mb-3" style={{ fontWeight: "normal" }}>
                      Perfil de uso (Espacio en desarrollo)
                    </h5>
                    <ul
                      className="nav mb-3"
                      style={{ display: "flex", listStyle: "none", padding: 0 }}
                    >
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
                              borderBottom: tabTipologiaRecinto === tab.key ? "3px solid " + primaryColor : "none",
                            }}
                            onClick={() => setTabTipologiaRecinto(tab.key)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content border border-top-0 p-3">
                      <p>Contenido para &apos;{tabTipologiaRecinto}&apos;</p>
                    </div>
                  </>
                )}

                {/* Los botones de navegación se muestran solo en el modo de vista */}
                {isViewMode && (step === 3 || step === 5 || step === 6) && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <CustomButton
                      variant="backIcon"
                      onClick={handleBackStep}
                      style={{ borderRadius: "5px", width: "180px", height: "40px" }}
                    >
                      Atrás
                    </CustomButton>
                    <CustomButton
                      variant="forwardIcon"
                      onClick={handleNextStep}
                      style={{ borderRadius: "5px", width: "180px", height: "40px" }}
                    >
                      Siguiente
                    </CustomButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal para crear Material */}
      {showMaterialModal && (
        <Modal
          isOpen={showMaterialModal}
          onClose={() => {
            setShowMaterialModal(false);
            setNewMaterialData({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
          }}
          title="Nuevo Material"
        >
          <div>
            <div className="form-group mb-3">
              <label>Nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                value={newMaterialData.name}
                onChange={(e) => setNewMaterialData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>Conductividad (W/m2K)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Conductividad"
                value={newMaterialData.conductivity}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({ ...prev, conductivity: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="form-group mb-3">
              <label>Calor específico (J/kgK)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Calor específico"
                value={newMaterialData.specific_heat}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({ ...prev, specific_heat: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="form-group mb-3">
              <label>Densidad (kg/m3)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Densidad"
                value={newMaterialData.density}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({ ...prev, density: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="text-end">
              <CustomButton
                variant="save"
                onClick={() => {
                  setShowMaterialModal(false);
                  setNewMaterialData({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
                }}
                style={{ marginRight: "10px" }}
              >
                Cancelar
              </CustomButton>
              <CustomButton
                variant="save"
                onClick={async () => {
                  const success = await handleCreateMaterial();
                  if (success) {
                    setShowMaterialModal(false);
                  }
                }}
              >
                Crear Material
              </CustomButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal para crear Elemento translúcido */}
      {showElementModal && (
        <Modal
          isOpen={showElementModal}
          onClose={() => {
            setShowElementModal(false);
            if (modalElementType === "ventanas") {
              setWindowData({
                name_element: "",
                u_vidrio: 0,
                fs_vidrio: 0,
                clousure_type: "Corredera",
                frame_type: "",
                u_marco: 0,
                fm: 0,
              });
            } else {
              setDoorData({
                name_element: "",
                ventana_id: 0,
                name_ventana: "",
                u_puerta_opaca: 0,
                porcentaje_vidrio: 0,
                u_marco: 0,
                fm: 0,
              });
            }
          }}
          title={modalElementType === "ventanas" ? "Nueva Ventana" : "Nueva Puerta"}
        >
          {modalElementType === "ventanas" ? (
            <div>
              <div className="form-group mb-3">
                <label>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={windowData.name_element}
                  onChange={(e) => setWindowData((prev) => ({ ...prev, name_element: e.target.value }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>U Vidrio [W/m2K]</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Vidrio"
                  value={windowData.u_vidrio}
                  onChange={(e) =>
                    setWindowData((prev) => ({ ...prev, u_vidrio: parseFloat(e.target.value) }))
                  }
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>FS Vidrio</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="FS Vidrio"
                  value={windowData.fs_vidrio}
                  onChange={(e) =>
                    setWindowData((prev) => ({ ...prev, fs_vidrio: parseFloat(e.target.value) }))
                  }
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>Tipo Cierre</label>
                <select
                  className="form-control"
                  value={windowData.clousure_type}
                  onChange={(e) => setWindowData((prev) => ({ ...prev, clousure_type: e.target.value }))}
                  disabled={isViewMode}
                >
                  <option value="Abatir">Abatir</option>
                  <option value="Corredera">Corredera</option>
                  <option value="Fija">Fija</option>
                  <option value="Guillotina">Guillotina</option>
                  <option value="Proyectante">Proyectante</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label>Tipo Marco</label>
                <select
                  className="form-control"
                  value={windowData.frame_type}
                  onChange={(e) => setWindowData((prev) => ({ ...prev, frame_type: e.target.value }))}
                  disabled={isViewMode}
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
              </div>
              <div className="form-group mb-3">
                <label>U Marco [W/m2K]</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Marco"
                  value={windowData.u_marco}
                  onChange={(e) => setWindowData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>FM [%]</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="FM"
                  value={windowData.fm}
                  onChange={(e) => {
                    const value = validatePercentage(parseFloat(e.target.value));
                    setWindowData((prev) => ({ ...prev, fm: value }));
                  }}
                  disabled={isViewMode}
                />
              </div>
              <div className="text-end">
                <CustomButton
                  variant="save"
                  onClick={() => {
                    setShowElementModal(false);
                    setWindowData({
                      name_element: "",
                      u_vidrio: 0,
                      fs_vidrio: 0,
                      clousure_type: "Corredera",
                      frame_type: "",
                      u_marco: 0,
                      fm: 0,
                    });
                  }}
                >
                  Cancelar
                </CustomButton>
                <CustomButton
                  variant="save"
                  onClick={async () => {
                    const success = await handleCreateWindowElement();
                    if (success) {
                      setShowElementModal(false);
                    }
                  }}
                >
                  Crear Ventana
                </CustomButton>
              </div>
            </div>
          ) : (
            <div>
              <div className="form-group mb-3">
                <label>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={doorData.name_element}
                  onChange={(e) => setDoorData((prev) => ({ ...prev, name_element: e.target.value }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>U Puerta opaca [W/m2K]</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Puerta opaca"
                  value={doorData.u_puerta_opaca}
                  onChange={(e) => setDoorData((prev) => ({ ...prev, u_puerta_opaca: parseFloat(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>Ventana Asociada</label>
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
                  disabled={isViewMode}
                >
                  <option value="">Seleccione</option>
                  {allWindowsForDoor.map((win) => (
                    <option key={win.id} value={win.id}>
                      {win.name_element}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-3">
                <label>% Vidrio</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="% Vidrio"
                  // Si no se selecciona ventana, se muestra 0 y se deshabilita el campo
                  value={doorData.ventana_id ? doorData.porcentaje_vidrio : 0}
                  onChange={(e) => {
                    const value = validatePercentage(parseFloat(e.target.value));
                    setDoorData((prev) => ({ ...prev, porcentaje_vidrio: value }));
                  }}
                  disabled={doorData.ventana_id ? false : true}
                />
              </div>
              <div className="form-group mb-3">
                <label>U Marco [W/m2K]</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Marco"
                  value={doorData.u_marco}
                  onChange={(e) => setDoorData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group mb-3">
                <label>FM [%]</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="FM"
                  value={doorData.fm}
                  onChange={(e) => {
                    const value = validatePercentage(parseFloat(e.target.value));
                    setDoorData((prev) => ({ ...prev, fm: value }));
                  }}
                  disabled={isViewMode}
                />
              </div>
              <div className="text-end">
                <CustomButton
                  variant="save"
                  onClick={() => {
                    setShowElementModal(false);
                    setDoorData({
                      name_element: "",
                      ventana_id: 0,
                      name_ventana: "",
                      u_puerta_opaca: 0,
                      porcentaje_vidrio: 0,
                      u_marco: 0,
                      fm: 0,
                    });
                  }}
                >
                  Cancelar
                </CustomButton>
                <CustomButton
                  variant="save"
                  onClick={async () => {
                    const success = await handleCreateDoorElement();
                    if (success) {
                      setShowElementModal(false);
                    }
                  }}
                >
                  Crear Puerta
                </CustomButton>
              </div>
            </div>
          )}
        </Modal>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        /* Estilos generales para contenedor y layout responsive */
        .custom-container {
          max-width: 1780px;
          margin-left: 103px;
          margin-right: 0px;
          padding: 0 15px;
        }
        .internal-sidebar {
          width: 380px;
          padding: 20px;
          box-sizing: border-box;
          border-right: 1px solid #ccc;
        }
        .content-area {
          flex: 1;
          padding: 20px;
        }
        .d-flex-responsive {
          display: flex;
          align-items: stretch;
          gap: 0;
        }
        @media (max-width: 1024px) {
          .custom-container {
            margin-left: 50px;
            margin-right: 20px;
          }
          .internal-sidebar {
            width: 100% !important;
            border-right: none;
            border-bottom: 1px solid #ccc;
            padding: 10px;
          }
          .content-area {
            padding: 10px;
          }
          .d-flex-responsive {
            flex-direction: column;
          }
        }
        @media (max-width: 480px) {
          .custom-container {
            margin-left: 10px;
            margin-right: 10px;
          }
        }
        /* Ajustes para la tabla */
        .table {
          border-collapse: collapse; /* Eliminar bordes internos */
        }
        .table th,
        .table td {
          text-align: center;
          vertical-align: middle;
          border: none !important; /* Forzar sin borde */
        }
        .table thead th {
          background-color: #fff;
          color: var(--primary-color);
          position: sticky;
          top: 0;
          z-index: 2;
        }
        /* Alternar colores en las filas de la tabla */
        .table-striped tbody tr:nth-child(odd) {
          background-color: #fff;
          border: none !important;
        }
        .table-striped tbody tr:nth-child(even) {
          background-color: #f8f8f8;
          border: none !important;
        }
      `}</style>
    </>
  );
};

export default ProjectWorkflowPart2;
