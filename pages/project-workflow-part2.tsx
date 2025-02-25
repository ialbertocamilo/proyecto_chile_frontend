import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// Se eliminó la importación de bootstrap-icons
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import dynamic from "next/dynamic";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";

// Importa tu componente existente para cargar GooIcons
import GooIcons from "../public/GoogleIcons";

const NoSSRInteractiveMap = dynamic(() => import("../src/components/InteractiveMap"), { ssr: false });

/** Tipos e interfaces necesarias **/
interface MaterialAtributs {
  name: string;
  conductivity: number;
  specific_heat: number;
  density: number;
}

interface Material {
  id: number;
  atributs: MaterialAtributs;
}

export interface ElementBase {
  id: number;
  type: "window" | "door";
  name_element: string;
  u_marco: number;
  fm: number;
  // Para ventanas
  atributs: {
    u_vidrio?: number;
    fs_vidrio?: number;
    frame_type?: string;
    clousure_type?: string;
    // Para puertas (opcional)
    u_puerta_opaca?: number;
    porcentaje_vidrio?: number;
    name_ventana?: string;
  };
}

/** Página de la parte 2 del workflow (Pasos: 3, 5 y 6) **/
const ProjectWorkflowPart2: React.FC = () => {
  useAuth();
  const router = useRouter();

  // Estados para obtener los datos del proyecto desde el localStorage
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectDepartment, setProjectDepartment] = useState<string | null>(null);
  // Estado para saber cuándo ya se leyó el localStorage
  const [hasLoaded, setHasLoaded] = useState(false);

  // Al cargar la página, obtenemos los datos guardados en el localStorage
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

  // Efecto para verificar si no hay proyecto seleccionado (solo se ejecuta si ya se cargó el localStorage)
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

  // Estado de pasos (iniciamos en el 3, ya que en esta página se usan los pasos 3, 5 y 6)
  // Paso 3: Lista de materiales, Paso 5: Elementos translucidos, Paso 6: Perfil de uso
  const [step, setStep] = useState<number>(3);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  /** Estados para Materiales (Paso 3) **/
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showNewMaterialRow, setShowNewMaterialRow] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });

  /** Estados para Elementos operables (Paso 5: Elementos translucidos) **/
  const [elementsList, setElementsList] = useState<ElementBase[]>([]);
  const [selectedElements, setSelectedElements] = useState<ElementBase[]>([]);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [modalElementType, setModalElementType] = useState<string>("ventanas");

  /** Estados para creación de ventana y puerta (dentro de Elementos translucidos) **/
  const [showCreateWindowModal, setShowCreateWindowModal] = useState(false);
  const [showCreateDoorModal, setShowCreateDoorModal] = useState(false);
  const [windowData, setWindowData] = useState({
    name_element: "",
    u_vidrio: 0,
    fs_vidrio: 0,
    frame_type: "",
    clousure_type: "Corredera",
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

  /** Estados para Tipología y Perfil de uso (Paso 6) **/
  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");

  // -------------------------------
  // Funciones de manejo (API)
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
    } catch (error: any) {
      console.error("Error al obtener materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.");
    }
  };

  const handleCreateMaterial = async () => {
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
        accept: "application/json"
      };
      const response = await axios.post(url, requestBody, { headers });
      if (response.status === 200) {
        Swal.fire("Material creado", "Se ha creado el material correctamente", "success");
        await fetchMaterialsList();
        setShowNewMaterialRow(false);
        setNewMaterialData({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
      }
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Error al obtener ventanas para puerta:", error);
      Swal.fire("Error", "Error al obtener ventanas para puerta. Ver consola.");
    }
  };

  const handleAddElement = (element: ElementBase) => {
    if (selectedElements.some((el) => el.id === element.id)) {
      Swal.fire("Elemento duplicado", "Este elemento ya fue agregado", "info");
      return;
    }
    setSelectedElements((prev) => [...prev, element]);
    Swal.fire("Elemento agregado", `${element.name_element} ha sido agregado.`, "success");
  };

  const handleCreateWindowElement = async () => {
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
        frame_type: windowData.frame_type,
        clousure_type: windowData.clousure_type,
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
      setShowCreateWindowModal(false);
      setWindowData({
        name_element: "",
        u_vidrio: 0,
        fs_vidrio: 0,
        frame_type: "",
        clousure_type: "Corredera",
        u_marco: 0,
        fm: 0,
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  const handleCreateDoorElement = async () => {
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
      setShowCreateDoorModal(false);
      setDoorData({
        name_element: "",
        ventana_id: 0,
        name_ventana: "",
        u_puerta_opaca: 0,
        porcentaje_vidrio: 0,
        u_marco: 0,
        fm: 0,
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  // Función para guardar materiales (Paso 3)
  const handleSaveMaterials = async () => {
    if (!projectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    const materialIds = selectedMaterials.map((mat) => mat.id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${projectId}/constants/select`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.post(url, materialIds, { headers });
      Swal.fire("Materiales guardados", "Materiales agregados correctamente", "success").then(() => {
        // Al guardar los materiales, pasamos al siguiente paso disponible (Paso 5)
        setStep(5);
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error al guardar materiales", error.response?.data?.detail || error.message, "error");
      } else {
        Swal.fire("Error al guardar materiales", "Error desconocido", "error");
      }
    }
  };

  // Función para guardar elementos (Paso 5)
  const handleSaveElements = async () => {
    if (!projectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const windowIds = selectedElements.filter((el) => el.type === "window").map((el) => el.id);
    const doorIds = selectedElements.filter((el) => el.type === "door").map((el) => el.id);
    try {
      if (windowIds.length > 0) {
        const urlWindows = `${constantUrlApiEndpoint}/projects/${projectId}/elements/windows/select`;
        await axios.post(urlWindows, windowIds, { headers });
      }
      if (doorIds.length > 0) {
        const urlDoors = `${constantUrlApiEndpoint}/projects/${projectId}/elements/doors/select`;
        await axios.post(urlDoors, doorIds, { headers });
      }
      Swal.fire("Elementos guardados", "Elementos agregados correctamente", "success").then(() => {
        // Al guardar elementos, avanzamos al siguiente paso (Perfil de uso)
        setStep(6);
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  // Efectos para cargar datos
  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList();
    }
  }, [step]);

  useEffect(() => {
    if (showAddElementModal && modalElementType === "ventanas") {
      fetchElements("window");
    }
    if (showAddElementModal && modalElementType === "puertas") {
      fetchElements("door");
    }
  }, [showAddElementModal, modalElementType]);

  useEffect(() => {
    if (showCreateDoorModal) {
      fetchAllWindowsForDoor();
    }
  }, [showCreateDoorModal]);

  // -------------------------------
  // Renderizado de la interfaz
  // -------------------------------
  const renderMainHeader = () =>
    step >= 3 ? (
      <div className="mb-3">
        <h2 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
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

  // Componente SidebarItem usando Google Icons
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
            // Se fuerza fontWeight normal en todo momento
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
                  <SidebarItem stepNumber={5} iconName="home" title="Elementos translucidos" />
                  <SidebarItem stepNumber={6} iconName="deck" title="Perfil de uso" />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "20px" }}>
                {/* Paso 3: Materiales */}
                {step === 3 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddMaterialModal(true)}>
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>
                    <h6 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                      Materiales Agregados
                    </h6>
                    {selectedMaterials.length > 0 ? (
                      <table className="table table-bordered table-striped">
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
                          {selectedMaterials.map((mat, idx) => {
                            const { name, conductivity, specific_heat, density } = mat.atributs;
                            return (
                              <tr key={idx}>
                                <td>{name}</td>
                                <td>{conductivity}</td>
                                <td>{specific_heat}</td>
                                <td>{density}</td>
                                <td>
                                  <CustomButton
                                    variant="deleteIcon"
                                    onClick={() =>
                                      setSelectedMaterials((prev) => prev.filter((m) => m.id !== mat.id))
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                        No se ha agregado ningún material.
                      </p>
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="save" onClick={handleSaveMaterials}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 5: Elementos translucidos */}
                {step === 5 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddElementModal(true)}>
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {["Ventanas", "Puertas"].map((tab) => (
                        <li key={tab} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color:
                                modalElementType === tab.toLowerCase()
                                  ? "var(--primary-color)"
                                  : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom:
                                modalElementType === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                              fontFamily: "var(--font-family-base)",
                              fontWeight: "normal",
                            }}
                            onClick={() => {
                              setModalElementType(tab.toLowerCase());
                            }}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <h6 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                      Elementos Agregados
                    </h6>
                    {selectedElements.length > 0 ? (
                      <table className="table table-bordered table-striped">
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
                          {selectedElements
                            .filter((el) =>
                              el.type === (modalElementType === "ventanas" ? "window" : "door")
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
                                  <td>
                                    <CustomButton
                                      variant="deleteIcon"
                                      onClick={() =>
                                        setSelectedElements((prev) =>
                                          prev.filter((item) => item.id !== el.id)
                                        )
                                      }
                                    />
                                  </td>
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
                                  <td>
                                    <CustomButton
                                      variant="deleteIcon"
                                      onClick={() =>
                                        setSelectedElements((prev) =>
                                          prev.filter((item) => item.id !== el.id)
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                        No se ha agregado ningún elemento.
                      </p>
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="save" onClick={handleSaveElements}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 6: Perfil de uso (Tipología y caudales, etc.) */}
                {step === 6 && (
                  <>
                  <h5 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }} className="mb-3">
                      Perfil de uso  (Espacio aun en desarrollo, no funcional)
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
                              color: tabTipologiaRecinto === tab.key ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabTipologiaRecinto === tab.key ? "3px solid var(--primary-color)" : "none",
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
                        Contenido para "{tabTipologiaRecinto}"
                      </p>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton
                        variant="save"
                        onClick={() =>
                          Swal.fire("Datos guardados", "Se han guardado los datos de tipología", "success")
                        }
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

      {/* -------------------------------
          Modales
      ------------------------------- */}
      {/* Modal para Materiales (Paso 3) */}
      {showAddMaterialModal && (
        <div className="modal-overlay" onClick={() => setShowAddMaterialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                Lista de Materiales
              </h4>
              <CustomButton variant="save" onClick={() => setShowNewMaterialRow((prev) => !prev)}>
                {showNewMaterialRow ? "Cancelar" : "Crear Material"}
              </CustomButton>
            </div>
            <table className="table table-bordered table-striped">
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
                        onChange={(e) => setNewMaterialData((prev) => ({ ...prev, name: e.target.value }))}
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
                    <td>
                      <CustomButton variant="save" onClick={handleCreateMaterial}>
                        <span className="material-icons">add</span>
                      </CustomButton>
                    </td>
                  </tr>
                )}
                {materialsList.map((mat, idx) => {
                  const { name, conductivity, specific_heat, density } = mat.atributs;
                  return (
                    <tr key={idx}>
                      <td>{name}</td>
                      <td>{conductivity}</td>
                      <td>{specific_heat}</td>
                      <td>{density}</td>
                      <td>
                        <CustomButton
                          variant="addIcon"
                          onClick={() => setSelectedMaterials((prev) => [...prev, mat])}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para elementos operables (Paso 5) */}
      {showAddElementModal && (
        <div className="modal-overlay" onClick={() => setShowAddElementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddElementModal(false)}>
              &times;
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                Lista de {modalElementType === "ventanas" ? "Ventanas" : "Puertas"}
              </h4>
              <div>
                {modalElementType === "ventanas" && (
                  <CustomButton variant="save" onClick={() => setShowCreateWindowModal(true)}>
                    Crear Ventana
                  </CustomButton>
                )}
                {modalElementType === "puertas" && (
                  <CustomButton variant="save" onClick={() => setShowCreateDoorModal(true)}>
                    Crear Puerta
                  </CustomButton>
                )}
              </div>
            </div>
            <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
              {["Ventanas", "Puertas"].map((tab) => (
                <li key={tab} style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#fff",
                      color:
                        modalElementType === tab.toLowerCase() ? "var(--primary-color)" : "var(--secondary-color)",
                      border: "none",
                      cursor: "pointer",
                      borderBottom:
                        modalElementType === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                      fontFamily: "var(--font-family-base)",
                      fontWeight: "normal",
                    }}
                    onClick={() => setModalElementType(tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
            <table className="table table-bordered table-striped">
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
                {elementsList
                  .filter((el) => el.type === (modalElementType === "ventanas" ? "window" : "door"))
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
                            <CustomButton variant="addIcon" onClick={() => handleAddElement(el)} />
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
                            <CustomButton variant="addIcon" onClick={() => handleAddElement(el)} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodal para crear ventana */}
      {showCreateWindowModal && (
        <div className="modal-overlay" onClick={() => setShowCreateWindowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateWindowModal(false)}>
              &times;
            </button>
            <h4 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
              Crear Ventana
            </h4>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={windowData.name_element}
                onChange={(e) => setWindowData((prev) => ({ ...prev, name_element: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>U Vidrio [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={windowData.u_vidrio}
                onChange={(e) => setWindowData((prev) => ({ ...prev, u_vidrio: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>FS Vidrio</label>
              <input
                type="number"
                className="form-control"
                value={windowData.fs_vidrio}
                onChange={(e) => setWindowData((prev) => ({ ...prev, fs_vidrio: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>Tipo Cierre</label>
              <select
                className="form-control"
                value={windowData.clousure_type}
                onChange={(e) => setWindowData((prev) => ({ ...prev, clousure_type: e.target.value }))}
              >
                <option value="Corredera">Corredera</option>
                <option value="Abatir">Abatir</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>Tipo Marco</label>
              <input
                type="text"
                className="form-control"
                value={windowData.frame_type}
                onChange={(e) => setWindowData((prev) => ({ ...prev, frame_type: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>U Marco [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={windowData.u_marco}
                onChange={(e) => setWindowData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>FM [%]</label>
              <input
                type="number"
                className="form-control"
                value={windowData.fm}
                onChange={(e) => setWindowData((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))}
              />
            </div>
            <CustomButton variant="save" onClick={handleCreateWindowElement}>
              Crear Ventana
            </CustomButton>
          </div>
        </div>
      )}

      {/* Submodal para crear puerta */}
      {showCreateDoorModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDoorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateDoorModal(false)}>
              &times;
            </button>
            <h4 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
              Crear Puerta
            </h4>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={doorData.name_element}
                onChange={(e) => setDoorData((prev) => ({ ...prev, name_element: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>U Puerta opaca [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={doorData.u_puerta_opaca}
                onChange={(e) => setDoorData((prev) => ({ ...prev, u_puerta_opaca: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>Nombre Ventana</label>
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
                <option value="">Seleccione una ventana</option>
                {allWindowsForDoor.map((win) => (
                  <option key={win.id} value={win.id}>
                    {win.name_element}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>% Vidrio</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={doorData.porcentaje_vidrio}
                onChange={(e) => setDoorData((prev) => ({ ...prev, porcentaje_vidrio: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>U Marco [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={doorData.u_marco}
                onChange={(e) => setDoorData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>FM [%]</label>
              <input
                type="number"
                className="form-control"
                value={doorData.fm}
                onChange={(e) => setDoorData((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))}
              />
            </div>
            <CustomButton variant="save" onClick={handleCreateDoorElement}>
              Crear Puerta
            </CustomButton>
          </div>
        </div>
      )}

      <style jsx>{`
        .card {
          border: 1px solid #ccc;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          position: relative;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 80%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #333;
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
