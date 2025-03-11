import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Card from "../src/components/common/Card";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";
import GooIcons from "../public/GoogleIcons";
import { Tooltip } from "react-tooltip";
import Modal from "../src/components/common/Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "../src/components/Title";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
// Importamos el componente SearchParameters
import SearchParameters from "../src/components/inputs/SearchParameters";

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

type TabStep4 =
  | "detalles"
  | "muros"
  | "techumbre"
  | "pisos"
  | "ventanas"
  | "puertas";

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

// Función para obtener variables CSS
function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

// Constantes de estilos
const stickyHeaderStyle1 = {
  position: "sticky" as const,
  top: 0,
  backgroundColor: "#fff",
  zIndex: 3,
  textAlign: "center" as const,
};

const stickyHeaderStyle2 = {
  position: "sticky" as const,
  top: 40,
  backgroundColor: "#fff",
  zIndex: 2,
  textAlign: "center" as const,
};

const WorkFlowpar2editPage: React.FC = () => {
  useAuth();
  const router = useRouter();

  // Estados generales
  const [projectId, setProjectId] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [step, setStep] = useState<number>(4);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para detalles y pestañas
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showNewDetailRow, setShowNewDetailRow] = useState(false);
  const [newDetailForm, setNewDetailForm] = useState<{
    scantilon_location: string;
    name_detail: string;
    material_id: number;
    layer_thickness: number | null;
  }>({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: null,
  });
  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  // Estados para cada pestaña
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [ventanasTabList, setVentanasTabList] = useState<Ventana[]>([]);
  const [puertasTabList, setPuertasTabList] = useState<Puerta[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Estados para edición en Muros y Techumbre
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingColors, setEditingColors] = useState<{
    interior: string;
    exterior: string;
  }>({
    interior: "Intermedio",
    exterior: "Intermedio",
  });
  const [editingTechRowId, setEditingTechRowId] = useState<number | null>(null);
  const [editingTechColors, setEditingTechColors] = useState<{
    interior: string;
    exterior: string;
  }>({
    interior: "Intermedio",
    exterior: "Intermedio",
  });

  // Inicialización de projectId y primaryColor
  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id_edit");
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

  useEffect(() => {
    if (router.query.step) {
      const queryStep = parseInt(router.query.step as string, 10);
      if (!isNaN(queryStep)) {
        setStep(queryStep);
      }
    }
  }, [router.query.step]);

  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);

  // Función auxiliar para obtener el token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

  // Función genérica para obtener datos de un endpoint
  const fetchData = useCallback(
    async <T,>(endpoint: string, setter: (data: T) => void) => {
      if (!projectId) return;
      const token = getToken();
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(endpoint, { headers });
        setter(response.data);
      } catch (error: unknown) {
        console.error(`Error al obtener datos desde ${endpoint}:`, error);
      }
    },
    [projectId]
  );

  // Envolvemos fetchFetchedDetails en useCallback para estabilidad en la dependencia
  const fetchFetchedDetails = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/details/`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setFetchedDetails(response.data || []);
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.");
    }
  }, []);

  const fetchMurosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/project/${projectId}/details/Muro`,
      (data) => {
        if (data && data.length > 0) setMurosTabList(data);
      }
    );
  }, [projectId, fetchData]);

  const fetchTechumbreDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/project/${projectId}/details/Techo`,
      setTechumbreTabList
    );
  }, [projectId, fetchData]);

  const fetchPisosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/project/${projectId}/details/Piso`,
      setPisosTabList
    );
  }, [projectId, fetchData]);

  const fetchVentanasDetails = useCallback(() => {
    const token = getToken();
    if (!token) return;
    axios
      .get(`${constantUrlApiEndpoint}/elements/?type=window`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setVentanasTabList(response.data))
      .catch((error) => {
        console.error("Error al obtener datos de ventanas:", error);
        toast.error("Error al obtener datos de ventanas. Ver consola.");
      });
  }, []);

  const fetchPuertasDetails = useCallback(() => {
    const token = getToken();
    if (!token) return;
    axios
      .get(`${constantUrlApiEndpoint}/elements/?type=door`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setPuertasTabList(response.data))
      .catch((error) => {
        console.error("Error al obtener datos de puertas:", error);
        toast.error("Error al obtener datos de puertas. Ver consola.");
      });
  }, []);

  // Efectos para carga de datos según el step y pestaña seleccionada
  useEffect(() => {
    if (step === 4) {
      fetchFetchedDetails();
    }
  }, [step, fetchFetchedDetails]);

  useEffect(() => {
    if (showTabsInStep4) {
      setTabStep4("muros");
    }
  }, [showTabsInStep4]);

  useEffect(() => {
    if (showTabsInStep4) {
      if (tabStep4 === "muros") fetchMurosDetails();
      else if (tabStep4 === "techumbre") fetchTechumbreDetails();
      else if (tabStep4 === "pisos") fetchPisosDetails();
      else if (tabStep4 === "ventanas") fetchVentanasDetails();
      else if (tabStep4 === "puertas") fetchPuertasDetails();
    }
  }, [
    showTabsInStep4,
    tabStep4,
    fetchMurosDetails,
    fetchTechumbreDetails,
    fetchPisosDetails,
    fetchVentanasDetails,
    fetchPuertasDetails,
  ]);

  // Función para crear un nuevo detalle y añadirlo directamente al proyecto
  const handleCreateNewDetail = async () => {
    if (!showNewDetailRow) return;
    if (
      !newDetailForm.scantilon_location ||
      !newDetailForm.name_detail ||
      !newDetailForm.material_id
    ) {
      toast.warning("Por favor complete todos los campos de detalle", {
        toastId: "material-warning",
      });
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      // Paso 1: Crear el nuevo detalle
      const createUrl = `${constantUrlApiEndpoint}/details/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(createUrl, newDetailForm, { headers });
      const newDetailId = response.data.detail.id;

      if (!newDetailId) {
        toast.error("El backend no devolvió un ID de detalle válido.");
        return;
      }

      // Paso 2: Añadir el detalle al proyecto directamente
      if (projectId) {
        const selectUrl = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
        // Asegurarnos de que estamos enviando un array de IDs
        const detailIds = [newDetailId];

        try {
          await axios.post(selectUrl, detailIds, { headers });
          toast.success("Detalle creado y añadido al proyecto exitosamente", {
            toastId: "detail-added-success",
          });
        } catch (selectError: unknown) {
          if (
            axios.isAxiosError(selectError) &&
            selectError.response?.data?.detail ===
              "Todos los detalles ya estaban en el proyecto"
          ) {
            toast.success("Detalle creado exitosamente", {
              toastId: "detail-created-success",
            });
          } else {
            console.error("Error al añadir detalle al proyecto:", selectError);
            toast.warning("Detalle creado pero no se pudo añadir al proyecto", {
              toastId: "detail-associated-error",
            });
          }
        }
      } else {
        toast.warning(
          "No se pudo añadir el detalle al proyecto (ID de proyecto no disponible)",
          { toastId: "project-id-missing" }
        );
      }

      // Actualizar la interfaz
      fetchFetchedDetails();
      setShowNewDetailRow(false);
      setNewDetailForm({
        scantilon_location: "",
        name_detail: "",
        material_id: 0,
        layer_thickness: null,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error en la creación del detalle:", error.response?.data);
        toast.error(error.response?.data?.detail || error.message, {
          toastId: "material-warning",
        });
      } else {
        toast.error("Error desconocido al crear el detalle", {
          toastId: "material-warning",
        });
      }
    }
  };

  const handleNewButtonClick = () => {
    setShowNewDetailRow(true);
    fetchMaterials();
  };

  // Función unificada para guardar detalles (se usa en dos contextos)
  const saveDetails = async () => {
    if (!projectId) {
      console.error("No se proporcionó un ID de proyecto.");
      return;
    }
    const token = getToken();
    if (!token) return;
    if (fetchedDetails.length === 0) {
      console.error("No se encontraron detalles para enviar.");
      return;
    }

    const detailIds = fetchedDetails.map((det) => det.id_detail);
    const url = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      await axios.post(url, detailIds, { headers });
      setShowTabsInStep4(true);
      setTabStep4("muros");
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.detail === "Todos los detalles ya estaban en el proyecto"
      ) {
        setShowTabsInStep4(true);
        setTabStep4("muros");
        return;
      }
      console.error("Error al enviar la solicitud:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles de la respuesta:", error.response?.data);
      }
    }
  };

  // Función corregida para guardar detalles en el proyecto
  const handleSaveDetailsCopy = useCallback(async () => {
    if (!projectId) {
      console.error("No se proporcionó un ID de proyecto.");
      return;
    }
    const token = getToken();
    if (!token) return;
    if (fetchedDetails.length === 0) {
      console.error("No se encontraron detalles para enviar.");
      return;
    }
    const detailIds = fetchedDetails.map((det) => det.id_detail);
    const url = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      await axios.post(url, detailIds, { headers });
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.detail === "Todos los detalles ya estaban en el proyecto"
      ) {
        return;
      }
      console.error("Error al enviar la solicitud:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles de la respuesta:", error.response?.data);
        console.error("Status code:", error.response?.status);
      }
    }
  }, [projectId, fetchedDetails]);

  useEffect(() => {
    if (fetchedDetails.length > 0) {
      handleSaveDetailsCopy();
    }
  }, [fetchedDetails, handleSaveDetailsCopy]);

  const fetchMaterials = async () => {
    const token = getToken();
    if (!token) return;
    try {
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
      toast.error("Error al obtener materiales.", {
        toastId: "material-warning",
      });
    }
  };

  // Funciones para edición de Muros
  const handleEditClick = (detail: TabItem) => {
    setEditingRowId(detail.id || null);
    setEditingColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleCancelEdit = (detail: TabItem) => {
    setEditingColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
    setEditingRowId(null);
  };

  const handleConfirmEdit = async (detail: TabItem) => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/project/${projectId}/update_details/Muro/${detail.id}`;
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
      await axios.put(url, payload, { headers });
      toast.success("Detalle tipo Muro actualizado con éxito", {
        toastId: "material-sucess",
      });
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
      toast.error("Error al actualizar detalle. Ver consola.");
    }
  };

  // Funciones para edición de Techumbre (similar a Muros)
  const handleEditTechClick = (detail: TabItem) => {
    setEditingTechRowId(detail.id || null);
    setEditingTechColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleCancelTechEdit = (detail: TabItem) => {
    setEditingTechRowId(null);
    setEditingTechColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleConfirmTechEdit = async (detail: TabItem) => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/project/${projectId}/update_details/Techo/${detail.id}`;
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
      await axios.put(url, payload, { headers });
      toast.success("Detalle tipo Techo actualizado con éxito", {
        toastId: "material-success",
      });
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
      toast.error("Error al actualizar detalle. Ver consola.");
    }
  };

  // Renderizado de encabezado principal
  const renderMainHeader = () => (
    <Title text="Edicion de Desarrollo de proyecto" />
  );

  // Renderizado de pestañas en el paso 4
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
        <ul
          className="nav"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: 0,
            listStyle: "none",
          }}
        >
          {tabs.map((item) => (
            <li key={item.key} style={{ flex: 1, minWidth: "100px" }}>
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#fff",
                  color:
                    tabStep4 === item.key
                      ? primaryColor
                      : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    tabStep4 === item.key
                      ? `3px solid ${primaryColor}`
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
        <div style={{ height: "400px", position: "relative" }}>
          {tabStep4 === "muros" && (
            <div>
              <table
                className="table table-bordered table-striped"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Nombre Abreviado
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Valor U (W/m²K)
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Color Exterior
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Color Interior
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {murosTabList.length > 0 ? (
                    murosTabList.map((item) => (
                      <tr key={item.id || item.id_detail}>
                        <td>{item.name_detail}</td>
                        <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                        <td>
                          {editingRowId === item.id ? (
                            <select
                              value={editingColors.exterior}
                              onChange={(e) =>
                                setEditingColors((prev) => ({
                                  ...prev,
                                  exterior: e.target.value,
                                }))
                              }
                            >
                              <option value="Claro">Claro</option>
                              <option value="Oscuro">Oscuro</option>
                              <option value="Intermedio">Intermedio</option>
                            </select>
                          ) : (
                            item.info?.surface_color?.exterior?.name ||
                            "Desconocido"
                          )}
                        </td>
                        <td>
                          {editingRowId === item.id ? (
                            <select
                              value={editingColors.interior}
                              onChange={(e) =>
                                setEditingColors((prev) => ({
                                  ...prev,
                                  interior: e.target.value,
                                }))
                              }
                            >
                              <option value="Claro">Claro</option>
                              <option value="Oscuro">Oscuro</option>
                              <option value="Intermedio">Intermedio</option>
                            </select>
                          ) : (
                            item.info?.surface_color?.interior?.name ||
                            "Desconocido"
                          )}
                        </td>
                        <td>
                          {editingRowId === item.id ? (
                            <>
                              <CustomButton
                                variant="save"
                                onClick={() => handleConfirmEdit(item)}
                                style={{
                                  fontSize: "clamp(0.5rem, 1vw, 0.8rem)",
                                  padding:
                                    "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                                }}
                              >
                                <span className="material-icons">check</span>
                              </CustomButton>
                              <CustomButton
                                variant="cancelIcon"
                                onClick={() => handleCancelEdit(item)}
                                style={{
                                  fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
                                  padding:
                                    "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                                  marginLeft: "clamp(5px, 1vw, 10px)",
                                }}
                              >
                                Deshacer
                              </CustomButton>
                            </>
                          ) : (
                            <CustomButton
                              variant="editIcon"
                              onClick={() => handleEditClick(item)}
                              style={{
                                fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
                                padding:
                                  "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                              }}
                            >
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
            </div>
          )}
          {tabStep4 === "techumbre" && (
            <div style={{ overflowX: "auto" }}>
              <table
                className="table table-bordered table-striped"
                style={{ width: "100%", minWidth: "600px" }}
              >
                <thead>
                  <tr>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Nombre Abreviado
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Valor U (W/m²K)
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Color Exterior
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Color Interior
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {techumbreTabList.length > 0 ? (
                    techumbreTabList.map((item) => (
                      <tr key={item.id || item.id_detail}>
                        <td>{item.name_detail}</td>
                        <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                        <td>
                          {editingTechRowId === item.id ? (
                            <select
                              value={editingTechColors.exterior}
                              onChange={(e) =>
                                setEditingTechColors((prev) => ({
                                  ...prev,
                                  exterior: e.target.value,
                                }))
                              }
                            >
                              <option value="Claro">Claro</option>
                              <option value="Oscuro">Oscuro</option>
                              <option value="Intermedio">Intermedio</option>
                            </select>
                          ) : (
                            item.info?.surface_color?.exterior?.name ||
                            "Desconocido"
                          )}
                        </td>
                        <td>
                          {editingTechRowId === item.id ? (
                            <select
                              value={editingTechColors.interior}
                              onChange={(e) =>
                                setEditingTechColors((prev) => ({
                                  ...prev,
                                  interior: e.target.value,
                                }))
                              }
                            >
                              <option value="Claro">Claro</option>
                              <option value="Oscuro">Oscuro</option>
                              <option value="Intermedio">Intermedio</option>
                            </select>
                          ) : (
                            item.info?.surface_color?.interior?.name ||
                            "Desconocido"
                          )}
                        </td>
                        <td>
                          {editingTechRowId === item.id ? (
                            <>
                              <CustomButton
                                variant="save"
                                onClick={() => handleConfirmTechEdit(item)}
                                style={{
                                  fontSize: "clamp(0.5rem, 1vw, 0.8rem)",
                                  padding:
                                    "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                                }}
                              >
                                <span className="material-icons">check</span>
                              </CustomButton>
                              <CustomButton
                                variant="cancelIcon"
                                onClick={() => handleCancelTechEdit(item)}
                                style={{
                                  fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
                                  padding:
                                    "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                                  marginLeft: "clamp(5px, 1vw, 10px)",
                                }}
                              >
                                Deshacer
                              </CustomButton>
                            </>
                          ) : (
                            <CustomButton
                              variant="editIcon"
                              onClick={() => handleEditTechClick(item)}
                              style={{
                                fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
                                padding:
                                  "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                              }}
                            >
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
            </div>
          )}
          {tabStep4 === "pisos" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    style={{ ...stickyHeaderStyle1, color: primaryColor }}
                  >
                    Nombre
                  </th>
                  <th
                    rowSpan={2}
                    style={{ ...stickyHeaderStyle1, color: primaryColor }}
                  >
                    U [W/m²K]
                  </th>
                  <th
                    colSpan={2}
                    style={{ ...stickyHeaderStyle1, color: primaryColor }}
                  >
                    Aislamiento bajo piso
                  </th>
                  <th
                    colSpan={3}
                    style={{ ...stickyHeaderStyle1, color: primaryColor }}
                  >
                    Ref Aisl Vert.
                  </th>
                  <th
                    colSpan={3}
                    style={{ ...stickyHeaderStyle1, color: primaryColor }}
                  >
                    Ref Aisl Horiz.
                  </th>
                </tr>
                <tr>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    I [W/mK]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    I [W/mK]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    D [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    I [W/mK]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    D [cm]
                  </th>
                </tr>
              </thead>
              <tbody>
                {pisosTabList.length > 0 ? (
                  pisosTabList.map((item) => {
                    const bajoPiso = item.info?.aislacion_bajo_piso || {};
                    const vert = item.info?.ref_aisl_vertical || {};
                    const horiz = item.info?.ref_aisl_horizontal || {};
                    return (
                      <tr key={item.id || item.id_detail}>
                        <td style={{ textAlign: "center" }}>
                          {item.name_detail}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.value_u?.toFixed(3) ?? "--"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {bajoPiso.lambda ? bajoPiso.lambda.toFixed(3) : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {bajoPiso.e_aisl ? bajoPiso.e_aisl : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {vert.lambda ? vert.lambda.toFixed(3) : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {vert.e_aisl ? vert.e_aisl : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {vert.d ? vert.d : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {horiz.lambda ? horiz.lambda.toFixed(3) : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {horiz.e_aisl ? horiz.e_aisl : "N/A"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {horiz.d ? horiz.d : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center" }}>
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {tabStep4 === "ventanas" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Nombre Elemento
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    U Vidrio [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    FS Vidrio []
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Tipo Marco
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Tipo Cierre
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    U Marco [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    FV [%]
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventanasTabList.length > 0 ? (
                  ventanasTabList.map((item, idx) => (
                    <tr key={item.name_element + idx}>
                      <td style={{ textAlign: "center" }}>
                        {item.name_element}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.u_vidrio?.toFixed(3) ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.fs_vidrio ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.frame_type ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.clousure_type ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.u_marco?.toFixed(3) ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.fm ?? "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {tabStep4 === "puertas" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Nombre Elemento
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    U puerta opaca [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Vidrio []
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    % vidrio
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    U Marco [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    FM [%]
                  </th>
                </tr>
              </thead>
              <tbody>
                {puertasTabList.length > 0 ? (
                  puertasTabList.map((item, idx) => (
                    <tr key={item.name_element + idx}>
                      <td style={{ textAlign: "center" }}>
                        {item.name_element}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.u_puerta_opaca?.toFixed(3) ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.name_ventana ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.atributs?.porcentaje_vidrio ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.u_marco?.toFixed(3) ?? "--"}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.fm ?? "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: "10px",
          }}
        >
          <CustomButton
            variant="save"
            onClick={() => setShowTabsInStep4(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 67px",
              borderRadius: "8px",
              height: "40px",
              marginTop: "30px",
            }}
          >
            <span className="material-icons" style={{ fontSize: "24px" }}>
              arrow_back
            </span>
            &nbsp;Regresar
          </CustomButton>
        </div>
      </div>
    );
  };

  // Renderizado de la vista inicial de detalles utilizando SearchParameters
  const renderInitialDetails = () => {
    if (showTabsInStep4) return null;
    return (
      <>
        <div className="mb-3">
          {/* Se reemplaza el input de búsqueda por el componente SearchParameters */}
          <SearchParameters
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar..."
            onNew={handleNewButtonClick}
            style={{ height: "50px" }}
          />
        </div>
        <div className="mb-3">
          <div style={{ height: "400px", overflowY: "scroll" }}>
            <table
              className="table table-bordered table-striped"
              style={{ textAlign: "center" }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                    }}
                  >
                    Ubicación Detalle
                  </th>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                    }}
                  >
                    Nombre Detalle
                  </th>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                    }}
                  >
                    Material
                  </th>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                    }}
                  >
                    Espesor capa (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {showNewDetailRow && (
                  <Modal
                    isOpen={showNewDetailRow}
                    onClose={() => setShowNewDetailRow(false)}
                    title="Agregar Nuevo Detalle Constructivo"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        padding: "20px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label
                          style={{
                            textAlign: "left",
                            fontWeight: "normal",
                            marginBottom: "5px",
                          }}
                        >
                          Ubicación del Detalle
                        </label>
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
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label
                          style={{
                            textAlign: "left",
                            fontWeight: "normal",
                            marginBottom: "5px",
                          }}
                        >
                          Nombre del Detalle
                        </label>
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
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label
                          style={{
                            textAlign: "left",
                            fontWeight: "normal",
                            marginBottom: "5px",
                          }}
                        >
                          Material
                        </label>
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
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label
                          style={{
                            textAlign: "left",
                            fontWeight: "normal",
                            marginBottom: "5px",
                          }}
                        >
                          Espesor de la Capa (cm)
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          className="form-control"
                          placeholder="Espesor (cm)"
                          value={
                            newDetailForm.layer_thickness === null
                              ? ""
                              : newDetailForm.layer_thickness
                          }
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value.replace(/[^0-9.]/g, "");
                            const value = inputValue ? parseFloat(inputValue) : null;
                            if (value === null || value >= 0) {
                              setNewDetailForm((prev) => ({
                                ...prev,
                                layer_thickness: value,
                              }));
                            }
                          }}
                          min="0"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "15px",
                        paddingRight: "15px",
                      }}
                    >
                      <CustomButton
                        variant="save"
                        onClick={() => {
                          setShowNewDetailRow(false);
                          setNewDetailForm({
                            scantilon_location: "",
                            name_detail: "",
                            material_id: 0,
                            layer_thickness: null,
                          });
                        }}
                      >
                        Cancelar
                      </CustomButton>
                      <CustomButton
                        variant="save"
                        onClick={async () => {
                          await handleCreateNewDetail();
                        }}
                        id="grabar-datos-btn"
                      >
                        Crear Detalles
                      </CustomButton>
                      <Tooltip anchorSelect="#grabar-datos-btn" place="top">
                        Guardar cambios tras agregar un detalle
                      </Tooltip>
                    </div>
                  </Modal>
                )}
                {fetchedDetails
                  .filter((det) => {
                    const searchLower = searchQuery.toLowerCase();
                    return (
                      det.scantilon_location
                        .toLowerCase()
                        .includes(searchLower) ||
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  // Renderizado de Recinto (en desarrollo)
  const renderRecinto = () => {
    return (
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
        </div>
        <div style={{ height: "390px", overflowY: "scroll" }}>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th style={stickyHeaderStyle1}>ID</th>
                <th style={stickyHeaderStyle1}>Estado</th>
                <th style={stickyHeaderStyle1}>Nombre del Recinto</th>
                <th style={stickyHeaderStyle1}>Perfil de Ocupación</th>
                <th style={stickyHeaderStyle1}>Sensor CO2</th>
                <th style={stickyHeaderStyle1}>Altura Promedio</th>
                <th style={stickyHeaderStyle1}>Área</th>
              </tr>
            </thead>
            <tbody>{/* Lógica para mostrar los recintos */}</tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        ></div>
      </>
    );
  };

  // Función para manejar el cambio de paso en la barra lateral.
  // Para los pasos 1 y 2 se redirige vía router, para los demás se actualiza el estado local.
  const handleSidebarStepChange = (newStep: number) => {
    if (newStep === 1) {
      router.push(`/workflow-part1-edit?id=${projectId}&step=1`);
    } else if (newStep === 2) {
      router.push(`/workflow-part1-edit?id=${projectId}&step=2`);
    } else {
      setStep(newStep);
    }
  };

  // Definición de los pasos para el sidebar
  const sidebarSteps = [
    {
      stepNumber: 1,
      iconName: "assignment_ind",
      title:
        "Agregar detalles de propietario / proyecto y clasificación de edificaciones",
    },
    {
      stepNumber: 2,
      iconName: "location_on",
      title: "Ubicación del proyecto",
    },
    {
      stepNumber: 4,
      iconName: "build",
      title: "Detalles constructivos",
    },
    {
      stepNumber: 7,
      iconName: "design_services",
      title: "Recinto",
    },
  ];

  return (
    <>
      <GooIcons />
      <div>
        <Card>
        <h3 style={{paddingBottom: "2rem"}}>{renderMainHeader()}</h3>
          <div className="d-flex align-items-center gap-4">
            <span
              style={{
                fontWeight: "normal",
                fontFamily: "var(--font-family-base)",
              }}
            >
              Proyecto:
            </span>
            <CustomButton
              variant="save"
              className="no-hover"
              style={{ padding: "0.8rem 3rem" }}
            >
              {`Edificación Nº ${projectId ?? "xxxxx"}`}
            </CustomButton>
          </div>
        </Card>
        <Card
          style={{
            marginTop: "clamp(0.5rem, 2vw, 1rem)",
            marginLeft: "0.1rem",
            width: "100%",
          }}
        >
          <div className="row">
            <div className="col-lg-3 col-12 order-lg-first order-first">
              <div className="mb-3 mb-lg-0">
                <AdminSidebar
                  activeStep={step}
                  onStepChange={handleSidebarStepChange}
                  steps={sidebarSteps}
                />
              </div>
            </div>
            <div className="col-lg-9 col-12 order-last">
              <div style={{ padding: "20px" }}>
                {step === 4 && (
                  <>
                    {showTabsInStep4
                      ? renderStep4Tabs()
                      : renderInitialDetails()}
                  </>
                )}
                {step === 7 && renderRecinto()}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <style jsx global>{`
        .no-hover {
          transition: none !important;
          cursor: default !important;
          pointer-events: none !important;
        }
        .no-hover:hover {
          box-shadow: none !important;
          transform: none !important;
        }
      `}</style>
    </>
  );
};

export default WorkFlowpar2editPage;
