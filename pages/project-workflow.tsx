// ./pages/project-workflow.tsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import useAuth from "../src/hooks/useAuth"; // Importa el hook de autenticación
const NoSSRInteractiveMap = dynamic(() => import("../src/components/InteractiveMap"), { ssr: false });


interface MaterialAtributs {
  name: string;
  conductivity: number;
  specific_heat: number;
  density: number;
}

interface Material {
  id: number;
  atributs: MaterialAtributs;
}

interface WindowAttributes {
  u_vidrio: number;
  fs_vidrio: number;
  frame_type: string;
  clousure_type: string;
}

interface DoorAttributes {
  u_puerta_opaca: number;
  porcentaje_vidrio: number;
  name_ventana: string;
}

export interface ElementBase {
  id: number;
  type: "window" | "door";
  name_element: string;
  u_marco: number;
  fm: number;
  atributs: WindowAttributes | DoorAttributes;
}

export interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail: string;
  id_material: number;
  material: string;
  layer_thickness: number;
}

interface Recinto {
  id: number;
  estado: string;
  nombre: string;
  perfilOcup: string;
  sensorCO2: string;
  alturaProm: number;
  area: number;
}

interface FormData {
  name_project: string;
  owner_name: string;
  owner_lastname: string;
  country: string;
  department: string;
  province: string;
  district: string;
  building_type: string;
  main_use_type: string;
  number_levels: number;
  number_homes_per_level: number;
  built_surface: number;
  latitude: number;
  longitude: number;
}

interface DoorData {
  name_element: string;
  ventana_id: number;
  name_ventana: string;
  u_puerta_opaca: number;
  porcentaje_vidrio: number;
  u_marco: number;
  fm: number;
}

interface WindowData {
  name_element: string;
  u_vidrio: number;
  fs_vidrio: number;
  clousure_type: string;
  frame_type: string;
  u_marco: number;
  fm: number;
}

interface NewDetailForm {
  scantilon_location: string;
  name_detail: string;
  material_id: number;
  layer_thickness: number;
}

interface TabElement {
  name_detail: string;
  value_u?: number;
  info?: {
    surface_color?: {
      exterior?: { name: string };
      interior?: { name: string };
    };
    ref_aisl_bajo_piso?: {
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
}

// =================================================
// Página Principal
// =================================================

const ProjectCompleteWorkflowPage: React.FC = () => {

  useAuth();
  console.log("[ProjectCompleteWorkflowPage] Página cargada y sesión validada.");
  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const [step, setStep] = useState<number>(1);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");
  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");
  const [formData, setFormData] = useState<FormData>({
    name_project: "",
    owner_name: "",
    owner_lastname: "",
    country: "",
    department: "",
    province: "",
    district: "",
    building_type: "",
    main_use_type: "",
    number_levels: 0,
    number_homes_per_level: 0,
    built_surface: 0,
    latitude: 0,
    longitude: 0,
  });
  const [locationSearch, setLocationSearch] = useState("");
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [details, setDetails] = useState<Detail[]>([]);
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showSelectDetailModal, setShowSelectDetailModal] = useState(false);
  const [showCreateDetailModal, setShowCreateDetailModal] = useState(false);
  const [newDetailForm, setNewDetailForm] = useState<NewDetailForm>({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: 10,
  });

  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<"detalles" | "muros" | "techumbre" | "pisos">("detalles");

  const [detailsTabList, setDetailsTabList] = useState<NewDetailForm[]>([]);
  const [murosTabList, setMurosTabList] = useState<TabElement[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabElement[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabElement[]>([]);

  const [elementsList, setElementsList] = useState<ElementBase[]>([]);
  const [selectedElements, setSelectedElements] = useState<ElementBase[]>([]);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [modalElementType, setModalElementType] = useState<string>("ventanas");

  const [showCreateWindowModal, setShowCreateWindowModal] = useState(false);
  const [showCreateDoorModal, setShowCreateDoorModal] = useState(false);

  const [windowData, setWindowData] = useState<WindowData>({
    name_element: "",
    u_vidrio: 0,
    fs_vidrio: 0,
    frame_type: "",
    clousure_type: "Corredera",
    u_marco: 0,
    fm: 0,
  });
  const [doorData, setDoorData] = useState<DoorData>({
    name_element: "",
    ventana_id: 0,
    name_ventana: "",
    u_puerta_opaca: 0,
    porcentaje_vidrio: 0,
    u_marco: 0,
    fm: 0,
  });
  const [allWindowsForDoor, setAllWindowsForDoor] = useState<ElementBase[]>([]);

  const recintos: Recinto[] = [
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

  // =================================================
  // Funciones y llamadas a endpoints
  // =================================================

  const fetchElements = async (type: "window" | "door") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/elements/?type=${type}`;
      const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
      const response = await axios.get(url, { headers });
      setElementsList(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Swal.fire(
          `Error al obtener ${type === "window" ? "ventanas" : "puertas"}`,
          error.response?.data?.detail || error.message,
          "error"
        );
      } else {
        Swal.fire("Error", "Error desconocido", "error");
      }
    }
  };

  const fetchAllWindowsForDoor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/elements/?type=window`;
      const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
      const response = await axios.get(url, { headers });
      setAllWindowsForDoor(response.data);
    } catch (error) {
      console.error("Error al obtener ventanas para puerta:", error);
    }
  };

  useEffect(() => {
    if (showAddElementModal) {
      void (modalElementType === "ventanas" ? fetchElements("window") : fetchElements("door"));
    }
  }, [showAddElementModal, modalElementType]);

  useEffect(() => {
    if (showCreateDoorModal) {
      void fetchAllWindowsForDoor();
    }
  }, [showCreateDoorModal]);

  const handleFormInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewDetailFormChange = (field: keyof NewDetailForm, value: string | number) => {
    setNewDetailForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const requestBody = {
        country: formData.country || "Peru",
        divisions: {
          department: formData.department,
          province: formData.province,
          district: formData.district,
        },
        name_project: formData.name_project,
        owner_name: formData.owner_name,
        owner_lastname: formData.owner_lastname,
        building_type: formData.building_type,
        main_use_type: formData.main_use_type,
        number_levels: formData.number_levels,
        number_homes_per_level: formData.number_homes_per_level,
        built_surface: formData.built_surface,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      const url = `${constantUrlApiEndpoint}/projects/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const response = await axios.post(url, requestBody, { headers });
      const { project_id, message } = response.data;
      setCreatedProjectId(project_id);
      Swal.fire("Proyecto creado", `ID: ${project_id} / Mensaje: ${message}`, "success").then(() => {
        setStep(3);
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error al crear proyecto", error.response?.data?.detail || error.message, "error");
      } else {
        Swal.fire("Error al crear proyecto", "Error desconocido", "error");
      }
    }
  };

  /**
   * FETCH DE MATERIALES (TODAS LAS PÁGINAS)
   */
  const fetchMaterialsList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      let allMaterials: Material[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${constantUrlApiEndpoint}/constants/?page=${page}&per_page=100`;
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(url, { headers });
        const currentData = response.data.constants || [];

        allMaterials = [...allMaterials, ...currentData];
        if (currentData.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      setMaterialsList(allMaterials);
    } catch (error: unknown) {
      console.error("Error al obtener materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error");
    }
  };

  const handleSaveMaterials = async () => {
    if (!createdProjectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    const materialIds = selectedMaterials.map((mat) => mat.id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${createdProjectId}/constants/select`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.post(url, materialIds, { headers });
      Swal.fire("Materiales guardados", "Materiales agregados correctamente", "success").then(() => {
        setStep(4);
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error al guardar materiales", error.response?.data?.detail || error.message, "error");
      } else {
        Swal.fire("Error al guardar materiales", "Error desconocido", "error");
      }
    }
  };

  const fetchFetchedDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/details/`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setFetchedDetails(response.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error al obtener detalles:", error.response?.data || error.message);
        Swal.fire("Error", "Error al obtener detalles. Ver consola.", "error");
      } else {
        console.error("Error al obtener detalles:", error);
        Swal.fire("Error", "Error desconocido", "error");
      }
    }
  };

  const handleAddDetailFromModal = (det: Detail) => {
    if (details.some((d) => d.id_detail === det.id_detail)) {
      Swal.fire("Detalle duplicado", "Este detalle ya fue seleccionado", "info");
      return;
    }
    setDetails((prev) => [...prev, det]);
    Swal.fire("Detalle agregado", `El detalle "${det.name_detail}" ha sido agregado.`, "success");
  };

  const handleCreateNewDetail = async () => {
    if (!newDetailForm.scantilon_location || !newDetailForm.name_detail || !newDetailForm.material_id) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/details/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const response = await axios.post(url, newDetailForm, { headers });
      const returnedDetail = response.data.detail as Detail;
      const materialObj = materialsList.find((mat) => mat.id === newDetailForm.material_id);
      if (materialObj) {
        returnedDetail.material = materialObj.atributs.name;
      }
      Swal.fire("Detalle creado", response.data.success, "success");
      fetchFetchedDetails();
      setShowCreateDetailModal(false);
      setNewDetailForm({ scantilon_location: "", name_detail: "", material_id: 0, layer_thickness: 10 });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error al crear detalle", error.response?.data?.detail || error.message, "error");
      } else {
        Swal.fire("Error al crear detalle", "Error desconocido", "error");
      }
    }
  };

  /**
   * Función que busca en la lista "materialsList" un material por su id y retorna su nombre.
   * Se ha actualizado para evitar pasar undefined y registrar el id en caso de error.
   */
  const getMaterialNameById = (matId: number | undefined): string => {
    // Si no se recibió un número, se registra y se retorna "Desconocido"
    if (matId == null) {
      console.log("Se esperaba un número, pero se recibió:", matId);
      return "Desconocido";
    }
    const mat = materialsList.find((m) => m.id === matId);
    if (!mat) {
      console.log(`No se encontró material para el id ${matId}`);
      return "Desconocido";
    }
    return mat.atributs.name;
  };

  const fetchStep4TabsData = async () => {
    if (!createdProjectId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      {
        const url = `${constantUrlApiEndpoint}/projects/${createdProjectId}/details`;
        const res = await axios.get(url, { headers });
        setDetailsTabList(res.data || []);
      }
      {
        const url = `${constantUrlApiEndpoint}/project/${createdProjectId}/details/Muro`;
        const res = await axios.get(url, { headers });
        setMurosTabList(res.data || []);
      }
      {
        const url = `${constantUrlApiEndpoint}/project/${createdProjectId}/details/Techo`;
        const res = await axios.get(url, { headers });
        setTechumbreTabList(res.data || []);
      }
      {
        const url = `${constantUrlApiEndpoint}/project/${createdProjectId}/details/Piso`;
        const res = await axios.get(url, { headers });
        setPisosTabList(res.data || []);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error al obtener datos de pestañas step4:", error.response?.data || error.message);
      } else {
        console.error("Error desconocido al obtener datos de pestañas step4:", error);
      }
    }
  };

  /**
   * IMPORTANTE:
   * Aquí ajustamos la lógica para que primero recargue materiales
   * y luego obtenga los detalles del proyecto. Así `getMaterialNameById`
   * no devuelva "Desconocido".
   */
  const handleSaveDetails = async () => {
    if (!createdProjectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    const detailIds = details.map((det) => det.id_detail);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${createdProjectId}/details/select`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.post(url, detailIds, { headers });

      // --- Ajuste aquí ---
      Swal.fire("Detalles guardados", "Detalles agregados correctamente", "success").then(async () => {
        // 1) Cargamos todos los materiales
        await fetchMaterialsList();
        // 2) Luego traemos la data de las pestañas
        await fetchStep4TabsData();
        // 3) Finalmente mostramos las pestañas
        setShowTabsInStep4(true);
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire(
          "Error al guardar detalles",
          error.response?.data?.message || error.response?.data?.detail || error.message,
          "error"
        );
      } else {
        Swal.fire("Error al guardar detalles", "Error desconocido", "error");
      }
    }
  };

  const handleSaveElements = async () => {
    if (!createdProjectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
      return;
    }
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const windowIds = selectedElements.filter((el) => el.type === "window").map((el) => el.id);
    const doorIds = selectedElements.filter((el) => el.type === "door").map((el) => el.id);
    try {
      if (windowIds.length > 0) {
        const urlWindows = `${constantUrlApiEndpoint}/projects/${createdProjectId}/elements/windows/select`;
        await axios.post(urlWindows, windowIds, { headers });
      }
      if (doorIds.length > 0) {
        const urlDoors = `${constantUrlApiEndpoint}/projects/${createdProjectId}/elements/doors/select`;
        await axios.post(urlDoors, doorIds, { headers });
      }
      Swal.fire("Elementos guardados", "Elementos agregados correctamente", "success").then(() => {
        setStep(6);
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  const handleAddElement = (element: ElementBase) => {
    if (selectedElements.some((el) => el.id === element.id)) {
      Swal.fire("Elemento duplicado", "Este elemento ya fue agregado", "info");
      return;
    }
    setSelectedElements((prev) => [...prev, element]);
    Swal.fire("Elemento agregado", `${element.name_element} ha sido agregado.`, "success");
  };

  const handleCreateWindowElement = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
      return;
    }
    const body = {
      name_element: windowData.name_element,
      type: "window",
      atributs: {
        u_vidrio: windowData.u_vidrio,
        fs_vidrio: windowData.fs_vidrio,
        frame_type: windowData.frame_type,
        clousure_type: windowData.clousure_type,
      },
      u_marco: windowData.u_marco,
      fm: windowData.fm,
    };
    try {
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      Swal.fire("Ventana creada", `La ventana "${windowData.name_element}" ha sido creada.`, "success");
      setShowCreateWindowModal(false);
      setWindowData({
        name_element: "",
        u_vidrio: 0,
        fs_vidrio: 0,
        frame_type: "",
        clousure_type: "Corredera",
        u_marco: 0,
        fm: 0,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  const handleCreateDoorElement = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
      return;
    }
    const body = {
      name_element: doorData.name_element,
      type: "door",
      atributs: {
        ventana_id: doorData.ventana_id,
        name_ventana: doorData.name_ventana,
        u_puerta_opaca: doorData.u_puerta_opaca,
        porcentaje_vidrio: doorData.porcentaje_vidrio,
      },
      u_marco: doorData.u_marco,
      fm: doorData.fm,
    };
    try {
      const response = await axios.post(`${constantUrlApiEndpoint}/elements/create`, body, {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setElementsList((prev) => [...prev, response.data.element]);
      Swal.fire("Puerta creada", `La puerta "${doorData.name_element}" ha sido creada.`, "success");
      setShowCreateDoorModal(false);
      setDoorData({
        name_element: "",
        ventana_id: 0,
        name_ventana: "",
        u_puerta_opaca: 0,
        porcentaje_vidrio: 0,
        u_marco: 0,
        fm: 0,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.detail || error.message, "error");
      }
    }
  };

  // Efectos para cargar materiales y detalles según el step
  useEffect(() => {
    if (step === 3) {
      void fetchMaterialsList();
    }
  }, [step]);

  useEffect(() => {
    if (step === 4) {
      void fetchMaterialsList();
      setDetails([]);
      setShowTabsInStep4(false);
      void fetchFetchedDetails();
    }
  }, [step]);

  // =================================================
  // Renderizado principal
  // =================================================

  const renderMainHeader = () =>
    step <= 2 ? (
      <div className="mb-3">
        <h1 className="fw-bold">Proyecto nuevo</h1>
      </div>
    ) : (
      <div className="mb-3">
        <h2 className="fw-bold">Detalles del proyecto</h2>
        <div className="d-flex align-items-center gap-4 mt-4">
          <span style={{ fontWeight: "normal" }}>Proyecto:</span>
          <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
            {`Edificación Nº ${createdProjectId ?? "xxxxx"}`}
          </CustomButton>
          <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
            {formData.department || "Departamento"}
          </CustomButton>
        </div>
      </div>
    );

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

  const renderStep4Tabs = () => {
    if (!showTabsInStep4) return null;
    return (
      <div className="mt-4">
        <ul className="nav" style={{ display: "flex", padding: 0, listStyle: "none" }}>
          {[
            { key: "detalles", label: "Detalles" },
            { key: "muros", label: "Muros" },
            { key: "techumbre", label: "Techumbre" },
            { key: "pisos", label: "Pisos" },
          ].map((item) => (
            <li key={item.key} style={{ flex: 1 }}>
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#fff",
                  color: tabStep4 === item.key ? "var(--primary-color)" : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: tabStep4 === item.key ? "3px solid var(--primary-color)" : "none",
                }}
                onClick={() => setTabStep4(item.key as typeof tabStep4)}
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Ubicación detalle</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre detalle</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Capas de interior a exterior</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Espesor capa (cm)</th>
                </tr>
              </thead>
              <tbody>
                {detailsTabList.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.scantilon_location}</td>
                    <td>{item.name_detail}</td>
                    {/* Se utiliza getMaterialNameById, utilizando 0 si id_material es undefined */}
                    <td>{getMaterialNameById(item.material_id ?? 0)}</td>
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Abreviado</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Valor U [W/m2K]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Color Exterior</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Color Interior</th>
                </tr>
              </thead>
              <tbody>
                {murosTabList.map((item, idx) => {
                  const exteriorColor = item.info?.surface_color?.exterior?.name || "Desconocido";
                  const interiorColor = item.info?.surface_color?.interior?.name || "Desconocido";
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Abreviado</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Valor U [W/m2K]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Color Exterior</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Color Interior</th>
                </tr>
              </thead>
              <tbody>
                {techumbreTabList.map((item, idx) => {
                  const exteriorColor = item.info?.surface_color?.exterior?.name || "Desconocido";
                  const interiorColor = item.info?.surface_color?.interior?.name || "Desconocido";
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }} rowSpan={2}>
                    Nombre Abreviado
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }} rowSpan={2}>
                    Valor U [W/m²K]
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }} colSpan={2}>
                    Aislamiento bajo piso
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }} colSpan={3}>
                    Ref Aisl Vert.
                  </th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }} colSpan={3}>
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
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>e Aislación [cm]</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>D [cm]</th>
                </tr>
              </thead>
              <tbody>
                {pisosTabList.map((item, idx) => {
                  const bajoPiso = item.info?.ref_aisl_bajo_piso || {};
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

  // =================================================
  // Renderizado final a
  // =================================================

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
        {renderMainHeader()}
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
                  <SidebarItem stepNumber={1} iconClass="bi bi-person-circle" title="Agregar detalles propietario / proyecto y clasificación" />
                  <SidebarItem stepNumber={2} iconClass="bi bi-geo-alt" title="Ubicación del proyecto" />
                  <SidebarItem stepNumber={3} iconClass="bi bi-file-text" title="Lista de materiales" />
                  <SidebarItem stepNumber={4} iconClass="bi bi-tools" title="Detalles constructivos" />
                  <SidebarItem stepNumber={5} iconClass="bi bi-house" title="Elementos operables" />
                  <SidebarItem stepNumber={6} iconClass="bi bi-bar-chart" title="Tipología de recinto" />
                  <SidebarItem stepNumber={7} iconClass="bi bi-check2-square" title="Recinto" />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "20px" }}>
                {step === 1 && (
                  <>
                    {/* Paso 1 */}
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del proyecto</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          onChange={(e) => handleFormInputChange("name_project", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) => handleFormInputChange("owner_name", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Apellido del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_lastname}
                          onChange={(e) => handleFormInputChange("owner_lastname", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => handleFormInputChange("country", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => handleFormInputChange("department", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Provincia</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.province}
                          onChange={(e) => handleFormInputChange("province", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Distrito</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.district}
                          onChange={(e) => handleFormInputChange("district", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de edificación</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) => handleFormInputChange("building_type", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de uso principal</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) => handleFormInputChange("main_use_type", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de niveles</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) => handleFormInputChange("number_levels", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de viviendas / oficinas x nivel</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          onChange={(e) => handleFormInputChange("number_homes_per_level", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Superficie construida (m²)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.built_surface}
                          onChange={(e) => handleFormInputChange("built_surface", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="text-end">
                      <CustomButton variant="save" onClick={() => setStep(2)}>
                        Siguiente
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 2 */}
                {step === 2 && (
                  <>
                    <h5 className="fw-bold mb-3">Ubicación del proyecto</h5>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar ubicación"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-8 mb-3">
                        <NoSSRInteractiveMap
                          onLocationSelect={(latlng) => {
                            handleFormInputChange("latitude", latlng.lat);
                            handleFormInputChange("longitude", latlng.lng);
                          }}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label">Coordenadas seleccionadas</label>
                        <textarea
                          className="form-control mb-2"
                          rows={5}
                          value={`Latitud: ${formData.latitude}, Longitud: ${formData.longitude}`}
                          readOnly
                        />
                        <CustomButton
                          variant="save"
                          style={{ width: "100%" }}
                          onClick={() => {
                            Swal.fire("Ubicación asignada", `Lat: ${formData.latitude}, Lon: ${formData.longitude}`, "success");
                          }}
                        >
                          Confirmar Ubicación
                        </CustomButton>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(1)} />
                      <CustomButton variant="save" onClick={handleCreateProject}>
                        Guardar proyecto
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 3: Materiales */}
                {step === 3 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddMaterialModal(true)}>
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <h6 className="mb-3">Materiales Agregados</h6>
                    {selectedMaterials.length > 0 ? (
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Material</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Conductividad (W/m2K)</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Calor específico (J/kgK)</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Densidad (kg/m3)</th>
                            <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaterials.map((mat, idx) => {
                            const { name, conductivity, specific_heat, density } = mat.atributs;
                            return (
                              <tr key={idx}>
                                <td>{name}</td>
                                <td>{conductivity}</td>
                                <td>{specific_heat}</td>
                                <td>{density}</td>
                                <td>
                                  <CustomButton
                                    variant="deleteIcon"
                                    onClick={() => setSelectedMaterials((prev) => prev.filter((m) => m.id !== mat.id))}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p>No se ha agregado ningún material.</p>
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(2)} />
                      <CustomButton variant="save" onClick={handleSaveMaterials}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 4: Detalles */}
                {step === 4 && (
                  <>
                    {!showTabsInStep4 && (
                      <>
                        <div className="mb-3" style={{ display: "flex", justifyContent: "flex-end" }}>
                          <CustomButton variant="save" onClick={() => setShowSelectDetailModal(true)}>
                            <i className="bi bi-plus"></i> Seleccionar Detalle
                          </CustomButton>
                        </div>
                        <div className="mb-3">
                          {details.length > 0 ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Ubicación Detalle</th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Detalle</th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Capas de interior a exterior</th>
                                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Espesor capa (cm)</th>
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
                                        onClick={() => setDetails((prev) => prev.filter((d) => d.id_detail !== det.id_detail))}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>No se han seleccionado detalles.</p>
                          )}
                        </div>
                      </>
                    )}
                    <div className="mt-4 d-flex justify-content-end gap-2">
                      <CustomButton variant="backIcon" onClick={() => setStep(3)} />
                      <CustomButton variant="save" onClick={handleSaveDetails}>
                        Grabar datos
                      </CustomButton>
                      <CustomButton variant="save" onClick={() => setStep(5)}>
                        Continuar
                      </CustomButton>
                    </div>
                    {renderStep4Tabs()}
                  </>
                )}

                {/* Paso 5: Elementos operables */}
                {step === 5 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddElementModal(true)}>
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
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
                              borderBottom:
                                tabElementosOperables === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => {
                              setTabElementosOperables(tab.toLowerCase());
                              setModalElementType(tab.toLowerCase());
                            }}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <h6 className="mb-3">Elementos Agregados</h6>
                    {selectedElements.length > 0 ? (
                      <table className="table table-bordered table-striped">
                        <thead>
                          {tabElementosOperables === "ventanas" ? (
                            <tr>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Vidrio [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FS Vidrio []</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Tipo Cierre</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Tipo Marco</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                            </tr>
                          ) : (
                            <tr>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Puerta opaca [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Ventana</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>% Vidrio</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {selectedElements
                            .filter((el) => el.type === (tabElementosOperables === "ventanas" ? "window" : "door"))
                            .map((el, idx) =>
                              tabElementosOperables === "ventanas" ? (
                                <tr key={idx}>
                                  <td>{el.name_element}</td>
                                  <td>{(el.atributs as WindowAttributes).u_vidrio}</td>
                                  <td>{(el.atributs as WindowAttributes).fs_vidrio}</td>
                                  <td>{(el.atributs as WindowAttributes).clousure_type}</td>
                                  <td>{(el.atributs as WindowAttributes).frame_type}</td>
                                  <td>{el.u_marco}</td>
                                  <td>{(el.fm * 100).toFixed(0)}%</td>
                                  <td>
                                    <CustomButton
                                      variant="deleteIcon"
                                      onClick={() => setSelectedElements((prev) => prev.filter((item) => item.id !== el.id))}
                                    />
                                  </td>
                                </tr>
                              ) : (
                                <tr key={idx}>
                                  <td>{el.name_element}</td>
                                  <td>{(el.atributs as DoorAttributes).u_puerta_opaca}</td>
                                  <td>{(el.atributs as DoorAttributes).name_ventana}</td>
                                  <td>
                                    {(el.atributs as DoorAttributes).porcentaje_vidrio !== undefined
                                      ? ((el.atributs as DoorAttributes).porcentaje_vidrio * 100).toFixed(0) + "%"
                                      : "0%"}
                                  </td>
                                  <td>{el.u_marco}</td>
                                  <td>{(el.fm * 100).toFixed(0)}%</td>
                                  <td>
                                    <CustomButton
                                      variant="deleteIcon"
                                      onClick={() => setSelectedElements((prev) => prev.filter((item) => item.id !== el.id))}
                                    />
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    ) : (
                      <p>No se ha agregado ningún elemento.</p>
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(4)} />
                      <CustomButton variant="save" onClick={handleSaveElements}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 6: Tipología de recinto */}
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
                              color: tabTipologiaRecinto === tab.key ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabTipologiaRecinto === tab.key ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => setTabTipologiaRecinto(tab.key)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content border border-top-0 p-3">
                      {/* Contenido de cada pestaña de Tipología */}
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(5)} />
                      <CustomButton variant="save" onClick={handleCreateProject}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* Paso 7: Recinto */}
                {step === 7 && (
                  <>
                    <h5 className="fw-bold mb-3">Recinto</h5>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div></div>
                      <CustomButton variant="save">
                        <i className="bi bi-plus"></i> Nuevo
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
                          <th>Altura Promedio Recinto</th>
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
                      <CustomButton variant="backIcon" onClick={() => setStep(6)} />
                      <CustomButton variant="save" onClick={handleCreateProject}>
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

      {/* Modal para materiales (Paso 3) */}
      {showAddMaterialModal && (
        <div className="modal-overlay" onClick={() => setShowAddMaterialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddMaterialModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Lista de Materiales</h4>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Material</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Conductividad (W/m2K)</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Calor específico (J/kgK)</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Densidad (kg/m3)</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {materialsList.map((mat, idx) => {
                  const { name, conductivity, specific_heat, density } = mat.atributs;
                  return (
                    <tr key={idx}>
                      <td>{name}</td>
                      <td>{conductivity}</td>
                      <td>{specific_heat}</td>
                      <td>{density}</td>
                      <td>
                        <CustomButton variant="addIcon" onClick={() => setSelectedMaterials((prev) => [...prev, mat])} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para seleccionar detalle (Paso 4) */}
      {showSelectDetailModal && (
        <div className="modal-overlay" onClick={() => setShowSelectDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Seleccionar Detalle Constructivo</h4>
              <CustomButton variant="save" onClick={() => setShowCreateDetailModal(true)}>
                Agregar
              </CustomButton>
            </div>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Ubicación Detalle</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Detalle</th>
                  <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Capas de interior a exterior</th>
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
            <div className="text-end">
              <CustomButton variant="backIcon" onClick={() => setShowSelectDetailModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo detalle (Paso 4) */}
      {showCreateDetailModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3">Crear Nuevo Detalle</h4>
            <div className="mb-3">
              <label className="form-label">Ubicación Detalle</label>
              <select
                className="form-control"
                value={newDetailForm.scantilon_location}
                onChange={(e) => handleNewDetailFormChange("scantilon_location", e.target.value)}
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
                onChange={(e) => handleNewDetailFormChange("name_detail", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Material</label>
              <select
                className="form-control"
                value={newDetailForm.material_id}
                onChange={(e) => handleNewDetailFormChange("material_id", parseInt(e.target.value))}
              >
                <option value={0}>Seleccione un material</option>
                {materialsList.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.atributs.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Espesor capa (cm)</label>
              <input
                type="number"
                className="form-control"
                value={newDetailForm.layer_thickness}
                onChange={(e) => handleNewDetailFormChange("layer_thickness", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="backIcon" onClick={() => setShowCreateDetailModal(false)} />
              <CustomButton variant="save" onClick={handleCreateNewDetail}>
                <i className="bi bi-plus"></i> Crear Detalle
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal para elementos operables (Paso 5) */}
      {showAddElementModal && (
        <div className="modal-overlay" onClick={() => setShowAddElementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddElementModal(false)}>
              &times;
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 className="mb-3">
                Lista de {modalElementType === "ventanas" ? "Ventanas" : "Puertas"}
              </h4>
              <div>
                {modalElementType === "ventanas" && (
                  <CustomButton variant="save" onClick={() => setShowCreateWindowModal(true)}>
                    Crear Ventana
                  </CustomButton>
                )}
                {modalElementType === "puertas" && (
                  <CustomButton variant="save" onClick={() => setShowCreateDoorModal(true)}>
                    Crear Puerta
                  </CustomButton>
                )}
              </div>
            </div>
            <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
              {["Ventanas", "Puertas"].map((tab) => (
                <li key={tab} style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#fff",
                      color: modalElementType === tab.toLowerCase() ? "var(--primary-color)" : "var(--secondary-color)",
                      border: "none",
                      cursor: "pointer",
                      borderBottom: modalElementType === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                    }}
                    onClick={() => setModalElementType(tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
            <table className="table table-bordered table-striped">
              <thead>
                {modalElementType === "ventanas" ? (
                  <tr>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Elemento</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Vidrio [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FS Vidrio []</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Tipo Cierre</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Tipo Marco</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Marco [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FM [%]</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                  </tr>
                ) : (
                  <tr>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Elemento</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Puerta opaca [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Nombre Ventana</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>% Vidrio</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>U Marco [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>FM [%]</th>
                    <th style={{ color: "var(--primary-color)", textAlign: "center" }}>Acción</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {elementsList
                  .filter((el) => el.type === (modalElementType === "ventanas" ? "window" : "door"))
                  .map((el, idx) => (
                    <tr key={idx}>
                      {modalElementType === "ventanas" ? (
                        <>
                          <td>{el.name_element}</td>
                          <td>{(el.atributs as WindowAttributes).u_vidrio}</td>
                          <td>{(el.atributs as WindowAttributes).fs_vidrio}</td>
                          <td>{(el.atributs as WindowAttributes).clousure_type}</td>
                          <td>{(el.atributs as WindowAttributes).frame_type}</td>
                          <td>{el.u_marco}</td>
                          <td>{(el.fm * 100).toFixed(0)}%</td>
                          <td>
                            <CustomButton variant="addIcon" onClick={() => handleAddElement(el)} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{el.name_element}</td>
                          <td>{(el.atributs as DoorAttributes).u_puerta_opaca}</td>
                          <td>{(el.atributs as DoorAttributes).name_ventana}</td>
                          <td>
                            {(el.atributs as DoorAttributes).porcentaje_vidrio !== undefined
                              ? ((el.atributs as DoorAttributes).porcentaje_vidrio * 100).toFixed(0) + "%"
                              : "0%"}
                          </td>
                          <td>{el.u_marco}</td>
                          <td>{(el.fm * 100).toFixed(0)}%</td>
                          <td>
                            <CustomButton variant="addIcon" onClick={() => handleAddElement(el)} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submodal para crear ventana */}
      {showCreateWindowModal && (
        <div className="modal-overlay" onClick={() => setShowCreateWindowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateWindowModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Crear Ventana</h4>
            <div className="form-group mb-3">
              <label>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={windowData.name_element}
                onChange={(e) => setWindowData((prev) => ({ ...prev, name_element: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>U Vidrio [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={windowData.u_vidrio}
                onChange={(e) => setWindowData((prev) => ({ ...prev, u_vidrio: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>FS Vidrio []</label>
              <input
                type="number"
                className="form-control"
                value={windowData.fs_vidrio}
                onChange={(e) => setWindowData((prev) => ({ ...prev, fs_vidrio: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>Tipo Cierre</label>
              <select
                className="form-control"
                value={windowData.clousure_type}
                onChange={(e) => setWindowData((prev) => ({ ...prev, clousure_type: e.target.value }))}
              >
                <option value="Corredera">Corredera</option>
                <option value="Abatir">Abatir</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Tipo Marco</label>
              <input
                type="text"
                className="form-control"
                value={windowData.frame_type}
                onChange={(e) => setWindowData((prev) => ({ ...prev, frame_type: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>U Marco [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={windowData.u_marco}
                onChange={(e) => setWindowData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>FM [%]</label>
              <input
                type="number"
                className="form-control"
                value={windowData.fm}
                onChange={(e) => setWindowData((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))}
              />
            </div>
            <CustomButton variant="save" onClick={handleCreateWindowElement}>
              Crear Ventana
            </CustomButton>
          </div>
        </div>
      )}

      {/* Submodal para crear puerta */}
      {showCreateDoorModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDoorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateDoorModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Crear Puerta</h4>
            <div className="form-group mb-3">
              <label>Nombre Elemento</label>
              <input
                type="text"
                className="form-control"
                value={doorData.name_element}
                onChange={(e) => setDoorData((prev) => ({ ...prev, name_element: e.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>U Puerta opaca [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={doorData.u_puerta_opaca}
                onChange={(e) => setDoorData((prev) => ({ ...prev, u_puerta_opaca: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>Nombre Ventana</label>
              <select
                className="form-control"
                value={doorData.ventana_id || ""}
                onChange={(e) => {
                  const winId = parseInt(e.target.value);
                  setDoorData((prev) => ({
                    ...prev,
                    ventana_id: winId,
                    name_ventana: allWindowsForDoor.find((win) => win.id === winId)?.name_element || "",
                  }));
                }}
              >
                <option value="">Seleccione una ventana</option>
                {allWindowsForDoor.map((win) => (
                  <option key={win.id} value={win.id}>
                    {win.name_element}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-3">
              <label>% Vidrio</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={doorData.porcentaje_vidrio}
                onChange={(e) => setDoorData((prev) => ({ ...prev, porcentaje_vidrio: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>U Marco [W/m2K]</label>
              <input
                type="number"
                className="form-control"
                value={doorData.u_marco}
                onChange={(e) => setDoorData((prev) => ({ ...prev, u_marco: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>FM [%]</label>
              <input
                type="number"
                className="form-control"
                value={doorData.fm}
                onChange={(e) => setDoorData((prev) => ({ ...prev, fm: parseFloat(e.target.value) }))}
              />
            </div>
            <CustomButton variant="save" onClick={handleCreateDoorElement}>
              Crear Puerta
            </CustomButton>
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

export default ProjectCompleteWorkflowPage;
