import React, { useState, useEffect } from "react";
import useAuth from "../src/hooks/useAuth";
import { useAdministration } from "../src/hooks/useAdministration";
import { AdminSidebar } from "../src/components/administration/AdminSidebar";
import Title from "../src/components/Title";
import Card from "../src/components/common/Card";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import Modal from "../src/components/common/Modal";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";
import CancelButton from "@/components/common/CancelButton";
import DetallesConstructivosTab from "../src/components/DetallesConstructivosTab";
import Breadcrumb from "../src/components/common/Breadcrumb";

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

const AdministrationPage: React.FC = () => {
  useAuth();
  const [step, setStep] = useState<number>(3);
  const [tabElementosOperables, setTabElementosOperables] =
    useState("ventanas");

  // Estado para cambiar entre la vista de DetallesConstructivosTab y la vista de tabla de detalles generales
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

  // Función para crear un nuevo material
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
        notify("El material fue creado correctamente");
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

  // Función para crear un nuevo detalle y actualizar la lista usando el hook
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
        notify("El detalle fue creado correctamente");
        setShowNewDetailModal(false);
        setNewDetail({
          scantilon_location: "",
          name_detail: "",
          material_id: 0,
          layer_thickness: null,
        });
        // Actualiza los detalles generales usando fetchDetails del hook
        await fetchDetails();
      }
    } catch (error: unknown) {
      console.error("[handleCreateDetail] Error:", error);
      notify("No se pudo crear el detalle");
    }
  };

  // Función para crear un nuevo elemento (ventana o puerta)
  const handleCreateElement = async () => {
    if (tabElementosOperables === "ventanas") {
      if (
        newWindow.name_element.trim() === "" ||
        newWindow.u_vidrio <= 0 ||
        newWindow.fs_vidrio <= 0 ||
        newWindow.u_marco <= 0 ||
        newWindow.fm <= 0 ||
        newWindow.clousure_type.trim() === "" ||
        newWindow.frame_type.trim() === ""
      ) {
        notify("Por favor complete todos los campos de la ventana");
        return;
      }
    } else {
      if (
        newDoor.name_element.trim() === "" ||
        newDoor.u_puerta_opaca <= 0 ||
        newDoor.ventana_id === 0 ||
        newDoor.u_marco <= 0 ||
        newDoor.fm <= 0 ||
        newDoor.porcentaje_vidrio <= 0
      ) {
        notify("Por favor complete todos los campos de la puerta");
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
      notify("El elemento fue creado correctamente");
      if (tabElementosOperables === "ventanas") {
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

  // Función para obtener el nombre del material a partir de su ID (usando materialsList del hook)
  const getMaterialName = (materialId: number) => {
    const mat = materialsList.find(
      (m) => m.id === materialId || m.material_id === materialId
    );
    return mat ? mat.atributs.name : "Desconocido";
  };

  // Actualizamos la data al cambiar de step (manteniendo la funcionalidad original)
  useEffect(() => {
    if (step === 3) fetchMaterialsList(1);
    if (step === 4) fetchDetails();
    if (step === 5) fetchElements();
  }, [step, fetchMaterialsList, fetchDetails, fetchElements]);

  const sidebarSteps = [
    { stepNumber: 3, iconName: "assignment_ind", title: "Materiales" },
    { stepNumber: 4, iconName: "build", title: "Detalles" },
    { stepNumber: 5, iconName: "home", title: "Elementos" },
  ];

  return (
    <>
      {/* Header */}
      <Card className="header-card">
        <div className="d-flex align-items-center w-100">
          <Title text="Administración de Parametros" />
          <Breadcrumb
            items={[
              {
                title: "Administracion de Parametros",
                href: "/",
                active: true,
              },
            ]}
          />
        </div>
      </Card>

      {/* Card principal */}
      <Card className="bordered-main-card">
        <div>
          <div
            className="d-flex d-flex-responsive"
            style={{ alignItems: "stretch", gap: 0 }}
          >
            <AdminSidebar
              activeStep={step}
              onStepChange={setStep}
              steps={sidebarSteps}
            />
            <div className="content-area" style={{ flex: 1 }}>
              {step === 3 && (
                <>
                  <div style={{ overflow: "hidden", padding: "10px" }}>
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Nombre Material</th>
                            <th>Conductividad (W/m2K)</th>
                            <th>Calor específico (J/kgK)</th>
                            <th>Densidad (kg/m3)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialsList.map((mat, idx) => (
                            <tr key={idx}>
                              <td>{mat.atributs.name}</td>
                              <td>{mat.atributs.conductivity}</td>
                              <td>{mat.atributs.specific_heat}</td>
                              <td>{mat.atributs.density}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "10px",
                    }}
                  >
                    <CustomButton
                      variant="save"
                      onClick={() => setShowNewMaterialModal(true)}
                    >
                      <span className="material-icons">add</span> Nuevo
                    </CustomButton>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  {showGeneralDetails ? (
                    // Vista de detalles generales
                    <div>
                      <div className="tabs-container">
                        <div className="tab active" style={{ flex: 1, textAlign: 'center' }}>Detalles Generales</div>
                      </div>
                      <div style={{ overflow: "hidden", padding: "10px" }}>
                        <div style={{ maxHeight: "500px", overflowY: "auto"}}>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Ubicación</th>
                                <th>Nombre Detalle</th>
                                <th>Material</th>
                                <th>Espesor (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {details.map((detail, idx) => (
                                <tr key={idx}>
                                  <td>{detail.scantilon_location}</td>
                                  <td>{detail.name_detail}</td>
                                  <td>{getMaterialName(detail.material_id)}</td>
                                  <td>{detail.layer_thickness}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {/* Botones: Volver a la izquierda, Nuevo a la derecha */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px",
                        }}
                      >
                        <CustomButton
                          variant="save"
                          onClick={() => setShowGeneralDetails(false)}
                        >
                          <span className="material-icons">arrow_back</span>{" "}
                          Volver
                        </CustomButton>
                        <CustomButton
                          variant="save"
                          onClick={() => setShowNewDetailModal(true)}
                        >
                          <span className="material-icons">add</span> Nuevo
                        </CustomButton>
                      </div>
                    </div>
                  ) : (
                    // Vista por defecto (Muro, Techo, Piso)
                    <>
                      <DetallesConstructivosTab />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          padding: "10px",
                        }}
                      >
                        {/* Se quitó el botón de 'Nuevo' aquí */}
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
                            padding:
                              "clamp(0.5rem, 1vw, 1rem) clamp(1rem, 4vw, 2rem)",
                            height: "min(3rem, 8vh)",
                            minWidth: "6rem",
                            marginLeft: "10px",
                            marginTop: "2rem",
                          }}
                        >
                          <span className="material-icons">visibility</span> Ver
                          detalles generales
                        </CustomButton>
                      </div>
                    </>
                  )}
                </>
              )}

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
                              onClick={() =>
                                setTabElementosOperables(tab.toLowerCase())
                              }
                            >
                              {tab}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        padding: "10px",
                      }}
                    >
                      <table className="table">
                        <thead>
                          {tabElementosOperables === "ventanas" ? (
                            <tr>
                              <th>Nombre Elemento</th>
                              <th>U Vidrio [W/m2K]</th>
                              <th>FS Vidrio</th>
                              <th>Tipo Cierre</th>
                              <th>Tipo Marco</th>
                              <th>U Marco [W/m2K]</th>
                              <th>FM [%]</th>
                            </tr>
                          ) : (
                            <tr>
                              <th>Nombre Elemento</th>
                              <th>U Puerta opaca [W/m2K]</th>
                              <th>Nombre Ventana</th>
                              <th>% Vidrio</th>
                              <th>U Marco [W/m2K]</th>
                              <th>FM [%]</th>
                            </tr>
                          )}
                        </thead>
                        <tbody className="small-text">
                          {elementsList
                            .filter(
                              (el) =>
                                el.type ===
                                (tabElementosOperables === "ventanas"
                                  ? "window"
                                  : "door")
                            )
                            .map((el, idx) => {
                              if (tabElementosOperables === "ventanas") {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>
                                      {
                                        (el.atributs as ElementAttributesWindow)
                                          .u_vidrio
                                      }
                                    </td>
                                    <td>
                                      {
                                        (el.atributs as ElementAttributesWindow)
                                          .fs_vidrio
                                      }
                                    </td>
                                    <td>
                                      {
                                        (el.atributs as ElementAttributesWindow)
                                          .clousure_type
                                      }
                                    </td>
                                    <td>
                                      {
                                        (el.atributs as ElementAttributesWindow)
                                          .frame_type
                                      }
                                    </td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                  </tr>
                                );
                              } else {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>
                                      {
                                        (el.atributs as ElementAttributesDoor)
                                          .u_puerta_opaca
                                      }
                                    </td>
                                    <td>
                                      {
                                        (el.atributs as ElementAttributesDoor)
                                          .name_ventana
                                      }
                                    </td>
                                    <td>
                                      {(el.atributs as ElementAttributesDoor)
                                        .porcentaje_vidrio !== undefined
                                        ? (
                                            (
                                              el.atributs as ElementAttributesDoor
                                            ).porcentaje_vidrio * 100
                                          ).toFixed(0) + "%"
                                        : "0%"}
                                    </td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                  </tr>
                                );
                              }
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "10px",
                    }}
                  >
                    {tabElementosOperables === "ventanas" ? (
                      <CustomButton
                        variant="save"
                        onClick={() => setShowNewWindowModal(true)}
                      >
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    ) : (
                      <CustomButton
                        variant="save"
                        onClick={() => setShowNewDoorModal(true)}
                      >
                        <span className="material-icons">add</span> Nuevo
                      </CustomButton>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Modales */}
      {showNewMaterialModal && (
        <Modal
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
          title="Agregar Nuevo Material"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateMaterial();
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
                  if (value >= 0) {
                    setNewMaterialData((prev) => ({
                      ...prev,
                      conductivity: value,
                    }));
                  }
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
                  if (value >= 0) {
                    setNewMaterialData((prev) => ({
                      ...prev,
                      specific_heat: value,
                    }));
                  }
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
                  if (value >= 0) {
                    setNewMaterialData((prev) => ({ ...prev, density: value }));
                  }
                }}
                min="0"
              />
            </div>
            <div className="mt-4 d-flex justify-content-between">
              <CancelButton
                onClick={() => {
                  setShowNewMaterialModal(false);
                  setStep(3);
                  setNewMaterialData({
                    name: "",
                    conductivity: 0,
                    specific_heat: 0,
                    density: 0,
                  });
                }}
              />
              <CustomButton variant="save" type="submit">
                Crear
              </CustomButton>
            </div>
          </form>
        </Modal>
      )}

      {showNewDetailModal && (
        <Modal
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
          title="Agregar Nuevo Detalle Constructivo"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateDetail();
            }}
          >
            <div className="form-group">
              <label>Ubicación del Detalle</label>
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
              <label>Nombre del Detalle</label>
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
              <label>Material</label>
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
                {materialsList.map((mat) => (
                  <option key={mat.material_id} value={mat.material_id}>
                    {mat.atributs.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Espesor de la Capa (cm)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Espesor (cm)"
                value={newDetail.layer_thickness || ""}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (/^\d*\.?\d*$/.test(inputValue)) {
                    const value =
                      inputValue === "" ? null : parseFloat(inputValue);
                    setNewDetail((prev) => ({
                      ...prev,
                      layer_thickness: value,
                    }));
                  }
                }}
                min="0"
                step="0.01"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="mt-4 text-end">
              <CustomButton
                variant="save"
                onClick={() => {
                  setShowNewDetailModal(false);
                  setNewDetail({
                    scantilon_location: "",
                    name_detail: "",
                    material_id: 0,
                    layer_thickness: null,
                  });
                }}
              >
                Cancelar
              </CustomButton>
              <CustomButton variant="save" type="submit">
                Crear Detalle
              </CustomButton>
            </div>
          </form>
        </Modal>
      )}

      {showNewWindowModal && (
        <Modal
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
          title="Agregar Nueva Ventana"
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
                      if (value >= 0) {
                        setNewWindow((prev) => ({ ...prev, u_vidrio: value }));
                      }
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
                      if (value >= 0) {
                        setNewWindow((prev) => ({ ...prev, fs_vidrio: value }));
                      }
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
                      if (value >= 0) {
                        setNewWindow((prev) => ({ ...prev, u_marco: value }));
                      }
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
                      const value = parseFloat(e.target.value);
                      if (value >= 0 && value <= 100) {
                        setNewWindow((prev) => ({ ...prev, fm: value }));
                      }
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-end">
              <CustomButton
                variant="save"
                onClick={() => {
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
              >
                Cancelar
              </CustomButton>
              <CustomButton variant="save" type="submit">
                Crear Ventana
              </CustomButton>
            </div>
          </form>
        </Modal>
      )}

      {showNewDoorModal && (
        <Modal
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
          title="Agregar Nueva Puerta"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateElement();
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
                  if (value >= 0) {
                    setNewDoor((prev) => ({ ...prev, u_puerta_opaca: value }));
                  }
                }}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Ventana Asociada</label>
              <select
                className="form-control"
                value={newDoor.ventana_id}
                onChange={(e) =>
                  setNewDoor((prev) => ({
                    ...prev,
                    ventana_id: parseInt(e.target.value),
                  }))
                }
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
                  const value = parseFloat(e.target.value);
                  if (value >= 0 && value <= 100) {
                    setNewDoor((prev) => ({
                      ...prev,
                      porcentaje_vidrio: value,
                    }));
                  }
                }}
                min="0"
                max="100"
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
                  if (value >= 0) {
                    setNewDoor((prev) => ({ ...prev, u_marco: value }));
                  }
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
                  const value = parseFloat(e.target.value);
                  if (value >= 0 && value <= 100) {
                    setNewDoor((prev) => ({ ...prev, fm: value }));
                  }
                }}
                min="0"
                max="100"
              />
            </div>
            <div className="mt-4 text-end">
              <CustomButton
                variant="save"
                onClick={() => {
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
              >
                Cancelar
              </CustomButton>
              <CustomButton variant="save" type="submit">
                Crear puerta
              </CustomButton>
            </div>
          </form>
        </Modal>
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
