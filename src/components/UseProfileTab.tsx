import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import SearchParameters from "@/components/inputs/SearchParameters";
import { constantUrlApiEndpoint } from "../utils/constant-url-endpoint";
import ModalCreate from "../components/common/ModalCreate";
import { notify } from "@/utils/notify";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";

// Interfaces originales de datos (como vienen de la API)
interface Ventilacion {
  id: string;
  code: string;
  name: string;
  building_conditions: any[];
}

interface Iluminacion {
  id: string;
  code: string;
  name: string;
  building_conditions: any[];
}

interface CargasInternas {
  id: string;
  code: string;
  name: string;
  building_conditions: any[];
}

interface HorarioClima {
  id: string;
  code: string;
  name: string;
  building_conditions: any[];
}

// Tipos para las pestañas
type TabKey = "ventilacion" | "iluminacion" | "cargas" | "horario";

// Tipo para la fila en edición
interface EditingRow {
  id: string;
  tab: TabKey;
  values: any;
  original: any;
}

const UseProfileTab: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [activeTab, setActiveTab] = useState<TabKey>("ventilacion");
  const [rolUser, setRolUser] = useState<string>("");

  // Estados para almacenar datos crudos (raw) de cada pestaña
  const [ventilacionRaw, setVentilacionRaw] = useState<Ventilacion[]>([]);
  const [iluminacionRaw, setIluminacionRaw] = useState<Iluminacion[]>([]);
  const [cargasRaw, setCargasRaw] = useState<CargasInternas[]>([]);
  const [horarioRaw, setHorarioRaw] = useState<HorarioClima[]>([]);

  // Estados de búsqueda para cada pestaña
  const [searchVentilacion, setSearchVentilacion] = useState("");
  const [searchIluminacion, setSearchIluminacion] = useState("");
  const [searchCargas, setSearchCargas] = useState("");
  const [searchHorario, setSearchHorario] = useState("");

  // Estado para el modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRecintoName, setNewRecintoName] = useState("");

  // Estado para refrescar las tablas
  const [refresh, setRefresh] = useState(0);

  // Estado para llevar el registro de la fila que se está editando
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);

  // Función para abrir el modal
  const handleNuevoClick = (tab: TabKey) => {
    console.log(`Nuevo elemento para ${tab}`);
    setIsCreateModalOpen(true);
  };

  // Función para realizar el POST y crear un nuevo recinto
  const handleCreateSave = () => {
    const token = localStorage.getItem("token");
    if (!token || !rolUser) return;
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing-create/`;
    fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newRecintoName }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Creación exitosa", data);
        notify("Recinto creado exitosamente");
        setIsCreateModalOpen(false);
        setNewRecintoName("");
        setRefresh((prev) => prev + 1);
      })
      .catch((err) => console.error("Error al crear recinto", err));
  };

  // Función para obtener un valor CSS
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
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures: any[] = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        setVentilacionRaw(enclosures);
      })
      .catch((err) => console.error("Error al obtener ventilacion:", err));
  }, [rolUser, refresh]);

  // 2. Iluminación
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=lightning`;
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures: any[] = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        setIluminacionRaw(enclosures);
      })
      .catch((err) => console.error("Error al obtener iluminacion:", err));
  }, [rolUser, refresh]);

  // 3. Cargas internas
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=internal_loads`;
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures: any[] = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        setCargasRaw(enclosures);
      })
      .catch((err) => console.error("Error al obtener cargas internas:", err));
  }, [rolUser, refresh]);

  // 4. Horario y Clima
  useEffect(() => {
    if (!rolUser) return;
    const token = localStorage.getItem("token");
    const url = `${constantUrlApiEndpoint}/${rolUser}/enclosures-typing/?type=schedule_weather`;
    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        let enclosures: any[] = [];
        if (Array.isArray(data)) {
          enclosures = data;
        } else if (Array.isArray(data.results)) {
          enclosures = data.results;
        } else {
          console.error("Formato de respuesta no esperado:", data);
        }
        setHorarioRaw(enclosures);
      })
      .catch((err) => console.error("Error al obtener horario y clima:", err));
  }, [rolUser, refresh]);

  // Handlers para edición
  const handleStartEdit = (tab: TabKey, enclosure: any, initialValues: any) => {
    // Incluimos el valor de rPers para que se muestre igual que "Tipologia de Recinto"
    setEditingRow({
      id: enclosure.id,
      tab,
      values: {
        ...initialValues,
        // Se fuerza el valor de rPers a lo que muestra la API
        rPers: (enclosure.building_conditions[0]?.details?.cauldal_min_salubridad?.r_pers ?? 0).toFixed(2)
      },
      original: enclosure,
    });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditingRow((prev) =>
      prev ? { ...prev, values: { ...prev.values, [field]: value } } : null
    );
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  // Función para guardar la edición, construyendo el payload según la pestaña
  const handleSave = (tab: TabKey, enclosure: any) => {
    if (!editingRow) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    let payload: any = {};
    if (tab === "ventilacion") {
      payload = {
        type: "ventilation_flows",
        attributes: {
          cauldal_min_salubridad: {
            ida: editingRow.values.ida,
            ocupacion: editingRow.values.ocupacion,
          },
          caudal_impuesto: {
            vent_noct: parseFloat(editingRow.values.caudalImpuestoVentNoct),
          },
          infiltraciones: 0,
          recuperador_calor: 0,
        },
      };
    } else if (tab === "iluminacion") {
      payload = {
        type: "lightning",
        attributes: {
          potencia_base: parseFloat(editingRow.values.potenciaBase),
          estrategia: editingRow.values.estrategia,
          potencia_propuesta: parseFloat(editingRow.values.potenciaPropuesta),
        },
      };
    } else if (tab === "cargas") {
      payload = {
        type: "internal_loads",
        attributes: {
          usuarios: parseFloat(editingRow.values.usuarios),
          calor_latente: parseFloat(editingRow.values.calorLatente),
          calor_sensible: parseFloat(editingRow.values.calorSensible),
          equipos: parseFloat(editingRow.values.equipos),
          horario: {
            funcionamiento_semanal: editingRow.values.funcionamientoSemanal,
            laboral: {
              inicio: 0,
              fin: 0,
            },
          },
        },
      };
    } else if (tab === "horario") {
      payload = {
        type: "schedule_weather",
        attributes: {
          recinto: {
            climatizado: editingRow.values.climatizado,
            desfase_clima: parseFloat(editingRow.values.hrsDesfaseClimaInv),
          },
        },
      };
    }

    const url = `${constantUrlApiEndpoint}/building_condition/${enclosure.id}/update?section=${rolUser}`;

    fetch(url, {
      method: "PUT",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        notify(data.message || "Actualización exitosa");
        setEditingRow(null);
        setRefresh((prev) => prev + 1);
      })
      .catch((err) => console.error("Error en actualización:", err));
  };

  // Funciones para construir cada fila de tabla según el tipo de dato

  // En mapVentilacionRow, el campo "R-pers [L/s]" se muestra siempre como texto,
  // de la misma forma que "Tipologia de Recinto", sin posibilidad de edición.
  const mapVentilacionRow = (enclosure: any) => {
    const condition = enclosure.building_conditions[0]?.details || {};
    const minSalubridad = condition.cauldal_min_salubridad || {};
    const isEditing =
      editingRow &&
      editingRow.id === enclosure.id &&
      editingRow.tab === "ventilacion";
    // Se obtiene el valor de R-pers directamente de la API, sin condicionar la edición
    const rPersValue = (minSalubridad.r_pers ?? 0).toFixed(2);
    const values = isEditing
      ? editingRow.values
      : {
          // rPers se utiliza el valor directo obtenido
          rPers: rPersValue,
          ida: minSalubridad.ida || "N/A",
          ocupacion: minSalubridad.ocupacion || "N/A",
          caudalImpuestoVentNoct: (condition.caudal_impuesto?.vent_noct ?? 0).toFixed(2),
        };

    return {
      codigoRecinto: enclosure.code,
      tipologiaRecinto: enclosure.name,
      // R-pers se muestra siempre igual, sin importar el modo de edición
      rPers: rPersValue,
      // Campo IDA se renderiza como desplegable en modo edición
      ida: isEditing ? (
        <select
          className="form-control form-control-sm"
          value={editingRow.values.ida}
          onChange={(e) => handleEditChange("ida", e.target.value)}
        >
          <option value="IDA1">IDA1</option>
          <option value="IDA2">IDA2</option>
          <option value="IDA3">IDA3</option>
        </select>
      ) : (
        values.ida
      ),
      // Campo Ocupacion se renderiza como desplegable en modo edición
      ocupacion: isEditing ? (
        <select
          className="form-control form-control-sm"
          value={editingRow.values.ocupacion}
          onChange={(e) => handleEditChange("ocupacion", e.target.value)}
        >
          <option value="Ejercicio Bajo">Ejercicio Bajo</option>
          <option value="Ejercicio Medio">Ejercicio Medio</option>
          <option value="Ejercicio Alto">Ejercicio Alto</option>
          <option value="Jardin Infantil">Jardin Infantil</option>
          <option value="Colegio">Colegio</option>
          <option value="Sedentario">Sedentario</option>
        </select>
      ) : (
        values.ocupacion
      ),
      caudalImpuestoVentNoct: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.caudalImpuestoVentNoct}
          onChange={(e) => handleEditChange("caudalImpuestoVentNoct", e.target.value)}
        />
      ) : (
        values.caudalImpuestoVentNoct
      ),
      accion: isEditing ? (
        <ActionButtonsConfirm
          onAccept={() => handleSave("ventilacion", enclosure)}
          onCancel={handleCancelEdit}
        />
      ) : (
        <ActionButtons
          onEdit={() =>
            handleStartEdit("ventilacion", enclosure, {
              ida: minSalubridad.ida || "",
              ocupacion: minSalubridad.ocupacion || "",
              caudalImpuestoVentNoct: condition.caudal_impuesto?.vent_noct || 0,
            })
          }
          onDelete={() => console.log("Eliminar", enclosure)}
        />
      ),
    };
  };

  const mapIluminacionRow = (enclosure: any) => {
    const condition = enclosure.building_conditions.find(
      (cond: any) => cond.type === "lightning"
    );
    const details = condition ? condition.details : {};
    const isEditing =
      editingRow &&
      editingRow.id === enclosure.id &&
      editingRow.tab === "iluminacion";
    const values = isEditing
      ? editingRow.values
      : {
          potenciaBase: (details.potencia_base ?? 0).toFixed(2),
          estrategia: details.estrategia || "",
          potenciaPropuesta: (details.potencia_propuesta ?? 0).toFixed(2),
        };

    return {
      codigoRecinto: enclosure.code,
      tipologiaRecinto: enclosure.name,
      potenciaBase: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.potenciaBase}
          onChange={(e) => handleEditChange("potenciaBase", e.target.value)}
        />
      ) : (
        values.potenciaBase
      ),
      estrategia: isEditing ? (
        <select
          className="form-control form-control-sm"
          value={editingRow.values.estrategia}
          onChange={(e) => handleEditChange("estrategia", e.target.value)}
        >
          <option value="Sin estrategia">Sin estrategia</option>
          <option value="Dimmer">Dimmer</option>
          <option value="Sectorizacion">Sectorizacion</option>
          <option value="Sensor de Luz Nat">Sensor de Luz Nat</option>
        </select>
      ) : (
        values.estrategia
      ),
      potenciaPropuesta: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.potenciaPropuesta}
          onChange={(e) => handleEditChange("potenciaPropuesta", e.target.value)}
        />
      ) : (
        values.potenciaPropuesta
      ),
      accion: isEditing ? (
        <ActionButtonsConfirm
          onAccept={() => handleSave("iluminacion", enclosure)}
          onCancel={handleCancelEdit}
        />
      ) : (
        <ActionButtons
          onEdit={() =>
            handleStartEdit("iluminacion", enclosure, {
              potenciaBase: details.potencia_base || 0,
              estrategia: details.estrategia || "",
              potenciaPropuesta: details.potencia_propuesta || 0,
            })
          }
          onDelete={() => console.log("Eliminar", enclosure)}
        />
      ),
    };
  };

  const mapCargasRow = (enclosure: any) => {
    const condition = enclosure.building_conditions[0]?.details || {};
    const isEditing =
      editingRow &&
      editingRow.id === enclosure.id &&
      editingRow.tab === "cargas";
    const values = isEditing
      ? editingRow.values
      : {
          usuarios: (condition.usuarios ?? 0).toFixed(2),
          calorLatente: (condition.calor_latente ?? 0).toFixed(2),
          calorSensible: (condition.calor_sensible ?? 0).toFixed(2),
          equipos: (condition.equipos ?? 0).toFixed(2),
          funcionamientoSemanal: condition.horario?.funcionamiento_semanal || "",
        };

    return {
      codigoRecinto: enclosure.code,
      tipologiaRecinto: enclosure.name,
      usuarios: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.usuarios}
          onChange={(e) => handleEditChange("usuarios", e.target.value)}
        />
      ) : (
        values.usuarios
      ),
      calorLatente: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.calorLatente}
          onChange={(e) => handleEditChange("calorLatente", e.target.value)}
        />
      ) : (
        values.calorLatente
      ),
      calorSensible: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.calorSensible}
          onChange={(e) => handleEditChange("calorSensible", e.target.value)}
        />
      ) : (
        values.calorSensible
      ),
      equipos: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.equipos}
          onChange={(e) => handleEditChange("equipos", e.target.value)}
        />
      ) : (
        values.equipos
      ),
      funcionamientoSemanal: isEditing ? (
        <input
          type="text"
          className="form-control form-control-sm"
          value={editingRow.values.funcionamientoSemanal}
          onChange={(e) => handleEditChange("funcionamientoSemanal", e.target.value)}
        />
      ) : (
        values.funcionamientoSemanal
      ),
      accion: isEditing ? (
        <ActionButtonsConfirm
          onAccept={() => handleSave("cargas", enclosure)}
          onCancel={handleCancelEdit}
        />
      ) : (
        <ActionButtons
          onEdit={() =>
            handleStartEdit("cargas", enclosure, {
              usuarios: condition.usuarios || 0,
              calorLatente: condition.calor_latente || 0,
              calorSensible: condition.calor_sensible || 0,
              equipos: condition.equipos || 0,
              funcionamientoSemanal: condition.horario?.funcionamiento_semanal || "",
            })
          }
          onDelete={() => console.log("Eliminar", enclosure)}
        />
      ),
    };
  };

  const mapHorarioRow = (enclosure: any) => {
    const details = enclosure.building_conditions[0]?.details || {};
    const recinto = details.recinto || { climatizado: "N/A", desfase_clima: 0 };
    const isEditing =
      editingRow &&
      editingRow.id === enclosure.id &&
      editingRow.tab === "horario";
    const values = isEditing
      ? editingRow.values
      : {
          climatizado: recinto.climatizado,
          hrsDesfaseClimaInv: recinto.desfase_clima ? recinto.desfase_clima.toFixed(2) : "N/A",
        };

    return {
      codigoRecinto: enclosure.code,
      tipologiaRecinto: enclosure.name,
      climatizado: isEditing ? (
        <select
          className="form-control form-control-sm"
          value={editingRow.values.climatizado}
          onChange={(e) => handleEditChange("climatizado", e.target.value)}
        >
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
      ) : (
        values.climatizado
      ),
      hrsDesfaseClimaInv: isEditing ? (
        <input
          type="number"
          className="form-control form-control-sm"
          value={editingRow.values.hrsDesfaseClimaInv}
          onChange={(e) => handleEditChange("hrsDesfaseClimaInv", e.target.value)}
        />
      ) : (
        values.hrsDesfaseClimaInv
      ),
      accion: isEditing ? (
        <ActionButtonsConfirm
          onAccept={() => handleSave("horario", enclosure)}
          onCancel={handleCancelEdit}
        />
      ) : (
        <ActionButtons
          onEdit={() =>
            handleStartEdit("horario", enclosure, {
              climatizado: recinto.climatizado || "",
              hrsDesfaseClimaInv: recinto.desfase_clima || 0,
            })
          }
          onDelete={() => console.log("Eliminar", enclosure)}
        />
      ),
    };
  };

  // Filtrado según búsqueda
  const filteredVentilacion = ventilacionRaw
    .filter((item) =>
      item.code.toLowerCase().includes(searchVentilacion.toLowerCase()) ||
      item.name.toLowerCase().includes(searchVentilacion.toLowerCase())
    )
    .map(mapVentilacionRow);

  const filteredIluminacion = iluminacionRaw
    .filter((item) =>
      item.code.toLowerCase().includes(searchIluminacion.toLowerCase()) ||
      item.name.toLowerCase().includes(searchIluminacion.toLowerCase())
    )
    .map(mapIluminacionRow);

  const filteredCargas = cargasRaw
    .filter((item) =>
      item.code.toLowerCase().includes(searchCargas.toLowerCase()) ||
      item.name.toLowerCase().includes(searchCargas.toLowerCase())
    )
    .map(mapCargasRow);

  const filteredHorario = horarioRaw
    .filter((item) =>
      item.code.toLowerCase().includes(searchHorario.toLowerCase()) ||
      item.name.toLowerCase().includes(searchHorario.toLowerCase())
    )
    .map(mapHorarioRow);

  // Propiedades de búsqueda según pestaña activa
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
      {/* Barra de búsqueda */}
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
            <TablesParameters
              columns={[
                { headerName: "Codigo de Recinto", field: "codigoRecinto" },
                { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
                { headerName: "R-pers [L/s]", field: "rPers" },
                { headerName: "IDA", field: "ida" },
                { headerName: "Ocupacion", field: "ocupacion" },
                { headerName: "Caudal Impuesto Vent Noct", field: "caudalImpuestoVentNoct" },
                { headerName: "Accion", field: "accion" },
              ]}
              data={filteredVentilacion}
            />
          </div>
        )}

        {activeTab === "iluminacion" && (
          <div className="p-2">
            <TablesParameters
              columns={[
                { headerName: "Codigo de Recinto", field: "codigoRecinto" },
                { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
                { headerName: "Potencia Base [W/m2]", field: "potenciaBase" },
                { headerName: "Estrategia", field: "estrategia" },
                { headerName: "Potencia Propuesta [W/m2]", field: "potenciaPropuesta" },
                { headerName: "Accion", field: "accion" },
              ]}
              data={filteredIluminacion}
            />
          </div>
        )}

        {activeTab === "cargas" && (
          <div className="p-2">
            <TablesParameters
              columns={[
                { headerName: "Codigo de Recinto", field: "codigoRecinto" },
                { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
                { headerName: "Usuarios [m2/pers]", field: "usuarios" },
                { headerName: "Calor Latente [W/pers]", field: "calorLatente" },
                { headerName: "Calor Sensible [W/pers]", field: "calorSensible" },
                { headerName: "Equipos [W/m2]", field: "equipos" },
                { headerName: "Funcionamiento Semanal", field: "funcionamientoSemanal" },
                { headerName: "Accion", field: "accion" },
              ]}
              data={filteredCargas}
            />
          </div>
        )}

        {activeTab === "horario" && (
          <div className="p-2">
            <TablesParameters
              columns={[
                { headerName: "Codigo de Recinto", field: "codigoRecinto" },
                { headerName: "Tipologia de Recinto", field: "tipologiaRecinto" },
                { headerName: "Climatizado", field: "climatizado" },
                { headerName: "Hrs Desfase Clima (Inv)", field: "hrsDesfaseClimaInv" },
                { headerName: "Accion", field: "accion" },
              ]}
              data={filteredHorario}
            />
          </div>
        )}
      </div>

      {/* Modal de creación de nuevo recinto */}
      <ModalCreate
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        title="Crear nuevo recinto"
        saveLabel="Crear"
      >
        <div>
          <label htmlFor="recinto-name">Nombre del Recinto</label>
          <input
            id="recinto-name"
            type="text"
            value={newRecintoName}
            onChange={(e) => setNewRecintoName(e.target.value)}
            placeholder="Ingrese el nombre"
            style={{ width: "100%", padding: "8px", marginTop: "8px" }}
          />
        </div>
      </ModalCreate>
    </div>
  );
};

export default UseProfileTab;
