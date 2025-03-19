// ConstructiveDetailsComponent.tsx
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import CustomButton from "./common/CustomButton";
import Title from "./Title";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "../utils/constant-url-endpoint";
import TablesParameters from "@/components/tables/TablesParameters";
import SearchParameters from "./inputs/SearchParameters";
import ModalCreate from "./common/ModalCreate";
import ActionButtons from "./common/ActionButtons";

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

interface ConstructiveDetailsProps {}

const getCssVarValue = (varName: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
};

const ConstructiveDetailsComponent: React.FC<ConstructiveDetailsProps> = () => {
  const router = useRouter();

  // Estados generales
  const [hasLoaded, setHasLoaded] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para detalles y pestañas
  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [showTabsInStep4, setShowTabsInStep4] = useState(true);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  // Estados para cada pestaña
  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Estado para el formulario de creación y modal de nuevo detalle
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

  // Estados para eliminación de detalle (modal de confirmación)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDetail, setDeletingDetail] = useState<Detail | null>(null);

  // Funciones para editar y eliminar
  const handleEdit = (id: number) => {
    console.log("Editar detalle con id:", id);
    notify("Editar", `Editar detalle con id: ${id}`);
  };

  // Al hacer clic en eliminar se busca el detalle y se abre el modal
  const handleDelete = (id: number) => {
    console.log("handleDelete llamado con id:", id);
    const detail = fetchedDetails.find((det) => det.id_detail === id);
    if (!detail) {
      notify("Error", "Detalle no encontrado.");
      return;
    }
    setDeletingDetail(detail);
    setShowDeleteModal(true);
  };

  // Función para confirmar la eliminación
  const confirmDeleteDetail = async () => {
    if (!deletingDetail) return;
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/details/${deletingDetail.id_detail}/delete`;
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      });
      console.log("Detalle eliminado:", response.data);
      notify("Detalle correctamente eliminado");
      // Actualiza la lista de detalles
      await fetchFetchedDetails();
    } catch (error: unknown) {
      console.error("Error al eliminar detalle:", error);
      notify("Error", "No se pudo eliminar el detalle.");
    } finally {
      setShowDeleteModal(false);
      setDeletingDetail(null);
    }
  };

  // Inicialización
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

  // Función genérica para obtener datos
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

  // Función para obtener todos los detalles y actualizar la tabla
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

  // Efectos de carga de datos
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

  // Manejo de creación de nuevo detalle
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

  const handleNewButtonClick = () => {
    setShowNewDetailRow(true);
    fetchMaterials();
  };

  const saveDetails = () => {
    setShowTabsInStep4(true);
    setTabStep4("muros");
  };

  // =================== RENDER DE TABLAS ===================
  const renderTable = (
    tabList: TabItem[],
    columns: { headerName: string; field: string }[],
    dataMap: (item: TabItem) => any,
    multiHeader?: { rows: any[] }
  ) => (
    <div className="custom-table-container" style={{ overflowX: "auto", minWidth: "600px" }}>
      {tabList.length > 0 ? (
        <TablesParameters columns={columns} data={tabList.map(dataMap)} multiHeader={multiHeader} />
      ) : (
        <p>No hay datos</p>
      )}
    </div>
  );

  const renderMurosTable = () =>
    renderTable(
      murosTabList,
      [
        { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
        { headerName: "Valor U (W/m²K)", field: "valorU" },
        { headerName: "Color Exterior", field: "colorExterior" },
        { headerName: "Color Interior", field: "colorInterior" },
      ],
      (item) => ({
        nombreAbreviado: item.name_detail,
        valorU: item.value_u ? item.value_u.toFixed(3) : "--",
        colorExterior: item.info?.surface_color?.exterior?.name || "Desconocido",
        colorInterior: item.info?.surface_color?.interior?.name || "Desconocido",
      })
    );

  const renderTechumbreTable = () =>
    renderTable(
      techumbreTabList,
      [
        { headerName: "Nombre Abreviado", field: "nombreAbreviado" },
        { headerName: "Valor U (W/m²K)", field: "valorU" },
        { headerName: "Color Exterior", field: "colorExterior" },
        { headerName: "Color Interior", field: "colorInterior" },
      ],
      (item) => ({
        nombreAbreviado: item.name_detail,
        valorU: item.value_u ? item.value_u.toFixed(3) : "--",
        colorExterior: item.info?.surface_color?.exterior?.name || "Desconocido",
        colorInterior: item.info?.surface_color?.interior?.name || "Desconocido",
      })
    );

  const renderPisosTable = () => {
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

    return renderTable(
      pisosTabList,
      [
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
      ],
      (item) => {
        const bajoPiso = item.info?.aislacion_bajo_piso || {};
        const vert = item.info?.ref_aisl_vertical || {};
        const horiz = item.info?.ref_aisl_horizontal || {};
        return {
          nombre: item.name_detail,
          uValue: item.value_u ? item.value_u.toFixed(3) : "--",
          bajoPisoLambda: bajoPiso.lambda ? bajoPiso.lambda.toFixed(3) : "N/A",
          bajoPisoEAisl: bajoPiso.e_aisl ?? "N/A",
          vertLambda: vert.lambda ? vert.lambda.toFixed(3) : "N/A",
          vertEAisl: vert.e_aisl ?? "N/A",
          vertD: vert.d ?? "N/A",
          horizLambda: horiz.lambda ? horiz.lambda.toFixed(3) : "N/A",
          horizEAisl: horiz.e_aisl ?? "N/A",
          horizD: horiz.d ?? "N/A",
        };
      },
      multiHeaderPisos
    );
  };

  // =================== RENDER DE PESTAÑAS Y VISTAS ===================
  const renderDetailsTabs = () => (
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
        {tabStep4 === "muros" && renderMurosTable()}
        {tabStep4 === "techumbre" && renderTechumbreTable()}
        {tabStep4 === "pisos" && renderPisosTable()}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
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
            visibility
          </span>
          &nbsp;Ver Detalles Generales
        </CustomButton>
      </div>
    </div>
  );

  const renderInitialDetails = () => {
    // Se añade la columna "Acciones"
    const columnsDetails = [
      { headerName: "Ubicación Detalle", field: "scantilon_location" },
      { headerName: "Nombre Detalle", field: "name_detail" },
      { headerName: "Material", field: "material" },
      { headerName: "Espesor capa (cm)", field: "layer_thickness" },
      { headerName: "Accion", field: "action" },
    ];

    // Se filtran los datos según la búsqueda y se agrega la columna con ActionButtons
    const filteredData = fetchedDetails
      .filter((det) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          det.scantilon_location.toLowerCase().includes(searchLower) ||
          det.name_detail.toLowerCase().includes(searchLower) ||
          det.material.toLowerCase().includes(searchLower) ||
          det.layer_thickness.toString().includes(searchLower)
        );
      })
      .map((detail) => ({
        ...detail,
        action: (
          <ActionButtons
            onEdit={() => handleEdit(detail.id_detail)}
            onDelete={() => handleDelete(detail.id_detail)}
          />
        ),
      }));

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

        <div className="custom-table-container" style={{ height: "400px", overflowY: "auto", overflowX: "auto" }}>
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
          <div style={{ width: "100%", padding: "10px" }}>
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
      </>
    );
  };

  // Agregamos un log para confirmar el valor del modal de eliminación
  console.log("showDeleteModal:", showDeleteModal);

  return (
    <div className="constructive-details-container" style={{ padding: "20px" }}>
      <div style={{ marginTop: "20px" }}>
        {showTabsInStep4 ? renderDetailsTabs() : renderInitialDetails()}
      </div>

      {/* Modal para crear nuevo detalle */}
      <ModalCreate
        isOpen={showNewDetailRow}
        onClose={() => setShowNewDetailRow(false)}
        onSave={handleCreateNewDetail}
        title="Nuevo Detalle"
        saveLabel="Crear"
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

      {/* Modal para confirmar eliminación de detalle */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingDetail(null);
        }}
        onSave={confirmDeleteDetail}
        title="Confirmar Eliminación"
        saveLabel="Eliminar"
      >
        <p>
          ¿Estás seguro que deseas eliminar el detalle{" "}
          <strong>{deletingDetail?.name_detail}</strong>?
        </p>
      </ModalCreate>

      {/* Estilos para definir fondo blanco en los headers de la tabla */}
      <style jsx>{`
        .custom-table-container table thead {
          background-color: #fff;
        }
        .custom-table-container table thead th {
          background-color: #fff;
          color: #000;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default ConstructiveDetailsComponent;
