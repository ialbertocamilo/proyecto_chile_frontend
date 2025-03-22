import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";

interface CeilingData {
  id: number;
  techos: string;
  caracteristicas: string;
  area: number;
  u: number;
  roof_id?: number; // Añadido para edición
}

interface Techo {
  id: number;
  name_detail: string;
}

interface EnclosureData {
  characteristic: string;
  u: number;
  id: number;
  roof_id: number;
  area: number;
  enclosure_id: number;
  name: string;
}

interface EditingValues {
  roof_id: number;
  characteristic: string;
  area: number;
}

const TabCeilingCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "13";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  const [data, setData] = useState<CeilingData[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<CeilingData | null>(null);
  const [techosOptions, setTechosOptions] = useState<Techo[]>([]);
  
  // Estados para el modal de creación
  const [roofId, setRoofId] = useState<number>(0);
  const [characteristic, setCharacteristic] = useState<string>("");
  const [area, setArea] = useState<number>(0);
  
  // Estado para los valores de edición en línea
  const [editingValues, setEditingValues] = useState<EditingValues>({
    roof_id: 0,
    characteristic: "",
    area: 0
  });

  // Función para obtener los techos disponibles
  const fetchTechos = async () => {
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/project/${projectId}/details/Techo`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los techos");
      }

      const data = await response.json();
      setTechosOptions(data);
    } catch (error) {
      console.error("Error:", error);
      // Opcional: notificar error
    }
  };

  // Función para obtener los datos de los techos
  const fetchEnclosureData = async () => {
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/roof-enclosures/${enclosure_id}`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los datos de los techos");
      }

      const enclosureData: EnclosureData[] = await response.json();

      // Convertimos los datos a formato que necesita la tabla
      const formattedData = enclosureData.map((item) => ({
        id: item.id,
        techos: item.name,
        caracteristicas: item.characteristic,
        area: item.area,
        u: item.u,
        roof_id: item.roof_id // Guardamos el roof_id para edición
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error:", error);
      // Opcional: notificar error
    }
  };

  // Al presionar "Crear" se abre el modal y se obtienen los techos disponibles
  const handleCreate = () => {
    fetchTechos(); // Obtener techos antes de mostrar el modal
    setShowModal(true);
  };

  // Iniciar la edición de una fila
  const handleEdit = (row: CeilingData) => {
    fetchTechos(); // Obtener techos para mostrar en el select
    setEditingRowId(row.id);
    setEditingValues({
      roof_id: row.roof_id || 0,
      characteristic: row.caracteristicas,
      area: row.area
    });
  };

  // Mostrar confirmación para eliminar
  const handleDelete = (row: CeilingData) => {
    setItemToDelete(row);
    setShowDeleteModal(true);
  };
  
  // Eliminar una fila
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(
        `https://ceela-backend.svgdev.tech/roof-enclosures-delete/${itemToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      notify("Registro eliminado correctamente");
      setShowDeleteModal(false);
      setItemToDelete(null);
      fetchEnclosureData(); // Refrescar la tabla
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Guardar cambios de edición
  const handleAccept = async (row: CeilingData) => {
    if (!editingRowId) return;

    // Validación para edición
    if (!editingValues.roof_id) {
      notify("Debe seleccionar un techo");
      return;
    }
    
    if (!editingValues.characteristic) {
      notify("Debe seleccionar una característica");
      return;
    }
    
    if (!editingValues.area || editingValues.area <= 0) {
      notify("Debe ingresar un área válida");
      return;
    }

    const payload = {
      roof_id: editingValues.roof_id,
      characteristic: editingValues.characteristic,
      area: editingValues.area
    };

    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/roof-enclosures-update/${row.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar");
      }

      notify("Cambios guardados correctamente");
      setEditingRowId(null);
      fetchEnclosureData(); // Refrescar la tabla
    } catch (error) {
      console.error("Error:", error);
      notify("Error al guardar los cambios");
    }
  };

  // Cancelar la edición
  const handleCancel = () => {
    setEditingRowId(null);
    setEditingValues({
      roof_id: 0,
      characteristic: "",
      area: 0
    });
  };

  const columns = [
    { 
      headerName: "Techos", 
      field: "techos",
      renderCell: (row: CeilingData) => {
        if (editingRowId === row.id) {
          return (
            <select
              className="form-control"
              value={editingValues.roof_id}
              onChange={(e) => setEditingValues({...editingValues, roof_id: Number(e.target.value)})}
            >
              {techosOptions.map((techo) => (
                <option key={techo.id} value={techo.id}>
                  {techo.name_detail}
                </option>
              ))}
            </select>
          );
        }
        return row.techos;
      }
    },
    { 
      headerName: "Características espacio contiguo al elemento", 
      field: "caracteristicas",
      renderCell: (row: CeilingData) => {
        if (editingRowId === row.id) {
          return (
            <select
              className="form-control"
              value={editingValues.characteristic}
              onChange={(e) => setEditingValues({...editingValues, characteristic: e.target.value})}
            >
              <option value="Exterior">Exterior</option>
              <option value="Inter Recintos Clim">Inter Recintos Clim</option>
              <option value="Inter Recintos No Clim">Inter Recintos No Clim</option>
            </select>
          );
        }
        return row.caracteristicas;
      }
    },
    { 
      headerName: "Área [m2]", 
      field: "area",
      renderCell: (row: CeilingData) => {
        if (editingRowId === row.id) {
          return (
            <input
              type="number"
              className="form-control"
              value={editingValues.area}
              onChange={(e) => setEditingValues({...editingValues, area: Number(e.target.value)})}
            />
          );
        }
        return row.area;
      }
    },
    { headerName: "U [W/m2𝐾]", field: "u" },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: CeilingData) => {
        if (editingRowId === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleAccept(row)}
              onCancel={handleCancel}
            />
          );
        }
        return (
          <ActionButtons
            onEdit={() => handleEdit(row)}
            onDelete={() => handleDelete(row)}
          />
        );
      },
    },
  ];

  // Cierra el modal y reinicia los campos
  const handleModalClose = () => {
    setShowModal(false);
    setRoofId(0);
    setCharacteristic("");
    setArea(0);
  };

  // Función que se ejecuta al confirmar la creación en el modal
  const handleModalSave = async () => {
    // Validación de campos
    if (!roofId) {
      notify("Debe seleccionar un techo");
      return;
    }
    
    if (!characteristic) {
      notify("Debe seleccionar una característica");
      return;
    }
    
    if (!area || area <= 0) {
      notify("Debe ingresar un área válida");
      return;
    }

    const payload = {
      roof_id: roofId,
      characteristic: characteristic,
      area: area,
    };

    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/roof-enclosures-create/${enclosure_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la creación");
      }

      notify("Techo creado exitosamente");
      handleModalClose();
      fetchEnclosureData(); // Actualizamos la tabla después de crear
    } catch (error) {
      console.error("Error:", error);
      notify("Error al crear el techo");
    }
  };

  useEffect(() => {
    fetchEnclosureData(); // Obtenemos los datos de la tabla cuando se carga el componente
    fetchTechos(); // Obtenemos los techos disponibles 
  }, []);

  return (
    <div>
      <TablesParameters columns={columns} data={data} />
      <div style={{ marginTop: "20px" }}>
        <CustomButton variant="save" onClick={handleCreate}>
          Crear
        </CustomButton>
      </div>
      <ModalCreate
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        saveLabel="Crear"
        title="Crear Techo"
      >
        <div className="container">
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="roofId">ID del Techo</label>
            </div>
            <div className="col-md-8">
              <select
                id="roofId"
                className="form-control"
                value={roofId}
                onChange={(e) => setRoofId(Number(e.target.value))}
              >
                <option value="">Seleccione un techo</option>
                {techosOptions.map((techo) => (
                  <option key={techo.id} value={techo.id}>
                    {techo.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="characteristic">Característica</label>
            </div>
            <div className="col-md-8">
              <select
                id="characteristic"
                className="form-control"
                value={characteristic}
                onChange={(e) => setCharacteristic(e.target.value)}
              >
                <option value="">Seleccione una opción</option>
                <option value="Exterior">Exterior</option>
                <option value="Inter Recintos Clim">Inter Recintos Clim</option>
                <option value="Inter Recintos No Clim">Inter Recintos No Clim</option>
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="area">Área</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="area"
                className="form-control"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </ModalCreate>
      
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
              <p>¿Está seguro que desea eliminar el siguiente techo?</p>
              <h5 className="mt-3 mb-3">{itemToDelete?.techos}</h5>
              <p className="text-danger">Esta acción no se puede deshacer.</p>
            </div>
          </div>
        </div>
      </ModalCreate>
    </div>
  );
};

export default TabCeilingCreate;