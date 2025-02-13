import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";

const AdministrationPage: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const [step, setStep] = useState<number>(3);

  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);

  const [details, setDetails] = useState<any[]>([]);
  const [tabDetailSection, setTabDetailSection] = useState("Techumbre");

  const [elementsList, setElementsList] = useState<any[]>([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");
  const [modalElementType, setModalElementType] = useState<string>("ventanas");

  const [showCreateDoorModal, setShowCreateDoorModal] = useState(false);
  const [doorData, setDoorData] = useState({
    name_element: "",
    ventana_id: 0,
    name_ventana: "",
    u_puerta_opaca: 0,
    porcentaje_vidrio: 0,
    u_marco: 0,
    fm: 0,
  });

  const [showCreateWindowModal, setShowCreateWindowModal] = useState(false);
  const [windowData, setWindowData] = useState({
    name_element: "",
    u_vidrio: 0,
    fs_vidrio: 0,
    frame_type: "",
    clousure_type: "",
    u_marco: 0,
    fm: 0,
  });

  // Datos hardcodeados para Muros
  const murosDetails = [
    {
      id_detail: 1,
      nombreAbrev: "Muro Base",
      valorU: 2.90,
      colorExt: "Intermedio",
      colorInt: "Intermedio",
    },
    {
      id_detail: 2,
      nombreAbrev: "Muro ejemplo",
      valorU: 0.61,
      colorExt: "Intermedio",
      colorInt: "Intermedio",
    },
  ];

  // Datos hardcodeados para Techumbre
  const techumbreDetails = [
    {
      id_detail: 1,
      nombreAbrev: "Techo Base",
      valorU: 0.80,
      colorExt: "Intermedio",
      colorInt: "Intermedio",
    },
    {
      id_detail: 2,
      nombreAbrev: "Techo ejemplo",
      valorU: 0.38,
      colorExt: "Intermedio",
      colorInt: "Intermedio",
    },
  ];

  // Datos hardcodeados para Pisos 
  const pisosDetails = [
    {
      id_detail: 1,
      nombreAbrev: "Piso Base",
      valorU: 2.00,
      aislacion: "—",
    },
    {
      id_detail: 2,
      nombreAbrev: "Piso ejemplo",
      valorU: 3.31,
      aislacion: "—",
    },
  ];

  // Datos hardcodeados para Tipología de recinto 
  const tipologiaVentilacion = [
    {
      codigo: "ES",
      tipologia: "Espera",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "AU",
      tipologia: "Auditorio",
      caudalMin: 5.28,
      ida: "IDA3",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "BA",
      tipologia: "Baño",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "BO",
      tipologia: "Bodega",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "KI",
      tipologia: "Cafetería",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "CO",
      tipologia: "Comedores",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "PA",
      tipologia: "Pasillos",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
    {
      codigo: "OF",
      tipologia: "Oficina",
      caudalMin: 8.80,
      ida: "IDA2",
      ocupacion: "Sedentario",
      caudalImpVentNoct: "-",
    },
  ];

  // Datos hardcodeados para Tipología de recinto - Pestaña Iluminacion
  const iluminacionData = [
    {
      codigo: "ES",
      tipologia: "Espera",
      potenciaBase: 12.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 12.0,
    },
    {
      codigo: "AU",
      tipologia: "Auditorio",
      potenciaBase: 15.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 15.0,
    },
    {
      codigo: "BA",
      tipologia: "Baño",
      potenciaBase: 10.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 10.0,
    },
    {
      codigo: "BO",
      tipologia: "Bodega",
      potenciaBase: 10.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 10.0,
    },
    {
      codigo: "KI",
      tipologia: "Cafetería",
      potenciaBase: 15.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 15.0,
    },
    {
      codigo: "CO",
      tipologia: "Comedores",
      potenciaBase: 10.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 10.0,
    },
    {
      codigo: "PA",
      tipologia: "Pasillos",
      potenciaBase: 11.00,
      estrategia: "Sin estrategia",
      potenciaPropuesta: 11.0,
    },
  ];

  // Datos hardcodeados para Tipología de recinto - Pestaña Cargas internas
  const cargasData = [
    {
      codigo: "ES",
      tipologia: "Espera",
      usuarios: 4.0,
      calorLatente: 164.0,
      calorSensible: 12.0,
      equipos: "-",
      funcionamiento: "5×2",
    },
    {
      codigo: "AU",
      tipologia: "Auditorio",
      usuarios: 0.5,
      calorLatente: 82.0,
      calorSensible: 15.0,
      equipos: "-",
      funcionamiento: "5×2",
    },
    {
      codigo: "BA",
      tipologia: "Baño",
      usuarios: "-",
      calorLatente: "-",
      calorSensible: 10.0,
      equipos: "-",
      funcionamiento: "5×2",
    },
    {
      codigo: "BO",
      tipologia: "Bodega",
      usuarios: "-",
      calorLatente: "-",
      calorSensible: 10.0,
      equipos: 1.5,
      funcionamiento: "7×0",
    },
    {
      codigo: "KI",
      tipologia: "Cafetería",
      usuarios: 10.0,
      calorLatente: 147.6,
      calorSensible: 15.0,
      equipos: 50.0,
      funcionamiento: "5×2",
    },
    {
      codigo: "CO",
      tipologia: "Comedores",
      usuarios: 0.9,
      calorLatente: 131.2,
      calorSensible: 10.0,
      equipos: "-",
      funcionamiento: "5×2",
    },
    {
      codigo: "PA",
      tipologia: "Pasillos",
      usuarios: 4.0,
      calorLatente: "-",
      calorSensible: 11.0,
      equipos: "-",
      funcionamiento: "5×2",
    },
  ];

  // Datos hardcodeados para Tipología de recinto - Pestaña Horario y Clima
  const horarioData = [
    {
      codigo: "ES",
      tipologia: "Espera",
      climatizado: "Sí",
      hrsDesfase: "-",
    },
    {
      codigo: "AU",
      tipologia: "Auditorio",
      climatizado: "Sí",
      hrsDesfase: "-",
    },
    {
      codigo: "BA",
      tipologia: "Baño",
      climatizado: "No",
      hrsDesfase: "-",
    },
    {
      codigo: "BO",
      tipologia: "Bodega",
      climatizado: "No",
      hrsDesfase: "-",
    },
    {
      codigo: "KI",
      tipologia: "Cafetería",
      climatizado: "Sí",
      hrsDesfase: "-",
    },
    {
      codigo: "CO",
      tipologia: "Comedores",
      climatizado: "Sí",
      hrsDesfase: "-",
    },
    {
      codigo: "PA",
      tipologia: "Pasillos",
      climatizado: "No",
      hrsDesfase: "-",
    },
  ];

  // Función para obtener la lista de materiales (Paso 3)
  const fetchMaterialsList = async (page: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/constants/?page=${page}&per_page=100`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setMaterialsList(response.data.constants || []);
    } catch (error: any) {
      console.error("Error al obtener lista de materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error");
    }
  };

  // Función para obtener detalles constructivos (Paso 4)
  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/user/details/?section=admin`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setDetails(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener detalles:", error.response?.data || error.message);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.", "error");
    }
  };

  const getFilteredDetails = (tab: string) => {
    let section = "";
    switch (tab) {
      case "Muros":
        section = "muro";
        break;
      case "Techumbre":
        section = "techo";
        break;
      case "Pisos":
        section = "piso";
        break;
      default:
        return details;
    }
    return details.filter((d) => d.scantilon_location.toLowerCase() === section);
  };

  // Función para obtener elementos operables (Paso 5)
  const fetchElements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/elements/`;
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const response = await axios.get(url, { headers });
      setElementsList(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener elementos:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  // Funciones del Paso 3: Materiales
  const handleAddMaterial = (material: any) => {
    if (selectedMaterials.some((m) => m.id === material.id)) {
      Swal.fire("Material ya seleccionado", "Este material ya fue agregado", "info");
      return;
    }
    setSelectedMaterials([...selectedMaterials, material]);
    Swal.fire("Material agregado", `${material.atributs?.name} ha sido seleccionado.`, "success");
  };

  const handleRemoveMaterial = (materialId: number) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.id !== materialId));
    Swal.fire("Material removido", "El material ha sido eliminado de la selección", "info");
  };

  // Funciones del Paso 5: Elementos operables
  const handleAddElement = (element: any) => {
    if (selectedElements.some((el) => el.id === element.id)) {
      Swal.fire("Elemento ya seleccionado", "Este elemento ya fue agregado", "info");
      return;
    }
    setSelectedElements([...selectedElements, element]);
    Swal.fire("Elemento agregado", `${element.name_element} ha sido agregado.`, "success");
  };

  const handleRemoveElement = (elementId: number) => {
    setSelectedElements(selectedElements.filter((el) => el.id !== elementId));
    Swal.fire("Elemento removido", "El elemento ha sido eliminado de la selección", "info");
  };

  const handleCreateDoorElement = () => {
    const newDoor = {
      id: new Date().getTime(),
      type: "door",
      name_element: doorData.name_element,
      u_marco: doorData.u_marco,
      fm: doorData.fm,
      atributs: {
        u_puerta_opaca: doorData.u_puerta_opaca,
        porcentaje_vidrio: doorData.porcentaje_vidrio,
        name_ventana: doorData.name_ventana,
      },
    };
    handleAddElement(newDoor);
    Swal.fire("Puerta creada", `La puerta ${doorData.name_element} ha sido creada.`, "success");
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
  };

  const handleCreateWindowElement = () => {
    const newWindow = {
      id: new Date().getTime(),
      type: "window",
      name_element: windowData.name_element,
      u_marco: windowData.u_marco,
      fm: windowData.fm,
      atributs: {
        u_vidrio: windowData.u_vidrio,
        fs_vidrio: windowData.fs_vidrio,
        frame_type: windowData.frame_type,
        clousure_type: windowData.clousure_type,
      },
    };
    handleAddElement(newWindow);
    Swal.fire("Ventana creada", `La ventana ${windowData.name_element} ha sido creada.`, "success");
    setShowCreateWindowModal(false);
    setWindowData({
      name_element: "",
      u_vidrio: 0,
      fs_vidrio: 0,
      frame_type: "",
      clousure_type: "",
      u_marco: 0,
      fm: 0,
    });
  };

  // Función final de guardado (Paso 6)
  const handleFinalSave = () => {
    Swal.fire("Datos guardados", "La información de administración ha sido guardada", "success");
  };

  useEffect(() => {
    if (step === 3) fetchMaterialsList(1);
  }, [step]);

  useEffect(() => {
    if (step === 4) fetchDetails();
  }, [step]);

  useEffect(() => {
    if (step === 5) fetchElements();
  }, [step]);

  // Para la creación de puerta: filtrar ventanas disponibles
  const availableWindows = elementsList.filter((el) => el.type === "window");

  // Componente del sidebar
  const internalSidebarWidth = 380;
  const sidebarItemHeight = 100;
  const sidebarItemBorderSize = 1;
  const leftPadding = 50;

  const SidebarItem = ({
    stepNumber,
    iconClass,
    title,
  }: {
    stepNumber: number;
    iconClass: string;
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
            height: `${sidebarItemHeight}px`,
            border: `${sidebarItemBorderSize}px solid ${isSelected ? activeColor : inactiveColor}`,
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: `${leftPadding}px`,
            color: isSelected ? activeColor : inactiveColor,
            fontFamily: "var(--font-family-base)",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "1.3rem" }}>
            <i className={iconClass}></i>
          </span>
          <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{title}</span>
        </div>
      </li>
    );
  };

  return (
    <>
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
        <div className="mb-3">
          <h1 className="fw-bold">Administrador de Parámetros</h1>
        </div>
        <div className="card shadow w-100" style={{ overflow: "hidden" }}>
          <div className="card-body p-0">
            <div className="d-flex" style={{ alignItems: "stretch", gap: 0 }}>
              <div
                style={{
                  width: `${internalSidebarWidth}px`,
                  padding: "20px",
                  boxSizing: "border-box",
                  borderRight: "1px solid #ccc",
                }}
              >
                <ul className="nav flex-column" style={{ height: "100%" }}>
                  <SidebarItem stepNumber={3} iconClass="bi bi-file-text" title="Materiales" />
                  <SidebarItem stepNumber={4} iconClass="bi bi-tools" title="Detalles constructivos" />
                  <SidebarItem stepNumber={5} iconClass="bi bi-house" title="Elementos operables" />
                  <SidebarItem stepNumber={6} iconClass="bi bi-bar-chart" title="Tipología de recinto" />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "20px" }}>
                {step === 3 && (
                  <>
                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th style={{ color: "var(--primary-color)" }}>Nombre Material</th>
                            <th style={{ color: "var(--primary-color)" }}>Conductividad (W/m2K)</th>
                            <th style={{ color: "var(--primary-color)" }}>Calor específico (J/kgK)</th>
                            <th style={{ color: "var(--primary-color)" }}>Densidad (kg/m3)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialsList.map((mat, idx) => {
                            const atributos = mat.atributs || {};
                            return (
                              <tr key={idx}>
                                <td>{atributos.name}</td>
                                <td>{atributos.conductivity}</td>
                                <td>{atributos["specific heat"]}</td>
                                <td>{atributos.density}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="save" onClick={() => setStep(4)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {["Detalles", "Muros", "Techumbre", "Pisos"].map((tab) => (
                        <li key={tab} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color: tabDetailSection === tab ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabDetailSection === tab ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => setTabDetailSection(tab)}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border p-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {(tabDetailSection === "Detalles"
                        ? details
                        : tabDetailSection === "Muros"
                        ? murosDetails
                        : tabDetailSection === "Techumbre"
                        ? techumbreDetails
                        : tabDetailSection === "Pisos"
                        ? pisosDetails
                        : tabDetailSection === "ventilacion"
                        ? tipologiaVentilacion
                        : tabDetailSection === "iluminacion"
                        ? iluminacionData
                        : tabDetailSection === "cargas"
                        ? cargasData
                        : tabDetailSection === "horario"
                        ? horarioData
                        : getFilteredDetails(tabDetailSection)
                      ).length > 0 ? (
                        <>
                          {tabDetailSection === "Detalles" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Ubicación Detalle</th>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Detalle</th>
                                  <th style={{ color: "var(--primary-color)" }}>Capas de interior a exterior</th>
                                  <th style={{ color: "var(--primary-color)" }}>Espesor capa (cm)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {details.map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.scantilon_location}</td>
                                    <td>{det.name_detail}</td>
                                    <td>{det.capas || det.material}</td>
                                    <td>{det.layer_thickness}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "Muros" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Abreviado</th>
                                  <th style={{ color: "var(--primary-color)" }}>Valor U [W/m2K]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Exterior</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Interior</th>
                                </tr>
                              </thead>
                              <tbody>
                                {murosDetails.map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.nombreAbrev}</td>
                                    <td>{det.valorU}</td>
                                    <td>{det.colorExt}</td>
                                    <td>{det.colorInt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "Techumbre" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Abreviado</th>
                                  <th style={{ color: "var(--primary-color)" }}>Valor U [W/m2K]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Exterior</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Interior</th>
                                </tr>
                              </thead>
                              <tbody>
                                {techumbreDetails.map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.nombreAbrev}</td>
                                    <td>{det.valorU}</td>
                                    <td>{det.colorExt}</td>
                                    <td>{det.colorInt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "Pisos" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Abreviado</th>
                                  <th style={{ color: "var(--primary-color)" }}>Valor U [W/m2K]</th>
                                  <th style={{ color: "var(--primary-color)" }}>
                                    Aislación bajo piso [W/mK] e Aisl [cm]
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {pisosDetails.map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.nombreAbrev}</td>
                                    <td>{det.valorU}</td>
                                    <td>{det.aislacion}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "ventilacion" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Caudal Min Salubridad R-pers [L/s]</th>
                                  <th style={{ color: "var(--primary-color)" }}>IDA</th>
                                  <th style={{ color: "var(--primary-color)" }}>Ocupación</th>
                                  <th style={{ color: "var(--primary-color)" }}>Caudal Imp Vent Noct [1/h]</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tipologiaVentilacion.map((rec, idx) => (
                                  <tr key={idx}>
                                    <td>{rec.codigo}</td>
                                    <td>{rec.tipologia}</td>
                                    <td>{rec.caudalMin}</td>
                                    <td>{rec.ida}</td>
                                    <td>{rec.ocupacion}</td>
                                    <td>{rec.caudalImpVentNoct}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "iluminacion" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Potencia Base [W/m2]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Estrategia</th>
                                  <th style={{ color: "var(--primary-color)" }}>Potencia Propuesta [W/m2]</th>
                                </tr>
                              </thead>
                              <tbody>
                                {iluminacionData.map((rec, idx) => (
                                  <tr key={idx}>
                                    <td>{rec.codigo}</td>
                                    <td>{rec.tipologia}</td>
                                    <td>{rec.potenciaBase}</td>
                                    <td>{rec.estrategia}</td>
                                    <td>{rec.potenciaPropuesta}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "cargas" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Usuarios [m2/pers]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Calor Latente [W/pers]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Calor Sensible [W/pers]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Equipos [W/m2]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Funcionamiento Semanal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cargasData.map((rec, idx) => (
                                  <tr key={idx}>
                                    <td>{rec.codigo}</td>
                                    <td>{rec.tipologia}</td>
                                    <td>{rec.usuarios}</td>
                                    <td>{rec.calorLatente}</td>
                                    <td>{rec.calorSensible}</td>
                                    <td>{rec.equipos}</td>
                                    <td>{rec.funcionamiento}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "horario" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                                  <th style={{ color: "var(--primary-color)" }}>Climatizado Si/No</th>
                                  <th style={{ color: "var(--primary-color)" }}>Hrs Desfase Clima (Inv)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {horarioData.map((rec, idx) => (
                                  <tr key={idx}>
                                    <td>{rec.codigo}</td>
                                    <td>{rec.tipologia}</td>
                                    <td>{rec.climatizado}</td>
                                    <td>{rec.hrsDesfase}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : null}
                        </>
                      ) : (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th>No hay datos</th>
                            </tr>
                          </thead>
                        </table>
                      )}
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(5)} />
                      <CustomButton variant="save" onClick={handleFinalSave}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {["Ventanas", "Puertas"].map((tab) => (
                        <li key={tab} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color: tabElementosOperables === tab.toLowerCase() ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabElementosOperables === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => {
                              setTabElementosOperables(tab.toLowerCase());
                              setModalElementType(tab.toLowerCase());
                            }}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                      <table className="table table-bordered table-striped">
                        <thead>
                          {tabElementosOperables === "ventanas" ? (
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)" }}>U Vidrio [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FS Vidrio []</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipo Cierre</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipo Marco</th>
                              <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                            </tr>
                          ) : (
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)" }}>U Puerta opaca [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Ventana</th>
                              <th style={{ color: "var(--primary-color)" }}>% Vidrio</th>
                              <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {elementsList
                            .filter((el) => el.type === (tabElementosOperables === "ventanas" ? "window" : "door"))
                            .map((el: any, idx) => {
                              if (tabElementosOperables === "ventanas") {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs?.u_vidrio}</td>
                                    <td>{el.atributs?.fs_vidrio}</td>
                                    <td>{el.atributs?.clousure_type}</td>
                                    <td>{el.atributs?.frame_type}</td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                  </tr>
                                );
                              } else {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs?.u_puerta_opaca}</td>
                                    <td>{el.atributs?.name_ventana}</td>
                                    <td>
                                      {el.atributs?.porcentaje_vidrio !== undefined
                                        ? (el.atributs.porcentaje_vidrio * 100).toFixed(0) + "%"
                                        : "0%"}
                                    </td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                  </tr>
                                );
                              }
                            })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(4)} />
                      <CustomButton variant="save" onClick={() => setStep(6)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
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
                              color: tabDetailSection === tab.key ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabDetailSection === tab.key ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => setTabDetailSection(tab.key)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content border border-top-0 p-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {tabDetailSection === "ventilacion" ? (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Caudal Min Salubridad R-pers [L/s]</th>
                              <th style={{ color: "var(--primary-color)" }}>IDA</th>
                              <th style={{ color: "var(--primary-color)" }}>Ocupación</th>
                              <th style={{ color: "var(--primary-color)" }}>Caudal Imp Vent Noct [1/h]</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tipologiaVentilacion.map((rec, idx) => (
                              <tr key={idx}>
                                <td>{rec.codigo}</td>
                                <td>{rec.tipologia}</td>
                                <td>{rec.caudalMin}</td>
                                <td>{rec.ida}</td>
                                <td>{rec.ocupacion}</td>
                                <td>{rec.caudalImpVentNoct}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : tabDetailSection === "iluminacion" ? (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Potencia Base [W/m2]</th>
                              <th style={{ color: "var(--primary-color)" }}>Estrategia</th>
                              <th style={{ color: "var(--primary-color)" }}>Potencia Propuesta [W/m2]</th>
                            </tr>
                          </thead>
                          <tbody>
                            {iluminacionData.map((rec, idx) => (
                              <tr key={idx}>
                                <td>{rec.codigo}</td>
                                <td>{rec.tipologia}</td>
                                <td>{rec.potenciaBase}</td>
                                <td>{rec.estrategia}</td>
                                <td>{rec.potenciaPropuesta}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : tabDetailSection === "cargas" ? (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Usuarios [m2/pers]</th>
                              <th style={{ color: "var(--primary-color)" }}>Calor Latente [W/pers]</th>
                              <th style={{ color: "var(--primary-color)" }}>Calor Sensible [W/pers]</th>
                              <th style={{ color: "var(--primary-color)" }}>Equipos [W/m2]</th>
                              <th style={{ color: "var(--primary-color)" }}>Funcionamiento Semanal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cargasData.map((rec, idx) => (
                              <tr key={idx}>
                                <td>{rec.codigo}</td>
                                <td>{rec.tipologia}</td>
                                <td>{rec.usuarios}</td>
                                <td>{rec.calorLatente}</td>
                                <td>{rec.calorSensible}</td>
                                <td>{rec.equipos}</td>
                                <td>{rec.funcionamiento}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : tabDetailSection === "horario" ? (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Código de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipología de Recinto</th>
                              <th style={{ color: "var(--primary-color)" }}>Climatizado Si/No</th>
                              <th style={{ color: "var(--primary-color)" }}>Hrs Desfase Clima (Inv)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {horarioData.map((rec, idx) => (
                              <tr key={idx}>
                                <td>{rec.codigo}</td>
                                <td>{rec.tipologia}</td>
                                <td>{rec.climatizado}</td>
                                <td>{rec.hrsDesfase}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : tabDetailSection === "horario" ? (
                        <p>No hay datos para esta pestaña.</p>
                      ) : (
                        <p>No hay datos para esta pestaña.</p>
                      )}
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(5)} />
                      <CustomButton variant="save" onClick={handleFinalSave}>
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
        /* Estilos para centrar tablas */
        .table th,
        .table td {
          text-align: center;
          vertical-align: middle;
        }
        /* Filas alternadas */
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

export default AdministrationPage;
