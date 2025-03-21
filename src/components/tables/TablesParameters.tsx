import React from "react";

interface Column {
  headerName: string;
  field: string;
  headerStyle?: React.CSSProperties;
  // Agregamos renderCell para renderizar contenido personalizado en la celda
  renderCell?: (row: any) => React.ReactNode;
}

interface TablesParametersProps {
  columns: Column[];
  data: any[];
  multiHeader?: MultiHeader; // Nuevo: encabezado de múltiples filas
}

// Cada celda del encabezado (multi-header)
interface HeaderCell {
  label: string;
  colSpan?: number;
  rowSpan?: number;
  style?: React.CSSProperties;
}

type HeaderRow = HeaderCell[];

interface MultiHeader {
  rows: HeaderRow[];
}

export default function TablesParameters({
  columns,
  data,
  multiHeader,
}: TablesParametersProps) {
  const stickyHeaderStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
  };

  return (
    <div style={{ height: "400px", overflowY: "scroll", overflowX: "auto" }}>
      <table
        className="table table-bordered"
        style={{
          width: "100%",
          minWidth: "800px",
          textAlign: "center",
          margin: "auto",
        }}
      >
        <thead>
          {multiHeader ? (
            // Si hay multiHeader, generamos varias filas según rows
            multiHeader.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    style={{
                      ...stickyHeaderStyle,
                      color: "var(--primary-color)",
                      ...cell.style,
                    }}
                  >
                    {cell.label}
                  </th>
                ))}
              </tr>
            ))
          ) : (
            // Si NO hay multiHeader, usamos las columnas clásicas
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  style={{
                    ...stickyHeaderStyle,
                    color: "var(--primary-color)",
                    ...col.headerStyle,
                  }}
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col.field}>
                  {col.renderCell ? col.renderCell(row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
