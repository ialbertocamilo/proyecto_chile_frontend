import { notify } from "@/utils/notify";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import GooIcons from "../public/GoogleIcons";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import Title from "../src/components/Title";
import useAuth from "../src/hooks/useAuth";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import Breadcrumb from "@/components/common/Breadcrumb";
import TablesParameters from "@/components/tables/TablesParameters";
import VerticalDivider from "@/components/ui/HorizontalDivider";
import SearchParameters from "../src/components/inputs/SearchParameters";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import ModalCreate from "../src/components/common/ModalCreate";
import TabRecintDataCreate from "@/components/tab_recint_data/TabRecintDataCreate";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";

interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail: string;
  material_id: number;
  material: string;
  layer_thickness: number;
  created_status: string; // "default" o "created" o "global"
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
  id: number;
  name_element: string;
  created_status?: string;
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
  id?: number;
  name_element: string;
  created_status?: string;
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
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

const WorkFlowpar2createPage: React.FC = () => {
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
  const [showTabsInStep4, setShowTabsInStep4] = useState(true);
  const [tabStep4, setTabStep4] = useState<TabStep4>("muros");

  // Estados para cada pestaña
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [ventanasTabList, setVentanasTabList] = useState<Ventana[]>([]);
  const [puertasTabList, setPuertasTabList] = useState<Puerta[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Estados para edición en otras pestañas (Muros, Techumbre, Pisos, etc.)
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
  const [editingPisoRowId, setEditingPisoRowId] = useState<number | null>(null);
  const [editingPisoForm, setEditingPisoForm] = useState({
    vertical: { lambda: "", e_aisl: "", d: "" },
    horizontal: { lambda: "", e_aisl: "", d: "" },
  });

  // Estados para edición de ventana y puerta usando ModalCreate
  const [editingVentanaForm, setEditingVentanaForm] = useState<Ventana | null>(null);
  const [editingPuertaForm, setEditingPuertaForm] = useState<Puerta | null>(null);

  // Estados locales para manejar el input de porcentaje como cadena
  const [ventanaFmInput, setVentanaFmInput] = useState<string>("");
  const [puertaPorcentajeInput, setPuertaPorcentajeInput] = useState<string>("");

  // Estado para el formulario de creación de detalle
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

  // Nuevo estado para el detalle en edición (modal)
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);

  // Estados para ProjectInfoHeader
  const [projectName, setProjectName] = useState("");
  const [projectDepartment, setProjectDepartment] = useState("");

  // Estado para el modal de confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);

  // Estado para el modal de Detalles Generales
  const [showDetallesModal, setShowDetallesModal] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    if (storedProjectId) {
      setProjectId(Number(storedProjectId));
    }
    const storedProjectName =
      localStorage.getItem("project_name") || "Nombre no definido";
    const storedProjectDepartment =
      localStorage.getItem("project_department") || "Región no definida";
    setProjectName(storedProjectName);
    setProjectDepartment(storedProjectDepartment);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded && projectId === null) {
      notify(
        "Ningún proyecto está seleccionado",
        "Serás redirigido a la creación de proyecto"
      );
      router.push("/workflow-part1-create");
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

  // Inicializa el input de porcentaje al abrir el modal de Ventana
  useEffect(() => {
    if (editingVentanaForm) {
      setVentanaFmInput(
        editingVentanaForm.fm !== undefined
          ? String(Math.round(editingVentanaForm.fm * 100))
          : ""
      );
    }
  }, [editingVentanaForm]);

  // Inicializa el input de porcentaje al abrir el modal de Puerta
  useEffect(() => {
    if (editingPuertaForm && editingPuertaForm.atributs) {
      setPuertaPorcentajeInput(
        editingPuertaForm.atributs.porcentaje_vidrio !== undefined
          ? String(Math.round(editingPuertaForm.atributs.porcentaje_vidrio * 100))
          : ""
      );
    }
  }, [editingPuertaForm]);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

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

  const fetchFetchedDetails = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/user/details/?project_id=${projectId}`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setFetchedDetails(response.data || []);
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      notify("Error al obtener detalles. Ver consola.");
    }
  }, [projectId]);

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
      .get(`${constantUrlApiEndpoint}/user/elements/?type=window`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setVentanasTabList(response.data))
      .catch((error) => {
        console.error("Error al obtener datos de ventanas:", error);
        notify("Error al obtener datos de ventanas. Ver consola.");
      });
  }, []);

  const fetchPuertasDetails = useCallback(() => {
    const token = getToken();
    if (!token) return;
    axios
      .get(`${constantUrlApiEndpoint}/user/elements/?type=door`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setPuertasTabList(response.data))
      .catch((error) => {
        console.error("Error al obtener datos de puertas:", error);
        notify("Error al obtener datos de puertas. Ver consola.");
      });
  }, []);

  const fetchMaterials = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/user/constants/?page=1&per_page=700`;
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
      notify("Error al obtener Materiales.");
    }
  };

  useEffect(() => {
    if (editingDetail) {
      // Acciones adicionales al editar el detalle
    }
  }, [editingDetail]);

  useEffect(() => {
    if (step === 4 && projectId) {
      fetchFetchedDetails();
    }
  }, [step, fetchFetchedDetails, projectId]);

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

  const handleEditDetail = (detail: Detail) => {
    setShowDetallesModal(false);
    if ((!detail.material_id || detail.material_id === 0) && detail.material) {
      const foundMaterial = materials.find(
        (mat) => mat.name === detail.material
      );
      detail.material_id = foundMaterial ? foundMaterial.id : 0;
    }
    fetchMaterials();
    setEditingDetail(detail);
  };

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
      const createUrl = `${constantUrlApiEndpoint}/user/details/create?project_id=${projectId}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(createUrl, newDetailForm, { headers });
      const newDetailId = response.data.detail.id;
      if (!newDetailId) {
        notify("El backend no devolvió un ID de Detalle válido.");
        return;
      }
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
            notify("Detalle creado pero no se añadió al proyecto.");
          }
        }
      } else {
        notify(
          "No se añadió el Detalle al proyecto (ID de proyecto no disponible)."
        );
      }
      const tipo = newDetailForm.scantilon_location.toLowerCase();
      if (tipo === "muro") {
        fetchMurosDetails();
      } else if (tipo === "techo") {
        fetchTechumbreDetails();
      } else if (tipo === "piso") {
        fetchPisosDetails();
      }
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
        notify("Error en la creación del Detalle.");
      } else {
        notify("Error desconocido al crear el Detalle.");
      }
    }
  };

  const handleNewButtonClick = () => {
    setShowNewDetailRow(true);
    fetchMaterials();
  };

  const saveDetails = () => {
    setShowTabsInStep4(true);
    setTabStep4("muros");
  };

  const handleConfirmEditDetail = async () => {
    if (!editingDetail) return;
    if (
      !editingDetail.scantilon_location.trim() ||
      !editingDetail.name_detail.trim()
    ) {
      notify(
        "Los campos 'Ubicación Detalle' y 'Nombre Detalle' no pueden estar vacíos."
      );
      return;
    }
    if (!editingDetail.material_id || editingDetail.material_id <= 0) {
      notify("Por favor, seleccione un material válido.");
      return;
    }
    if (
      editingDetail.layer_thickness === null ||
      editingDetail.layer_thickness <= 0
    ) {
      notify("El 'Espesor de la capa' debe ser un valor mayor a 0.");
      return;
    }
    const token = getToken();
    if (!token || !projectId) return;
    try {
      const url = `${constantUrlApiEndpoint}/user/details/${editingDetail.id_detail}/update?project_id=${projectId}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        scantilon_location: editingDetail.scantilon_location,
        name_detail: editingDetail.name_detail,
        material_id: editingDetail.material_id,
        layer_thickness: editingDetail.layer_thickness,
      };
      const response = await axios.put(url, payload, { headers });
      notify(response.data.success);
      const tipo = editingDetail.scantilon_location.toLowerCase();
      if (tipo === "muro") {
        fetchMurosDetails();
      } else if (tipo === "techo") {
        fetchTechumbreDetails();
      } else if (tipo === "piso") {
        fetchPisosDetails();
      }
      fetchFetchedDetails();
      setEditingDetail(null);
      setShowDetallesModal(true);
    } catch (error: unknown) {
      console.error("Error al actualizar el detalle:", error);
      notify("Error al actualizar el Detalle.");
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    const token = getToken();
    if (!token || !projectId) return;
    try {
      const detail = fetchedDetails.find((d) => d.id_detail === detailId);
      const tipo = detail ? detail.scantilon_location.toLowerCase() : "";
      const url = `${constantUrlApiEndpoint}/user/details/${detailId}/delete?project_id=${projectId}`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(url, { headers });
      notify(response.data.message);
      if (tipo === "muro") {
        fetchMurosDetails();
      } else if (tipo === "techo") {
        fetchTechumbreDetails();
      } else if (tipo === "piso") {
        fetchPisosDetails();
      }
      fetchFetchedDetails();
    } catch (error: unknown) {
      console.error("Error al eliminar el detalle:", error);
      notify("Error al eliminar el detalle.");
    }
  };

  const confirmDeleteDetail = (detailId: number) => {
    setShowDetallesModal(false);
    setDeleteAction(() => () => handleDeleteDetail(detailId));
    setShowConfirmModal(true);
  };

  const confirmDeleteElement = (elementId: number, type: string) => {
    setShowDetallesModal(false);
    setDeleteAction(() => () => handleDeleteElement(elementId, type));
    setShowConfirmModal(true);
  };

  const handleDeleteElement = async (elementId: number, type: string) => {
    const token = getToken();
    if (!token || !projectId) return;
    try {
      const url = `${constantUrlApiEndpoint}/user/elements/${elementId}/delete?type=${type}`;
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(url, { headers });
      notify("Elemento eliminado exitosamente.");
      if (type === "window") {
        setVentanasTabList((prev) =>
          prev.filter((item) => item.id !== elementId)
        );
      } else if (type === "door") {
        setPuertasTabList((prev) =>
          prev.filter((item) => item.id !== elementId)
        );
      }
    } catch (error: unknown) {
      console.error("Error al eliminar el elemento:", error);
      notify("Error al eliminar el elemento.");
    }
  };

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
      notify("Error al actualizar detalle. Ver consola.");
    }
  };

  const handleEditPisoClick = (detail: TabItem) => {
    setEditingPisoRowId(detail.id || null);
    setEditingPisoForm({
      vertical: {
        lambda: detail.info?.ref_aisl_vertical?.lambda?.toString() || "",
        e_aisl: detail.info?.ref_aisl_vertical?.e_aisl?.toString() || "",
        d: detail.info?.ref_aisl_vertical?.d?.toString() || "",
      },
      horizontal: {
        lambda: detail.info?.ref_aisl_horizontal?.lambda?.toString() || "",
        e_aisl: detail.info?.ref_aisl_horizontal?.e_aisl?.toString() || "",
        d: detail.info?.ref_aisl_horizontal?.d?.toString() || "",
      },
    });
  };

  const handleCancelPisoEdit = () => {
    setEditingPisoRowId(null);
  };

  const handleConfirmPisoEdit = async (detail: TabItem) => {
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
            d: Number(editingPisoForm.vertical.d),
            e_aisl: Number(editingPisoForm.vertical.e_aisl),
            lambda: Number(editingPisoForm.vertical.lambda),
          },
          ref_aisl_horizontal: {
            d: Number(editingPisoForm.horizontal.d),
            e_aisl: Number(editingPisoForm.horizontal.e_aisl),
            lambda: Number(editingPisoForm.horizontal.lambda),
          },
        },
      };
      await axios.put(url, payload, { headers });
      notify("Detalle tipo Piso actualizado con éxito");
      setPisosTabList((prev) =>
        prev.map((item) =>
          item.id === detail.id
            ? {
                ...item,
                info: {
                  ...item.info,
                  ref_aisl_vertical: {
                    lambda: Number(editingPisoForm.vertical.lambda),
                    e_aisl: Number(editingPisoForm.vertical.e_aisl),
                    d: Number(editingPisoForm.vertical.d),
                  },
                  ref_aisl_horizontal: {
                    lambda: Number(editingPisoForm.horizontal.lambda),
                    e_aisl: Number(editingPisoForm.horizontal.e_aisl),
                    d: Number(editingPisoForm.horizontal.d),
                  },
                },
              }
            : item
        )
      );
      setEditingPisoRowId(null);
    } catch (error: unknown) {
      console.error("Error al actualizar detalle de Piso:", error);
      notify("Error al actualizar detalle de Piso. Ver consola.");
    }
  };

  const handleConfirmPuertaEdit = async (puerta: Puerta) => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/user/elements/${puerta.id}/update`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        name_element: puerta.name_element,
        type: "door",
        atributs: puerta.atributs,
        u_marco: puerta.u_marco,
        fm: puerta.fm,
      };
      await axios.put(url, payload, { headers });
      notify("Detalle tipo Puerta actualizado con éxito.");
      setPuertasTabList((prev) =>
        prev.map((item) =>
          item.id === puerta.id ? { ...item, ...puerta } : item
        )
      );
      setEditingPuertaForm(null);
    } catch (error: any) {
      console.error("Error al actualizar puerta:", error);
      if (
        error?.response?.data?.detail ===
        "El nombre del elemento ya existe dentro del tipo door"
      ) {
        notify("El Nombre de la Puerta ya existe");
      } else {
        notify("Error al actualizar la puerta");
      }
    }
  };

  const handleConfirmVentanaEdit = async (ventana: Ventana) => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/user/elements/${ventana.id}/update`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        name_element: ventana.name_element,
        type: "window",
        atributs: ventana.atributs,
        u_marco: ventana.u_marco,
        fm: ventana.fm,
      };
      await axios.put(url, payload, { headers });
      notify("Detalle tipo Ventana actualizado con éxito.");
      setVentanasTabList((prev) =>
        prev.map((item) =>
          item.id === ventana.id ? { ...item, ...ventana } : item
        )
      );
      setEditingVentanaForm(null);
    } catch (error: any) {
      console.error("Error al actualizar ventana:", error);
      if (
        error?.response?.data?.detail ===
        "El nombre del elemento ya existe dentro del tipo window"
      ) {
        notify("El Nombre de la Ventana ya existe");
      } else {
        notify("Error al actualizar la ventana");
      }
    }
  };

  const openDetallesModal = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
    if (
      targetTag === "input" ||
      targetTag === "select" ||
      targetTag === "textarea"
    ) {
      return;
    }
    setShowDetallesModal(true);
  };

  const renderMainHeader = () => <Title text="Desarrollo de proyecto" />;

  const detailTypeMapping: { [key in TabStep4]?: string } = {
    muros: "Muro",
    techumbre: "Techo",
    pisos: "Piso",
  };

  const renderDetallesModalContent = () => {
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
      { headerName: "Acción", field: "accion" },
    ];

    const data = filteredDetails.map((det) => {
      const textStyle =
        det.created_status === "created"
          ? { color: "var(--primary-color)", fontWeight: "bold" }
          : {};
      return {
        scantilon_location: (
          <span style={textStyle}>{det.scantilon_location}</span>
        ),
        name_detail: <span style={textStyle}>{det.name_detail}</span>,
        material: <span style={textStyle}>{det.material}</span>,
        layer_thickness: <span style={textStyle}>{det.layer_thickness}</span>,
        accion: (
          <>
            <CustomButton
              className="btn-table"
              variant="editIcon"
              onClick={() => handleEditDetail(det)}
              disabled={det.created_status == "default" || det.created_status == "global"}
            >
              Editar
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="deleteIcon"
              onClick={() => confirmDeleteDetail(det.id_detail)}
              disabled={det.created_status == "default" || det.created_status == "global"}
            >
              <span className="material-icons">delete</span>
            </CustomButton>
          </>
        ),
      };
    });

    return (
        <TablesParameters columns={columnsDetails} data={data} />
    );
  };

  const renderInitialDetails = () => {
    return (
      <>
        <SearchParameters
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar..."
          onNew={handleNewButtonClick}
          newButtonText="Nuevo"
          style={{ marginBottom: "1rem" }}
        />
        <div style={{ height: "400px", overflowY: "auto", overflowX: "auto" }}>
          <TablesParameters
            columns={[
              { headerName: "Ubicación Detalle", field: "scantilon_location" },
              { headerName: "Nombre Detalle", field: "name_detail" },
              { headerName: "Material", field: "material" },
              { headerName: "Espesor capa (cm)", field: "layer_thickness" },
              { headerName: "Acción", field: "accion" },
            ]}
            data={fetchedDetails
              .filter((det) => {
                const searchLower = searchQuery.toLowerCase();
                return (
                  det.scantilon_location.toLowerCase().includes(searchLower) ||
                  det.name_detail.toLowerCase().includes(searchLower) ||
                  det.material.toLowerCase().includes(searchLower) ||
                  det.layer_thickness.toString().includes(searchLower)
                );
              })
              .map((det) => {
                const textStyle =
                  det.created_status === "created"
                    ? { color: "var(--primary-color)", fontWeight: "bold" }
                    : {};
                return {
                  scantilon_location: (
                    <span style={textStyle}>{det.scantilon_location}</span>
                  ),
                  name_detail: <span style={textStyle}>{det.name_detail}</span>,
                  material: <span style={textStyle}>{det.material}</span>,
                  layer_thickness: (
                    <span style={textStyle}>{det.layer_thickness}</span>
                  ),
                  accion: (
                    <>
                      <CustomButton
                        variant="editIcon"
                        onClick={() => handleEditDetail(det)}
                      >
                        Editar
                      </CustomButton>
                      <CustomButton
                        variant="deleteIcon"
                        onClick={() => confirmDeleteDetail(det.id_detail)}
                      >
                        <span className="material-icons">delete</span>
                      </CustomButton>
                    </>
                  ),
                };
              })}
          />
        </div>
      </>
    );
  };

  const renderMurosTable = () => {
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
        nombreAbreviado: item.name_detail,
        valorU: item.value_u?.toFixed(3) ?? "--",
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
          <div onClick={(e) => e.stopPropagation()}>
            <ActionButtonsConfirm
              onAccept={() => handleConfirmEdit(item)}
              onCancel={() => handleCancelEdit(item)}
            />
          </div>
        ) : (
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item);
            }}
          >
            Editar
          </CustomButton>
        ),
      };
    });

    return (
      <div onClick={openDetallesModal} style={{ overflowX: "auto" }}>
        {murosTabList.length > 0 ? (
          <TablesParameters columns={columnsMuros} data={murosData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  const renderTechumbreTable = () => {
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
        nombreAbreviado: item.name_detail,
        valorU: item.value_u?.toFixed(3) ?? "--",
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
          <div onClick={(e) => e.stopPropagation()}>
            <ActionButtonsConfirm
              onAccept={() => handleConfirmTechEdit(item)}
              onCancel={() => handleCancelTechEdit(item)}
            />
          </div>
        ) : (
          <CustomButton
            variant="editIcon"
            className="btn-table"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTechClick(item);
            }}
          >
            Editar
          </CustomButton>
        ),
      };
    });

    return (
      <div onClick={openDetallesModal} style={{ minWidth: "600px" }}>
        {techumbreTabList.length > 0 ? (
          <TablesParameters columns={columnsTech} data={techData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

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

  const formatNumber = (num: number | string | undefined, decimals = 3) => {
    const parsedNum = Number(num);
    return !isNaN(parsedNum) && parsedNum !== 0 ? parsedNum.toFixed(decimals) : "-";
  };

  const renderPisosTable = () => {
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

    const pisosData = pisosTabList.map((item) => {
      const bajoPiso = item.info?.aislacion_bajo_piso || {};
      const vert = item.info?.ref_aisl_vertical || {};
      const horiz = item.info?.ref_aisl_horizontal || {};
      const isEditing = editingPisoRowId === item.id;
      return {
        nombre: item.name_detail,
        uValue: formatNumber(item.value_u),
        bajoPisoLambda: formatNumber(bajoPiso.lambda),
        bajoPisoEAisl:
          bajoPiso.e_aisl != null && bajoPiso.e_aisl !== 0
            ? bajoPiso.e_aisl
            : "-",
        vertLambda: isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="form-control form-control-sm"
            value={editingPisoForm.vertical.lambda}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}          
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                vertical: { ...prev.vertical, lambda: e.target.value },
              }))
            }
          />
        ) : (
          formatNumber(vert.lambda)
        ),
        vertEAisl: isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="form-control form-control-sm"
            value={editingPisoForm.vertical.e_aisl}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}          
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                vertical: { ...prev.vertical, e_aisl: e.target.value },
              }))
            }
          />
        ) : vert.e_aisl != null && vert.e_aisl !== 0 ? (
          vert.e_aisl
        ) : (
          "-"
        ),
        vertD: isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="form-control form-control-sm"
            value={editingPisoForm.vertical.d}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}          
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                vertical: { ...prev.vertical, d: e.target.value },
              }))
            }
          />
        ) : vert.d != null && vert.d !== 0 ? (
          vert.d
        ) : (
          "-"
        ),
        horizLambda: isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="form-control form-control-sm"
            value={editingPisoForm.horizontal.lambda}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}          
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                horizontal: { ...prev.horizontal, lambda: e.target.value },
              }))
            }
          />
        ) : (
          formatNumber(horiz.lambda)
        ),
        horizEAisl: isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="form-control form-control-sm"
            value={editingPisoForm.horizontal.e_aisl}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}          
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                horizontal: { ...prev.horizontal, e_aisl: e.target.value },
              }))
            }
          />
        ) : horiz.e_aisl != null && horiz.e_aisl !== 0 ? (
          horiz.e_aisl
        ) : (
          "-"
        ),
        horizD: isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className="form-control form-control-sm"
            value={editingPisoForm.horizontal.d}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}          
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                horizontal: { ...prev.horizontal, d: e.target.value },
              }))
            }
          />
        ) : horiz.d != null && horiz.d !== 0 ? (
          horiz.d
        ) : (
          "-"
        ),
        acciones: isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionButtonsConfirm
              onAccept={() => handleConfirmPisoEdit(item)}
              onCancel={() => handleCancelPisoEdit()}
            />
          </div>
        ) : (
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPisoClick(item);
            }}
          >
            Editar
          </CustomButton>
        ),
      };
    });

    return (
      <div onClick={openDetallesModal} style={{ minWidth: "600px" }}>
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

  const renderVentanasTable = () => {
    const columnsVentanas = [
      { headerName: "Nombre Elemento", field: "name_element" },
      { headerName: "U Vidrio [W/m²K]", field: "u_vidrio" },
      { headerName: "FS Vidrio []", field: "fs_vidrio" },
      { headerName: "Tipo Marco", field: "frame_type" },
      { headerName: "Tipo Cierre", field: "clousure_type" },
      { headerName: "U Marco [W/m²K]", field: "u_marco" },
      { headerName: "FM [%]", field: "fm" },
      { headerName: "Acciones", field: "acciones" },
    ];

    const ventanasData = ventanasTabList.map((item) => {
      const textStyle =
        item.created_status === "created"
          ? { color: "var(--primary-color)", fontWeight: "bold" }
          : {};
      return {
        name_element: <span style={textStyle}>{item.name_element}</span>,
        u_vidrio: item.atributs?.u_vidrio ? (
          <span style={textStyle}>{item.atributs.u_vidrio.toFixed(3)}</span>
        ) : (
          <span style={textStyle}>--</span>
        ),
        fs_vidrio: (
          <span style={textStyle}>{item.atributs?.fs_vidrio ?? "--"}</span>
        ),
        frame_type: (
          <span style={textStyle}>{item.atributs?.frame_type ?? "--"}</span>
        ),
        clousure_type: (
          <span style={textStyle}>{item.atributs?.clousure_type ?? "--"}</span>
        ),
        u_marco: item.u_marco ? (
          <span style={textStyle}>{item.u_marco.toFixed(3)}</span>
        ) : (
          <span style={textStyle}>--</span>
        ),
        fm: (
          <span style={textStyle}>
            {item.fm != null ? Math.round(item.fm * 100) + "%" : "--"}
          </span>
        ),
        acciones:
          item.created_status === "default" || item.created_status === "global" ? (
            <span>-</span>
          ) : (
            <div style={textStyle}>
              <CustomButton
                className="btn-table"
                variant="editIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingVentanaForm(item);
                }}
              >
                Editar
              </CustomButton>
              <CustomButton
                className="btn-table"
                variant="deleteIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteElement(item.id, "window");
                }}
              >
                <span className="material-icons">delete</span>
              </CustomButton>
            </div>
          ),
      };
    });

    return (
      <div style={{ minWidth: "600px" }}>
        {ventanasTabList.length > 0 ? (
          <TablesParameters columns={columnsVentanas} data={ventanasData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  const renderPuertasTable = () => {
    const columnsPuertas = [
      { headerName: "Nombre Elemento", field: "name_element" },
      { headerName: "U puerta opaca [W/m²K]", field: "u_puerta" },
      { headerName: "Vidrio []", field: "name_ventana" },
      { headerName: "% vidrio", field: "porcentaje_vidrio" },
      { headerName: "U Marco [W/m²K]", field: "u_marco" },
      { headerName: "FM [%]", field: "fm" },
      { headerName: "Acciones", field: "acciones" },
    ];

    const puertasData = puertasTabList.map((item) => {
      const textStyle =
        item.created_status === "created"
          ? { color: "var(--primary-color)", fontWeight: "bold" }
          : {};
      return {
        name_element: <span style={textStyle}>{item.name_element}</span>,
        u_puerta: item.atributs?.u_puerta_opaca ? (
          <span style={textStyle}>
            {item.atributs.u_puerta_opaca.toFixed(3)}
          </span>
        ) : (
          <span style={textStyle}>--</span>
        ),
        name_ventana: (
          <span style={textStyle}>{item.atributs?.name_ventana ?? "--"}</span>
        ),
        porcentaje_vidrio: (
          <span style={textStyle}>
            {item.atributs?.porcentaje_vidrio != null
              ? Math.round(item.atributs.porcentaje_vidrio * 100) + "%"
              : "--"}
          </span>
        ),
        u_marco: item.u_marco ? (
          <span style={textStyle}>{item.u_marco.toFixed(3)}</span>
        ) : (
          <span style={textStyle}>--</span>
        ),
        fm: (
          <span style={textStyle}>
            {item.fm != null ? Math.round(item.fm * 100) + "%" : "--"}
          </span>
        ),
        acciones:
          item.created_status === "default" || item.created_status === "global" ? (
            <span>-</span>
          ) : (
            <div style={textStyle}>
              <CustomButton
                className="btn-table"
                variant="editIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPuertaForm(item);
                }}
              >
                Editar
              </CustomButton>
              <CustomButton
                className="btn-table"
                variant="deleteIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteElement(item.id as number, "door");
                }}
              >
                <span className="material-icons">delete</span>
              </CustomButton>
            </div>
          ),
      };
    });

    return (
      <div style={{ minWidth: "600px" }}>
        {puertasTabList.length > 0 ? (
          <TablesParameters columns={columnsPuertas} data={puertasData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

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
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <CustomButton variant="save" onClick={handleNewButtonClick}>
            + Nuevo
          </CustomButton>
        </div>
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
          {tabStep4 === "muros" && renderMurosTable()}
          {tabStep4 === "techumbre" && renderTechumbreTable()}
          {tabStep4 === "pisos" && renderPisosTable()}
          {tabStep4 === "ventanas" && renderVentanasTable()}
          {tabStep4 === "puertas" && renderPuertasTable()}
        </div>
      </div>
    );
  };

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

  const sidebarSteps = [
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
      <Card>
        <div
          className="d-flex align-items-center w-100"
          style={{ marginBottom: "2rem" }}
        >
          {renderMainHeader()}
        </div>
        <div className="d-flex align-items-center gap-4">
          <ProjectInfoHeader
            projectName={projectName}
            region={projectDepartment}
          />
          <div className="ms-auto" style={{ display: "flex" }}>
            <Breadcrumb
              items={[{ title: "Proyecto Nuevo", href: "/", active: true }]}
            />
          </div>
        </div>
      </Card>
      <Card>
        <div className="row">
          <div className="col-lg-3 col-12 order-lg-first order-first">
            <div className="mb-3 mb-lg-0">
              <AdminSidebar
                activeStep={step}
                onStepChange={setStep}
                steps={sidebarSteps}
              />
            </div>
            <VerticalDivider />
          </div>
          <div className="col-lg-9 col-12 order-last">
            <div style={{ padding: "20px" }}>
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

      {/* Modal para editar Detalle Constructivo */}
      {editingDetail && (
        <ModalCreate
          isOpen={true}
          title="Editar Detalle Constructivo"
          detail={editingDetail}
          onClose={() => setEditingDetail(null)}
          onSave={handleConfirmEditDetail}
        >
          <form>
            <div className="form-group">
              <label>Ubicación Detalle</label>
              <input
                type="text"
                className="form-control"
                value={editingDetail.scantilon_location}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Nombre Detalle</label>
              <input
                type="text"
                className="form-control"
                value={editingDetail.name_detail}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev ? { ...prev, name_detail: e.target.value } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Material</label>
              <select
                className="form-control"
                value={editingDetail.material_id || 0}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev
                      ? { ...prev, material_id: Number(e.target.value) }
                      : prev
                  )
                }
                onClick={fetchMaterials}
              >
                <option value={0}>Seleccione un material</option>
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Espesor de capa (cm)</label>
              <input
                type="number"
                className="form-control"
                value={editingDetail.layer_thickness}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev
                      ? { ...prev, layer_thickness: Number(e.target.value) }
                      : prev
                  )
                }
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {/* Modal para editar Ventana usando ModalCreate */}
      {editingVentanaForm && (
        <ModalCreate
          isOpen={true}
          title="Editar Ventana"
          detail={editingVentanaForm}
          onClose={() => setEditingVentanaForm(null)}
          onSave={() => handleConfirmVentanaEdit(editingVentanaForm)}
        >
          <form>
            <div className="form-group">
              <label>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={editingVentanaForm.name_element}
                onChange={(e) =>
                  setEditingVentanaForm((prev) =>
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
                value={editingVentanaForm.atributs?.u_vidrio || ""}
                onChange={(e) =>
                  setEditingVentanaForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            u_vidrio: Number(e.target.value),
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
                value={editingVentanaForm.atributs?.fs_vidrio || ""}
                onChange={(e) =>
                  setEditingVentanaForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            fs_vidrio: Number(e.target.value),
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
                value={editingVentanaForm.atributs?.frame_type || ""}
                onChange={(e) =>
                  setEditingVentanaForm((prev) =>
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
                value={editingVentanaForm.atributs?.clousure_type || ""}
                onChange={(e) =>
                  setEditingVentanaForm((prev) =>
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
                value={editingVentanaForm.u_marco || ""}
                onChange={(e) =>
                  setEditingVentanaForm((prev) =>
                    prev ? { ...prev, u_marco: Number(e.target.value) } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>FM [%]</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                className="form-control"
                value={ventanaFmInput}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val)) {
                    setVentanaFmInput("");
                    return;
                  }
                  if (val > 100) val = 100;
                  if (val < 0) val = 0;
                  setVentanaFmInput(String(val));
                  setEditingVentanaForm((prev) =>
                    prev ? { ...prev, fm: Math.round(val) / 100 } : prev
                  );
                }}
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {/* Modal para editar Puerta usando ModalCreate */}
      {editingPuertaForm && (
        <ModalCreate
          isOpen={true}
          title="Editar Puerta"
          detail={editingPuertaForm}
          onClose={() => setEditingPuertaForm(null)}
          onSave={() => handleConfirmPuertaEdit(editingPuertaForm)}
        >
          <form>
            <div className="form-group">
              <label>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={editingPuertaForm.name_element}
                onChange={(e) =>
                  setEditingPuertaForm((prev) =>
                    prev ? { ...prev, name_element: e.target.value } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>U puerta opaca [W/m²K]</label>
              <input
                type="number"
                className="form-control"
                value={editingPuertaForm.atributs?.u_puerta_opaca || ""}
                onChange={(e) =>
                  setEditingPuertaForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            u_puerta_opaca: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Ventana Asociada</label>
              <input
                type="text"
                className="form-control"
                value={editingPuertaForm.atributs?.name_ventana || ""}
                onChange={(e) =>
                  setEditingPuertaForm((prev) =>
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
                min="0"
                max="100"
                step="any"
                className="form-control"
                value={puertaPorcentajeInput}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val)) {
                    setPuertaPorcentajeInput("");
                    return;
                  }
                  if (val > 100) val = 100;
                  if (val < 0) val = 0;
                  setPuertaPorcentajeInput(String(val));
                  setEditingPuertaForm((prev) =>
                    prev && prev.atributs
                      ? {
                          ...prev,
                          atributs: {
                            ...prev.atributs,
                            porcentaje_vidrio: Math.round(val) / 100,
                          },
                        }
                      : prev
                  );
                }}
              />
            </div>
            <div className="form-group">
              <label>U Marco [W/m²K]</label>
              <input
                type="number"
                className="form-control"
                value={editingPuertaForm.u_marco || ""}
                onChange={(e) =>
                  setEditingPuertaForm((prev) =>
                    prev ? { ...prev, u_marco: Number(e.target.value) } : prev
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>FM [%]</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                className="form-control"
                value={
                  editingPuertaForm.fm !== undefined
                    ? Math.round(editingPuertaForm.fm * 100)
                    : ""
                }
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val)) {
                    setEditingPuertaForm((prev) =>
                      prev ? { ...prev, fm: 0 } : prev
                    );
                    return;
                  }
                  if (val > 100) val = 100;
                  if (val < 0) val = 0;
                  setEditingPuertaForm((prev) =>
                    prev ? { ...prev, fm: Math.round(val) / 100 } : prev
                  );
                }}
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {/* Modal de confirmación para eliminar */}
      {showConfirmModal && (
        <ModalCreate
          detail={null}
          isOpen={showConfirmModal}
          title="Confirmación"
          onClose={() => {
            setShowConfirmModal(false);
            setDeleteAction(null);
          }}
          onSave={() => {
            if (deleteAction) deleteAction();
            setShowConfirmModal(false);
            setDeleteAction(null);
          }}
          saveLabel="Eliminar"
        >
          <div>
            <p>¿Estás seguro de que deseas eliminar este elemento?</p>
          </div>
        </ModalCreate>
      )}

      {/* Modal para crear nuevo Detalle */}
      {showNewDetailRow && (
        <ModalCreate
          isOpen={showNewDetailRow}
          onClose={() => setShowNewDetailRow(false)}
          detail={null}
          materials={materials.map((mat) => ({ ...mat, id: String(mat.id) }))}
          onSave={handleCreateNewDetail}
          title="Nuevo Detalle"
          saveLabel="Crear Detalle"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateNewDetail();
            }}
          >
            <div className="form-group">
              <label>Selecciones</label>
              <select
                className="form-control"
                value={newDetailForm.scantilon_location}
                onChange={(e) =>
                  setNewDetailForm({
                    ...newDetailForm,
                    scantilon_location: e.target.value,
                  })
                }
              >
                <option value="">Seleccione una opción</option>
                <option value="Muro">Muro</option>
                <option value="Techo">Techo</option>
                <option value="Piso">Piso</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nombre Detalle</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre Detalle"
                value={newDetailForm.name_detail}
                onChange={(e) =>
                  setNewDetailForm({
                    ...newDetailForm,
                    name_detail: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Material</label>
              <select
                className="form-control"
                value={newDetailForm.material_id}
                onChange={(e) =>
                  setNewDetailForm({
                    ...newDetailForm,
                    material_id: Number(e.target.value),
                  })
                }
              >
                <option value={0}>Seleccione Material</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Espesor capa (cm)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Espesor capa (cm)"
                value={newDetailForm.layer_thickness ?? ""}
                onKeyDown={(e) => {
                  if (e.key === "-") {
                    e.preventDefault();
                  }
                }}              
                onChange={(e) =>
                  setNewDetailForm({
                    ...newDetailForm,
                    layer_thickness: Number(e.target.value),
                  })
                }
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {/* Modal para mostrar Detalles Generales filtrados según el tipo */}
      {showDetallesModal && (
        // Aquí iría el componente/modal para mostrar los detalles generales
        <ModalCreate
          onSave={() => {}}
          detail={null}
          isOpen={showDetallesModal}
          title="Detalles Generales"
          onClose={() => setShowDetallesModal(false)}
          modalStyle={{ maxWidth: "70%", width: "70%", padding: "32px" }}
          hideFooter={true}
        >
          {renderDetallesModalContent()}
        </ModalCreate>
      )}
    </>
  );
};

export default WorkFlowpar2createPage;
