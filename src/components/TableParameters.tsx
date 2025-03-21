// TableParameters.tsx
import React from "react";
import { Loader2, Inbox } from "lucide-react";
import Card from "./common/Card";

export interface ColumnDefinition<T> {
  id: number | string;
  label: string;
  field?: string;
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

  // Estilo base para el encabezado
  const headerStyle: React.CSSProperties = { 
    top: 0,
    backgroundColor: "#fff",
    zIndex: 10, // Aumentado
    textAlign: "center",
    color: primaryColor,
    fontSize: "1rem",
    padding: "6px",
    whiteSpace: "nowrap",
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
              position: "relative", // Importante para que sticky funcione correctamente
              maxHeight: "450px",
              maxWidth: "1000px",
              margin: "0 auto",
              overflowX: "auto",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              whiteSpace: "nowrap",
            }}
          >
            <table
              className="table table-bordered table-striped"
              style={{
                minWidth,
                borderCollapse: "collapse",
                fontSize: "1rem",
                width: "100%",
              }}
            >
              <thead className="bg-light border-bottom">
                <tr>
                  {columns.map((col, idx) => {
                    const isAcciones = col.field === "acciones";
                    const thStyle: React.CSSProperties = isAcciones
                      ? {
                        ...headerStyle,
                        position: "sticky",
                        right: "auto",
                        backgroundColor: "#fff",
                        zIndex: 10, // Encabezado de acciones con mayor z-index
                      }
                      : headerStyle;
                    return (
                      <th key={idx} style={thStyle}>
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} style={{ lineHeight: 1.2 }}>
                    {columns.map((col) => {
                      const isAcciones = col.field === "acciones";
                      const tdStyle: React.CSSProperties = isAcciones
                        ? {
                          textAlign: "center",
                          padding: "6px",
                          whiteSpace: "nowrap",
                          position: "sticky",
                          right: "auto",
                          top: "auto", // Evitamos que se fije verticalmente
                          backgroundColor: "#fff",
                          zIndex: 9,
                        }
                        : {
                          textAlign: "center",
                          padding: "6px",
                          whiteSpace: "nowrap",
                        };

                      let content: React.ReactNode;
                      if (col.cell) {
                        content = col.cell({ row });
                      } else if (col.format) {
                        content = col.format(row[col.id], row);
                      } else {
                        content = row[col.id];
                      }

                      return (
                        <td key={col.id.toString()} style={tdStyle}>
                          {content}
                        </td>
                      );
                    })}
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
