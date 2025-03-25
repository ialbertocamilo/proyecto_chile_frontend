import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "@/components/common/CustomButton";
import ModalCreate from "@/components/common/ModalCreate";
import { notify } from "@/utils/notify";

interface EnclosureGeneralData {
  id: number;
  occupation_profile_id: number;
  height: number;
  co2_sensor: string;
  project_id: number;
  region_id: number;
  zona_termica: string;
  name_enclosure: string;
  comuna_id: number;
}

// Interfaz para los perfiles de ocupación
interface OccupationProfile {
  id: number;
  code: string; // Si tu endpoint también devuelve code (ES, AU, BA, etc.), lo puedes agregar
  name: string;
  // Agrega los campos que retorne tu endpoint para cada perfil de ocupación
}

interface Region {
  id: number;
  nombre_region: string;
}

interface Comuna {
  id: number;
  zonas_termicas: string[];
  region_id: number;
  nombre_comuna: string;
  latitud: number;
  longitud: number;
}

const TabEnclosureGenerals: React.FC = () => {
  const router = useRouter();
  const projectId = localStorage.getItem("project_id_edit") || "44";
  const token = localStorage.getItem("token") || "";

  // Estados para la tabla principal
  const [data, setData] = useState<EnclosureGeneralData[]>([]);
  // Estados para regiones, comunas, zonas térmicas
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [zonasTermicas, setZonasTermicas] = useState<string[]>([]);

  // Estado para los perfiles de ocupación
  const [occupationProfiles, setOccupationProfiles] = useState<OccupationProfile[]>([]);

  // Estados para edición en la tabla
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Omit<EnclosureGeneralData, "id">>({
    occupation_profile_id: 0,
    height: 0,
    co2_sensor: "",
    project_id: Number(projectId),
    region_id: 0,
    zona_termica: "",
    name_enclosure: "",
    comuna_id: 0,
  });

  // Modal de confirmación para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EnclosureGeneralData | null>(null);

  // ===========================================================
  // 1. Funciones para fetch de datos
  // ===========================================================

  // Obtener datos de la tabla de Enclosure Generals
  const fetchEnclosureGenerals = async () => {
    const url = `https://ceela-backend.svgdev.tech/enclosure-generals/${projectId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return;
    const responseData: EnclosureGeneralData[] = await response.json();
    setData(responseData);

  };

  // Obtener datos de Regiones
  const fetchRegiones = async () => {
    try {
      const url = "https://ceela-backend.svgdev.tech/regiones";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener regiones");
      const responseData: Region[] = await response.json();
      setRegiones(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar las regiones");
    }
  };

  // Obtener datos de Comunas (puedes ajustar la región según necesites)
  const fetchComunas = async () => {
    try {
      // Ajusta la región en esta URL si lo requieres (ahora está fija con id 4, a modo de ejemplo).
      const url = "https://ceela-backend.svgdev.tech/comunas/4";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener comunas");
      const responseData: Comuna[] = await response.json();
      setComunas(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar las comunas");
    }
  };

  // Obtener opciones para Zona Térmica (puedes ajustar la comuna si lo requieres)
  const fetchZonasTermicas = async () => {
    try {
      // Ajusta la comuna en esta URL si lo requieres (ahora está fija con id 24, a modo de ejemplo).
      const url = "https://ceela-backend.svgdev.tech/zonas-termicas/24";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener zonas térmicas");
      const responseData: string[] = await response.json();
      setZonasTermicas(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar las zonas térmicas");
    }
  };

  // Obtener perfiles de ocupación (endpoint que tú indicaste)
  const fetchOccupationProfiles = async () => {
    try {
      const url = "https://ceela-backend.svgdev.tech/user/enclosures-typing/";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener los perfiles de ocupación");
      const responseData: OccupationProfile[] = await response.json();
      setOccupationProfiles(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar los perfiles de ocupación");
    }
  };

  // ===========================================================
  // 2. useEffect para cargar todos los datos al inicio
  // ===========================================================
  useEffect(() => {
    fetchEnclosureGenerals();
    fetchRegiones();
    fetchComunas();
    fetchZonasTermicas();
    fetchOccupationProfiles(); // <-- Importante: llamada para los perfiles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================================================
  // 3. Funciones para edición
  // ===========================================================
  const handleEdit = (row: EnclosureGeneralData) => {
    setEditingRowId(row.id);
    setEditingValues({
      occupation_profile_id: row.occupation_profile_id,
      height: row.height,
      co2_sensor: row.co2_sensor,
      project_id: row.project_id,
      region_id: row.region_id,
      zona_termica: row.zona_termica,
      name_enclosure: row.name_enclosure,
      comuna_id: row.comuna_id,
    });
  };

  const handleAccept = async (row: EnclosureGeneralData) => {
    if (!editingRowId) return;
    const url = `https://ceela-backend.svgdev.tech/enclosure-generals-update/${projectId}/${row.id}`;
    const payload = {
      name_enclosure: editingValues.name_enclosure,
      region_id: editingValues.region_id,
      comuna_id: editingValues.comuna_id,
      zona_termica: editingValues.zona_termica,
      occupation_profile_id: editingValues.occupation_profile_id,
      height: editingValues.height,
      co2_sensor: editingValues.co2_sensor,
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Error al actualizar el recinto");
      notify("Registro actualizado con éxito");
      setEditingRowId(null);
      await fetchEnclosureGenerals();
    } catch (error) {
      console.error(error);
      notify("Error al guardar los cambios");
    }
  };

  const handleCancel = () => {
    setEditingRowId(null);
  };

  // ===========================================================
  // 4. Funciones para eliminación
  // ===========================================================
  const handleDelete = (row: EnclosureGeneralData) => {
    setItemToDelete(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const url = `https://ceela-backend.svgdev.tech/enclosure-generals-delete/${projectId}/${itemToDelete.id}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al eliminar el recinto");
      notify("Recinto eliminado exitosamente");
      setShowDeleteModal(false);
      setItemToDelete(null);
      await fetchEnclosureGenerals();
    } catch (error) {
      console.error(error);
      notify("Error al eliminar");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // ===========================================================
  // 5. Función para crear nuevo registro
  // ===========================================================
  const handleCreate = () => {
    router.push("/recinto-create");
  };

  // ===========================================================
  // 6. Definición de columnas para la tabla
  // ===========================================================
  const columns = [
    {
      headerName: "ID",
      field: "id",
      renderCell: (row: EnclosureGeneralData) => row.id,
    },
    {
      headerName: "Nombre Recinto",
      field: "name_enclosure",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <input
            type="text"
            className="form-control"
            value={editingValues.name_enclosure}
            onChange={(e) =>
              setEditingValues({ ...editingValues, name_enclosure: e.target.value })
            }
          />
        ) : (
          row.name_enclosure
        ),
    },
    {
      headerName: "Perfil Ocupación",
      field: "occupation_profile_id",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          // MODO EDICIÓN: combo con los perfiles disponibles
          <select
            className="form-control"
            value={editingValues.occupation_profile_id}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                occupation_profile_id: Number(e.target.value),
              })
            }
          >
            <option value="">Seleccione perfil</option>
            {occupationProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        ) : (
          // MODO LECTURA: mostrar el "name" del perfil, en vez del ID
          occupationProfiles.find(
            (p) => p.id === row.occupation_profile_id
          )?.name || row.occupation_profile_id
        ),
    },
    {
      headerName: "Altura (m)",
      field: "height",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <input
            type="number"
            className="form-control"
            value={editingValues.height}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                height: Number(e.target.value),
              })
            }
          />
        ) : (
          row.height
        ),
    },
    {
      headerName: "Sensor CO2",
      field: "co2_sensor",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.co2_sensor}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                co2_sensor: e.target.value,
              })
            }
          >
            <option value="">Seleccione</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        ) : (
          row.co2_sensor
        ),
    },
    {
      headerName: "Región",
      field: "region_id",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.region_id}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                region_id: Number(e.target.value),
              })
            }
          >
            <option value="">Seleccione región</option>
            {regiones.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nombre_region}
              </option>
            ))}
          </select>
        ) : (
          // Muestra el nombre de la región o el ID si no se encuentra
          regiones.find((r) => r.id === row.region_id)?.nombre_region || row.region_id
        ),
    },
    {
      headerName: "Zona Térmica",
      field: "zona_termica",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.zona_termica}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                zona_termica: e.target.value,
              })
            }
          >
            <option value="">Seleccione zona</option>
            {zonasTermicas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        ) : (
          row.zona_termica
        ),
    },
    {
      headerName: "Comuna",
      field: "comuna_id",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.comuna_id}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                comuna_id: Number(e.target.value),
              })
            }
          >
            <option value="">Seleccione comuna</option>
            {comunas.map((comuna) => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.nombre_comuna}
              </option>
            ))}
          </select>
        ) : (
          comunas.find((c) => c.id === row.comuna_id)?.nombre_comuna || row.comuna_id
        ),
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: EnclosureGeneralData) => {
        if (editingRowId === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleAccept(row)}
              onCancel={handleCancel}
            />
          );
        }
        return (
          <ActionButtons onEdit={() => handleEdit(row)} onDelete={() => handleDelete(row)} />
        );
      },
    },
  ];

  // ===========================================================
  // 7. Render del componente
  // ===========================================================
  return (
    <div>
      {/* Título y botón "+ Nuevo" */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <CustomButton variant="save" onClick={handleCreate}>
          + Nuevo
        </CustomButton>
      </div>

      {/* Tabla de datos */}
      <TablesParameters columns={columns} data={data} />

      {/* Modal de confirmación para eliminar */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onSave={confirmDelete}
        saveLabel="Eliminar"
        title="Confirmar Eliminación"
      >
        <div className="container">
          <div className="row mb-3">
            <div className="col-12 text-center">
              <p>¿Está seguro que desea eliminar el siguiente recinto?</p>
              <h5 className="mt-3 mb-3">
                {itemToDelete?.name_enclosure || "Sin nombre"}
              </h5>
            </div>
          </div>
        </div>
      </ModalCreate>
    </div>
  );
};

export default TabEnclosureGenerals;
