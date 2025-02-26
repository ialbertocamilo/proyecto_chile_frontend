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
  scantilon_location?: string;
  material?: string;
  layer_thickness?: number;
}

interface Material {
  id: number;
  name: string;
}

interface Constant {
  create_status: string;
  name: string;
  type: string;
  id: number;
  atributs: {
    name: string;
    density: number;
    conductivity: number;
    specific_heat: number;
  };
  is_deleted: boolean;
}

type TabStep4 = "detalles" | "muros" | "techumbre" | "pisos";

const ProjectWorkflowPart3: React.FC = () => {
  useAuth();
  const router = useRouter();

  // Se obtiene el project_id desde el localStorage
  const [projectId, setProjectId] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    if (storedProjectId) {
      setProjectId(Number(storedProjectId));
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

  // Estado de pasos: iniciamos en 4 (Detalles constructivos)
  const [step, setStep] = useState<number>(4);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  /** Estados para Detalles constructivos (Paso 4) **/
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  // Se muestra inline la selección de detalles y creación de nuevos
  const [showNewDetailRow, setShowNewDetailRow] = useState(false);
  // Estado para el formulario inline de creación de detalle
  const [newDetailForm, setNewDetailForm] = useState({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: 10,
  });
  // Se elimina el setter, ya que no se modifica este estado
  const [showTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");
  // Declaramos únicamente la variable de estado sin el setter ya que no se actualizan
  const [detailsTabList] = useState<Detail[]>([]);
  const [murosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList] = useState<TabItem[]>([]);

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

  /** Estado para la lista de materiales **/
  const [materials, setMaterials] = useState<Material[]>([]);

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

  // Función para crear un nuevo detalle (usada en el inline row)
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
      Swal.fire("Detalle creado", response.data.success, "success");
      fetchFetchedDetails();
      // Se oculta la fila inline y se limpia el formulario
      setShowNewDetailRow(false);
      setNewDetailForm({
        scantilon_location: "",
        name_detail: "",
        material_id: 0,
        layer_thickness: 10,
      });
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

  // Función de simulación para guardar datos: al hacer clic se muestra una alerta
  const handleSaveDetails = () => {
    Swal.fire("Datos guardados correctamente", "Simulación", "success");
  };

  // -------------------------------
  // Función para cargar materiales desde el endpoint
  // -------------------------------
  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.");
        return;
      }
      const url = `${constantUrlApiEndpoint}/constants/?page=1&per_page=700`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      const allConstants: Constant[] = response.data.constants || [];
      const materialsList: Material[] = allConstants
        .filter(
          (c: Constant) =>
            c.name === "materials" && c.type === "definition materials"
        )
        .map((c: Constant) => ({
          id: c.id,
          name: c.atributs.name,
        }));
      setMaterials(materialsList);
    } catch (error: unknown) {
      console.error("Error al obtener materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.");
    }
  };

  // Cargar la lista de materiales cuando se muestre la fila inline para crear nuevo detalle
  useEffect(() => {
    if (showNewDetailRow) {
      fetchMaterials();
    }
  }, [showNewDetailRow]);

  // -------------------------------
  // Efectos para cargar datos
  // -------------------------------
  useEffect(() => {
    if (step === 4) {
      fetchFetchedDetails();
    }
  }, [step]);

  const renderMainHeader = () =>
    step >= 4 ? (
      <div className="mb-3">
        <h2
          style={{
            marginTop: "120px",
            fontSize: "40px",
            fontWeight: "normal",
            fontFamily: "var(--font-family-base)",
          }}
        >
          Desarrollo de proyecto
        </h2>
        <div className="d-flex align-items-center gap-4 mt-4">
          <span
            style={{
              fontWeight: "normal",
              fontFamily: "var(--font-family-base)",
            }}
          >
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
        <ul
          className="nav"
          style={{ display: "flex", padding: 0, listStyle: "none" }}
        >
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
                    tabStep4 === item.key
                      ? "3px solid var(--primary-color)"
                      : "none",
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    Material
                  </th>
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    I [W/mK]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    I [W/mK]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    D [cm]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    I [W/mK]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                    D [cm]
                  </th>
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
                          <CustomButton
                            variant="save"
                            onClick={() => {
                              setShowNewDetailRow((prev) => !prev);
                              if (!showNewDetailRow) fetchMaterials();
                            }}
                          >
                            <span className="material-icons">add</span> Nuevo
                          </CustomButton>
                        </div>
                        {/* Se muestra la tabla para seleccionar/agregar detalles */}
                        <div className="mb-3">
                          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Ubicación Detalle
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Nombre Detalle
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Material
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Espesor capa (cm)
                                  </th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>
                                    Acción
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {showNewDetailRow && (
                                  <tr>
                                    <td>
                                      <select
                                        className="form-control"
                                        value={newDetailForm.scantilon_location}
                                        onChange={(e) =>
                                          setNewDetailForm((prev) => ({
                                            ...prev,
                                            scantilon_location: e.target.value,
                                          }))
                                        }
                                      >
                                        <option value="">Seleccione</option>
                                        <option value="Muro">Muro</option>
                                        <option value="Techo">Techo</option>
                                        <option value="Piso">Piso</option>
                                      </select>
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nombre Detalle"
                                        value={newDetailForm.name_detail}
                                        onChange={(e) =>
                                          setNewDetailForm((prev) => ({
                                            ...prev,
                                            name_detail: e.target.value,
                                          }))
                                        }
                                      />
                                    </td>
                                    <td>
                                      <select
                                        className="form-control"
                                        value={newDetailForm.material_id}
                                        onChange={(e) =>
                                          setNewDetailForm((prev) => ({
                                            ...prev,
                                            material_id: parseInt(e.target.value),
                                          }))
                                        }
                                      >
                                        <option value={0}>Seleccione un material</option>
                                        {materials.map((mat) => (
                                          <option key={mat.id} value={mat.id}>
                                            {mat.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Espesor (cm)"
                                        value={newDetailForm.layer_thickness}
                                        onChange={(e) =>
                                          setNewDetailForm((prev) => ({
                                            ...prev,
                                            layer_thickness: parseFloat(e.target.value) || 0,
                                          }))
                                        }
                                      />
                                    </td>
                                    <td>
                                      <CustomButton variant="save" onClick={handleCreateNewDetail}>
                                        <span className="material-icons">add</span>
                                      </CustomButton>
                                    </td>
                                  </tr>
                                )}
                                {fetchedDetails.map((det) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.scantilon_location}</td>
                                    <td>{det.name_detail}</td>
                                    <td>{det.material}</td>
                                    <td>{det.layer_thickness}</td>
                                    <td>
                                      <CustomButton
                                        variant="addIcon"
                                        onClick={() =>
                                          Swal.fire(
                                            "Detalle agregado",
                                            `El detalle "${det.name_detail}" se agregó (simulación).`,
                                            "success"
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Botón de "Grabar datos" que simula la acción */}
                    <div className="mt-4 d-flex justify-content-end gap-2">
                      <CustomButton variant="save" onClick={handleSaveDetails}>
                        <span className="material-icons" style={{ marginRight: "5px" }}>
                          sd_card
                        </span>
                        Grabar datos
                      </CustomButton>
                    </div>
                    {renderStep4Tabs()}
                  </>
                )}

                {/* Paso 7: Recinto */}
                {step === 7 && (
                  <>
                    <h5
                      style={{
                        fontWeight: "normal",
                        fontFamily: "var(--font-family-base)",
                      }}
                      className="mb-3"
                    >
                      Recinto (Espacio aún en desarrollo, no funcional)
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
                          Swal.fire(
                            "Datos guardados",
                            "Se han guardado los datos del recinto (simulación)",
                            "success"
                          )
                        }
                      >
                        <span className="material-icons" style={{ marginRight: "5px" }}>
                          sd_card
                        </span>
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
          padding: 0.2rem;
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
