import ButtonTab from "@/components/common/ButtonTab";
import { notify } from "@/utils/notify";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import GooIcons from "../public/GoogleIcons";
import Title from "../src/components/Title";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import Card from "../src/components/common/Card";
import CustomButton from "../src/components/common/CustomButton";
import ModalCreate from "../src/components/common/ModalCreate";
import SearchParameters from "../src/components/inputs/SearchParameters";
import useAuth from "../src/hooks/useAuth";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Breadcrumb from "@/components/common/Breadcrumb";

// === Importamos el componente genérico TablesParameters (SIN multiheader) ===
import TablesParameters from "@/components/tables/TablesParameters";

/** Tipos e interfaces necesarias **/
interface MaterialAtributs {
  name: string;
  conductivity: number;
  specific_heat: number;
  density: number;
}

export interface Material {
  id: number;
  atributs: MaterialAtributs;
}

export interface ElementBase {
  id: number;
  type: "window" | "door";
  name_element: string;
  u_marco: number;
  fm: number;
  atributs: {
    u_vidrio?: number;
    fs_vidrio?: number;
    frame_type?: string;
    clousure_type?: string;
    u_puerta_opaca?: number;
    porcentaje_vidrio?: number;
    name_ventana?: string;
    ventana_id?: number;
  };
}

// Función para obtener el valor de una variable CSS con un valor por defecto
function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

// Helper para validar porcentajes
const validatePercentage = (value: number) => {
  if (isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

// Componente auxiliar para renderizar el label con asterisco si el campo está vacío
interface LabelWithAsteriskProps {
  label: string;
  value: string;
  required?: boolean;
}

const LabelWithAsterisk: React.FC<LabelWithAsteriskProps> = ({
  label,
  value,
  required = true,
}) => {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");
  return (
    <label>
      {label} {required && isEmpty && <span style={{ color: "red" }}>*</span>}
    </label>
  );
};

const DataEntryPage: React.FC = () => {
  useAuth();
  const router = useRouter();

  /** Estados de cabecera del proyecto **/
  const [, setProjectId] = useState<number | null>(null);
  const [, setProjectDepartment] = useState<string | null>(null);
  const [, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    const storedDepartment = localStorage.getItem("project_department");
    if (storedProjectId) setProjectId(Number(storedProjectId));
    if (storedDepartment) setProjectDepartment(storedDepartment);
    setHasLoaded(true);
  }, []);

  /** Estado para el step actual **/
  const [step, setStep] = useState<number>(3);
  useEffect(() => {
    if (router.query.step) {
      const queryStep = parseInt(router.query.step as string, 10);
      if (!isNaN(queryStep)) setStep(queryStep);
    }
  }, [router.query.step]);

  /** Estados para Lista de Materiales (Step 3) **/
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({
    name: "",
    conductivity: "",
    specific_heat: "",
    density: "",
  });
  const [materialSearch, setMaterialSearch] = useState("");

  /** Estados para Elementos translúcidos (Step 5) **/
  const [modalElementType, setModalElementType] = useState<string>("ventanas");
  const [elementsList, setElementsList] = useState<ElementBase[]>([]);
  const [showElementModal, setShowElementModal] = useState(false);
  const [windowData, setWindowData] = useState({
    name_element: "",
    u_vidrio: "",
    fs_vidrio: "",
    clousure_type: "Corredera",
    frame_type: "",
    u_marco: "",
    fm: "",
  });
  const [doorData, setDoorData] = useState({
    name_element: "",
    ventana_id: "",
    name_ventana: "",
    u_puerta_opaca: "",
    porcentaje_vidrio: "",
    u_marco: "",
    fm: "",
  });
  const [allWindowsForDoor, setAllWindowsForDoor] = useState<ElementBase[]>([]);
  const [elementSearch, setElementSearch] = useState("");
  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");

  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);

  // Validar inputs numéricos
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.key === "-") {
      e.preventDefault();
    }
    if (!/^\d$/.test(e.key) && e.key !== ".") {
      e.preventDefault();
    }
    if (e.key === "." && e.currentTarget.value.includes(".")) {
      e.preventDefault();
    }
  };

  // === FETCH DE MATERIALES ===
  const fetchMaterialsList = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      let allMaterials: Material[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const url = `${constantUrlApiEndpoint}/constants/?page=${page}&per_page=100`;
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(url, { headers });
        const currentData = response.data.constants || [];
        allMaterials = [...allMaterials, ...currentData];
        if (currentData.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      setMaterialsList(allMaterials);
    } catch (error) {
      console.error("Error al obtener materiales:", error);
      // Solo lo registramos
    }
  }, []);

  // === FETCH DE ELEMENTOS (VENTANAS / PUERTAS) ===
  const fetchElements = useCallback(async (type: "window" | "door") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const url = `${constantUrlApiEndpoint}/elements/?type=${type}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      };
      const response = await axios.get(url, { headers });
      setElementsList(response.data);
    } catch (error) {
      console.error(
        `Error al obtener ${type === "window" ? "ventanas" : "puertas"}`,
        error
      );
    }
  }, []);

  const fetchAllWindowsForDoor = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const url = `${constantUrlApiEndpoint}/elements/?type=window`;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      };
      const response = await axios.get(url, { headers });
      setAllWindowsForDoor(response.data);
    } catch (error) {
      console.error("Error al obtener ventanas para puerta:", error);
    }
  }, []);

  // === CREAR MATERIAL ===
  const handleCreateMaterial = async (): Promise<boolean> => {
    if (
      newMaterialData.name.trim() === "" ||
      !newMaterialData.conductivity ||
      parseFloat(newMaterialData.conductivity) <= 0 ||
      !newMaterialData.specific_heat ||
      parseFloat(newMaterialData.specific_heat) <= 0 ||
      !newMaterialData.density ||
      parseFloat(newMaterialData.density) <= 0
    ) {
      notify("Por favor complete todos los campos del material correctamente");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const requestBody = {
        atributs: {
          name: newMaterialData.name,
          density: parseFloat(newMaterialData.density),
          conductivity: parseFloat(newMaterialData.conductivity),
          specific_heat: parseFloat(newMaterialData.specific_heat),
        },
        name: "materials",
        type: "definition materials",
      };
      const url = `${constantUrlApiEndpoint}/constants/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json",
      };
      const response = await axios.post(url, requestBody, { headers });
      if (response.status === 200) {
        await fetchMaterialsList();
        notify(`El material "${newMaterialData.name}" fue creado exitosamente`);
        setNewMaterialData({
          name: "",
          conductivity: "",
          specific_heat: "",
          density: "",
        });
        return true;
      }
      return false;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 400
      ) {
        notify("El Nombre del Material ya existe");
      } else {
        notify("Error al crear el material");
      }
      console.error("Error al crear material:", error);
      return false;
    }
  };

  // === CREAR ELEMENTO TIPO VENTANA ===
  const handleCreateWindowElement = async (): Promise<boolean> => {
    if (
      windowData.name_element.trim() === "" ||
      !windowData.u_vidrio ||
      parseFloat(windowData.u_vidrio) <= 0 ||
      !windowData.fs_vidrio ||
      parseFloat(windowData.fs_vidrio) <= 0 ||
      !windowData.u_marco ||
      parseFloat(windowData.u_marco) <= 0 ||
      windowData.fm === "" ||
      parseFloat(windowData.fm) < 0 ||
      parseFloat(windowData.fm) > 100 ||
      windowData.clousure_type.trim() === "" ||
      windowData.frame_type.trim() === ""
    ) {
      notify("Por favor complete todos los campos de la ventana correctamente");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const body = {
        name_element: windowData.name_element,
        type: "window",
        atributs: {
          u_vidrio: parseFloat(windowData.u_vidrio),
          fs_vidrio: parseFloat(windowData.fs_vidrio),
          clousure_type: windowData.clousure_type,
          frame_type: windowData.frame_type,
        },
        u_marco: parseFloat(windowData.u_marco),
        fm: parseFloat(windowData.fm),
      };
      const response = await axios.post(
        `${constantUrlApiEndpoint}/elements/create`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setElementsList((prev) => [...prev, response.data.element]);
      setAllWindowsForDoor((prev) => [...prev, response.data.element]);

      notify(`La ventana "${windowData.name_element}" fue creada exitosamente`);
      setWindowData({
        name_element: "",
        u_vidrio: "",
        fs_vidrio: "",
        clousure_type: "Corredera",
        frame_type: "",
        u_marco: "",
        fm: "",
      });
      return true;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 400
      ) {
        notify("El Nombre de la Ventana ya existe");
      } else {
        notify("Error al crear la ventana");
      }
      console.error("Error al crear ventana:", error);
      return false;
    }
  };

  // === CREAR ELEMENTO TIPO PUERTA ===
  const handleCreateDoorElement = async (): Promise<boolean> => {
    if (
      doorData.name_element.trim() === "" ||
      !doorData.u_puerta_opaca ||
      parseFloat(doorData.u_puerta_opaca) <= 0 ||
      !doorData.u_marco ||
      parseFloat(doorData.u_marco) <= 0 ||
      doorData.fm === "" ||
      parseFloat(doorData.fm) < 0 ||
      parseFloat(doorData.fm) > 100
    ) {
      notify("Por favor complete todos los campos de la puerta correctamente");
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const body = {
        name_element: doorData.name_element,
        type: "door",
        atributs: {
          ventana_id: doorData.ventana_id ? parseInt(doorData.ventana_id) : 0,
          name_ventana: doorData.ventana_id ? doorData.name_ventana : "",
          u_puerta_opaca: parseFloat(doorData.u_puerta_opaca),
          porcentaje_vidrio: doorData.ventana_id
            ? parseFloat(doorData.porcentaje_vidrio)
            : 0,
        },
        u_marco: parseFloat(doorData.u_marco),
        fm: parseFloat(doorData.fm),
      };
      const response = await axios.post(
        `${constantUrlApiEndpoint}/elements/create`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setElementsList((prev) => [...prev, response.data.element]);

      notify(`La puerta "${doorData.name_element}" fue creada exitosamente`);
      setDoorData({
        name_element: "",
        ventana_id: "",
        name_ventana: "",
        u_puerta_opaca: "",
        porcentaje_vidrio: "",
        u_marco: "",
        fm: "",
      });
      return true;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 400
      ) {
        notify("El Nombre de la Puerta ya existe");
      } else {
        notify("Error al crear la puerta");
      }
      console.error("Error al crear puerta:", error);
      return false;
    }
  };

  // === useEffect para Step 3 (Materiales) ===
  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList();
    }
  }, [step, fetchMaterialsList]);

  // === useEffect para Step 5 (Elementos) ===
  useEffect(() => {
    if (step === 5) {
      fetchElements(modalElementType === "ventanas" ? "window" : "door");
      if (modalElementType === "puertas") {
        fetchAllWindowsForDoor();
      }
    }
  }, [step, modalElementType, fetchElements, fetchAllWindowsForDoor]);

  // === isValid para formularios
  const materialIsValid =
    newMaterialData.name.trim() !== "" &&
    newMaterialData.conductivity !== "" &&
    parseFloat(newMaterialData.conductivity) > 0 &&
    newMaterialData.specific_heat !== "" &&
    parseFloat(newMaterialData.specific_heat) > 0 &&
    newMaterialData.density !== "" &&
    parseFloat(newMaterialData.density) > 0;

  const windowIsValid =
    windowData.name_element.trim() !== "" &&
    windowData.u_vidrio !== "" &&
    parseFloat(windowData.u_vidrio) > 0 &&
    windowData.fs_vidrio !== "" &&
    parseFloat(windowData.fs_vidrio) > 0 &&
    windowData.u_marco !== "" &&
    parseFloat(windowData.u_marco) > 0 &&
    windowData.fm !== "" &&
    parseFloat(windowData.fm) >= 0 &&
    parseFloat(windowData.fm) <= 100 &&
    windowData.clousure_type.trim() !== "" &&
    windowData.frame_type.trim() !== "";

  const doorIsValid =
    doorData.name_element.trim() !== "" &&
    doorData.u_puerta_opaca !== "" &&
    parseFloat(doorData.u_puerta_opaca) > 0 &&
    doorData.u_marco !== "" &&
    parseFloat(doorData.u_marco) > 0 &&
    doorData.fm !== "" &&
    parseFloat(doorData.fm) >= 0 &&
    parseFloat(doorData.fm) <= 100 &&
    (!doorData.ventana_id ||
      (doorData.ventana_id &&
        doorData.porcentaje_vidrio !== "" &&
        parseFloat(doorData.porcentaje_vidrio) >= 0 &&
        parseFloat(doorData.porcentaje_vidrio) <= 100));

  // === RENDER DE STEP 3: Lista de Materiales (SIN multiheader)
  const renderStep3Materials = () => {
    // Definimos columnas
    const columnsMaterials = [
      { headerName: "Nombre Material", field: "materialName" },
      { headerName: "Conductividad (W/m2K)", field: "conductivity" },
      { headerName: "Calor específico (J/kgK)", field: "specific_heat" },
      { headerName: "Densidad (kg/m3)", field: "density" },
    ];

    // Filtrar y mapear la data
    const filteredMaterialData = materialsList
      .filter((mat) =>
        mat.atributs.name
          .toLowerCase()
          .includes(materialSearch.toLowerCase())
      )
      .map((mat) => ({
        materialName: mat.atributs.name,
        conductivity: mat.atributs.conductivity,
        specific_heat: mat.atributs.specific_heat,
        density: mat.atributs.density,
      }));

    return (
      <>
        <div className="mb-4">
          <SearchParameters
            value={materialSearch}
            onChange={setMaterialSearch}
            placeholder="Buscar material..."
            onNew={() => setShowMaterialModal(true)}
          />
        </div>
        <div className="border rounded overflow-hidden">
          <TablesParameters columns={columnsMaterials} data={filteredMaterialData} />
        </div>
      </>
    );
  };

  // === RENDER DE STEP 5: Elementos Translúcidos (Ventanas / Puertas) (SIN multiheader)
  const renderStep5Elements = () => {
    if (modalElementType === "ventanas") {
      // Columns para Ventanas
      const columnsVentanas = [
        { headerName: "Nombre Elemento", field: "name_element" },
        { headerName: "U Vidrio [W/m2K]", field: "u_vidrio" },
        { headerName: "FS Vidrio", field: "fs_vidrio" },
        { headerName: "Tipo Cierre", field: "clousure_type" },
        { headerName: "Tipo Marco", field: "frame_type" },
        { headerName: "U Marco [W/m2K]", field: "u_marco" },
        { headerName: "FM [%]", field: "fm" },
      ];

      // Mapeamos la data
      const filteredData = elementsList
        .filter(
          (el) =>
            el.type === "window" &&
            el.name_element
              .toLowerCase()
              .includes(elementSearch.toLowerCase())
        )
        .map((el) => ({
          name_element: el.name_element,
          u_vidrio:
            el.atributs.u_vidrio && el.atributs.u_vidrio > 0
              ? el.atributs.u_vidrio
              : "--",
          fs_vidrio:
            el.atributs.fs_vidrio && el.atributs.fs_vidrio > 0
              ? el.atributs.fs_vidrio
              : "--",
          clousure_type: el.atributs.clousure_type ?? "--",
          frame_type: el.atributs.frame_type ?? "--",
          u_marco: el.u_marco,
          fm: (el.fm * 100).toFixed(0) + "%",
        }));

      return (
        <>
          <div className="mb-4">
            <SearchParameters
              value={elementSearch}
              onChange={setElementSearch}
              placeholder="Buscar elemento..."
              onNew={() => setShowElementModal(true)}
            />
          </div>
          <div className="border rounded overflow-hidden">
            <div className="bg-white border-bottom">
              <div className="row g-0">
                {["Ventanas", "Puertas"].map((tab) => (
                  <div key={tab} className="col-6">
                    <ButtonTab
                      label={tab}
                      active={modalElementType === tab.toLowerCase()}
                      onClick={() => setModalElementType(tab.toLowerCase())}
                      primaryColor={primaryColor}
                    />
                  </div>
                ))}
              </div>
            </div>
            <TablesParameters columns={columnsVentanas} data={filteredData} />
          </div>
        </>
      );
    } else {
      // Columns para Puertas
      const columnsPuertas = [
        { headerName: "Nombre Elemento", field: "name_element" },
        { headerName: "U Puerta opaca [W/m2K]", field: "u_puerta_opaca" },
        { headerName: "Nombre Ventana", field: "name_ventana" },
        { headerName: "% Vidrio", field: "porcentaje_vidrio" },
        { headerName: "U Marco [W/m2K]", field: "u_marco" },
        { headerName: "FM [%]", field: "fm" },
      ];

      const filteredData = elementsList
        .filter(
          (el) =>
            el.type === "door" &&
            el.name_element
              .toLowerCase()
              .includes(elementSearch.toLowerCase())
        )
        .map((el) => ({
          name_element: el.name_element,
          u_puerta_opaca:
            el.atributs.u_puerta_opaca && el.atributs.u_puerta_opaca > 0
              ? el.atributs.u_puerta_opaca
              : "--",
          name_ventana: el.atributs.name_ventana ?? "--",
          porcentaje_vidrio:
            el.atributs.porcentaje_vidrio !== undefined
              ? (el.atributs.porcentaje_vidrio * 100).toFixed(0) + "%"
              : "0%",
          u_marco: el.u_marco,
          fm: (el.fm * 100).toFixed(0) + "%",
        }));

      return (
        <>
          <div className="mb-4">
            <SearchParameters
              value={elementSearch}
              onChange={setElementSearch}
              placeholder="Buscar elemento..."
              onNew={() => setShowElementModal(true)}
            />
          </div>
          <div className="border rounded overflow-hidden">
            <div className="bg-white border-bottom">
              <div className="row g-0">
                {["Ventanas", "Puertas"].map((tab) => (
                  <div key={tab} className="col-6">
                    <ButtonTab
                      label={tab}
                      active={modalElementType === tab.toLowerCase()}
                      onClick={() => setModalElementType(tab.toLowerCase())}
                      primaryColor={primaryColor}
                    />
                  </div>
                ))}
              </div>
            </div>
            <TablesParameters columns={columnsPuertas} data={filteredData} />
          </div>
        </>
      );
    }
  };

  // === RENDER DE STEP 6: Perfil de uso (tabla manual)
  const renderStep6Profile = () => (
    <div className="px-3">
      <div className="nav nav-tabs mb-3 flex-nowrap overflow-auto">
        {[
          { key: "ventilacion", label: "Ventilación y caudales" },
          { key: "iluminacion", label: "Iluminación" },
          { key: "cargas", label: "Cargas internas" },
          { key: "horario", label: "Horario y Clima" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-link flex-shrink-0 ${
              tabTipologiaRecinto === tab.key ? "active" : ""
            }`}
            style={{
              color:
                tabTipologiaRecinto === tab.key
                  ? primaryColor
                  : "var(--secondary-color)",
              borderBottom:
                tabTipologiaRecinto === tab.key
                  ? `3px solid ${primaryColor}`
                  : "none",
              whiteSpace: "nowrap",
            }}
            onClick={() => setTabTipologiaRecinto(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="table-responsive">
        <div className="border rounded overflow-hidden">
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <table className="table  table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}></th>
                  <th style={{ textAlign: "center" }}></th>
                  <th style={{ textAlign: "center" }}></th>
                  <th style={{ textAlign: "center" }}>Caudal Min Salubridad</th>
                  <th style={{ textAlign: "center" }}></th>
                  <th style={{ textAlign: "center" }}>Caudal Impuesto</th>
                  <th style={{ textAlign: "center" }}></th>
                </tr>
                <tr>
                  <th style={{ textAlign: "center" }}>Código de Recinto</th>
                  <th style={{ textAlign: "center" }}>Tipología de Recinto</th>
                  <th style={{ textAlign: "center" }}>R-pers [L/s]</th>
                  <th style={{ textAlign: "center" }}>IDA</th>
                  <th style={{ textAlign: "center" }}>Ocupación</th>
                  <th style={{ textAlign: "center" }}>Vent Noct [1/h]</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center">ES</td>
                  <td className="text-center">Espera</td>
                  <td className="text-center">8.80</td>
                  <td className="text-center">IDA2 ✔</td>
                  <td className="text-center">Sedentario ✔</td>
                  <td className="text-center">-</td>
                </tr>
                <tr>
                  <td className="text-center">AU</td>
                  <td className="text-center">Auditorio</td>
                  <td className="text-center">5.28</td>
                  <td className="text-center">IDA3 ✔</td>
                  <td className="text-center">Sedentario ✔</td>
                  <td className="text-center">-</td>
                </tr>
                {/* ... Más filas de ejemplo ... */}
              </tbody>
            </table>
            <div className="text-end mt-3">
              <CustomButton
                variant="save"
                onClick={() => {
                  // Lógica para abrir un modal o formulario para agregar un nuevo registro
                  console.log("Agregar nuevo registro");
                }}
              >
                + Nuevo
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <GooIcons />
      <Card>
        <div className="d-flex align-items-center w-100">
          <Title text="Ingreso de datos de entrada" />
          <Breadcrumb
            items={[
              { title: "Datos de entrada", href: "/data-entry", active: true },
            ]}
          />
        </div>
      </Card>

      <Card>
  <div className="row">
    {/* Columna para Sidebar */}
    <div className="col-12 col-md-3">
      <AdminSidebar
        activeStep={step}
        onStepChange={setStep}
        steps={[
          { stepNumber: 3, iconName: "imagesearch_roller", title: "Lista de materiales" },
          { stepNumber: 5, iconName: "home", title: "Elementos translúcidos" },
          { stepNumber: 6, iconName: "deck", title: "Perfil de uso" },
        ]}
      />
    </div>

    {/* Columna para contenido principal */}
    <div className="col-12 col-md-9 p-4">
      {step === 3 && (
        <div className="px-3">{renderStep3Materials()}</div>
      )}

      {step === 5 && (
        <div className="px-3">{renderStep5Elements()}</div>
      )}

      {step === 6 && renderStep6Profile()}
    </div>
  </div>
</Card>
      {/* Modal para crear Material */}
      {showMaterialModal && (
        <ModalCreate
          isOpen={showMaterialModal}
          onClose={() => {
            setShowMaterialModal(false);
            setNewMaterialData({
              name: "",
              conductivity: "",
              specific_heat: "",
              density: "",
            });
          }}
          onSave={async () => {
            const success = await handleCreateMaterial();
            if (success) {
              setShowMaterialModal(false);
            }
          }}
          title="Nuevo Material"
          saveLabel="Crear Material"
        >
          <div>
            <div className="form-group mb-3">
              <LabelWithAsterisk label="Nombre" value={newMaterialData.name} />
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                value={newMaterialData.name}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group mb-3">
              <LabelWithAsterisk
                label="Conductividad (W/m2K)"
                value={newMaterialData.conductivity}
              />
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Conductividad"
                value={newMaterialData.conductivity}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({
                    ...prev,
                    conductivity: e.target.value,
                  }))
                }
                onKeyDown={handleNumberKeyDown}
              />
            </div>
            <div className="form-group mb-3">
              <LabelWithAsterisk
                label="Calor específico (J/kgK)"
                value={newMaterialData.specific_heat}
              />
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Calor específico"
                value={newMaterialData.specific_heat}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({
                    ...prev,
                    specific_heat: e.target.value,
                  }))
                }
                onKeyDown={handleNumberKeyDown}
              />
            </div>
            <div className="form-group mb-3">
              <LabelWithAsterisk
                label="Densidad (kg/m3)"
                value={newMaterialData.density}
              />
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Densidad"
                value={newMaterialData.density}
                onChange={(e) =>
                  setNewMaterialData((prev) => ({
                    ...prev,
                    density: e.target.value,
                  }))
                }
                onKeyDown={handleNumberKeyDown}
              />
            </div>
          </div>
        </ModalCreate>
      )}

      {/* Modal para crear Elemento translúcido */}
      {showElementModal && (
        <ModalCreate
          isOpen={showElementModal}
          onClose={() => {
            setShowElementModal(false);
            if (modalElementType === "ventanas") {
              setWindowData({
                name_element: "",
                u_vidrio: "",
                fs_vidrio: "",
                clousure_type: "Corredera",
                frame_type: "",
                u_marco: "",
                fm: "",
              });
            } else {
              setDoorData({
                name_element: "",
                ventana_id: "",
                name_ventana: "",
                u_puerta_opaca: "",
                porcentaje_vidrio: "",
                u_marco: "",
                fm: "",
              });
            }
          }}
          onSave={async () => {
            if (modalElementType === "ventanas") {
              const success = await handleCreateWindowElement();
              if (success) setShowElementModal(false);
            } else {
              const success = await handleCreateDoorElement();
              if (success) setShowElementModal(false);
            }
          }}
          title={
            modalElementType === "ventanas" ? "Nueva Ventana" : "Nueva Puerta"
          }
          saveLabel={
            modalElementType === "ventanas" ? "Crear Ventana" : "Crear Puerta"
          }
        >
          {modalElementType === "ventanas" ? (
            <div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="Nombre"
                  value={windowData.name_element}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={windowData.name_element}
                  onChange={(e) =>
                    setWindowData((prev) => ({
                      ...prev,
                      name_element: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="U Vidrio [W/m2K]"
                  value={windowData.u_vidrio}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Vidrio"
                  value={windowData.u_vidrio}
                  onChange={(e) =>
                    setWindowData((prev) => ({
                      ...prev,
                      u_vidrio: e.target.value,
                    }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="FS Vidrio"
                  value={windowData.fs_vidrio}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="FS Vidrio"
                  value={windowData.fs_vidrio}
                  onChange={(e) =>
                    setWindowData((prev) => ({
                      ...prev,
                      fs_vidrio: e.target.value,
                    }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="Tipo Cierre"
                  value={windowData.clousure_type}
                />
                <select
                  className="form-control"
                  value={windowData.clousure_type}
                  onChange={(e) =>
                    setWindowData((prev) => ({
                      ...prev,
                      clousure_type: e.target.value,
                    }))
                  }
                >
                  <option value="Abatir">Abatir</option>
                  <option value="Corredera">Corredera</option>
                  <option value="Fija">Fija</option>
                  <option value="Guillotina">Guillotina</option>
                  <option value="Proyectante">Proyectante</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="Tipo Marco"
                  value={windowData.frame_type}
                />
                <select
                  className="form-control"
                  value={windowData.frame_type}
                  onChange={(e) =>
                    setWindowData((prev) => ({
                      ...prev,
                      frame_type: e.target.value,
                    }))
                  }
                >
                  <option value="">Seleccione</option>
                  <option value="Fierro">Fierro</option>
                  <option value="Madera Con RPT">Madera Con RPT</option>
                  <option value="Madera Sin RPT">Madera Sin RPT</option>
                  <option value="Metalico Con RPT">Metalico Con RPT</option>
                  <option value="Metalico Sin RPT">Metalico Sin RPT</option>
                  <option value="PVC Con RPT">PVC Con RPT</option>
                  <option value="PVC Sin RPT">PVC Sin RPT</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="U Marco [W/m2K]"
                  value={windowData.u_marco}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Marco"
                  value={windowData.u_marco}
                  onChange={(e) =>
                    setWindowData((prev) => ({
                      ...prev,
                      u_marco: e.target.value,
                    }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk label="FM [%]" value={windowData.fm} />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="FM"
                  value={windowData.fm}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      setWindowData((prev) => ({ ...prev, fm: "" }));
                    } else {
                      const validated = validatePercentage(value);
                      setWindowData((prev) => ({
                        ...prev,
                        fm: validated.toString(),
                      }));
                    }
                  }}
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="Nombre"
                  value={doorData.name_element}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={doorData.name_element}
                  onChange={(e) =>
                    setDoorData((prev) => ({
                      ...prev,
                      name_element: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="U Puerta opaca [W/m2K]"
                  value={doorData.u_puerta_opaca}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Puerta opaca"
                  value={doorData.u_puerta_opaca}
                  onChange={(e) =>
                    setDoorData((prev) => ({
                      ...prev,
                      u_puerta_opaca: e.target.value,
                    }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="Ventana Asociada"
                  value={doorData.ventana_id}
                  required={false}
                />
                <select
                  className="form-control"
                  value={doorData.ventana_id}
                  onChange={(e) => {
                    const winId = e.target.value;
                    setDoorData((prev) => ({
                      ...prev,
                      ventana_id: winId,
                      name_ventana:
                        allWindowsForDoor.find(
                          (win) => win.id === parseInt(winId)
                        )?.name_element || "",
                    }));
                  }}
                >
                  <option value="">Seleccione</option>
                  {allWindowsForDoor.map((win) => (
                    <option key={win.id} value={win.id}>
                      {win.name_element}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="% Vidrio"
                  value={doorData.porcentaje_vidrio}
                  required={false}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="% Vidrio"
                  value={doorData.ventana_id ? doorData.porcentaje_vidrio : ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      setDoorData((prev) => ({
                        ...prev,
                        porcentaje_vidrio: "",
                      }));
                    } else {
                      const validated = validatePercentage(value);
                      setDoorData((prev) => ({
                        ...prev,
                        porcentaje_vidrio: validated.toString(),
                      }));
                    }
                  }}
                  onKeyDown={handleNumberKeyDown}
                  disabled={!doorData.ventana_id}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="U Marco [W/m2K]"
                  value={doorData.u_marco}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="U Marco"
                  value={doorData.u_marco}
                  onChange={(e) =>
                    setDoorData((prev) => ({
                      ...prev,
                      u_marco: e.target.value,
                    }))
                  }
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
              <div className="form-group mb-3">
                <LabelWithAsterisk label="FM [%]" value={doorData.fm} />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="FM"
                  value={doorData.fm}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      setDoorData((prev) => ({ ...prev, fm: "" }));
                    } else {
                      const validated = validatePercentage(value);
                      setDoorData((prev) => ({
                        ...prev,
                        fm: validated.toString(),
                      }));
                    }
                  }}
                  onKeyDown={handleNumberKeyDown}
                />
              </div>
            </div>
          )}
        </ModalCreate>
      )}
    </>
  );
};

export default DataEntryPage;
