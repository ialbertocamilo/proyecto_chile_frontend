import React, { useState, useEffect } from "react";
import useAuth from "../src/hooks/useAuth";
import { useAdministration } from "../src/hooks/useAdministration";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import ModalCreate from "../src/components/common/ModalCreate";
import { notify } from "@/utils/notify";
import Breadcrumb from "../src/components/common/Breadcrumb";
import TablesParameters from "../src/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import SearchParameters from "../src/components/inputs/SearchParameters";
import { useCrudOperations } from "../src/hooks/useCrudOperations";
import ConstructiveDetailsComponent from "@/components/ConstructiveDetailsComponent";
import UseProfileTab from "../src/components/UseProfileTab";

// Se agrega create_status en el modelo de MaterialAttributes
interface MaterialAttributes {
  name: string;
  conductivity: number;
  specific_heat: number;
  density: number;
  create_status?: string;
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

// Se agrega create_status en los atributos de ElementAttributesDoor y ElementAttributesWindow si se requiriera
interface ElementAttributesDoor {
  u_puerta_opaca: number;
  porcentaje_vidrio: number;
  ventana_id: number;
  name_ventana: string;
  created_status?: string;
}

interface ElementAttributesWindow {
  u_vidrio: number;
  fs_vidrio: number;
  frame_type: string;
  clousure_type: string;
  created_status?: string;
}

interface ConfirmModalProps {
  onConfirm: () => Promise<void>;
  message: string;
}

const AdministrationPage: React.FC = () => {
  useAuth();
  const { handleCreate, handleEdit, handleDelete } = useCrudOperations();
  const {
    materialsList,
    elementsList,
    fetchMaterialsList,
    fetchElements,
    handleLogout,
  } = useAdministration();

  // Definición de la variable para el color primario
  const primaryColor = "var(--primary-color)";

  // Estados para steps y tabs
  const [step, setStep] = useState<number>(3);
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");

  // Estados para búsqueda
  const [searchMaterial, setSearchMaterial] = useState("");
  const [searchElement, setSearchElement] = useState("");

  // Estados para modales de creación/edición
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState<MaterialAttributes>({
    name: "",
    conductivity: 0,
    specific_heat: 0,
    density: 0,
  });
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

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
  const [selectedWindowId, setSelectedWindowId] = useState<number | null>(null);

  const [showNewDoorModal, setShowNewDoorModal] = useState(false);
  const [newDoor, setNewDoor] = useState({
    name_element: "",
    u_puerta_opaca: 0,
    ventana_id: 0,
    u_marco: 0,
    fm: 0,
    porcentaje_vidrio: 0,
  });
  const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>({
    onConfirm: async () => Promise.resolve(),
    message: "",
  });

  // Función para configurar el modal de confirmación
  const confirmDelete = (
    id: number,
    type: string,
    itemLabel: string,
    refreshCallback: () => void
  ) => {
    setConfirmModalProps({
      onConfirm: async () => {
        await handleDelete(
          id,
          type,
          `El ${itemLabel} fue eliminado correctamente`,
          async () => {
            await refreshCallback();
          }
        );
        setShowConfirmModal(false);
      },
      message: `¿Está seguro que desea eliminar ${itemLabel}?`,
    });
    setShowConfirmModal(true);
  };

  // Filtrar ventanas de la lista de elementos
  const windowsList = elementsList.filter((el) => el.type === "window");

  // Columnas y datos para la tabla de materiales
  const materialsColumns = [
    { headerName: "Nombre Material", field: "name" },
    { headerName: "Conductividad (W/m2K)", field: "conductivity" },
    { headerName: "Calor específico (J/kgK)", field: "specific_heat" },
    { headerName: "Densidad (kg/m3)", field: "density" },
    { headerName: "Acción", field: "action" },
  ];

  // Se aplica estilo condicional a los materiales usando create_status
  const materialsData = materialsList
    .filter((mat: any) =>
      mat.atributs.name.toLowerCase().includes(searchMaterial.toLowerCase())
    )
    .map((mat: any) => {
      // Se usa mat.atributs.create_status, ya que es donde se almacena el estado del material
      const isDefault = mat.create_status === "default";
      return {
        name: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {mat.atributs.name}
          </span>
        ) : (
          mat.atributs.name
        ),
        conductivity: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {mat.atributs.conductivity}
          </span>
        ) : (
          mat.atributs.conductivity
        ),
        specific_heat: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {mat.atributs.specific_heat}
          </span>
        ) : (
          mat.atributs.specific_heat
        ),
        density: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {mat.atributs.density}
          </span>
        ) : (
          mat.atributs.density
        ),
        action: (
          <ActionButtons
            onEdit={() => {
              setSelectedMaterialId(mat.id);
              setNewMaterialData({
                name: mat.atributs.name,
                conductivity: mat.atributs.conductivity,
                specific_heat: mat.atributs.specific_heat,
                density: mat.atributs.density,
              });
              setShowNewMaterialModal(true);
            }}
            onDelete={() => {
              confirmDelete(
                mat.id,
                "admin/constant",
                `el material "${mat.atributs.name}"`,
                () => fetchMaterialsList(1)
              );
            }}
          />
        ),
      };
    });

  // Columnas y datos para la tabla de ventanas
  const windowsColumns = [
    { headerName: "Nombre Elemento", field: "name_element" },
    { headerName: "U Vidrio [W/m2K]", field: "u_vidrio" },
    { headerName: "FS Vidrio", field: "fs_vidrio" },
    { headerName: "Tipo Cierre", field: "clousure_type" },
    { headerName: "Tipo Marco", field: "frame_type" },
    { headerName: "U Marco [W/m2K]", field: "u_marco" },
    { headerName: "FM [%]", field: "fm" },
    { headerName: "Acción", field: "action" },
  ];

  // Se aplica estilo condicional a las ventanas usando created_status
  const windowsData = elementsList
    .filter((el) => el.type === "window")
    .filter((el) =>
      el.name_element.toLowerCase().includes(searchElement.toLowerCase())
    )
    .map((el) => {
      const isDefault = (el as { created_status?: string }).created_status === "default";
      return {
        name_element: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {el.name_element}
          </span>
        ) : (
          el.name_element
        ),
        u_vidrio: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.atributs as ElementAttributesWindow).u_vidrio}
          </span>
        ) : (
          (el.atributs as ElementAttributesWindow).u_vidrio
        ),
        fs_vidrio: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.atributs as ElementAttributesWindow).fs_vidrio}
          </span>
        ) : (
          (el.atributs as ElementAttributesWindow).fs_vidrio
        ),
        clousure_type: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.atributs as ElementAttributesWindow).clousure_type}
          </span>
        ) : (
          (el.atributs as ElementAttributesWindow).clousure_type
        ),
        frame_type: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.atributs as ElementAttributesWindow).frame_type}
          </span>
        ) : (
          (el.atributs as ElementAttributesWindow).frame_type
        ),
        u_marco: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {el.u_marco}
          </span>
        ) : (
          el.u_marco
        ),
        fm: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.fm * 100).toFixed(0) + "%"}
          </span>
        ) : (
          (el.fm * 100).toFixed(0) + "%"
        ),
        action: (
          <ActionButtons
            onEdit={() => {
              setSelectedWindowId(el.id);
              setNewWindow({
                name_element: el.name_element,
                u_vidrio: (el.atributs as ElementAttributesWindow).u_vidrio,
                fs_vidrio: (el.atributs as ElementAttributesWindow).fs_vidrio,
                clousure_type: (el.atributs as ElementAttributesWindow).clousure_type,
                frame_type: (el.atributs as ElementAttributesWindow).frame_type,
                u_marco: el.u_marco,
                fm: el.fm,
              });
              setShowNewWindowModal(true);
            }}
            onDelete={() => {
              confirmDelete(
                el.id,
                "admin/elements",
                `la ventana "${el.name_element}"`,
                fetchElements
              );
            }}
          />
        ),
      };
    });

  // Columnas y datos para la tabla de puertas
  const doorsColumns = [
    { headerName: "Nombre Elemento", field: "name_element" },
    { headerName: "U Puerta opaca [W/m2K]", field: "u_puerta_opaca" },
    { headerName: "Nombre Ventana", field: "name_ventana" },
    { headerName: "% Vidrio", field: "porcentaje_vidrio" },
    { headerName: "U Marco [W/m2K]", field: "u_marco" },
    { headerName: "FM [%]", field: "fm" },
    { headerName: "Acción", field: "action" },
  ];

  // Se aplica estilo condicional a las puertas usando created_status
  const doorsData = elementsList
    .filter((el) => el.type === "door")
    .filter((el) =>
      el.name_element.toLowerCase().includes(searchElement.toLowerCase())
    )
    .map((el) => {
      const isDefault = (el as { created_status?: string }).created_status === "default";
      return {
        name_element: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {el.name_element}
          </span>
        ) : (
          el.name_element
        ),
        u_puerta_opaca: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.atributs as ElementAttributesDoor).u_puerta_opaca}
          </span>
        ) : (
          (el.atributs as ElementAttributesDoor).u_puerta_opaca
        ),
        name_ventana: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.atributs as ElementAttributesDoor).name_ventana}
          </span>
        ) : (
          (el.atributs as ElementAttributesDoor).name_ventana
        ),
        porcentaje_vidrio: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {((el.atributs as ElementAttributesDoor).porcentaje_vidrio * 100).toFixed(0) + "%"}
          </span>
        ) : (
          ((el.atributs as ElementAttributesDoor).porcentaje_vidrio * 100).toFixed(0) + "%"
        ),
        u_marco: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {el.u_marco}
          </span>
        ) : (
          el.u_marco
        ),
        fm: isDefault ? (
          <span style={{ color: primaryColor, fontWeight: "bold" }}>
            {(el.fm * 100).toFixed(0) + "%"}
          </span>
        ) : (
          (el.fm * 100).toFixed(0) + "%"
        ),
        action: (
          <ActionButtons
            onEdit={() => {
              setSelectedDoorId(el.id);
              setNewDoor({
                name_element: el.name_element,
                u_puerta_opaca: (el.atributs as ElementAttributesDoor).u_puerta_opaca,
                ventana_id: (el.atributs as ElementAttributesDoor).ventana_id,
                u_marco: el.u_marco,
                fm: el.fm,
                porcentaje_vidrio: (el.atributs as ElementAttributesDoor).porcentaje_vidrio,
              });
              setShowNewDoorModal(true);
            }}
            onDelete={() => {
              confirmDelete(
                el.id,
                "admin/elements",
                `la puerta "${el.name_element}"`,
                fetchElements
              );
            }}
          />
        ),
      };
    });

  // Función para obtener el nombre del material (si la necesitas)
  function getMaterialName(materialId: number) {
    const mat = materialsList.find(
      (m) => m.id === materialId || m.material_id === materialId
    );
    return mat ? mat.atributs.name : "Desconocido";
  }

  // Funciones para crear y editar materiales
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

    const materialExists = materialsList.some(
      (mat: any) =>
        (mat.atributs.name as string).trim().toLowerCase() ===
        newMaterialData.name.trim().toLowerCase()
    );

    if (materialExists) {
      notify(`El Nombre del Material ya existe`);
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

    const success = await handleCreate(
      payload,
      "admin/constants/create",
      `El material "${newMaterialData.name}" fue creado correctamente`,
      () => fetchMaterialsList(1)
    );

    if (success) {
      setShowNewMaterialModal(false);
      setNewMaterialData({
        name: "",
        conductivity: 0,
        specific_heat: 0,
        density: 0,
      });
    }
  };

  const handleEditMaterial = async () => {
    if (!selectedMaterialId) return;

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

    await handleEdit(
      selectedMaterialId,
      payload,
      "admin/constant",
      `El material "${newMaterialData.name}" fue actualizado correctamente`,
      () => fetchMaterialsList(1)
    );

    setShowNewMaterialModal(false);
    setNewMaterialData({
      name: "",
      conductivity: 0,
      specific_heat: 0,
      density: 0,
    });
    setSelectedMaterialId(null);
  };

  // Función para crear elementos (ventanas y puertas)
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

      const payload = {
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

      const success = await handleCreate(
        payload,
        "admin/elements/create",
        `La ventana "${newWindow.name_element}" fue creada correctamente`,
        fetchElements
      );

      if (success) {
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
      }
    } else {
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

      if (newDoor.ventana_id !== 0) {
        if (newDoor.porcentaje_vidrio < 0 || newDoor.porcentaje_vidrio > 100) {
          notify("Asegúrese de que el % de vidrio esté entre 0 y 100");
          return;
        }
      } else {
        newDoor.porcentaje_vidrio = 0;
      }

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

      const ventanaSeleccionada = windowsList.find(
        (win) => win.id === newDoor.ventana_id
      );
      const payload = {
        type: "door",
        name_element: newDoor.name_element,
        u_marco: newDoor.u_marco,
        fm: newDoor.fm,
        atributs: {
          ventana_id: newDoor.ventana_id,
          name_ventana: ventanaSeleccionada ? ventanaSeleccionada.name_element : "",
          u_puerta_opaca: newDoor.u_puerta_opaca,
          porcentaje_vidrio: newDoor.porcentaje_vidrio,
        },
      };

      const success = await handleCreate(
        payload,
        "admin/elements/create",
        `La puerta "${newDoor.name_element}" fue creada correctamente`,
        fetchElements
      );

      if (success) {
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
    }
  };

  const handleEditWindow = async () => {
    if (!selectedWindowId) return;

    const payload = {
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

    await handleEdit(
      selectedWindowId,
      payload,
      "admin/elements",
      `La ventana "${newWindow.name_element}" fue actualizada correctamente`,
      fetchElements
    );

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
    setSelectedWindowId(null);
  };

  const handleEditDoor = async () => {
    if (!selectedDoorId) return;

    const ventanaSeleccionada = windowsList.find(
      (win) => win.id === newDoor.ventana_id
    );
    const payload = {
      type: "door",
      name_element: newDoor.name_element,
      u_marco: newDoor.u_marco,
      fm: newDoor.fm,
      atributs: {
        ventana_id: newDoor.ventana_id,
        name_ventana: ventanaSeleccionada ? ventanaSeleccionada.name_element : "",
        u_puerta_opaca: newDoor.u_puerta_opaca,
        porcentaje_vidrio: newDoor.porcentaje_vidrio,
      },
    };

    await handleEdit(
      selectedDoorId,
      payload,
      "admin/elements",
      `La puerta "${newDoor.name_element}" fue actualizada correctamente`,
      fetchElements
    );

    setShowNewDoorModal(false);
    setNewDoor({
      name_element: "",
      u_puerta_opaca: 0,
      ventana_id: 0,
      u_marco: 0,
      fm: 0,
      porcentaje_vidrio: 0,
    });
    setSelectedDoorId(null);
  };

  useEffect(() => {
    if (step === 3) fetchMaterialsList(1);
    if (step === 5) fetchElements();
  }, [step, fetchMaterialsList, fetchElements]);

  const sidebarSteps = [
    { stepNumber: 3, iconName: "assignment_ind", title: "Lista de Materiales" },
    { stepNumber: 4, iconName: "build", title: "Detalles Constructivos" },
    { stepNumber: 5, iconName: "home", title: "Elementos Translúcidos" },
    { stepNumber: 6, iconName: "deck", title: "Perfil de Uso" },
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
            <AdminSidebar activeStep={step} onStepChange={setStep} steps={sidebarSteps} />
          </div>

          {/* Columna para Contenido principal */}
          <div className="col-12 col-md-9 p-4">
            {/* Step 3: Tabla de Materiales */}
            {step === 3 && (
              <>
                <SearchParameters
                  value={searchMaterial}
                  onChange={setSearchMaterial}
                  placeholder="Buscar material..."
                  onNew={() => setShowNewMaterialModal(true)}
                  newButtonText="Nuevo"
                  style={{ marginBottom: "10px" }}
                />
                <div style={{ overflow: "hidden", padding: "10px" }}>
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <TablesParameters columns={materialsColumns} data={materialsData} />
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Detalles Constructivos */}
            {step === 4 && (
              <div>
                <ConstructiveDetailsComponent />
              </div>
            )}

            {/* Step 5: Elementos Translúcidos */}
            {step === 5 && (
              <>
                <SearchParameters
                  value={searchElement}
                  onChange={setSearchElement}
                  placeholder={
                    tabElementosOperables === "ventanas"
                      ? "Buscar ventana..."
                      : "Buscar puerta..."
                  }
                  onNew={() => {
                    if (tabElementosOperables === "ventanas") {
                      setShowNewWindowModal(true);
                    } else {
                      setShowNewDoorModal(true);
                    }
                  }}
                  newButtonText="Nuevo"
                  style={{ marginBottom: "10px" }}
                />
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
                      data={tabElementosOperables === "ventanas" ? windowsData : doorsData}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Perfil de Uso */}
            {step === 6 && (
              <div className="px-3">
                <UseProfileTab />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modales de creación/edición */}
      {showNewMaterialModal && (
        <ModalCreate
          isOpen={showNewMaterialModal}
          detail=""
          onClose={() => {
            setShowNewMaterialModal(false);
            setNewMaterialData({
              name: "",
              conductivity: 0,
              specific_heat: 0,
              density: 0,
            });
            setSelectedMaterialId(null);
          }}
          onSave={selectedMaterialId ? handleEditMaterial : handleCreateMaterial}
          title={selectedMaterialId ? "Editar Material" : "Agregar Nuevo Material"}
          saveLabel={selectedMaterialId ? "Guardar Cambios" : "Crear Material"}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              selectedMaterialId ? handleEditMaterial() : handleCreateMaterial();
            }}
          >
            <div className="form-group">
              <label>Nombre Material</label>
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
              <label>Conductividad (W/m2K)</label>
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
              <label>Calor específico (J/kgK)</label>
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
              <label>Densidad (kg/m3)</label>
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

      {showNewWindowModal && (
        <ModalCreate
          isOpen={showNewWindowModal}
          detail=""
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
            setSelectedWindowId(null);
          }}
          onSave={selectedWindowId ? handleEditWindow : handleCreateElement}
          title={selectedWindowId ? "Editar Ventana" : "Agregar Nueva Ventana"}
          saveLabel={selectedWindowId ? "Guardar Cambios" : "Crear Ventana"}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              selectedWindowId ? handleEditWindow() : handleCreateElement();
            }}
          >
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Nombre del Elemento</label>
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
                  <label>U Vidrio [W/m2K]</label>
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
                  <label>FS Vidrio</label>
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
                  <label>Tipo de Cierre</label>
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
                  <label>Tipo de Marco</label>
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
                  <label>U Marco [W/m2K]</label>
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
                  <label>FM [%]</label>
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
          detail=""
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
            setSelectedDoorId(null);
          }}
          onSave={selectedDoorId ? handleEditDoor : handleCreateElement}
          title={selectedDoorId ? "Editar Puerta" : "Agregar Nueva Puerta"}
          saveLabel={selectedDoorId ? "Guardar Cambios" : "Crear Puerta"}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              selectedDoorId ? handleEditDoor() : handleCreateElement();
            }}
          >
            <div className="form-group">
              <label>Nombre del Elemento</label>
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
              <label>U Puerta opaca [W/m2K]</label>
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
              <label>Ventana Asociada</label>
              <select
                className="form-control"
                value={newDoor.ventana_id}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
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
              <label>% Vidrio</label>
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
              <label>U Marco [W/m2K]</label>
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
              <label>FM [%]</label>
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

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <ModalCreate
          isOpen={showConfirmModal}
          detail=""
          onClose={() => setShowConfirmModal(false)}
          onSave={confirmModalProps.onConfirm}
          title="Confirmación"
          saveLabel="Confirmar"
        >
          <p>{confirmModalProps.message}</p>
        </ModalCreate>
      )}
    </>
  );
};

export default AdministrationPage;
