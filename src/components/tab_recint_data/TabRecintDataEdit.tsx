import ActionButtons from "@/components/common/ActionButtons";
import CustomButton from "@/components/common/CustomButton";
import ModalCreate from "@/components/common/ModalCreate";
import TablesParameters from "@/components/tables/TablesParameters";
import { useApi } from "@/hooks/useApi";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

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
  nombre_comuna: string;
  nombre_region: string;
  usage_profile_name: string;
}

interface IFormData {

  nombreRecinto: string;
  perfilOcupacion: number;
  alturaPromedio: string;
  sensorCo2: boolean;
}

const LOCAL_STORAGE_KEY = "recintoFormData";

const TabRecintDataEdit: React.FC = () => {
  const router = useRouter();
  const api = useApi()
  const projectId = localStorage.getItem("project_id") || "44";
  const token = localStorage.getItem("token") || "";

  // Estados para la tabla principal
  const [data, setData] = useState<EnclosureGeneralData[]>([]);

  // Modal de confirmación para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EnclosureGeneralData | null>(null);

  // ===========================================================
  // 1. Funciones para fetch de datos (solo para recintos)
  // ===========================================================
  const fetchEnclosureGenerals = async () => {
    const response =await api.get(`/enclosure-generals/${projectId}`)
    setData(response);
  };

  // ===========================================================
  // 2. useEffect para cargar los datos del recinto al inicio
  // ===========================================================
  useEffect(() => {
    fetchEnclosureGenerals();
  }, []);

  // ===========================================================
  // 3. Función para redirigir a la página de edición
  // ===========================================================
  const handleNewFunction = (row: EnclosureGeneralData) => {
    const formData: IFormData = {
      nombreRecinto: row.name_enclosure,
      perfilOcupacion: row.occupation_profile_id,
      alturaPromedio: row.height.toString(),
      sensorCo2: row.co2_sensor === "Si",
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem("recinto_id", row.id.toString());
    notify("Datos del recinto cargados para edición");
    router.push("/recinto-edit");
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
  
  try {
    await api.del(`/enclosure-generals-delete/${projectId}/${itemToDelete.id}`);
    setData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
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
  // 6. Definición de columnas para la tabla (cambio en el orden)
  // ===========================================================
  const columns = [
    {
      headerName: "Cod",
      field: "id",
      renderCell: (row: EnclosureGeneralData) => ("REC-"+row.id),
    },
    {
      headerName: "Nombre Recinto",
      field: "name_enclosure",
      renderCell: (row: EnclosureGeneralData) => row.name_enclosure,
    },
    {
      headerName: "Perfil Ocupación",
      field: "occupation_profile_id",
      renderCell: (row: EnclosureGeneralData) => row.usage_profile_name,
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
      renderCell: (row: EnclosureGeneralData) => row.nombre_region,
    },
    {
      headerName: "Localidad",
      field: "comuna_id",
      renderCell: (row: EnclosureGeneralData) => row.nombre_comuna,
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
      {/* Botón "+ Nuevo" siempre visible */}
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

      {/* Siempre se renderiza la estructura de la tabla para mostrar las pestañas */}
      <TablesParameters columns={columns} data={data} />

      {/* Si no hay datos, se muestra un mensaje informativo */}
      {data.length === 0 && (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          No hay datos para mostrar
        </div>
      )}

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

export default TabRecintDataEdit;
