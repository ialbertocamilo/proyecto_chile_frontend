import React, { useState, useEffect } from "react";
import useAuth from "../src/hooks/useAuth";
import { useAdministration } from "../src/hooks/useAdministration";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import ModalCreate from "../src/components/common/ModalCreate";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";
import DetallesConstructivosTab from "../src/components/DetallesConstructivosTab";
import Breadcrumb from "../src/components/common/Breadcrumb";
import "bootstrap/dist/css/bootstrap.min.css";

// 1. Importa tu componente de tabla
import TablesParameters from "../src/components/tables/TablesParameters";

interface MaterialAttributes {
  name: string;
  conductivity: number;
  specific_heat: number;
  density: number;
}

export interface Detail {
  id: number;
  scantilon_location: string;
  name_detail: string;
  material_id: number;
  layer_thickness: number;
  created_status?: string;
  is_deleted?: boolean;
}

interface ElementAttributesDoor {
  u_puerta_opaca: number;
  porcentaje_vidrio: number;
  ventana_id: number;
  name_ventana: string;
}

interface ElementAttributesWindow {
  u_vidrio: number;
  fs_vidrio: number;
  frame_type: string;
  clousure_type: string;
}

// Componente auxiliar para renderizar etiquetas que indiquen campos obligatorios
interface LabelWithAsteriskProps {
  label: string;
  value: string | number;
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
    (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && value === 0);

  return (
    <label>
      {label} {required && isEmpty && <span style={{ color: "red" }}>*</span>}
    </label>
  );
};

const AdministrationPage: React.FC = () => {
  useAuth();

  const [step, setStep] = useState<number>(3);
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");
  const [showGeneralDetails, setShowGeneralDetails] = useState(false);

  const {
    materialsList,
    details,
    elementsList,
    fetchMaterialsList,
    fetchDetails,
    fetchElements,
    handleLogout,
  } = useAdministration();

  // Estados para nuevos Materiales, Detalles, Ventanas y Puertas
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState<MaterialAttributes>({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });

  const [showNewDetailModal, setShowNewDetailModal] = useState(false);
  const [newDetail, setNewDetail] = useState<{
    scantilon_location: string;
    name_detail: string;
    material_id: number;
    layer_thickness: number | null;
  }>({
    scantilon_location: "",
    name_detail: "",
    material_id: 0,
    layer_thickness: null,
  });

  const [showNewWindowModal, setShowNewWindowModal] = useState(false);
  const [newWindow, setNewWindow] = useState({
    name_element: "",
    u_vidrio: 0,
    fs_vidrio: 0,
    clousure_type: "Corredera",
    frame_type: "",
    u_marco: 0,
    fm: 0,
  });

  const [showNewDoorModal, setShowNewDoorModal] = useState(false);
  const [newDoor, setNewDoor] = useState({
    name_element: "",
    u_puerta_opaca: 0,
    ventana_id: 0,
    u_marco: 0,
    fm: 0,
    porcentaje_vidrio: 0,
  });

  const windowsList = elementsList.filter((el) => el.type === "window");

  // 2. Define columnas y mapea datos para cada tabla
  //    ---------------------------------------------
  //
  //    A) Para materiales (Step 3)
  //
  const materialsColumns = [
    { headerName: "Nombre Material", field: "name" },
    { headerName: "Conductividad (W/m2K)", field: "conductivity" },
    { headerName: "Calor específico (J/kgK)", field: "specific_heat" },
    { headerName: "Densidad (kg/m3)", field: "density" },
  ];

  const materialsData = materialsList.map((mat: any) => ({
    name: mat.atributs.name,
    conductivity: mat.atributs.conductivity,
    specific_heat: mat.atributs.specific_heat,
    density: mat.atributs.density,
  }));

  //    B) Para detalles (Step 4)
  //
  const detailsColumns = [
    { headerName: "Ubicación", field: "scantilon_location" },
    { headerName: "Nombre Detalle", field: "name_detail" },
    { headerName: "Material", field: "material_name" },
    { headerName: "Espesor (cm)", field: "layer_thickness" },
  ];

  const detailsData = details.map((detail) => ({
    scantilon_location: detail.scantilon_location,
    name_detail: detail.name_detail,
    material_name: getMaterialName(detail.material_id),
    layer_thickness: detail.layer_thickness,
  }));

  //    C) Para ventanas (Step 5)
  //
  const windowsColumns = [
    { headerName: "Nombre Elemento", field: "name_element" },
    { headerName: "U Vidrio [W/m2K]", field: "u_vidrio" },
    { headerName: "FS Vidrio", field: "fs_vidrio" },
    { headerName: "Tipo Cierre", field: "clousure_type" },
    { headerName: "Tipo Marco", field: "frame_type" },
    { headerName: "U Marco [W/m2K]", field: "u_marco" },
    { headerName: "FM [%]", field: "fm" },
  ];

  const windowsData = elementsList
    .filter((el) => el.type === "window")
    .map((el) => ({
      name_element: el.name_element,
      u_vidrio: (el.atributs as ElementAttributesWindow).u_vidrio,
      fs_vidrio: (el.atributs as ElementAttributesWindow).fs_vidrio,
      clousure_type: (el.atributs as ElementAttributesWindow).clousure_type,
      frame_type: (el.atributs as ElementAttributesWindow).frame_type,
      u_marco: el.u_marco,
      fm: (el.fm * 100).toFixed(0) + "%",
    }));

  //    D) Para puertas (Step 5)
  //
  const doorsColumns = [
    { headerName: "Nombre Elemento", field: "name_element" },
    { headerName: "U Puerta opaca [W/m2K]", field: "u_puerta_opaca" },
    { headerName: "Nombre Ventana", field: "name_ventana" },
    { headerName: "% Vidrio", field: "porcentaje_vidrio" },
    { headerName: "U Marco [W/m2K]", field: "u_marco" },
    { headerName: "FM [%]", field: "fm" },
  ];

  const doorsData = elementsList
    .filter((el) => el.type === "door")
    .map((el) => ({
      name_element: el.name_element,
      u_puerta_opaca: (el.atributs as ElementAttributesDoor).u_puerta_opaca,
      name_ventana: (el.atributs as ElementAttributesDoor).name_ventana,
      porcentaje_vidrio:
        ((el.atributs as ElementAttributesDoor).porcentaje_vidrio * 100).toFixed(0) + "%",
      u_marco: el.u_marco,
      fm: (el.fm * 100).toFixed(0) + "%",
    }));

  // 3. Función para obtener el nombre del material a partir de su ID
  function getMaterialName(materialId: number) {
    const mat = materialsList.find(
      (m) => m.id === materialId || m.material_id === materialId
    );
    return mat ? mat.atributs.name : "Desconocido";
  }

  // 4. Funciones para crear Material, Detalle, Ventana y Puerta
  //    (mantenemos la lógica que ya tenías)
  const handleCreateMaterial = async () => {
    if (
      newMaterialData.name.trim() === "" ||
      newMaterialData.conductivity <= 0 ||
      newMaterialData.specific_heat <= 0 ||
      newMaterialData.density <= 0
    ) {
      notify("Por favor complete todos los campos de material");
      return;
    }
    // Validación si el material ya existe
    const materialExists = materialsList.some(
      (mat: any) =>
        (mat.atributs.name as string).trim().toLowerCase() ===
        newMaterialData.name.trim().toLowerCase()
    );
    if (materialExists) {
      notify(`El Nombre del Material ya existe`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notify("Token no encontrado. Inicia sesión.");
        return;
      }
      const payload = {
        atributs: {
          name: newMaterialData.name,
          density: newMaterialData.density,
          conductivity: newMaterialData.conductivity,
          specific_heat: newMaterialData.specific_heat,
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
      const response = await axios.post(url, payload, { headers });
      if (response.status === 200) {
        notify(`El material "${newMaterialData.name}" fue creado correctamente`);
        await fetchMaterialsList(1);
        setShowNewMaterialModal(false);
        setNewMaterialData({
          name: "",
          conductivity: 0,
          specific_heat: 0,
          density: 0,
        });
      }
    } catch (error: unknown) {
      console.error("[handleCreateMaterial] Error:", error);
      notify("No se pudo crear el material");
    }
  };

  const handleCreateDetail = async () => {
    if (
      newDetail.scantilon_location.trim() === "" ||
      newDetail.name_detail.trim() === "" ||
      newDetail.material_id <= 0 ||
      newDetail.layer_thickness === null ||
      newDetail.layer_thickness <= 0
    ) {
      notify("Por favor complete todos los campos de detalle");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notify("Token no encontrado. Inicia sesión.");
        return;
      }
      const payload = {
        scantilon_location: newDetail.scantilon_location,
        name_detail: newDetail.name_detail,
        material_id: newDetail.material_id,
        layer_thickness: newDetail.layer_thickness,
      };
      const url = `${constantUrlApiEndpoint}/details/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(url, payload, { headers });
      if (response.status === 200) {
        notify(`El detalle "${newDetail.name_detail}" fue creado correctamente`);
        setShowNewDetailModal(false);
        setNewDetail({
          scantilon_location: "",
          name_detail: "",
          material_id: 0,
          layer_thickness: null,
        });
        await fetchDetails();
      }
    } catch (error: unknown) {
      console.error("[handleCreateDetail] Error:", error);
      notify("No se pudo crear el detalle");
    }
  };

  const handleCreateElement = async () => {
    if (tabElementosOperables === "ventanas") {
      if (
        newWindow.name_element.trim() === "" ||
        newWindow.u_vidrio <= 0 ||
        newWindow.fs_vidrio <= 0 ||
        newWindow.u_marco <= 0 ||
        newWindow.fm < 0 ||
        newWindow.fm > 100 ||
        newWindow.clousure_type.trim() === "" ||
        newWindow.frame_type.trim() === ""
      ) {
        notify("Por favor complete todos los campos de la ventana correctamente");
        return;
      }
      // Validación si la ventana ya existe
      const windowExists = elementsList
        .filter((el) => el.type === "window")
        .some(
          (el) =>
            el.name_element.trim().toLowerCase() ===
            newWindow.name_element.trim().toLowerCase()
        );
      if (windowExists) {
        notify(`El Nombre de la Ventana ya existe`);
        return;
      }
    } else {
      // Puertas
      if (
        newDoor.name_element.trim() === "" ||
        newDoor.u_puerta_opaca <= 0 ||
        newDoor.u_marco <= 0 ||
        newDoor.fm < 0 ||
        newDoor.fm > 100
      ) {
        notify("Por favor complete todos los campos de la puerta correctamente");
        return;
      }
      // % vidrio si hay ventana asociada
      if (newDoor.ventana_id !== 0) {
        if (newDoor.porcentaje_vidrio < 0 || newDoor.porcentaje_vidrio > 100) {
          notify("Asegúrese de que el % de vidrio esté entre 0 y 100");
          return;
        }
      } else {
        newDoor.porcentaje_vidrio = 0;
      }
      // Validación si la puerta ya existe
      const doorExists = elementsList
        .filter((el) => el.type === "door")
        .some(
          (el) =>
            el.name_element.trim().toLowerCase() ===
            newDoor.name_element.trim().toLowerCase()
        );
      if (doorExists) {
        notify(`El Nombre de la Puerta ya existe`);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notify("Token no encontrado. Inicia sesión.");
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const url = `${constantUrlApiEndpoint}/elements/create`;

      let payload;
      if (tabElementosOperables === "ventanas") {
        payload = {
          type: "window",
          name_element: newWindow.name_element,
          u_marco: newWindow.u_marco,
          fm: newWindow.fm,
          atributs: {
            u_vidrio: newWindow.u_vidrio,
            fs_vidrio: newWindow.fs_vidrio,
            frame_type: newWindow.frame_type,
            clousure_type: newWindow.clousure_type,
          },
        };
      } else {
        const ventanaSeleccionada = windowsList.find(
          (win) => win.id === newDoor.ventana_id
        );
        payload = {
          type: "door",
          name_element: newDoor.name_element,
          u_marco: newDoor.u_marco,
          fm: newDoor.fm,
          atributs: {
            ventana_id: newDoor.ventana_id,
            name_ventana: ventanaSeleccionada
              ? ventanaSeleccionada.name_element
              : "",
            u_puerta_opaca: newDoor.u_puerta_opaca,
            porcentaje_vidrio: newDoor.porcentaje_vidrio,
          },
        };
      }
      await axios.post(url, payload, { headers });

      if (tabElementosOperables === "ventanas") {
        notify(`La ventana "${newWindow.name_element}" fue creada correctamente`);
        setShowNewWindowModal(false);
        setNewWindow({
          name_element: "",
          u_vidrio: 0,
          fs_vidrio: 0,
          clousure_type: "Corredera",
          frame_type: "",
          u_marco: 0,
          fm: 0,
        });
      } else {
        notify(`La puerta "${newDoor.name_element}" fue creada correctamente`);
        setShowNewDoorModal(false);
        setNewDoor({
          name_element: "",
          u_puerta_opaca: 0,
          ventana_id: 0,
          u_marco: 0,
          fm: 0,
          porcentaje_vidrio: 0,
        });
      }
      await fetchElements();
    } catch (error: unknown) {
      console.error("[handleCreateElement] Error:", error);
      notify("No se pudo crear el elemento");
    }
  };

  // 5. Actualizar data al cambiar de step
  useEffect(() => {
    if (step === 3) fetchMaterialsList(1);
    if (step === 4) fetchDetails();
    if (step === 5) fetchElements();
  }, [step, fetchMaterialsList, fetchDetails, fetchElements]);

  const sidebarSteps = [
    { stepNumber: 3, iconName: "assignment_ind", title: "Lista de Materiales" },
    { stepNumber: 4, iconName: "build", title: "Detalles Constructivos" },
    { stepNumber: 5, iconName: "home", title: "Elementos Translúcidos" },
  ];

  return (
    <>
      {/* Header */}
      <Card className="header-card">
        <div className="d-flex align-items-center w-100">
          <Title text="Administración de Parámetros" />
          <Breadcrumb
            items={[
              {
                title: "Administración de Parámetros",
                href: "/",
                active: true,
              },
            ]}
          />
        </div>
      </Card>

      {/* Card principal */}
      <Card>
  <div className="row">
    {/* Columna para Sidebar */}
    <div className="col-12 col-md-3">
      <AdminSidebar
        activeStep={step}
        onStepChange={setStep}
        steps={sidebarSteps}
      />
    </div>

    {/* Columna para Contenido principal (la tabla y demás) */}
    <div className="col-12 col-md-9 p-4">
      {/* Step 3: Tabla de Materiales */}
      {step === 3 && (
        <>
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {/* Uso de TablesParameters */}
              <TablesParameters columns={materialsColumns} data={materialsData} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
            <CustomButton variant="save" onClick={() => setShowNewMaterialModal(true)}>
              <span className="material-icons">add</span> Nuevo
            </CustomButton>
          </div>
        </>
      )}

      {/* Step 4: Detalles Constructivos */}
      {step === 4 && (
        <>
          {showGeneralDetails ? (
            <div>
              <div className="tabs-container">
                <div className="tab active" style={{ flex: 1, textAlign: "center" }}>
                  Detalles Generales
                </div>
              </div>
              <div style={{ overflow: "hidden", padding: "10px" }}>
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <TablesParameters columns={detailsColumns} data={detailsData} />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                }}
              >
                <CustomButton variant="save" onClick={() => setShowGeneralDetails(false)}>
                  <span className="material-icons">arrow_back</span> Volver
                </CustomButton>
                <CustomButton variant="save" onClick={() => setShowNewDetailModal(true)}>
                  <span className="material-icons">add</span> Nuevo
                </CustomButton>
              </div>
            </div>
          ) : (
            <>
              <DetallesConstructivosTab />
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
                <CustomButton
                  variant="save"
                  onClick={() => {
                    fetchDetails();
                    setShowGeneralDetails(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "clamp(0.5rem, 1vw, 1rem) clamp(1rem, 4vw, 2rem)",
                    height: "min(3rem, 8vh)",
                    minWidth: "6rem",
                    marginLeft: "10px",
                    marginTop: "2rem",
                  }}
                >
                  <span className="material-icons">visibility</span> Ver detalles generales
                </CustomButton>
              </div>
            </>
          )}
        </>
      )}

      {/* Step 5: Elementos Translúcidos */}
      {step === 5 && (
        <>
          <div style={{ overflow: "hidden", padding: "10px" }}>
            <div
              className="d-flex justify-content-between align-items-center mb-2"
              style={{ padding: "10px" }}
            >
              <ul
                className="nav"
                style={{
                  display: "flex",
                  padding: 0,
                  listStyle: "none",
                  margin: 0,
                  flex: 1,
                  gap: "10px",
                }}
              >
                {["Ventanas", "Puertas"].map((tab) => (
                  <li key={tab} style={{ flex: 1 }}>
                    <button
                      style={{
                        width: "100%",
                        padding: "0px",
                        backgroundColor: "#fff",
                        color:
                          tabElementosOperables === tab.toLowerCase()
                            ? "var(--primary-color)"
                            : "var(--secondary-color)",
                        border: "none",
                        cursor: "pointer",
                        borderBottom:
                          tabElementosOperables === tab.toLowerCase()
                            ? "solid var(--primary-color)"
                            : "none",
                      }}
                      onClick={() => setTabElementosOperables(tab.toLowerCase())}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ maxHeight: "500px", overflowY: "auto", padding: "10px" }}>
              <TablesParameters
                columns={
                  tabElementosOperables === "ventanas" ? windowsColumns : doorsColumns
                }
                data={
                  tabElementosOperables === "ventanas" ? windowsData : doorsData
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
            {tabElementosOperables === "ventanas" ? (
              <CustomButton variant="save" onClick={() => setShowNewWindowModal(true)}>
                <span className="material-icons">add</span> Nuevo
              </CustomButton>
            ) : (
              <CustomButton variant="save" onClick={() => setShowNewDoorModal(true)}>
                <span className="material-icons">add</span> Nuevo
              </CustomButton>
            )}
          </div>
        </>
      )}
    </div>
  </div>
</Card>


      {/* Modales para Material, Detalle, Ventana y Puerta */}
      {showNewMaterialModal && (
        <ModalCreate
          isOpen={showNewMaterialModal}
          onClose={() => {
            setShowNewMaterialModal(false);
            setNewMaterialData({
              name: "",
              conductivity: 0,
              specific_heat: 0,
              density: 0,
            });
          }}
          onSave={async () => {
            await handleCreateMaterial();
          }}
          title="Agregar Nuevo Material"
          saveLabel="Crear Material"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateMaterial();
            }}
          >
            <div className="form-group">
              <LabelWithAsterisk label="Nombre Material" value={newMaterialData.name} />
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
            <div className="form-group">
              <LabelWithAsterisk
                label="Conductividad (W/m2K)"
                value={newMaterialData.conductivity}
              />
              <input
                type="number"
                className="form-control"
                placeholder="Conductividad"
                value={newMaterialData.conductivity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewMaterialData((prev) => ({
                    ...prev,
                    conductivity: isNaN(value) ? 0 : value,
                  }));
                }}
                min="0"
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk
                label="Calor específico (J/kgK)"
                value={newMaterialData.specific_heat}
              />
              <input
                type="number"
                className="form-control"
                placeholder="Calor específico"
                value={newMaterialData.specific_heat}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewMaterialData((prev) => ({
                    ...prev,
                    specific_heat: isNaN(value) ? 0 : value,
                  }));
                }}
                min="0"
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk label="Densidad (kg/m3)" value={newMaterialData.density} />
              <input
                type="number"
                className="form-control"
                placeholder="Densidad"
                value={newMaterialData.density}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewMaterialData((prev) => ({
                    ...prev,
                    density: isNaN(value) ? 0 : value,
                  }));
                }}
                min="0"
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {showNewDetailModal && (
        <ModalCreate
          isOpen={showNewDetailModal}
          onClose={() => {
            setShowNewDetailModal(false);
            setNewDetail({
              scantilon_location: "",
              name_detail: "",
              material_id: 0,
              layer_thickness: null,
            });
          }}
          onSave={async () => {
            await handleCreateDetail();
          }}
          title="Agregar Nuevo Detalle Constructivo"
          saveLabel="Crear Detalle"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateDetail();
            }}
          >
            <div className="form-group">
              <LabelWithAsterisk
                label="Ubicación del Detalle"
                value={newDetail.scantilon_location}
              />
              <select
                className="form-control"
                value={newDetail.scantilon_location}
                onChange={(e) =>
                  setNewDetail((prev) => ({
                    ...prev,
                    scantilon_location: e.target.value,
                  }))
                }
              >
                <option value="">Seleccione</option>
                <option value="Techo">Techo</option>
                <option value="Muro">Muro</option>
                <option value="Piso">Piso</option>
              </select>
            </div>
            <div className="form-group">
              <LabelWithAsterisk label="Nombre del Detalle" value={newDetail.name_detail} />
              <input
                type="text"
                className="form-control"
                placeholder="Nombre Detalle"
                value={newDetail.name_detail}
                onChange={(e) =>
                  setNewDetail((prev) => ({
                    ...prev,
                    name_detail: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk label="Material" value={newDetail.material_id} />
              <select
                className="form-control"
                value={newDetail.material_id}
                onChange={(e) =>
                  setNewDetail((prev) => ({
                    ...prev,
                    material_id: parseInt(e.target.value),
                  }))
                }
              >
                <option value={0}>Seleccione un material</option>
                {materialsList.map((mat: any) => (
                  <option key={mat.material_id} value={mat.material_id}>
                    {mat.atributs.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <LabelWithAsterisk
                label="Espesor de la Capa (cm)"
                value={newDetail.layer_thickness ?? ""}
              />
              <input
                type="number"
                className="form-control"
                placeholder="Espesor (cm)"
                value={newDetail.layer_thickness || ""}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const value = inputValue === "" ? null : parseFloat(inputValue);
                  setNewDetail((prev) => ({
                    ...prev,
                    layer_thickness: value,
                  }));
                }}
                min="0"
                step="0.01"
                onKeyDown={(e) => {
                  if (["-", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </form>
        </ModalCreate>
      )}

      {showNewWindowModal && (
        <ModalCreate
          isOpen={showNewWindowModal}
          onClose={() => {
            setShowNewWindowModal(false);
            setNewWindow({
              name_element: "",
              u_vidrio: 0,
              fs_vidrio: 0,
              clousure_type: "Corredera",
              frame_type: "",
              u_marco: 0,
              fm: 0,
            });
          }}
          onSave={async () => {
            await handleCreateElement();
          }}
          title="Agregar Nueva Ventana"
          saveLabel="Crear Ventana"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateElement();
            }}
          >
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk
                    label="Nombre del Elemento"
                    value={newWindow.name_element}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre"
                    value={newWindow.name_element}
                    onChange={(e) =>
                      setNewWindow((prev) => ({
                        ...prev,
                        name_element: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk
                    label="U Vidrio [W/m2K]"
                    value={newWindow.u_vidrio}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="U Vidrio"
                    value={newWindow.u_vidrio}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setNewWindow((prev) => ({
                        ...prev,
                        u_vidrio: isNaN(value) ? 0 : value,
                      }));
                    }}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk label="FS Vidrio" value={newWindow.fs_vidrio} />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="FS Vidrio"
                    value={newWindow.fs_vidrio}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setNewWindow((prev) => ({
                        ...prev,
                        fs_vidrio: isNaN(value) ? 0 : value,
                      }));
                    }}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk
                    label="Tipo de Cierre"
                    value={newWindow.clousure_type}
                  />
                  <select
                    className="form-control"
                    value={newWindow.clousure_type}
                    onChange={(e) =>
                      setNewWindow((prev) => ({
                        ...prev,
                        clousure_type: e.target.value,
                      }))
                    }
                  >
                    <option value="Corredera">Corredera</option>
                    <option value="Abatir">Abatir</option>
                    <option value="Fija">Fija</option>
                    <option value="Guillotina">Guillotina</option>
                    <option value="Proyectante">Proyectante</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk label="Tipo de Marco" value={newWindow.frame_type} />
                  <select
                    className="form-control"
                    value={newWindow.frame_type}
                    onChange={(e) =>
                      setNewWindow((prev) => ({
                        ...prev,
                        frame_type: e.target.value,
                      }))
                    }
                  >
                    <option value="">Seleccione</option>
                    <option value="Fierro">Fierro</option>
                    <option value="Madera Con RPT">Madera Con RPT</option>
                    <option value="Madera Sin RPT">Madera Sin RPT</option>
                    <option value="Metalico Con RPT">Metálico Con RPT</option>
                    <option value="Metalico Sin RPT">Metálico Sin RPT</option>
                    <option value="PVC Con RPT">PVC Con RPT</option>
                    <option value="PVC Sin RPT">PVC Sin RPT</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk
                    label="U Marco [W/m2K]"
                    value={newWindow.u_marco}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="U Marco"
                    value={newWindow.u_marco}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setNewWindow((prev) => ({
                        ...prev,
                        u_marco: isNaN(value) ? 0 : value,
                      }));
                    }}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <LabelWithAsterisk label="FM [%]" value={newWindow.fm} />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="FM (%)"
                    value={newWindow.fm}
                    onChange={(e) => {
                      let value = parseFloat(e.target.value);
                      if (isNaN(value)) value = 0;
                      if (value < 0) value = 0;
                      if (value > 100) value = 100;
                      setNewWindow((prev) => ({ ...prev, fm: value }));
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </form>
        </ModalCreate>
      )}

      {showNewDoorModal && (
        <ModalCreate
          isOpen={showNewDoorModal}
          onClose={() => {
            setShowNewDoorModal(false);
            setNewDoor({
              name_element: "",
              u_puerta_opaca: 0,
              ventana_id: 0,
              u_marco: 0,
              fm: 0,
              porcentaje_vidrio: 0,
            });
          }}
          onSave={async () => {
            await handleCreateElement();
          }}
          title="Agregar Nueva Puerta"
          saveLabel="Crear Puerta"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateElement();
            }}
          >
            <div className="form-group">
              <LabelWithAsterisk label="Nombre del Elemento" value={newDoor.name_element} />
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                value={newDoor.name_element}
                onChange={(e) =>
                  setNewDoor((prev) => ({
                    ...prev,
                    name_element: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk
                label="U Puerta opaca [W/m2K]"
                value={newDoor.u_puerta_opaca}
              />
              <input
                type="number"
                className="form-control"
                placeholder="U Puerta opaca"
                value={newDoor.u_puerta_opaca}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewDoor((prev) => ({
                    ...prev,
                    u_puerta_opaca: isNaN(value) ? 0 : value,
                  }));
                }}
                min="0"
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk
                label="Ventana Asociada"
                value={newDoor.ventana_id}
                required={false}
              />
              <select
                className="form-control"
                value={newDoor.ventana_id}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  // Si no se selecciona ventana, se resetea el % de vidrio a 0
                  setNewDoor((prev) => ({
                    ...prev,
                    ventana_id: value,
                    porcentaje_vidrio: value === 0 ? 0 : prev.porcentaje_vidrio,
                  }));
                }}
              >
                <option value={0}>Seleccione una ventana</option>
                {windowsList.map((win) => (
                  <option key={win.id} value={win.id}>
                    {win.name_element}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <LabelWithAsterisk
                label="% Vidrio"
                value={newDoor.porcentaje_vidrio}
                required={false}
              />
              <input
                type="number"
                className="form-control"
                placeholder="% Vidrio"
                value={newDoor.porcentaje_vidrio}
                onChange={(e) => {
                  let value = parseFloat(e.target.value);
                  if (isNaN(value)) value = 0;
                  if (value < 0) value = 0;
                  if (value > 100) value = 100;
                  setNewDoor((prev) => ({ ...prev, porcentaje_vidrio: value }));
                }}
                min="0"
                max="100"
                disabled={newDoor.ventana_id === 0}
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk label="U Marco [W/m2K]" value={newDoor.u_marco} />
              <input
                type="number"
                className="form-control"
                placeholder="U Marco"
                value={newDoor.u_marco}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewDoor((prev) => ({
                    ...prev,
                    u_marco: isNaN(value) ? 0 : value,
                  }));
                }}
                min="0"
              />
            </div>
            <div className="form-group">
              <LabelWithAsterisk label="FM [%]" value={newDoor.fm} />
              <input
                type="number"
                className="form-control"
                placeholder="FM (%)"
                value={newDoor.fm}
                onChange={(e) => {
                  let value = parseFloat(e.target.value);
                  if (isNaN(value)) value = 0;
                  if (value < 0) value = 0;
                  if (value > 100) value = 100;
                  setNewDoor((prev) => ({ ...prev, fm: value }));
                }}
                min="0"
                max="100"
              />
            </div>
          </form>
        </ModalCreate>
      )}
      <style jsx>{`
        .custom-container {
          padding: 0 15px;
        }
        .bordered-main-card {
          margin: 2rem auto;
          border: 1px solid #ccc;
          border-radius: 8px;
          width: 100%;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          position: relative;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 80%;
          max-width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
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
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .table-striped tbody tr:nth-child(odd),
        .table-striped tbody tr:nth-child(even) {
          background-color: #ffffff;
        }
        .table tbody tr:hover {
          background-color: rgba(60, 167, 183, 0.05) !important;
          cursor: pointer;
        }
        .table {
          transition: opacity 0.3s ease;
        }
        .table tbody tr {
          transition: background-color 0.3s ease, transform 0.2s ease;
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
        /* Estilos de pestañas para la vista de detalles generales */
        .tabs-container {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid #eee;
        }
        .tab {
          position: relative;
          padding-bottom: 0.5rem;
          color: #999;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 400;
          transition: all 0.3s ease;
        }
        .tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          color: #6dbdc9;
        }
        .tab.active {
          color: #6dbdc9;
          font-weight: 600;
        }
        .tab.active::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: #6dbdc9;
        }
        .table tbody tr:hover {
          background-color: rgba(60, 167, 183, 0.05) !important;
          cursor: pointer;
        }

        /* Animaciones y transiciones */
        .nav-item div {
          transition: all 0.3s ease;
        }

        .nav-item div:hover {
          transform: translateX(10px);
          box-shadow: 0 2px 8px rgba(60, 167, 183, 0.1);
        }

        .nav-item i {
          transition: transform 0.3s ease;
        }

        .nav-item:hover i {
          transform: scale(1.2);
        }

        .table {
          transition: opacity 0.3s ease;
        }

        .table tbody tr {
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .table tbody tr:hover {
          background-color: rgba(60, 167, 183, 0.05) !important;
          cursor: pointer;
        }

        .modal-overlay {
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          animation: slideIn 0.3s ease;
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .content-area > div {
          animation: fadeIn 0.3s ease;
        }

        .table tbody tr {
          animation: fadeIn 0.5s ease;
        }

        * {
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color), #4fd1c5);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px) scale(1.005);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: rgba(60, 167, 183, 0.3);
        }

        .card:hover::before {
          transform: scaleX(1);
        }

        .bordered-main-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(60, 167, 183, 0.1);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin: 2rem auto;
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .card::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 50%
          );
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
        }

        .card:hover::after {
          opacity: 1;
          transform: scale(1);
        }

        .sidebar-item {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item-content {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          backdrop-filter: blur(10px);
        }

        .sidebar-item-content::before,
        .sidebar-item-content::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 12px;
          transition: all 0.4s ease;
        }

        .sidebar-item-content::before {
          z-index: -2;
          background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            rgba(79, 209, 197, 0.5) 100%
          );
          opacity: 0;
          transform: translateX(-100%);
        }

        .sidebar-item-content::after {
          z-index: -1;
          background: white;
          margin: 1px;
          border-radius: 11px;
        }

        .sidebar-item-content:hover {
          transform: translateX(8px) translateZ(10px);
          box-shadow: 0 2px 25px rgba(60, 167, 183, 0.1);
        }

        .sidebar-item-content:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        .sidebar-item-content.active {
          transform: translateX(8px) translateZ(20px);
        }

        .icon-wrapper {
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: center;
        }

        .sidebar-item-content:hover .icon-wrapper {
          transform: scale(1.2) rotate(8deg);
          filter: drop-shadow(0 2px 4px rgba(60, 167, 183, 0.3));
        }

        .title-wrapper {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0.9;
          transform-origin: left;
          position: relative;
        }

        .title-wrapper::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 100%;
          height: 2px;
          background: var(--primary-color);
          transform: scaleX(0);
          transition: transform 0.4s ease;
          transform-origin: right;
        }

        .sidebar-item-content:hover .title-wrapper {
          opacity: 1;
          transform: translateX(5px) scale(1.02);
          letter-spacing: 0.2px;
        }

        .sidebar-item-content:hover .title-wrapper::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        .sidebar-item-content.active .title-wrapper {
          font-weight: 500;
          letter-spacing: 0.3px;
          color: var(--primary-color);
        }

        @keyframes sidebarItemAppear {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.9);
          }
          60% {
            transform: translateX(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .sidebar-item {
          animation: sidebarItemAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
          animation-delay: calc(var(--item-index, 0) * 0.1s);
        }

        @keyframes softPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        .sidebar-item-content:hover {
          animation: softPulse 2s infinite;
        }

        .card-content {
          position: relative;
          z-index: 1;
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          animation: cardAppear 0.5s ease-out forwards;
        }

        .card:hover {
          transform: translateY(-5px) scale(1.005);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12),
            0 4px 8px rgba(60, 167, 183, 0.1);
        }

        .sidebar-item {
          perspective: 1000px;
        }

        .sidebar-item-content {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .sidebar-item-content::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(180deg, var(--primary-color), #4fd1c5);
          transform: scaleY(0);
          transition: transform 0.3s ease;
          transform-origin: top;
        }

        .sidebar-item-content.active::before {
          transform: scaleY(1);
        }

        .sidebar-item-content:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 15px rgba(60, 167, 183, 0.1);
        }

        .icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: all 0.3s ease;
        }

        .sidebar-item-content:hover .icon-wrapper {
          transform: scale(1.2) rotate(5deg);
        }

        .title-wrapper {
          position: relative;
          transition: all 0.3s ease;
          opacity: 0.8;
        }

        .sidebar-item-content:hover .title-wrapper {
          opacity: 1;
          transform: translateX(5px);
        }

        .sidebar-item-content.active {
          background: rgba(60, 167, 183, 0.05);
          border-color: var(--primary-color) !important;
          box-shadow: 0 4px 15px rgba(60, 167, 183, 0.1);
        }

        .sidebar-item-content.active .title-wrapper {
          opacity: 1;
          font-weight: 500;
        }

        @keyframes itemAppear {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .sidebar-item {
          animation: itemAppear 0.5s ease-out forwards;
          animation-delay: calc(var(--item-index) * 0.1s);
        }


        .tab {
          position: relative;
          padding-bottom: 0.5rem;
          color: #999;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 400;
        }

        .tab.active {
          color: #6dbdc9;
          font-weight: 600;
        }

        .tab.active::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #6dbdc9;
        }
          
       /* Pestaña base */
.tab {
  position: relative;
  padding-bottom: 0.5rem;
  color: #999;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 400;
  transition: all 0.3s ease;  /* Para suavizar la animación */
}

/* Efecto hover: se “eleva” y muestra sombra */
.tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  color: #6dbdc9;  /* Podrías resaltar su color también */
}

/* Pestaña activa (subrayada) */
.tab.active {
  color: #6dbdc9;
  font-weight: 600;
}

/* Subrayado más grueso en la pestaña activa */
.tab.active::after {
  content: "";
  position: absolute;
  bottom: -2px; /* ajusta para centrar la línea */
  left: 0;
  width: 100%;
  height: 4px;  /* grosor del subrayado */
  background-color: #6dbdc9;
}

.card {
  overflow: hidden;
  /* el resto de tus estilos ya existentes */
}
      `}</style>
    </>
  );
};

export default AdministrationPage;
