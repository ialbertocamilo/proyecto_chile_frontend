import React, { useState } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";

const MyTable: React.FC = () => {
  // Estado para determinar qué fila se está editando (se identifica por un id)
  const [editingRow, setEditingRow] = useState<number | null>(null);

  // Datos de ejemplo, se agrega una propiedad "id" para identificar cada fila
  const data = [
    {
      id: 1,
      tipoVano: "Ejemplo 1",
      caracteristicas: "Característica A",
      anguloAzimut: "30°",
      orientacion: "Norte",
      alojadoEn: "Pared",
      tipoCierre: "Manual",
      posicionVentanal: "Interior",
      aislacion: "Con retorno",
      alto: 2.5,
      ancho: 1.8,
      marco: "Aluminio",
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
    // Puedes agregar más filas según lo requieras
  ];

  // Definición de las columnas, incluida la columna "Acciones" con renderCell para cambiar de componente
  const columns = [
    { headerName: "Tipo de vano Acristalado (incluye marco)", field: "tipoVano" },
    { headerName: "Características espacio contiguo el elemento", field: "caracteristicas" },
    { headerName: "Ángulo Azimut", field: "anguloAzimut" },
    { headerName: "Orientación", field: "orientacion" },
    { headerName: "Alojado en", field: "alojadoEn" },
    { headerName: "Tipo de Cierre", field: "tipoCierre" },
    { headerName: "Posición Ventanal", field: "posicionVentanal" },
    { headerName: "Aislación Con/sin retorno", field: "aislacion" },
    { headerName: "Alto (H) [m]", field: "alto" },
    { headerName: "Ancho (W) [m]", field: "ancho" },
    { headerName: "Marco", field: "marco" },
    // FAV 1
    { headerName: "D [m]", field: "fav1_d" },
    { headerName: "L [m]", field: "fav1_l" },
    // FAV 2 izq
    { headerName: "P [m]", field: "fav2_izq_p" },
    { headerName: "S [m]", field: "fav2_izq_s" },
    // FAV 2 Der
    { headerName: "P [m]", field: "fav2_der_p" },
    { headerName: "S [m]", field: "fav2_der_s" },
    // FAV 3
    { headerName: "E [m]", field: "fav3_e" },
    { headerName: "T [m]", field: "fav3_t" },
    { headerName: "β [°]", field: "fav3_beta" },
    { headerName: "α [°]", field: "fav3_alpha" },
    // Columna de Acciones
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: any) => {
        // Si la fila está en modo edición (editingRow coincide con row.id), mostramos los botones de confirmación
        if (editingRow === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => {
                // Aquí puedes agregar la lógica para guardar los cambios
                setEditingRow(null);
                alert("Guardado!");
              }}
              onCancel={() => {
                // Se cancela la edición
                setEditingRow(null);
              }}
            />
          );
        } else {
          return (
            <ActionButtons
              onEdit={() => {
                // Al hacer clic en editar, se activa el modo edición para esa fila
                setEditingRow(row.id);
              }}
              onDelete={() => {
                // Lógica de eliminación (por ejemplo, mostrar confirmación o eliminar directamente)
                alert("Eliminado!");
              }}
            />
          );
        }
      },
    },
  ];

  // Multi-header: se incluyen las cabeceras agrupadas y se agrega la columna "Acciones" sin agrupación (rowSpan: 2)
  const multiHeader = {
    rows: [
      [
        { label: "Tipo de vano Acristalado (incluye marco)", rowSpan: 2 },
        { label: "Características espacio contiguo el elemento", rowSpan: 2 },
        { label: "Ángulo Azimut", rowSpan: 2 },
        { label: "Orientación", rowSpan: 2 },
        { label: "Alojado en", rowSpan: 2 },
        { label: "Tipo de Cierre", rowSpan: 2 },
        { label: "Posición Ventanal", rowSpan: 2 },
        { label: "Aislación Con/sin retorno", rowSpan: 2 },
        { label: "Alto (H) [m]", rowSpan: 2 },
        { label: "Ancho (W) [m]", rowSpan: 2 },
        { label: "Marco", rowSpan: 2 },
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

  return (
    <div>
      <TablesParameters columns={columns} data={data} multiHeader={multiHeader} />
    </div>
  );
};

export default MyTable;
