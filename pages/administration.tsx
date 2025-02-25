import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import axios, { AxiosResponse } from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import useAuth from "../src/hooks/useAuth";

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
  // Aquí se usará "capas" para almacenar el id del material seleccionado
  capas?: number;
  layer_thickness?: number;
}

interface ElementAttributesDoor {
  u_puerta_opaca: number;
  porcentaje_vidrio: number;
  ventana_id: number;
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

const AdministrationPage: React.FC = () => {
  // Validar la sesión
  useAuth();
  console.log("[AdministrationPage] Página cargada y sesión validada.");

  const [sidebarWidth, setSidebarWidth] = useState("300px");
  // Steps: 3=Materiales, 4=Detalles, 5=Elementos operables
  const [step, setStep] = useState<number>(3);

  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [details, setDetails] = useState<Detail[]>([]);
  const [elementsList, setElementsList] = useState<Element[]>([]);
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");

  // Función para cerrar sesión y redirigir al login
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ----------------------------
  // Funciones para obtener datos (GET) envueltas en useCallback
  // ----------------------------
  const fetchMaterialsList = useCallback(async (page: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        handleLogout();
        return;
      }
      const url = `${constantUrlApiEndpoint}/constants/?page=${page}&per_page=100`;
      const headers = { Authorization: `Bearer ${token}` };
      const response: AxiosResponse<{ constants: Material[] }> = await axios.get(url, { headers });
      console.log("[fetchMaterialsList] Materiales recibidos:", response.data);
      setMaterialsList(response.data.constants || []);
    } catch (error: unknown) {
      console.error("[fetchMaterialsList] Error al obtener lista de materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error").then(() => {
        handleLogout();
      });
    }
  }, []);

  const fetchDetails = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        handleLogout();
        return;
      }
      const url = `${constantUrlApiEndpoint}/details`;
      const headers = { Authorization: `Bearer ${token}` };
      const response: AxiosResponse<Detail[]> = await axios.get(url, { headers });
      console.log("[fetchDetails] Detalles recibidos:", response.data);
      setDetails(response.data || []);
    } catch (error: unknown) {
      console.error("[fetchDetails] Error al obtener detalles:", error);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.", "error").then(() => {
        handleLogout();
      });
    }
  }, []);

  const fetchElements = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        handleLogout();
        return;
      }
      const url = `${constantUrlApiEndpoint}/elements/`;
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const response: AxiosResponse<Element[]> = await axios.get(url, { headers });
      console.log("[fetchElements] Elementos recibidos:", response.data);
      setElementsList(response.data || []);
    } catch (error: unknown) {
      console.error("[fetchElements] Error al obtener elementos:", error);
      Swal.fire("Error", "Error al obtener elementos. Ver consola.", "error").then(() => {
        handleLogout();
      });
    }
  }, []);

  // ----------------------------
  // Estados y funciones para creación de nuevos ítems
  // ----------------------------
  // Materiales (Step 3)
  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<MaterialAttributes>({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });

  const handleCreateMaterial = async () => {
    if (!newMaterial.name || !newMaterial.conductivity || !newMaterial.specific_heat || !newMaterial.density) {
      Swal.fire("Campos incompletos", "Debes completar todos los campos", "warning");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        handleLogout();
        return;
      }
      const url = `${constantUrlApiEndpoint}/constants/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const payload = {
        atributs: {
          name: newMaterial.name,
          density: newMaterial.density,
          conductivity: newMaterial.conductivity,
          specific_heat: newMaterial.specific_heat,
        },
        name: "materials",
        type: "definition materials",
      };

      console.log("[handleCreateMaterial] Payload a enviar:", JSON.stringify(payload, null, 2));
      const response = await axios.post(url, payload, { headers });
      console.log("[handleCreateMaterial] Respuesta del servidor:", JSON.stringify(response.data, null, 2));
      Swal.fire("Material creado", "El material fue creado correctamente", "success");
      setShowCreateMaterialModal(false);
      setNewMaterial({ name: "", conductivity: 0, specific_heat: 0, density: 0 });
      await fetchMaterialsList(1);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("[handleCreateMaterial] Error al crear material:", error.response || error);
      } else {
        console.error("[handleCreateMaterial] Error al crear material:", error);
      }
      Swal.fire("Error", "No se pudo crear el material", "error").then(() => {
        handleLogout();
      });
    }
  };

  // Detalles (Step 4)
  const [showCreateDetailModal, setShowCreateDetailModal] = useState(false);
  const [newDetail, setNewDetail] = useState({
    scantilon_location: "",
    name_detail: "",
    capas: 0,
    layer_thickness: 0,
  });

  const handleCreateDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        handleLogout();
        return;
      }
      const url = `${constantUrlApiEndpoint}/details/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.post(url, newDetail, { headers });
      Swal.fire("Detalle creado", "El detalle fue creado correctamente", "success");
      setShowCreateDetailModal(false);
      setNewDetail({ scantilon_location: "", name_detail: "", capas: 0, layer_thickness: 0 });
      await fetchDetails();
    } catch (error: unknown) {
      console.error("[handleCreateDetail] Error al crear detalle:", error);
      Swal.fire("Error", "No se pudo crear el detalle", "error").then(() => {
        handleLogout();
      });
    }
  };

  // Elementos operables (Step 5)
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
    ventana_id: 0,
  });

  const handleCreateElement = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        handleLogout();
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
            ventana_id: newDoor.ventana_id,
            name_ventana:
              windowsList.find((win) => win.id === newDoor.ventana_id)?.name_element || "",
            u_puerta_opaca: newDoor.u_puerta_opaca,
            porcentaje_vidrio: newDoor.porcentaje_vidrio,
          },
        };
      }
      await axios.post(url, payload, { headers });
      Swal.fire("Elemento creado", "El elemento fue creado correctamente", "success");
      setShowCreateElementModal(false);
      setNewWindow({ name_element: "", u_marco: 0, fm: 0, u_vidrio: 0, fs_vidrio: 0, frame_type: "", clousure_type: "" });
      setNewDoor({ name_element: "", u_marco: 0, fm: 0, u_puerta_opaca: 0, porcentaje_vidrio: 0, ventana_id: 0 });
      await fetchElements();
    } catch (error: unknown) {
      console.error("[handleCreateElement] Error al crear elemento:", error);
      Swal.fire("Error", "No se pudo crear el elemento", "error").then(() => {
        handleLogout();
      });
    }
  };

  // ----------------------------
  // Efectos para cargar datos según step
  // ----------------------------
  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList(1);
    }
  }, [step, fetchMaterialsList]);

  useEffect(() => {
    if (step === 4) {
      fetchDetails();
    }
  }, [step, fetchDetails]);

  useEffect(() => {
    if (step === 5) {
      fetchElements();
    }
  }, [step, fetchElements]);

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
          <span style={{ fontWeight: "normal" }}>{title}</span>
        </div>
      </li>
    );
  };

  // Se filtra la lista de elementos para obtener solo ventanas (para el select en Crear Puerta)
  const windowsList = elementsList.filter((el) => el.type === "window");

  // Renderizado principal
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
          <h1 className="fw-normal">Administrador de Parámetros</h1>
        </div>
        {/* Se asigna un minHeight fijo para que el contenedor mantenga el mismo tamaño entre steps */}
        <div className="card shadow w-100" style={{ overflow: "hidden", minHeight: "600px" }}>
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
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Step 4: Detalles constructivos */}
                {step === 4 && (
                  <>
                    <div className="border p-3 table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
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
                              <td>{det.capas}</td>
                              <td>{det.layer_thickness}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="save" onClick={() => setShowCreateDetailModal(true)}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
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
                      <CustomButton variant="save" onClick={() => setShowCreateElementModal(true)}>
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
                onChange={(e) =>
                  setNewMaterial((prev) => ({ ...prev, conductivity: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Calor específico (J/kgK)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterial.specific_heat || 0}
                onChange={(e) =>
                  setNewMaterial((prev) => ({ ...prev, specific_heat: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Densidad (kg/m3)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterial.density || 0}
                onChange={(e) =>
                  setNewMaterial((prev) => ({ ...prev, density: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="save" onClick={handleCreateMaterial}>
                Guardar Material
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear Detalle Constructivo (Step 4) */}
      {showCreateDetailModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateDetailModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Crear Detalle Constructivo</h4>
            <div className="mb-3">
              <label className="form-label">Ubicación Detalle</label>
              <select
                className="form-control"
                value={newDetail.scantilon_location}
                onChange={(e) =>
                  setNewDetail((prev) => ({ ...prev, scantilon_location: e.target.value }))
                }
              >
                <option value="">Seleccione una opción</option>
                <option value="Techo">Techo</option>
                <option value="Muro">Muro</option>
                <option value="Piso">Piso</option>
              </select>
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
              <select
                className="form-control"
                value={newDetail.capas}
                onChange={(e) =>
                  setNewDetail((prev) => ({ ...prev, capas: parseInt(e.target.value) }))
                }
              >
                <option value={0}>Seleccione un material</option>
                {materialsList.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.atributs?.name}
                  </option>
                ))}
              </select>
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
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, name_element: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Vidrio [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.u_vidrio}
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, u_vidrio: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">FS Vidrio</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.fs_vidrio}
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, fs_vidrio: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Cierre</label>
                  <select
                    className="form-control"
                    value={newWindow.clousure_type}
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, clousure_type: e.target.value }))
                    }
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Abatir">Abatir</option>
                    <option value="Corredera">Corredera</option>
                    <option value="Guillotina">Guillotina</option>
                    <option value="Proyectante">Proyectante</option>
                    <option value="Fija">Fija</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Marco</label>
                  <select
                    className="form-control"
                    value={newWindow.frame_type}
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, frame_type: e.target.value }))
                    }
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Madera Sin RPT">Madera Sin RPT</option>
                    <option value="PVC Sin RPT">PVC Sin RPT</option>
                    <option value="Metalico Sin RPT">Metalico Sin RPT</option>
                    <option value="Madera Con RPT">Madera Con RPT</option>
                    <option value="PVC Con RPT">PVC Con RPT</option>
                    <option value="Metalico Con RPT">Metalico Con RPT</option>
                    <option value="Fierro">Fierro</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">U Marco [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.u_marco}
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">FM (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newWindow.fm}
                    onChange={(e) =>
                      setNewWindow((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))
                    }
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
                    onChange={(e) =>
                      setNewDoor((prev) => ({ ...prev, name_element: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Puerta opaca [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.u_puerta_opaca}
                    onChange={(e) =>
                      setNewDoor((prev) => ({ ...prev, u_puerta_opaca: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Seleccione Ventana</label>
                  <select
                    className="form-control"
                    value={newDoor.ventana_id}
                    onChange={(e) =>
                      setNewDoor((prev) => ({ ...prev, ventana_id: parseInt(e.target.value) }))
                    }
                  >
                    <option value={0}>Seleccione una ventana</option>
                    {windowsList.map((win) => (
                      <option key={win.id} value={win.id}>
                        {win.name_element}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">% Vidrio</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.porcentaje_vidrio}
                    onChange={(e) =>
                      setNewDoor((prev) => ({ ...prev, porcentaje_vidrio: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">U Marco [W/m2K]</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.u_marco}
                    onChange={(e) =>
                      setNewDoor((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">FM (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDoor.fm}
                    onChange={(e) =>
                      setNewDoor((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))
                    }
                  />
                </div>
              </>
            )}
            <div className="d-flex justify-content-end gap-2">
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
        /* Encabezados fijos: fondo blanco y texto en el color primario */
        .table thead th {
          position: sticky;
          top: 0;
          background-color: #fff;
          color: var(--primary-color);
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
