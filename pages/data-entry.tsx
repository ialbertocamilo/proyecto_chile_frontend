import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Modal from "../src/components/common/Modal";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import GooIcons from "../public/GoogleIcons";
import Card from "../src/components/common/Card";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import Title from "../src/components/Title";
import "react-toastify/dist/ReactToastify.css";

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

// Función para obtener el valor de una variable CSS con un valor por defecto
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

// Componente auxiliar para renderizar el label con asterisco si el campo está vacío
interface LabelWithAsteriskProps {
  label: string;
  value: string;
  required?: boolean;
}

const LabelWithAsterisk: React.FC<LabelWithAsteriskProps> = ({ label, value, required = true }) => {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");
  return (
    <label>
      {label} {required && isEmpty && <span style={{ color: "red" }}>*</span>}
    </label>
  );
};

const DataEntryPage: React.FC = () => {
  useAuth();
  const router = useRouter();

  /** Estados de cabecera del proyecto **/
  const [, setProjectId] = useState<number | null>(null);
  const [, setProjectDepartment] = useState<string | null>(null);
  const [, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    const storedDepartment = localStorage.getItem("project_department");
    if (storedProjectId) setProjectId(Number(storedProjectId));
    if (storedDepartment) setProjectDepartment(storedDepartment);
    setHasLoaded(true);
  }, []);

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
    conductivity: "",
    specific_heat: "",
    density: "",
  });
  const [materialSearch, setMaterialSearch] = useState("");

  /** Estados para Elementos translúcidos (Step 5) **/
  const [modalElementType, setModalElementType] = useState<string>("ventanas");
  const [elementsList, setElementsList] = useState<ElementBase[]>([]);
  const [showElementModal, setShowElementModal] = useState(false);
  const [windowData, setWindowData] = useState({
    name_element: "",
    u_vidrio: "",
    fs_vidrio: "",
    clousure_type: "Corredera",
    frame_type: "",
    u_marco: "",
    fm: "",
  });
  const [doorData, setDoorData] = useState({
    name_element: "",
    ventana_id: "",
    name_ventana: "",
    u_puerta_opaca: "",
    porcentaje_vidrio: "",
    u_marco: "",
    fm: "",
  });
  const [allWindowsForDoor, setAllWindowsForDoor] = useState<ElementBase[]>([]);
  const [elementSearch, setElementSearch] = useState("");
  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");

  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.key === "-") {
      e.preventDefault();
    }
    if (!/^\d$/.test(e.key) && e.key !== ".") {
      e.preventDefault();
    }
    if (e.key === "." && e.currentTarget.value.includes(".")) {
      e.preventDefault();
    }
  };

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
      console.error(
        `Error al obtener ${type === "window" ? "ventanas" : "puertas"}`,
        error
      );
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
    }
  }, []);

  const handleCreateMaterial = async (): Promise<boolean> => {
    if (
      newMaterialData.name.trim() === "" ||
      !newMaterialData.conductivity ||
      parseFloat(newMaterialData.conductivity) <= 0 ||
      !newMaterialData.specific_heat ||
      parseFloat(newMaterialData.specific_heat) <= 0 ||
      !newMaterialData.density ||
      parseFloat(newMaterialData.density) <= 0
    ) {
      console.error("Complete todos los campos correctamente para crear el material");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const requestBody = {
        atributs: {
          name: newMaterialData.name,
          density: parseFloat(newMaterialData.density),
          conductivity: parseFloat(newMaterialData.conductivity),
          specific_heat: parseFloat(newMaterialData.specific_heat),
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
        toast.dismiss("material-success");
        toast.success("Material creado exitosamente", {
          toastId: "material-success",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
        setNewMaterialData({ name: "", conductivity: "", specific_heat: "", density: "" });
        return true;
      }
      return false;
    } catch (error) {
      toast.dismiss("material-error");
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        toast.warn("El material ya existe", {
          toastId: "material-error",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
      } else {
        toast.warn("Error al crear el material", {
          toastId: "material-error",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
      }
      console.error("Error al crear material:", error);
      return false;
    }
  };

  const handleCreateWindowElement = async (): Promise<boolean> => {
    if (
      windowData.name_element.trim() === "" ||
      !windowData.u_vidrio ||
      parseFloat(windowData.u_vidrio) <= 0 ||
      !windowData.fs_vidrio ||
      parseFloat(windowData.fs_vidrio) <= 0 ||
      !windowData.u_marco ||
      parseFloat(windowData.u_marco) <= 0 ||
      windowData.fm === "" ||
      parseFloat(windowData.fm) < 0 ||
      parseFloat(windowData.fm) > 100 ||
      windowData.clousure_type.trim() === "" ||
      windowData.frame_type.trim() === ""
    ) {
      console.error("Complete todos los campos correctamente para crear la ventana");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const body = {
        name_element: windowData.name_element,
        type: "window",
        atributs: {
          u_vidrio: parseFloat(windowData.u_vidrio),
          fs_vidrio: parseFloat(windowData.fs_vidrio),
          clousure_type: windowData.clousure_type,
          frame_type: windowData.frame_type,
        },
        u_marco: parseFloat(windowData.u_marco),
        fm: parseFloat(windowData.fm) / 100,
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
      toast.dismiss("window-success");
      toast.success("Ventana creada exitosamente", {
        toastId: "window-success",
        autoClose: 2000,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
      setWindowData({
        name_element: "",
        u_vidrio: "",
        fs_vidrio: "",
        clousure_type: "Corredera",
        frame_type: "",
        u_marco: "",
        fm: "",
      });
      return true;
    } catch (error) {
      toast.dismiss("window-error");
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        toast.warn("La ventana ya existe", {
          toastId: "window-error",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
      } else {
        toast.warn("Error al crear la ventana", {
          toastId: "window-error",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
      }
      console.error("Error al crear ventana:", error);
      return false;
    }
  };

  const handleCreateDoorElement = async (): Promise<boolean> => {
    if (
      doorData.name_element.trim() === "" ||
      !doorData.u_puerta_opaca ||
      parseFloat(doorData.u_puerta_opaca) <= 0 ||
      !doorData.u_marco ||
      parseFloat(doorData.u_marco) <= 0 ||
      doorData.fm === "" ||
      parseFloat(doorData.fm) < 0 ||
      parseFloat(doorData.fm) > 100
    ) {
      console.error("Complete todos los campos correctamente para crear la puerta");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const body = {
        name_element: doorData.name_element,
        type: "door",
        atributs: {
          ventana_id: doorData.ventana_id ? parseInt(doorData.ventana_id) : 0,
          name_ventana: doorData.ventana_id ? doorData.name_ventana : "",
          u_puerta_opaca: parseFloat(doorData.u_puerta_opaca),
          porcentaje_vidrio: doorData.ventana_id ? parseFloat(doorData.porcentaje_vidrio) : 0,
        },
        u_marco: parseFloat(doorData.u_marco),
        fm: parseFloat(doorData.fm) / 100,
      };
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      toast.dismiss("door-success");
      toast.success("Puerta creada exitosamente", {
        toastId: "door-success",
        autoClose: 2000,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
      setDoorData({
        name_element: "",
        ventana_id: "",
        name_ventana: "",
        u_puerta_opaca: "",
        porcentaje_vidrio: "",
        u_marco: "",
        fm: "",
      });
      return true;
    } catch (error) {
      toast.dismiss("door-error");
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        toast.warn("La puerta ya existe", {
          toastId: "door-error",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
      } else {
        toast.warn("Error al crear la puerta", {
          toastId: "door-error",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        });
      }
      console.error("Error al crear puerta:", error);
      return false;
    }
  };

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

  const renderMainHeader = () =>
    step >= 3 && <Title text="Datos de entrada" />;

  const materialIsValid =
    newMaterialData.name.trim() !== "" &&
    newMaterialData.conductivity !== "" &&
    parseFloat(newMaterialData.conductivity) > 0 &&
    newMaterialData.specific_heat !== "" &&
    parseFloat(newMaterialData.specific_heat) > 0 &&
    newMaterialData.density !== "" &&
    parseFloat(newMaterialData.density) > 0;

  const windowIsValid =
    windowData.name_element.trim() !== "" &&
    windowData.u_vidrio !== "" &&
    parseFloat(windowData.u_vidrio) > 0 &&
    windowData.fs_vidrio !== "" &&
    parseFloat(windowData.fs_vidrio) > 0 &&
    windowData.u_marco !== "" &&
    parseFloat(windowData.u_marco) > 0 &&
    windowData.fm !== "" &&
    parseFloat(windowData.fm) >= 0 &&
    parseFloat(windowData.fm) <= 100 &&
    windowData.clousure_type.trim() !== "" &&
    windowData.frame_type.trim() !== "";

  const doorIsValid =
    doorData.name_element.trim() !== "" &&
    doorData.u_puerta_opaca !== "" &&
    parseFloat(doorData.u_puerta_opaca) > 0 &&
    doorData.u_marco !== "" &&
    parseFloat(doorData.u_marco) > 0 &&
    doorData.fm !== "" &&
    parseFloat(doorData.fm) >= 0 &&
    parseFloat(doorData.fm) <= 100 &&
    (!doorData.ventana_id ||
      (doorData.ventana_id &&
        doorData.porcentaje_vidrio !== "" &&
        parseFloat(doorData.porcentaje_vidrio) >= 0 &&
        parseFloat(doorData.porcentaje_vidrio) <= 100));

  return (
    <>
      <GooIcons />
      <div>
        <div>{renderMainHeader()}</div>

        <Card>
          <div>
            <div className="d-flex d-flex-responsive">
              {/* Sidebar interno */}
              <div className="internal-sidebar">
                <ul className="nav flex-column">
                  <SidebarItemComponent stepNumber={3} iconName="imagesearch_roller" title="Lista de materiales" />
                  <SidebarItemComponent stepNumber={5} iconName="home" title="Elementos translúcidos" />
                  <SidebarItemComponent stepNumber={6} iconName="deck" title="Perfil de uso" />
                </ul>
              </div>
              {/* Área de contenido */}
              <div className="content-area">
                {step === 3 && (
                  <>
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
                      <CustomButton
                        variant="save"
                        onClick={() => setShowMaterialModal(true)}
                        style={{ height: "40px" }}
                      >
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>
                    {/* Tabla de materiales */}
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
                      <div style={{ width: "90%" }}>
                        <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
                          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                            <table className="table table-striped">
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
                      </div>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
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
                      <CustomButton
                        variant="save"
                        onClick={() => setShowElementModal(true)}
                        style={{ height: "40px" }}
                      >
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>
                    {/* Tabla de elementos */}
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
                      <div style={{ width: "100%" }}>
                        <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
                          <div className="d-flex justify-content-start align-items-center mb-2" style={{ padding: "10px" }}>
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
                                  borderBottom: modalElementType === tab.toLowerCase() ? "3px solid " + primaryColor : "none",
                                }}
                                onClick={() => setModalElementType(tab.toLowerCase())}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                            <table className="table table-striped">
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
                      </div>
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <h5 className="mb-3" style={{ fontWeight: "normal" }}>
                      Perfil de uso (Espacio en desarrollo)
                    </h5>
                    <ul className="nav mb-3" style={{ display: "flex", listStyle: "none", padding: 0 }}>
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
              </div>
            </div>
          </div>
        </Card>
        {/* Modal para crear Material */}
        {showMaterialModal && (
          <Modal
            isOpen={showMaterialModal}
            onClose={() => {
              setShowMaterialModal(false);
              setNewMaterialData({ name: "", conductivity: "", specific_heat: "", density: "" });
            }}
            title="Nuevo Material"
          >
            <div>
              <div className="form-group mb-3">
                <LabelWithAsterisk label="Nombre" value={newMaterialData.name} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={newMaterialData.name}
                  onChange={(e) => setNewMaterialData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk label="Conductividad (W/m2K)" value={newMaterialData.conductivity} />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Conductividad"
                  value={newMaterialData.conductivity}
                  onChange={(e) =>
                    setNewMaterialData((prev) => ({ ...prev, conductivity: e.target.value }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk label="Calor específico (J/kgK)" value={newMaterialData.specific_heat} />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Calor específico"
                  value={newMaterialData.specific_heat}
                  onChange={(e) =>
                    setNewMaterialData((prev) => ({ ...prev, specific_heat: e.target.value }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk label="Densidad (kg/m3)" value={newMaterialData.density} />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Densidad"
                  value={newMaterialData.density}
                  onChange={(e) =>
                    setNewMaterialData((prev) => ({ ...prev, density: e.target.value }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              {!materialIsValid && (
                <div className="mb-3">
                  <p>
                    (<span style={{ color: "red" }}>*</span>) Campos obligatorios
                  </p>
                </div>
              )}
              <div className="text-end">
                <CustomButton
                  variant="save"
                  onClick={() => {
                    setShowMaterialModal(false);
                    setNewMaterialData({ name: "", conductivity: "", specific_heat: "", density: "" });
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
                  u_vidrio: "",
                  fs_vidrio: "",
                  clousure_type: "Corredera",
                  frame_type: "",
                  u_marco: "",
                  fm: "",
                });
              } else {
                setDoorData({
                  name_element: "",
                  ventana_id: "",
                  name_ventana: "",
                  u_puerta_opaca: "",
                  porcentaje_vidrio: "",
                  u_marco: "",
                  fm: "",
                });
              }
            }}
            title={modalElementType === "ventanas" ? "Nueva Ventana" : "Nueva Puerta"}
          >
            {modalElementType === "ventanas" ? (
              <div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="Nombre" value={windowData.name_element} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre"
                    value={windowData.name_element}
                    onChange={(e) => setWindowData((prev) => ({ ...prev, name_element: e.target.value }))}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="U Vidrio [W/m2K]" value={windowData.u_vidrio} />
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="U Vidrio"
                    value={windowData.u_vidrio}
                    onChange={(e) =>
                      setWindowData((prev) => ({ ...prev, u_vidrio: e.target.value }))
                    }
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="FS Vidrio" value={windowData.fs_vidrio} />
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="FS Vidrio"
                    value={windowData.fs_vidrio}
                    onChange={(e) =>
                      setWindowData((prev) => ({ ...prev, fs_vidrio: e.target.value }))
                    }
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="Tipo Cierre" value={windowData.clousure_type} />
                  <select
                    className="form-control"
                    value={windowData.clousure_type}
                    onChange={(e) => setWindowData((prev) => ({ ...prev, clousure_type: e.target.value }))}
                  >
                    <option value="Abatir">Abatir</option>
                    <option value="Corredera">Corredera</option>
                    <option value="Fija">Fija</option>
                    <option value="Guillotina">Guillotina</option>
                    <option value="Proyectante">Proyectante</option>
                  </select>
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="Tipo Marco" value={windowData.frame_type} />
                  <select
                    className="form-control"
                    value={windowData.frame_type}
                    onChange={(e) => setWindowData((prev) => ({ ...prev, frame_type: e.target.value }))}
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
                  <LabelWithAsterisk label="U Marco [W/m2K]" value={windowData.u_marco} />
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="U Marco"
                    value={windowData.u_marco}
                    onChange={(e) => setWindowData((prev) => ({ ...prev, u_marco: e.target.value }))}
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="FM [%]" value={windowData.fm} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    placeholder="FM"
                    value={windowData.fm}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value)) {
                        setWindowData((prev) => ({ ...prev, fm: "" }));
                      } else {
                        const validated = validatePercentage(value);
                        setWindowData((prev) => ({ ...prev, fm: validated.toString() }));
                      }
                    }}
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                {!windowIsValid && (
                  <div className="mb-3">
                    <p>
                      (<span style={{ color: "red" }}>*</span>) Campos obligatorios
                    </p>
                  </div>
                )}
                <div className="text-end">
                  <CustomButton
                    variant="save"
                    onClick={() => {
                      setShowElementModal(false);
                      setWindowData({
                        name_element: "",
                        u_vidrio: "",
                        fs_vidrio: "",
                        clousure_type: "Corredera",
                        frame_type: "",
                        u_marco: "",
                        fm: "",
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
                  <LabelWithAsterisk label="Nombre" value={doorData.name_element} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre"
                    value={doorData.name_element}
                    onChange={(e) => setDoorData((prev) => ({ ...prev, name_element: e.target.value }))}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="U Puerta opaca [W/m2K]" value={doorData.u_puerta_opaca} />
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="U Puerta opaca"
                    value={doorData.u_puerta_opaca}
                    onChange={(e) => setDoorData((prev) => ({ ...prev, u_puerta_opaca: e.target.value }))}
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="Ventana Asociada" value={doorData.ventana_id} required={false} />
                  <select
                    className="form-control"
                    value={doorData.ventana_id}
                    onChange={(e) => {
                      const winId = e.target.value;
                      setDoorData((prev) => ({
                        ...prev,
                        ventana_id: winId,
                        name_ventana:
                          allWindowsForDoor.find((win) => win.id === parseInt(winId))?.name_element || "",
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
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="% Vidrio" value={doorData.porcentaje_vidrio} required={false} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    placeholder="% Vidrio"
                    value={doorData.ventana_id ? doorData.porcentaje_vidrio : ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value)) {
                        setDoorData((prev) => ({ ...prev, porcentaje_vidrio: "" }));
                      } else {
                        const validated = validatePercentage(value);
                        setDoorData((prev) => ({ ...prev, porcentaje_vidrio: validated.toString() }));
                      }
                    }}
                    onKeyDown={handleNumberKeyDown}
                    disabled={!doorData.ventana_id}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="U Marco [W/m2K]" value={doorData.u_marco} />
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="U Marco"
                    value={doorData.u_marco}
                    onChange={(e) => setDoorData((prev) => ({ ...prev, u_marco: e.target.value }))}
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                <div className="form-group mb-3">
                  <LabelWithAsterisk label="FM [%]" value={doorData.fm} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    placeholder="FM"
                    value={doorData.fm}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value)) {
                        setDoorData((prev) => ({ ...prev, fm: "" }));
                      } else {
                        const validated = validatePercentage(value);
                        setDoorData((prev) => ({ ...prev, fm: validated.toString() }));
                      }
                    }}
                    onKeyDown={handleNumberKeyDown}
                  />
                </div>
                {!doorIsValid && (
                  <div className="mb-3">
                    <p>
                      (<span style={{ color: "red" }}>*</span>) Campos obligatorios
                    </p>
                  </div>
                )}
                <div className="text-end">
                  <CustomButton
                    variant="save"
                    onClick={() => {
                      setShowElementModal(false);
                      setDoorData({
                        name_element: "",
                        ventana_id: "",
                        name_ventana: "",
                        u_puerta_opaca: "",
                        porcentaje_vidrio: "",
                        u_marco: "",
                        fm: "",
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
          limit={1}
          autoClose={2000}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
        />
      </div>
      <style jsx>{`
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
        .table {
          border-collapse: collapse;
          font-size: 0.9rem;
          width: 100%;
        }
        .table th,
        .table td {
          border: none;
          text-align: center;
          vertical-align: middle;
          padding: 0.65em 1.8em;
        }
        .table thead th {
          background-color: #fff;
          color: var(--primary-color);
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .table-striped tbody tr:nth-child(odd) {
          background-color: #f8f8f8 !important;
        }
        .table-striped tbody tr:nth-child(even) {
          background-color: #f8f8f8 !important;
        }
      `}</style>
    </>
  );
};

export default DataEntryPage;
