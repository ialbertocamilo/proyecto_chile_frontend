import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import SearchParameters from "@/components/inputs/SearchParameters";
import { constantUrlApiEndpoint } from "../utils/constant-url-endpoint";

interface Ventilacion {
  codigoRecinto: string;
  tipologiaRecinto: string;
  caudalMinSalubridad: {
    rPers: number;
    ida: string;
    ocupacion: string;
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
    climatizado: string;
  };
  hrsDesfaseClimaInv: number;
}

type TabKey = "ventilacion" | "iluminacion" | "cargas" | "horario";

const UseProfileTab: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [activeTab, setActiveTab] = useState<TabKey>("ventilacion");
  const [rolUser, setRolUser] = useState<string>("");

  // Estados para almacenar los datos de cada pestaña
  const [ventilacionData, setVentilacionData] = useState<Ventilacion[]>([]);
  const [iluminacionData, setIluminacionData] = useState<Iluminacion[]>([]);
  const [cargasData, setCargasData] = useState<CargasInternas[]>([]);
  const [horarioData, setHorarioData] = useState<HorarioClima[]>([]);

  // Estados de búsqueda para cada tab
  const [searchVentilacion, setSearchVentilacion] = useState("");
  const [searchIluminacion, setSearchIluminacion] = useState("");
  const [searchCargas, setSearchCargas] = useState("");
  const [searchHorario, setSearchHorario] = useState("");

  // Función stub para el botón “+ Nuevo”
  const handleNuevoClick = (tab: TabKey) => {
    console.log(`Nuevo elemento para ${tab}`);
    // Aquí puedes abrir un modal o redirigir a una pantalla de creación
  };

  // Obtener el valor de la variable CSS --primary-color
  const getCssVarValue = (varName: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  };

  // Se ejecuta una sola vez para obtener el rol del usuario y el color primario
  useEffect(() => {
    setPrimaryColor(getCssVarValue("--primary-color", "#3ca7b7"));
    const roleId = localStorage.getItem("role_id");
    if (roleId === "1") {
      setRolUser("admin");
    } else if (roleId === "2") {
      setRolUser("user");
    }
  }, []);

  // 1. Ventilación y caudales
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=ventilation_flows`;
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        let enclosures = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        const mapped: Ventilacion[] = enclosures.map((enclosure: any) => {
          const condition = enclosure.building_conditions[0]?.details || {};
          const minSalubridad = condition.cauldal_min_salubridad || {};
          const rPers = minSalubridad.r_pers ?? 0;
          const ida = minSalubridad.ida || "";
          const ocupacion = minSalubridad.ocupacion || "";
          const caudalImpuestoVentNoct = condition.caudal_impuesto?.vent_noct ?? 0;
          return {
            codigoRecinto: enclosure.code,
            tipologiaRecinto: enclosure.name,
            caudalMinSalubridad: { rPers, ida, ocupacion },
            caudalImpuestoVentNoct,
          };
        });
        setVentilacionData(mapped);
      })
      .catch((err) => console.error("Error al obtener ventilacion:", err));
  }, [rolUser]);

  // 2. Iluminación
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=lightning`;
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        const mapped: Iluminacion[] = enclosures.map((enclosure: any) => {
          const condition = enclosure.building_conditions.find(
            (cond: any) => cond.type === "lightning"
          );
          const details = condition ? condition.details : {};
          return {
            codigoRecinto: enclosure.code,
            tipologiaRecinto: enclosure.name,
            potenciaBase: details.potencia_base || 0,
            estrategia: details.estrategia || "",
            potenciaPropuesta: details.potencia_propuesta || 0,
          };
        });
        setIluminacionData(mapped);
      })
      .catch((err) => console.error("Error al obtener iluminacion:", err));
  }, [rolUser]);

  // 3. Cargas internas
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=internal_loads`;
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        const mapped: CargasInternas[] = enclosures.map((enclosure: any) => {
          const condition = enclosure.building_conditions[0]?.details || {};
          return {
            codigoRecinto: enclosure.code,
            tipologiaRecinto: enclosure.name,
            usuarios: condition.usuarios || 0,
            calorLatente: condition.calor_latente || 0,
            calorSensible: condition.calor_sensible || 0,
            equipos: condition.equipos || 0,
            funcionamientoSemanal: condition.horario?.funcionamiento_semanal || "",
          };
        });
        setCargasData(mapped);
      })
      .catch((err) => console.error("Error al obtener cargas internas:", err));
  }, [rolUser]);

  // 4. Horario y Clima
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=schedule_weather`;
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        const mapped: HorarioClima[] = enclosures.map((enclosure: any) => {
          const details = enclosure.building_conditions[0]?.details || {};
          const recinto = details.recinto || {};
          return {
            codigoRecinto: enclosure.code,
            tipologiaRecinto: enclosure.name,
            recinto: { climatizado: recinto.climatizado || "N/A" },
            hrsDesfaseClimaInv: recinto.desfase_clima || 0,
          };
        });
        setHorarioData(mapped);
      })
      .catch((err) => console.error("Error al obtener horario y clima:", err));
  }, [rolUser]);

  // Mapeo de datos para cada tabla
  const ventilacionMappedData = ventilacionData.map((item) => ({
    codigoRecinto: item.codigoRecinto,
    tipologiaRecinto: item.tipologiaRecinto,
    rPers: item.caudalMinSalubridad.rPers !== undefined
      ? item.caudalMinSalubridad.rPers.toFixed(2)
      : "N/A",
    ida: item.caudalMinSalubridad.ida || "N/A",
    ocupacion: item.caudalMinSalubridad.ocupacion || "N/A",
    caudalImpuestoVentNoct: item.caudalImpuestoVentNoct !== undefined
      ? item.caudalImpuestoVentNoct.toFixed(2)
      : "N/A",
  }));

  const iluminacionMappedData = iluminacionData.map((item) => ({
    codigoRecinto: item.codigoRecinto,
    tipologiaRecinto: item.tipologiaRecinto,
    potenciaBase: item.potenciaBase !== undefined ? item.potenciaBase.toFixed(2) : "N/A",
    estrategia: item.estrategia,
    potenciaPropuesta: item.potenciaPropuesta !== undefined
      ? item.potenciaPropuesta.toFixed(2)
      : "N/A",
  }));

  const cargasMappedData = cargasData.map((item) => ({
    codigoRecinto: item.codigoRecinto,
    tipologiaRecinto: item.tipologiaRecinto,
    usuarios: item.usuarios !== undefined ? item.usuarios.toFixed(2) : "N/A",
    calorLatente: item.calorLatente !== undefined ? item.calorLatente.toFixed(2) : "N/A",
    calorSensible: item.calorSensible !== undefined ? item.calorSensible.toFixed(2) : "N/A",
    equipos: item.equipos !== undefined ? item.equipos.toFixed(2) : "N/A",
    funcionamientoSemanal: item.funcionamientoSemanal,
  }));

  const horarioMappedData = horarioData.map((item) => ({
    codigoRecinto: item.codigoRecinto,
    tipologiaRecinto: item.tipologiaRecinto,
    climatizado: item.recinto.climatizado || "N/A",
    hrsDesfaseClimaInv: item.hrsDesfaseClimaInv !== undefined
      ? item.hrsDesfaseClimaInv.toFixed(2)
      : "N/A",
  }));

  // Filtrado de data según el input de búsqueda para cada pestaña
  const filteredVentilacion = ventilacionMappedData.filter((item) =>
    item.codigoRecinto.toLowerCase().includes(searchVentilacion.toLowerCase()) ||
    item.tipologiaRecinto.toLowerCase().includes(searchVentilacion.toLowerCase())
  );
  const filteredIluminacion = iluminacionMappedData.filter((item) =>
    item.codigoRecinto.toLowerCase().includes(searchIluminacion.toLowerCase()) ||
    item.tipologiaRecinto.toLowerCase().includes(searchIluminacion.toLowerCase())
  );
  const filteredCargas = cargasMappedData.filter((item) =>
    item.codigoRecinto.toLowerCase().includes(searchCargas.toLowerCase()) ||
    item.tipologiaRecinto.toLowerCase().includes(searchCargas.toLowerCase())
  );
  const filteredHorario = horarioMappedData.filter((item) =>
    item.codigoRecinto.toLowerCase().includes(searchHorario.toLowerCase()) ||
    item.tipologiaRecinto.toLowerCase().includes(searchHorario.toLowerCase())
  );

  // Definición de columnas para cada tabla
  const columnsVentilacion = [
    { headerName: "Codigo de Recinto", field: "codigoRecinto" },
    { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
    { headerName: "R-pers [L/s]", field: "rPers" },
    { headerName: "IDA", field: "ida" },
    { headerName: "Ocupacion", field: "ocupacion" },
    { headerName: "Caudal Impuesto Vent Noct", field: "caudalImpuestoVentNoct" },
  ];

  const columnsIluminacion = [
    { headerName: "Codigo de Recinto", field: "codigoRecinto" },
    { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
    { headerName: "Potencia Base [W/m2]", field: "potenciaBase" },
    { headerName: "Estrategia", field: "estrategia" },
    { headerName: "Potencia Propuesta [W/m2]", field: "potenciaPropuesta" },
  ];

  const columnsCargas = [
    { headerName: "Codigo de Recinto", field: "codigoRecinto" },
    { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
    { headerName: "Usuarios [m2/pers]", field: "usuarios" },
    { headerName: "Calor Latente [W/pers]", field: "calorLatente" },
    { headerName: "Calor Sensible [W/pers]", field: "calorSensible" },
    { headerName: "Equipos [W/m2]", field: "equipos" },
    { headerName: "Funcionamiento Semanal", field: "funcionamientoSemanal" },
  ];

  const columnsHorario = [
    { headerName: "Codigo de Recinto", field: "codigoRecinto" },
    { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
    { headerName: "Climatizado", field: "climatizado" },
    { headerName: "Hrs Desfase Clima (Inv)", field: "hrsDesfaseClimaInv" },
  ];

  // Propiedades de búsqueda según la pestaña activa
  const getSearchProps = () => {
    switch (activeTab) {
      case "ventilacion":
        return {
          value: searchVentilacion,
          onChange: setSearchVentilacion,
          onNew: () => handleNuevoClick("ventilacion"),
          placeholder: "Buscar recinto..."
        };
      case "iluminacion":
        return {
          value: searchIluminacion,
          onChange: setSearchIluminacion,
          onNew: () => handleNuevoClick("iluminacion"),
          placeholder: "Buscar recinto..."
        };
      case "cargas":
        return {
          value: searchCargas,
          onChange: setSearchCargas,
          onNew: () => handleNuevoClick("cargas"),
          placeholder: "Buscar recinto..."
        };
      case "horario":
        return {
          value: searchHorario,
          onChange: setSearchHorario,
          onNew: () => handleNuevoClick("horario"),
          placeholder: "Buscar recinto..."
        };
      default:
        return {
          value: "",
          onChange: () => {},
          onNew: () => {},
          placeholder: "Buscar recinto..."
        };
    }
  };

  return (
    <div className="p-3">
      {/* Contenedor de la barra de búsqueda (estilo similar al de la lista de materiales) */}
      <div className="mb-4">
        <SearchParameters {...getSearchProps()} />
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-2 px-2">
        <ul className="d-flex list-unstyled m-0" style={{ gap: "10px" }}>
          {[
            { key: "ventilacion", label: "Ventilacion y caudales" },
            { key: "iluminacion", label: "Iluminacion" },
            { key: "cargas", label: "Cargas internas" },
            { key: "horario", label: "Horario y Clima" },
          ].map((item) => (
            <li key={item.key} className="flex-fill">
              <button
                className="w-100 p-0"
                style={{
                  backgroundColor: "#fff",
                  color: activeTab === item.key ? primaryColor : "var(--secondary-color)",
                  border: "none",
                  borderBottom: activeTab === item.key ? `solid 2px ${primaryColor}` : "none",
                }}
                onClick={() => setActiveTab(item.key as TabKey)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenedor de la tabla */}
      <div className="overflow-auto" style={{ maxHeight: "500px" }}>
        {activeTab === "ventilacion" && (
          <div className="p-2">
            <TablesParameters columns={columnsVentilacion} data={filteredVentilacion} />
          </div>
        )}

        {activeTab === "iluminacion" && (
          <div className="p-2">
            <TablesParameters columns={columnsIluminacion} data={filteredIluminacion} />
          </div>
        )}

        {activeTab === "cargas" && (
          <div className="p-2">
            <TablesParameters columns={columnsCargas} data={filteredCargas} />
          </div>
        )}

        {activeTab === "horario" && (
          <div className="p-2">
            <TablesParameters columns={columnsHorario} data={filteredHorario} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UseProfileTab;
