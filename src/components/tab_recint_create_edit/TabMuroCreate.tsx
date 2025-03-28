// TabMuroCreate.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { notify } from "@/utils/notify";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";

// Interfaz para muros
interface Wall {
  id?: number;
  wall_id: number;
  name: string;
  characteristics: string;
  angulo_azimut: string;
  area: number;
  orientation?: string;
  u?: number;
}

// Interfaz para puentes térmicos (actualizada para incluir los nombres de los elementos)
interface ThermalBridge {
  id: number;
  po1_length: number;
  po1_id_element: number;
  po1_element_name?: string;
  po2_length: number;
  po2_id_element: number;
  po2_element_name?: string;
  po3_length: number;
  po3_id_element: number;
  po3_element_name?: string;
  po4_length: number;
  po4_e_aislacion: number;
  po4_id_element: number;
  po4_element_name?: string;
}

// Interfaz para las opciones de desplegable (tanto para muros como para elementos de puente térmico)
interface WallDetail {
  type: string;
  id: number;
  info: any;
  value_u: number;
  created_status: string;
  name_detail: string;
  project_id: number;
}

const TabMuroCreate: React.FC = () => {
  // Estados de modales
  const [isWallModalOpen, setIsWallModalOpen] = useState<boolean>(false);
  const [isThermalBridgeModalOpen, setIsThermalBridgeModalOpen] = useState<boolean>(false);
  // Modal de confirmación para eliminación de muro
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [wallToDelete, setWallToDelete] = useState<Wall | null>(null);
  // Modal de confirmación para eliminación de puente térmico
  const [isDeleteBridgeModalOpen, setIsDeleteBridgeModalOpen] = useState<boolean>(false);
  const [bridgeToDelete, setBridgeToDelete] = useState<ThermalBridge | null>(null);

  // Estados de datos de las tablas
  const [murosData, setMurosData] = useState<Wall[]>([]);
  const [puentesData, setPuentesData] = useState<ThermalBridge[]>([]);

  // Estados para edición de muros
  const [editingWallId, setEditingWallId] = useState<number | null>(null);
  const [editingWallData, setEditingWallData] = useState<Wall | null>(null);

  // Estados para edición de puentes térmicos
  const [editingBridgeId, setEditingBridgeId] = useState<number | null>(null);
  const [editingBridgeData, setEditingBridgeData] = useState<ThermalBridge | null>(null);

  // Otras opciones y datos del formulario
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  const [wallOptions, setWallOptions] = useState<WallDetail[]>([]);
  // Opciones para elementos (usado tanto en modal de creación como en edición en tabla)
  const [detailOptions, setDetailOptions] = useState<WallDetail[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Formularios para nuevo muro y puente térmico (modal de creación)
  const [newWall, setNewWall] = useState<Wall>({
    wall_id: 0,
    name: "",
    characteristics: "",
    angulo_azimut: "",
    area: 0,
  });
  const [newThermalBridge, setNewThermalBridge] = useState<ThermalBridge>({
    id: 0,
    po1_length: 0,
    po1_id_element: 0,
    po2_length: 0,
    po2_id_element: 0,
    po3_length: 0,
    po3_id_element: 0,
    po4_length: 0,
    po4_e_aislacion: 0,
    po4_id_element: 0,
  });

  // Obtener el project_id del localStorage
  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id_edit");
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);

  // Activar project id 
  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Función para obtener token y enclosure_id desde localStorage
  const getAuthData = () => {
    const token = localStorage.getItem("token");
    const enclosure_id = localStorage.getItem("recinto_id");
    if (!token) {
      notify("Error: No se encontró el token en el localStorage.");
      return null;
    }
    if (!enclosure_id) {
      return null;
    }
    return { token, enclosure_id };
  };

  // Obtener opciones de muros para el desplegable
  useEffect(() => {
    const fetchWallOptions = async () => {
      if (!projectId) return;
      try {
        const authData = getAuthData();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (authData) headers.Authorization = `Bearer ${authData.token}`;
        const response = await fetch(
          `${constantUrlApiEndpoint}/project/${projectId}/details/Muro`,
          { headers }
        );
        if (!response.ok) throw new Error("Error al obtener detalles de muros");
        const walls: WallDetail[] = await response.json();
        setWallOptions(walls);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWallOptions();
  }, [projectId]);

  // Obtener todas las opciones de detalles para los elementos del puente térmico
  useEffect(() => {
    const fetchDetailOptions = async () => {
      if (!projectId) return;
      try {
        const authData = getAuthData();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (authData) headers.Authorization = `Bearer ${authData.token}`;
        const response = await fetch(
          `${constantUrlApiEndpoint}/project/${projectId}/details`,
          { headers }
        );
        if (!response.ok) throw new Error("Error al obtener detalles");
        const details: WallDetail[] = await response.json();
        setDetailOptions(details);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDetailOptions();
  }, [projectId]);

  // Obtener opciones de ángulo azimut
  useEffect(() => {
    const fetchAngleOptions = async () => {
      try {
        const authData = getAuthData();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (authData) headers.Authorization = `Bearer ${authData.token}`;
        const response = await fetch(`${constantUrlApiEndpoint}/angle-azimut`, { headers });
        if (!response.ok) throw new Error("Error al obtener opciones de ángulo azimut");
        const options = await response.json();
        setAngleOptions(options);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAngleOptions();
  }, []);

  // Función para obtener datos de la API (muros y puentes térmicos)
  const fetchData = async () => {
    const authData = getAuthData();
    if (!authData) return;
    const { token, enclosure_id } = authData;
    try {
      // Muros
      const responseMuros = await fetch(
        `${constantUrlApiEndpoint}/wall-enclosures/${enclosure_id}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (!responseMuros.ok) throw new Error("Error al obtener muros");
      const muros = await responseMuros.json();
      setMurosData(muros);

      // Puentes térmicos
      const responsePuentes = await fetch(
        `${constantUrlApiEndpoint}/thermal-bridge/${enclosure_id}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (!responsePuentes.ok) throw new Error("Error al obtener puentes térmicos");
      const puentes = await responsePuentes.json();
      setPuentesData(puentes);
    } catch (error) {
      notify("Error al cargar los datos");
      console.error(error);
    }
  };

  // Iniciar edición de muro (edición en línea) usando el identificador único (id)
  const handleEditWall = (id: number) => {
    const wallToEdit = murosData.find((w) => w.id === id);
    if (wallToEdit) {
      setEditingWallId(id);
      setEditingWallData({ ...wallToEdit });
    }
  };

  // Actualiza el estado de edición del muro
  const handleEditWallChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingWallData((prev) =>
      prev ? { ...prev, [name]: name === "wall_id" || name === "area" ? Number(value) : value } : null
    );
  };

  // Aceptar edición de muro (PUT)
  const handleAcceptEditWall = async (id: number) => {
    if (!editingWallData) return;
    const authData = getAuthData();
    if (!authData) return;
    const updateId = editingWallData.id || id;
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/wall-enclosures-update/${updateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
          body: JSON.stringify({
            wall_id: editingWallData.wall_id,
            characteristics: editingWallData.characteristics,
            angulo_azimut: editingWallData.angulo_azimut,
            area: editingWallData.area,
          }),
        }
      );
      if (!response.ok) throw new Error("Error al actualizar muro");
      notify("Muro actualizado exitosamente");
      setEditingWallId(null);
      setEditingWallData(null);
      fetchData();
    } catch (error) {
      notify("Error al actualizar muro");
      console.error(error);
    }
  };

  const handleCancelEditWall = () => {
    setEditingWallId(null);
    setEditingWallData(null);
  };

  // Nueva función: Abrir modal de confirmación de eliminación de muro
  const handleOpenDeleteModal = (wall: Wall) => {
    setWallToDelete(wall);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteWall = async () => {
    if (!wallToDelete) return;
    const authData = getAuthData();
    if (!authData) return;
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/wall-enclosures-delete/${wallToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al eliminar muro");
      const data = await response.json();
      notify(data.mensaje || "Muro eliminado exitosamente.");
      setIsDeleteModalOpen(false);
      setWallToDelete(null);
      fetchData();
    } catch (error) {
      notify("Error al eliminar muro");
      console.error(error);
    }
  };

  // Nueva función: Cancelar eliminación de muro
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setWallToDelete(null);
  };

  // Iniciar edición de puente térmico: se guarda el registro completo en editingBridgeData
  const handleEditBridge = (bridgeId: number) => {
    const bridgeToEdit = puentesData.find((b) => b.id === bridgeId);
    if (bridgeToEdit) {
      setEditingBridgeId(bridgeId);
      setEditingBridgeData({ ...bridgeToEdit });
    }
  };

  // Actualiza el estado de edición del puente térmico
  const handleEditBridgeChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingBridgeData((prev) =>
      prev ? { ...prev, [name]: name.startsWith("po") ? Number(value) : value } : null
    );
  };

  // Aceptar edición de puente térmico (PUT)
  const handleAcceptEditBridge = async (bridgeId: number) => {
    if (!editingBridgeData) return;
    const authData = getAuthData();
    if (!authData) return;
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/thermal-bridge-update/${bridgeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
          body: JSON.stringify(editingBridgeData),
        }
      );
      if (!response.ok) throw new Error("Error al actualizar puente térmico");
      notify("Puente térmico actualizado exitosamente");
      setEditingBridgeId(null);
      setEditingBridgeData(null);
      fetchData();
    } catch (error) {
      notify("Error al actualizar puente térmico");
      console.error(error);
    }
  };

  const handleCancelEditBridge = () => {
    setEditingBridgeId(null);
    setEditingBridgeData(null);
  };

  // Nueva función: Abrir modal de confirmación de eliminación de puente térmico
  const handleOpenDeleteBridgeModal = (bridge: ThermalBridge) => {
    setBridgeToDelete(bridge);
    setIsDeleteBridgeModalOpen(true);
  };

  // Función para confirmar eliminación de puente térmico
  const handleConfirmDeleteBridge = async () => {
    if (!bridgeToDelete) return;
    const authData = getAuthData();
    if (!authData) return;
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/thermal-bridge-delete/${bridgeToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al eliminar puente térmico");
      const data = await response.json();
      notify(data.mensaje || "Puente térmico eliminado exitosamente.");
      setIsDeleteBridgeModalOpen(false);
      setBridgeToDelete(null);
      fetchData();
    } catch (error) {
      notify("Error al eliminar puente térmico");
      console.error(error);
    }
  };

  // Función para cancelar eliminación de puente térmico
  const handleCancelDeleteBridge = () => {
    setIsDeleteBridgeModalOpen(false);
    setBridgeToDelete(null);
  };

  // Columnas para la tabla de muros (se usa row.id para identificar la fila en edición)
  const murosColumns = [
    {
      headerName: "Muros",
      field: "name",
      renderCell: (row: Wall) => {
        if (row.id === editingWallId && editingWallData) {
          return (
            <select
              name="wall_id"
              value={editingWallData.wall_id}
              onChange={handleEditWallChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              {wallOptions.map((wall) => (
                <option key={wall.id} value={wall.id}>
                  {wall.name_detail}
                </option>
              ))}
            </select>
          );
        }
        return row.name;
      },
    },
    {
      headerName: "Caracteristicas",
      field: "characteristics",
      renderCell: (row: Wall) => {
        if (row.id === editingWallId && editingWallData) {
          return (
            <select
              name="characteristics"
              value={editingWallData.characteristics}
              onChange={handleEditWallChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              <option value="Exterior">Exterior</option>
              <option value="Inter Recintos Clim">Inter Recintos Clim</option>
              <option value="Inter Recintos No Clim">Inter Recintos No Clim</option>
            </select>
          );
        }
        return row.characteristics;
      },
    },
    {
      headerName: "Ángulo Azimut",
      field: "angulo_azimut",
      renderCell: (row: Wall) => {
        if (row.id === editingWallId && editingWallData) {
          return (
            <select
              name="angulo_azimut"
              value={editingWallData.angulo_azimut}
              onChange={handleEditWallChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              {angleOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return row.angulo_azimut;
      },
    },
    { headerName: "Orientación", field: "orientation" },
    {
      headerName: "Área [m²]",
      field: "area",
      renderCell: (row: Wall) => {
        if (row.id === editingWallId && editingWallData) {
          return (
            <input
              type="number"
              name="area"
              min="0"
              step="0.01"
              value={editingWallData.area}
              onChange={handleEditWallChange}
              onBlur={(e) => {
                const rounded = parseFloat(e.target.value).toFixed(2);
                setEditingWallData({ ...editingWallData, area: Number(rounded) });
              }}
              className="form-control form-control-sm"
            />
          );
        }
        return Number(row.area).toFixed(2);
      },
    },
    {
      headerName: "U [W/m²K]",
      field: "u",
      renderCell: (row: Wall) => {
        return <span>{row.u ? Number(row.u).toFixed(2) : ""}</span>;
      },
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: Wall) => {
        const isEditing = row.id === editingWallId;
        return isEditing ? (
          <ActionButtonsConfirm
            onAccept={() => handleAcceptEditWall(row.id!)}
            onCancel={handleCancelEditWall}
          />
        ) : (
          <ActionButtons
            onEdit={() => handleEditWall(row.id!)}
            onDelete={() => handleOpenDeleteModal(row)}
          />
        );
      },
    },
  ];

  // Columnas para la tabla de puentes térmicos
  const puentesColumns = [
    {
      headerName: "L[m]",
      field: "po1_length",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <input
              type="number"
              name="po1_length"
              min="0"
              step="0.01"
              value={editingBridgeData.po1_length}
              onChange={handleEditBridgeChange}
              onBlur={(e) => {
                const rounded = parseFloat(e.target.value).toFixed(2);
                setEditingBridgeData({ ...editingBridgeData, po1_length: Number(rounded) });
              }}
              className="form-control form-control-sm"
            />
          );
        }
        return Number(row.po1_length).toFixed(2);
      },
    },
    {
      headerName: "Elemento",
      field: "po1_id_element",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <select
              name="po1_id_element"
              value={editingBridgeData.po1_id_element}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              {detailOptions.map((detail) => (
                <option key={detail.id} value={detail.id}>
                  {detail.name_detail}
                </option>
              ))}
            </select>
          );
        }
        return row.po1_element_name || row.po1_id_element;
      },
    },
    {
      headerName: "L[m]",
      field: "po2_length",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <input
              type="number"
              name="po2_length"
              value={editingBridgeData.po2_length}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            />
          );
        }
        return row.po2_length;
      },
    },
    {
      headerName: "Elemento",
      field: "po2_id_element",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <select
              name="po2_id_element"
              value={editingBridgeData.po2_id_element}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              {detailOptions.map((detail) => (
                <option key={detail.id} value={detail.id}>
                  {detail.name_detail}
                </option>
              ))}
            </select>
          );
        }
        return row.po2_element_name || row.po2_id_element;
      },
    },
    {
      headerName: "L[m]",
      field: "po3_length",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <input
              type="number"
              name="po3_length"
              value={editingBridgeData.po3_length}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            />
          );
        }
        return row.po3_length;
      },
    },
    {
      headerName: "Elemento",
      field: "po3_id_element",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <select
              name="po3_id_element"
              value={editingBridgeData.po3_id_element}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              {detailOptions.map((detail) => (
                <option key={detail.id} value={detail.id}>
                  {detail.name_detail}
                </option>
              ))}
            </select>
          );
        }
        return row.po3_element_name || row.po3_id_element;
      },
    },
    {
      headerName: "L[m]",
      field: "po4_length",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <input
              type="number"
              name="po4_length"
              value={editingBridgeData.po4_length}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            />
          );
        }
        return row.po4_length;
      },
    },
    {
      headerName: "e Aislación [cm]",
      field: "po4_e_aislacion",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <input
              type="number"
              name="po4_e_aislacion"
              value={editingBridgeData.po4_e_aislacion}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            />
          );
        }
        return row.po4_e_aislacion;
      },
    },
    {
      headerName: "Elemento",
      field: "po4_id_element",
      renderCell: (row: ThermalBridge) => {
        if (row.id === editingBridgeId && editingBridgeData) {
          return (
            <select
              name="po4_id_element"
              value={editingBridgeData.po4_id_element}
              onChange={handleEditBridgeChange}
              className="form-control form-control-sm"
            >
              <option value="">Seleccione...</option>
              {detailOptions.map((detail) => (
                <option key={detail.id} value={detail.id}>
                  {detail.name_detail}
                </option>
              ))}
            </select>
          );
        }
        return row.po4_element_name || row.po4_id_element;
      },
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: ThermalBridge) => {
        const isEditing = row.id === editingBridgeId;
        return isEditing ? (
          <ActionButtonsConfirm
            onAccept={() => handleAcceptEditBridge(row.id)}
            onCancel={handleCancelEditBridge}
          />
        ) : (
          <ActionButtons
            onEdit={() => handleEditBridge(row.id)}
            onDelete={() => handleOpenDeleteBridgeModal(row)}
          />
        );
      },
    },
  ];

  const puentesMultiHeader = {
    rows: [
      [{ label: "Puentes Térmicos", colSpan: 10 }],
      [
        { label: "P01", colSpan: 2 },
        { label: "P02", colSpan: 2 },
        { label: "P03", colSpan: 2 },
        { label: "P04", colSpan: 3 },
        { label: "Acciones" },
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

  // MANEJO DE FORMULARIOS (Modal de creación)
  const handleWallInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWall((prev) => ({
      ...prev,
      [name]: name === "wall_id" || name === "area" ? Number(value) : value,
    }));
  };

  const handleThermalBridgeInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewThermalBridge((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Función para crear un muro (Modal de creación)
  const handleCreateWall = async () => {
    // Validación: Verificar que todos los campos estén llenos
    if (
      newWall.wall_id === 0 ||
      newWall.characteristics.trim() === "" ||
      newWall.angulo_azimut.trim() === "" ||
      newWall.area === 0
    ) {
      notify("Todos los campos son obligatorios para crear el muro");
      return;
    }
    const authData = getAuthData();
    if (!authData) return;
    const { token, enclosure_id } = authData;
    const url = `${constantUrlApiEndpoint}/wall-enclosures-create/${enclosure_id}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newWall),
      });
      if (!response.ok) throw new Error("Error en la creación del muro.");
      notify("Muro creado exitosamente");
      setIsWallModalOpen(false);
      setNewWall({ wall_id: 0, name: "", characteristics: "", angulo_azimut: "", area: 0 });
      fetchData();
    } catch (error) {
      notify("Error al crear el muro");
      console.error(error);
    }
  };

  // Función para crear un puente térmico (Modal de creación)
  const handleCreateThermalBridge = async () => {
    // Validación: Verificar que todos los campos estén llenos
    if (
      newThermalBridge.po1_length === 0 ||
      newThermalBridge.po1_id_element === 0 ||
      newThermalBridge.po2_length === 0 ||
      newThermalBridge.po2_id_element === 0 ||
      newThermalBridge.po3_length === 0 ||
      newThermalBridge.po3_id_element === 0 ||
      newThermalBridge.po4_length === 0 ||
      newThermalBridge.po4_e_aislacion === 0 ||
      newThermalBridge.po4_id_element === 0
    ) {
      notify("Todos los campos son obligatorios para crear el puente térmico");
      return;
    }
    const authData = getAuthData();
    if (!authData) return;
    const { token, enclosure_id } = authData;
    const url = `${constantUrlApiEndpoint}/thermal-bridge-create/${enclosure_id}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newThermalBridge),
      });
      if (!response.ok) throw new Error("Error en la creación del puente térmico.");
      notify("Puente térmico creado exitosamente");
      setIsThermalBridgeModalOpen(false);
      setNewThermalBridge({
        id: 0,
        po1_length: 0,
        po1_id_element: 0,
        po2_length: 0,
        po2_id_element: 0,
        po3_length: 0,
        po3_id_element: 0,
        po4_length: 0,
        po4_e_aislacion: 0,
        po4_id_element: 0,
      });
      fetchData();
    } catch (error) {
      notify("Error al crear el puente térmico");
      console.error(error);
    }
  };

  // Render de contenido principal, incluyendo el contenedor responsive de las tablas
  const renderContent = () => (
    <div className="col-12">
      <div className="table-responsive">
        <div className="d-flex w-100 mb-4">
          <div className="p-2 flex-fill">
            <TablesParameters columns={murosColumns} data={murosData} />
          </div>
          <div className="p-2 flex-fill">
            <TablesParameters
              columns={puentesColumns}
              data={puentesData}
              multiHeader={puentesMultiHeader}
            />
          </div>
        </div>
      </div>
      {/* Botones alineados a la derecha */}
      <div className="d-flex justify-content-end gap-2 mt-3 w-100">
        <CustomButton variant="save" onClick={() => setIsWallModalOpen(true)}>
          Nuevo Muro
        </CustomButton>
        <CustomButton variant="save" onClick={() => setIsThermalBridgeModalOpen(true)}>
          Nuevo Puente Térmico
        </CustomButton>
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      {renderContent()}

      {/* Modal para crear un nuevo muro */}
      <ModalCreate
        isOpen={isWallModalOpen}
        onClose={() => setIsWallModalOpen(false)}
        onSave={handleCreateWall}
        title="Crear Nuevo Muro"
      >
        <form>
          <div className="row align-items-center mb-3">
            <label htmlFor="wall_id" className="col-sm-3 col-form-label">
              Muro
            </label>
            <div className="col-sm-9">
              <select
                id="wall_id"
                name="wall_id"
                className="form-control form-control-sm"
                value={newWall.wall_id || ""}
                onChange={handleWallInputChange}
              >
                <option value="">Seleccione...</option>
                {wallOptions.map((wall) => (
                  <option key={wall.id} value={wall.id}>
                    {wall.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="characteristics" className="col-sm-3 col-form-label">
              Características
            </label>
            <div className="col-sm-9">
              <select
                id="characteristics"
                name="characteristics"
                className="form-control form-control-sm"
                value={newWall.characteristics}
                onChange={handleWallInputChange}
              >
                <option value="">Seleccione...</option>
                <option value="Exterior">Exterior</option>
                <option value="Inter Recintos Clim">Inter Recintos Clim</option>
                <option value="Inter Recintos No Clim">Inter Recintos No Clim</option>
              </select>
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
                onChange={handleWallInputChange}
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
              Área [m²]
            </label>
            <div className="col-sm-9">
              <input
                id="area"
                type="number"
                name="area"
                className="form-control form-control-sm"
                value={newWall.area}
                onChange={handleWallInputChange}
              />
            </div>
          </div>
        </form>
      </ModalCreate>

      {/* Modal para crear un nuevo puente térmico */}
      <ModalCreate
        isOpen={isThermalBridgeModalOpen}
        onClose={() => setIsThermalBridgeModalOpen(false)}
        onSave={handleCreateThermalBridge}
        title="Crear Nuevo Puente Térmico"
      >
        <form>
          <div className="row align-items-center mb-3">
            <label htmlFor="po1_length" className="col-sm-4 col-form-label">
              P01 - Longitud (m)
            </label>
            <div className="col-sm-8">
              <input
                id="po1_length"
                type="number"
                name="po1_length"
                className="form-control form-control-sm"
                value={newThermalBridge.po1_length}
                onChange={handleThermalBridgeInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po1_id_element" className="col-sm-4 col-form-label">
              P01 - Elemento
            </label>
            <div className="col-sm-8">
              <select
                id="po1_id_element"
                name="po1_id_element"
                className="form-control form-control-sm"
                value={newThermalBridge.po1_id_element || ""}
                onChange={handleThermalBridgeInputChange}
              >
                <option value="">Seleccione...</option>
                {detailOptions.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po2_length" className="col-sm-4 col-form-label">
              P02 - Longitud (m)
            </label>
            <div className="col-sm-8">
              <input
                id="po2_length"
                type="number"
                name="po2_length"
                className="form-control form-control-sm"
                value={newThermalBridge.po2_length}
                onChange={handleThermalBridgeInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po2_id_element" className="col-sm-4 col-form-label">
              P02 - Elemento
            </label>
            <div className="col-sm-8">
              <select
                id="po2_id_element"
                name="po2_id_element"
                className="form-control form-control-sm"
                value={newThermalBridge.po2_id_element || ""}
                onChange={handleThermalBridgeInputChange}
              >
                <option value="">Seleccione...</option>
                {detailOptions.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po3_length" className="col-sm-4 col-form-label">
              P03 - Longitud (m)
            </label>
            <div className="col-sm-8">
              <input
                id="po3_length"
                type="number"
                name="po3_length"
                className="form-control form-control-sm"
                value={newThermalBridge.po3_length}
                onChange={handleThermalBridgeInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po3_id_element" className="col-sm-4 col-form-label">
              P03 - Elemento
            </label>
            <div className="col-sm-8">
              <select
                id="po3_id_element"
                name="po3_id_element"
                className="form-control form-control-sm"
                value={newThermalBridge.po3_id_element || ""}
                onChange={handleThermalBridgeInputChange}
              >
                <option value="">Seleccione...</option>
                {detailOptions.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po4_length" className="col-sm-4 col-form-label">
              P04 - Longitud (m)
            </label>
            <div className="col-sm-8">
              <input
                id="po4_length"
                type="number"
                name="po4_length"
                className="form-control form-control-sm"
                value={newThermalBridge.po4_length}
                onChange={handleThermalBridgeInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po4_e_aislacion" className="col-sm-4 col-form-label">
              P04 - Espesor Aislación (cm)
            </label>
            <div className="col-sm-8">
              <input
                id="po4_e_aislacion"
                type="number"
                name="po4_e_aislacion"
                className="form-control form-control-sm"
                value={newThermalBridge.po4_e_aislacion}
                onChange={handleThermalBridgeInputChange}
              />
            </div>
          </div>
          <div className="row align-items-center mb-3">
            <label htmlFor="po4_id_element" className="col-sm-4 col-form-label">
              P04 - Elemento
            </label>
            <div className="col-sm-8">
              <select
                id="po4_id_element"
                name="po4_id_element"
                className="form-control form-control-sm"
                value={newThermalBridge.po4_id_element || ""}
                onChange={handleThermalBridgeInputChange}
              >
                <option value="">Seleccione...</option>
                {detailOptions.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </ModalCreate>

      {/* Modal de confirmación para eliminar un muro */}
      <ModalCreate
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onSave={handleConfirmDeleteWall}
        title="Confirmar Eliminación"
      >
        {wallToDelete && (
          <p>
            ¿Está seguro de eliminar el muro <strong>{wallToDelete.name}</strong>?
          </p>
        )}
      </ModalCreate>

      {/* Modal de confirmación para eliminar un puente térmico */}
      <ModalCreate
        isOpen={isDeleteBridgeModalOpen}
        onClose={handleCancelDeleteBridge}
        onSave={handleConfirmDeleteBridge}
        title="Confirmar Eliminación"
      >
        {bridgeToDelete && (
          <p>
            ¿Está seguro de eliminar el puente térmico con id <strong>{bridgeToDelete.id}</strong>?
          </p>
        )}
      </ModalCreate>
    </div>
  );
};

export default TabMuroCreate;