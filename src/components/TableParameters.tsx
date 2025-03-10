// TableParameters.tsx
import React from "react";
import { Loader2, Inbox } from "lucide-react";
import Card from "./common/Card";

export interface ColumnDefinition<T> {
  id: number | string;
  label: string;
  minWidth?: number;
  format?: (value: any, row: T) => React.ReactNode;
  cell?: (props: { row: T }) => React.ReactNode;
}

export interface TableParametersProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  loading?: boolean;
  minWidth?: number;
  primaryColor?: string;
}

const TableParameters = <T extends { [key: string]: any }>(
  props: TableParametersProps<T>
) => {
  const {
    data,
    columns,
    loading = false,
    minWidth = 400,
    primaryColor = "#3ca7b7",
  } = props;

  // Encabezados sticky
  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 3,
    textAlign: "center",
    color: primaryColor,
    fontSize: "1rem",
    padding: "6px",
  };

  return (
    <Card>
      <div className="mt-3" style={{ textAlign: "center" }}>
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="animate-spin inline me-2" size={18} /> Cargando...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-4">
            <Inbox className="inline me-2" size={18} /> No hay datos disponibles
          </div>
        ) : (
          <div
            className="table-responsive"
            style={{
              maxHeight: "450px", // Un poco más alta
              maxWidth: "1000px",  // Menos ancha
              margin: "0 auto",   // Centrar horizontalmente
              overflowX: "auto",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <table
              className="table table-bordered table-striped"
              style={{
                minWidth,               // Ancho mínimo
                borderCollapse: "collapse",
                fontSize: "1rem",    // Tamaño de fuente para el contenido
                width: "100%",          // Ocupar todo el contenedor
              }}
            >
              <thead className="bg-light border-bottom">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} style={headerStyle}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} style={{ lineHeight: 1.2 }}>
                    {columns.map((col) => (
                      <td
                        key={col.id.toString()}
                        style={{
                          textAlign: "center",
                          padding: "6px", // Menos padding para filas compactas
                        }}
                      >
                        {col.cell
                          ? col.cell({ row })
                          : col.format
                          ? col.format(row[col.id], row)
                          : row[col.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TableParameters;
