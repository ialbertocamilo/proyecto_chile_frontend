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
import GooIcons from "../public/GoogleIcons";



interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail: string;
  id_material: number;
  material: string;
  layer_thickness: number;
}

// Para las pestañas que no tienen la misma estructura que Detail
interface TabItem {
  name_detail: string;
  value_u?: number;
  info?: {
    surface_color?: {
      exterior?: { name: string };
      interior?: { name: string };
    };
    aislacion_bajo_piso?: {
      lambda?: number;
      e_aisl?: number;
    };
    ref_aisl_vertical?: {
      lambda?: number;
      e_aisl?: number;
      d?: number;
    };
    ref_aisl_horizontal?: {
      lambda?: number;
      e_aisl?: number;
      d?: number;
    };
  };
  // Para el caso de la pestaña "detalles"
  scantilon_location?: string;
  material?: string;
  layer_thickness?: number;
}

type TabStep4 = "detalles" | "muros" | "techumbre" | "pisos";

const ProjectWorkflowPart3: React.FC = () => {
  useAuth();
  const router = useRouter();

  // Se obtiene el project_id desde el localStorage
  const [projectId, setProjectId] = useState<number | null>(null);
  // Estado para indicar que ya se realizó la lectura del localStorage
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    if (storedProjectId) {
      setProjectId(Number(storedProjectId));
    }
    setHasLoaded(true);
  }, []);

  // Solo se verifica si ya se leyó el localStorage
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

  // Estado de pasos: iniciamos en 4 (Detalles constructivos) ya que la parte 1 ya abarcó el resto
  const [step, setStep] = useState<number>(4);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  /** Estados para Detalles constructivos (Paso 4) **/
  const [details, setDetails] = useState<Detail[]>([]);
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showSelectDetailModal, setShowSelectDetailModal] = useState(false);
  const [showCreateDetailModal, setShowCreateDetailModal] = useState(false);
  const [newDetailForm, setNewDetailForm] = useState({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: 10,
  });
  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");
  const [detailsTabList, setDetailsTabList] = useState<Detail[]>([]);
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);

  /** Estados para Recinto (Paso 7) **/
  const recintos = [
    {
      id: 1,
      estado: "Activo",
      nombre: "Recinto Prueba",
      perfilOcup: "Sedentario",
      sensorCO2: "Si",
      alturaProm: 2.5,
      area: 50,
    },
  ];

  // -------------------------------
  // Funciones para Detalles constructivos
  // -------------------------------
  const fetchFetchedDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/details/`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setFetchedDetails(response.data || []);
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.");
    }
  };

  const handleAddDetailFromModal = (det: Detail) => {
    if (details.some((d) => d.id_detail === det.id_detail)) {
      Swal.fire("Detalle duplicado", "Este detalle ya fue seleccionado", "info");
      return;
    }
    if (det.id_detail == null) {
      Swal.fire("Error", "El detalle seleccionado no tiene un ID válido", "error");
      return;
    }
    setDetails((prev) => [...prev, det]);
    Swal.fire("Detalle agregado", `El detalle "${det.name_detail}" ha sido agregado.`, "success");
  };

  const handleCreateNewDetail = async () => {
    if (
      !newDetailForm.scantilon_location ||
      !newDetailForm.name_detail ||
      !newDetailForm.material_id
    ) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/details/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(url, newDetailForm, { headers });
      // Se recibe el detalle creado, pero no se usa la variable retornada
      // const returnedDetail = response.data.detail as Detail;
      Swal.fire("Detalle creado", response.data.success, "success");
      fetchFetchedDetails();
      setShowCreateDetailModal(false);
      setNewDetailForm({ scantilon_location: "", name_detail: "", material_id: 0, layer_thickness: 10 });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire(
          "Error al crear detalle",
          error.response?.data?.detail || error.message,
          "error"
        );
      } else {
        Swal.fire("Error al crear detalle", "Error desconocido", "error");
      }
    }
  };

  const fetchStep4TabsData = async () => {
    if (!projectId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = `${constantUrlApiEndpoint}/project/${projectId}/details`;
      const detailsUrl = `${constantUrlApiEndpoint}/projects/${projectId}/details`;
      const detailsRes = await axios.get(detailsUrl, { headers });
      setDetailsTabList(detailsRes.data || []);
      const requests = [
        { url: `${baseUrl}/Muro`, setter: setMurosTabList },
        { url: `${baseUrl}/Techo`, setter: setTechumbreTabList },
        { url: `${baseUrl}/Piso`, setter: setPisosTabList },
      ];
      const responses = await Promise.allSettled(
        requests.map(({ url }) => axios.get(url, { headers }).catch(() => null))
      );
      responses.forEach((response, index) => {
        if (response.status === "fulfilled" && response.value) {
          requests[index].setter(response.value.data || []);
        }
      });
    } catch (error: unknown) {
      console.error("Error desconocido al obtener datos de pestañas step4:", error);
      Swal.fire("Error", "Error desconocido al obtener datos de pestañas", "error");
    }
  };

  // Función para guardar detalles (Paso 4)
  const handleSaveDetails = async () => {
    if (!projectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    const validDetails = details.filter((det) => det.id_detail != null);
    const detailIds = validDetails.map((det) => det.id_detail);
    if (detailIds.length === 0) {
      Swal.fire("Error", "No se encontraron detalles válidos para guardar", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      await axios.post(url, detailIds, { headers });
      Swal.fire("Detalles guardados", "Detalles agregados correctamente", "success").then(async () => {
        await fetchStep4TabsData();
        setShowTabsInStep4(true);
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire(
          "Error al guardar detalles",
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message,
          "error"
        );
      } else {
        Swal.fire("Error al guardar detalles", "Error desconocido", "error");
      }
    }
  };

  // -------------------------------
  // Efectos para cargar datos
  // -------------------------------
  useEffect(() => {
    if (step === 4) {
      setDetails([]);
      setShowTabsInStep4(false);
      fetchFetchedDetails();
    }
  }, [step]);

  const renderMainHeader = () =>
    step >= 4 ? (
      <div className="mb-3">
        <h2 style={{ marginTop: "120px", fontSize: "40px", fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
          Desarrollo de proyecto
        </h2>
        <div className="d-flex align-items-center gap-4 mt-4">
          <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
            Proyecto:
          </span>
          <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
            {`Edificación Nº ${projectId ?? "xxxxx"}`}
          </CustomButton>
        </div>
      </div>
    ) : null;

  /** Componente para el sidebar usando Google Icons **/
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
          <span style={{ marginRight: "15px", fontSize: "2rem" }}>
            <span className="material-icons">{iconName}</span>
          </span>
          <span style={{ fontWeight: "normal" }}>{title}</span>
        </div>
      </li>
    );
  };

  const renderStep4Tabs = () => {
    if (!showTabsInStep4) return null;
    return (
      <div className="mt-4">
        <ul className="nav" style={{ display: "flex", padding: 0, listStyle: "none" }}>
          {([
            { key: "detalles", label: "Detalles" },
            { key: "muros", label: "Muros" },
            { key: "techumbre", label: "Techumbre" },
            { key: "pisos", label: "Pisos" },
          ] as { key: TabStep4; label: string }[]).map((item) => (
            <li key={item.key} style={{ flex: 1 }}>
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#fff",
                  color:
                    tabStep4 === item.key
                      ? "var(--primary-color)"
                      : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    tabStep4 === item.key ? "3px solid var(--primary-color)" : "none",
                  fontFamily: "var(--font-family-base)",
                  fontWeight: "normal",
                }}
                onClick={() => setTabStep4(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="border border-top-0 p-3" style={{ minHeight: "250px" }}>
          {tabStep4 === "detalles" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Ubicación Detalle
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre Detalle
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Material</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Espesor capa (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailsTabList.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.scantilon_location}</td>
                    <td>{item.name_detail}</td>
                    <td>{item.material}</td>
                    <td>{item.layer_thickness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tabStep4 === "muros" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    U [W/m2K]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Color Exterior
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Color Interior
                  </th>
                </tr>
              </thead>
              <tbody>
                {murosTabList.map((item, idx) => {
                  const exteriorColor =
                    item.info?.surface_color?.exterior?.name || "Desconocido";
                  const interiorColor =
                    item.info?.surface_color?.interior?.name || "Desconocido";
                  return (
                    <tr key={idx}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>{exteriorColor}</td>
                      <td>{interiorColor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {tabStep4 === "techumbre" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    U [W/m2K]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Color Exterior
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Color Interior
                  </th>
                </tr>
              </thead>
              <tbody>
                {techumbreTabList.map((item, idx) => {
                  const exteriorColor =
                    item.info?.surface_color?.exterior?.name || "Desconocido";
                  const interiorColor =
                    item.info?.surface_color?.interior?.name || "Desconocido";
                  return (
                    <tr key={idx}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>{exteriorColor}</td>
                      <td>{interiorColor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {tabStep4 === "pisos" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre
                  </th>
                  <th rowSpan={2} style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    U [W/m²K]
                  </th>
                  <th colSpan={2} style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Aislamiento bajo piso
                  </th>
                  <th colSpan={3} style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Ref Aisl Vert.
                  </th>
                  <th colSpan={3} style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Ref Aisl Horiz.
                  </th>
                </tr>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>I [W/mK]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>e Aisl [cm]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>I [W/mK]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>e Aisl [cm]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>D [cm]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>I [W/mK]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>e Aisl [cm]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>D [cm]</th>
                </tr>
              </thead>
              <tbody>
                {pisosTabList.map((item, idx) => {
                  const bajoPiso = item.info?.aislacion_bajo_piso || {};
                  const vert = item.info?.ref_aisl_vertical || {};
                  const horiz = item.info?.ref_aisl_horizontal || {};
                  return (
                    <tr key={idx}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>{bajoPiso.lambda ? bajoPiso.lambda.toFixed(3) : "N/A"}</td>
                      <td>{bajoPiso.e_aisl ? bajoPiso.e_aisl : "N/A"}</td>
                      <td>{vert.lambda ? vert.lambda.toFixed(3) : "N/A"}</td>
                      <td>{vert.e_aisl ? vert.e_aisl : "N/A"}</td>
                      <td>{vert.d ? vert.d : "N/A"}</td>
                      <td>{horiz.lambda ? horiz.lambda.toFixed(3) : "N/A"}</td>
                      <td>{horiz.e_aisl ? horiz.e_aisl : "N/A"}</td>
                      <td>{horiz.d ? horiz.d : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <GooIcons />
      <Navbar setActiveView={() => { }} setSidebarWidth={setSidebarWidth} />
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
                  <SidebarItem stepNumber={4} iconName="build" title="Detalles constructivos" />
                  <SidebarItem stepNumber={7} iconName="design_services" title="Recinto" />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "20px" }}>
                {/* Paso 4: Detalles constructivos */}
                {step === 4 && (
                  <>
                    {!showTabsInStep4 && (
                      <>
                        <div className="mb-3" style={{ display: "flex", justifyContent: "flex-end" }}>
                          <CustomButton variant="save" onClick={() => setShowSelectDetailModal(true)}>
                            <span className="material-icons">add</span> Seleccionar Detalle
                          </CustomButton>
                        </div>
                        <div className="mb-3">
                          {details.length > 0 ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Ubicación Detalle
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Nombre Detalle
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Material</th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Espesor capa (cm)
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                                </tr>
                              </thead>
                              <tbody>
                                {details.map((det) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.scantilon_location}</td>
                                    <td>{det.name_detail}</td>
                                    <td>{det.material}</td>
                                    <td>{det.layer_thickness}</td>
                                    <td>
                                      <CustomButton
                                        variant="deleteIcon"
                                        onClick={() =>
                                          setDetails((prev) =>
                                            prev.filter((d) => d.id_detail !== det.id_detail)
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                              No se han seleccionado detalles.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <div className="mt-4 d-flex justify-content-end gap-2">
                      <CustomButton variant="save" onClick={handleSaveDetails}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
                        Grabar datos
                      </CustomButton>
                      <CustomButton variant="save" onClick={() => setStep(7)}>
                        Continuar
                      </CustomButton>
                    </div>
                    {renderStep4Tabs()}
                  </>
                )}

                {/* Paso 7: Recinto */}
                {step === 7 && (
                  <>
                    <h5 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }} className="mb-3">
                      Recinto (Espacio aun en desarrollo, no funcional)
                    </h5>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div></div>
                      <CustomButton variant="save">
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    </div>
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Estado</th>
                          <th>Nombre del Recinto</th>
                          <th>Perfil de Ocupación</th>
                          <th>Sensor CO2</th>
                          <th>Altura Promedio</th>
                          <th>Área</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recintos.map((r) => (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.estado}</td>
                            <td>{r.nombre}</td>
                            <td>{r.perfilOcup}</td>
                            <td>{r.sensorCO2}</td>
                            <td>{r.alturaProm}</td>
                            <td>{r.area}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-end">
                      <CustomButton
                        variant="save"
                        onClick={() =>
                          Swal.fire("Datos guardados", "Se han guardado los datos del recinto", "success")
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
          Modales para Detalles constructivos
      ------------------------------- */}
      {/* Modal para seleccionar detalle */}
      {showSelectDetailModal && (
        <div className="modal-overlay" onClick={() => setShowSelectDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
                Seleccionar Detalle Constructivo
              </h4>
              <CustomButton variant="save" onClick={() => setShowCreateDetailModal(true)}>
                <span className="material-icons">add</span> Agregar
              </CustomButton>
            </div>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Ubicación Detalle
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre Detalle
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Material</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Espesor capa (cm)</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {fetchedDetails.map((det) => (
                  <tr key={det.id_detail}>
                    <td>{det.scantilon_location}</td>
                    <td>{det.name_detail}</td>
                    <td>{det.material}</td>
                    <td>{det.layer_thickness}</td>
                    <td>
                      <CustomButton variant="addIcon" onClick={() => handleAddDetailFromModal(det)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-end"></div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo detalle */}
      {showCreateDetailModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3" style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
              Crear Nuevo Detalle
            </h4>
            <div className="mb-3">
              <label className="form-label">Ubicación Detalle</label>
              <select
                className="form-control"
                value={newDetailForm.scantilon_location}
                onChange={(e) =>
                  setNewDetailForm((prev) => ({ ...prev, scantilon_location: e.target.value }))
                }
              >
                <option value="">Seleccione</option>
                <option value="Muro">Muro</option>
                <option value="Techo">Techo</option>
                <option value="Piso">Piso</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre Detalle</label>
              <input
                type="text"
                className="form-control"
                value={newDetailForm.name_detail}
                onChange={(e) => setNewDetailForm((prev) => ({ ...prev, name_detail: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Material</label>
              <select
                className="form-control"
                value={newDetailForm.material_id}
                onChange={(e) =>
                  setNewDetailForm((prev) => ({ ...prev, material_id: parseInt(e.target.value) }))
                }
              >
                <option value={0}>Seleccione un material</option>
                {/* La lista de materiales podría cargarse dinámicamente o venir por props */}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Espesor capa (cm)</label>
              <input
                type="number"
                className="form-control"
                value={newDetailForm.layer_thickness}
                onChange={(e) =>
                  setNewDetailForm((prev) => ({
                    ...prev,
                    layer_thickness: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="save" onClick={handleCreateNewDetail}>
                <span className="material-icons">add</span> Crear Detalle
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

export default ProjectWorkflowPart3;
