import React, { useState } from "react";
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
}

const TabCeilingCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  const [data, setData] = useState<CeilingData[]>([
    { id: 1, techos: "Techo 1", caracteristicas: "Espacio contiguo A", area: 100, u: 0.5 },
    { id: 2, techos: "Techo 2", caracteristicas: "Espacio contiguo B", area: 150, u: 0.6 },
  ]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Estados para el formulario del modal
  const [roofId, setRoofId] = useState<number>(0);
  const [characteristic, setCharacteristic] = useState<string>("");
  const [area, setArea] = useState<number>(0);

  const handleEdit = (row: CeilingData) => {
    setEditingRowId(row.id);
  };

  const handleDelete = (row: CeilingData) => {
    notify("Registro eliminado");
    setData(prev => prev.filter(item => item.id !== row.id));
  };

  const handleAccept = (row: CeilingData) => {
    notify("Cambios guardados");
    setEditingRowId(null);
  };

  const handleCancel = (row: CeilingData) => {
    setEditingRowId(null);
  };

  const columns = [
    { headerName: "Techos", field: "techos" },
    { headerName: "Características espacio contiguo al elemento", field: "caracteristicas" },
    { headerName: "Área [m2]", field: "area" },
    { headerName: "U [W/m2𝐾]", field: "u" },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: CeilingData) => {
        if (editingRowId === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleAccept(row)}
              onCancel={() => handleCancel(row)}
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

  // Al presionar "Crear" se abre el modal
  const handleCreate = () => {
    setShowModal(true);
  };

  // Cierra el modal y reinicia los campos
  const handleModalClose = () => {
    setShowModal(false);
    setRoofId(0);
    setCharacteristic("");
    setArea(0);
  };

  // Función que se ejecuta al confirmar la creación en el modal
  const handleModalSave = async () => {
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la creación");
      }

      notify("Techo creado exitosamente");
      handleModalClose();
      // Aquí puedes actualizar la tabla si es necesario
    } catch (error) {
      console.error("Error:", error);
      // Opcional: notificar error
    }
  };

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
              <input
                type="number"
                id="roofId"
                className="form-control"
                value={roofId}
                onChange={(e) => setRoofId(Number(e.target.value))}
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
        </div>
      </ModalCreate>
    </div>
  );
};

export default TabCeilingCreate;
