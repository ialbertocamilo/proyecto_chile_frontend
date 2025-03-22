import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";

interface DoorData {
  id: number;
  tipoPuente: string;
  caracteristicas: string;
  anguloAzimut: string;
  orientacion: string;
  incluyeMarcoAlto: number;
  incluyeMarcoAncho: number;
  fav1D: number;
  fav1L: number;
  fav2izqP: number;
  fav2izqS: number;
  fav2DerP: number;
  fav2DerS: number;
  fav3E: number;
  fav3T: number;
  fav3Beta: number;
  fav3Alpha: number;
}

interface DoorEnclosureData {
  id: number;
  door_id: number;
  enclosure_id: number;
  characteristics: string;
  angulo_azimut: string;
  orientation: string;
  high: number;
  broad: number;
}

interface DoorElement {
  id: number;
  name_element: string;
  type: string;
  fm: number;
  created_status: string;
  calculations: {
    r_puro: number;
    u_vidrio: number;
    u_ponderado: number;
    u_ponderado_opaco: number;
  };
  atributs: {
    ventana_id: number;
    name_ventana: string;
    u_puerta_opaca: number;
    porcentaje_vidrio: number;
  };
  u_marco: number;
  is_deleted: boolean;
}

const TabDoorCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  // Estado para los datos de la tabla
  const [data, setData] = useState<DoorData[]>([]);

  // Estado para almacenar la fila en edición
  const [editingRow, setEditingRow] = useState<DoorData | null>(null);
  
  // Estado para mostrar el modal de creación
  const [showModal, setShowModal] = useState(false);

  // Estados para el formulario del modal de creación
  const [doorId, setDoorId] = useState<number>(0);
  const [characteristics, setCharacteristics] = useState<string>("");
  const [anguloAzimut, setAnguloAzimut] = useState<string>("");
  const [high, setHigh] = useState<number>(0);
  const [broad, setBroad] = useState<number>(0);
  
  // Estado para almacenar las opciones del ángulo azimut
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  
  // Estado para almacenar las opciones de puertas
  const [doorOptions, setDoorOptions] = useState<DoorElement[]>([]);

  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRow, setDeletingRow] = useState<DoorData | null>(null);

  // Cargar datos de puertas, opciones de ángulo azimut y tipos de puerta
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch door enclosure data for the table
        const doorEnclosuresResponse = await fetch(`${constantUrlApiEndpoint}/door-enclosures/${enclosure_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!doorEnclosuresResponse.ok) {
          throw new Error("Error al obtener los datos de puertas");
        }
        
        const doorEnclosuresData: DoorEnclosureData[] = await doorEnclosuresResponse.json();
        
        // Map API data to table format
        const tableData: DoorData[] = doorEnclosuresData.map(item => {
          // We'll fetch door name in a subsequent API call
          return {
            id: item.id,
            tipoPuente: `ID: ${item.door_id}`, // Temporary, will be updated with door name
            caracteristicas: item.characteristics,
            anguloAzimut: item.angulo_azimut,
            orientacion: item.orientation,
            incluyeMarcoAlto: item.high,
            incluyeMarcoAncho: item.broad,
            // Default values for other fields
            fav1D: 0,
            fav1L: 0,
            fav2izqP: 0,
            fav2izqS: 0,
            fav2DerP: 0,
            fav2DerS: 0,
            fav3E: 0,
            fav3T: 0,
            fav3Beta: 0,
            fav3Alpha: 0,
          };
        });
        
        setData(tableData);
        
        // Fetch angle options
        const angleResponse = await fetch(`${constantUrlApiEndpoint}/angle-azimut`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!angleResponse.ok) {
          throw new Error("Error al obtener las opciones de ángulo azimut");
        }
        
        const options: string[] = await angleResponse.json();
        setAngleOptions(options);
        
        // Fetch door options
        const doorResponse = await fetch(`${constantUrlApiEndpoint}/elements/?type=door`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!doorResponse.ok) {
          throw new Error("Error al obtener las opciones de puertas");
        }
        
        const doorData: DoorElement[] = await doorResponse.json();
        setDoorOptions(doorData);
        
        // Update door names in the table data
        if (tableData.length > 0 && doorData.length > 0) {
          const updatedTableData = tableData.map(row => {
            // Find the door element that matches the door_id from the enclosure data
            const matchingDoorElement = doorEnclosuresData.find(enclosure => enclosure.id === row.id);
            if (matchingDoorElement) {
              const doorInfo = doorData.find(door => door.id === matchingDoorElement.door_id);
              if (doorInfo) {
                return {
                  ...row,
                  tipoPuente: doorInfo.name_element
                };
              }
            }
            return row;
          });
          
          setData(updatedTableData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        notify("Error al cargar los datos", "error");
      }
    };
    
    fetchData();
  }, [token, enclosure_id]);

  // Función para recargar los datos de la tabla
  const fetchDoorData = async () => {
    try {
      // Fetch door enclosure data for the table
      const doorEnclosuresResponse = await fetch(`${constantUrlApiEndpoint}/door-enclosures/${enclosure_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!doorEnclosuresResponse.ok) {
        throw new Error("Error al obtener los datos de puertas");
      }
      
      const doorEnclosuresData: DoorEnclosureData[] = await doorEnclosuresResponse.json();
      
      // Map API data to table format with door names
      const tableData: DoorData[] = await Promise.all(doorEnclosuresData.map(async (item) => {
        // Find the corresponding door name
        const doorInfo = doorOptions.find(door => door.id === item.door_id);
        
        return {
          id: item.id,
          tipoPuente: doorInfo ? doorInfo.name_element : `ID: ${item.door_id}`,
          caracteristicas: item.characteristics,
          anguloAzimut: item.angulo_azimut,
          orientacion: item.orientation,
          incluyeMarcoAlto: item.high,
          incluyeMarcoAncho: item.broad,
          // Default values for other fields
          fav1D: 0,
          fav1L: 0,
          fav2izqP: 0,
          fav2izqS: 0,
          fav2DerP: 0,
          fav2DerS: 0,
          fav3E: 0,
          fav3T: 0,
          fav3Beta: 0,
          fav3Alpha: 0,
        };
      }));
      
      setData(tableData);
    } catch (error) {
      console.error("Error fetching door data:", error);
      notify("Error al cargar los datos de puertas", "error");
    }
  };

  // Funciones para manejar cambios en los campos editables
  const handleRowFieldChange = (field: keyof DoorData, value: string | number) => {
    if (editingRow) {
      setEditingRow({
        ...editingRow,
        [field]: value
      });
    }
  };

  // Funciones para manejar las acciones de la fila
  const handleEdit = (row: DoorData) => {
    setEditingRow({...row});
  };

  const handleAccept = async () => {
    if (!editingRow) return;

    try {
      // Encontrar el door_id basado en el tipoPuente seleccionado
      const selectedDoor = doorOptions.find(door => door.name_element === editingRow.tipoPuente);
      const doorId = selectedDoor ? selectedDoor.id : 0;

      const payload = {
        door_id: doorId,
        characteristics: editingRow.caracteristicas,
        angulo_azimut: editingRow.anguloAzimut,
        high: editingRow.incluyeMarcoAlto,
        broad: editingRow.incluyeMarcoAncho,
      };

      const response = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures-update/${editingRow.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el registro");
      }

      notify("Cambios guardados correctamente");
      setEditingRow(null);
      // Recargar los datos
      fetchDoorData();
    } catch (error) {
      console.error("Error:", error);
      notify("Error al guardar los cambios", "error");
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  // Manejador para mostrar el modal de confirmación de eliminación
  const handleDeleteConfirmation = (row: DoorData) => {
    setDeletingRow(row);
    setShowDeleteModal(true);
  };

  // Manejador para cerrar el modal de confirmación de eliminación
  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeletingRow(null);
  };

  // Manejador para ejecutar la eliminación cuando se confirma
  const handleDeleteConfirm = async () => {
    if (!deletingRow) return;

    try {
      // Llamada al endpoint de eliminación
      const response = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures-delete/${deletingRow.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el registro");
      }

      notify("Registro eliminado correctamente");
      handleDeleteModalClose();
      // Actualizar la tabla después de eliminar
      fetchDoorData();
    } catch (error) {
      console.error("Error:", error);
      notify("Error al eliminar el registro", "error");
      handleDeleteModalClose();
    }
  };

  // Definición de las columnas de la tabla (incluyendo multiHeader)
  const columns = [
    { 
      headerName: "Tipo Puente", 
      field: "tipoPuente",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <select
              className="form-control"
              value={editingRow.tipoPuente}
              onChange={(e) => handleRowFieldChange("tipoPuente", e.target.value)}
            >
              {doorOptions.map((door) => (
                <option key={door.id} value={door.name_element}>
                  {door.name_element}
                </option>
              ))}
            </select>
          );
        }
        return row.tipoPuente;
      }
    },
    { 
      headerName: "Características espacio contiguo al elemento", 
      field: "caracteristicas",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <select
              className="form-control"
              value={editingRow.caracteristicas}
              onChange={(e) => handleRowFieldChange("caracteristicas", e.target.value)}
            >
              <option value="">Seleccione una opción</option>
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
      headerName: "Ángulo Azimut", 
      field: "anguloAzimut",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <select
              className="form-control"
              value={editingRow.anguloAzimut}
              onChange={(e) => handleRowFieldChange("anguloAzimut", e.target.value)}
            >
              <option value="">Seleccione un ángulo</option>
              {angleOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return row.anguloAzimut;
      }
    },
    { headerName: "Orientación", field: "orientacion" },
    { 
      headerName: "Alto [m]", 
      field: "incluyeMarcoAlto",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <input
              type="number"
              className="form-control"
              value={editingRow.incluyeMarcoAlto}
              onChange={(e) => handleRowFieldChange("incluyeMarcoAlto", Number(e.target.value))}
            />
          );
        }
        return row.incluyeMarcoAlto;
      }
    },
    { 
      headerName: "Ancho [m]", 
      field: "incluyeMarcoAncho",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <input
              type="number"
              className="form-control"
              value={editingRow.incluyeMarcoAncho}
              onChange={(e) => handleRowFieldChange("incluyeMarcoAncho", Number(e.target.value))}
            />
          );
        }
        return row.incluyeMarcoAncho;
      }
    },
    { headerName: "D [m]", field: "fav1D" },
    { headerName: "L [m]", field: "fav1L" },
    { headerName: "P [m]", field: "fav2izqP" },
    { headerName: "S [m]", field: "fav2izqS" },
    { headerName: "P [m]", field: "fav2DerP" },
    { headerName: "S [m]", field: "fav2DerS" },
    { headerName: "E [m]", field: "fav3E" },
    { headerName: "T [m]", field: "fav3T" },
    { headerName: "β [°]", field: "fav3Beta" },
    { headerName: "α [°]", field: "fav3Alpha" },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={handleAccept}
              onCancel={handleCancel}
            />
          );
        }
        return (
          <ActionButtons
            onEdit={() => handleEdit(row)}
            onDelete={() => handleDeleteConfirmation(row)}
          />
        );
      },
    },
  ];

  // Definición del multiHeader (opcional, si tu componente TablesParameters lo utiliza)
  const multiHeader = {
    rows: [
      [
        { label: "Tipo Puente", rowSpan: 2 },
        { label: "Características espacio contiguo al elemento", rowSpan: 2 },
        { label: "Ángulo Azimut", rowSpan: 2 },
        { label: "Orientación", rowSpan: 2 },
        { label: "(Incluye marco)", colSpan: 2 },
        { label: "FAV 1", colSpan: 2 },
        { label: "FAV 2 izq", colSpan: 2 },
        { label: "FAV 2 Der", colSpan: 2 },
        { label: "FAV 3", colSpan: 4 },
        { label: "Acciones", rowSpan: 2 },
      ],
      [
        { label: "Alto [m]" },
        { label: "Ancho [m]" },
        { label: "D [m]" },
        { label: "L [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "E [m]" },
        { label: "T [m]" },
        { label: "β [°]" },
        { label: "α [°]" },
      ],
    ],
  };

  // Función para abrir el modal de creación
  const handleCreate = () => {
    setShowModal(true);
  };

  // Función para cerrar el modal y reiniciar el formulario
  const handleModalClose = () => {
    setShowModal(false);
    setDoorId(0);
    setCharacteristics("");
    setAnguloAzimut("");
    setHigh(0);
    setBroad(0);
  };

  // Función que se ejecuta al confirmar la creación en el modal
  const handleModalSave = async () => {
    const payload = {
      door_id: doorId,
      characteristics: characteristics,
      angulo_azimut: anguloAzimut,
      high: high,
      broad: broad,
    };

    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures-create/${enclosure_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la creación");
      }

      notify("Puerta creada exitosamente");
      handleModalClose();
      // Refrescar la tabla después de crear
      fetchDoorData();
    } catch (error) {
      console.error("Error:", error);
      notify("Error al crear la puerta", "error");
    }
  };

  return (
    <div>
      <TablesParameters columns={columns} data={data} multiHeader={multiHeader} />
      <div style={{ marginTop: "20px" }}>
        <CustomButton variant="save" onClick={handleCreate}>
          Crear
        </CustomButton>
      </div>
      
      {/* Modal para crear nueva puerta */}
      <ModalCreate
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        saveLabel="Crear"
        title="Crear Puerta"
      >
        <div className="container">
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="doorId">Tipo de Puerta</label>
            </div>
            <div className="col-md-8">
              <select
                id="doorId"
                className="form-control"
                value={doorId}
                onChange={(e) => setDoorId(Number(e.target.value))}
              >
                <option value={0}>Seleccione una puerta</option>
                {doorOptions.map((door) => (
                  <option key={door.id} value={door.id}>
                    {door.name_element}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="characteristics">Características</label>
            </div>
            <div className="col-md-8">
              <select
                id="characteristics"
                className="form-control"
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
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
              <label htmlFor="anguloAzimut">Ángulo Azimut</label>
            </div>
            <div className="col-md-8">
              <select
                id="anguloAzimut"
                className="form-control"
                value={anguloAzimut}
                onChange={(e) => setAnguloAzimut(e.target.value)}
              >
                <option value="">Seleccione un ángulo</option>
                {angleOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="high">Alto</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="high"
                className="form-control"
                value={high}
                onChange={(e) => setHigh(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="broad">Ancho</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="broad"
                className="form-control"
                value={broad}
                onChange={(e) => setBroad(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </ModalCreate>
      
      {/* Modal de confirmación para eliminar puerta */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onSave={handleDeleteConfirm}
        saveLabel="Eliminar"
        title="Confirmar Eliminación"
      >
        <div className="container">
          <div className="row mb-3">
            <div className="col-12 text-center">
              <p>¿Está seguro que desea eliminar la puerta <strong>{deletingRow?.tipoPuente}</strong>?</p>
             
            </div>
          </div>
        </div>
      </ModalCreate>
    </div>
  );
};

export default TabDoorCreate;