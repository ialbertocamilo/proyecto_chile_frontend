import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import { notify } from "@/utils/notify";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import GooIcons from "../public/GoogleIcons";
import Title from "../src/components/Title";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import SearchParameters from "../src/components/inputs/SearchParameters";
import useAuth from "../src/hooks/useAuth";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

// Importamos nuestro componente genérico de tablas
import Breadcrumb from "@/components/common/Breadcrumb";
import TablesParameters from "../src/components/tables/TablesParameters";
import { NewDetailModal } from "@/components/modals/NewDetailModal";
// Importamos nuestro nuevo componente de modales
import ModalCreate from "@/components/common/ModalCreate";
import TabRecintDataCreate from "../src/components/tab_recint_data/TabRecintDataEdit";

// -----------------------
// Componente para el Modal de Detalles (detalles individuales de un registro)
// -----------------------
interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail: string;
  id_material: number;
  material: string;
  layer_thickness: number;
  created_status: string;
}

interface DetailModalProps {
  detail: Detail | null;
  show: boolean;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ detail, show, onClose }) => {
  if (!detail) return null;
  return (
    <ModalCreate
      detail={null}
      isOpen={show}
      onClose={onClose}
      onSave={onClose} // Se usa la misma acción para cerrar
      title="Detalles Generales"
      hideFooter={false}
    >
      <p>
        <strong>Ubicación:</strong> {detail.scantilon_location}
      </p>
      <p>
        <strong>Nombre:</strong> {detail.name_detail}
      </p>
      <p>
        <strong>Material:</strong> {detail.material}
      </p>
      <p>
        <strong>Espesor de capa:</strong> {detail.layer_thickness} cm
      </p>
    </ModalCreate>
  );
};

// -----------------------
// Interfaces adicionales
// -----------------------
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
  id: number;
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
  id: number;
  name_element: string;
  atributs?: {
    u_puerta_opaca?: number;
    name_ventana?: string;
    porcentaje_vidrio?: number;
  };
  u_marco?: number;
  fm?: number;
}

// -----------------------
// Constantes para estilos de cabeceras fijas
// -----------------------
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

// -----------------------
// Componente principal
// -----------------------
const WorkFlowpar2editPage: React.FC = () => {
  useAuth();
  const router = useRouter();

  // ===================== ESTADOS GENERALES ======================
  const [projectId, setProjectId] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [step, setStep] = useState<number>(4);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para almacenar nombre de proyecto y región desde localStorage
  const [projectName, setProjectName] = useState("");
  const [region, setRegion] = useState("");

  // ===================== ESTADOS DETALLES ======================
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
  const [showTabsInStep4, setShowTabsInStep4] = useState(true);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  // ===================== ESTADOS POR PESTAÑA ======================
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [ventanasTabList, setVentanasTabList] = useState<Ventana[]>([]);
  const [puertasTabList, setPuertasTabList] = useState<Puerta[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // ===================== ESTADOS EDICIÓN MUROS / TECHUMBRE ======================
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

  // ===================== ESTADOS EDICIÓN PISOS ======================
  const [editingPisosRowId, setEditingPisosRowId] = useState<number | null>(null);
  const [editingPisosData, setEditingPisosData] = useState<{
    ref_aisl_vertical: { lambda: string; e_aisl: string; d: string };
    ref_aisl_horizontal: { lambda: string; e_aisl: string; d: string };
  }>({
    ref_aisl_vertical: { lambda: "", e_aisl: "", d: "" },
    ref_aisl_horizontal: { lambda: "", e_aisl: "", d: "" },
  });

  // ===================== ESTADOS PARA MODALES ======================
  const [selectedDetail, setSelectedDetail] = useState<Detail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // NUEVO estado para el modal que muestra la tabla de Detalles Generales
  const [showDetallesModal, setShowDetallesModal] = useState(false);

  // ===================== ESTADOS PARA EDICIÓN DE VENTANAS Y PUERTAS ======================
  const [editingVentana, setEditingVentana] = useState<Ventana | null>(null);
  const [editingPuerta, setEditingPuerta] = useState<Puerta | null>(null);

  // ===================== NUEVOS ESTADOS PARA MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ======================
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: number; type: "window" | "door" } | null>(null);

  // ===================== INIT ======================
  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id_edit");
    console.log("Cargando ID del proyecto:", storedProjectId);
    if (storedProjectId) {
      setProjectId(Number(storedProjectId));
    } else {
      console.warn("No se encontró ID del proyecto en localStorage");
    }
    // Obtenemos el nombre del proyecto y la región desde localStorage
    const storedProjectName = localStorage.getItem("project_name_edit") || "";
    const storedRegion = localStorage.getItem("project_department_edit") || "";
    setProjectName(storedProjectName);
    setRegion(storedRegion);

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
    const pColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim() || "#3ca7b7";
    setPrimaryColor(pColor);
  }, []);

  // ===================== FUNCIONES AUXILIARES ======================
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

  const fetchData = useCallback(
    async <T,>(endpoint: string, setter: (data: T) => void) => {
      if (!projectId) {
        console.log("No se puede obtener datos sin un ID de proyecto");
        return;
      }
      const token = getToken();
      if (!token) return;
      try {
        console.log("Fetching data from:", endpoint);
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(endpoint, { headers });
        setter(response.data);
      } catch (error: unknown) {
        console.error(`Error al obtener datos desde ${endpoint}:`, error);
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.error("Error status:", error.response?.status);
        }
      }
    },
    [projectId]
  );

  // ===================== OBTENCIÓN DE DATOS ======================
  const fetchFetchedDetails = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    console.log("Fetching details with projectId:", projectId);
    try {
      const url = `${constantUrlApiEndpoint}/user/details/?project_id=${projectId}`;
      console.log("Request URL:", url);
      const headers = { Authorization: `Bearer ${token}` };
      console.log("Using token:", token.substring(0, 10) + "...");
      const response = await axios.get(url, { headers });
      setFetchedDetails(response.data || []);
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      Swal.fire("Error", "Error al obtener detalles. Ver consola.");
    }
  }, [projectId]);

  const fetchMurosDetails = useCallback(() => {
    if (!projectId) {
      console.log("No se puede obtener detalles de muros sin ID de proyecto");
      return;
    }
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
        notify("Reinicie sesion, por favor.");
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
        notify("Reinicie sesion por favor.");
      });
  }, []);

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
      notify("Reinicie sesion y vuelvalo a intentar.");
    }
  };

  // ===================== EFFECTS ======================
  useEffect(() => {
    if (step === 4 && projectId !== null) {
      fetchFetchedDetails();
    }
  }, [step, fetchFetchedDetails, projectId]);

  useEffect(() => {
    if (showTabsInStep4) {
      setTabStep4("muros");
    }
  }, [showTabsInStep4]);

  useEffect(() => {
    if (showTabsInStep4 && projectId !== null) {
      if (tabStep4 === "muros") fetchMurosDetails();
      else if (tabStep4 === "techumbre") fetchTechumbreDetails();
      else if (tabStep4 === "pisos") fetchPisosDetails();
      else if (tabStep4 === "ventanas") fetchVentanasDetails();
      else if (tabStep4 === "puertas") fetchPuertasDetails();
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

  // ===================== CREAR DETALLE ======================
  const handleCreateNewDetail = async () => {
    if (!showNewDetailRow) return;
    if (
      !newDetailForm.scantilon_location ||
      !newDetailForm.name_detail ||
      !newDetailForm.material_id
    ) {
      notify("Por favor complete todos los campos de Detalle.");
      return;
    }
    const token = getToken();
    if (!token) return;
    try {
      // Paso 1: Crear el nuevo detalle
      const createUrl = `${constantUrlApiEndpoint}/user/details/create?project_id=${projectId}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(createUrl, newDetailForm, { headers });
      const newDetailId = response.data.detail.id;
      if (!newDetailId) {
        notify("Reinicie sesion y vuelvalo a intentar.");
        return;
      }
      // Paso 2: Añadir el detalle al proyecto
      if (projectId) {
        const selectUrl = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
        const detailIds = [newDetailId];
        try {
          await axios.post(selectUrl, detailIds, { headers });
          notify("Detalle creado y añadido al proyecto exitosamente.");
        } catch (selectError: unknown) {
          if (
            axios.isAxiosError(selectError) &&
            selectError.response?.data?.detail ===
              "Todos los detalles ya estaban en el proyecto"
          ) {
            notify("Detalle creado exitosamente.");
          } else {
            console.error("Error al añadir detalle al proyecto:", selectError);
            notify("Detalle creado pero no se añadio al proyecto.");
          }
        }
      } else {
        notify("No se añadio el detalle al proyecto.");
      }
      // Actualizamos la interfaz y cerramos el modal de creación
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
        notify("Reinicie sesion y vuelvalo a intentar.");
      }
    }
  };

  const handleNewButtonClick = () => {
    setShowNewDetailRow(true);
    fetchMaterials();
  };

  // ===================== GUARDAR DETALLES ======================
  const saveDetails = () => {
    if (!projectId) {
      notify("No se puede continuar sin un ID de proyecto");
      return;
    }
    // Cambia la vista para mostrar la pestaña de detalles
    setShowTabsInStep4(true);
    setTabStep4("muros");
  };

  // ===================== EDICIÓN MUROS ======================
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
      notify("Detalle tipo Muro actualizado con éxito.");
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
      notify("Error al actualizar Detalle. Ver consola.");
    }
  };

  // ===================== EDICIÓN TECHUMBRE ======================
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
      notify("Detalle tipo Techo actualizado con éxito.");
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
    }
  };

  // ===================== EDICIÓN PISOS ======================
  const handleEditPisosClick = (detail: TabItem) => {
    setEditingPisosRowId(detail.id || null);
    setEditingPisosData({
      ref_aisl_vertical: {
        lambda:
          detail.info?.ref_aisl_vertical?.lambda !== undefined
            ? detail.info.ref_aisl_vertical.lambda.toString()
            : "",
        e_aisl:
          detail.info?.ref_aisl_vertical?.e_aisl !== undefined
            ? detail.info.ref_aisl_vertical.e_aisl.toString()
            : "",
        d:
          detail.info?.ref_aisl_vertical?.d !== undefined
            ? detail.info.ref_aisl_vertical.d.toString()
            : "",
      },
      ref_aisl_horizontal: {
        lambda:
          detail.info?.ref_aisl_horizontal?.lambda !== undefined
            ? detail.info.ref_aisl_horizontal.lambda.toString()
            : "",
        e_aisl:
          detail.info?.ref_aisl_horizontal?.e_aisl !== undefined
            ? detail.info.ref_aisl_horizontal.e_aisl.toString()
            : "",
        d:
          detail.info?.ref_aisl_horizontal?.d !== undefined
            ? detail.info.ref_aisl_horizontal.d.toString()
            : "",
      },
    });
  };

  const handleCancelPisosEdit = (detail: TabItem) => {
    setEditingPisosRowId(null);
  };

  const handleConfirmPisosEdit = async (detail: TabItem) => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/project/${projectId}/update_details/Piso/${detail.id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        info: {
          ref_aisl_vertical: {
            lambda: parseFloat(editingPisosData.ref_aisl_vertical.lambda),
            e_aisl: parseFloat(editingPisosData.ref_aisl_vertical.e_aisl),
            d: parseFloat(editingPisosData.ref_aisl_vertical.d),
          },
          ref_aisl_horizontal: {
            lambda: parseFloat(editingPisosData.ref_aisl_horizontal.lambda),
            e_aisl: parseFloat(editingPisosData.ref_aisl_horizontal.e_aisl),
            d: parseFloat(editingPisosData.ref_aisl_horizontal.d),
          },
        },
      };
      await axios.put(url, payload, { headers });
      notify("Detalle tipo Piso actualizado con éxito.");
      setPisosTabList((prev) =>
        prev.map((item) =>
          item.id === detail.id
            ? {
                ...item,
                info: {
                  ...item.info,
                  ref_aisl_vertical: {
                    lambda: payload.info.ref_aisl_vertical.lambda,
                    e_aisl: payload.info.ref_aisl_vertical.e_aisl,
                    d: payload.info.ref_aisl_vertical.d,
                  },
                  ref_aisl_horizontal: {
                    lambda: payload.info.ref_aisl_horizontal.lambda,
                    e_aisl: payload.info.ref_aisl_horizontal.e_aisl,
                    d: payload.info.ref_aisl_horizontal.d,
                  },
                },
              }
            : item
        )
      );
      setEditingPisosRowId(null);
    } catch (error) {
      console.error("Error al actualizar detalle de Piso:", error);
      notify("Error al actualizar Detalle de Piso. Ver consola.");
    }
  };

  // ===================== NUEVO MANEJADOR PARA ABRIR EL MODAL DE DETALLES GENERALES ======================
  const openDetallesModal = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
    if (targetTag === "input" || targetTag === "select" || targetTag === "textarea") {
      return; // No se abre el modal si se clickea en un campo editable
    }
    setShowDetallesModal(true);
  };

  // ===================== MODO DE MOSTRAR DETALLES DE UN REGISTRO ======================
  const handleRowClick = (detail: Detail) => {
    setSelectedDetail(detail);
    setShowDetailModal(true);
  };

  // ===================== FUNCIONES PARA EL MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ======================
  const openDeleteModal = (id: number, type: "window" | "door") => {
    setDeleteItem({ id, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem || !projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/elements/${deleteItem.id}/delete?type=${deleteItem.type}`;
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(url, { headers });
      notify(
        `${deleteItem.type === "window" ? "Ventana" : "Puerta"} eliminada exitosamente.`
      );
      if (deleteItem.type === "window") {
        setVentanasTabList((prev) => prev.filter((v: any) => v.id !== deleteItem.id));
      } else {
        setPuertasTabList((prev) => prev.filter((p: any) => p.id !== deleteItem.id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      notify("Error al eliminar");
    } finally {
      setShowDeleteModal(false);
      setDeleteItem(null);
    }
  };

  // ===================== RENDER DEL MODAL PARA DETALLES GENERALES (TABLA) ======================
  const renderDetallesModalContent = () => {
    const detailTypeMapping: { [key in TabStep4]?: string } = {
      muros: "Muro",
      techumbre: "Techo",
      pisos: "Piso",
    };
    const detailType = detailTypeMapping[tabStep4];
    const filteredDetails = detailType
      ? fetchedDetails.filter(
          (det) =>
            det.scantilon_location.toLowerCase() === detailType.toLowerCase()
        )
      : fetchedDetails;
    const columnsDetails = [
      { headerName: "Ubicación Detalle", field: "scantilon_location" },
      { headerName: "Nombre Detalle", field: "name_detail" },
      { headerName: "Material", field: "material" },
      { headerName: "Espesor capa (cm)", field: "layer_thickness" },
    ];
    const data = filteredDetails.map((det) => ({
      scantilon_location: det.scantilon_location,
      name_detail: det.name_detail,
      material: det.material,
      layer_thickness: det.layer_thickness,
    }));
    return (
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <TablesParameters columns={columnsDetails} data={data} />
      </div>
    );
  };

  // ===================== RENDER CABECERA PRINCIPAL ======================
  const renderMainHeader = () => <Title text="Edición de Proyecto" />;

  // ===================== RENDER INICIAL DETALLES ======================
  const renderInitialDetails = () => {
    if (showTabsInStep4) return null;
    const filteredData = fetchedDetails.filter((det) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        det.scantilon_location.toLowerCase().includes(searchLower) ||
        det.name_detail.toLowerCase().includes(searchLower) ||
        det.material.toLowerCase().includes(searchLower) ||
        det.layer_thickness.toString().includes(searchLower)
      );
    });
    return (
      <>
        <div style={{ height: "400px", overflowY: "auto", overflowX: "auto" }}>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Ubicación Detalle</th>
                <th>Nombre Detalle</th>
                <th>Material</th>
                <th>Espesor capa (cm)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((det) => (
                <tr
                  key={det.id_detail}
                  onClick={() => handleRowClick(det)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{det.scantilon_location}</td>
                  <td>{det.name_detail}</td>
                  <td>{det.material}</td>
                  <td>{det.layer_thickness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          <div>
            <div style={{ marginTop: "30px", marginBottom: "10px", width: "100%" }}>
              <CustomButton
                id="mostrar-datos-btn"
                variant="save"
                onClick={saveDetails}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "clamp(0.5rem, 1vw, 1rem) clamp(1rem, 4vw, 2rem)",
                  height: "min(3rem, 8vh)",
                  minWidth: "6rem",
                }}
              >
                <span className="material-icons">arrow_back</span> Volver
              </CustomButton>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ===================== RENDER MUROS ======================
  const renderMurosParameters = () => {
    const columnsMuros = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
      { headerName: "Acciones", field: "acciones" },
    ];
    const murosData = murosTabList.map((item) => {
      const isEditing = editingRowId === item.id;
      return {
        __detail: item,
        nombreAbreviado: item.name_detail,
        valorU: item.value_u !== undefined && item.value_u !== 0 ? item.value_u.toFixed(3) : "-",
        colorExterior: isEditing ? (
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
          item.info?.surface_color?.exterior?.name || "Desconocido"
        ),
        colorInterior: isEditing ? (
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
          item.info?.surface_color?.interior?.name || "Desconocido"
        ),
        acciones: isEditing ? (
          <>
            <CustomButton
              className="btn-table"
              variant="save"
              onClick={(e) => { e.stopPropagation(); handleConfirmEdit(item); }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={(e) => { e.stopPropagation(); handleCancelEdit(item); }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
          >
            Editar
          </CustomButton>
        ),
      };
    });
    return (
      <div style={{ overflowX: "auto" }} onClick={openDetallesModal}>
        {murosTabList.length > 0 ? (
          <TablesParameters columns={columnsMuros} data={murosData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // ===================== RENDER TECHUMBRE ======================
  const renderTechumbreParameters = () => {
    const columnsTech = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
      { headerName: "Acciones", field: "acciones" },
    ];
    const techData = techumbreTabList.map((item) => {
      const isEditing = editingTechRowId === item.id;
      return {
        __detail: item,
        nombreAbreviado: item.name_detail,
        valorU: item.value_u !== undefined && item.value_u !== 0 ? item.value_u.toFixed(3) : "-",
        colorExterior: isEditing ? (
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
          item.info?.surface_color?.exterior?.name || "Desconocido"
        ),
        colorInterior: isEditing ? (
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
          item.info?.surface_color?.interior?.name || "Desconocido"
        ),
        acciones: isEditing ? (
          <>
            <CustomButton
              className="btn-table"
              variant="save"
              onClick={(e) => { e.stopPropagation(); handleConfirmTechEdit(item); }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={(e) => { e.stopPropagation(); handleCancelTechEdit(item); }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e) => { e.stopPropagation(); handleEditTechClick(item); }}
          >
            Editar
          </CustomButton>
        ),
      };
    });
    return (
      <div style={{ overflowX: "auto" }} onClick={openDetallesModal}>
        {techumbreTabList.length > 0 ? (
          <TablesParameters columns={columnsTech} data={techData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // ===================== RENDER PISOS ======================
  const renderPisosParameters = () => {
    const columnsPisos = [
      { headerName: "Nombre", field: "nombre" },
      { headerName: "U [W/m²K]", field: "uValue" },
      { headerName: "I [W/mK] (bajo piso)", field: "bajoPisoLambda" },
      { headerName: "e Aisl [cm] (bajo piso)", field: "bajoPisoEAisl" },
      { headerName: "I [W/mK] (vert)", field: "vertLambda" },
      { headerName: "e Aisl [cm] (vert)", field: "vertEAisl" },
      { headerName: "D [cm] (vert)", field: "vertD" },
      { headerName: "I [W/mK] (horiz)", field: "horizLambda" },
      { headerName: "e Aisl [cm] (horiz)", field: "horizEAisl" },
      { headerName: "D [cm] (horiz)", field: "horizD" },
      { headerName: "Acciones", field: "acciones" },
    ];
    const multiHeaderPisos = {
      rows: [
        [
          { label: "Nombre", rowSpan: 2 },
          { label: "U [W/m²K]", rowSpan: 2 },
          { label: "Aislamiento bajo piso", colSpan: 2 },
          { label: "Ref Aisl Vert.", colSpan: 3 },
          { label: "Ref Aisl Horiz.", colSpan: 3 },
          { label: "Acciones", rowSpan: 2 },
        ],
        [
          { label: "I [W/mK]" },
          { label: "e Aisl [cm]" },
          { label: "I [W/mK]" },
          { label: "e Aisl [cm]" },
          { label: "D [cm]" },
          { label: "I [W/mK]" },
          { label: "e Aisl [cm]" },
          { label: "D [cm]" },
        ],
      ],
    };
    const pisosData = pisosTabList.map((item) => {
      const isEditing = editingPisosRowId === item.id;
      const vertical = isEditing
        ? editingPisosData.ref_aisl_vertical
        : item.info?.ref_aisl_vertical || {};
      const horizontal = isEditing
        ? editingPisosData.ref_aisl_horizontal
        : item.info?.ref_aisl_horizontal || {};
      return {
        __detail: item,
        id: item.id,
        nombre: item.name_detail,
        uValue:
          item.value_u !== undefined && item.value_u !== 0
            ? item.value_u.toFixed(3)
            : "-",
        bajoPisoLambda:
          item.info?.aislacion_bajo_piso?.lambda !== undefined &&
          item.info.aislacion_bajo_piso.lambda !== 0
            ? item.info.aislacion_bajo_piso.lambda.toFixed(3)
            : "-",
        bajoPisoEAisl:
          item.info?.aislacion_bajo_piso?.e_aisl !== undefined &&
          item.info.aislacion_bajo_piso.e_aisl !== 0
            ? item.info.aislacion_bajo_piso.e_aisl
            : "-",
        vertLambda: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={vertical.lambda}
            onChange={(e) =>
              setEditingPisosData((prev) => ({
                ...prev,
                ref_aisl_vertical: {
                  ...prev.ref_aisl_vertical,
                  lambda: e.target.value,
                },
              }))
            }
          />
        ) : vertical.lambda !== undefined &&
          vertical.lambda !== null &&
          Number(vertical.lambda) !== 0 ? (
          Number(vertical.lambda).toFixed(3)
        ) : (
          "-"
        ),
        vertEAisl: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={vertical.e_aisl}
            onChange={(e) =>
              setEditingPisosData((prev) => ({
                ...prev,
                ref_aisl_vertical: {
                  ...prev.ref_aisl_vertical,
                  e_aisl: e.target.value,
                },
              }))
            }
          />
        ) : vertical.e_aisl !== undefined &&
          vertical.e_aisl !== null &&
          Number(vertical.e_aisl) !== 0 ? (
          vertical.e_aisl
        ) : (
          "-"
        ),
        vertD: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={vertical.d}
            onChange={(e) =>
              setEditingPisosData((prev) => ({
                ...prev,
                ref_aisl_vertical: {
                  ...prev.ref_aisl_vertical,
                  d: e.target.value,
                },
              }))
            }
          />
        ) : vertical.d !== undefined &&
          vertical.d !== null &&
          Number(vertical.d) !== 0 ? (
          vertical.d
        ) : (
          "-"
        ),
        horizLambda: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={horizontal.lambda}
            onChange={(e) =>
              setEditingPisosData((prev) => ({
                ...prev,
                ref_aisl_horizontal: {
                  ...prev.ref_aisl_horizontal,
                  lambda: e.target.value,
                },
              }))
            }
          />
        ) : horizontal.lambda !== undefined &&
          horizontal.lambda !== null &&
          Number(horizontal.lambda) !== 0 ? (
          Number(horizontal.lambda).toFixed(3)
        ) : (
          "-"
        ),
        horizEAisl: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={horizontal.e_aisl}
            onChange={(e) =>
              setEditingPisosData((prev) => ({
                ...prev,
                ref_aisl_horizontal: {
                  ...prev.ref_aisl_horizontal,
                  e_aisl: e.target.value,
                },
              }))
            }
          />
        ) : horizontal.e_aisl !== undefined &&
          horizontal.e_aisl !== null &&
          Number(horizontal.e_aisl) !== 0 ? (
          horizontal.e_aisl
        ) : (
          "-"
        ),
        horizD: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={horizontal.d}
            onChange={(e) =>
              setEditingPisosData((prev) => ({
                ...prev,
                ref_aisl_horizontal: {
                  ...prev.ref_aisl_horizontal,
                  d: e.target.value,
                },
              }))
            }
          />
        ) : horizontal.d !== undefined &&
          horizontal.d !== null &&
          Number(horizontal.d) !== 0 ? (
          horizontal.d
        ) : (
          "-"
        ),
        acciones: isEditing ? (
          <>
            <CustomButton
              className="btn-table"
              variant="save"
              onClick={(e) => { e.stopPropagation(); handleConfirmPisosEdit(item); }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={(e) => { e.stopPropagation(); handleCancelPisosEdit(item); }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e) => { e.stopPropagation(); handleEditPisosClick(item); }}
          >
            Editar
          </CustomButton>
        ),
      };
    });
    return (
      <div onClick={openDetallesModal}>
        {pisosTabList.length > 0 ? (
          <TablesParameters
            columns={columnsPisos}
            data={pisosData}
            multiHeader={multiHeaderPisos}
          />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // ===================== RENDER VENTANAS ======================
  const renderVentanasParameters = () => {
    const columnsVentanas = [
      { headerName: "Nombre Elemento", field: "name_element" },
      { headerName: "U Vidrio [W/m²K]", field: "u_vidrio" },
      { headerName: "FS Vidrio []", field: "fs_vidrio" },
      { headerName: "Tipo Marco", field: "frame_type" },
      { headerName: "Tipo Cierre", field: "clousure_type" },
      { headerName: "U Marco [W/m²K]", field: "u_marco" },
      { headerName: "FV [%]", field: "fm" },
      { headerName: "Acciones", field: "acciones" },
    ];
    const ventanasData = ventanasTabList.map((item) => ({
      name_element: item.name_element,
      u_vidrio: item.atributs?.u_vidrio ? item.atributs.u_vidrio.toFixed(3) : "--",
      fs_vidrio: item.atributs?.fs_vidrio ?? "--",
      frame_type: item.atributs?.frame_type ?? "--",
      clousure_type: item.atributs?.clousure_type ?? "--",
      u_marco: item.u_marco ? item.u_marco.toFixed(3) : "--",
      fm: item.fm ?? "--",
      acciones: (
        <>
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setEditingVentana(item);
            }}
          >
            Editar
          </CustomButton>
          <CustomButton
            className="btn-table"
            variant="deleteIcon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              openDeleteModal(item.id, "window");
            }}
          >
            <span className="material-icons">delete</span>
          </CustomButton>
        </>
      ),
    }));
    return (
      <div style={{ overflowX: "auto" }}>
        {ventanasTabList.length > 0 ? (
          <TablesParameters columns={columnsVentanas} data={ventanasData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // ===================== RENDER PUERTAS ======================
  const renderPuertasParameters = () => {
    const columnsPuertas = [
      { headerName: "Nombre Elemento", field: "name_element" },
      { headerName: "U puerta opaca [W/m²K]", field: "u_puerta" },
      { headerName: "Vidrio []", field: "name_ventana" },
      { headerName: "% vidrio", field: "porcentaje_vidrio" },
      { headerName: "U Marco [W/m²K]", field: "u_marco" },
      { headerName: "FM [%]", field: "fm" },
      { headerName: "Acciones", field: "acciones" },
    ];
    const puertasData = puertasTabList.map((item) => ({
      name_element: item.name_element,
      u_puerta: item.atributs?.u_puerta_opaca ? item.atributs.u_puerta_opaca.toFixed(3) : "--",
      name_ventana: item.atributs?.name_ventana ?? "--",
      porcentaje_vidrio: item.atributs?.porcentaje_vidrio ?? "--",
      u_marco: item.u_marco ? item.u_marco.toFixed(3) : "--",
      fm: item.fm ?? "--",
      acciones: (
        <>
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setEditingPuerta(item);
            }}
          >
            Editar
          </CustomButton>
          <CustomButton
            className="btn-table"
            variant="deleteIcon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              openDeleteModal(item.id, "door");
            }}
          >
            <span className="material-icons">delete</span>
          </CustomButton>
        </>
      ),
    }));
    return (
      <div style={{ overflowX: "auto" }}>
        {puertasTabList.length > 0 ? (
          <TablesParameters columns={columnsPuertas} data={puertasData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // ===================== RENDER PESTAÑAS STEP4 ======================
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
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <CustomButton variant="save" onClick={handleNewButtonClick}>
            + Nuevo
          </CustomButton>
        </div>
        <ul className="nav">
          {tabs.map((item) => (
            <li key={item.key} style={{ flex: 1, minWidth: "100px" }}>
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
        <div
          style={{
            height: "400px",
            overflowY: "auto",
            position: "relative",
            marginTop: "1rem",
          }}
        >
          {tabStep4 === "muros" && renderMurosParameters()}
          {tabStep4 === "techumbre" && renderTechumbreParameters()}
          {tabStep4 === "pisos" && renderPisosParameters()}
          {tabStep4 === "ventanas" && renderVentanasParameters()}
          {tabStep4 === "puertas" && renderPuertasParameters()}
        </div>
      </div>
    );
  };

  // ===================== RENDER RECINTO ======================
  const renderRecinto = () => {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
        </div>
        <TabRecintDataCreate />
      </>
    );
  };

  // ===================== SIDEBAR & STEP CHANGE ======================
  const handleSidebarStepChange = (newStep: number) => {
    if (newStep === 1) {
      router.push(`/workflow-part1-edit?id=${projectId}&step=1`);
    } else if (newStep === 2) {
      router.push(`/workflow-part1-edit?id=${projectId}&step=2`);
    } else {
      setStep(newStep);
    }
  };

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

  // ===================== FUNCIONES PARA VENTANAS Y PUERTAS ======================
  // Función para confirmar edición de ventana
  const handleConfirmVentanaEdit = async () => {
    if (!editingVentana || !projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/elements/${editingVentana.id}/update`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const payload = {
        name_element: editingVentana.name_element,
        type: "window",
        atributs: editingVentana.atributs,
        u_marco: editingVentana.u_marco,
        fm: editingVentana.fm,
      };
      await axios.put(url, payload, { headers });
      notify("Ventana actualizada con éxito.");
      fetchVentanasDetails();
      setEditingVentana(null);
    } catch (error) {
      console.error("Error al actualizar ventana:", error);
      notify("Error al actualizar ventana.");
    }
  };

  // Función para confirmar edición de puerta
  const handleConfirmPuertaEdit = async () => {
    if (!editingPuerta || !projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/elements/${editingPuerta.id}/update`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const payload = {
        name_element: editingPuerta.name_element,
        type: "door",
        atributs: editingPuerta.atributs,
        u_marco: editingPuerta.u_marco,
        fm: editingPuerta.fm,
      };
      await axios.put(url, payload, { headers });
      notify("Puerta actualizada con éxito.");
      fetchPuertasDetails();
      setEditingPuerta(null);
    } catch (error) {
      console.error("Error al actualizar puerta:", error);
      notify("Error al actualizar puerta.");
    }
  };

  // ===================== RENDER FINAL ======================
  return (
    <>
      <GooIcons />
      <div>
        <Card>
          <div>
            {renderMainHeader()}
            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
              <ProjectInfoHeader projectName={projectName} region={region} />
              <Breadcrumb
                items={[
                  {
                    title: "Editar",
                    href: "/",
                    active: true,
                  },
                ]}
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="row">
            <div className="col-12 col-lg-3">
              <AdminSidebar
                activeStep={step}
                onStepChange={handleSidebarStepChange}
                steps={sidebarSteps}
              />
            </div>
            <div className="col-12 col-lg-9">
              <div className="w-100">
                {step === 4 && (
                  <>
                    {showTabsInStep4 ? renderStep4Tabs() : renderInitialDetails()}
                  </>
                )}
                {step === 7 && renderRecinto()}
              </div>
            </div>
          </div>
        </Card>
      </div>
      {/* Modal para crear un nuevo detalle */}
      <NewDetailModal
        showNewDetailRow={showNewDetailRow}
        setShowNewDetailRow={setShowNewDetailRow}
        newDetailForm={newDetailForm}
        setNewDetailForm={setNewDetailForm}
        materials={materials}
        handleCreateNewDetail={handleCreateNewDetail}
      />
      {/* Modal para mostrar los detalles generales de un registro */}
      <DetailModal
        detail={selectedDetail}
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
      {/* Modal para mostrar la tabla de Detalles Generales al hacer clic en el área */}
      <ModalCreate
        detail={null}
        isOpen={showDetallesModal}
        title="Detalles Generales"
        onClose={() => setShowDetallesModal(false)}
        onSave={() => {}}
        hideFooter={true}
        modalStyle={{
          maxWidth: "70%",
          width: "70%",
          padding: "32px",
        }}
      >
        {renderDetallesModalContent()}
      </ModalCreate>
      {/* Modal para editar Ventana */}
      {editingVentana && (
        <ModalCreate
          isOpen={true}
          title="Editar Ventana"
          detail={editingVentana}
          onClose={() => setEditingVentana(null)}
          onSave={handleConfirmVentanaEdit}
        >
          <form>
            <div className="form-group">
              <label>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={editingVentana.name_element}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev ? { ...prev, name_element: e.target.value } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>U Vidrio [W/m²K]</label>
              <input
                type="number"
                className="form-control"
                value={editingVentana.atributs?.u_vidrio || ""}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            u_vidrio: parseFloat(e.target.value),
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>FS Vidrio</label>
              <input
                type="number"
                className="form-control"
                value={editingVentana.atributs?.fs_vidrio || ""}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            fs_vidrio: parseFloat(e.target.value),
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Tipo Marco</label>
              <input
                type="text"
                className="form-control"
                value={editingVentana.atributs?.frame_type || ""}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            frame_type: e.target.value,
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Tipo Cierre</label>
              <input
                type="text"
                className="form-control"
                value={editingVentana.atributs?.clousure_type || ""}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            clousure_type: e.target.value,
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>U Marco [W/m²K]</label>
              <input
                type="number"
                className="form-control"
                value={editingVentana.u_marco || ""}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev ? { ...prev, u_marco: parseFloat(e.target.value) } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>FV [%]</label>
              <input
                type="number"
                className="form-control"
                value={editingVentana.fm || ""}
                onChange={(e) =>
                  setEditingVentana((prev) =>
                    prev ? { ...prev, fm: parseFloat(e.target.value) } : prev
                  )
                }
              />
            </div>
          </form>
        </ModalCreate>
      )}
      {/* Modal para editar Puerta */}
      {editingPuerta && (
        <ModalCreate
          isOpen={true}
          title="Editar Puerta"
          detail={editingPuerta}
          onClose={() => setEditingPuerta(null)}
          onSave={handleConfirmPuertaEdit}
        >
          <form>
            <div className="form-group">
              <label>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={editingPuerta.name_element}
                onChange={(e) =>
                  setEditingPuerta((prev) =>
                    prev ? { ...prev, name_element: e.target.value } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>U Puerta Opaca [W/m²K]</label>
              <input
                type="number"
                className="form-control"
                value={editingPuerta.atributs?.u_puerta_opaca || ""}
                onChange={(e) =>
                  setEditingPuerta((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            u_puerta_opaca: parseFloat(e.target.value),
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Nombre Ventana</label>
              <input
                type="text"
                className="form-control"
                value={editingPuerta.atributs?.name_ventana || ""}
                onChange={(e) =>
                  setEditingPuerta((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            name_ventana: e.target.value,
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>% Vidrio</label>
              <input
                type="number"
                className="form-control"
                value={editingPuerta.atributs?.porcentaje_vidrio || ""}
                onChange={(e) =>
                  setEditingPuerta((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            porcentaje_vidrio: parseFloat(e.target.value),
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>U Marco [W/m²K]</label>
              <input
                type="number"
                className="form-control"
                value={editingPuerta.u_marco || ""}
                onChange={(e) =>
                  setEditingPuerta((prev) =>
                    prev ? { ...prev, u_marco: parseFloat(e.target.value) } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>FM [%]</label>
              <input
                type="number"
                className="form-control"
                value={editingPuerta.fm || ""}
                onChange={(e) =>
                  setEditingPuerta((prev) =>
                    prev ? { ...prev, fm: parseFloat(e.target.value) } : prev
                  )
                }
              />
            </div>
          </form>
        </ModalCreate>
      )}
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deleteItem && (
        <ModalCreate
          isOpen={showDeleteModal}
          title="Confirmar Eliminación"
          onClose={() => setShowDeleteModal(false)}
          onSave={confirmDelete}
          detail={null} // Pass null detail to use default delete confirmation
          hideFooter={false}
          modalStyle={{
            maxWidth: "500px",
            width: "500px",
            padding: "24px",
          }}
          saveLabel="Confirmar"
        >
          <p>
            ¿Estás seguro de que deseas eliminar este {deleteItem.type === "window" ? "ventana" : "puerta"}?
          </p>
        </ModalCreate>
      )}
    </>
  );
};

export default WorkFlowpar2editPage;
