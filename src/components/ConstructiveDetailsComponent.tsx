import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import CustomButton from "./common/CustomButton";
import ActionButtonsConfirm from "./common/ActionButtonsConfirm";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "../utils/constant-url-endpoint";
import TablesParameters from "@/components/tables/TablesParameters";
import SearchParameters from "./inputs/SearchParameters";
import ModalCreate from "./common/ModalCreate";

interface Detail {
  id_detail: number;
  scantilon_location: string;
  name_detail: string;
  material_id: number;
  material: string;
  layer_thickness: number;
  created_status?: string;
}

export interface TabItem {
  id_detail?: number;
  id?: number;
  name_detail: string;
  value_u?: number;
  created_status?: string;
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

type TabStep4 = "detalles" | "muros" | "techumbre" | "pisos";

const getCssVarValue = (varName: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
};

const ConstructiveDetailsComponent: React.FC = () => {
  const router = useRouter();

  // Estados generales
  const [hasLoaded, setHasLoaded] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para la vista de "Detalles Generales"
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showTabsInStep4, setShowTabsInStep4] = useState(true);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  // Estados para cada pestaña (Muros, Techumbre, Pisos)
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);

  // Materiales
  const [materials, setMaterials] = useState<Material[]>([]);

  // Estado para crear nuevo detalle
  const [showNewDetailRow, setShowNewDetailRow] = useState(false);
  const [isCreatingDetail, setIsCreatingDetail] = useState(false);
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

  // Estados para eliminar y editar detalle (vista general)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDetail, setDeletingDetail] = useState<Detail | null>(null);
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);

  // Estados para eliminación inline en tablas (Muros, Techumbre, Pisos)
  const [showInlineDeleteModal, setShowInlineDeleteModal] = useState(false);
  const [deletingInlineDetail, setDeletingInlineDetail] = useState<TabItem | null>(null);

  // Estado para mostrar modal "Detalles Generales"
  const [showGeneralDetailsModal, setShowGeneralDetailsModal] = useState(false);

  // Estados para edición inline
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  // Efecto para cargar color primario y marcar carga inicial
  useEffect(() => {
    setPrimaryColor(getCssVarValue("--primary-color", "#3ca7b7"));
    setHasLoaded(true);
  }, []);

  const getToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

  const fetchData = useCallback(
    async <T,>(endpoint: string, setter: (data: T) => void) => {
      const token = getToken();
      if (!token) return;
      try {
        const { data } = await axios.get<T>(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setter(data);
      } catch (error: unknown) {
        console.error(`Error al obtener datos desde ${endpoint}:`, error);
      }
    },
    []
  );

  const fetchFetchedDetails = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/admin/details/`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFetchedDetails(data || []);
    } catch (error: unknown) {
      console.error("Error al obtener detalles:", error);
      notify("Error", "Error al obtener detalles. Ver consola.");
    }
  }, []);

  // Aquí se actualizan las tablas de acuerdo al tipo de detalle
  const fetchMurosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/details/all/Muro/`,
      (data) => {
        setMurosTabList(data);
      }
    );
  }, [fetchData]);

  const fetchTechumbreDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/details/all/Techo/`,
      (data) => {
        setTechumbreTabList(data);
      }
    );
  }, [fetchData]);

  const fetchPisosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/details/all/Piso/`,
      (data) => {
        setPisosTabList(data);
      }
    );
  }, [fetchData]);

  const fetchMaterials = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/admin/constants/?page=1&per_page=700`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allConstants: Constant[] = data.constants || [];
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
      notify("Error", "Error al obtener Materiales.");
    }
  };

  // Efectos de carga inicial
  useEffect(() => {
    if (hasLoaded) fetchFetchedDetails();
  }, [hasLoaded, fetchFetchedDetails]);

  useEffect(() => {
    if (showTabsInStep4) setTabStep4("muros");
  }, [showTabsInStep4]);

  useEffect(() => {
    if (showTabsInStep4 && hasLoaded) {
      if (tabStep4 === "muros") fetchMurosDetails();
      else if (tabStep4 === "techumbre") fetchTechumbreDetails();
      else if (tabStep4 === "pisos") fetchPisosDetails();
    }
  }, [
    showTabsInStep4,
    tabStep4,
    fetchMurosDetails,
    fetchTechumbreDetails,
    fetchPisosDetails,
    hasLoaded,
  ]);

  // Actualiza el id del material en caso de edición si es necesario
  useEffect(() => {
    if (
      editingDetail &&
      editingDetail.material &&
      (!editingDetail.material_id || editingDetail.material_id === 0) &&
      materials.length > 0
    ) {
      const foundMaterial = materials.find(
        (mat) =>
          mat.name.toLowerCase() === editingDetail.material.toLowerCase()
      );
      if (foundMaterial) {
        setEditingDetail({ ...editingDetail, material_id: foundMaterial.id });
      }
    }
  }, [editingDetail, materials]);

  // Función para crear nuevo detalle
  const handleCreateNewDetail = async () => {
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
    setIsCreatingDetail(true);
    try {
      const createUrl = `${constantUrlApiEndpoint}/admin/details/create`;
      const response = await axios.post(createUrl, newDetailForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Respuesta de creación:", response);
      notify("Detalle creado exitosamente.");
      // Refrescar la lista general y la tabla específica según el tipo de detalle
      await fetchFetchedDetails();
      const tipo = newDetailForm.scantilon_location.toLowerCase();
      if (tipo === "muro") {
        fetchMurosDetails();
      } else if (tipo === "techo") {
        fetchTechumbreDetails();
      } else if (tipo === "piso") {
        fetchPisosDetails();
      }
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
    } finally {
      setIsCreatingDetail(false);
    }
  };

  // Botón "Nuevo" (abre modal para crear detalle)
  const handleNewButtonClick = () => {
    setShowNewDetailRow(true);
    fetchMaterials();
  };

  // Botón "Volver" en la vista inicial
  const saveDetails = () => {
    setShowTabsInStep4(true);
    setTabStep4("muros");
  };

  // ELIMINACIÓN DE DETALLE (Vista General)
  const confirmDeleteDetail = async () => {
    if (!deletingDetail) return;
    const token = getToken();
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/admin/details/${deletingDetail.id_detail}/delete`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      });
      console.log("Detalle eliminado");
      notify("Detalle correctamente eliminado");
      await fetchFetchedDetails();
      const tipo = deletingDetail.scantilon_location.toLowerCase();
      if (tipo === "muro") {
        fetchMurosDetails();
      } else if (tipo === "techo") {
        fetchTechumbreDetails();
      } else if (tipo === "piso") {
        fetchPisosDetails();
      }
    } catch (error: unknown) {
      console.error("Error al eliminar detalle:", error);
      notify("Error", "No se pudo eliminar el detalle.");
    } finally {
      setShowDeleteModal(false);
      setDeletingDetail(null);
      setShowGeneralDetailsModal(true);
    }
  };

  // Función para abrir el modal de eliminación inline en tablas
  const handleInlineDeleteModal = (item: TabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingInlineDetail(item);
    setShowInlineDeleteModal(true);
  };

  // Función para confirmar la eliminación inline en tablas
  const confirmInlineDeleteDetail = async () => {
    if (!deletingInlineDetail) return;
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/admin/${deletingInlineDetail.id}/details/delete`;
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });
      notify("Detalle eliminado correctamente.");
      // Se actualiza también la tabla general de detalles
      await fetchFetchedDetails();
      if (tabStep4 === "muros") fetchMurosDetails();
      else if (tabStep4 === "techumbre") fetchTechumbreDetails();
      else if (tabStep4 === "pisos") fetchPisosDetails();
    } catch (error: any) {
      console.error("Error al eliminar detalle inline:", error);
      notify("Error al eliminar el detalle.");
    } finally {
      setShowInlineDeleteModal(false);
      setDeletingInlineDetail(null);
    }
  };

  // EDICIÓN DE DETALLE GENERAL (Modal)
  const handleEditDetail = (detail: Detail, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGeneralDetailsModal(false);
    fetchMaterials();
    setEditingDetail(detail);
  };

  const handleConfirmEditDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingDetail) return;
    if (!editingDetail.scantilon_location.trim() || !editingDetail.name_detail.trim()) {
      notify("Los campos 'Ubicación Detalle' y 'Nombre Detalle' no pueden estar vacíos.");
      return;
    }
    if (!editingDetail.material_id || editingDetail.material_id <= 0) {
      notify("Por favor, seleccione un material válido.");
      return;
    }
    if (editingDetail.layer_thickness === null || editingDetail.layer_thickness <= 0) {
      notify("El 'Espesor de la capa' debe ser un valor mayor a 0.");
      return;
    }
    const token = getToken();
    if (!token) return;
    (async () => {
      try {
        const url = `${constantUrlApiEndpoint}/admin/details/${editingDetail.id_detail}/update`;
        const payload = {
          scantilon_location: editingDetail.scantilon_location,
          name_detail: editingDetail.name_detail,
          material_id: editingDetail.material_id,
          layer_thickness: editingDetail.layer_thickness,
        };
        await axios.put(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        notify("Detalle actualizado con éxito.");
        await fetchFetchedDetails();
        const tipo = editingDetail.scantilon_location.toLowerCase();
        if (tipo === "muro") {
          fetchMurosDetails();
        } else if (tipo === "techo") {
          fetchTechumbreDetails();
        } else if (tipo === "piso") {
          fetchPisosDetails();
        }
        setEditingDetail(null);
        setShowGeneralDetailsModal(true);
      } catch (error: unknown) {
        console.error("Error al actualizar el detalle:", error);
        notify("Error al actualizar el detalle.");
      }
    })();
  };

  // Funciones de edición inline
  const handleInlineEdit = (item: TabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRowId(item.id_detail ?? item.id ?? null);
    setEditValues({
      name_detail: item.name_detail,
      exterior: item.info?.surface_color?.exterior?.name || "",
      interior: item.info?.surface_color?.interior?.name || "",
      vertLambda: item.info?.ref_aisl_vertical?.lambda || "",
      vertEAisl: item.info?.ref_aisl_vertical?.e_aisl || "",
      vertD: item.info?.ref_aisl_vertical?.d || "",
      horizLambda: item.info?.ref_aisl_horizontal?.lambda || "",
      horizEAisl: item.info?.ref_aisl_horizontal?.e_aisl || "",
      horizD: item.info?.ref_aisl_horizontal?.d || "",
    });
  };

  const handleInlineCancel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRowId(null);
    setEditValues({});
  };

  const handleInlineSave = async (
    item: TabItem,
    detailType: "Muro" | "Techo" | "Piso",
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    const token = getToken();
    if (!token) return;
    try {
      let url = `${constantUrlApiEndpoint}/${item.id_detail}/details/update`;
      let payload;
      if (detailType === "Piso") {
        payload = {
          info: {
            ref_aisl_vertical: {
              d: editValues.vertD || item.info?.ref_aisl_vertical?.d,
              e_aisl: editValues.vertEAisl || item.info?.ref_aisl_vertical?.e_aisl,
              lambda: editValues.vertLambda || item.info?.ref_aisl_vertical?.lambda,
            },
            ref_aisl_horizontal: {
              d: editValues.horizD || item.info?.ref_aisl_horizontal?.d,
              e_aisl: editValues.horizEAisl || item.info?.ref_aisl_horizontal?.e_aisl,
              lambda: editValues.horizLambda || item.info?.ref_aisl_horizontal?.lambda,
            },
          },
        };
        url = `${constantUrlApiEndpoint}/${item.id}/details/update/Piso`;
      } else {
        payload = {
          info: {
            surface_color: {
              interior: { name: editValues.interior },
              exterior: { name: editValues.exterior },
            },
          },
        };
        url = `${constantUrlApiEndpoint}/${item.id}/details/update/${detailType}`;
      }
      await axios.put(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      notify("Detalle actualizado con éxito.");
      if (detailType === "Muro") fetchMurosDetails();
      else if (detailType === "Techo") fetchTechumbreDetails();
      else if (detailType === "Piso") fetchPisosDetails();
      handleInlineCancel();
    } catch (error: any) {
      console.error("Error al actualizar detalle inline:", error);
      notify("Error al actualizar el detalle.");
    }
  };

  // Renderizado "Detalles Generales" (Vista Inicial)
  const renderInitialDetails = (inModal: boolean = false) => {
    const columnsDetails = [
      { headerName: "Ubicación Detalle", field: "scantilon_location" },
      { headerName: "Nombre Detalle", field: "name_detail" },
      { headerName: "Material", field: "material" },
      { headerName: "Espesor capa (cm)", field: "layer_thickness" },
      { headerName: "Acciones", field: "acciones" },
    ];

    let filteredData = fetchedDetails.filter((det) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        det.scantilon_location.toLowerCase().includes(searchLower) ||
        det.name_detail.toLowerCase().includes(searchLower) ||
        det.material.toLowerCase().includes(searchLower) ||
        det.layer_thickness.toString().includes(searchLower)
      );
    });

    if (inModal) {
      if (tabStep4 === "muros") {
        filteredData = filteredData.filter(
          (det) => det.scantilon_location.toLowerCase() === "muro"
        );
      } else if (tabStep4 === "techumbre") {
        filteredData = filteredData.filter(
          (det) => det.scantilon_location.toLowerCase() === "techo"
        );
      } else if (tabStep4 === "pisos") {
        filteredData = filteredData.filter(
          (det) => det.scantilon_location.toLowerCase() === "piso"
        );
      }
    }

    const data = filteredData.map((det) => ({
      scantilon_location: (
        <span style={{ color: det.created_status !== "default" ? primaryColor : "black" }}>
          {det.scantilon_location}
        </span>
      ),
      name_detail: (
        <span style={{ color: det.created_status !== "default" ? primaryColor : "black" }}>
          {det.name_detail}
        </span>
      ),
      material: (
        <span style={{ color: det.created_status !== "default" ? primaryColor : "black" }}>
          {det.material}
        </span>
      ),
      layer_thickness: (
        <span style={{ color: det.created_status !== "default" ? primaryColor : "black" }}>
          {det.layer_thickness}
        </span>
      ),
      acciones: (
        <>
          <CustomButton variant="editIcon" onClick={(e) => handleEditDetail(det, e)}>
            Editar
          </CustomButton>
          <CustomButton
            variant="deleteIcon"
            onClick={(e) => {
              e.stopPropagation();
              setShowGeneralDetailsModal(false);
              setDeletingDetail(det);
              setShowDeleteModal(true);
            }}
          >
            Eliminar
          </CustomButton>
        </>
      ),
    }));

    return (
      <>
        {!inModal && (
          <SearchParameters
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar..."
            onNew={handleNewButtonClick}
            newButtonText="Nuevo"
            style={{ marginBottom: "1rem" }}
          />
        )}
        <div className="custom-table-container">
          <TablesParameters columns={columnsDetails} data={data} />
        </div>
        {!inModal && (
          <div>
            <CustomButton
              variant="save"
              onClick={(e) => {
                e.stopPropagation();
                if (inModal) setShowGeneralDetailsModal(false);
                else setShowTabsInStep4(false);
              }}
            >
              <span className="material-icons">arrow_back</span> Volver
            </CustomButton>
          </div>
        )}
      </>
    );
  };

  // Renderizado de las pestañas (Muros, Techumbre, Pisos)
  const renderDetailsTabs = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <CustomButton onClick={handleNewButtonClick}>+ Nuevo</CustomButton>
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
        {[
          { key: "muros", label: "Muros" },
          { key: "techumbre", label: "Techumbre" },
          { key: "pisos", label: "Pisos" },
        ].map((item) => (
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
              onClick={() => setTabStep4(item.key as TabStep4)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div>
        {tabStep4 === "muros" && (
          <div onClick={() => setShowGeneralDetailsModal(true)}>
            {renderMurosTable()}
          </div>
        )}
        {tabStep4 === "techumbre" && (
          <div onClick={() => setShowGeneralDetailsModal(true)}>
            {renderTechumbreTable()}
          </div>
        )}
        {tabStep4 === "pisos" && (
          <div onClick={() => setShowGeneralDetailsModal(true)}>
            {renderPisosTable()}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizado de Tablas con edición inline
  // MUROS
  const renderMurosTable = () => {
    const columnsMuros = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
      { headerName: "Acciones", field: "acciones" },
    ];

    const data = murosTabList.map((item) => {
      const isEditing = editingRowId === (item.id_detail ?? item.id);
      return {
        nombreAbreviado: item.name_detail,
        valorU: item.value_u?.toFixed(3) ?? "--",
        colorExterior: isEditing ? (
          <select
            onClick={(e) => e.stopPropagation()}
            value={editValues.exterior || item.info?.surface_color?.exterior?.name || ""}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({
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
            onClick={(e) => e.stopPropagation()}
            value={editValues.interior || item.info?.surface_color?.interior?.name || ""}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({
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
              onAccept={() => handleInlineSave(item, "Muro")}
              onCancel={handleInlineCancel}
            />
          </div>
        ) : (
          <>
            <CustomButton
              className="btn-table"
              variant="editIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineEdit(item, e);
              }}
            >
              Editar
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="deleteIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineDeleteModal(item, e);
              }}
            >
              Eliminar
            </CustomButton>
          </>
        ),
      };
    });

    return (
      <div>
        {murosTabList.length > 0 ? (
          <TablesParameters columns={columnsMuros} data={data} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // TECHUMBRE
  const renderTechumbreTable = () => {
    const columnsTech = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
      { headerName: "Acciones", field: "acciones" },
    ];

    const data = techumbreTabList.map((item) => {
      const isEditing = editingRowId === (item.id_detail ?? item.id);
      return {
        nombreAbreviado: item.name_detail,
        valorU: item.value_u ? item.value_u.toFixed(3) : "--",
        colorExterior: isEditing ? (
          <select
            onClick={(e) => e.stopPropagation()}
            value={editValues.exterior || item.info?.surface_color?.exterior?.name || ""}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({
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
            onClick={(e) => e.stopPropagation()}
            value={editValues.interior || item.info?.surface_color?.interior?.name || ""}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({
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
              onClick={(e) => {
                e.stopPropagation();
                handleInlineSave(item, "Techo", e);
              }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineCancel(e);
              }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <>
            <CustomButton
              variant="editIcon"
              className="btn-table"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineEdit(item, e);
              }}
            >
              Editar
            </CustomButton>
            <CustomButton
              variant="deleteIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineDeleteModal(item, e);
              }}
            >
              Eliminar
            </CustomButton>
          </>
        ),
      };
    });

    return (
      <div>
        {techumbreTabList.length > 0 ? (
          <TablesParameters columns={columnsTech} data={data} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  const formatNumber = (num: number | undefined, decimals = 3) => {
    return num != null && num !== 0 ? num.toFixed(decimals) : "-";
  };

  // PISOS
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

    const data = pisosTabList.map((item) => {
      const isEditing = editingRowId === (item.id_detail ?? item.id);
      const bajoPiso = item.info?.aislacion_bajo_piso || {};
      const vert = item.info?.ref_aisl_vertical || {};
      const horiz = item.info?.ref_aisl_horizontal || {};
      return {
        nombre: item.name_detail,
        uValue:
          item.value_u && Number(item.value_u) !== 0
            ? Number(item.value_u).toFixed(3)
            : "-",
        bajoPisoLambda:
          item.info?.aislacion_bajo_piso?.lambda &&
          Number(item.info.aislacion_bajo_piso.lambda) !== 0
            ? Number(item.info.aislacion_bajo_piso.lambda).toFixed(3)
            : "-",
        bajoPisoEAisl:
          item.info?.aislacion_bajo_piso?.e_aisl &&
          Number(item.info.aislacion_bajo_piso.e_aisl) !== 0
            ? item.info.aislacion_bajo_piso.e_aisl
            : "-",
        vertLambda: isEditing ? (
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            value={editValues.vertLambda || vert.lambda || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({ ...prev, vertLambda: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : vert.lambda && Number(vert.lambda) !== 0 ? (
          Number(vert.lambda).toFixed(3)
        ) : (
          "-"
        ),
        vertEAisl: isEditing ? (
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            value={editValues.vertEAisl || vert.e_aisl || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({ ...prev, vertEAisl: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : vert.e_aisl ? (
          vert.e_aisl
        ) : (
          "-"
        ),
        vertD: isEditing ? (
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            value={editValues.vertD || vert.d || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({ ...prev, vertD: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : vert.d ? (
          vert.d
        ) : (
          "-"
        ),
        horizLambda: isEditing ? (
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            value={editValues.horizLambda || horiz.lambda || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({ ...prev, horizLambda: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : horiz.lambda && Number(horiz.lambda) !== 0 ? (
          Number(horiz.lambda).toFixed(3)
        ) : (
          "-"
        ),
        horizEAisl: isEditing ? (
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            value={editValues.horizEAisl || horiz.e_aisl || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({ ...prev, horizEAisl: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : horiz.e_aisl ? (
          horiz.e_aisl
        ) : (
          "-"
        ),
        horizD: isEditing ? (
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            value={editValues.horizD || horiz.d || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditValues((prev: Record<string, any>) => ({ ...prev, horizD: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : horiz.d ? (
          horiz.d
        ) : (
          "-"
        ),
        acciones: isEditing ? (
          <>
            <CustomButton
              className="btn-table"
              variant="save"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineSave(item, "Piso", e);
              }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              className="btn-table"
              variant="cancelIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineCancel(e);
              }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <>
            <CustomButton
              className="btn-table"
              variant="editIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineEdit(item, e);
              }}
            >
              Editar
            </CustomButton>
            <CustomButton
              variant="deleteIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleInlineDeleteModal(item, e);
              }}
            >
              Eliminar
            </CustomButton>
          </>
        ),
      };
    });

    return (
      <div>
        {pisosTabList.length > 0 ? (
          <TablesParameters
            columns={columnsPisos}
            data={data}
            multiHeader={{
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
            }}
          />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // Render principal del componente
  return (
    <div className="constructive-details-container" style={{ padding: "20px" }}>
      <div style={{ marginTop: "20px" }}>
        {showTabsInStep4 ? renderDetailsTabs() : renderInitialDetails()}
      </div>

      {/* MODAL: Crear Nuevo Detalle */}
      <ModalCreate
        isOpen={showNewDetailRow}
        onClose={() => {
          setShowNewDetailRow(false);
        }}
        onSave={() => {
          handleCreateNewDetail();
        }}
        title="Nuevo Detalle"
        saveLabel="Crear Detalle"
        detail={newDetailForm}
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
                setNewDetailForm({ ...newDetailForm, scantilon_location: e.target.value })
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
                setNewDetailForm({ ...newDetailForm, name_detail: e.target.value })
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="form-group">
            <label>Material</label>
            <select
              className="form-control"
              value={newDetailForm.material_id}
              onChange={(e) =>
                setNewDetailForm({ ...newDetailForm, material_id: Number(e.target.value) })
              }
              onClick={(e) => e.stopPropagation()}
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
              min="1"
              className="form-control"
              placeholder="Espesor capa (cm)"
              value={newDetailForm.layer_thickness ?? ""}
              onChange={(e) =>
                setNewDetailForm({
                  ...newDetailForm,
                  layer_thickness: Number(e.target.value),
                })
              }
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "-") e.preventDefault();
              }}
            />
          </div>
        </form>
      </ModalCreate>

      {/* MODAL: Confirmar Eliminación (Vista General) */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingDetail(null);
        }}
        onSave={() => {
          confirmDeleteDetail();
        }}
        title="Confirmar Eliminación"
        saveLabel="Eliminar"
        detail={deletingDetail}
      >
        <p>
          ¿Estás seguro que deseas eliminar el detalle{" "}
          <strong>{deletingDetail?.name_detail}</strong>?
        </p>
      </ModalCreate>

      {/* MODAL: Confirmar Eliminación Inline en Tablas */}
      <ModalCreate
        isOpen={showInlineDeleteModal}
        onClose={() => {
          setShowInlineDeleteModal(false);
          setDeletingInlineDetail(null);
        }}
        onSave={() => {
          confirmInlineDeleteDetail();
        }}
        title="Confirmar Eliminación"
        saveLabel="Eliminar"
        detail={deletingInlineDetail}
      >
        <p>
          ¿Estás seguro que deseas eliminar el detalle{" "}
          <strong>{deletingInlineDetail?.name_detail}</strong>?
        </p>
      </ModalCreate>

      {/* MODAL: Editar Detalle (Vista General) */}
      {editingDetail && (
        <ModalCreate
          isOpen={true}
          title="Editar Detalle"
          detail={editingDetail}
          onClose={() => {
            setEditingDetail(null);
          }}
          onSave={() => {
            handleConfirmEditDetail({
              stopPropagation: () => {},
              preventDefault: () => {},
              nativeEvent: new MouseEvent("click"),
              isDefaultPrevented: () => false,
              isPropagationStopped: () => false,
              persist: () => {},
              target: document.createElement("button"),
              currentTarget: document.createElement("button"),
              bubbles: true,
              cancelable: true,
              defaultPrevented: false,
              eventPhase: 0,
              isTrusted: true,
              altKey: false,
              button: 0,
              buttons: 0,
              clientX: 0,
              clientY: 0,
              ctrlKey: false,
              metaKey: false,
              movementX: 0,
              movementY: 0,
              pageX: 0,
              pageY: 0,
              relatedTarget: null,
              screenX: 0,
              screenY: 0,
              shiftKey: false,
              type: "click",
              x: 0,
              y: 0,
            } as unknown as React.MouseEvent<Element, MouseEvent>);
          }}
        >
          <form>
            <div className="form-group">
              <label>Ubicación Detalle</label>
              <input
                type="text"
                className="form-control"
                value={editingDetail.scantilon_location}
                readOnly
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="form-group">
              <label>Material</label>
              <select
                className="form-control"
                value={editingDetail.material_id ? editingDetail.material_id.toString() : ""}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev ? { ...prev, material_id: Number(e.target.value) } : prev
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  fetchMaterials();
                }}
              >
                <option value="">Seleccione Material</option>
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id.toString()}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Espesor de capa (cm)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={editingDetail.layer_thickness}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev ? { ...prev, layer_thickness: Number(e.target.value) } : prev
                  )
                }
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "-") e.preventDefault();
                }}
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {/* MODAL: Detalles Generales (Vista Filtrada) */}
      <ModalCreate
        isOpen={showGeneralDetailsModal}
        onClose={() => {
          setShowGeneralDetailsModal(false);
        }}
        onSave={() => {
          // No necesita acción de guardado
        }}
        title="Detalles Generales"
        detail={null}
        modalStyle={{
          maxWidth: "70%",
          width: "70%",
          padding: "32px",
        }}
        hideFooter={true}
      >
        {renderInitialDetails(true)}
      </ModalCreate>
    </div>
  );
};

export default ConstructiveDetailsComponent;
