import React, { useState, useEffect } from "react";

// Interfaces para cada pestaña
interface Ventilacion {
  codigoRecinto: string;
  tipologiaRecinto: string;
  caudalMinSalubridad: {
    rPers: number;
    ida: number;
    ocupacion: number;
  };
  caudalImpuestoVentNoct: number;
}

interface Iluminacion {
  codigoRecinto: string;
  tipologiaRecinto: string;
  potenciaBase: number;
  estrategia: string;
  potenciaPropuesta: number;
}

interface CargasInternas {
  codigoRecinto: string;
  tipologiaRecinto: string;
  usuarios: number;
  calorLatente: number;
  calorSensible: number;
  equipos: number;
  funcionamientoSemanal: string;
}

interface HorarioClima {
  codigoRecinto: string;
  tipologiaRecinto: string;
  recinto: {
    climatizado: string; // "Si" o "No"
  };
  hrsDesfaseClimaInv: number;
}

// Estilos para encabezados "sticky"
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

// Función para obtener una variable CSS
const getCssVarValue = (varName: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
};

type TabKey = "ventilacion" | "iluminacion" | "cargas" | "horario";

const UseProfileTab: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [activeTab, setActiveTab] = useState<TabKey>("ventilacion");

  // Estados para almacenar los datos de cada pestaña (inicialmente vacíos)
  const [ventilacionData, setVentilacionData] = useState<Ventilacion[]>([]);
  const [iluminacionData, setIluminacionData] = useState<Iluminacion[]>([]);
  const [cargasData, setCargasData] = useState<CargasInternas[]>([]);
  const [horarioData, setHorarioData] = useState<HorarioClima[]>([]);

  // Aquí podrías integrar la lógica para obtener datos (fetchData) según se requiera

  useEffect(() => {
    setPrimaryColor(getCssVarValue("--primary-color", "#3ca7b7"));
  }, []);

  return (
    <div style={{ overflow: "hidden", padding: "10px" }}>
      {/* Navegación por pestañas */}
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
            { key: "ventilacion", label: "Ventilacion y caudales" },
            { key: "iluminacion", label: "Iluminacion" },
            { key: "cargas", label: "Cargas internas" },
            { key: "horario", label: "Horario y Clima" },
          ].map((item) => (
            <li key={item.key} style={{ flex: 1 }}>
              <button
                style={{
                  width: "100%",
                  padding: "0px",
                  backgroundColor: "#fff",
                  color:
                    activeTab === item.key
                      ? "var(--primary-color)"
                      : "var(--secondary-color)",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    activeTab === item.key ? "solid var(--primary-color)" : "none",
                }}
                onClick={() => setActiveTab(item.key as TabKey)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenedor de tablas */}
      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          overflowX: "auto",
          position: "relative",
        }}
      >
        {/* 1. Ventilacion y caudales */}
        {activeTab === "ventilacion" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Codigo de Recinto
                  </th>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Tipologia de Recinto
                  </th>
                  <th colSpan={3} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Caudal Min Salubridad
                  </th>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Caudal Impuesto Vent Noct
                  </th>
                </tr>
                <tr>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    R-pers [L/s]
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>IDA</th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>Ocupacion</th>
                </tr>
              </thead>
              <tbody>
                {ventilacionData.length > 0 ? (
                  ventilacionData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.codigoRecinto}</td>
                      <td>{item.tipologiaRecinto}</td>
                      <td>
                        {item.caudalMinSalubridad.rPers !== undefined
                          ? item.caudalMinSalubridad.rPers.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>
                        {item.caudalMinSalubridad.ida !== undefined
                          ? item.caudalMinSalubridad.ida.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>
                        {item.caudalMinSalubridad.ocupacion !== undefined
                          ? item.caudalMinSalubridad.ocupacion.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>
                        {item.caudalImpuestoVentNoct !== undefined
                          ? item.caudalImpuestoVentNoct.toFixed(2)
                          : "N/A"}
                      </td>
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
          </div>
        )}

        {/* 2. Iluminacion */}
        {activeTab === "iluminacion" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Codigo de Recinto
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Tipologia de Recinto
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Potencia Base [W/m2]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>Estrategia</th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Potencia Propuesta [W/m2]
                  </th>
                </tr>
              </thead>
              <tbody>
                {iluminacionData.length > 0 ? (
                  iluminacionData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.codigoRecinto}</td>
                      <td>{item.tipologiaRecinto}</td>
                      <td>
                        {item.potenciaBase !== undefined
                          ? item.potenciaBase.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>{item.estrategia}</td>
                      <td>
                        {item.potenciaPropuesta !== undefined
                          ? item.potenciaPropuesta.toFixed(2)
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Cargas internas */}
        {activeTab === "cargas" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Codigo de Recinto
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Tipologia de Recinto
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Usuarios [m2/pers]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Calor Latente [W/pers]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Calor Sensible [W/pers]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Equipos [W/m2]
                  </th>
                  <th style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Funcionamiento Semanal
                  </th>
                </tr>
              </thead>
              <tbody>
                {cargasData.length > 0 ? (
                  cargasData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.codigoRecinto}</td>
                      <td>{item.tipologiaRecinto}</td>
                      <td>
                        {item.usuarios !== undefined
                          ? item.usuarios.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>
                        {item.calorLatente !== undefined
                          ? item.calorLatente.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>
                        {item.calorSensible !== undefined
                          ? item.calorSensible.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>
                        {item.equipos !== undefined
                          ? item.equipos.toFixed(2)
                          : "N/A"}
                      </td>
                      <td>{item.funcionamientoSemanal}</td>
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
          </div>
        )}

        {/* 4. Horario y Clima */}
        {activeTab === "horario" && (
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Codigo de Recinto
                  </th>
                  <th rowSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Tipologia de Recinto
                  </th>
                  <th colSpan={2} style={{ ...stickyHeaderStyle1, color: primaryColor }}>
                    Recinto
                  </th>
                </tr>
                <tr>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    Climatizado Si/No
                  </th>
                  <th style={{ ...stickyHeaderStyle2, color: primaryColor }}>
                    Hrs Desfase Clima (Inv)
                  </th>
                </tr>
              </thead>
              <tbody>
                {horarioData.length > 0 ? (
                  horarioData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.codigoRecinto}</td>
                      <td>{item.tipologiaRecinto}</td>
                      <td>{item.recinto.climatizado || "N/A"}</td>
                      <td>
                        {item.hrsDesfaseClimaInv !== undefined
                          ? item.hrsDesfaseClimaInv.toFixed(2)
                          : "N/A"}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .table tbody tr {
          animation: fadeIn 0.5s ease;
        }
        .table thead th {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default UseProfileTab;
