// RecintoCaractersComponent.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { notify } from "@/utils/notify";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "./common/CustomButton";
import ModalCreate from "./common/ModalCreate";
import { constantUrlApiEndpoint } from "../utils/constant-url-endpoint";

type TabStep = "muros" | "techumbre" | "pisos" | "ventanas" | "puertas";

interface Wall {
  wall_id: number;
  characteristics: string;
  angulo_azimut: string;
  area: number;
}

const RecintoCaractersComponent: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [tabStep, setTabStep] = useState<TabStep>("muros");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estados para almacenar datos obtenidos de la API
  const [murosData, setMurosData] = useState<any[]>([]);
  const [puentesData, setPuentesData] = useState<any[]>([]);
  const [ventanasData, setVentanasData] = useState<any[]>([]);

  // Estado para almacenar las opciones de ángulo azimut
  const [angleOptions, setAngleOptions] = useState<string[]>([]);

  // Estado para los datos del nuevo muro
  const [newWall, setNewWall] = useState<Wall>({
    wall_id: 0,
    characteristics: "",
    angulo_azimut: "",
    area: 0,
  });

  useEffect(() => {
    const value =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement)
            .getPropertyValue("--primary-color")
            .trim()
        : "#3ca7b7";
    setPrimaryColor(value || "#3ca7b7");
  }, []);

  // Consulta de opciones para ángulo azimut desde el endpoint
  // Consulta de opciones para ángulo azimut desde el endpoint, incluyendo el token si es necesario
useEffect(() => {
  const fetchAngleOptions = async () => {
    try {
      const authData = getAuthData();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (authData) {
        headers.Authorization = `Bearer ${authData.token}`;
      }
      const response = await fetch(`${constantUrlApiEndpoint}/angle-azimut`, {
        headers,
      });
      if (!response.ok) {
        throw new Error("Error al obtener las opciones de ángulo azimut");
      }
      const options = await response.json();
      setAngleOptions(options);
    } catch (error) {
      notify("Error al cargar las opciones de ángulo azimut");
      console.error(error);
    }
  };
  fetchAngleOptions();
}, []);


  // Función para obtener el token y enclosure_id del localStorage
  const getAuthData = () => {
    const token = localStorage.getItem("token");
    const enclosure_id = localStorage.getItem("recinto_id");
    if (!token) {
      notify("Error: No se encontró el token en el localStorage.");
      return null;
    }
    if (!enclosure_id) {
      notify("Error: No se encontró 'recinto_id' en el localStorage.");
      return null;
    }
    return { token, enclosure_id };
  };

  // Función para obtener los datos desde la API
  const fetchData = async () => {
    const authData = getAuthData();
    if (!authData) return;
    const { token, enclosure_id } = authData;

    try {
      // Obtiene datos de muros
      const responseMuros = await fetch(
        `${constantUrlApiEndpoint}/wall-enclosures/${enclosure_id}/walls`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!responseMuros.ok) throw new Error("Error al obtener muros");
      const muros = await responseMuros.json();
      setMurosData(muros);

      // Obtiene datos de puentes térmicos
      const responsePuentes = await fetch(
        `${constantUrlApiEndpoint}/wall-enclosures/${enclosure_id}/puentes`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!responsePuentes.ok) throw new Error("Error al obtener puentes térmicos");
      const puentes = await responsePuentes.json();
      setPuentesData(puentes);

      // Obtiene datos de ventanas
      const responseVentanas = await fetch(
        `${constantUrlApiEndpoint}/wall-enclosures/${enclosure_id}/ventanas`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!responseVentanas.ok) throw new Error("Error al obtener ventanas");
      const ventanas = await responseVentanas.json();
      setVentanasData(ventanas);
    } catch (error) {
      notify("Error al cargar los datos");
      console.error(error);
    }
  };

  useEffect(() => {
    // Llama a fetchData cuando el componente se monta
    fetchData();
  }, []);

  // Definición de columnas (se mantienen igual que antes)
  const murosColumns = [
    { headerName: "Muros", field: "muros" },
    { headerName: "Caracteristicas espacio contiguo al elemento", field: "caracteristicas" },
    { headerName: "Angulo Azimut", field: "angulo" },
    { headerName: "Orientacion", field: "orientacion" },
    { headerName: "Area [m2]", field: "area" },
    { headerName: "U[W/m2K]", field: "u" },
  ];

  const puentesColumns = [
    { headerName: "L[m]", field: "p01_l" },
    { headerName: "Elemento 2", field: "p01_elem" },
    { headerName: "L[m]", field: "p02_l" },
    { headerName: "Elemento 2", field: "p02_elem" },
    { headerName: "L[m]", field: "p03_l" },
    { headerName: "Elemento 2", field: "p03_elem" },
    { headerName: "L[m]", field: "p04_l" },
    { headerName: "e Aislación [cm]", field: "p04_aislacion" },
    { headerName: "Elemento 2", field: "p04_elem" },
  ];

  const puentesMultiHeader = {
    rows: [
      [{ label: "Puentes Térmicos", colSpan: 9 }],
      [
        { label: "P01", colSpan: 2 },
        { label: "P02", colSpan: 2 },
        { label: "P03", colSpan: 2 },
        { label: "P04", colSpan: 3 },
      ],
      [
        { label: "L[m]" },
        { label: "Elemento 2" },
        { label: "L[m]" },
        { label: "Elemento 2" },
        { label: "L[m]" },
        { label: "Elemento 2" },
        { label: "L[m]" },
        { label: "e Aislación [cm]" },
        { label: "Elemento 2" },
      ],
    ],
  };

  const ventanasColumns = [
    { headerName: "Tipo de vano Acristalado (incluye marco)", field: "tipoVano" },
    { headerName: "Características espacio contiguo el elemento", field: "caracteristicas" },
    { headerName: "Ángulo Azimut", field: "anguloAzimut" },
    { headerName: "Orientación", field: "orientacion" },
    { headerName: "Alojado en", field: "alojadoEn" },
    { headerName: "Tipo de Cierre", field: "tipoCierre" },
    { headerName: "Posición Ventanal", field: "posicionVentanal" },
    { headerName: "Aislación Con/sin retorno", field: "aislacion" },
    { headerName: "Alto (H) [m]", field: "alto" },
    { headerName: "Ancho (W) [m]", field: "ancho" },
    { headerName: "Marco", field: "marco" },
    { headerName: "FAV 1 - D [m]", field: "fav1D" },
    { headerName: "FAV 1 - L [m]", field: "fav1L" },
    { headerName: "FAV 2 izq - P [m]", field: "fav2izqP" },
    { headerName: "FAV 2 izq - S [m]", field: "fav2izqS" },
    { headerName: "FAV 2 Der - P [m]", field: "fav2derP" },
    { headerName: "FAV 2 Der - S [m]", field: "fav2derS" },
    { headerName: "FAV 3 - E [m]", field: "fav3E" },
    { headerName: "FAV 3 - T [m]", field: "fav3T" },
    { headerName: "FAV 3 - β [°]", field: "fav3Beta" },
    { headerName: "FAV 3 - α [°]", field: "fav3Alpha" },
  ];

  const ventanasMultiHeader = {
    rows: [
      [
        { label: "Tipo de vano Acristalado (incluye marco)", rowSpan: 2 },
        { label: "Características espacio contiguo el elemento", rowSpan: 2 },
        { label: "Ángulo Azimut", rowSpan: 2 },
        { label: "Orientación", rowSpan: 2 },
        { label: "Alojado en", rowSpan: 2 },
        { label: "Tipo de Cierre", rowSpan: 2 },
        { label: "Posición Ventanal", rowSpan: 2 },
        { label: "Aislación Con/sin retorno", rowSpan: 2 },
        { label: "Alto (H) [m]", rowSpan: 2 },
        { label: "Ancho (W) [m]", rowSpan: 2 },
        { label: "Marco", rowSpan: 2 },
        { label: "FAV 1", colSpan: 2 },
        { label: "FAV 2 izq", colSpan: 2 },
        { label: "FAV 2 Der", colSpan: 2 },
        { label: "FAV 3", colSpan: 4 },
      ],
      [
        { label: "D [m]" },
        { label: "L [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "E [m]" },
        { label: "T [m]" },
        { label: "β [°]" },
        { label: "α [°]" },
      ],
    ],
  };

  // Maneja los cambios en los inputs del formulario
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWall((prev) => ({
      ...prev,
      [name]: name === "wall_id" || name === "area" ? Number(value) : value,
    }));
  };

  // Función para crear un nuevo muro usando los valores ingresados en el modal
  const handleCreateWall = async () => {
    const authData = getAuthData();
    if (!authData) return;
    const { token, enclosure_id } = authData;

    const url = `${constantUrlApiEndpoint}/wall-enclosures-create/${enclosure_id}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newWall),
      });

      if (!response.ok) {
        throw new Error("Error en la creación del muro.");
      }

      notify("Muro creado exitosamente");
      setIsModalOpen(false);
      // Reiniciar formulario
      setNewWall({
        wall_id: 0,
        characteristics: "",
        angulo_azimut: "",
        area: 0,
      });
      // Vuelve a cargar los datos actualizados
      fetchData();
    } catch (error) {
      notify("Error al crear el muro");
      console.error(error);
    }
  };

  const renderTabContent = () => {
    switch (tabStep) {
      case "muros":
        return (
          <div className="d-flex flex-column gap-4">
            <div className="row">
              <div className="col-md-6">
                <TablesParameters columns={murosColumns} data={murosData} />
              </div>
              <div className="col-md-6">
                <TablesParameters
                  columns={puentesColumns}
                  data={puentesData}
                  multiHeader={puentesMultiHeader}
                />
              </div>
            </div>
            <div className="text-end">
              <CustomButton variant="save" onClick={() => setIsModalOpen(true)}>
                Nuevo
              </CustomButton>
            </div>
          </div>
        );
      case "techumbre":
        return <div className="p-3">Contenido de Techumbre pendiente de implementación.</div>;
      case "pisos":
        return <div className="p-3">Contenido de Pisos pendiente de implementación.</div>;
      case "ventanas":
        return (
          <div className="p-3">
            <TablesParameters
              columns={ventanasColumns}
              data={ventanasData}
              multiHeader={ventanasMultiHeader}
            />
          </div>
        );
      case "puertas":
        return <div className="p-3">Contenido de Puertas pendiente de implementación.</div>;
      default:
        return null;
    }
  };

  const renderTabs = () => (
    <>
      {/* Cambiamos la clase de justify-content-center a nav-fill */}
      <ul className="nav nav-tabs nav-fill">
        {[
          { key: "muros", label: "Muros" },
          { key: "ventanas", label: "Ventanas" },
          { key: "puertas", label: "Puertas" },
          { key: "techumbre", label: "Techumbre" },
          { key: "pisos", label: "Pisos" },
        ].map((item) => (
          <li className="nav-item" key={item.key}>
            <button
              className={`nav-link ${tabStep === item.key ? "active" : ""}`}
              onClick={() => setTabStep(item.key as TabStep)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3">{renderTabContent()}</div>
    </>
  );

  return (
    <div className="container py-3">
      {renderTabs()}
      {/* Modal para crear un nuevo muro */}
      <ModalCreate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateWall}
        title="Crear Nuevo Muro"
      >
        <form>
          <div className="row align-items-center mb-3">
            <label htmlFor="wall_id" className="col-sm-3 col-form-label">
              Muro
            </label>
            <div className="col-sm-9">
              <input
                id="wall_id"
                type="number"
                name="wall_id"
                className="form-control form-control-sm"
                value={newWall.wall_id}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="characteristics" className="col-sm-3 col-form-label">
              Características
            </label>
            <div className="col-sm-9">
              <input
                id="characteristics"
                type="text"
                name="characteristics"
                className="form-control form-control-sm"
                value={newWall.characteristics}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="angulo_azimut" className="col-sm-3 col-form-label">
              Ángulo Azimut
            </label>
            <div className="col-sm-9">
              <select
                id="angulo_azimut"
                name="angulo_azimut"
                className="form-control form-control-sm"
                value={newWall.angulo_azimut}
                onChange={handleInputChange}
              >
                <option value="">Seleccione...</option>
                {angleOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="area" className="col-sm-3 col-form-label">
              Área
            </label>
            <div className="col-sm-9">
              <input
                id="area"
                type="number"
                name="area"
                className="form-control form-control-sm"
                value={newWall.area}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </form>
      </ModalCreate>
    </div>
  );
};

export default RecintoCaractersComponent;
