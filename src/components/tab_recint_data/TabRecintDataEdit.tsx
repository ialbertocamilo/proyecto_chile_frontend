import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
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

interface OccupationProfile {
  id: number;
  code: string;
  name: string;
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

interface IFormData {
  selectedRegion: string;
  selectedComuna: string;
  selectedZonaTermica: string;
  nombreRecinto: string;
  perfilOcupacion: number;
  alturaPromedio: string;
  sensorCo2: boolean;
}

const LOCAL_STORAGE_KEY = "recintoFormData";

const TabEnclosureGenerals: React.FC = () => {
  const router = useRouter();
  const projectId = localStorage.getItem("project_id_edit") || "44";
  const token = localStorage.getItem("token") || "";

  // Estados para la tabla principal
  const [data, setData] = useState<EnclosureGeneralData[]>([]);
  // Estados para regiones, comunas, zonas térmicas y perfiles de ocupación
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [zonasTermicas, setZonasTermicas] = useState<string[]>([]);
  const [occupationProfiles, setOccupationProfiles] = useState<OccupationProfile[]>([]);

  // Modal de confirmación para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EnclosureGeneralData | null>(null);

  // ===========================================================
  // 1. Funciones para fetch de datos
  // ===========================================================
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

  const fetchComunas = async () => {
    try {
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

  const fetchZonasTermicas = async () => {
    try {
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
    fetchOccupationProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================================================
  // 3. Función para redirigir a la página de edición
  // ===========================================================
  const handleNewFunction = (row: EnclosureGeneralData) => {
    // Crear el objeto con los datos del recinto para precargar el formulario
    const formData: IFormData = {
      selectedRegion: row.region_id.toString(),
      selectedComuna: row.comuna_id.toString(),
      selectedZonaTermica: row.zona_termica,
      nombreRecinto: row.name_enclosure,
      perfilOcupacion: row.occupation_profile_id,
      alturaPromedio: row.height.toString(),
      sensorCo2: row.co2_sensor === "Si",
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem("recinto_id", row.id.toString());
    notify("Datos del recinto cargados para edición");
    router.push("/recinto-edit"); // Asegúrate de que la ruta coincida con la de tu página de edición
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
  // 5. Función para crear nuevo registro (limpia el formulario)
  // ===========================================================
  const handleCreate = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("recinto_id");
    router.push("/recinto-create-edit");
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
      renderCell: (row: EnclosureGeneralData) => row.name_enclosure,
    },
    {
      headerName: "Perfil Ocupación",
      field: "occupation_profile_id",
      renderCell: (row: EnclosureGeneralData) =>
        occupationProfiles.find((p) => p.id === row.occupation_profile_id)?.name ||
        row.occupation_profile_id,
    },
    {
      headerName: "Altura (m)",
      field: "height",
      renderCell: (row: EnclosureGeneralData) => row.height,
    },
    {
      headerName: "Sensor CO2",
      field: "co2_sensor",
      renderCell: (row: EnclosureGeneralData) => row.co2_sensor,
    },
    {
      headerName: "Región",
      field: "region_id",
      renderCell: (row: EnclosureGeneralData) =>
        regiones.find((r) => r.id === row.region_id)?.nombre_region || row.region_id,
    },
    {
      headerName: "Zona Térmica",
      field: "zona_termica",
      renderCell: (row: EnclosureGeneralData) => row.zona_termica,
    },
    {
      headerName: "Comuna",
      field: "comuna_id",
      renderCell: (row: EnclosureGeneralData) =>
        comunas.find((c) => c.id === row.comuna_id)?.nombre_comuna || row.comuna_id,
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: EnclosureGeneralData) => {
        return (
          <ActionButtons
            onEdit={() => handleNewFunction(row)}
            onDelete={() => handleDelete(row)}
          />
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
