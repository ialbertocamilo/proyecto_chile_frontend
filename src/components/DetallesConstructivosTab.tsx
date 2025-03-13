import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { constantUrlApiEndpoint } from "../../src/utils/constant-url-endpoint";
// Importas tu componente de tablas
import TablesParameters from "../components/tables/TablesParameters";

interface Detail {
  id: number;
  name_detail: string;
  value_u?: number;
  project_id?: number;
  type?: string;
  created_status?: string;
  calculations?: {
    km_op?: number;
    cat_ceeup?: string;
    fourier_nodes?: number;
    espesor_aislacion?: number;
    position_insulation?: string;
  };
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

type TabStep4 = "muros" | "techumbre" | "pisos";

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

const DetallesConstructivosTab: React.FC<{ refreshTrigger?: number }> = ({
  refreshTrigger = 0,
}) => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [tabStep4, setTabStep4] = useState<TabStep4>("muros");
  const [murosTabList, setMurosTabList] = useState<Detail[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<Detail[]>([]);
  const [pisosTabList, setPisosTabList] = useState<Detail[]>([]);

  // 1. Columnas y data para Muros y Techumbre (comparten mismas columnas)
  const commonColumns = [
    { headerName: "Nombre Abreviado", field: "name_detail" },
    { headerName: "Valor U (W/m²K)", field: "value_u" },
    { headerName: "Color Exterior", field: "color_exterior" },
    { headerName: "Color Interior", field: "color_interior" },
  ];

  const murosData = murosTabList.map((item) => ({
    name_detail: item.name_detail,
    value_u: item.value_u?.toFixed(3) ?? "--",
    color_exterior:
      item.info?.surface_color?.exterior?.name || "Desconocido",
    color_interior:
      item.info?.surface_color?.interior?.name || "Desconocido",
  }));

  const techumbreData = techumbreTabList.map((item) => ({
    name_detail: item.name_detail,
    value_u: item.value_u?.toFixed(3) ?? "--",
    color_exterior:
      item.info?.surface_color?.exterior?.name || "Desconocido",
    color_interior:
      item.info?.surface_color?.interior?.name || "Desconocido",
  }));

  // 2. Columnas + data para Pisos (con multi-header)
  //    A) Defino el 'multiHeader' para armar el encabezado de dos filas
  const pisosMultiHeader = {
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

  //    B) Defino columnas base (10 columnas)
  const pisosColumns = [
    { headerName: "Nombre", field: "name_detail" },
    { headerName: "U [W/m²K]", field: "value_u" },
    { headerName: "I [W/mK]", field: "bajoPiso_lambda" },
    { headerName: "e Aisl [cm]", field: "bajoPiso_e_aisl" },
    { headerName: "I [W/mK]", field: "vert_lambda" },
    { headerName: "e Aisl [cm]", field: "vert_e_aisl" },
    { headerName: "D [cm]", field: "vert_d" },
    { headerName: "I [W/mK]", field: "horiz_lambda" },
    { headerName: "e Aisl [cm]", field: "horiz_e_aisl" },
    { headerName: "D [cm]", field: "horiz_d" },
  ];

  //    C) Transformo cada fila con la data concreta
  const pisosData = pisosTabList.map((item) => {
    const bajoPiso = item.info?.aislacion_bajo_piso || {};
    const vert = item.info?.ref_aisl_vertical || {};
    const horiz = item.info?.ref_aisl_horizontal || {};

    return {
      name_detail: item.name_detail,
      value_u: item.value_u?.toFixed(3) ?? "--",
      bajoPiso_lambda: bajoPiso.lambda
        ? bajoPiso.lambda.toFixed(3)
        : "N/A",
      bajoPiso_e_aisl: bajoPiso.e_aisl ?? "N/A",
      vert_lambda: vert.lambda ? vert.lambda.toFixed(3) : "N/A",
      vert_e_aisl: vert.e_aisl ?? "N/A",
      vert_d: vert.d ?? "N/A",
      horiz_lambda: horiz.lambda ? horiz.lambda.toFixed(3) : "N/A",
      horiz_e_aisl: horiz.e_aisl ?? "N/A",
      horiz_d: horiz.d ?? "N/A",
    };
  });

  // Función para obtener el valor de una variable CSS
  const getCssVarValue = (varName: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  };

  // Obtención del token de autenticación
  const getToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Token no encontrado. Inicia sesión.", {
        toastId: "token-warning",
      });
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
      } catch (error) {
        console.error(`Error al obtener datos desde ${endpoint}:`, error);
      }
    },
    []
  );

  // useEffect para extraer color principal
  useEffect(() => {
    setPrimaryColor(getCssVarValue("--primary-color", "#3ca7b7"));
  }, []);

  // Fetch muros, techumbre, pisos
  const fetchMurosDetails = useCallback(() => {
    fetchData<Detail[]>(`${constantUrlApiEndpoint}/details/all/Muro/`, (data) => {
      if (Array.isArray(data)) setMurosTabList(data);
    });
  }, [fetchData]);

  const fetchTechumbreDetails = useCallback(() => {
    fetchData<Detail[]>(`${constantUrlApiEndpoint}/details/all/Techo/`, (data) => {
      if (Array.isArray(data)) setTechumbreTabList(data);
    });
  }, [fetchData]);

  const fetchPisosDetails = useCallback(() => {
    fetchData<Detail[]>(`${constantUrlApiEndpoint}/details/all/Piso/`, (data) => {
      if (Array.isArray(data)) setPisosTabList(data);
    });
  }, [fetchData]);

  // Cada vez que cambie la pestaña o refreshTrigger, recargo la data
  useEffect(() => {
    if (tabStep4 === "muros") {
      fetchMurosDetails();
    } else if (tabStep4 === "techumbre") {
      fetchTechumbreDetails();
    } else if (tabStep4 === "pisos") {
      fetchPisosDetails();
    }
  }, [
    tabStep4,
    refreshTrigger,
    fetchMurosDetails,
    fetchTechumbreDetails,
    fetchPisosDetails,
  ]);

  return (
    <div style={{ overflow: "hidden", padding: "10px" }}>
      {/* Pestañas de Muros, Techumbre, Pisos */}
      <div
        className="d-flex justify-content-between align-items-center mb-2"
        style={{ padding: "10px" }}
      >
        <ul
          style={{
            display: "flex",
            padding: 0,
            listStyle: "none",
            margin: 0,
            flex: 1,
            gap: "10px",
          }}
        >
          {[
            { key: "muros", label: "Muros" },
            { key: "techumbre", label: "Techumbre" },
            { key: "pisos", label: "Pisos" },
          ].map((item) => (
            <li key={item.key} style={{ flex: 1 }}>
              <button
                style={{
                  width: "100%",
                  padding: "0px",
                  backgroundColor: "#fff",
                  color:
                    tabStep4 === item.key
                      ? "var(--primary-color)"
                      : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    tabStep4 === item.key
                      ? "solid var(--primary-color)"
                      : "none",
                }}
                onClick={() => setTabStep4(item.key as TabStep4)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenido de la pestaña actual */}
      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          overflowX: "auto",
          position: "relative",
        }}
      >
        {tabStep4 === "muros" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <TablesParameters
              columns={commonColumns}
              data={murosData}
            />
          </div>
        )}

        {tabStep4 === "techumbre" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <TablesParameters
              columns={commonColumns}
              data={techumbreData}
            />
          </div>
        )}

        {tabStep4 === "pisos" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            {/* Uso de multiHeader para recrear el encabezado de 2 filas */}
            <TablesParameters
              columns={pisosColumns}
              data={pisosData}
              multiHeader={pisosMultiHeader}
            />
          </div>
        )}
      </div>

      {/* Estilos opcionales */}
      <style jsx>{`
        .table th,
        .table td {
          text-align: center;
          vertical-align: middle;
          padding: 0.5rem;
        }
        .table thead th {
          position: sticky;
          top: 0;
          background-color: #fff;
          color: var(--primary-color);
          z-index: 2;
        }
        .table-striped tbody tr:nth-child(odd),
        .table-striped tbody tr:nth-child(even) {
          background-color: #ffffff;
        }
        .table tbody tr:hover {
          transform: scale(1.01);
          background-color: rgba(60, 167, 183, 0.05) !important;
          cursor: pointer;
        }
        .table {
          transition: opacity 0.3s ease;
        }
        .table tbody tr {
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .form-control {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(60, 167, 183, 0.25);
        }
        button {
          transition: all 0.3s ease !important;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .table-bordered {
          border: 1px solid #dee2e6;
        }
        .table-bordered th,
        .table-bordered td {
          border: 1px solid #dee2e6;
        }
        .table-striped tbody tr:nth-of-type(odd) {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .table tbody tr {
          animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .table thead th {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default DetallesConstructivosTab;
