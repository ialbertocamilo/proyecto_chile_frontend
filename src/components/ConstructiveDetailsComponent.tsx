import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import CustomButton from "./common/CustomButton";
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

  // ----------------------------
  //  Estados generales
  // ----------------------------
  const [hasLoaded, setHasLoaded] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [searchQuery, setSearchQuery] = useState("");

  // ----------------------------
  //  Estados para detalles
  // ----------------------------
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showTabsInStep4, setShowTabsInStep4] = useState(true);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  // ----------------------------
  //  Estados para cada pestaña
  // ----------------------------
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // ----------------------------
  //  Estados para edición en línea
  // ----------------------------
  // Muros
  const [editingMurosRowId, setEditingMurosRowId] = useState<number | null>(null);
  const [editingMurosColors, setEditingMurosColors] = useState({
    interior: "Intermedio",
    exterior: "Intermedio",
  });

  // Techumbre
  const [editingTechRowId, setEditingTechRowId] = useState<number | null>(null);
  const [editingTechColors, setEditingTechColors] = useState({
    interior: "Intermedio",
    exterior: "Intermedio",
  });

  // Pisos
  const [editingPisoRowId, setEditingPisoRowId] = useState<number | null>(null);
  const [editingPisoForm, setEditingPisoForm] = useState({
    vertical: { lambda: "", e_aisl: "", d: "" },
    horizontal: { lambda: "", e_aisl: "", d: "" },
  });

  // ----------------------------
  //  Estado para crear nuevo detalle
  // ----------------------------
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

  // ----------------------------
  //  Estados para eliminar detalle
  // ----------------------------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDetail, setDeletingDetail] = useState<Detail | null>(null);

  // ----------------------------
  //  Estado para Detalles Generales
  // ----------------------------
  const [showGeneralDetailsModal, setShowGeneralDetailsModal] = useState(false);

  // ========================================================
  //              useEffect y Funciones de carga
  // ========================================================
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

  const fetchMurosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/details/all/Muro/`,
      (data) => {
        if (data && data.length > 0) setMurosTabList(data);
      }
    );
  }, [fetchData]);

  const fetchTechumbreDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/details/all/Techo/`,
      setTechumbreTabList
    );
  }, [fetchData]);

  const fetchPisosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/details/all/Piso/`,
      setPisosTabList
    );
  }, [fetchData]);

  const fetchMaterials = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/constants/?page=1&per_page=700`;
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

  // ----------------------------
  //  Carga inicial de datos
  // ----------------------------
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

  // ========================================================
  //   Función para crear un nuevo detalle
  // ========================================================
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
      await fetchFetchedDetails();
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

  // -------------------------------------------
  //  Función para abrir modal "Nuevo Detalle"
  // -------------------------------------------
  const handleNewButtonClick = () => {
    setShowNewDetailRow(true);
    fetchMaterials();
  };

  // -------------------------------------------
  //  Botón "Volver" en la vista inicial
  // -------------------------------------------
  const saveDetails = () => {
    setShowTabsInStep4(true);
    setTabStep4("muros");
  };

  // ========================================================
  //   EDICIÓN EN LÍNEA - MUROS
  // ========================================================
  const handleEditMurosClick = (item: TabItem) => {
    setEditingMurosRowId(item.id || null);
    setEditingMurosColors({
      interior: item.info?.surface_color?.interior?.name || "Intermedio",
      exterior: item.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleCancelMurosEdit = (item: TabItem) => {
    setEditingMurosRowId(null);
    setEditingMurosColors({
      interior: item.info?.surface_color?.interior?.name || "Intermedio",
      exterior: item.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleConfirmMurosEdit = async (item: TabItem) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/admin/details/${item.id}/update`;
      const payload = {
        info: {
          surface_color: {
            interior: { name: editingMurosColors.interior },
            exterior: { name: editingMurosColors.exterior },
          },
        },
      };
      await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      notify("Detalle tipo Muro actualizado con éxito.");
      setMurosTabList((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                info: {
                  ...it.info,
                  surface_color: {
                    interior: { name: editingMurosColors.interior },
                    exterior: { name: editingMurosColors.exterior },
                  },
                },
              }
            : it
        )
      );
      setEditingMurosRowId(null);
    } catch (error: unknown) {
      console.error("Error al actualizar detalle de muro:", error);
      notify("Error al actualizar el detalle.");
    }
  };

  // ========================================================
  //   EDICIÓN EN LÍNEA - TECHUMBRE
  // ========================================================
  const handleEditTechClick = (item: TabItem) => {
    setEditingTechRowId(item.id || null);
    setEditingTechColors({
      interior: item.info?.surface_color?.interior?.name || "Intermedio",
      exterior: item.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleCancelTechEdit = (item: TabItem) => {
    setEditingTechRowId(null);
    setEditingTechColors({
      interior: item.info?.surface_color?.interior?.name || "Intermedio",
      exterior: item.info?.surface_color?.exterior?.name || "Intermedio",
    });
  };

  const handleConfirmTechEdit = async (item: TabItem) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/admin/details/${item.id}/update`;
      const payload = {
        info: {
          surface_color: {
            interior: { name: editingTechColors.interior },
            exterior: { name: editingTechColors.exterior },
          },
        },
      };
      await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      notify("Detalle tipo Techo actualizado con éxito.");
      setTechumbreTabList((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                info: {
                  ...it.info,
                  surface_color: {
                    interior: { name: editingTechColors.interior },
                    exterior: { name: editingTechColors.exterior },
                  },
                },
              }
            : it
        )
      );
      setEditingTechRowId(null);
    } catch (error: unknown) {
      console.error("Error al actualizar detalle de techo:", error);
      notify("Error al actualizar el detalle.");
    }
  };

  // ========================================================
  //   EDICIÓN EN LÍNEA - PISOS
  // ========================================================
  const handleEditPisoClick = (item: TabItem) => {
    setEditingPisoRowId(item.id || null);
    setEditingPisoForm({
      vertical: {
        lambda: item.info?.ref_aisl_vertical?.lambda?.toString() || "",
        e_aisl: item.info?.ref_aisl_vertical?.e_aisl?.toString() || "",
        d: item.info?.ref_aisl_vertical?.d?.toString() || "",
      },
      horizontal: {
        lambda: item.info?.ref_aisl_horizontal?.lambda?.toString() || "",
        e_aisl: item.info?.ref_aisl_horizontal?.e_aisl?.toString() || "",
        d: item.info?.ref_aisl_horizontal?.d?.toString() || "",
      },
    });
  };

  const handleCancelPisoEdit = () => {
    setEditingPisoRowId(null);
  };

  const handleConfirmPisoEdit = async (item: TabItem) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/admin/details/${item.id}/update`;
      const payload = {
        info: {
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
      };
      await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      notify("Detalle tipo Piso actualizado con éxito.");
      setPisosTabList((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                info: {
                  ...it.info,
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
            : it
        )
      );
      setEditingPisoRowId(null);
    } catch (error: unknown) {
      console.error("Error al actualizar detalle de piso:", error);
      notify("Error al actualizar el detalle.");
    }
  };

  // ========================================================
  //   ELIMINACIÓN DE DETALLE
  // ========================================================
  const confirmDeleteDetail = async () => {
    if (!deletingDetail) return;
    const token = getToken();
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/admin/details/${deletingDetail.id_detail}/delete`;
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      });
      console.log("Detalle eliminado:", response.data);
      notify("Detalle correctamente eliminado");
      await fetchFetchedDetails();
    } catch (error: unknown) {
      console.error("Error al eliminar detalle:", error);
      notify("Error", "No se pudo eliminar el detalle.");
    } finally {
      setShowDeleteModal(false);
      setDeletingDetail(null);
    }
  };

  // ========================================================
  //   Renderizado de Tablas con edición
  // ========================================================
  const renderMurosTable = () => {
    const columnsMuros = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
      { headerName: "Acciones", field: "acciones" },
    ];

    const data = murosTabList.map((item) => {
      const isEditing = editingMurosRowId === item.id;
      return {
        nombreAbreviado: item.name_detail,
        valorU: item.value_u ? item.value_u.toFixed(3) : "--",
        colorExterior: isEditing ? (
          <select
            value={editingMurosColors.exterior}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditingMurosColors((prev) => ({ ...prev, exterior: e.target.value }))
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
            value={editingMurosColors.interior}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setEditingMurosColors((prev) => ({ ...prev, interior: e.target.value }))
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
              variant="save"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmMurosEdit(item);
              }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              variant="cancelIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelMurosEdit(item);
              }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            variant="editIcon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMurosClick(item);
            }}
          >
            Editar
          </CustomButton>
        ),
      };
    });

    return (
      <div style={{ overflowX: "auto", minWidth: "600px" }}>
        {murosTabList.length > 0 ? (
          <TablesParameters columns={columnsMuros} data={data} />
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

    const data = techumbreTabList.map((item) => {
      const isEditing = editingTechRowId === item.id;
      return {
        nombreAbreviado: item.name_detail,
        valorU: item.value_u ? item.value_u.toFixed(3) : "--",
        colorExterior: isEditing ? (
          <select
            value={editingTechColors.exterior}
            onClick={(e) => e.stopPropagation()}
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
        ),
        colorInterior: isEditing ? (
          <select
            value={editingTechColors.interior}
            onClick={(e) => e.stopPropagation()}
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
        ),
        acciones: isEditing ? (
          <>
            <CustomButton
              variant="save"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmTechEdit(item);
              }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              variant="cancelIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelTechEdit(item);
              }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
            variant="editIcon"
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
      <div style={{ overflowX: "auto", minWidth: "600px" }}>
        {techumbreTabList.length > 0 ? (
          <TablesParameters columns={columnsTech} data={data} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
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

    const data = pisosTabList.map((item) => {
      const bajoPiso = item.info?.aislacion_bajo_piso || {};
      const vert = item.info?.ref_aisl_vertical || {};
      const horiz = item.info?.ref_aisl_horizontal || {};
      const isEditing = editingPisoRowId === item.id;

      return {
        nombre: item.name_detail,
        uValue: item.value_u ? item.value_u.toFixed(3) : "--",
        bajoPisoLambda: bajoPiso.lambda ? bajoPiso.lambda.toFixed(3) : "N/A",
        bajoPisoEAisl: bajoPiso.e_aisl ?? "N/A",
        vertLambda: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={editingPisoForm.vertical.lambda}
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                vertical: { ...prev.vertical, lambda: e.target.value },
              }))
            }
          />
        ) : (
          vert.lambda ? vert.lambda.toFixed(3) : "N/A"
        ),
        vertEAisl: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={editingPisoForm.vertical.e_aisl}
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                vertical: { ...prev.vertical, e_aisl: e.target.value },
              }))
            }
          />
        ) : (
          vert.e_aisl ?? "N/A"
        ),
        vertD: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={editingPisoForm.vertical.d}
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                vertical: { ...prev.vertical, d: e.target.value },
              }))
            }
          />
        ) : (
          vert.d ?? "N/A"
        ),
        horizLambda: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={editingPisoForm.horizontal.lambda}
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                horizontal: { ...prev.horizontal, lambda: e.target.value },
              }))
            }
          />
        ) : (
          horiz.lambda ? horiz.lambda.toFixed(3) : "N/A"
        ),
        horizEAisl: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={editingPisoForm.horizontal.e_aisl}
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                horizontal: { ...prev.horizontal, e_aisl: e.target.value },
              }))
            }
          />
        ) : (
          horiz.e_aisl ?? "N/A"
        ),
        horizD: isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={editingPisoForm.horizontal.d}
            onChange={(e) =>
              setEditingPisoForm((prev) => ({
                ...prev,
                horizontal: { ...prev.horizontal, d: e.target.value },
              }))
            }
          />
        ) : (
          horiz.d ?? "N/A"
        ),
        acciones: isEditing ? (
          <>
            <CustomButton
              variant="save"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmPisoEdit(item);
              }}
            >
              <span className="material-icons">check</span>
            </CustomButton>
            <CustomButton
              variant="cancelIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelPisoEdit();
              }}
            >
              Deshacer
            </CustomButton>
          </>
        ) : (
          <CustomButton
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
      <div style={{ overflowX: "auto", minWidth: "600px" }}>
        {pisosTabList.length > 0 ? (
          <TablesParameters columns={columnsPisos} data={data} />
        ) : (
          <p>No hay datos</p>
        )}
      </div>
    );
  };

  // ========================================================
  //   Renderizado "Detalles Generales" (Vista inicial)
  // ========================================================
  const renderInitialDetails = (inModal: boolean = false) => {
    const columnsDetails = [
      { headerName: "Ubicación Detalle", field: "scantilon_location" },
      { headerName: "Nombre Detalle", field: "name_detail" },
      { headerName: "Material", field: "material" },
      { headerName: "Espesor capa (cm)", field: "layer_thickness" },
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

        <div
          className="custom-table-container"
          style={{
            height: "400px",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <TablesParameters columns={columnsDetails} data={filteredData} />
        </div>

        {!inModal && (
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
            <CustomButton
              variant="save"
              onClick={() => {
                if (inModal) setShowGeneralDetailsModal(false);
                else setShowTabsInStep4(false);
              }}
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
              <span className="material-icons">arrow_back</span> Volver
            </CustomButton>
          </div>
        )}
      </>
    );
  };

  // ========================================================
  //   Renderizado de las pestañas (Muros, Techumbre, Pisos)
  // ========================================================
  const renderDetailsTabs = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <CustomButton
          onClick={handleNewButtonClick}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            height: "40px",
          }}
        >
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

      <div style={{ height: "400px", overflowY: "auto", position: "relative" }}>
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

  // ========================================================
  //   Render principal del componente
  // ========================================================
  return (
    <div className="constructive-details-container" style={{ padding: "20px" }}>
      <div style={{ marginTop: "20px" }}>
        {showTabsInStep4 ? renderDetailsTabs() : renderInitialDetails()}
      </div>

      {/* MODAL: Crear Nuevo Detalle */}
      <ModalCreate
        isOpen={showNewDetailRow}
        onClose={() => setShowNewDetailRow(false)}
        onSave={handleCreateNewDetail}
        title="Nuevo Detalle"
        saveLabel="Crear"
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

      {/* MODAL: Confirmar Eliminación */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingDetail(null);
        }}
        onSave={async () => {
          await confirmDeleteDetail();
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

      {/* MODAL: Detalles Generales (sin footer) */}
      <ModalCreate
        isOpen={showGeneralDetailsModal}
        onClose={() => setShowGeneralDetailsModal(false)}
        onSave={() => {}}
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
