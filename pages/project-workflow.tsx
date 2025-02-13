import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import axios from "axios";
import CustomButton from "../src/components/common/CustomButton";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";

const ProjectCompleteWorkflowPage: React.FC = () => {
  // Estados generales
  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const [step, setStep] = useState<number>(1);
  const [projectCreated, setProjectCreated] = useState<boolean>(false);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);

  // Sub-tabs para otros pasos
  const [tabElementosOperables, setTabElementosOperables] = useState("ventanas");
  const [tabTipologiaRecinto, setTabTipologiaRecinto] = useState("ventilacion");

  // Datos del formulario (pasos 1 y 2)
  const [formData, setFormData] = useState({
    name_project: "",
    owner_name: "",
    owner_lastname: "",
    country: "",
    department: "",
    province: "",
    district: "",
    building_type: "",
    main_use_type: "",
    number_levels: 0,
    number_homes_per_level: 0,
    built_surface: 0,
    latitude: 0,
    longitude: 0,
  });
  const [locationSearch, setLocationSearch] = useState("");
  const [foundLocations, setFoundLocations] = useState("");

  const [materialsList, setMaterialsList] = useState<any[]>([]);

  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);

  const [details, setDetails] = useState<any[]>([]);
  const [tabDetailSection, setTabDetailSection] = useState("Techumbre");

  const [elementsList, setElementsList] = useState<any[]>([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [modalElementType, setModalElementType] = useState<string>("ventanas");

  const detallesData = [
    { ubicacion: "Techo", nombre: "Techo Base", capas: "Hormigón Armado", espesor: 10.0 },
    { ubicacion: "Techo", nombre: "Techo Base", capas: "P.E 10kg/m3", espesor: 4.6 },
  ];
  const murosData = [
    { nombreAbrev: "Muro Base", valorU: 2.9, colorExt: "Intermedio", colorInt: "Intermedio" },
    { nombreAbrev: "Muro Ejemplo", valorU: 0.61, colorExt: "Intermedio", colorInt: "Intermedio" },
  ];
  const techumbreData = [
    { nombreAbrev: "Techo Base", valorU: 0.8, colorExt: "Intermedio", colorInt: "Intermedio" },
    { nombreAbrev: "Techo Ejemplo", valorU: 0.38, colorExt: "Intermedio", colorInt: "Intermedio" },
  ];
  const pisosData = [
    { nombreAbrev: "Piso Base", valorU: 2.0, aislBajoPiso: "-", refAislVert: "-", dCm: "-", refAislHoriz: "-" },
  ];
  const ventanasData = [
    { nombre: "V Base", uVidrio: 5.7, fs_vidrio: 0.87, tipoCierre: "Corredera", tipoMarco: "Fierro", uMarco: 5.7, fm: "75%" },
  ];
  const puertasData = [
    { nombre: "P Base", uPuerta: 2.63, vidrio: "V Base", porcVidrio: "0%", uMarco: 1.25, fm: "8.8%" },
  ];
  const tipologiaRecintoData = [
    { codigo: "ES", nombre: "Espera" },
    { codigo: "AU", nombre: "Auditorio" },
  ];
  const ventilacionData = [
    { rPers: 8.8, ida: "IDA2", ocupacion: "Sedentario", ventNoct: "-" },
  ];
  const iluminacionData = [
    { potenciaBase: 12.0, estrategia: "Sin estrategia", propuesta: 12.0 },
  ];
  const cargasInternasData = [
    { usuarios: 4.0, calorLatente: 164.0, calorSensible: 12.0, equipos: "-" },
  ];
  const [recintos, setRecintos] = useState([
    {
      id: 1,
      estado: "Activo",
      nombre: "Recinto Prueba",
      perfilOcup: "Sedentario",
      sensorCO2: "Si",
      alturaProm: 2.5,
      area: 50,
    },
  ]);

  const [showCreateDoorModal, setShowCreateDoorModal] = useState(false);
  const [showCreateWindowModal, setShowCreateWindowModal] = useState(false);

  const [doorData, setDoorData] = useState({
    name_element: "",
    ventana_id: 0,
    name_ventana: "",
    u_puerta_opaca: 0,
    porcentaje_vidrio: 0,
    u_marco: 0,
    fm: 0,
  });

  const [windowData, setWindowData] = useState({
    name_element: "",
    u_vidrio: 0,
    fs_vidrio: 0,
    frame_type: "",
    clousure_type: "",
    u_marco: 0,
    fm: 0,
  });

  const handleFormInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveData = () => {
    if (!createdProjectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    Swal.fire(
      "Datos guardados",
      `Se han guardado los datos en el proyecto ${createdProjectId} - ${formData.name_project}`,
      "success"
    );
    setStep(4);
  };

  const handleSaveProject = () => {
    if (!createdProjectId) {
      Swal.fire("Error", "Proyecto no encontrado", "error");
      return;
    }
    Swal.fire(
      "Datos guardados",
      `Se han guardado los datos en el proyecto ${createdProjectId} - ${formData.name_project}`,
      "success"
    );
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const requestBody = {
        country: formData.country || "Peru",
        divisions: {
          department: formData.department,
          province: formData.province,
          district: formData.district,
        },
        name_project: formData.name_project,
        owner_name: formData.owner_name,
        owner_lastname: formData.owner_lastname,
        building_type: formData.building_type,
        main_use_type: formData.main_use_type,
        number_levels: formData.number_levels,
        number_homes_per_level: formData.number_homes_per_level,
        built_surface: formData.built_surface,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      const url = `${constantUrlApiEndpoint}/projects/create`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const response = await axios.post(url, requestBody, { headers });
      console.log("Proyecto creado:", response.data);
      const { project_id, message } = response.data;
      setCreatedProjectId(project_id);
      setProjectCreated(true);
      Swal.fire("Proyecto creado", `ID: ${project_id} / Mensaje: ${message}`, "success");
      setStep(3);
    } catch (error: any) {
      console.error("Error al crear proyecto:", error.response?.data || error.message);
      Swal.fire("Error al crear proyecto", error.response?.data?.detail || error.message, "error");
    }
  };

  const handleAddMaterial = (material: any) => {
    if (selectedMaterials.some((m) => m.id === material.id)) {
      Swal.fire("Material ya seleccionado", "Este material ya fue agregado", "info");
      return;
    }
    setSelectedMaterials([...selectedMaterials, material]);
    Swal.fire("Material agregado", `${material.atributs?.name} ha sido seleccionado.`, "success");
  };

  const handleRemoveMaterial = (materialId: number) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.id !== materialId));
    Swal.fire("Material removido", "El material ha sido eliminado de la selección", "info");
  };

  const fetchMaterialsList = async (page: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/constants/?page=${page}&per_page=100`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      const data = response.data;
      setMaterialsList(data.constants || []);
    } catch (error: any) {
      console.error("Error al obtener lista de materiales:", error);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error");
    }
  };

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/user/details/?section=admin`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      setDetails(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener detalles:", error.response?.data || error.message);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.", "error");
    }
  };

  const getFilteredDetails = (tab: string) => {
    let section = "";
    switch (tab) {
      case "Muros":
        section = "muro";
        break;
      case "Techumbre":
        section = "techo";
        break;
      case "Pisos":
        section = "piso";
        break;
      default:
        return details;
    }
    return details.filter((d) => d.scantilon_location.toLowerCase() === section);
  };

  const fetchElements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/elements/`;
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const response = await axios.get(url, { headers });
      setElementsList(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener elementos:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  const handleSelectWindow = async (id: number) => {
    if (!createdProjectId) {
      Swal.fire("Proyecto no encontrado", "No se ha creado el proyecto.", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${createdProjectId}/elements/windows/select`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const body = [id];
      const response = await axios.post(url, body, { headers });
      Swal.fire("Ventana agregada", response.data.message, "success");
    } catch (error: any) {
      console.error("Error al seleccionar ventana:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  const handleSelectDoor = async (id: number) => {
    if (!createdProjectId) {
      Swal.fire("Proyecto no encontrado", "No se ha creado el proyecto.", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${createdProjectId}/elements/doors/select`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const body = [id];
      const response = await axios.post(url, body, { headers });
      Swal.fire("Puerta agregada", response.data.message, "success");
    } catch (error: any) {
      console.error("Error al seleccionar puerta:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  const handleAddDetail = () => {
    Swal.fire("Agregar detalle", "Funcionalidad pendiente para agregar un nuevo detalle.", "info");
  };

  const handleAddElement = (element: any) => {
    if (selectedElements.some((el) => el.id === element.id)) {
      Swal.fire("Elemento ya seleccionado", "Este elemento ya fue agregado", "info");
      return;
    }
    setSelectedElements([...selectedElements, element]);
    Swal.fire("Elemento agregado", `${element.name_element} ha sido agregado.`, "success");
  };

  const handleRemoveElement = (elementId: number) => {
    setSelectedElements(selectedElements.filter((el) => el.id !== elementId));
    Swal.fire("Elemento removido", "El elemento ha sido eliminado de la selección", "info");
  };

  const handleCreateDoorElement = () => {
    const newDoor = {
      id: new Date().getTime(),
      type: "door",
      name_element: doorData.name_element,
      u_marco: doorData.u_marco,
      fm: doorData.fm,
      atributs: {
        u_puerta_opaca: doorData.u_puerta_opaca,
        porcentaje_vidrio: doorData.porcentaje_vidrio,
        name_ventana: doorData.name_ventana,
      },
    };
    handleAddElement(newDoor);
    Swal.fire("Puerta creada", `La puerta ${doorData.name_element} ha sido creada.`, "success");
    setShowCreateDoorModal(false);
    setDoorData({
      name_element: "",
      ventana_id: 0,
      name_ventana: "",
      u_puerta_opaca: 0,
      porcentaje_vidrio: 0,
      u_marco: 0,
      fm: 0,
    });
  };

  const handleCreateWindowElement = () => {
    const newWindow = {
      id: new Date().getTime(),
      type: "window",
      name_element: windowData.name_element,
      u_marco: windowData.u_marco,
      fm: windowData.fm,
      atributs: {
        u_vidrio: windowData.u_vidrio,
        fs_vidrio: windowData.fs_vidrio,
        frame_type: windowData.frame_type,
        clousure_type: windowData.clousure_type,
      },
    };
    handleAddElement(newWindow);
    Swal.fire("Ventana creada", `La ventana ${windowData.name_element} ha sido creada.`, "success");
    setShowCreateWindowModal(false);
    setWindowData({
      name_element: "",
      u_vidrio: 0,
      fs_vidrio: 0,
      frame_type: "",
      clousure_type: "",
      u_marco: 0,
      fm: 0,
    });
  };

  useEffect(() => {
    if (step === 3) fetchMaterialsList(1);
  }, [step]);

  useEffect(() => {
    if (step === 4) fetchDetails();
  }, [step]);

  useEffect(() => {
    if (step === 5) fetchElements();
  }, [step]);

  const availableWindows = elementsList.filter((el) => el.type === "window");

  const renderMainHeader = () => {
    if (step <= 2) {
      return (
        <div className="mb-3">
          <h1 className="fw-bold">Proyecto nuevo</h1>
        </div>
      );
    } else {
      return (
        <div className="mb-3">
          <h2 className="fw-bold">Detalles del proyecto</h2>
          <div className="d-flex align-items-center gap-4 mt-4">
            <span style={{ fontWeight: "normal" }}>Proyecto:</span>
            <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
              {`Edificación Nº ${createdProjectId ?? "xxxxx"}`}
            </CustomButton>
            <CustomButton variant="save" style={{ padding: "0.8rem 3rem" }}>
              {formData.department || "Departamento"}
            </CustomButton>
          </div>
        </div>
      );
    }
  };

  const internalSidebarWidth = 380;
  const sidebarItemHeight = 100;
  const sidebarItemBorderSize = 1;
  const leftPadding = 50;

  const SidebarItem = ({
    stepNumber,
    iconClass,
    title,
  }: {
    stepNumber: number;
    iconClass: string;
    title: string;
  }) => {
    const isSelected = step === stepNumber;
    const activeColor = "#3ca7b7";
    const inactiveColor = "#ccc";
    return (
      <li className="nav-item" style={{ cursor: "pointer" }} onClick={() => setStep(stepNumber)}>
        <div
          style={{
            width: "100%",
            height: `${sidebarItemHeight}px`,
            border: `${sidebarItemBorderSize}px solid ${isSelected ? activeColor : inactiveColor}`,
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: `${leftPadding}px`,
            color: isSelected ? activeColor : inactiveColor,
            fontFamily: "var(--font-family-base)",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "1.3rem" }}>
            <i className={iconClass}></i>
          </span>
          <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{title}</span>
        </div>
      </li>
    );
  };

  return (
    <>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <TopBar sidebarWidth={sidebarWidth} />

      <div
        className="container"
        style={{
          maxWidth: "1700px",
          marginTop: "90px",
          marginLeft: `calc(${sidebarWidth} + 70px)`,
          marginRight: "50px",
          transition: "margin-left 0.1s ease",
          fontFamily: "var(--font-family-base)",
        }}
      >
        {renderMainHeader()}
        <div className="card shadow w-100" style={{ overflow: "hidden" }}>
          <div className="card-body p-0">
            <div className="d-flex" style={{ alignItems: "stretch", gap: 0 }}>
              <div
                style={{
                  width: `${internalSidebarWidth}px`,
                  padding: "20px",
                  boxSizing: "border-box",
                  borderRight: "1px solid #ccc",
                }}
              >
                <ul className="nav flex-column" style={{ height: "100%" }}>
                  <SidebarItem stepNumber={1} iconClass="bi bi-person-circle" title="Agregar detalles propietario / proyecto y clasificación" />
                  <SidebarItem stepNumber={2} iconClass="bi bi-geo-alt" title="Ubicación del proyecto" />
                  <SidebarItem stepNumber={3} iconClass="bi bi-file-text" title="Lista de materiales" />
                  <SidebarItem stepNumber={4} iconClass="bi bi-tools" title="Detalles constructivos" />
                  <SidebarItem stepNumber={5} iconClass="bi bi-house" title="Elementos operables" />
                  <SidebarItem stepNumber={6} iconClass="bi bi-bar-chart" title="Tipología de recinto" />
                  <SidebarItem stepNumber={7} iconClass="bi bi-check2-square" title="Recinto" />
                </ul>
              </div>
              <div style={{ flex: 1, padding: "20px" }}>
                {step === 1 && (
                  <>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del proyecto</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          onChange={(e) => handleFormInputChange("name_project", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) => handleFormInputChange("owner_name", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Apellido del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_lastname}
                          onChange={(e) => handleFormInputChange("owner_lastname", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => handleFormInputChange("country", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => handleFormInputChange("department", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Provincia</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.province}
                          onChange={(e) => handleFormInputChange("province", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Distrito</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.district}
                          onChange={(e) => handleFormInputChange("district", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de edificación</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) => handleFormInputChange("building_type", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de uso principal</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.main_use_type}
                          onChange={(e) => handleFormInputChange("main_use_type", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de niveles</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) =>
                            handleFormInputChange("number_levels", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de viviendas / oficinas x nivel</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_homes_per_level}
                          onChange={(e) =>
                            handleFormInputChange("number_homes_per_level", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Superficie construida (m²)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.built_surface}
                          onChange={(e) =>
                            handleFormInputChange("built_surface", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div className="text-end">
                      <CustomButton variant="save" onClick={() => setStep(2)}>
                        Siguiente
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h5 className="fw-bold mb-3">Ubicación del proyecto</h5>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar ubicación"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-8 mb-3">
                        <img src="/assets/images/maps.jpg" className="img-fluid" alt="Mapa" />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label">Datos de ubicaciones encontradas</label>
                        <textarea
                          className="form-control mb-2"
                          rows={5}
                          value={foundLocations}
                          onChange={(e) => setFoundLocations(e.target.value)}
                        ></textarea>
                        <CustomButton
                          variant="save"
                          style={{ width: "100%" }}
                          onClick={() => {
                            handleFormInputChange("latitude", 150);
                            handleFormInputChange("longitude", 250);
                            Swal.fire("Ubicación asignada", "Ubicación de prueba (lat=150, lon=250)", "success");
                          }}
                        >
                          Ubicación actual
                        </CustomButton>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(1)} />
                      <CustomButton variant="save" onClick={handleCreateProject}>
                        Guardar proyecto
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddMaterialModal(true)}>
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <h6 className="mb-3">Materiales Agregados</h6>
                    {selectedMaterials.length > 0 ? (
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th style={{ color: "var(--primary-color)" }}>Nombre Material</th>
                            <th style={{ color: "var(--primary-color)" }}>Conductividad (W/m2K)</th>
                            <th style={{ color: "var(--primary-color)" }}>Calor específico (J/kgK)</th>
                            <th style={{ color: "var(--primary-color)" }}>Densidad (kg/m3)</th>
                            <th style={{ color: "var(--primary-color)" }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaterials.map((mat, idx) => {
                            const atributos = mat.atributs || {};
                            return (
                              <tr key={idx}>
                                <td>{atributos.name}</td>
                                <td>{atributos.conductivity}</td>
                                <td>{atributos["specific heat"]}</td>
                                <td>{atributos.density}</td>
                                <td>
                                  <CustomButton variant="deleteIcon" onClick={() => handleRemoveMaterial(mat.id)} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p>No se ha agregado ningún material.</p>
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(2)} />
                      <CustomButton variant="save" onClick={handleSaveData}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={handleAddDetail}>
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {["Detalles", "Muros", "Techumbre", "Pisos"].map((tab) => (
                        <li key={tab} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color: tabDetailSection === tab ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabDetailSection === tab ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => setTabDetailSection(tab)}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border p-3">
                      {((tabDetailSection === "Detalles" ? details : getFilteredDetails(tabDetailSection)).length > 0) ? (
                        <>
                          {tabDetailSection === "Detalles" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Ubicación Detalle</th>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Detalle</th>
                                  <th style={{ color: "var(--primary-color)" }}>Capas de interior a exterior</th>
                                  <th style={{ color: "var(--primary-color)" }}>Espesor capa (cm)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {details.map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.scantilon_location}</td>
                                    <td>{det.name_detail}</td>
                                    <td>{det.capas || det.material}</td>
                                    <td>{det.layer_thickness}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "Muros" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Abreviado</th>
                                  <th style={{ color: "var(--primary-color)" }}>Valor U [W/m2K]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Exterior</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Interior</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getFilteredDetails(tabDetailSection).map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.nombreAbrev}</td>
                                    <td>{det.valorU}</td>
                                    <td>{det.colorExt}</td>
                                    <td>{det.colorInt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "Techumbre" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Abreviado</th>
                                  <th style={{ color: "var(--primary-color)" }}>Valor U [W/m2K]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Exterior</th>
                                  <th style={{ color: "var(--primary-color)" }}>Color Interior</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getFilteredDetails(tabDetailSection).map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.nombreAbrev}</td>
                                    <td>{det.valorU}</td>
                                    <td>{det.colorExt}</td>
                                    <td>{det.colorInt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : tabDetailSection === "Pisos" ? (
                            <table className="table table-bordered table-striped">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Nombre Abreviado</th>
                                  <th style={{ color: "var(--primary-color)" }}>Valor U [W/m2K]</th>
                                  <th style={{ color: "var(--primary-color)" }}>Aislamiento bajo piso</th>
                                  <th style={{ color: "var(--primary-color)" }}>Ref Aisl Vert.</th>
                                  <th style={{ color: "var(--primary-color)" }}>Ref Aisl Horiz.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getFilteredDetails(tabDetailSection).map((det: any) => (
                                  <tr key={det.id_detail}>
                                    <td>{det.nombreAbrev}</td>
                                    <td>{det.valorU}</td>
                                    <td>{det.aislBajoPiso}</td>
                                    <td>{det.refAislVert}</td>
                                    <td>{det.refAislHoriz}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : null}
                        </>
                      ) : (
                        <p>No hay detalles para {tabDetailSection}.</p>
                      )}
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(3)} />
                      <CustomButton variant="save" onClick={() => setStep(5)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddElementModal(true)}>
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {["Ventanas", "Puertas"].map((tab) => (
                        <li key={tab} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color: tabElementosOperables === tab.toLowerCase() ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabElementosOperables === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => {
                              setTabElementosOperables(tab.toLowerCase());
                              setModalElementType(tab.toLowerCase());
                            }}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <h6 className="mb-3">Elementos Agregados</h6>
                    {selectedElements
                      .filter((el) => el.type === (tabElementosOperables === "ventanas" ? "window" : "door"))
                      .length > 0 ? (
                      <table className="table table-bordered table-striped">
                        <thead>
                          {tabElementosOperables === "ventanas" ? (
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)" }}>U Vidrio [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FS Vidrio []</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipo Cierre</th>
                              <th style={{ color: "var(--primary-color)" }}>Tipo Marco</th>
                              <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)" }}>Acción</th>
                            </tr>
                          ) : (
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)" }}>U Puerta opaca [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Ventana</th>
                              <th style={{ color: "var(--primary-color)" }}>% Vidrio</th>
                              <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)" }}>Acción</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {selectedElements
                            .filter((el) => el.type === (tabElementosOperables === "ventanas" ? "window" : "door"))
                            .map((el, idx) => {
                              if (tabElementosOperables === "ventanas") {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs?.u_vidrio}</td>
                                    <td>{el.atributs?.fs_vidrio}</td>
                                    <td>{el.atributs?.clousure_type}</td>
                                    <td>{el.atributs?.frame_type}</td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                    <td>
                                      <CustomButton variant="deleteIcon" onClick={() => handleRemoveElement(el.id)} />
                                    </td>
                                  </tr>
                                );
                              } else {
                                return (
                                  <tr key={idx}>
                                    <td>{el.name_element}</td>
                                    <td>{el.atributs?.u_puerta_opaca}</td>
                                    <td>{el.atributs?.name_ventana}</td>
                                    <td>
                                      {el.atributs?.porcentaje_vidrio !== undefined
                                        ? (el.atributs.porcentaje_vidrio * 100).toFixed(0) + "%"
                                        : "0%"}
                                    </td>
                                    <td>{el.u_marco}</td>
                                    <td>{(el.fm * 100).toFixed(0)}%</td>
                                    <td>
                                      <CustomButton variant="deleteIcon" onClick={() => handleRemoveElement(el.id)} />
                                    </td>
                                  </tr>
                                );
                              }
                            })}
                        </tbody>
                      </table>
                    ) : (
                      <p>No se ha agregado ningún elemento.</p>
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(4)} />
                      <CustomButton variant="save" onClick={() => setStep(6)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <h5 className="fw-bold mb-3">Tipología de recinto</h5>
                    <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
                      {[
                        { key: "ventilacion", label: "Ventilación y caudales" },
                        { key: "iluminacion", label: "Iluminación" },
                        { key: "cargas", label: "Cargas internas" },
                        { key: "horario", label: "Horario y Clima" },
                      ].map((tab) => (
                        <li key={tab.key} style={{ flex: 1 }}>
                          <button
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              color: tabTipologiaRecinto === tab.key ? "var(--primary-color)" : "var(--secondary-color)",
                              border: "none",
                              cursor: "pointer",
                              borderBottom: tabTipologiaRecinto === tab.key ? "3px solid var(--primary-color)" : "none",
                            }}
                            onClick={() => setTabTipologiaRecinto(tab.key)}
                          >
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content border border-top-0 p-3">
                      {/* Contenido  para cada pestaña */}
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(5)} />
                      <CustomButton variant="save" onClick={() => setStep(7)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {step === 7 && (
                  <>
                    <h5 className="fw-bold mb-3">Recinto</h5>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div></div>
                      <CustomButton variant="save">
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Estado</th>
                          <th>Nombre del Recinto</th>
                          <th>Perfil de Ocupación</th>
                          <th>Sensor CO2</th>
                          <th>Altura Promedio Recinto</th>
                          <th>Área</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recintos.map((r) => (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.estado}</td>
                            <td>{r.nombre}</td>
                            <td>{r.perfilOcup}</td>
                            <td>{r.sensorCO2}</td>
                            <td>{r.alturaProm}</td>
                            <td>{r.area}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-end">
                      <CustomButton variant="backIcon" onClick={() => setStep(6)} />
                      <CustomButton variant="save" onClick={handleSaveProject}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para materiales (Paso 3) */}
      {showAddMaterialModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddMaterialModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddMaterialModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">Lista de Materiales</h4>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ color: "var(--primary-color)" }}>Nombre Material</th>
                  <th style={{ color: "var(--primary-color)" }}>Conductividad (W/m2K)</th>
                  <th style={{ color: "var(--primary-color)" }}>Calor específico (J/kgK)</th>
                  <th style={{ color: "var(--primary-color)" }}>Densidad (kg/m3)</th>
                  <th style={{ color: "var(--primary-color)" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {materialsList.map((mat, idx) => {
                  const atributos = mat.atributs || {};
                  return (
                    <tr key={idx}>
                      <td>{atributos.name}</td>
                      <td>{atributos.conductivity}</td>
                      <td>{atributos["specific heat"]}</td>
                      <td>{atributos.density}</td>
                      <td>
                        <CustomButton
                          variant="addIcon"
                          onClick={() => {
                            handleAddMaterial(mat);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para seleccion de elementos (Paso 5) */}
      {showAddElementModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddElementModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddElementModal(false)}>
              &times;
            </button>
            <h4 className="mb-3">
              Lista de {modalElementType === "ventanas" ? "Ventanas" : "Puertas"}
            </h4>
            <ul className="nav mb-3" style={{ display: "flex", padding: 0, listStyle: "none" }}>
              {["Ventanas", "Puertas"].map((tab) => (
                <li key={tab} style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#fff",
                      color: modalElementType === tab.toLowerCase() ? "var(--primary-color)" : "var(--secondary-color)",
                      border: "none",
                      cursor: "pointer",
                      borderBottom: modalElementType === tab.toLowerCase() ? "3px solid var(--primary-color)" : "none",
                    }}
                    onClick={() => setModalElementType(tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
            <table className="table table-bordered table-striped">
              <thead>
                {modalElementType === "ventanas" ? (
                  <tr>
                    <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                    <th style={{ color: "var(--primary-color)" }}>U Vidrio [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)" }}>FS Vidrio []</th>
                    <th style={{ color: "var(--primary-color)" }}>Tipo Cierre</th>
                    <th style={{ color: "var(--primary-color)" }}>Tipo Marco</th>
                    <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                    <th style={{ color: "var(--primary-color)" }}>Acción</th>
                  </tr>
                ) : (
                  <tr>
                    <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                    <th style={{ color: "var(--primary-color)" }}>U Puerta opaca [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)" }}>Nombre Ventana</th>
                    <th style={{ color: "var(--primary-color)" }}>% Vidrio</th>
                    <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                    <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                    <th style={{ color: "var(--primary-color)" }}>Acción</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {elementsList
                  .filter((el) => el.type === (modalElementType === "ventanas" ? "window" : "door"))
                  .map((el: any, idx) => (
                    <tr key={idx}>
                      {modalElementType === "ventanas" ? (
                        <>
                          <td>{el.name_element}</td>
                          <td>{el.atributs?.u_vidrio}</td>
                          <td>{el.atributs?.fs_vidrio}</td>
                          <td>{el.atributs?.clousure_type}</td>
                          <td>{el.atributs?.frame_type}</td>
                          <td>{el.u_marco}</td>
                          <td>{(el.fm * 100).toFixed(0)}%</td>
                          <td>
                            <CustomButton variant="addIcon" onClick={() => handleAddElement(el)} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{el.name_element}</td>
                          <td>{el.atributs?.u_puerta_opaca}</td>
                          <td>{el.atributs?.name_ventana}</td>
                          <td>
                            {el.atributs?.porcentaje_vidrio !== undefined
                              ? (el.atributs.porcentaje_vidrio * 100).toFixed(0) + "%"
                              : "0%"}
                          </td>
                          <td>{el.u_marco}</td>
                          <td>{(el.fm * 100).toFixed(0)}%</td>
                          <td>
                            <CustomButton variant="addIcon" onClick={() => handleAddElement(el)} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para crear puerta */}
      {showCreateDoorModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateDoorModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateDoorModal(false)}>
              &times;
            </button>
            <h4>Crear Puerta</h4>
            <div className="mb-3">
              <label className="form-label">Nombre de la puerta</label>
              <input
                type="text"
                className="form-control"
                value={doorData.name_element}
                onChange={(e) => setDoorData({ ...doorData, name_element: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">U puerta opaca</label>
              <input
                type="number"
                className="form-control"
                value={doorData.u_puerta_opaca}
                onChange={(e) =>
                  setDoorData({ ...doorData, u_puerta_opaca: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Porcentaje de vidrio</label>
              <input
                type="number"
                className="form-control"
                value={doorData.porcentaje_vidrio}
                onChange={(e) =>
                  setDoorData({ ...doorData, porcentaje_vidrio: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">U marco</label>
              <input
                type="number"
                className="form-control"
                value={doorData.u_marco}
                onChange={(e) =>
                  setDoorData({ ...doorData, u_marco: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">FM</label>
              <input
                type="number"
                className="form-control"
                value={doorData.fm}
                onChange={(e) =>
                  setDoorData({ ...doorData, fm: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ventanas disponibles</label>
              <select
                className="form-control"
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const win = availableWindows.find((w: any) => w.id === selectedId);
                  if (win) {
                    setDoorData({
                      ...doorData,
                      ventana_id: win.id,
                      name_ventana: win.atributs?.name || "",
                    });
                  }
                }}
              >
                <option value="0">Seleccione una ventana</option>
                {availableWindows.map((win: any) => (
                  <option key={win.id} value={win.id}>
                    {win.atributs?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="backIcon" onClick={() => setShowCreateDoorModal(false)} />
              <CustomButton variant="save" onClick={handleCreateDoorElement}>
                <i className="bi bi-plus"></i>
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear ventana */}
      {showCreateWindowModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateWindowModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateWindowModal(false)}>
              &times;
            </button>
            <h4>Crear Ventana</h4>
            <div className="mb-3">
              <label className="form-label">Nombre de la ventana</label>
              <input
                type="text"
                className="form-control"
                value={windowData.name_element}
                onChange={(e) => setWindowData({ ...windowData, name_element: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">U vidrio</label>
              <input
                type="number"
                className="form-control"
                value={windowData.u_vidrio}
                onChange={(e) =>
                  setWindowData({ ...windowData, u_vidrio: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">FS vidrio</label>
              <input
                type="number"
                className="form-control"
                value={windowData.fs_vidrio}
                onChange={(e) =>
                  setWindowData({ ...windowData, fs_vidrio: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo de marco</label>
              <input
                type="text"
                className="form-control"
                value={windowData.frame_type}
                onChange={(e) => setWindowData({ ...windowData, frame_type: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo de cierre</label>
              <input
                type="text"
                className="form-control"
                value={windowData.clousure_type}
                onChange={(e) => setWindowData({ ...windowData, clousure_type: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">U marco</label>
              <input
                type="number"
                className="form-control"
                value={windowData.u_marco}
                onChange={(e) =>
                  setWindowData({ ...windowData, u_marco: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">FM</label>
              <input
                type="number"
                className="form-control"
                value={windowData.fm}
                onChange={(e) =>
                  setWindowData({ ...windowData, fm: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="backIcon" onClick={() => setShowCreateWindowModal(false)} />
              <CustomButton variant="save" onClick={handleCreateWindowElement}>
                <i className="bi bi-plus"></i>
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .card {
          border: 1px solid #ccc;
        }
        /* Estilos para los modales */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
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
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #333;
        }
        /* Centrado en tablas */
        .table th,
        .table td {
          text-align: center;
          vertical-align: middle;
        }
        /* Filas alternadas */
        .table-striped tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .table-striped tbody tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      `}</style>
    </>
  );
};

export default ProjectCompleteWorkflowPage;
