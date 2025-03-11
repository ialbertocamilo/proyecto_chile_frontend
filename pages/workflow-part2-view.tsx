import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Card from "../src/components/common/Card";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import { useRouter } from "next/router";
import GooIcons from "../public/GoogleIcons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "../src/components/Title"; 
import SidebarItemComponent from "../src/components/common/SidebarItemComponent";
// Importamos el componente SearchParameters
import SearchParameters from "../src/components/inputs/SearchParameters";

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
}

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

type TabStep4 = "detalles" | "muros" | "techumbre" | "pisos" | "ventanas" | "puertas";

function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

const WorkFlowpar2viewPage: React.FC = () => {
  useAuth();
  const router = useRouter();

  // Estado para el id del proyecto y paso actual
  const [projectId, setProjectId] = useState<number | null>(null);
  const [step, setStep] = useState<number>(4);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  // Estado para búsqueda en detalles constructivos
  const [searchQuery, setSearchQuery] = useState("");
  // Estados para las pestañas (para mostrar datos en detalle)
  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [ventanasTabList, setVentanasTabList] = useState<Ventana[]>([]);
  const [puertasTabList, setPuertasTabList] = useState<Puerta[]>([]);

  const primaryColor = getCssVarValue("--primary-color", "#3ca7b7");

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

  // --- Obtención del projectId y step desde la URL o localStorage ---  
  useEffect(() => {
    if (router.isReady) {
      // Si la URL trae un id, lo usamos; de lo contrario, intentamos con localStorage
      if (router.query.id) {
        setProjectId(Number(router.query.id));
      } else {
        const storedProjectId = localStorage.getItem("project_id_view");
        if (storedProjectId) {
          setProjectId(Number(storedProjectId));
        }
      }
      // Si la URL trae el parámetro step, lo usamos
      if (router.query.step) {
        const stepQuery = parseInt(router.query.step as string, 10);
        if (!isNaN(stepQuery)) {
          setStep(stepQuery);
        }
      }
      setHasLoaded(true);
    }
  }, [router.isReady, router.query.id, router.query.step]);

  useEffect(() => {
    if (hasLoaded && projectId === null) {
      Swal.fire(
        "Ningún proyecto está seleccionado",
        "Serás redirigido a la creación de proyecto",
        "warning"
      ).then(() => {
        router.push("/workflow-part1-view");
      });
    }
  }, [hasLoaded, projectId, router]);
  // --------------------------------------------------------------

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
    if (!projectId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/project/${projectId}/details/Muro`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setMurosTabList(response.data);
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
      const url = `${constantUrlApiEndpoint}/project/${projectId}/details/Techo`;
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
      const url = `${constantUrlApiEndpoint}/project/${projectId}/details/Piso`;
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
      const url = `${constantUrlApiEndpoint}/elements/?type=window`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setVentanasTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de ventanas:", error);
      toast.error("Error al obtener datos de ventanas. Ver consola.");
    }
  }, []);

  const fetchPuertasDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Token no encontrado", "Inicia sesión.");
      return;
    }
    try {
      const url = `${constantUrlApiEndpoint}/elements/?type=door`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setPuertasTabList(response.data);
    } catch (error: unknown) {
      console.error("Error al obtener datos de puertas:", error);
      toast.error("Error al obtener datos de puertas. Ver consola.");
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

  // Render del encabezado principal
  const renderMainHeader = () =>
    step >= 4 && <Title text="Vista de Desarrollo de proyecto" />;

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

  // Render de las pestañas para mostrar datos detallados
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
          {tabStep4 === "muros" && (
            <div style={{ overflowX: "auto" }}>
              <table
                className="table table-bordered table-striped"
                style={{ width: "100%", minWidth: "600px" }}
              >
                <thead>
                  <tr>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Nombre Abreviado
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Valor U (W/m²K)
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Color Exterior
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Color Interior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {murosTabList.length > 0 ? (
                    murosTabList.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>{item.name_detail}</td>
                        <td style={{ textAlign: "center" }}>
                          {item.value_u?.toFixed(3) ?? "--"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.info?.surface_color?.exterior?.name || "Desconocido"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.info?.surface_color?.interior?.name || "Desconocido"}
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
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Nombre Abreviado
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Valor U (W/m²K)
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Color Exterior
                    </th>
                    <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                      Color Interior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {techumbreTabList.length > 0 ? (
                    techumbreTabList.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>{item.name_detail}</td>
                        <td style={{ textAlign: "center" }}>
                          {item.value_u?.toFixed(3) ?? "--"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.info?.surface_color?.exterior?.name || "Desconocido"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.info?.surface_color?.interior?.name || "Desconocido"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No hay datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {tabStep4 === "pisos" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Nombre
                  </th>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    U [W/m²K]
                  </th>
                  <th colSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Aislamiento bajo piso
                  </th>
                  <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Ref Aisl Vert.
                  </th>
                  <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Ref Aisl Horiz.
                  </th>
                </tr>
                <tr>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    I [W/mK]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    I [W/mK]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    D [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    I [W/mK]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
                    e Aisl [cm]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor, textAlign: "center" }}>
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
                        <td style={{ textAlign: "center" }}>{item.name_detail}</td>
                        <td style={{ textAlign: "center" }}>
                          {item.value_u?.toFixed(3) ?? "--"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {bajoPiso.lambda ? bajoPiso.lambda.toFixed(3) : "N/A"}
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
          )}
          {tabStep4 === "ventanas" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Nombre Elemento
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    U Vidrio [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    FS Vidrio []
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Tipo Marco
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Tipo Cierre
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    U Marco [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    FV [%]
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventanasTabList.length > 0 ? (
                  ventanasTabList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center" }}>{item.name_element}</td>
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
                      <td style={{ textAlign: "center" }}>{item.fm ?? "--"}</td>
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
          )}
          {tabStep4 === "puertas" && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Nombre Elemento
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    U puerta opaca [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    Vidrio []
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    % vidrio
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    U Marco [W/m²K]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor, textAlign: "center" }}>
                    FM [%]
                  </th>
                </tr>
              </thead>
              <tbody>
                {puertasTabList.length > 0 ? (
                  puertasTabList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center" }}>{item.name_element}</td>
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
                      <td style={{ textAlign: "center" }}>{item.fm ?? "--"}</td>
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
          )}
        </div>
        {/* Botón "Regresar" para volver a la vista inicial */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
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
            <span className="material-icons">arrow_back</span>
          </CustomButton>
        </div>
      </div>
    );
  };

  // Render de la tabla inicial con la lista de detalles y barra de búsqueda funcional
  const renderInitialDetails = () => {
    if (showTabsInStep4) return null;
    // Filtramos los detalles según la búsqueda (por ubicación, nombre, material o espesor)
    const filteredDetails = fetchedDetails.filter((det) => {
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
        {/* Se reemplaza el input de búsqueda por el componente SearchParameters */}
        <SearchParameters
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar..."
          // En esta vista, el botón "Nuevo" no tiene acción, por lo que se pasa una función vacía
          onNew={() => {}}
          style={{ marginBottom: "1rem" }}
          showNewButton={false}
        />
        <div className="mb-3">
          <div style={{ height: "400px", overflowY: "scroll" }}>
            <table className="table table-bordered table-striped" style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Ubicación Detalle
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Nombre Detalle
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Material
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: "var(--primary-color)", textAlign: "center" }}>
                    Espesor capa (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.map((det) => (
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
        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", marginBottom: "10px" }}>
          <CustomButton
            id="mostrar-datos-btn"
            variant="save"
            onClick={() => setShowTabsInStep4(true)}
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
      </>
    );
  };

  const renderRecinto = () => {
    return (
      <>
        <h5 style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }} className="mb-3">
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
      </>
    );
  };

  const sidebarSteps = [
    {
      stepNumber: 1,
      iconName: "assignment_ind",
      title:
        "Agregar detalles de propietario / proyecto y clasificación de edificaciones",
      route: `/workflow-part1-view?id=${projectId}&step=1`,
    },
    {
      stepNumber: 2,
      iconName: "location_on",
      title: "Ubicación del proyecto",
      route: `/workflow-part1-view?id=${projectId}&step=2`,
    },
    {
      stepNumber: 4,
      iconName: "build",
      title: "Detalles constructivos",
      route: `/workflow-part2-view?id=${projectId}&step=4`,
    },
    {
      stepNumber: 7,
      iconName: "design_services",
      title: "Recinto",
      route: `/workflow-part2-view?id=${projectId}&step=7`,
    },
  ];


  return (
    <>
      <GooIcons />
      <div>
        <Card>
          <h3 style={{ paddingBottom: "2rem" }}>{renderMainHeader()}</h3>
          <div className="d-flex align-items-center gap-4">
            <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
              Proyecto: 
            </span>
            <CustomButton variant="save" className="no-hover" style={{ padding: "0.8rem 3rem" }}>
              {`Edificación Nº ${projectId ?? "xxxxx"}`}
            </CustomButton>
          </div>
        </Card>
        <Card style={{ marginTop: "clamp(0.5rem, 2vw, 1rem)", marginLeft: "0.1rem", width: "100%" }}>
          <div className="row">
            {/* Sidebar con los elementos necesarios */}
            <div className="col-lg-3 col-12 order-lg-first order-first">
              <div className="mb-3 mb-lg-0">
                <ul className="nav flex-column" style={{ height: "100%" }}>
                  <SidebarItemComponent
                    stepNumber={1}
                    iconName="assignment_ind"
                    activeStep={step}
                    title="Agregar detalles de propietario / proyecto y clasificación de edificaciones"
                    onClickAction={() =>
                      router.push(`/workflow-part1-view?id=${projectId}&step=1`)
                    }
                  />
                  <SidebarItemComponent
                    stepNumber={2}
                    iconName="location_on"
                    activeStep={step}
                    title="Ubicación del proyecto"
                    onClickAction={() =>
                      router.push(`/workflow-part1-view?id=${projectId}&step=2`)
                    }
                  />
                  <SidebarItemComponent
                    stepNumber={4}
                    iconName="build"
                    activeStep={step}
                    title="Detalles constructivos"
                    onClickAction={() =>
                      router.push(`/workflow-part2-view?id=${projectId}&step=4`)
                    }
                  />
                  <SidebarItemComponent
                    stepNumber={7}
                    iconName="design_services"
                    activeStep={step}
                    title="Recinto"
                    onClickAction={() =>
                      router.push(`/workflow-part2-view?id=${projectId}&step=7`)
                    }
                  />
                </ul>
              </div>
            </div>
            {/* Contenido principal */}
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
      </div>
    </>
  );
};

export default WorkFlowpar2viewPage;
