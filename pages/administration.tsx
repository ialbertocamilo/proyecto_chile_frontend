import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import axios, { AxiosResponse } from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";

// Interfaces para tipar la información
interface MaterialAttributes {
  name?: string;
  conductivity?: number;
  specific_heat?: number;
  density?: number;
}

interface Material {
  id: number;
  atributs?: MaterialAttributes;
  name?: string;
  type?: string;
  is_deleted?: boolean;
  create_status?: string;
}

interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail?: string;
  capas?: string;
  material?: string;
  layer_thickness?: number;
}

interface ElementAttributesDoor {
  u_puerta_opaca: number;
  porcentaje_vidrio: number;
  name_ventana: string;
}

interface ElementAttributesWindow {
  u_vidrio: number;
  fs_vidrio: number;
  frame_type: string;
  clousure_type: string;
}

type ElementAttributes = ElementAttributesDoor | ElementAttributesWindow;

interface Element {
  id: number;
  type: "door" | "window";
  name_element: string;
  u_marco: number;
  fm: number;
  atributs: ElementAttributes;
}

const handleFinalSave = (): void => {
  Swal.fire("Datos guardados", "La información de administración ha sido guardada", "success");
};

const AdministrationPage: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState("300px");
  // Steps: 3=Materiales, 4=Detalles, 5=Elementos, 6=Tipología de recinto
  const [step, setStep] = useState<number>(3);

  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [details, setDetails] = useState<Detail[]>([]);
  const [tabDetailSection, setTabDetailSection] = useState("Techumbre");

  const [elementsList, setElementsList] = useState<Element[]>([]);
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");

  // Datos hardcodeados para ejemplos:
  const murosDetails = [
    { id_detail: 1, nombreAbrev: "Muro Base", valorU: 2.90, colorExt: "Intermedio", colorInt: "Intermedio" },
    { id_detail: 2, nombreAbrev: "Muro ejemplo", valorU: 0.61, colorExt: "Intermedio", colorInt: "Intermedio" },
  ];

  const techumbreDetails = [
    { id_detail: 1, nombreAbrev: "Techo Base", valorU: 0.80, colorExt: "Intermedio", colorInt: "Intermedio" },
    { id_detail: 2, nombreAbrev: "Techo ejemplo", valorU: 0.38, colorExt: "Intermedio", colorInt: "Intermedio" },
  ];

  const pisosDetails = [
    { id_detail: 1, nombreAbrev: "Piso Base", valorU: 2.00, aislacion: "—" },
    { id_detail: 2, nombreAbrev: "Piso ejemplo", valorU: 3.31, aislacion: "—" },
  ];

  const tipologiaVentilacion = [
    { codigo: "ES", tipologia: "Espera", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "AU", tipologia: "Auditorio", caudalMin: 5.28, ida: "IDA3", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "BA", tipologia: "Baño", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "BO", tipologia: "Bodega", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "KI", tipologia: "Cafetería", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "CO", tipologia: "Comedores", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "PA", tipologia: "Pasillos", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
    { codigo: "OF", tipologia: "Oficina", caudalMin: 8.80, ida: "IDA2", ocupacion: "Sedentario", caudalImpVentNoct: "-" },
  ];

  const iluminacionData = [
    { codigo: "ES", tipologia: "Espera", potenciaBase: 12.0, estrategia: "Sin estrategia", potenciaPropuesta: 12.0 },
    { codigo: "AU", tipologia: "Auditorio", potenciaBase: 15.0, estrategia: "Sin estrategia", potenciaPropuesta: 15.0 },
    { codigo: "BA", tipologia: "Baño", potenciaBase: 10.0, estrategia: "Sin estrategia", potenciaPropuesta: 10.0 },
    { codigo: "BO", tipologia: "Bodega", potenciaBase: 10.0, estrategia: "Sin estrategia", potenciaPropuesta: 10.0 },
    { codigo: "KI", tipologia: "Cafetería", potenciaBase: 15.0, estrategia: "Sin estrategia", potenciaPropuesta: 15.0 },
    { codigo: "CO", tipologia: "Comedores", potenciaBase: 10.0, estrategia: "Sin estrategia", potenciaPropuesta: 10.0 },
    { codigo: "PA", tipologia: "Pasillos", potenciaBase: 11.0, estrategia: "Sin estrategia", potenciaPropuesta: 11.0 },
  ];

  const cargasData = [
    { codigo: "ES", tipologia: "Espera", usuarios: 4.0, calorLatente: 164.0, calorSensible: 12.0, equipos: "-", funcionamiento: "5×2" },
    { codigo: "AU", tipologia: "Auditorio", usuarios: 0.5, calorLatente: 82.0, calorSensible: 15.0, equipos: "-", funcionamiento: "5×2" },
    { codigo: "BA", tipologia: "Baño", usuarios: "-", calorLatente: "-", calorSensible: 10.0, equipos: "-", funcionamiento: "5×2" },
    { codigo: "BO", tipologia: "Bodega", usuarios: "-", calorLatente: "-", calorSensible: 10.0, equipos: 1.5, funcionamiento: "7×0" },
    { codigo: "KI", tipologia: "Cafetería", usuarios: 10.0, calorLatente: 147.6, calorSensible: 15.0, equipos: 50.0, funcionamiento: "5×2" },
    { codigo: "CO", tipologia: "Comedores", usuarios: 0.9, calorLatente: 131.2, calorSensible: 10.0, equipos: "-", funcionamiento: "5×2" },
    { codigo: "PA", tipologia: "Pasillos", usuarios: 4.0, calorLatente: "-", calorSensible: 11.0, equipos: "-", funcionamiento: "5×2" },
  ];

  const horarioData = [
    { codigo: "ES", tipologia: "Espera", climatizado: "Sí", hrsDesfase: "-" },
    { codigo: "AU", tipologia: "Auditorio", climatizado: "Sí", hrsDesfase: "-" },
    { codigo: "BA", tipologia: "Baño", climatizado: "No", hrsDesfase: "-" },
    { codigo: "BO", tipologia: "Bodega", climatizado: "No", hrsDesfase: "-" },
    { codigo: "KI", tipologia: "Cafetería", climatizado: "Sí", hrsDesfase: "-" },
    { codigo: "CO", tipologia: "Comedores", climatizado: "Sí", hrsDesfase: "-" },
    { codigo: "PA", tipologia: "Pasillos", climatizado: "No", hrsDesfase: "-" },
  ];

  // ----------------------------
  // Funciones para obtener datos (GET)
  // ----------------------------
  const fetchMaterialsList = async (page: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/constants/?page=${page}&per_page=100`;
      const headers = { Authorization: `Bearer ${token}` };
      const response: AxiosResponse<{ constants: Material[] }> = await axios.get(url, { headers });
      setMaterialsList(response.data.constants || []);
    } catch (error: unknown) {
      console.error("Error al obtener lista de materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error");
    }
  };

  const fetchDetails = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/details`;
      const headers = { Authorization: `Bearer ${token}` };
      const response: AxiosResponse<Detail[]> = await axios.get(url, { headers });
      setDetails(response.data || []);
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.", "error");
    }
  };

  const fetchElements = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/elements/`;
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const response: AxiosResponse<Element[]> = await axios.get(url, { headers });
      setElementsList(response.data || []);
    } catch (error: unknown) {
      console.error("Error al obtener elementos:", error);
      Swal.fire("Error", "Error al obtener elementos. Ver consola.", "error");
    }
  };

  // ----------------------------
  // Estados y funciones para creación de nuevos ítems:
  // ----------------------------
  // Para Materiales (Step 3)
  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<MaterialAttributes>({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });

  const handleCreateMaterial = async () => {
    // Validación básica: asegúrate de que los campos tengan valor
    if (!newMaterial.name || !newMaterial.conductivity || !newMaterial.specific_heat || !newMaterial.density) {
      Swal.fire("Campos incompletos", "Debes completar todos los campos", "warning");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/constants/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      // Construimos el payload según el ejemplo solicitado
      const payload = {
        atributs: {
          name: newMaterial.name,
          density: newMaterial.density,
          conductivity: newMaterial.conductivity,
          specific_heat: newMaterial.specific_heat,
        },
        name: "materials", // siempre materials
        type: "definition materials" // siempre definition materials
      };

      console.log("Payload a enviar:", JSON.stringify(payload, null, 2));

      const response = await axios.post(url, payload, { headers });
      console.log("Respuesta del servidor:", JSON.stringify(response.data, null, 2));

      Swal.fire("Material creado", "El material fue creado correctamente", "success");
      setShowCreateMaterialModal(false);
      setNewMaterial({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
      // Recargamos la lista de materiales
      await fetchMaterialsList(1);
    } catch (error: any) {
      console.error("Error al crear material:", error.response || error);
      Swal.fire("Error", "No se pudo crear el material", "error");
    }
  };

  // Para Detalles (Step 4)
  const [showCreateDetailModal, setShowCreateDetailModal] = useState(false);
  const [newDetail, setNewDetail] = useState({
    scantilon_location: "",
    name_detail: "",
    capas: "",
    layer_thickness: 0,
  });

  const handleCreateDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/details/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.post(url, newDetail, { headers });
      Swal.fire("Detalle creado", "El detalle fue creado correctamente", "success");
      setShowCreateDetailModal(false);
      setNewDetail({ scantilon_location: "", name_detail: "", capas: "", layer_thickness: 0 });
      // Actualizamos la lista de detalles:
      await fetchDetails();
    } catch (error: unknown) {
      console.error("Error al crear detalle:", error);
      Swal.fire("Error", "No se pudo crear el detalle", "error");
    }
  };

  // Para Elementos operables (Step 5)
  const [showCreateElementModal, setShowCreateElementModal] = useState(false);
  const [newWindow, setNewWindow] = useState({
    name_element: "",
    u_marco: 0,
    fm: 0,
    u_vidrio: 0,
    fs_vidrio: 0,
    frame_type: "",
    clousure_type: "",
  });
  const [newDoor, setNewDoor] = useState({
    name_element: "",
    u_marco: 0,
    fm: 0,
    u_puerta_opaca: 0,
    porcentaje_vidrio: 0,
    name_ventana: "",
  });

  const handleCreateElement = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const url = `${constantUrlApiEndpoint}/elements/create`;
      let payload;
      if (tabElementosOperables === "ventanas") {
        payload = {
          type: "window",
          name_element: newWindow.name_element,
          u_marco: newWindow.u_marco,
          fm: newWindow.fm,
          atributs: {
            u_vidrio: newWindow.u_vidrio,
            fs_vidrio: newWindow.fs_vidrio,
            frame_type: newWindow.frame_type,
            clousure_type: newWindow.clousure_type,
          },
        };
      } else {
        payload = {
          type: "door",
          name_element: newDoor.name_element,
          u_marco: newDoor.u_marco,
          fm: newDoor.fm,
          atributs: {
            u_puerta_opaca: newDoor.u_puerta_opaca,
            porcentaje_vidrio: newDoor.porcentaje_vidrio,
            name_ventana: newDoor.name_ventana,
          },
        };
      }
      await axios.post(url, payload, { headers });
      Swal.fire("Elemento creado", "El elemento fue creado correctamente", "success");
      setShowCreateElementModal(false);
      setNewWindow({ name_element: "", u_marco: 0, fm: 0, u_vidrio: 0, fs_vidrio: 0, frame_type: "", clousure_type: "" });
      setNewDoor({ name_element: "", u_marco: 0, fm: 0, u_puerta_opaca: 0, porcentaje_vidrio: 0, name_ventana: "" });
      // Actualizamos la lista de elementos:
      await fetchElements();
    } catch (error: unknown) {
      console.error("Error al crear elemento:", error);
      Swal.fire("Error", "No se pudo crear el elemento", "error");
    }
  };

  // ----------------------------
  // Efectos para cargar datos según step:
  // ----------------------------
  useEffect(() => {
    if (step === 3) fetchMaterialsList(1);
  }, [step]);

  useEffect(() => {
    if (step === 4) fetchDetails();
  }, [step]);

  useEffect(() => {
    if (step === 5) fetchElements();
  }, [step]);

  // ----------------------------
  // Sidebar
  // ----------------------------
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

  // ----------------------------
  // Renderizado principal
  // ----------------------------
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
                {/* Step 3: Materiales */}
                {step === 3 && (
                  <>
                    <div className="table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Nombre Material</th>
                            <th>Conductividad (W/m2K)</th>
                            <th>Calor específico (J/kgK)</th>
                            <th>Densidad (kg/m3)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialsList.map((mat: Material, idx) => {
                            const atributos = mat.atributs || {};
                            return (
                              <tr key={idx}>
                                <td>{atributos.name}</td>
                                <td>{atributos.conductivity}</td>
                                <td>{atributos.specific_heat}</td>
                                <td>{atributos.density}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="save" onClick={() => setShowCreateMaterialModal(true)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Step 4: Detalles constructivos */}
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
                    <div className="border p-3 table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {tabDetailSection === "Detalles" ? (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th>Ubicación Detalle</th>
                              <th>Nombre Detalle</th>
                              <th>Capas / Material</th>
                              <th>Espesor capa (cm)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.map((det: Detail) => (
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
                              <th>Nombre Abreviado</th>
                              <th>Valor U [W/m2K]</th>
                              <th>Color Exterior</th>
                              <th>Color Interior</th>
                            </tr>
                          </thead>
                          <tbody>
                            {murosDetails.map((det) => (
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
                              <th>Nombre Abreviado</th>
                              <th>Valor U [W/m2K]</th>
                              <th>Color Exterior</th>
                              <th>Color Interior</th>
                            </tr>
                          </thead>
                          <tbody>
                            {techumbreDetails.map((det) => (
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
                              <th>Nombre Abreviado</th>
                              <th>Valor U [W/m2K]</th>
                              <th>Aislación / Aisl [cm]</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pisosDetails.map((det) => (
                              <tr key={det.id_detail}>
                                <td>{det.nombreAbrev}</td>
                                <td>{det.valorU}</td>
                                <td>{det.aislacion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No hay datos para esta pestaña.</p>
                      )}
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(5)} />
                      <CustomButton variant="save" onClick={() => setShowCreateDetailModal(true)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Step 5: Elementos operables */}
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
                            onClick={() => setTabElementosOperables(tab.toLowerCase())}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      <table className="table table-bordered table-striped">
                        <thead>
                          {tabElementosOperables === "ventanas" ? (
                            <tr>
                              <th>Nombre Elemento</th>
                              <th>U Vidrio [W/m2K]</th>
                              <th>FS Vidrio</th>
                              <th>Tipo Cierre</th>
                              <th>Tipo Marco</th>
                              <th>U Marco [W/m2K]</th>
                              <th>FM [%]</th>
                            </tr>
                          ) : (
                            <tr>
                              <th>Nombre Elemento</th>
                              <th>U Puerta opaca [W/m2K]</th>
                              <th>Nombre Ventana</th>
                              <th>% Vidrio</th>
                              <th>U Marco [W/m2K]</th>
                              <th>FM [%]</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {elementsList
                            .filter((el) => el.type === (tabElementosOperables === "ventanas" ? "window" : "door"))
                            .map((el: Element, idx) => {
                              if (tabElementosOperables === "ventanas") {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{(el.atributs as ElementAttributesWindow).u_vidrio}</td>
                                    <td>{(el.atributs as ElementAttributesWindow).fs_vidrio}</td>
                                    <td>{(el.atributs as ElementAttributesWindow).clousure_type}</td>
                                    <td>{(el.atributs as ElementAttributesWindow).frame_type}</td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                  </tr>
                                );
                              } else {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{(el.atributs as ElementAttributesDoor).u_puerta_opaca}</td>
                                    <td>{(el.atributs as ElementAttributesDoor).name_ventana}</td>
                                    <td>
                                      {(el.atributs as ElementAttributesDoor).porcentaje_vidrio !== undefined
                                        ? ((el.atributs as ElementAttributesDoor).porcentaje_vidrio * 100).toFixed(0) + "%"
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
                      <CustomButton variant="save" onClick={() => setShowCreateElementModal(true)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Step 6: Tipología de recinto */}
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
                    <div className="tab-content border border-top-0 p-3 table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {tabDetailSection === "ventilacion" ? (
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th>Código de Recinto</th>
                              <th>Tipología de Recinto</th>
                              <th>Caudal Min Salubridad R-pers [L/s]</th>
                              <th>IDA</th>
                              <th>Ocupación</th>
                              <th>Caudal Imp Vent Noct [1/h]</th>
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
                              <th>Código de Recinto</th>
                              <th>Tipología de Recinto</th>
                              <th>Potencia Base [W/m2]</th>
                              <th>Estrategia</th>
                              <th>Potencia Propuesta [W/m2]</th>
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
                              <th>Código de Recinto</th>
                              <th>Tipología de Recinto</th>
                              <th>Usuarios [m2/pers]</th>
                              <th>Calor Latente [W/pers]</th>
                              <th>Calor Sensible [W/pers]</th>
                              <th>Equipos [W/m2]</th>
                              <th>Funcionamiento Semanal</th>
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
                              <th>Código de Recinto</th>
                              <th>Tipología de Recinto</th>
                              <th>Climatizado Si/No</th>
                              <th>Hrs Desfase Clima (Inv)</th>
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

      {/* Modal para crear Material (Step 3) */}
      {showCreateMaterialModal && (
        <div className="modal-overlay" onClick={() => setShowCreateMaterialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateMaterialModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Crear Material</h4>
            <div className="mb-3">
              <label className="form-label">Nombre del Material</label>
              <input
                type="text"
                className="form-control"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Conductividad (W/m2K)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterial.conductivity || 0}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, conductivity: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Calor específico (J/kgK)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterial.specific_heat || 0}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, specific_heat: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Densidad (kg/m3)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterial.density || 0}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, density: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="backIcon" onClick={() => setShowCreateMaterialModal(false)} />
              <CustomButton variant="save" onClick={handleCreateMaterial}>
                Guardar Material
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear Detalle (Step 4) */}
      {showCreateDetailModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateDetailModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Crear Detalle Constructivo</h4>
            <div className="mb-3">
              <label className="form-label">Ubicación Detalle</label>
              <input
                type="text"
                className="form-control"
                value={newDetail.scantilon_location}
                onChange={(e) => setNewDetail((prev) => ({ ...prev, scantilon_location: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre Detalle</label>
              <input
                type="text"
                className="form-control"
                value={newDetail.name_detail}
                onChange={(e) => setNewDetail((prev) => ({ ...prev, name_detail: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Capas / Material</label>
              <input
                type="text"
                className="form-control"
                value={newDetail.capas}
                onChange={(e) => setNewDetail((prev) => ({ ...prev, capas: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Espesor capa (cm)</label>
              <input
                type="number"
                className="form-control"
                value={newDetail.layer_thickness || 0}
                onChange={(e) => setNewDetail((prev) => ({ ...prev, layer_thickness: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="backIcon" onClick={() => setShowCreateDetailModal(false)} />
              <CustomButton variant="save" onClick={handleCreateDetail}>
                Guardar Detalle
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear Elemento Operable (Step 5) */}
      {showCreateElementModal && (
        <div className="modal-overlay" onClick={() => setShowCreateElementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateElementModal(false)}>
              &times;
            </button>
            {tabElementosOperables === "ventanas" ? (
              <>
                <h4 className="mb-3">Crear Ventana</h4>
                <div className="mb-3">
                  <label className="form-label">Nombre Elemento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newWindow.name_element}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, name_element: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Vidrio [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.u_vidrio}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, u_vidrio: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">FS Vidrio</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.fs_vidrio}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, fs_vidrio: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Cierre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newWindow.clousure_type}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, clousure_type: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Marco</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newWindow.frame_type}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, frame_type: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Marco [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.u_marco}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">FM (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.fm}
                    onChange={(e) => setNewWindow((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))}
                  />
                </div>
              </>
            ) : (
              <>
                <h4 className="mb-3">Crear Puerta</h4>
                <div className="mb-3">
                  <label className="form-label">Nombre Elemento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDoor.name_element}
                    onChange={(e) => setNewDoor((prev) => ({ ...prev, name_element: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Puerta opaca [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.u_puerta_opaca}
                    onChange={(e) => setNewDoor((prev) => ({ ...prev, u_puerta_opaca: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre Ventana</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDoor.name_ventana}
                    onChange={(e) => setNewDoor((prev) => ({ ...prev, name_ventana: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">% Vidrio</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.porcentaje_vidrio}
                    onChange={(e) => setNewDoor((prev) => ({ ...prev, porcentaje_vidrio: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Marco [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.u_marco}
                    onChange={(e) => setNewDoor((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">FM (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.fm}
                    onChange={(e) => setNewDoor((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))}
                  />
                </div>
              </>
            )}
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="backIcon" onClick={() => setShowCreateElementModal(false)} />
              <CustomButton variant="save" onClick={handleCreateElement}>
                Guardar Elemento
              </CustomButton>
            </div>
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
        /* Encabezados fijos */
        .table thead th {
          position: sticky;
          top: 0;
          background-color: #fff;
          z-index: 2;
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

export default AdministrationPage;
