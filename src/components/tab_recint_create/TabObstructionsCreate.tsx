import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";

interface ObstructionsData {
  id: number;
  index: number;
  división: string;
  floor_id: number;
  b: number;
  a: number;
  d: number;
  anguloAzimut: string;
  orientación: number;
  obstrucción: number;
}

const FloorTable: React.FC = () => {
  const [tableData, setTableData] = useState<ObstructionsData[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  // Definición de columnas para la tabla de obstrucciones
  const columns = [
    {
      headerName: "División",
      field: "división",
      renderCell: (row: ObstructionsData) => row.división,
    },
    {
        headerName: "A [m]",
        field: "a",
        renderCell: (row: ObstructionsData) => row.a === 0 ? "-" : row.a,
    },
    {
        headerName: "B [m]",
        field: "b",
        renderCell: (row: ObstructionsData) => row.b === 0 ? "-" : row.b,
    },
    {
        headerName: "D [m]",
        field: "d",
        renderCell: (row: ObstructionsData) => row.d === 0 ? "-" : row.d,
    },
    {
        headerName: "Ángulo Azimut",
        field: "anguloAzimut",
        renderCell: (row: ObstructionsData) => row.anguloAzimut,
    },
    {
      headerName: "Orientación",
      field: "orientación",
      renderCell: (row: ObstructionsData) => row.orientación === 0 ? "-" : row.orientación,
    },
    {
      headerName: "Obstrucción",
      field: "obstrucción",
      renderCell: (row: ObstructionsData) => row.obstrucción === 0 ? "-" : row.obstrucción,
    },
    {
    headerName: "Acciones",
      field: "acciones",
      renderCell: (row: ObstructionsData) => row.id,
    },
  ];

  useEffect(() => {
    // Aquí puedes obtener o establecer los datos de la tabla.
    // Por ejemplo, realizando una llamada a una API para cargar los pisos.
  }, []);

  return (
    <div>
      {tableLoading ? (
        <div className="text-center p-4">
          <p>Cargando datos de pisos...</p>
        </div>
      ) : (
        <TablesParameters columns={columns} data={tableData} />
      )}
    </div>
  );
};

export default FloorTable;
