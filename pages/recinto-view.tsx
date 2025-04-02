import React, { useEffect, useState } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import Card from "../src/components/common/Card";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";

interface Muro {
  id: number;
  name: string;
  area: number;
  orientation: string;
  angulo_azimut: string;
  characteristics: string;
}

interface Ventana {
  id: number;
  window_name: string;
  position: string;
  orientation: string;
  angulo_azimut: string;
}

interface Puerta {
  id: number;
  orientation: string;
  angulo_azimut: string;
}

interface Piso {
  id: number;
  name: string;
  area: number;
  characteristic: string;
}

type Techumbre = any[];

interface PuenteTermico {
  id: number;
  enclosure_id: number;
  wall_id: number;
  po1_length: number;
  po2_length: number;
  po3_length: number;
  po4_length: number;
  po1_id_element: number;
  po2_id_element: number;
  po3_id_element: number;
  po4_id_element: number;
  po4_e_aislacion: number;
  po1_element_name: string | null;
  po2_element_name: string | null;
  po3_element_name: string | null;
  po4_element_name: string | null;
  // otros campos según sea necesario
}

const RecintoView: React.FC = () => {
  const [walls, setWalls] = useState<Muro[]>([]);
  const [windows, setWindows] = useState<Ventana[]>([]);
  const [doors, setDoors] = useState<Puerta[]>([]);
  const [floors, setFloors] = useState<Piso[]>([]);
  const [roofs, setRoofs] = useState<Techumbre>([]);
  const [thermalBridges, setThermalBridges] = useState<PuenteTermico[]>([]);

  // Estado para el tab activo: "muros" o "puentes"
  const [activeWallTab, setActiveWallTab] = useState<"muros" | "puentes">("muros");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const enclosure_id = typeof window !== "undefined" ? localStorage.getItem("enclosure_id") : null;

  useEffect(() => {
    if (!token || !enclosure_id) return;
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${token}`
    };

    // Obtener muros
    fetch(`${constantUrlApiEndpoint}/wall-enclosures/${enclosure_id}`, { headers })
      .then(res => res.json())
      .then((data: Muro[]) => setWalls(data))
      .catch(err => console.error("Error al obtener muros:", err));

    // Obtener ventanas
    fetch(`${constantUrlApiEndpoint}/window-enclosures/${enclosure_id}`, { headers })
      .then(res => res.json())
      .then((data: Ventana[]) => setWindows(data))
      .catch(err => console.error("Error al obtener ventanas:", err));

    // Obtener puertas
    fetch(`${constantUrlApiEndpoint}/door-enclosures/${enclosure_id}`, { headers })
      .then(res => res.json())
      .then((data: Puerta[]) => setDoors(data))
      .catch(err => console.error("Error al obtener puertas:", err));

    // Obtener techumbre
    fetch(`${constantUrlApiEndpoint}/roof-enclosures/${enclosure_id}`, { headers })
      .then(res => res.json())
      .then((data: Techumbre) => setRoofs(data))
      .catch(err => console.error("Error al obtener techumbre:", err));

    // Obtener pisos
    fetch(`${constantUrlApiEndpoint}/floor-enclosures/${enclosure_id}`, { headers })
      .then(res => res.json())
      .then((data: Piso[]) => setFloors(data))
      .catch(err => console.error("Error al obtener pisos:", err));

    // Obtener puentes térmicos
    fetch(`${constantUrlApiEndpoint}/thermal-bridge/${enclosure_id}`, { headers })
      .then(res => res.json())
      .then((data: PuenteTermico[]) => setThermalBridges(data))
      .catch(err => console.error("Error al obtener puentes térmicos:", err));
  }, [token, enclosure_id]);

  // Columnas para muros
  const wallColumns = [
    { headerName: "ID", field: "id" },
    { headerName: "Muros", field: "name" },
    { headerName: "Características", field: "characteristics" },
    { headerName: "Ángulo Azimut", field: "angulo_azimut" },
    { headerName: "Orientación", field: "orientation" },
    { headerName: "Área [m²]", field: "area" },
    { headerName: "U [W/m²K]", field: "u" },
  ];

  // Columnas para puentes térmicos (se pueden ajustar según la información necesaria)
  const thermalBridgeColumns = [
    { headerName: "ID", field: "id" },
    { headerName: "Wall ID", field: "wall_id" },
    { headerName: "L[m]", field: "po1_length" },
    { headerName: "Elemento", field: "po1_id_element" },
    { headerName: "L[m]", field: "po2_length" },
    { headerName: "Elemento", field: "po2_id_element" },
    { headerName: "L[m]", field: "po3_length" },
    { headerName: "Elemento", field: "po3_id_element" },
    { headerName: "L[m]", field: "po4_length" },
    { headerName: "e Aislación [cm]", field: "po4_e_aislacion" },
    { headerName: "Elemento", field: "po4_id_element" },
    // Agrega más columnas según se requiera
  ];

  const windowColumns = [
    { headerName: "ID", field: "id" },
    { headerName: "Nombre Ventana", field: "window_name" },
    { headerName: "Posición", field: "position" },
    { headerName: "Orientación", field: "orientation" },
    { headerName: "Ángulo Azimut", field: "angulo_azimut" }
  ];

  const doorColumns = [
    { headerName: "ID", field: "id" },
    { headerName: "Orientación", field: "orientation" },
    { headerName: "Ángulo Azimut", field: "angulo_azimut" }
  ];

  const floorColumns = [
    { headerName: "ID", field: "id" },
    { headerName: "Nombre Piso", field: "name" },
    { headerName: "Área", field: "area" },
    { headerName: "Característica", field: "characteristic" }
  ];

  const roofColumns = [
    { headerName: "ID", field: "id" },
    // Agrega otros campos necesarios de la respuesta de techumbre
  ];

  return (
    <div>
      <h1>Información del Recinto</h1>

      {/* Card con tabs para Muros y Puentes Térmicos */}
      <Card>
        <section>
          <h2>Muros / Puentes Térmicos</h2>
          <div style={{ display: "flex", marginBottom: "1rem" }}>
            <button
              onClick={() => setActiveWallTab("muros")}
              style={{
                padding: "0.5rem 1rem",
                border: activeWallTab === "muros" ? "2px solid #000" : "1px solid #ccc",
                background: activeWallTab === "muros" ? "#eee" : "#fff"
              }}
            >
              Muros
            </button>
            <button
              onClick={() => setActiveWallTab("puentes")}
              style={{
                padding: "0.5rem 1rem",
                border: activeWallTab === "puentes" ? "2px solid #000" : "1px solid #ccc",
                background: activeWallTab === "puentes" ? "#eee" : "#fff",
                marginLeft: "1rem"
              }}
            >
              Puentes Térmicos
            </button>
          </div>
          {activeWallTab === "muros" ? (
            walls.length > 0 ? (
              <TablesParameters data={walls} columns={wallColumns} />
            ) : (
              <p>No hay muros creados.</p>
            )
          ) : (
            thermalBridges.length > 0 ? (
              <TablesParameters data={thermalBridges} columns={thermalBridgeColumns} />
            ) : (
              <p>No hay puentes térmicos creados.</p>
            )
          )}
        </section>
      </Card>

      <Card>
        <section>
          <h2>Ventanas</h2>
          {windows.length > 0 ? (
            <TablesParameters data={windows} columns={windowColumns} />
          ) : (
            <p>No hay ventanas creadas.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
          <h2>Puertas</h2>
          {doors.length > 0 ? (
            <TablesParameters data={doors} columns={doorColumns} />
          ) : (
            <p>No hay puertas creadas.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
          <h2>Techumbre</h2>
          {roofs.length > 0 ? (
            <TablesParameters data={roofs} columns={roofColumns} />
          ) : (
            <p>No hay techumbre creada.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
          <h2>Pisos</h2>
          {floors.length > 0 ? (
            <TablesParameters data={floors} columns={floorColumns} />
          ) : (
            <p>No hay pisos creados.</p>
          )}
        </section>
      </Card>
    </div>
  );
};

export default RecintoView;
