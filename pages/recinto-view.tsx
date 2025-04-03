import React, { useEffect, useState } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import Card from "../src/components/common/Card";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import Breadcrumb from "../src/components/common/Breadcrumb";
import Title from "../src/components/Title";

interface Muro {
  id: number;
  name: string;
  area: number;
  orientation: string;
  angulo_azimut: string;
  characteristics: string;
  u?: number;
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

  // Si ya se combinó en la tabla de muros, ya no es necesaria la pestaña de puentes
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

  // Combina los datos de muros y puentes térmicos.
  const combinedWalls = walls.map(wall => {
    // Busca el puente térmico asociado con el muro, si existe.
    const thermal = thermalBridges.find(tb => tb.wall_id === wall.id);
    return { ...wall, ...(thermal || {}) };
  });

  // Define las columnas combinadas (evitando duplicados y organizando los campos)
  const combinedColumns = [
    { headerName: "ID", field: "id" },
    { headerName: "Muro", field: "name" },
    { headerName: "Características", field: "characteristics" },
    { headerName: "Ángulo Azimut", field: "angulo_azimut" },
    { headerName: "Orientación", field: "orientation" },
    { headerName: "Área [m²]", field: "area" },
    { headerName: "U [W/m²K]", field: "u" },
    // Campos del puente térmico (se muestran si existen)
    { headerName: "Wall ID (PT)", field: "wall_id" },
    { headerName: "L[m] (po1)", field: "po1_length" },
    { headerName: "Elemento (po1)", field: "po1_id_element" },
    { headerName: "L[m] (po2)", field: "po2_length" },
    { headerName: "Elemento (po2)", field: "po2_id_element" },
    { headerName: "L[m] (po3)", field: "po3_length" },
    { headerName: "Elemento (po3)", field: "po3_id_element" },
    { headerName: "L[m] (po4)", field: "po4_length" },
    { headerName: "e Aislación [cm]", field: "po4_e_aislacion" },
    { headerName: "Elemento (po4)", field: "po4_id_element" },
  ];
  const multiHeaderMuros = {
    rows: [
      [
        { label: "Nombre", rowSpan: 2 },
        { label: "U [W/m²K]", rowSpan: 2 },
        { label: "po1", colSpan: 2 },
        { label: "po2", colSpan: 2 },
        { label: "po3", colSpan: 2 },
        { label: "po4", colSpan: 3 },
      ],
      [
        // Subencabezados para "po1"
        { label: "L[m]" },
        { label: "Elemento" },
        // Subencabezados para "po2"
        { label: "L[m]" },
        { label: "Elemento" },
        // Subencabezados para "po3"
        { label: "L[m]" },
        { label: "Elemento" },
        // Subencabezados para "po4"
        { label: "L[m]" },
        { label: "e Aislación [cm]" },
        { label: "Elemento" },
      ],
    ],
  };

  // Columnas para las demás tablas (se mantienen igual)
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
    // Agregar otros campos necesarios de techumbre
  ];

  return (
    
    <div>
      <Card>
        <div className="d-flex align-items-center w-100">
          <Title text="Administrar proyectos" />
          <Breadcrumb
            items={[
              { title: "Administrar proyectos", href: "/project-status", active: true }
            ]}
          />
        </div>
      </Card>

      {/* Sección de Muros / Puentes Térmicos combinados */}
      <Card>
        <section>
          <Title text= "Muros y Puentes Térmicos"/>
          {/* Se conserva el botón si se quiere tener la opción de pestañas en el futuro */}
          <div style={{ display: "flex", marginBottom: "1rem" }}>
            
          </div>
          {combinedWalls.length > 0 ? (
            <TablesParameters data={combinedWalls} columns={combinedColumns} />
          ) : (
            <p>No hay muros creados.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
          <Title text= "Ventanas"/>
          {windows.length > 0 ? (
            <TablesParameters data={windows} columns={windowColumns} />
          ) : (
            <p>No hay ventanas creadas.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
        <Title text= "Puertas"/>
          {doors.length > 0 ? (
            <TablesParameters data={doors} columns={doorColumns} />
          ) : (
            <p>No hay puertas creadas.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
        <Title text= "Techumbre"/>
          {roofs.length > 0 ? (
            <TablesParameters data={roofs} columns={roofColumns} />
          ) : (
            <p>No hay techumbre creada.</p>
          )}
        </section>
      </Card>

      <Card>
        <section>
        <Title text= "Pisos"/>
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
