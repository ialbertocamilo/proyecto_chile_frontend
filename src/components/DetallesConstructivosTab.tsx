import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { constantUrlApiEndpoint } from "../../src/utils/constant-url-endpoint";

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

const DetallesConstructivosTab: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [tabStep4, setTabStep4] = useState<TabStep4>("muros");
  const [murosTabList, setMurosTabList] = useState<Detail[]>([]);
  const [techumbreTabList, setTechumbreTabList] = useState<Detail[]>([]);
  const [pisosTabList, setPisosTabList] = useState<Detail[]>([]);

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
      toast.warning("Token no encontrado. Inicia sesión.", { toastId: "token-warning" });
    }
    return token;
  };

  // Función genérica para obtener datos desde un endpoint
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

  useEffect(() => {
    setPrimaryColor(getCssVarValue("--primary-color", "#3ca7b7"));
  }, []);

  const fetchMurosDetails = useCallback(() => {
    fetchData<Detail[]>(
      `${constantUrlApiEndpoint}/details/all/Muro/`,
      (data) => {
        if (Array.isArray(data)) setMurosTabList(data);
      }
    );
  }, [fetchData]);

  const fetchTechumbreDetails = useCallback(() => {
    fetchData<Detail[]>(
      `${constantUrlApiEndpoint}/details/all/Techo/`,
      (data) => {
        if (Array.isArray(data)) setTechumbreTabList(data);
      }
    );
  }, [fetchData]);

  const fetchPisosDetails = useCallback(() => {
    fetchData<Detail[]>(
      `${constantUrlApiEndpoint}/details/all/Piso/`,
      (data) => {
        if (Array.isArray(data)) setPisosTabList(data);
      }
    );
  }, [fetchData]);

  useEffect(() => {
    if (tabStep4 === "muros") fetchMurosDetails();
    else if (tabStep4 === "techumbre") fetchTechumbreDetails();
    else if (tabStep4 === "pisos") fetchPisosDetails();
  }, [tabStep4, refreshTrigger, fetchMurosDetails, fetchTechumbreDetails, fetchPisosDetails]);

  return (
    <div style={{ overflow: "hidden", padding: "10px" }}>
      <div className="d-flex justify-content-between align-items-center mb-2" style={{ padding: "10px" }}>
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
                  color: tabStep4 === item.key ? "var(--primary-color)" : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: tabStep4 === item.key ? "solid var(--primary-color)" : "none",
                }}
                onClick={() => setTabStep4(item.key as TabStep4)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
        {tabStep4 === "muros" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Nombre Abreviado</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Valor U (W/m²K)</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Color Exterior</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Color Interior</th>
                </tr>
              </thead>
              <tbody>
                {murosTabList.length > 0 ? (
                  murosTabList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>{item.info?.surface_color?.exterior?.name || "Desconocido"}</td>
                      <td>{item.info?.surface_color?.interior?.name || "Desconocido"}</td>
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
        {tabStep4 === "techumbre" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Nombre Abreviado</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Valor U (W/m²K)</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Color Exterior</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Color Interior</th>
                </tr>
              </thead>
              <tbody>
                {techumbreTabList.length > 0 ? (
                  techumbreTabList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name_detail}</td>
                      <td>{item.value_u?.toFixed(3) ?? "--"}</td>
                      <td>{item.info?.surface_color?.exterior?.name || "Desconocido"}</td>
                      <td>{item.info?.surface_color?.interior?.name || "Desconocido"}</td>
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
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>Nombre</th>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>U [W/m²K]</th>
                  <th colSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>Aislamiento bajo piso</th>
                  <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor }}>Ref Aisl Vert.</th>
                  <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor }}>Ref Aisl Horiz.</th>
                </tr>
                <tr>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>I [W/mK]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>e Aisl [cm]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>I [W/mK]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>e Aisl [cm]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>D [cm]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>I [W/m²K]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>e Aisl [cm]</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>D [cm]</th>
                </tr>
              </thead>
              <tbody>
                {pisosTabList.length > 0 ? (
                  pisosTabList.map((item) => {
                    const bajoPiso = item.info?.aislacion_bajo_piso || {};
                    const vert = item.info?.ref_aisl_vertical || {};
                    const horiz = item.info?.ref_aisl_horizontal || {};
                    return (
                      <tr key={item.id}>
                        <td style={{ textAlign: "center" }}>{item.name_detail}</td>
                        <td style={{ textAlign: "center" }}>{item.value_u?.toFixed(3) ?? "--"}</td>
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
                    <td colSpan={10} style={{ textAlign: "center" }}>
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
