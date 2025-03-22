import React, { useState } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";

const TabFavCreate: React.FC = () => {

    // Leer valores del localStorage
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";
  // Estado para manejar (eventualmente) la edición o creación de datos FAV
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Datos de ejemplo para la tabla FAV
  const data = [
    {
      id: 1,
      fav1_d: 0.5,
      fav1_l: 1.0,
      fav2_izq_p: 0.3,
      fav2_izq_s: 0.4,
      fav2_der_p: 0.3,
      fav2_der_s: 0.4,
      fav3_e: 0.2,
      fav3_t: 0.6,
      fav3_beta: 45,
      fav3_alpha: 30,
    },
  ];

  // Definición de las columnas para la tabla de FAV
  const favColumns = [
    { headerName: "D [m]", field: "fav1_d" },
    { headerName: "L [m]", field: "fav1_l" },
    { headerName: "P [m]", field: "fav2_izq_p" },
    { headerName: "S [m]", field: "fav2_izq_s" },
    { headerName: "P [m]", field: "fav2_der_p" },
    { headerName: "S [m]", field: "fav2_der_s" },
    { headerName: "E [m]", field: "fav3_e" },
    { headerName: "T [m]", field: "fav3_t" },
    { headerName: "β [°]", field: "fav3_beta" },
    { headerName: "α [°]", field: "fav3_alpha" },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: any) => (
        <ActionButtons
          onEdit={() => alert("Editar FAV")}
          onDelete={() => alert("Eliminar FAV")}
        />
      ),
    },
  ];

  // MultiHeader para la tabla de FAV
  const favMultiHeader = {
    rows: [
      [
        { label: "FAV 1", colSpan: 2 },
        { label: "FAV 2 izq", colSpan: 2 },
        { label: "FAV 2 Der", colSpan: 2 },
        { label: "FAV 3", colSpan: 4 },
        { label: "Acciones", rowSpan: 2 },
      ],
      [
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

  // Función de ejemplo para abrir el modal de FAV
  const handleCreateFav = () => {
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <TablesParameters
        columns={favColumns}
        data={data}
        multiHeader={favMultiHeader}
      />
      <div style={{ marginTop: "1rem" }}>
        <CustomButton variant="save" onClick={handleCreateFav}>
          Crear FAV
        </CustomButton>
      </div>
      <ModalCreate
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={() => alert("Función de guardado pendiente")}
        title="Crear FAV"
        saveLabel="Crear"
      >
        {/* Aquí se implementará el formulario para FAV cuando se definan las funciones */}
        <form>
          <p>Formulario para FAV (a implementar)</p>
        </form>
      </ModalCreate>
    </div>
  );
};

export default TabFavCreate;
