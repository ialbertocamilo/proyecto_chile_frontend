import React from "react";

interface Column {
  headerName: string;
  field: string;
  headerStyle?: React.CSSProperties;
  // Permite renderizar contenido personalizado en la celda
  renderCell?: (row: any) => React.ReactNode;
}

interface TablesParametersProps {
  columns: Column[];
  data: any[];
  multiHeader?: MultiHeader; // Encabezado de múltiples filas (opcional)
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
  // Altura fija para cada fila de encabezado
  const headerRowHeight = 40;

  // Estilo base para los encabezados sticky
  const baseStickyStyle: React.CSSProperties = {
    position: "sticky",
    backgroundColor: "#fff",
    zIndex: 500,
    textAlign: "center",
    verticalAlign: "top",
    color: "var(--primary-color)",
  };

  // Función para calcular el total de colSpan en una fila (si no se indica, se asume 1)
  const getTotalColSpan = (row: HeaderRow) =>
    row.reduce((acc, cell) => acc + (cell.colSpan ? cell.colSpan : 1), 0);

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
            <>
              {multiHeader.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <th
                      key={cellIndex}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      style={{
                        ...baseStickyStyle,
                        top: `${rowIndex * headerRowHeight}px`,
                        ...cell.style,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                  {/* En la primera fila, si el total de colSpan es menor al número de columnas, agregamos una celda extra */}
                  {rowIndex === 0 && getTotalColSpan(row) < columns.length && (
                    <th
                      colSpan={columns.length - getTotalColSpan(row)}
                      style={{
                        ...baseStickyStyle,
                        top: "0px",
                      }}
                    ></th>
                  )}
                </tr>
              ))}
            </>
          ) : (
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  style={{
                    ...baseStickyStyle,
                    top: "0px",
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
