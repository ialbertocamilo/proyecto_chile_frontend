import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Card from "../src/components/common/Card";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";
import GooIcons from "../public/GoogleIcons";
import { Tooltip } from "react-tooltip";
import Modal from "../src/components/common/Modal";
import { toast } from 'react-toastify';

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

function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

// Se agregó la propiedad activeStep para conocer cuál opción está activa
interface SidebarItemProps {
  stepNumber: number;
  iconName: string;
  title: string;
  activeStep?: number;
  onClickAction?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  stepNumber,
  iconName,
  title,
  activeStep,
  onClickAction,
}) => {
  const primaryColor = "#3ca7b7";
  const inactiveColor = "#ccc";
  const currentStep = activeStep !== undefined ? activeStep : stepNumber;
  const handleClick = () => {
    if (onClickAction) {
      onClickAction();
    }
  };

  return (
    <li
      className="nav-item"
      style={{ cursor: "pointer" }}
      onClick={handleClick}
    >
      <div
        style={{
          width: "100%",
          height: "100px",
          border: `1px solid ${
            currentStep === stepNumber ? primaryColor : inactiveColor
          }`,
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: "50px",
          color: currentStep === stepNumber ? primaryColor : inactiveColor,
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

const ProjectWorkflowPart3: React.FC = () => {
  useAuth();
  const router = useRouter();
  const mode = router.query.mode as string;
  const isViewMode = mode === "view";

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
  useEffect(() => {
    if (router.query.step) {
      const queryStep = parseInt(router.query.step as string, 10);
      if (!isNaN(queryStep)) {
        setStep(queryStep);
      }
    }
  }, [router.query.step]);

  const sidebarWidth = "300px";

  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showNewDetailRow, setShowNewDetailRow] = useState(false);
  const [newDetailForm, setNewDetailForm] = useState({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: 10,
  });
  // Controla si se muestra la vista inicial o la de pestañas
  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

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
  const [isCreatingNewDetail, setIsCreatingNewDetail] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para edición en Muros y Techumbredd
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
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.");
    }
  };

  const fetchMurosDetails = useCallback(async () => {
    console.log("fetchMurosDetails ejecutado con projectId:", projectId);

    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }

    try {
      console.log("Proyecto id: ", projectId);
      const url = `http://ceela-backend.svgdev.tech/project/${projectId}/details/Muro`;
      console.log("URL: ", url);
      const headers = { Authorization: `Bearer ${token}` };
      console.log("token: ", token);
      const response = await axios.get(url, { headers });
      console.log("response", response);
      console.log("Datos recibidos de la API:", response.data);

      if (response.data && response.data.length > 0) {
        setMurosTabList(response.data);
      }
    } catch (error) {
      console.error("Error al obtener datos de muros:", error);
    }
  }, [projectId]);

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
    }
  }, [projectId]);

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
    }
  }, [projectId]);

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

  useEffect(() => {
    if (showTabsInStep4) {
      setTabStep4("muros");
    }
  }, [showTabsInStep4]);

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
  if (!isCreatingNewDetail) return; // Solo permite la acción si se presionó "Nuevo"

  if (
    !newDetailForm.scantilon_location ||
    !newDetailForm.name_detail ||
    !newDetailForm.material_id
  ) {
    toast.error("Todos los campos son obligatorios");
    setShowNewDetailRow(false);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token no encontrado. Inicia sesión.");
      return;
    }

    // Crear nuevo detalle
    const createUrl = `${constantUrlApiEndpoint}/details/create`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(createUrl, newDetailForm, { headers });
    setShowNewDetailRow(false);
    console.log("Respuesta del backend al crear detalle:", response.data);

    const newDetailId = response.data.detail.id; // Accede correctamente al ID dentro de detail

    if (!newDetailId) {
      toast.error("El backend no devolvió un ID de detalle válido.");
      return;
    }

    toast.success(response.data.success || "Detalle creado exitosamente");

    // Agregar el nuevo detalle a la lista de detalles seleccionados del proyecto
    if (!projectId) return;

    const selectUrl = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
    const detailIds = [
      ...fetchedDetails.map((det) => det.id_detail),
      newDetailId,
    ];

    await axios.post(selectUrl, detailIds, { headers });

    // Actualizar la lista de detalles y resetear formulario
    fetchFetchedDetails();
    setNewDetailForm({
      scantilon_location: "",
      name_detail: "",
      material_id: 0,
      layer_thickness: 10,
    });
    setIsCreatingNewDetail(false);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error en la creación del detalle:", error.response?.data);
      toast.error(error.response?.data?.detail || error.message);
    } else {
      toast.error("Error desconocido al crear el detalle");
    }
  }
};


  const handleNewButtonClick = () => {
    setIsCreatingNewDetail(true);
    setShowNewDetailRow(true); // Muestra el formulario
    fetchMaterials(); // Cargar materiales si aún no se han cargado
  };

  const handleSaveDetails = async () => {
    // Retrasar la ejecución de la función 1 segundo al inicio
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verifica que el ID de proyecto esté disponible
    if (!projectId) {
      console.error("No se proporcionó un ID de proyecto.");
      return;
    }

    // Verifica que el token esté presente
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    // Verifica si `fetchedDetails` tiene datos antes de hacer la solicitud
    if (fetchedDetails.length === 0) {
      console.error("No se encontraron detalles para enviar.");
      return;
    }

    // Mapea los detalles para obtener solo los ID de detalle
    const detailIds = fetchedDetails.map((det) => det.id_detail);
    console.log("Detalles ID antes de la solicitud:", detailIds);

    // Si `detailIds` está vacío, no proceder
    if (detailIds.length === 0) {
      console.error("No se encontraron detalles para enviar.");
      return;
    }

    // Configuración de la URL y headers
    const url = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      // Realizar la solicitud POST
      console.log("Headers", headers);
      const response = await axios.post(url, detailIds, { headers });
      console.log("Respuesta de la API:", response.data);

      // Verifica si la respuesta contiene datos antes de continuar
      if (response && response.data) {
        setShowTabsInStep4(true); // Cambia la vista de la pestaña
        setTabStep4("muros"); // Establece el paso correcto
      } else {
        console.error("La respuesta no contiene datos.");
      }
    } catch (error) {
      // Verifica si hay un error en la respuesta de la API
      console.error("Error al enviar la solicitud:", error);
    }
  };

  const handleSaveDetailsCopy = useCallback(async () => {
    if (!projectId) {
      console.error("No se proporcionó un ID de proyecto.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    if (fetchedDetails.length === 0) {
      console.error("No se encontraron detalles para enviar.");
      return;
    }

    const detailIds = fetchedDetails.map((det) => det.id_detail);
    console.log("Detalles ID antes de la solicitud:", detailIds);

    if (detailIds.length === 0) {
      console.error("No se encontraron detalles para enviar.");
      return;
    }

    const url = `${constantUrlApiEndpoint}/projects/${projectId}/details/select`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      console.log("Headers", headers);
      const response = await axios.post(url, detailIds, { headers });
      console.log("Respuesta de la API:", response.data);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  }, [projectId, fetchedDetails]); // Dependencias necesarias

  useEffect(() => {
    if (fetchedDetails.length > 0) {
      handleSaveDetailsCopy();
    }
  }, [fetchedDetails, handleSaveDetailsCopy]);

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

  const handleEditClick = (detail: TabItem) => {
    setEditingRowId(detail.id || null);
    setEditingColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleCancelEdit = (detail: TabItem) => {
    // Revertir al estado original o deshacer los cambiosss
    setEditingColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });

    // Cerrar el modo de edición
    setEditingRowId(null);
  };

  const handleConfirmEdit = async (detail: TabItem) => {
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token no encontrado. Inicia sesión.");
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
  
      toast.success("Detalle tipo Muro actualizado con éxito");
  
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

  const handleEditTechClick = (detail: TabItem) => {
    setEditingTechRowId(detail.id || null);
    setEditingTechColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleCancelTechEdit = (detail: TabItem) => {
    // Restablecer los valores de edición al estado original
    setEditingTechRowId(null); // Salir del modo de edición
    setEditingTechColors({
      interior: detail.info?.surface_color?.interior?.name || "Intermedio",
      exterior: detail.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleConfirmTechEdit = async (detail: TabItem) => {
  if (!projectId) return;
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Token no encontrado. Inicia sesión.");
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

    toast.success("Detalle tipo Techo actualizado con éxito");

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

  // --- Render del encabezado ---
  const renderMainHeader = () =>
    step >= 4 ? (
      <div className="mb-3" style={{ padding: "20px" }}>
        <h2
          style={{
            fontSize: "2  em",
            margin: "0 0 20px 0",
            fontWeight: "normal",
            fontFamily: "var(--font-family-base)",
          }}
        >
          {isViewMode
            ? "Vista de desarrollo de proyecto"
            : "Desarrollo de proyecto"}
        </h2>
        <div className="d-flex align-items-center gap-4">
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

  // Se modificó SidebarItemComponent para pasar el step activo
  const SidebarItemComponent = ({
    stepNumber,
    iconName,
    title,
    onClickAction,
  }: {
    stepNumber: number;
    iconName: string;
    title: string;
    onClickAction?: () => void;
  }) => {
    return (
      <SidebarItem
        stepNumber={stepNumber}
        iconName={iconName}
        title={title}
        activeStep={step}
        onClickAction={onClickAction}
      />
    );
  };

  const stickyHeaderStyle1 = {
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#fff",
    zIndex: 3,
  };

  const stickyHeaderStyle2 = {
    position: "sticky" as const,
    top: 40,
    backgroundColor: "#fff",
    zIndex: 2,
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
      <div className="mt-4">
        {/* Menú en la parte superior */}
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

        {/* Contenedor con scroll si es necesario */}
        <div
          style={{ height: "400px", overflowY: "auto", position: "relative" }}
        >
          {tabStep4 === "muros" && (
            <div style={{ overflowX: "auto" }}>
              <table
                className="table table-bordered table-striped"
                style={{ width: "100%", minWidth: "600px" }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Nombre Abreviado
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Valor U (W/m²K)
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Color Exterior
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Color Interior
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {murosTabList.length > 0 ? (
                    murosTabList.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>
                          {item.name_detail}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.value_u?.toFixed(3) ?? "--"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {editingRowId === item.id && !isViewMode ? (
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
                        <td style={{ textAlign: "center" }}>
                          {editingRowId === item.id && !isViewMode ? (
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
                        <td style={{ textAlign: "center" }}>
                          {!isViewMode &&
                            (editingRowId === item.id ? (
                              <>
                                <CustomButton
                                  variant="save"
                                  onClick={() => handleConfirmEdit(item)}
                                  style={{
                                    fontSize: "clamp(0.5rem, 1vw, 0.8rem)", // Tamaño adaptable
                                    padding:
                                      "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)", // Padding adaptable
                                  }}
                                >
                                  <span className="material-icons">check</span>
                                </CustomButton>
                                <CustomButton
                                  variant="cancelIcon"
                                  onClick={() => handleCancelEdit(item)}
                                  style={{
                                    fontSize: "clamp(0.6rem, 1vw, 0.9rem)", // Tamaño adaptable
                                    padding:
                                      "clamp(3px, 0.5vw, 6px) clamp(8px, 1vw, 12px)",
                                    marginLeft: "clamp(5px, 1vw, 10px)", // Espaciado adaptable
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
                            ))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={{ textAlign: "center" }}>No hay datos</td>
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
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Nombre Abreviado
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Valor U (W/m²K)
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Color Exterior
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Color Interior
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {techumbreTabList.length > 0 ? (
                    techumbreTabList.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>
                          {item.name_detail}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.value_u?.toFixed(3) ?? "--"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {editingTechRowId === item.id && !isViewMode ? (
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
                        <td style={{ textAlign: "center" }}>
                          {editingTechRowId === item.id && !isViewMode ? (
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
                        <td style={{ textAlign: "center" }}>
                          {!isViewMode &&
                            (editingTechRowId === item.id ? (
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
                            ))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No hay datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          ;
          {tabStep4 === "pisos" && (
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th
                      rowSpan={2}
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Nombre
                    </th>
                    <th
                      rowSpan={2}
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      U [W/m²K]
                    </th>
                    <th
                      colSpan={2}
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Aislamiento bajo piso
                    </th>
                    <th
                      colSpan={3}
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Ref Aisl Vert.
                    </th>
                    <th
                      colSpan={3}
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Ref Aisl Horiz.
                    </th>
                  </tr>
                  <tr>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      I [W/mK]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      e Aisl [cm]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      I [W/mK]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      e Aisl [cm]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      D [cm]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      I [W/mK]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      e Aisl [cm]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle2,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      D [cm]
                    </th>
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
                          <td style={{ textAlign: "center" }}>
                            {item.name_detail}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.value_u?.toFixed(3) ?? "--"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {bajoPiso.lambda
                              ? bajoPiso.lambda.toFixed(3)
                              : "N/A"}
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
            </div>
          )}
          {tabStep4 === "ventanas" && (
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Nombre Elemento
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      U Vidrio [W/m²K]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      FS Vidrio []
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Tipo Marco
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Tipo Cierre
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      U Marco [W/m²K]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      FV [%]
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ventanasTabList.length > 0 ? (
                    ventanasTabList.map((item, idx) => (
                      <tr key={idx}>
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
                        <td style={{ textAlign: "center" }}>
                          {item.fm ?? "--"}
                        </td>
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
            </div>
          )}
          {tabStep4 === "puertas" && (
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Nombre Elemento
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      U puerta opaca [W/m²K]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      Vidrio []
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      % vidrio
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      U Marco [W/m²K]
                    </th>
                    <th
                      style={{
                        ...stickyHeaderStyle1,
                        color: primaryColor,
                        textAlign: "center",
                      }}
                    >
                      FM [%]
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {puertasTabList.length > 0 ? (
                    puertasTabList.map((item, idx) => (
                      <tr key={idx}>
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
                        <td style={{ textAlign: "center" }}>
                          {item.fm ?? "--"}
                        </td>
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
            </div>
          )}
        </div>
        {/* Botón "Regresar" para volver a la tabla inicial */}
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
            </span>{" "}
            {/* Regresar */}
          </CustomButton>
        </div>
        {/* Botones de navegación: se muestran tanto en modo vista como en ediciónss */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        ></div>
      </div>
    );
  };

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
              style={{ height: "50px" }}
            />
          </div>
          {!isViewMode && (
            <div style={{ height: "50px" }}>
              <CustomButton
                variant="save"
                onClick={() => {
                  setShowNewDetailRow((prev) => {
                    const newState = !prev; // Alternar estado
                    if (newState) {
                      fetchMaterials();
                      handleNewButtonClick(); // Ahora sí funcionará bien
                    } else {
                      setIsCreatingNewDetail(false); // Aquí se desactiva correctamente
                    }
                    console.log("Estado del botón Nuevo:", newState);
                    return newState; // Retornar el nuevo estado
                  });
                }}
                style={{ height: "100%" }}
              >
                <span className="material-icons">add</span> Nuevo
              </CustomButton>
            </div>
          )}
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
                      textAlign: "center",
                    }}
                  >
                    Ubicación Detalle
                  </th>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                      textAlign: "center",
                    }}
                  >
                    Nombre Detalle
                  </th>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                      textAlign: "center",
                    }}
                  >
                    Material
                  </th>
                  <th
                    style={{
                      ...stickyHeaderStyle1,
                      color: "var(--primary-color)",
                      textAlign: "center",
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
                        gap: "15px", // Espaciado entre elementos
                        padding: "20px", // Más espacio interno
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
                          disabled={isViewMode}
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
                          disabled={isViewMode}
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
                          disabled={isViewMode}
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
                          className="form-control"
                          placeholder="Espesor (cm)"
                          value={newDetailForm.layer_thickness}
                          onChange={(e) =>
                            setNewDetailForm((prev) => ({
                              ...prev,
                              layer_thickness: parseFloat(e.target.value) || 0,
                            }))
                          }
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    {/* Botón alineado abajo a la derecha */}
                    {!isViewMode && (
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
                          onClick={async () => {
                            await handleCreateNewDetail();
                          }}
                          id="grabar-datos-btn"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            fontSize: "16px",
                          }}
                        >
                          <span className="material-icons">sd_card</span> Grabar
                          Datos
                        </CustomButton>
                      </div>
                    )}

                    <Tooltip anchorSelect="#grabar-datos-btn" place="top">
                      Guardar cambios tras agregar un detalle
                    </Tooltip>
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
        {/* Botones para la tabla inicial */}
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
          {/* Contenedor para centrar el botón "Mostrar datos" entre las flechas */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // Separa los botones a los extremos
              width: "100%", // Asegura que ocupe todo el ancho disponible
            }}
          >
            {/* Botón de sección anterior (alineado a la izquierda) */}
            <div
              style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
            >
              <CustomButton
                id="seccion-anterior-btn"
                onClick={() =>
                  router.push(
                    isViewMode
                      ? "/project-workflow-part2?mode=view&step=6"
                      : "/project-workflow-part2?step=6"
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 4vw, 2rem)",
                  borderRadius: "0.5rem",
                  height: "min(3rem, 8vh)",
                  minWidth: "3rem",
                  width: "clamp(3rem, 10vw, 14rem)", // Se ajusta entre 3rem y 6rem según el ancho de la pantalla
                  fontSize: "clamp(1rem, 2vw, 1.5rem)", // Ajusta el tamaño del texto
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <span className="material-icons" style={{ fontSize: "1.1em" }}>
                  arrow_back
                </span>
              </CustomButton>
            </div>

            <Tooltip anchorSelect="#seccion-anterior-btn" place="top">
              {`Sección anterior: "Perfil de Uso"`}
            </Tooltip>

            {/* Botón "Mostrar datos" centrado */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <CustomButton
                id="mostrar-datos-btn"
                variant="save"
                onClick={() => {
                  setTimeout(() => {
                    handleSaveDetails();
                    setShowTabsInStep4(true);
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
                <span className="material-icons">visibility</span> Mostrar datos
              </CustomButton>
            </div>

            <Tooltip anchorSelect="#mostrar-datos-btn" place="top">
              Vista a los detalles calculados
            </Tooltip>

            {/* Botón de sección siguiente (alineado a la derecha) */}
            <div
              style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
            >
              <CustomButton
                id="siguiente-seccion-btn"
                onClick={() => {
                  handleSaveDetailsCopy();
                  setStep(7);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 4vw, 2rem)",
                  borderRadius: "0.5rem",
                  height: "min(3rem, 8vh)",
                  minWidth: "3rem",
                  width: "clamp(3rem, 10vw, 14rem)", // Se ajusta entre 3rem y 6rem según el ancho de la pantalla
                  fontSize: "clamp(1rem, 2vw, 1.5rem)", // Ajusta el tamaño del texto
                }}
              >
                <span className="material-icons" style={{ fontSize: "1.1em" }}>
                  arrow_forward
                </span>
              </CustomButton>
            </div>

            <Tooltip anchorSelect="#siguiente-seccion-btn" place="top">
              Siguiente sección
            </Tooltip>
          </div>
        </div>
      </>
    );
  };

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

  return (
    <>
      <GooIcons />
      <Navbar setActiveView={() => {}} />
      <TopBar sidebarWidth={sidebarWidth} />
      <div
        className="container custom-container"
        style={{
          maxWidth: "1780px",
          marginTop: "120px",
          marginLeft: "103px",
          marginRight: "0px",
          transition: "margin-left 0.1s ease",
          fontFamily: "var(--font-family-base)",
        }}
      >
        <Card style={{ marginLeft: "0.1rem", width: "100%" }}>
          {renderMainHeader()}
        </Card>
        <Card
          style={{
            marginTop: "clamp(0.5rem, 2vw, 1rem)", // Adapta margen superior
            marginLeft: "0.1rem",
            width: "100%",
          }}
        >
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3 col-12 order-lg-first order-first">
              <div
                style={{
                  padding: "20px",
                  boxSizing: "border-box",
                  borderRight: "1px solid #ccc",
                }}
                className="mb-3 mb-lg-0"
              >
                <ul className="nav flex-column" style={{ height: "100%" }}>
                  {/* Mantener igual los SidebarItemComponent */}
                  {isViewMode && (
                    <>
                      <SidebarItemComponent
                        stepNumber={1}
                        iconName="assignment_ind"
                        title="Agregar detalles..."
                        onClickAction={() =>
                          router.push(
                            "/project-workflow-part1?mode=view&step=1"
                          )
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={2}
                        iconName="location_on"
                        title="Ubicación del proyecto"
                        onClickAction={() =>
                          router.push(
                            "/project-workflow-part1?mode=view&step=2"
                          )
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={3}
                        iconName="imagesearch_roller"
                        title="Lista de materiales"
                        onClickAction={() =>
                          router.push(
                            "/project-workflow-part2?mode=view&step=3"
                          )
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={5}
                        iconName="home"
                        title="Elementos translúcidos"
                        onClickAction={() =>
                          router.push(
                            "/project-workflow-part2?mode=view&step=5"
                          )
                        }
                      />
                      <SidebarItemComponent
                        stepNumber={6}
                        iconName="deck"
                        title="Perfil de uso"
                        onClickAction={() =>
                          router.push(
                            "/project-workflow-part2?mode=view&step=6"
                          )
                        }
                      />
                    </>
                  )}
                  <SidebarItemComponent
                    stepNumber={4}
                    iconName="build"
                    title="Detalles constructivos"
                    onClickAction={() => setStep(4)}
                  />
                  <SidebarItemComponent
                    stepNumber={7}
                    iconName="design_services"
                    title="Recinto"
                    onClickAction={() => setStep(7)}
                  />
                </ul>
              </div>
            </div>

            {/* Contenido principal */}
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
        @media (max-width: 992px) {
          /* Ajustes para móvil */
          .container-fluid {
            margin-left: 10px;
            margin-right: 10px;
            padding: 0 5px;
          }

          /* Sidebar en móvil */
          .col-lg-3 {
            border-right: none;
            border-bottom: 1px solid #ccc;
          }

          /* Tabla responsive */
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* Ajustar márgenes */
          .mb-3.mb-lg-0 {
            margin-bottom: 1rem;
          }

          /* Reducir padding en móvil */
          [style*="padding: 20px"] {
            padding: 15px;
          }
        }

        @media (max-width: 768px) {
          /* Ajustar fuentes en móvil */
          .table {
            font-size: 12px;
          }

          th,
          td {
            padding: 8px;
          }

          /* Ajustar altura del scroll */
          [style*="height: 390px"] {
            height: 300px;
          }
        }

        /* Mantener estilos sticky para headers */
        [style*="stickyHeaderStyle1"] {
          position: sticky;
          top: 0;
          z-index: 2;
          background: white;
        }
      `}</style>
    </>
  );
};

export default ProjectWorkflowPart3;
