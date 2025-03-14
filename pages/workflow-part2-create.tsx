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
// Importamos el componente SidebarItemComponent del directorio común
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
// Importamos el componente SearchParameters
import Breadcrumb from "@/components/common/Breadcrumb";
import TablesParameters from "@/components/tables/TablesParameters";
import VerticalDivider from "@/components/ui/HorizontalDivider";
import SearchParameters from "../src/components/inputs/SearchParameters";
import { NewDetailModal } from "@/components/modals/NewDetailModal";

interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail: string;
  material_id: number;
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

// Constantes de estilos para encabezados sticky de tablas
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
    const storedProjectId = localStorage.getItem("project_id");
    if (storedProjectId) {
      setProjectId(Number(storedProjectId));
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded && projectId === null) {
      notify(
        "Ningún proyecto está seleccionado",
        "Serás redirigido a la creación de proyecto",
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

  // Función auxiliar para obtener el token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
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

  // Función para obtener detalles
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
      notify("Error", "Error al obtener detalles. Ver consola.");
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
        notify("Error al obtener datos de ventanas. Ver consola.");
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
        notify("Error al obtener datos de puertas. Ver consola.");
      });
  }, []);

  // Función para obtener materiales
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
      notify("Error al obtener Materiales.");
    }
  };

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
      notify("Por favor complete todos los campos de Detalle.");
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
        notify("El backend no devolvió un ID de Detalle válido.");
        return;
      }

      // Paso 2: Añadir el detalle al proyecto directamente
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
        notify("No se añadio el Detalle al proyecto (ID de proyecto no disponible).");
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

  // Función unificada para guardar detalles
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
        error.response?.data?.detail ===
        "Todos los detalles ya estaban en el proyecto"
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

  // =================== FUNCIONES DE EDICIÓN (MUROS / TECHUMBRE) ===================
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

  // =================== RENDER DE CABECERA PRINCIPAL ===================
  const renderMainHeader = () => <Title text="Desarrollo de proyecto" />;

  // =================== RENDER DE TABLAS MUROS / TECHUMBRE / PISOS / VENTANAS / PUERTAS ===================
  const renderMurosTable = () => {
    // Defino las columnas
    const columnsMuros = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
      { headerName: "Acciones", field: "acciones" },
    ];

    // Defino la data, en cada "field" puedo meter JSX si necesito selects o botones:
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
          <>
            <CustomButton
              className="btn-table"
              variant="save"
              onClick={() => handleConfirmEdit(item)}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={() => handleCancelEdit(item)}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={() => handleEditClick(item)}
          >
            Editar
          </CustomButton>
        ),
      };
    });

    return (
      <div style={{ overflowX: "auto" }}>
        {murosTabList.length > 0 ? (
          <TablesParameters
            columns={columnsMuros}
            data={murosData}
          />
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
          <>
            <CustomButton
              className="btn-table"
              variant="save"
              onClick={() => handleConfirmTechEdit(item)}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={() => handleCancelTechEdit(item)}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            variant="editIcon"
            className="btn-table"
            onClick={() => handleEditTechClick(item)}
          >
            Editar
          </CustomButton>
        ),
      };
    });

    return (
      <div style={{ minWidth: "600px" }}>
        {techumbreTabList.length > 0 ? (
          <TablesParameters columns={columnsTech} data={techData} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  const renderPisosTable = () => {
    // Para múltiples columnas: simulamos la doble cabecera en un solo header (10 columnas)
    // Nombre | U | I_bajoPiso | eAisl_bajoPiso | I_vert | eAisl_vert | D_vert | I_horiz | eAisl_horiz | D_horiz
    const columnsPisos = [
      { headerName: "Nombre", field: "nombre" },
      { headerName: "U [W/m²K]", field: "uValue" },
      { headerName: "I [W/mK] (bajo piso)", field: "bajoPisoLambda" },
      { headerName: "e Aisl [cm]", field: "bajoPisoEAisl" },
      { headerName: "I [W/mK] (vert)", field: "vertLambda" },
      { headerName: "e Aisl [cm]", field: "vertEAisl" },
      { headerName: "D [cm]", field: "vertD" },
      { headerName: "I [W/mK] (horiz)", field: "horizLambda" },
      { headerName: "e Aisl [cm]", field: "horizEAisl" },
      { headerName: "D [cm]", field: "horizD" },
    ];

    const multiHeaderPisos = {
      rows: [
        [
          { label: "Nombre", rowSpan: 2 },
          { label: "U [W/m²K]", rowSpan: 2 },
          { label: "Aislamiento bajo piso", colSpan: 2 },
          { label: "Ref Aisl Vert.", colSpan: 3 },
          { label: "Ref Aisl Horiz.", colSpan: 3 },
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
      const bajoPiso = item.info?.aislacion_bajo_piso || {};
      const vert = item.info?.ref_aisl_vertical || {};
      const horiz = item.info?.ref_aisl_horizontal || {};
      return {
        nombre: item.name_detail,
        uValue: item.value_u?.toFixed(3) ?? "--",
        bajoPisoLambda: bajoPiso.lambda ? bajoPiso.lambda.toFixed(3) : "N/A",
        bajoPisoEAisl: bajoPiso.e_aisl ?? "N/A",
        vertLambda: vert.lambda ? vert.lambda.toFixed(3) : "N/A",
        vertEAisl: vert.e_aisl ?? "N/A",
        vertD: vert.d ?? "N/A",
        horizLambda: horiz.lambda ? horiz.lambda.toFixed(3) : "N/A",
        horizEAisl: horiz.e_aisl ?? "N/A",
        horizD: horiz.d ?? "N/A",
      };
    });

    return (
      <div style={{ minWidth: "600px" }}>
        {pisosTabList.length > 0 ? (
          <TablesParameters
            columns={columnsPisos}
            data={pisosData}
            multiHeader={multiHeaderPisos} // <--- Aquí la magia del multiheader
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
      { headerName: "FV [%]", field: "fm" },
    ];

    const ventanasData = ventanasTabList.map((item, idx) => ({
      name_element: item.name_element,
      u_vidrio: item.atributs?.u_vidrio
        ? item.atributs.u_vidrio.toFixed(3)
        : "--",
      fs_vidrio: item.atributs?.fs_vidrio ?? "--",
      frame_type: item.atributs?.frame_type ?? "--",
      clousure_type: item.atributs?.clousure_type ?? "--",
      u_marco: item.u_marco ? item.u_marco.toFixed(3) : "--",
      fm: item.fm ?? "--",
    }));

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
    ];

    const puertasData = puertasTabList.map((item, idx) => ({
      name_element: item.name_element,
      u_puerta: item.atributs?.u_puerta_opaca
        ? item.atributs.u_puerta_opaca.toFixed(3)
        : "--",
      name_ventana: item.atributs?.name_ventana ?? "--",
      porcentaje_vidrio: item.atributs?.porcentaje_vidrio ?? "--",
      u_marco: item.u_marco ? item.u_marco.toFixed(3) : "--",
      fm: item.fm ?? "--",
    }));

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

  // =================== RENDER DE LAS PESTAÑAS EN STEP 4 ===================
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
                  color: tabStep4 === item.key ? primaryColor : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    tabStep4 === item.key ? `3px solid ${primaryColor}` : "none",
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

        <div style={{ height: "400px", overflowY: "auto", position: "relative" }}>
          {tabStep4 === "muros" && renderMurosTable()}
          {tabStep4 === "techumbre" && renderTechumbreTable()}
          {tabStep4 === "pisos" && renderPisosTable()}
          {tabStep4 === "ventanas" && renderVentanasTable()}
          {tabStep4 === "puertas" && renderPuertasTable()}
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

  // =================== RENDER DE LA VISTA INICIAL DE DETALLES ===================
  const renderInitialDetails = () => {
    if (showTabsInStep4) return null;

    // Columns para TablesParameters
    const columnsDetails = [
      { headerName: "Ubicación Detalle", field: "scantilon_location" },
      { headerName: "Nombre Detalle", field: "name_detail" },
      { headerName: "Material", field: "material" },
      { headerName: "Espesor capa (cm)", field: "layer_thickness" },
    ];

    // Filtramos los detalles para la búsqueda
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
        <SearchParameters
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar..."
          onNew={handleNewButtonClick}
          newButtonText="Nuevo"
          style={{ marginBottom: "1rem" }}
        />


        <NewDetailModal
          showNewDetailRow={showNewDetailRow}
          setShowNewDetailRow={setShowNewDetailRow}
          newDetailForm={newDetailForm}
          setNewDetailForm={setNewDetailForm}
          materials={materials}
          handleCreateNewDetail={handleCreateNewDetail} />

        {/* Tabla generada con TablesParameters para DETALLES */}
        <div style={{ height: "400px", overflowY: "auto", overflowX: "auto" }}>
          <TablesParameters columns={columnsDetails} data={filteredData} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <CustomButton
                id="mostrar-datos-btn"
                variant="save"
                onClick={() => {
                  setTimeout(() => {
                    saveDetails();
                  }, 600);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "clamp(0.5rem, 1vw, 1rem) clamp(1rem, 4vw, 2rem)",
                  height: "min(3rem, 8vh)",
                  minWidth: "6rem",
                }}
              >
                Realizar Calculos
              </CustomButton>
            </div>
          </div>
        </div>
      </>
    );
  };

  // =================== RENDER DE RECINTO (SIMPLE) ===================
  const renderRecinto = () => {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
        </div>
        <div style={{ height: "390px", overflowY: "scroll", overflowX: "auto" }}>
          {/* Ejemplo de tabla manual, si más adelante quieres TablesParameters, puedes hacerlo */}
          <table className="table table-bordered " style={{ width: "100%", minWidth: "600px" }}>
            <thead>
              <tr>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>ID</th>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>Estado</th>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>
                  Nombre del Recinto
                </th>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>
                  Perfil de Ocupación
                </th>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>Sensor CO2</th>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>
                  Altura Promedio
                </th>
                <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)" }}>Área</th>
              </tr>
            </thead>
            <tbody>{/* Lógica para mostrar los recintos */}</tbody>
          </table>
        </div>
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
        <div className="d-flex align-items-center w-100" style={{ marginBottom: "2rem" }}>
          {renderMainHeader()}
        </div>
        <div className="d-flex align-items-center gap-4">
          <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
            Proyecto:
          </span>
          <CustomButton
            variant="save"
            className="no-hover"
            style={{ padding: "0.8rem 3rem" }}
          >
            {`Edificación Nº ${projectId ?? "xxxxx"}`}
          </CustomButton>
          <div className="ms-auto" style={{ display: "flex" }}>
            <Breadcrumb
              items={[
                {
                  title: "Proyecto Nuevo",
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
          <div className="col-lg-3 col-12 order-lg-first order-first">
            <div className="mb-3 mb-lg-0">
              {/* Sidebar usando el componente común */}
              <AdminSidebar activeStep={step} onStepChange={setStep} steps={sidebarSteps} />
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
    </>
  );
};

export default WorkFlowpar2createPage;