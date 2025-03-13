import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "./common/CustomButton";
import Modal from "./common/Modal";
import SearchParameters from "./inputs/SearchParameters";
import { Tooltip } from "react-tooltip";
import { constantUrlApiEndpoint } from "../utils/constant-url-endpoint";
import { notify } from "@/utils/notify";

// Interfaces y tipos usados en este step
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

// Estilos para encabezados sticky
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

// Props que recibirá el componente extraído
interface DetallesConstructivosProps {
  projectId: number;
  primaryColor: string;
}

const DetallesConstructivos: React.FC<DetallesConstructivosProps> = ({ projectId, primaryColor }) => {
  // Estados generales del step
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

  // Función auxiliar para obtener el token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

  // Función genérica para obtener datos
  const fetchData = useCallback(
    async <T,>(endpoint: string, setter: (data: T) => void) => {
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
    []
  );

  // Función para obtener detalles constructivos
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

  // Ejemplo de función para obtener detalles de muros
  const fetchMurosDetails = useCallback(() => {
    fetchData<TabItem[]>(
      `${constantUrlApiEndpoint}/project/${projectId}/details/Muro`,
      (data) => {
        if (data && data.length > 0) setMurosTabList(data);
      }
    );
  }, [projectId, fetchData]);

  // (Se pueden incluir funciones similares para techumbre, pisos, ventanas y puertas)

  // Función para obtener materiales
  const fetchMaterials = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = `${constantUrlApiEndpoint}/constants/?page=1&per_page=700`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      const allConstants = response.data.constants || [];
      const materialsList: Material[] = allConstants
        .filter((c: any) => c.name === "materials" && c.type === "definition materials")
        .map((c: any) => ({
          id: c.id,
          name: c.atributs.name,
        }));
      setMaterials(materialsList);
    } catch (error: unknown) {
      console.error("Error al obtener materiales:", error);
      notify("Error al obtener materiales.");
    }
  };

  // Función para crear un nuevo detalle y añadirlo al proyecto
  const handleCreateNewDetail = async () => {
    if (!showNewDetailRow) return;
    if (
      !newDetailForm.scantilon_location ||
      !newDetailForm.name_detail ||
      !newDetailForm.material_id
    ) {
      notify("Por favor complete todos los campos de detalle");
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
        notify("El backend no devolvió un ID de detalle válido.");
        return;
      }

      // (Aquí podrías agregar la lógica para añadir el detalle al proyecto)

      // Actualizar la interfaz
      fetchFetchedDetails();
      setShowNewDetailRow(false);
      setNewDetailForm({
        scantilon_location: "",
        name_detail: "",
        material_id: 0,
        layer_thickness: null,
      });
      notify("Detalle creado y añadido al proyecto exitosamente");
    } catch (error: unknown) {
      console.error("Error en la creación del detalle:", error);
      notify("Error en la creación del detalle");
    }
  };

  // Renderizado de la vista inicial (lista de detalles y formulario para agregar uno nuevo)
  const renderInitialDetails = () => {
    return (
      <>
        <SearchParameters
          value=""
          onChange={() => {}}
          placeholder="Buscar..."
          onNew={() => {
            setShowNewDetailRow(true);
            fetchMaterials();
          }}
          newButtonText="Nuevo"
          style={{ marginBottom: "1rem" }}
        />
        <div style={{ height: "400px", overflowY: "scroll", overflowX: "auto" }}>
          <table
            className="table table-bordered table-striped"
            style={{ width: "80%", minWidth: "600px", textAlign: "center", margin: "auto" }}
          >
            <thead>
              <tr>
                <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Ubicación Detalle</th>
                <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Nombre Detalle</th>
                <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Material</th>
                <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Espesor capa (cm)</th>
              </tr>
            </thead>
            <tbody>
              {showNewDetailRow && (
                <Modal
                  isOpen={showNewDetailRow}
                  onClose={() => setShowNewDetailRow(false)}
                  title="Agregar Nuevo Detalle Constructivo"
                >
                  {/* Formulario para crear un nuevo detalle */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "20px" }}>
                    {/* Campo: Ubicación */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ textAlign: "left", fontWeight: "normal", marginBottom: "5px" }}>
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
                    {/* Campo: Nombre */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ textAlign: "left", fontWeight: "normal", marginBottom: "5px" }}>
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
                    {/* Campo: Material */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ textAlign: "left", fontWeight: "normal", marginBottom: "5px" }}>
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
                    {/* Campo: Espesor */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ textAlign: "left", fontWeight: "normal", marginBottom: "5px" }}>
                        Espesor de la Capa (cm)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Espesor (cm)"
                        value={newDetailForm.layer_thickness === null ? "" : newDetailForm.layer_thickness}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") e.preventDefault();
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
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px", paddingRight: "15px" }}>
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
                    <CustomButton variant="save" onClick={handleCreateNewDetail} id="grabar-datos-btn">
                      Crear Detalles
                    </CustomButton>
                    <Tooltip anchorSelect="#grabar-datos-btn" place="top">
                      Guardar cambios tras agregar un detalle
                    </Tooltip>
                  </div>
                </Modal>
              )}
              {fetchedDetails.map((det) => (
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
        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <CustomButton
            variant="save"
            onClick={() => {
              // Aquí se podría llamar a la función que procese el guardado de detalles
              setShowTabsInStep4(true);
              setTabStep4("muros");
            }}
          >
            Mostrar datos
          </CustomButton>
        </div>
      </>
    );
  };

  // Ejemplo simplificado: renderizado de pestañas (muros, techumbre, etc.)
  const renderStep4Tabs = () => {
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
                  borderBottom: tabStep4 === item.key ? `3px solid ${primaryColor}` : "none",
                  fontFamily: "var(--font-family-base)",
                }}
                onClick={() => {
                  setTabStep4(item.key);
                  // Ejemplo: si se cambia a "muros", se puede llamar a fetchMurosDetails
                  if (item.key === "muros") fetchMurosDetails();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        {/* Aquí se renderizarían los datos de cada pestaña según tabStep4 */}
        <div style={{ height: "400px", overflowY: "auto" }}>
          {tabStep4 === "muros" && (
            <div style={{ overflowX: "auto" }}>
              <table className="table table-bordered table-striped" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Nombre Abreviado</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Valor U (W/m²K)</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Color Exterior</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Color Interior</th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {murosTabList.map((item) => (
                    <tr key={item.id || item.id_detail}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>{item.info?.surface_color?.exterior?.name || "Desconocido"}</td>
                      <td>{item.info?.surface_color?.interior?.name || "Desconocido"}</td>
                      <td>
                        <CustomButton variant="editIcon" onClick={() => { /* Lógica de edición */ }}>
                          Editar
                        </CustomButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Se pueden agregar renderizados para las demás pestañas */}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
          <CustomButton variant="save" onClick={() => setShowTabsInStep4(false)}>
            <span className="material-icons" style={{ fontSize: "24px" }}>
              arrow_back
            </span>
            &nbsp;Regresar
          </CustomButton>
        </div>
      </div>
    );
  };

  // Carga inicial de datos cuando el componente se monta
  useEffect(() => {
    fetchFetchedDetails();
  }, [fetchFetchedDetails]);

  return (
    <div>
      {showTabsInStep4 ? renderStep4Tabs() : renderInitialDetails()}
    </div>
  );
};

export default DetallesConstructivos;
