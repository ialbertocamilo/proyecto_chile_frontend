import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Modal from "../src/components/common/Modal";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";
import GooIcons from "../public/GoogleIcons";
import Card from "../src/components/common/Card";
import { useRouter } from "next/router";
import Title from "../src/components/Title";
import { notify } from "@/utils/notify";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import SearchParameters from "../src/components/inputs/SearchParameters"; // Importa el componente creado
import CreateButton from "@/components/CreateButton";
import CancelButton from "@/components/common/CancelButton";
import VerticalDivider from "@/components/ui/HorizontalDivider";
import ButtonTab from "@/components/common/ButtonTab";
import GenericTable from "@/components/tables/GenericTable";
import Breadcrumb from "../src/components/common/Breadcrumb";

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
    }
  }, []);

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
      console.error(
        "Complete todos los campos correctamente para crear el material"
      );
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
        notify("Material creado exitosamente");
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
      notify("material-error");
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 400
      ) {
        notify("El material ya existe");
      } else {
        notify("Error al crear el material");
      }
      console.error("Error al crear material:", error);
      return false;
    }
  };

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
      console.error(
        "Complete todos los campos correctamente para crear la ventana"
      );
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
        fm: parseFloat(windowData.fm) / 100,
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

      notify("Ventana creada exitosamente");
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
        notify("La ventana ya existe");
      } else {
        notify("Error al crear la ventana");
      }
      console.error("Error al crear ventana:", error);
      return false;
    }
  };

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
      console.error(
        "Complete todos los campos correctamente para crear la puerta"
      );
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
        fm: parseFloat(doorData.fm) / 100,
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

      notify("Puerta creada exitosamente");
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
        notify("La puerta ya existe");
      } else {
        notify("Error al crear la puerta");
      }
      console.error("Error al crear puerta:", error);
      return false;
    }
  };

  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList();
    }
  }, [step, fetchMaterialsList]);

  useEffect(() => {
    if (step === 5) {
      fetchElements(modalElementType === "ventanas" ? "window" : "door");
    }
  }, [step, modalElementType, fetchElements]);

  useEffect(() => {
    if (step === 5 && modalElementType === "puertas") {
      fetchAllWindowsForDoor();
    }
  }, [step, modalElementType, fetchAllWindowsForDoor]);

  const renderMainHeader = () => step >= 3 && <Title text="Datos de entrada" />;

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

  const sidebarSteps = [
    {
      stepNumber: 3,
      iconName: "imagesearch_roller",
      title: "Lista de materiales",
    },
    {
      stepNumber: 5,
      iconName: "home",
      title: "Elementos translúcidos",
    },
    {
      stepNumber: 6,
      iconName: "deck",
      title: "Perfil de uso",
    },
  ];



  return (
    <>
      <GooIcons />
      <div>
        <Card>
          <Title text={"Ingreso de datos de entrada"} />
          <div className="container-fluid page-title row">
          <Breadcrumb />
        </div>
        </Card>
        <Card>
        <div className="d-flex flex-wrap" style={{ alignItems: "stretch", gap: 0 }}>
                    <AdminSidebar
                      activeStep={step}
                      onStepChange={setStep}
                      steps={sidebarSteps}
                    />
                <VerticalDivider />
                <div className="content p-4" style={{ flex: 1 }}>
                  {step === 3 && (
                    <div className="px-3">
                      <div className="mb-4">
                        <SearchParameters
                          value={materialSearch}
                          onChange={setMaterialSearch}
                          placeholder="Buscar material..."
                          onNew={() => setShowMaterialModal(true)}
                        />
                      </div>
                      <div className="table-responsive">
                        <div className="border rounded overflow-hidden">
                          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                            <table className="table table-hover mb-0">
                              <thead>
                                <tr>
                                  <th style={{ textAlign: "center" }}>
                                    Nombre Material
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Conductividad (W/m2K)
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Calor específico (J/kgK)
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Densidad (kg/m3)
                                  </th>
                                </tr>
                              </thead>
                                <tbody>
                                {materialsList
                                  .filter((mat) =>
                                  mat.atributs.name
                                    .toLowerCase()
                                    .includes(materialSearch.toLowerCase())
                                  )
                                  .map((mat, idx) => (
                                  <tr key={idx}>
                                    <td style={{ textAlign: "center" }}>{mat.atributs.name}</td>
                                    <td style={{ textAlign: "center" }}>{mat.atributs.conductivity}</td>
                                    <td style={{ textAlign: "center" }}>{mat.atributs.specific_heat}</td>
                                    <td style={{ textAlign: "center" }}>{mat.atributs.density}</td>
                                  </tr>
                                  ))}
                                </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="px-3">
                      <div className="mb-4">
                        <SearchParameters
                          value={elementSearch}
                          onChange={setElementSearch}
                          placeholder="Buscar elemento..."
                          onNew={() => setShowElementModal(true)}
                        />
                      </div>


                      <div className="table-responsive">
                        <div className="border rounded overflow-hidden">
                          <div className="bg-white border-bottom">
                            <div className="row g-0">
                              {["Ventanas", "Puertas"].map((tab) => (
                                <div key={tab} className="col-6">
                                  <ButtonTab
                                    label={tab}
                                    active={modalElementType === tab.toLowerCase()}
                                    onClick={() => setModalElementType(tab.toLowerCase())}
                                    primaryColor={primaryColor}/>
                                </div>
                              ))}
                            </div>
                          </div>


                          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                            <table className="table table-hover mb-0">
                              <thead>
                                {modalElementType === "ventanas" ? (
                                  <tr>
                                    <th style={{ textAlign: "center" }}>
                                      Nombre Elemento
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      U Vidrio [W/m2K]
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      FS Vidrio
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Tipo Cierre
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Tipo Marco
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      U Marco [W/m2K]
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      FM [%]
                                    </th>
                                  </tr>
                                ) : (
                                  <tr>
                                    <th style={{ textAlign: "center" }}>
                                      Nombre Elemento
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      U Puerta opaca [W/m2K]
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Nombre Ventana
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      % Vidrio
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      U Marco [W/m2K]
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      FM [%]
                                    </th>
                                  </tr>
                                )}
                              </thead>
                              <tbody>
                                {elementsList
                                  .filter((el) =>
                                    el.name_element
                                      .toLowerCase()
                                      .includes(elementSearch.toLowerCase())
                                  )
                                  .map((el, idx) =>
                                    modalElementType === "ventanas" ? (
                                      <tr key={idx}>
                                        <td>{el.name_element}</td>
                                        <td>{el.atributs.u_vidrio}</td>
                                        <td>{el.atributs.fs_vidrio}</td>
                                        <td>{el.atributs.clousure_type}</td>
                                        <td>{el.atributs.frame_type}</td>
                                        <td>{el.u_marco}</td>
                                        <td>{(el.fm * 100).toFixed(0)}%</td>
                                      </tr>
                                    ) : (
                                      <tr key={idx}>
                                        <td>{el.name_element}</td>
                                        <td>{el.atributs.u_puerta_opaca}</td>
                                        <td>{el.atributs.name_ventana}</td>
                                        <td>
                                          {el.atributs.porcentaje_vidrio !== undefined
                                            ? (
                                              (el.atributs
                                                .porcentaje_vidrio as number) *
                                              100
                                            ).toFixed(0) + "%"
                                            : "0%"}
                                        </td>
                                        <td>{el.u_marco}</td>
                                        <td>{(el.fm * 100).toFixed(0)}%</td>
                                      </tr>
                                    )
                                  )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
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
                            className={`nav-link flex-shrink-0 ${tabTipologiaRecinto === tab.key ? 'active' : ''}`}
                            style={{
                              color: tabTipologiaRecinto === tab.key ? primaryColor : "var(--secondary-color)",
                              borderBottom: tabTipologiaRecinto === tab.key ? `3px solid ${primaryColor}` : "none",
                              whiteSpace: "nowrap"
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
                                {/* Ejemplo de datos estáticos */}
                                <tr>
                                  <td>ES</td>
                                  <td>Espera</td>
                                  <td>8.80</td>
                                  <td>IDA2 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                                <tr>
                                  <td>AU</td>
                                  <td>Auditorio</td>
                                  <td>5.28</td>
                                  <td>IDA3 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                                <tr>
                                  <td>BA</td>
                                  <td>Baño</td>
                                  <td>8.80</td>
                                  <td>IDA2 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                                <tr>
                                  <td>BD</td>
                                  <td>Bodega</td>
                                  <td>8.80</td>
                                  <td>IDA2 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                                <tr>
                                  <td>KI</td>
                                  <td>Cafetería</td>
                                  <td>8.80</td>
                                  <td>IDA2 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                                <tr>
                                  <td>CO</td>
                                  <td>Comedores</td>
                                  <td>8.80</td>
                                  <td>IDA2 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                                <tr>
                                  <td>PA</td>
                                  <td>Pasillos</td>
                                  <td>8.80</td>
                                  <td>IDA2 ✔</td>
                                  <td>Sedentario ✔</td>
                                  <td>-</td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Botón para agregar nuevo registro */}
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
                  )}
                </div>
                </div>
        </Card>
        {showMaterialModal && (
          <Modal
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
            title="Nuevo Material"
          >
            <div>
              <div className="form-group mb-3">
                <LabelWithAsterisk
                  label="Nombre"
                  value={newMaterialData.name}
                />
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
              {!materialIsValid && (
                <div className="mb-3">
                  <p>
                    (<span style={{ color: "red" }}>*</span>) Campos obligatorios
                  </p>
                </div>
              )}
              <div className="d-flex justify-content-end mt-3">
                <CancelButton
                  onClick={() => {
                    setShowMaterialModal(false);
                    setNewMaterialData({
                      name: "",
                      conductivity: "",
                      specific_heat: "",
                      density: "",
                    });
                  }}
                />
                <CustomButton
                  variant="save"
                  onClick={async () => {
                    const success = await handleCreateMaterial();
                    if (success) {
                      setShowMaterialModal(false);
                    }
                  }}
                >
                  Crear Material
                </CustomButton>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal para crear Elemento translúcido */}
        {showElementModal && (
          <Modal
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
            title={
              modalElementType === "ventanas" ? "Nueva Ventana" : "Nueva Puerta"
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
                {!windowIsValid && (
                  <div className="mb-3">
                    <p>
                      (<span style={{ color: "red" }}>*</span>) Campos obligatorios
                    </p>
                  </div>
                )}

                <div className="d-flex justify-content-end mt-3">
                  <CancelButton
                    onClick={() => {
                      setShowMaterialModal(false);
                      setNewMaterialData({
                        name: "",
                        conductivity: "",
                        specific_heat: "",
                        density: "",
                      });
                    }}
                  />
                  <CustomButton
                    variant="save"
                    onClick={async () => {
                      const success = await handleCreateWindowElement();
                      if (success) {
                        setShowElementModal(false);
                      }
                    }}
                  >
                    Crear Ventana
                  </CustomButton>
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
                {!doorIsValid && (
                  <div className="mb-3">
                    <p>
                      (<span style={{ color: "red" }}>*</span>) Campos obligatorios
                    </p>
                  </div>
                )}
                <div className="text-end">
                  <CustomButton
                    variant="save"
                    onClick={() => {
                      setShowElementModal(false);
                      setDoorData({
                        name_element: "",
                        ventana_id: "",
                        name_ventana: "",
                        u_puerta_opaca: "",
                        porcentaje_vidrio: "",
                        u_marco: "",
                        fm: "",
                      });
                    }}
                  >
                    Cancelar
                  </CustomButton>
                  <CustomButton
                    variant="save"
                    onClick={async () => {
                      const success = await handleCreateDoorElement();
                      if (success) {
                        setShowElementModal(false);
                      }
                    }}
                  >
                    Crear Puerta
                  </CustomButton>
                </div>
              </div>
            )}
          </Modal>
        )}


      </div>
    </>
  );
};

export default DataEntryPage;
