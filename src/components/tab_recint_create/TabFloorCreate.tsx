import React, { useState } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";

// Definimos la interfaz de nuestros datos con el nombre correcto de la propiedad
interface FloorData {
  index: number;
  pisos: string;
  caracteristicas: string;
  area: number;
  uValue: number;
  perimetroSuelo: number;
  pisoVentilado: string;
  ptP06L: number;
}

const TabFloorCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  // Datos de ejemplo con la propiedad "ptP06L" correctamente nombrada
  const initialData: FloorData[] = [
    {
      index: 0,
      pisos: "Piso 1",
      caracteristicas: "Espacio contiguo A",
      area: 100,
      uValue: 1.2,
      perimetroSuelo: 30,
      pisoVentilado: "Sí",
      ptP06L: 15,
    },
    {
      index: 1,
      pisos: "Piso 2",
      caracteristicas: "Espacio contiguo B",
      area: 120,
      uValue: 1.1,
      perimetroSuelo: 35,
      pisoVentilado: "No",
      ptP06L: 18,
    },
  ];

  const [tableData, setTableData] = useState<FloorData[]>(initialData);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Estados para el formulario del modal
  const [floorId, setFloorId] = useState<number>(0);
  const [characteristic, setCharacteristic] = useState<string>("");
  const [area, setArea] = useState<number>(0);
  const [parameter, setParameter] = useState<number>(0);
  const [isVentilated, setIsVentilated] = useState<string>("");

  // Maneja la acción de editar: se guarda el índice de la fila en edición
  const handleEditRow = (row: FloorData) => {
    setEditingRowIndex(row.index);
  };

  // Maneja la eliminación: se remueve la fila y se muestra una notificación
  const handleDeleteRow = (row: FloorData) => {
    setTableData(tableData.filter((item) => item.index !== row.index));
    notify("Registro eliminado correctamente");
  };

  // Aceptar cambios (aquí se podrían integrar las actualizaciones a una API)
  const handleAcceptRow = (row: FloorData) => {
    setEditingRowIndex(null);
    notify("Cambios guardados correctamente");
  };

  // Cancelar la edición
  const handleCancelRow = (row: FloorData) => {
    setEditingRowIndex(null);
  };

  // Definición de columnas para la tabla
  const columns = [
    { headerName: "Pisos", field: "pisos" },
    { headerName: "Características espacio contiguo al elemento", field: "caracteristicas" },
    { headerName: "Área [m²]", field: "area" },
    { headerName: "U [W/m²K]", field: "uValue" },
    { headerName: "Perímetro Suelo [m]", field: "perimetroSuelo" },
    { headerName: "Piso ventilado [¿?]", field: "pisoVentilado" },
    { headerName: "PT P06 L [m]", field: "ptP06L" },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: FloorData) => {
        return editingRowIndex === row.index ? (
          <ActionButtonsConfirm
            onAccept={() => handleAcceptRow(row)}
            onCancel={() => handleCancelRow(row)}
          />
        ) : (
          <ActionButtons
            onEdit={() => handleEditRow(row)}
            onDelete={() => handleDeleteRow(row)}
          />
        );
      },
    },
  ];

  // Cierra el modal y reinicia los campos
  const handleModalClose = () => {
    setShowModal(false);
    setFloorId(0);
    setCharacteristic("");
    setArea(0);
    setParameter(0);
    setIsVentilated("");
  };

  // Función que se ejecuta al confirmar la creación en el modal
  const handleModalSave = async () => {
    const payload = {
      floor_id: floorId,
      characteristic: characteristic,
      area: area,
      parameter: parameter,
      is_ventilated: isVentilated,
    };

    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/floor-enclosures-create/${enclosure_id}`,
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

      notify("Piso creado exitosamente");
      handleModalClose();
      // Aquí puedes actualizar tableData si es necesario
    } catch (error) {
      console.error("Error:", error);
      // Opcional: notificar error
    }
  };

  return (
    <div>
      <TablesParameters columns={columns} data={tableData} />
      <div style={{ marginTop: "20px" }}>
        <CustomButton variant="save" onClick={() => setShowModal(true)}>
          Crear
        </CustomButton>
      </div>
      <ModalCreate
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        saveLabel="Crear"
        title="Crear Piso"
      >
        <div className="container">
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="floorId">ID del Piso</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="floorId"
                className="form-control"
                value={floorId}
                onChange={(e) => setFloorId(Number(e.target.value))}
              />
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
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="parameter">Parámetro</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="parameter"
                className="form-control"
                value={parameter}
                onChange={(e) => setParameter(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="isVentilated">Ventilado</label>
            </div>
            <div className="col-md-8">
              <select
                id="isVentilated"
                className="form-control"
                value={isVentilated}
                onChange={(e) => setIsVentilated(e.target.value)}
              >
                <option value="">Seleccione una opción</option>
                <option value="Ventilado">Ventilado</option>
                <option value="No Ventilado">No Ventilado</option>
              </select>
            </div>
          </div>
        </div>
      </ModalCreate>
    </div>
  );
};

export default TabFloorCreate;
