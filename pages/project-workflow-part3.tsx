import React, { useState, useEffect, useCallback } from "react";
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
  id_detail?: number;
  id?: number;
  name_detail: string;
  value_u?: number;
  info?: {
    surface_color?: {
      exterior?: { name: string; value?: number };
      interior?: { name: string; value?: number };
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

type TabStep4 = "detalles" | "muros" | "techumbre" | "pisos" | "ventanas" | "puertas";

// Interfaces para evitar "any"
interface Ventana {
  name_element: string;
  atributs?: {
    u_vidrio?: number;
    fs_vidrio?: number;
    frame_type?: string;
    clousure_type?: string;
  };
  u_marco?: number;
  fm?: number;
}

interface Puerta {
  name_element: string;
  atributs?: {
    u_puerta_opaca?: number;
    name_ventana?: string;
    porcentaje_vidrio?: number;
  };
  u_marco?: number;
  fm?: number;
}

function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ProjectWorkflowPart3: React.FC = () => {
  useAuth();
  const router = useRouter();

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

  const [step, setStep] = useState<number>(4);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showNewDetailRow, setShowNewDetailRow] = useState(false);
  const [newDetailForm, setNewDetailForm] = useState({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: 10,
  });
  // showTabsInStep4 === false → primera pantalla (lista de detalles)
  // showTabsInStep4 === true → segunda pantalla (tabla con pestañas)
  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  // Listas para cada pestaña (se eliminó detailsTabList por no usarse)
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [ventanasTabList, setVentanasTabList] = useState<Ventana[]>([]);
  const [puertasTabList, setPuertasTabList] = useState<Puerta[]>([]);

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

  const [materials, setMaterials] = useState<Material[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");

  const [searchQuery, setSearchQuery] = useState("");

  // Estados para edición en Muros
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingColors, setEditingColors] = useState<{ interior: string; exterior: string }>({
    interior: "Intermedio",
    exterior: "Intermedio",
  });

  // Estados para edición en Techumbre (Techo)
  const [editingTechRowId, setEditingTechRowId] = useState<number | null>(null);
  const [editingTechColors, setEditingTechColors] = useState<{ interior: string; exterior: string }>({
    interior: "Intermedio",
    exterior: "Intermedio",
  });

  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);

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
      // Se eliminó setDetailsTabList ya que no se utiliza
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.");
    }
  };

  // Función para obtener datos de Muros
  const fetchMurosDetails = useCallback(async () => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/project/${projectId}/details/Muro`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setMurosTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de muros:", error);
      Swal.fire("Error", "Error al obtener datos de muros. Ver consola.");
    }
  }, [projectId]);

  // Función para obtener datos de Techumbre (Techo)
  const fetchTechumbreDetails = useCallback(async () => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/project/${projectId}/details/Techo`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setTechumbreTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de techo:", error);
      Swal.fire("Error", "Error al obtener datos de techo. Ver consola.");
    }
  }, [projectId]);

  // Función para obtener datos de Piso
  const fetchPisosDetails = useCallback(async () => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/project/${projectId}/details/Piso`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setPisosTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de piso:", error);
      Swal.fire("Error", "Error al obtener datos de piso. Ver consola.");
    }
  }, [projectId]);

  // Función para obtener datos de Ventanas
  const fetchVentanasDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/elements/?type=window`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setVentanasTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de ventanas:", error);
      Swal.fire("Error", "Error al obtener datos de ventanas. Ver consola.");
    }
  }, []);

  // Función para obtener datos de Puertas
  const fetchPuertasDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/elements/?type=door`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setPuertasTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de puertas:", error);
      Swal.fire("Error", "Error al obtener datos de puertas. Ver consola.");
    }
  }, []);

  useEffect(() => {
    if (step === 4) {
      fetchFetchedDetails();
    }
  }, [step]);

  // Obtención de datos según la pestaña seleccionada
  useEffect(() => {
    if (showTabsInStep4) {
      if (tabStep4 === "muros") {
        fetchMurosDetails();
      } else if (tabStep4 === "techumbre") {
        fetchTechumbreDetails();
      } else if (tabStep4 === "pisos") {
        fetchPisosDetails();
      } else if (tabStep4 === "ventanas") {
        fetchVentanasDetails();
      } else if (tabStep4 === "puertas") {
        fetchPuertasDetails();
      }
    }
  }, [
    showTabsInStep4,
    tabStep4,
    projectId,
    fetchMurosDetails,
    fetchTechumbreDetails,
    fetchPisosDetails,
    fetchVentanasDetails,
    fetchPuertasDetails,
  ]);

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
      setShowNewDetailRow(false);
      setNewDetailForm({
        scantilon_location: "",
        name_detail: "",
        material_id: 0,
        layer_thickness: 10,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error al crear detalle", error.response?.data?.detail || error.message, "error");
      } else {
        Swal.fire("Error al crear detalle", "Error desconocido", "error");
      }
    }
  };

  const handleCancelNewDetail = () => {
    setShowNewDetailRow(false);
    setNewDetailForm({
      scantilon_location: "",
      name_detail: "",
      material_id: 0,
      layer_thickness: 10,
    });
  };

  // Esta función guarda los detalles (a través de una llamada API) y luego muestra la vista con pestañas
  const handleSaveDetails = async () => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    const detailIds = fetchedDetails.map((det) => det.id_detail);
    try {
      const url = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      await axios.post(url, detailIds, { headers });
      Swal.fire("Detalles agregados correctamente", "", "success");
      setShowTabsInStep4(true);
      setTabStep4("muros");
    } catch (error: unknown) {
      console.error(error);
      Swal.fire("Error", "Error al guardar detalles", "error");
    }
  };

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

  useEffect(() => {
    if (showNewDetailRow) {
      fetchMaterials();
    }
  }, [showNewDetailRow]);

  // Funciones para editar en Muros
  const handleEditClick = (detail: TabItem) => {
    setEditingRowId(detail.id || null);
    setEditingColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleConfirmEdit = async (detail: TabItem) => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/project/${projectId}/update_details/Muro/${detail.id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        info: {
          surface_color: {
            interior: { name: editingColors.interior },
            exterior: { name: editingColors.exterior },
          },
        },
      };
      const response = await axios.put(url, payload, { headers });
      Swal.fire("Actualizado", response.data.message, "success");
      setMurosTabList((prev) =>
        prev.map((item) =>
          item.id === detail.id
            ? {
                ...item,
                info: {
                  ...item.info,
                  surface_color: {
                    interior: { name: editingColors.interior },
                    exterior: { name: editingColors.exterior },
                  },
                },
              }
            : item
        )
      );
      setEditingRowId(null);
    } catch (error: unknown) {
      console.error("Error al actualizar detalle:", error);
      Swal.fire("Error", "Error al actualizar detalle. Ver consola.");
    }
  };

  // Funciones para editar en Techumbre (Techo)
  const handleEditTechClick = (detail: TabItem) => {
    setEditingTechRowId(detail.id || null);
    setEditingTechColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleConfirmTechEdit = async (detail: TabItem) => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `http://ceela-backend.svgdev.tech/project/${projectId}/update_details/Techo/${detail.id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        info: {
          surface_color: {
            interior: { name: editingTechColors.interior },
            exterior: { name: editingTechColors.exterior },
          },
        },
      };
      const response = await axios.put(url, payload, { headers });
      Swal.fire("Actualizado", response.data.message, "success");
      setTechumbreTabList((prev) =>
        prev.map((item) =>
          item.id === detail.id
            ? {
                ...item,
                info: {
                  ...item.info,
                  surface_color: {
                    interior: { name: editingTechColors.interior },
                    exterior: { name: editingTechColors.exterior },
                  },
                },
              }
            : item
        )
      );
      setEditingTechRowId(null);
    } catch (error: unknown) {
      console.error("Error al actualizar detalle:", error);
      Swal.fire("Error", "Error al actualizar detalle. Ver consola.");
    }
  };

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
          <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
            Proyecto:
          </span>
          <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
            {`Edificación Nº ${projectId ?? "xxxxx"}`}
          </CustomButton>
        </div>
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
    const activeColor = primaryColor;
    const inactiveColor = hexToRgba(primaryColor, 0.5);
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

  // Estilos para encabezados fijos (sticky)
  const stickyHeaderStyle1 = {
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#fff",
    zIndex: 3,
  };

  // Para tablas con dos filas en el encabezado (ej: "pisos")
  const stickyHeaderStyle2 = {
    position: "sticky" as const,
    top: 40,
    backgroundColor: "#fff",
    zIndex: 2,
  };

  // Vista con pestañas (segunda pantalla)
  const renderStep4Tabs = () => {
    if (!showTabsInStep4) return null;
    const tabs = [
      { key: "muros", label: "Muros" },
      { key: "techumbre", label: "Techumbre" },
      { key: "pisos", label: "Pisos" },
      { key: "ventanas", label: "Ventanas" },
      { key: "puertas", label: "Puertas" },
    ] as { key: TabStep4; label: string }[];

    return (
      <div className="mt-4">
        <ul className="nav" style={{ display: "flex", padding: 0, listStyle: "none" }}>
          {tabs.map((item) => (
            <li key={item.key} style={{ flex: 1 }}>
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#fff",
                  color: tabStep4 === item.key ? primaryColor : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: tabStep4 === item.key ? `3px solid ${primaryColor}` : "none",
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
        <div style={{ height: "400px", overflowY: "scroll", position: "relative" }}>
          {tabStep4 === "muros" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Nombre Abreviado</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Valor U (W/m²K)</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Color Exterior</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Color Interior</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {murosTabList.length > 0 ? (
                  murosTabList.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>
                        {editingRowId === item.id ? (
                          <select
                            value={editingColors.exterior}
                            onChange={(e) =>
                              setEditingColors((prev) => ({ ...prev, exterior: e.target.value }))
                            }
                          >
                            <option value="Claro">Claro</option>
                            <option value="Oscuro">Oscuro</option>
                            <option value="Intermedio">Intermedio</option>
                          </select>
                        ) : (
                          item.info?.surface_color?.exterior?.name || "Desconocido"
                        )}
                      </td>
                      <td>
                        {editingRowId === item.id ? (
                          <select
                            value={editingColors.interior}
                            onChange={(e) =>
                              setEditingColors((prev) => ({ ...prev, interior: e.target.value }))
                            }
                          >
                            <option value="Claro">Claro</option>
                            <option value="Oscuro">Oscuro</option>
                            <option value="Intermedio">Intermedio</option>
                          </select>
                        ) : (
                          item.info?.surface_color?.interior?.name || "Desconocido"
                        )}
                      </td>
                      <td>
                        {editingRowId === item.id ? (
                          <CustomButton variant="save" onClick={() => handleConfirmEdit(item)}>
                            Confirmar
                          </CustomButton>
                        ) : (
                          <CustomButton variant="editIcon" onClick={() => handleEditClick(item)}>
                            Editar
                          </CustomButton>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No hay datos</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {tabStep4 === "techumbre" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Nombre Abreviado</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Valor U (W/m²K)</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Color Exterior</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Color Interior</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {techumbreTabList.length > 0 ? (
                  techumbreTabList.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>
                        {editingTechRowId === item.id ? (
                          <select
                            value={editingTechColors.exterior}
                            onChange={(e) =>
                              setEditingTechColors((prev) => ({ ...prev, exterior: e.target.value }))
                            }
                          >
                            <option value="Claro">Claro</option>
                            <option value="Oscuro">Oscuro</option>
                            <option value="Intermedio">Intermedio</option>
                          </select>
                        ) : (
                          item.info?.surface_color?.exterior?.name || "Desconocido"
                        )}
                      </td>
                      <td>
                        {editingTechRowId === item.id ? (
                          <select
                            value={editingTechColors.interior}
                            onChange={(e) =>
                              setEditingTechColors((prev) => ({ ...prev, interior: e.target.value }))
                            }
                          >
                            <option value="Claro">Claro</option>
                            <option value="Oscuro">Oscuro</option>
                            <option value="Intermedio">Intermedio</option>
                          </select>
                        ) : (
                          item.info?.surface_color?.interior?.name || "Desconocido"
                        )}
                      </td>
                      <td>
                        {editingTechRowId === item.id ? (
                          <CustomButton variant="save" onClick={() => handleConfirmTechEdit(item)}>
                            Confirmar
                          </CustomButton>
                        ) : (
                          <CustomButton variant="editIcon" onClick={() => handleEditTechClick(item)}>
                            Editar
                          </CustomButton>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No hay datos</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {tabStep4 === "pisos" && (
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Nombre</th>
                    <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>U [W/m²K]</th>
                    <th colSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Aislamiento bajo piso</th>
                    <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Ref Aisl Vert.</th>
                    <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Ref Aisl Horiz.</th>
                  </tr>
                  <tr>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>I [W/mK]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>e Aisl [cm]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>I [W/mK]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>e Aisl [cm]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>D [cm]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>I [W/mK]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>e Aisl [cm]</th>
                    <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>D [cm]</th>
                  </tr>
                </thead>
                <tbody>
                  {pisosTabList.length > 0 ? (
                    pisosTabList.map((item, idx) => {
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
                    })
                  ) : (
                    <tr>
                      <td colSpan={9}>No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {tabStep4 === "ventanas" && (
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Nombre Elemento</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>U Vidrio [W/m²K]</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>FS Vidrio []</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Tipo Marco</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Tipo Cierre</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>U Marco [W/m²K]</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>FV [%]</th>
                  </tr>
                </thead>
                <tbody>
                  {ventanasTabList.length > 0 ? (
                    ventanasTabList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name_element}</td>
                        <td>{item.atributs?.u_vidrio?.toFixed(3) ?? "--"}</td>
                        <td>{item.atributs?.fs_vidrio ?? "--"}</td>
                        <td>{item.atributs?.frame_type ?? "--"}</td>
                        <td>{item.atributs?.clousure_type ?? "--"}</td>
                        <td>{item.u_marco?.toFixed(3) ?? "--"}</td>
                        <td>{item.fm ?? "--"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {tabStep4 === "puertas" && (
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Nombre Elemento</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>U puerta opaca [W/m²K]</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>Vidrio []</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>% vidrio</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>U Marco [W/m²K]</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>FM [%]</th>
                  </tr>
                </thead>
                <tbody>
                  {puertasTabList.length > 0 ? (
                    puertasTabList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name_element}</td>
                        <td>{item.atributs?.u_puerta_opaca?.toFixed(3) ?? "--"}</td>
                        <td>{item.atributs?.name_ventana ?? "--"}</td>
                        <td>{item.atributs?.porcentaje_vidrio ?? "--"}</td>
                        <td>{item.u_marco?.toFixed(3) ?? "--"}</td>
                        <td>{item.fm ?? "--"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Botones de navegación en la vista con pestañas (segunda pantalla) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <CustomButton variant="save" onClick={() => setShowTabsInStep4(false)} style={{ width: "200px" }}>
            <span className="material-icons" style={{ marginRight: "5px" }}>arrow_back</span>
            Ver Detalles
          </CustomButton>
          <CustomButton variant="save" onClick={handleSaveDetails} style={{ width: "200px" }}>
            <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
            Grabar datos
          </CustomButton>
        </div>
      </div>
    );
  };

  // Vista inicial: lista de detalles (primera pantalla)
  const renderInitialDetails = () => {
    if (showTabsInStep4) return null;
    return (
      <>
        <div className="mb-3 d-flex justify-content-between align-items-stretch">
          <div style={{ flex: 1, marginRight: "10px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: "38px" }}
            />
          </div>
          <CustomButton
            variant="save"
            onClick={() => {
              setShowNewDetailRow((prev) => !prev);
              if (!showNewDetailRow) fetchMaterials();
            }}
            style={{
              width: "200px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-icons">add</span> Nuevo
          </CustomButton>
        </div>
        <div className="mb-3">
          <div style={{ height: "400px", overflowY: "scroll" }}>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Ubicación Detalle
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre Detalle
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Material
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Espesor capa (cm)
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
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
                    <td className="d-flex gap-2 justify-content-center">
                      <CustomButton variant="save" onClick={handleCreateNewDetail}>
                        <span className="material-icons">add</span>
                      </CustomButton>
                      <CustomButton variant="cancelIcon" onClick={handleCancelNewDetail}>
                        <span className="material-icons">cancel</span>
                      </CustomButton>
                    </td>
                  </tr>
                )}
                {fetchedDetails
                  .filter((det) => {
                    const searchLower = searchQuery.toLowerCase();
                    return (
                      det.scantilon_location.toLowerCase().includes(searchLower) ||
                      det.name_detail.toLowerCase().includes(searchLower) ||
                      det.material.toLowerCase().includes(searchLower) ||
                      det.layer_thickness.toString().includes(searchLower)
                    );
                  })
                  .map((det) => (
                    <tr key={det.id_detail}>
                      <td>{det.scantilon_location}</td>
                      <td>{det.name_detail}</td>
                      <td>{det.material}</td>
                      <td>{det.layer_thickness}</td>
                      <td>{/* Acciones si son necesarias */}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Grupo de botones para navegar en la primera pantalla */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <CustomButton variant="save" onClick={() => setShowTabsInStep4(true)} style={{ width: "200px" }}>
            <span className="material-icons" style={{ marginRight: "5px" }}>arrow_forward</span>
            Ver datos guardados
          </CustomButton>
          <CustomButton variant="save" onClick={handleSaveDetails} style={{ width: "200px" }}>
            <span className="material-icons" style={{ marginRight: "5px" }}>sd_card</span>
            Grabar datos
          </CustomButton>
        </div>
      </>
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
                {step === 4 && (
                  <>
                    {renderInitialDetails()}
                    {renderStep4Tabs()}
                  </>
                )}

                {step === 7 && (
                  <>
                    <h5 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }} className="mb-3">
                      Recinto (Espacio aún en desarrollo, no funcional)
                    </h5>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div></div>
                    </div>
                    <div style={{ height: "500px", overflowY: "scroll" }}>
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th style={{ ...stickyHeaderStyle1 }}>ID</th>
                            <th style={{ ...stickyHeaderStyle1 }}>Estado</th>
                            <th style={{ ...stickyHeaderStyle1 }}>Nombre del Recinto</th>
                            <th style={{ ...stickyHeaderStyle1 }}>Perfil de Ocupación</th>
                            <th style={{ ...stickyHeaderStyle1 }}>Sensor CO2</th>
                            <th style={{ ...stickyHeaderStyle1 }}>Altura Promedio</th>
                            <th style={{ ...stickyHeaderStyle1 }}>Área</th>
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
                    </div>
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                      <CustomButton
                        variant="save"
                        onClick={() =>
                          Swal.fire("Datos guardados", "Se han guardado los datos del recinto (simulación)", "success")
                        }
                        style={{ width: "200px" }}
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
    </>
  );
};

export default ProjectWorkflowPart3;
