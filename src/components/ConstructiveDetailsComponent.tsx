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

  // Estados para eliminar y editar detalle (en la vista general)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDetail, setDeletingDetail] = useState<Detail | null>(null);
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);

  // Estado para mostrar modal "Detalles Generales"
  const [showGeneralDetailsModal, setShowGeneralDetailsModal] = useState(false);

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

  // Efecto de carga inicial de detalles
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

  // Si editingDetail tiene material pero material_id=0, buscar el id correspondiente
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

  // EDICIÓN DE DETALLE GENERAL (Modal)
  const handleEditDetail = (detail: Detail) => {
    // Cierra el modal de Detalles Generales para que el modal de edición no quede detrás.
    setShowGeneralDetailsModal(false);

    // Carga la lista de materiales para que el select tenga datos actualizados
    fetchMaterials();
    setEditingDetail(detail);
  };

  const handleConfirmEditDetail = async () => {
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

      // Cierra el modal de edición
      setEditingDetail(null);

      // Reabre el modal de Detalles Generales con data refrescada
      setShowGeneralDetailsModal(true);
    } catch (error: unknown) {
      console.error("Error al actualizar el detalle:", error);
      notify("Error al actualizar el detalle.");
    }
  };

  // ========================================================
  //   Renderizado "Detalles Generales" (Vista Inicial)
  // ========================================================
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

    // La columna Acciones se mantiene en la vista de Detalles Generales
    const data = filteredData.map((det) => ({
      scantilon_location: det.scantilon_location,
      name_detail: det.name_detail,
      material: det.material,
      layer_thickness: det.layer_thickness,
      acciones: (
        <>
          <CustomButton variant="editIcon" onClick={() => handleEditDetail(det)}>
            Editar
          </CustomButton>
          <CustomButton
            variant="deleteIcon"
            onClick={() => {
              // Cierra el modal de Detalles Generales si está abierto
              setShowGeneralDetailsModal(false);

              // Abre el modal de confirmación de eliminación
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

        <div
          className="custom-table-container"
          style={{
            height: "400px",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <TablesParameters columns={columnsDetails} data={data} />
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
  //   Renderizado de Tablas (sin columna de “Acciones”)
  // ========================================================

  // MUROS
  const renderMurosTable = () => {
    const columnsMuros = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
    ];

    const data = murosTabList.map((item) => ({
      nombreAbreviado: item.name_detail,
      valorU: item.value_u ? item.value_u.toFixed(3) : "--",
      colorExterior: item.info?.surface_color?.exterior?.name || "Desconocido",
      colorInterior: item.info?.surface_color?.interior?.name || "Desconocido",
    }));

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

  // TECHUMBRE
  const renderTechumbreTable = () => {
    const columnsTech = [
      { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
    ];

    const data = techumbreTabList.map((item) => ({
      nombreAbreviado: item.name_detail,
      valorU: item.value_u ? item.value_u.toFixed(3) : "--",
      colorExterior: item.info?.surface_color?.exterior?.name || "Desconocido",
      colorInterior: item.info?.surface_color?.interior?.name || "Desconocido",
    }));

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

    const formatValue = (val: any, decimals: number = 3) => {
      if (val === 0 || val === null || val === undefined) {
        return "-";
      }
      return typeof val === "number" ? val.toFixed(decimals) : val;
    };

    const pisosData = pisosTabList.map((item) => {
      const bajoPiso = item.info?.aislacion_bajo_piso || {};
      const vert = item.info?.ref_aisl_vertical || {};
      const horiz = item.info?.ref_aisl_horizontal || {};

      return {
        nombre: item.name_detail,
        uValue: formatValue(item.value_u),
        bajoPisoLambda: formatValue(bajoPiso.lambda),
        bajoPisoEAisl: formatValue(bajoPiso.e_aisl, 0),
        vertLambda: formatValue(vert.lambda),
        vertEAisl: formatValue(vert.e_aisl, 0),
        vertD: formatValue(vert.d, 0),
        horizLambda: formatValue(horiz.lambda),
        horizEAisl: formatValue(horiz.e_aisl, 0),
        horizD: formatValue(horiz.d, 0),
      };
    });

    return (
      <div style={{ overflowX: "auto", minWidth: "600px" }}>
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

  // Render principal del componente
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

      {/* MODAL: Editar Detalle (Vista General) */}
      {editingDetail && (
        <ModalCreate
          isOpen={true}
          title="Editar Detalle"
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
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev ? { ...prev, scantilon_location: e.target.value } : prev
                  )
                }
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
                value={editingDetail.material_id ? editingDetail.material_id.toString() : ""}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev ? { ...prev, material_id: Number(e.target.value) } : prev
                  )
                }
                onClick={fetchMaterials}
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
                className="form-control"
                value={editingDetail.layer_thickness}
                onChange={(e) =>
                  setEditingDetail((prev) =>
                    prev ? { ...prev, layer_thickness: Number(e.target.value) } : prev
                  )
                }
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {/* MODAL: Detalles Generales (Vista Filtrada) */}
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
