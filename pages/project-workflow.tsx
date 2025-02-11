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

  // Datos del formulario en pasos 1 y 2
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

  // Paginación para lista de materiales
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5; // 5 materiales por pagina

  // Materiales seleccionados
  const [selectedMaterials, setSelectedMaterials] = useState<
    { id: number; name: string }[]
  >([]);

  // Estados para el modal de "Agregar nuevo material"
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialDensity, setNewMaterialDensity] = useState<number>(0);
  const [newMaterialConductivity, setNewMaterialConductivity] = useState<number>(0);
  const [newMaterialSpecificHeat, setNewMaterialSpecificHeat] = useState<number>(0);

  // Estado para los detalles constructivos (Paso 4)
  const [details, setDetails] = useState<any[]>([]);
  // Pestaña activa para detalles
  const [tabDetailSection, setTabDetailSection] = useState("Techumbre");

  // Estado para elementos (Paso 5)
  const [elementsList, setElementsList] = useState<any[]>([]);

  // Datos de ejemplo para otros pasos 
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
    { nombre: "V Base", uVidrio: 5.7, fsVidrio: 0.87, tipoCierre: "Corredera", tipoMarco: "Fierro", uMarco: 5.7, fm: "75%" },
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

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // para guardar datos en el Paso 7
  const handleSave = () => {
    Swal.fire("Datos guardados", "Los datos se han guardado correctamente (placeholder).", "success");
  };

  // Endpoint: crear proyecto (Paso 2)
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
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(url, requestBody, { headers });
      console.log("Proyecto creado:", response.data);
      const { project_id, message } = response.data;
      setCreatedProjectId(project_id);
      setProjectCreated(true);
      Swal.fire("Proyecto creado", `ID: ${project_id} / Mensaje: ${message}`, "success");
      setStep(3); // Avanzar a Paso 3
    } catch (error: any) {
      console.error("Error al crear proyecto:", error.response?.data || error.message);
      Swal.fire("Error al crear proyecto", error.response?.data?.detail || error.message, "error");
    }
  };

  // Funcion para agregar un material a la lista de seleccionados
  const handleAddMaterial = (material: any) => {
    if (selectedMaterials.some((m) => m.id === material.id)) {
      Swal.fire("Material ya seleccionado", "Este material ya fue agregado", "info");
      return;
    }
    setSelectedMaterials([...selectedMaterials, { id: material.id, name: material.atributs?.name }]);
    Swal.fire("Material agregado", `${material.atributs?.name} ha sido seleccionado.`, "success");
  };

  // Funcion para eliminar un material de la lista de seleccionados
  const handleRemoveMaterial = (materialId: number) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.id !== materialId));
    Swal.fire("Material removido", "El material ha sido eliminado de la selección", "info");
  };

  // Funcion para guardar los materiales seleccionados en el proyecto
  const handleSaveMaterials = async () => {
    if (!createdProjectId) {
      Swal.fire("Proyecto no encontrado", "No se ha creado el proyecto.", "error");
      return;
    }
    if (selectedMaterials.length === 0) {
      Swal.fire("Sin materiales", "Selecciona al menos un material.", "warning");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/projects/${createdProjectId}/constants/select`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const body = selectedMaterials.map((m) => m.id);
      const response = await axios.post(url, body, { headers });
      Swal.fire("Materiales guardados", response.data.message, "success");
      setStep(4);
    } catch (error: any) {
      console.error("Error al guardar materiales:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  // Función para enviar el nuevo material 
  const handleNewMaterialSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/user/constants/create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const body = {
        atributs: {
          name: newMaterialName,
          density: newMaterialDensity,
          conductivity: newMaterialConductivity,
          specific_heat: newMaterialSpecificHeat,
        },
        name: "materials",
        type: "definition materials",
      };
      const response = await axios.post(url, body, { headers });
      const nuevoMaterial = response.data;
      Swal.fire("Material agregado", `${nuevoMaterial.atributs.name} fue creado correctamente.`, "success");
      // Actualizar la lista principal
      setMaterialsList((prev) => [nuevoMaterial, ...prev]);
      // Agregar a la lista de seleccionados
      setSelectedMaterials((prev) => [...prev, { id: nuevoMaterial.id, name: nuevoMaterial.atributs.name }]);
      // refrescamos la lista principal 
      fetchMaterialsList(currentPage);
      setNewMaterialName("");
      setNewMaterialDensity(0);
      setNewMaterialConductivity(0);
      setNewMaterialSpecificHeat(0);
      setShowAddMaterialModal(false);
    } catch (error: any) {
      console.error("Error al crear material:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  // Función para obtener los detalles constructivos (Paso 4)
  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      // section=admin segun lo solicitado
      const url = `${constantUrlApiEndpoint}/user/details/?section=admin`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      setDetails(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener detalles:", error.response?.data || error.message);
      Swal.fire("Error", "Error al obtener detalles. Ver consola.", "error");
    }
  };

  // Funcion para filtrar detalles segun la pestaña seleccionada
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

  // Funcion para obtener la lista de materiales
  const fetchMaterialsList = async (page: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/constants/?page=${page}&per_page=${perPage}`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      const data = response.data;
      setMaterialsList(data.constants || []);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        Swal.fire("No hay más materiales", "Regresando a la página anterior.", "info");
        if (currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else {
        console.error("Error al obtener lista de materiales:", error);
        Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error");
      }
    }
  };

  // Funcion para obtener los elementos (Paso 5) 
  const fetchElements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token no encontrado", "Inicia sesión.", "warning");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/elements/`;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const response = await axios.get(url, { headers });
      setElementsList(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener elementos:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  // Funcion seleccionar ventana o puerta y registrarlas en el proyecto
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
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
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
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const body = [id];
      const response = await axios.post(url, body, { headers });
      Swal.fire("Puerta agregada", response.data.message, "success");
    } catch (error: any) {
      console.error("Error al seleccionar puerta:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || error.message, "error");
    }
  };

  // Funcion para agregar un nuevo detalle 
  const handleAddDetail = () => {
    Swal.fire("Agregar detalle", "Funcionalidad pendiente para agregar un nuevo detalle.", "info");
  };

  // useEffect para cargar la lista de materiales cuando estemos en el paso 3
  useEffect(() => {
    if (step === 3) {
      fetchMaterialsList(currentPage);
    }
  }, [step, currentPage]);

  // useEffect para cargar los detalles cuando estemos en el paso 4
  useEffect(() => {
    if (step === 4) {
      fetchDetails();
    }
  }, [step]);

  // useEffect para cargar los elementos cuando estemos en el paso 5
  useEffect(() => {
    if (step === 5) {
      fetchElements();
    }
  }, [step]);

  // Encabezado principal
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
          <div className="d-flex align-items-center gap-2 mt-2">
            <span style={{ fontWeight: "bold" }}>Proyecto:</span>
            <CustomButton variant="save" style={{ padding: "0.5rem 1rem" }}>
              {`Edificación Nº ${createdProjectId ?? "xxxxx"}`}
            </CustomButton>
            <CustomButton variant="save" style={{ padding: "0.5rem 1rem" }}>
              {formData.department || "Departamento"}
            </CustomButton>
          </div>
        </div>
      );
    }
  };

  // Estilos para la sidebar
  const internalSidebarWidth = 380;
  const sidebarItemHeight = 80;
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

  // Logica de paginacion
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const handleNextPage = () => {
    if (materialsList.length === perPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <TopBar sidebarWidth={sidebarWidth} />

      <div
        className="container"
        style={{
          maxWidth: "1400px",
          marginTop: "80px",
          marginLeft: `calc(${sidebarWidth} + 130px)`,
          marginRight: "30px",
          transition: "margin-left 0.3s ease",
          fontFamily: "var(--font-family-base)",
        }}
      >
        {renderMainHeader()}

        <div className="card shadow w-100" style={{ overflow: "hidden" }}>
          <div className="card-body p-0">
            <div className="d-flex" style={{ alignItems: "stretch", gap: 0 }}>
              {/* Sidebar interno */}
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

              {/* Contenido principal */}
              <div style={{ flex: 1, padding: "20px" }}>
                {/* PASO 1 */}
                {step === 1 && (
                  <>
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del proyecto</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name_project}
                          onChange={(e) => handleInputChange("name_project", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre del propietario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.owner_name}
                          onChange={(e) => handleInputChange("owner_name", e.target.value)}
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
                          onChange={(e) => handleInputChange("owner_lastname", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
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
                          onChange={(e) => handleInputChange("department", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Provincia</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.province}
                          onChange={(e) => handleInputChange("province", e.target.value)}
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
                          onChange={(e) => handleInputChange("district", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo de edificación</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.building_type}
                          onChange={(e) => handleInputChange("building_type", e.target.value)}
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
                          onChange={(e) => handleInputChange("main_use_type", e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Número de niveles</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.number_levels}
                          onChange={(e) =>
                            handleInputChange("number_levels", parseInt(e.target.value) || 0)
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
                            handleInputChange("number_homes_per_level", parseInt(e.target.value) || 0)
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
                            handleInputChange("built_surface", parseFloat(e.target.value) || 0)
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

                {/* PASO 2 */}
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
                            handleInputChange("latitude", 150);
                            handleInputChange("longitude", 250);
                            Swal.fire("Ubicación asignada", "Ubicación de prueba (lat=150, lon=250)", "success");
                          }}
                        >
                          Ubicación actual
                        </CustomButton>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="back" onClick={() => setStep(1)}>
                        Anterior
                      </CustomButton>
                      <CustomButton variant="save" onClick={handleCreateProject}>
                        Guardar proyecto
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* PASO 3: Lista de materiales */}
                {step === 3 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={() => setShowAddMaterialModal(true)}>
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th style={{ color: "var(--primary-color)" }}>Nombre Material</th>
                          <th style={{ color: "var(--primary-color)" }}>Conductividad (W/mK)</th>
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
                                <CustomButton variant="addIcon" onClick={() => handleAddMaterial(mat)} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="d-flex justify-content-end align-items-center mt-3 gap-3">
                      <span>Página: {currentPage}</span>
                      <CustomButton variant="backIcon" onClick={handlePrevPage} disabled={currentPage === 1} margin="0.5rem" />
                      <CustomButton variant="forwardIcon" onClick={handleNextPage} disabled={materialsList.length < perPage} margin="0.5rem" />
                    </div>

                    <h6 className="mt-4">Materiales Seleccionados</h6>
                    {selectedMaterials.length > 0 ? (
                      <table className="table table-bordered" style={{ width: "35%" }}>
                        <thead>
                          <tr>
                            <th style={{ color: "var(--primary-color)" }}>Nombre Material</th>
                            <th style={{ color: "var(--primary-color)" }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaterials.map((mat) => (
                            <tr key={mat.id}>
                              <td>{mat.name}</td>
                              <td>
                                <CustomButton variant="deleteIcon" onClick={() => handleRemoveMaterial(mat.id)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No se ha seleccionado ningún material.</p>
                    )}

                    <div className="mt-4 text-end">
                      <CustomButton variant="back" onClick={() => setStep(2)}>
                        Anterior
                      </CustomButton>
                      <CustomButton variant="save" onClick={handleSaveMaterials}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* PASO 4: Detalles constructivos */}
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
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th style={{ color: "var(--primary-color)" }}>Ubicacion Detalle</th>
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
                            <table className="table table-bordered">
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
                            <table className="table table-bordered">
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
                            <table className="table table-bordered">
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
                      <CustomButton variant="back" onClick={() => setStep(3)}>
                        Anterior
                      </CustomButton>
                      <CustomButton variant="save" onClick={() => setStep(5)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* PASO 5: Elementos operables */}
                {step === 5 && (
                  <>
                    <div className="d-flex justify-content-end mb-3">
                      <CustomButton variant="save" onClick={handleAddDetail}>
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
                            }}
                            onClick={() => setTabElementosOperables(tab.toLowerCase())}
                          >
                            {tab}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {tabElementosOperables === "ventanas" ? (
                      elementsList.filter((el) => el.type === "window").length > 0 ? (
                        <table className="table table-bordered">
                          <thead>
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
                          </thead>
                          <tbody>
                            {elementsList
                              .filter((el) => el.type === "window")
                              .map((el: any) => (
                                <tr key={el.id}>
                                  <td>{el.name_element}</td>
                                  <td>{el.atributs?.u_vidrio}</td>
                                  <td>{el.atributs?.fs_vidrio}</td>
                                  <td>{el.atributs?.clousure_type}</td>
                                  <td>{el.atributs?.frame_type}</td>
                                  <td>{el.u_marco}</td>
                                  <td>{(el.fm * 100).toFixed(0)}%</td>
                                  <td>
                                    <CustomButton variant="addIcon" onClick={() => handleSelectWindow(el.id)} />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No hay elementos para ventanas.</p>
                      )
                    ) : (
                      elementsList.filter((el) => el.type === "door").length > 0 ? (
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th style={{ color: "var(--primary-color)" }}>Nombre Elemento</th>
                              <th style={{ color: "var(--primary-color)" }}>U puerta opaca [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>Vidrio []</th>
                              <th style={{ color: "var(--primary-color)" }}>% vidrio [%]</th>
                              <th style={{ color: "var(--primary-color)" }}>U Marco [W/m2K]</th>
                              <th style={{ color: "var(--primary-color)" }}>FM [%]</th>
                              <th style={{ color: "var(--primary-color)" }}>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {elementsList
                              .filter((el) => el.type === "door")
                              .map((el: any) => (
                                <tr key={el.id}>
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
                                    <CustomButton variant="addIcon" onClick={() => handleSelectDoor(el.id)} />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No hay elementos para puertas.</p>
                      )
                    )}
                    <div className="mt-4 text-end">
                      <CustomButton variant="back" onClick={() => setStep(4)}>
                        Anterior
                      </CustomButton>
                      <CustomButton variant="save" onClick={() => setStep(6)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* PASO 6 */}
                {step === 6 && (
                  <>
                    <h5 className="fw-bold mb-3">Tipología de recinto</h5>
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <button className={`nav-link ${tabTipologiaRecinto === "ventilacion" ? "active" : ""}`} onClick={() => setTabTipologiaRecinto("ventilacion")}>
                          Ventilación y caudales
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link ${tabTipologiaRecinto === "iluminacion" ? "active" : ""}`} onClick={() => setTabTipologiaRecinto("iluminacion")}>
                          Iluminacion
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link ${tabTipologiaRecinto === "cargas" ? "active" : ""}`} onClick={() => setTabTipologiaRecinto("cargas")}>
                          Cargas internas
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link ${tabTipologiaRecinto === "horario" ? "active" : ""}`} onClick={() => setTabTipologiaRecinto("horario")}>
                          Horario y Clima
                        </button>
                      </li>
                    </ul>
                    <div className="tab-content border border-top-0 p-3">
                    </div>
                    <div className="mt-4 text-end">
                      <CustomButton variant="back" onClick={() => setStep(5)}>
                        Anterior
                      </CustomButton>
                      <CustomButton variant="save" onClick={() => setStep(7)}>
                        Grabar datos
                      </CustomButton>
                    </div>
                  </>
                )}

                {/* PASO 7 */}
                {step === 7 && (
                  <>
                    <h5 className="fw-bold mb-3">Recinto</h5>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div></div>
                      <CustomButton variant="save">
                        <i className="bi bi-plus"></i> Nuevo
                      </CustomButton>
                    </div>
                    <table className="table table-bordered">
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
                      <CustomButton variant="back" onClick={() => setStep(6)}>
                        Anterior
                      </CustomButton>
                      <CustomButton variant="save" onClick={handleSave}>
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

      {/* Modal para agregar nuevo material */}
      {showAddMaterialModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h4>Agregar Nuevo Material</h4>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Densidad</label>
              <input
                type="number"
                className="form-control"
                value={newMaterialDensity}
                onChange={(e) => setNewMaterialDensity(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Conductividad (W/mK)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterialConductivity}
                onChange={(e) => setNewMaterialConductivity(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Calor específico (J/kgK)</label>
              <input
                type="number"
                className="form-control"
                value={newMaterialSpecificHeat}
                onChange={(e) => setNewMaterialSpecificHeat(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <CustomButton variant="back" onClick={() => setShowAddMaterialModal(false)}>
                Cancelar
              </CustomButton>
              <CustomButton variant="save" onClick={handleNewMaterialSubmit}>
                Agregar Material
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .card {
          border: 1px solid #ccc;
        }
      `}</style>
    </>
  );
};

export default ProjectCompleteWorkflowPage;
