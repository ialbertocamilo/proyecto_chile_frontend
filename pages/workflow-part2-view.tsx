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
import { notify } from "@/utils/notify";
import Title from "../src/components/Title";
// Se importa el componente AdminSidebar en vez de SidebarItemComponent
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
// Importamos el componente SearchParameters
import SearchParameters from "../src/components/inputs/SearchParameters";

// Importamos el componente genérico de tablas
import TablesParameters from "../src/components/tables/TablesParameters";
import Breadcrumb from "@/components/common/Breadcrumb";

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

  // ==================== ESTADOS PRINCIPALES ====================
  const [projectId, setProjectId] = useState<number | null>(null);
  const [step, setStep] = useState<number>(4);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [fetchedDetails, setFetchedDetails] = useState<Detail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showTabsInStep4, setShowTabsInStep4] = useState(false);
  const [tabStep4, setTabStep4] = useState<TabStep4>("detalles");

  const [murosTabList, setMurosTabList] = useState<TabItem[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<TabItem[]>([]);
  const [pisosTabList, setPisosTabList] = useState<TabItem[]>([]);
  const [ventanasTabList, setVentanasTabList] = useState<Ventana[]>([]);
  const [puertasTabList, setPuertasTabList] = useState<Puerta[]>([]);

  const primaryColor = getCssVarValue("--primary-color", "#3ca7b7");

  // Ejemplo de recintos (hardcodeado)
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

  // ==================== OBTENCIÓN DE projectId y paso ====================
  useEffect(() => {
    if (router.isReady) {
      if (router.query.id) {
        setProjectId(Number(router.query.id));
      } else {
        const storedProjectId = localStorage.getItem("project_id_view");
        if (storedProjectId) {
          setProjectId(Number(storedProjectId));
        }
      }
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

  // ==================== LLAMADAS A ENDPOINTS ====================
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
      notify("Error al obtener datos de Ventanas. Ver consola.");
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
      notify("Error al obtener datos de Puertas. Ver consola.");
    }
  }, []);

  // ==================== EFECTOS SEGÚN STEP ====================
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

  // ==================== RENDER CABECERA ====================
  const renderMainHeader = () =>
    step >= 4 && <Title text="Vista de Desarrollo de proyecto" />;

  // ==================== RENDER DE TABLAS (MUROS, TECHUMBRE, ETC.) ====================
  // 1) Muros
  const renderMurosTable = () => {
    // Definimos columnas
    const columnsMuros = [
      { headerName: "Nombre Abreviado", field: "name_detail" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
    ];

    // Transformamos data en objetos con dichas propiedades
    const murosData = murosTabList.map((item) => ({
      name_detail: item.name_detail,
      valorU: item.value_u?.toFixed(3) ?? "--",
      colorExterior: item.info?.surface_color?.exterior?.name || "Desconocido",
      colorInterior: item.info?.surface_color?.interior?.name || "Desconocido",
    }));

    return murosTabList.length > 0 ? (
      <TablesParameters columns={columnsMuros} data={murosData} />
    ) : (
      <p>No hay datos</p>
    );
  };

  // 2) Techumbre
  const renderTechumbreTable = () => {
    const columnsTechumbre = [
      { headerName: "Nombre Abreviado", field: "name_detail" },
      { headerName: "Valor U (W/m²K)", field: "valorU" },
      { headerName: "Color Exterior", field: "colorExterior" },
      { headerName: "Color Interior", field: "colorInterior" },
    ];

    const techData = techumbreTabList.map((item) => ({
      name_detail: item.name_detail,
      valorU: item.value_u?.toFixed(3) ?? "--",
      colorExterior: item.info?.surface_color?.exterior?.name || "Desconocido",
      colorInterior: item.info?.surface_color?.interior?.name || "Desconocido",
    }));

    return techumbreTabList.length > 0 ? (
      <TablesParameters columns={columnsTechumbre} data={techData} />
    ) : (
      <p>No hay datos</p>
    );
  };

  // 3) Pisos (se aplanan las columnas con "I [W/mK]" / "e Aisl [cm]" para cada sub-objeto)
  const renderPisosTable = () => {
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
    

  // 4) Ventanas
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

    const ventanasData = ventanasTabList.map((item) => ({
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

    return ventanasTabList.length > 0 ? (
      <TablesParameters columns={columnsVentanas} data={ventanasData} />
    ) : (
      <p>No hay datos</p>
    );
  };

  // 5) Puertas
  const renderPuertasTable = () => {
    const columnsPuertas = [
      { headerName: "Nombre Elemento", field: "name_element" },
      { headerName: "U puerta opaca [W/m²K]", field: "u_puerta" },
      { headerName: "Vidrio []", field: "name_ventana" },
      { headerName: "% vidrio", field: "porcentaje_vidrio" },
      { headerName: "U Marco [W/m²K]", field: "u_marco" },
      { headerName: "FM [%]", field: "fm" },
    ];

    const puertasData = puertasTabList.map((item) => ({
      name_element: item.name_element,
      u_puerta: item.atributs?.u_puerta_opaca
        ? item.atributs.u_puerta_opaca.toFixed(3)
        : "--",
      name_ventana: item.atributs?.name_ventana ?? "--",
      porcentaje_vidrio: item.atributs?.porcentaje_vidrio ?? "--",
      u_marco: item.u_marco ? item.u_marco.toFixed(3) : "--",
      fm: item.fm ?? "--",
    }));

    return puertasTabList.length > 0 ? (
      <TablesParameters columns={columnsPuertas} data={puertasData} />
    ) : (
      <p>No hay datos</p>
    );
  };

  // ==================== RENDER PESTAÑAS (STEP 4) ====================
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
              {renderMurosTable()}
            </div>
          )}
          {tabStep4 === "techumbre" && (
            <div style={{ overflowX: "auto" }}>
              {renderTechumbreTable()}
            </div>
          )}
          {tabStep4 === "pisos" && (
            <div style={{ overflowX: "auto" }}>
              {renderPisosTable()}
            </div>
          )}
          {tabStep4 === "ventanas" && (
            <div style={{ overflowX: "auto" }}>
              {renderVentanasTable()}
            </div>
          )}
          {tabStep4 === "puertas" && (
            <div style={{ overflowX: "auto" }}>
              {renderPuertasTable()}
            </div>
          )}
        </div>
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

  // ==================== RENDER DETALLES INICIALES ====================
  const renderInitialDetails = () => {
    if (showTabsInStep4) return null;

    // Definimos columnas
    const columnsDetails = [
      { headerName: "Ubicación Detalle", field: "scantilon_location" },
      { headerName: "Nombre Detalle", field: "name_detail" },
      { headerName: "Material", field: "material" },
      { headerName: "Espesor capa (cm)", field: "layer_thickness" },
    ];

    // Filtramos según searchQuery
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
        <SearchParameters
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar..."
          onNew={() => {}}
          style={{ marginBottom: "1rem" }}
          showNewButton={false} // Solo vista, no "Nuevo"
        />
        <div className="mb-3">
          <div style={{ height: "400px", overflowY: "scroll" }}>
            {/* Reemplazamos la tabla manual por TablesParameters */}
            <TablesParameters columns={columnsDetails} data={filteredDetails} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
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

  // ==================== RENDER RECINTO ====================
  const renderRecinto = () => {
    return (
      <>
        <h5
          style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}
          className="mb-3"
        >
          Recinto
        </h5>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
        </div>
        <div style={{ height: "390px", overflowY: "scroll" }}>
          {/* Aquí podrías usar TablesParameters también si lo deseas */}
          <table className="table table-bordered ">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estado</th>
                <th>Nombre del Recinto</th>
                <th>Perfil de Ocupación</th>
                <th>Sensor CO2</th>
                <th>Altura Promedio</th>
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
        </div>
      </>
    );
  };

  // ==================== PASOS / SIDEBAR ====================
  const sidebarSteps = [
    {
      stepNumber: 1,
      iconName: "assignment_ind",
      title: "Agregar detalles de propietario / proyecto y clasificación de edificaciones",
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
  
  <div style={{ width: "100%" }}>
    {/* Bloque izquierdo: texto + botón */}
    <div className="d-flex align-items-center gap-3">
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
    

    {/* Bloque derecho: breadcrumb alineado a la derecha con ancho modificado */}
    <div className="ms-auto" style={{display: "flex"}}>
      <Breadcrumb
        items={[
          {
            title: "Vista De Proyecto",
            href: "/",
            active: true,
          },
        ]}
      />
    </div>
  </div>
  </div>
</Card>







        <Card>
        <div className="row">
  {/* Columna para Sidebar */}
  <div className="col-12 col-md-3">
    <AdminSidebar
      activeStep={step}
      steps={sidebarSteps}
      onClickAction={(route: string) => router.push(route)}
      onStepChange={() => {}}
    />
  </div>

  {/* Columna para contenido principafdsl */}
  <div className="col-12 col-md-9 p-4">
    {/* Contenido principal */}
    {step === 4 && (
      <>
        {showTabsInStep4 ? renderStep4Tabs() : renderInitialDetails()}
      </>
    )}
    {step === 7 && renderRecinto()}
  </div>
</div>

        </Card>
      </div>
    </>
  );
};

export default WorkFlowpar2viewPage;
