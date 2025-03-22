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

const TabDoorCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  // Datos de ejemplo para la tabla
  const [data, setData] = useState<DoorData[]>([
    {
      id: 1,
      tipoPuente: "Tipo A",
      caracteristicas: "Espacio contiguo A",
      anguloAzimut: "45° ≤ Az < 67,5°",
      orientacion: "Norte",
      incluyeMarcoAlto: 2.5,
      incluyeMarcoAncho: 1.2,
      fav1D: 3,
      fav1L: 1.5,
      fav2izqP: 2,
      fav2izqS: 0.8,
      fav2DerP: 2.2,
      fav2DerS: 0.9,
      fav3E: 4,
      fav3T: 2,
      fav3Beta: 30,
      fav3Alpha: 15,
    },
    {
      id: 2,
      tipoPuente: "Tipo B",
      caracteristicas: "Espacio contiguo B",
      anguloAzimut: "67,5° ≤ Az < 90°",
      orientacion: "Sur",
      incluyeMarcoAlto: 2.8,
      incluyeMarcoAncho: 1.3,
      fav1D: 3.2,
      fav1L: 1.6,
      fav2izqP: 2.1,
      fav2izqS: 0.85,
      fav2DerP: 2.3,
      fav2DerS: 0.95,
      fav3E: 4.1,
      fav3T: 2.1,
      fav3Beta: 32,
      fav3Alpha: 16,
    },
  ]);

  // Estado para identificar la fila en edición
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
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

  // Cargar opciones de ángulo azimut al montar el componente
  useEffect(() => {
    const fetchAngleOptions = async () => {
      try {
        const response = await fetch("https://ceela-backend.svgdev.tech/angle-azimut", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener las opciones de ángulo azimut");
        }
        const options: string[] = await response.json();
        setAngleOptions(options);
      } catch (error) {
        console.error("Error fetching angle options:", error);
      }
    };
    fetchAngleOptions();
  }, [token]);

  // Funciones para manejar las acciones de la fila
  const handleEdit = (row: DoorData) => {
    setEditingRowId(row.id);
  };

  const handleDelete = (row: DoorData) => {
    notify("Registro eliminado");
    setData((prev) => prev.filter((item) => item.id !== row.id));
  };

  const handleAccept = (row: DoorData) => {
    notify("Cambios guardados");
    setEditingRowId(null);
  };

  const handleCancel = (row: DoorData) => {
    setEditingRowId(null);
  };

  // Definición de las columnas de la tabla (incluyendo multiHeader)
  const columns = [
    { headerName: "Tipo Puente", field: "tipoPuente" },
    { headerName: "Características espacio contiguo al elemento", field: "caracteristicas" },
    { headerName: "Ángulo Azimut", field: "anguloAzimut" },
    { headerName: "Orientación", field: "orientacion" },
    { headerName: "Alto [m]", field: "incluyeMarcoAlto" },
    { headerName: "Ancho [m]", field: "incluyeMarcoAncho" },
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
      // Aquí puedes actualizar la tabla si es necesario
    } catch (error) {
      console.error("Error:", error);
      // Opcional: notificar error
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
              <label htmlFor="doorId">ID de la Puerta</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="doorId"
                className="form-control"
                value={doorId}
                onChange={(e) => setDoorId(Number(e.target.value))}
              />
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
    </div>
  );
};

export default TabDoorCreate;
