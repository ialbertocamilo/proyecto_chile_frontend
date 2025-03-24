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
  // Estilo base para los encabezados sticky.
  // (Si tienes múltiples filas sticky, deberás ajustar manualmente el `top`
  // de cada una para evitar que se superpongan).
  const baseStickyStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,                // Mantén la primera fila fija arriba. Para más filas, necesitarás ajustar esto.
    backgroundColor: "#fff",
    zIndex: 500,
    textAlign: "center",
    verticalAlign: "middle",
    color: "var(--primary-color)",
  };

  // Función para calcular el total de colSpan en una fila (si no se indica, se asume 1)
  const getTotalColSpan = (row: HeaderRow) =>
    row.reduce((acc, cell) => acc + (cell.colSpan ?? 1), 0);

  return (
    <div
      style={{
        maxHeight: "400px",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <table
        className="table table-bordered"
        style={{
          tableLayout: "auto",    // Ajusta el ancho de las celdas al contenido
          margin: "auto",         // Centra la tabla horizontalmente
          borderCollapse: "collapse",
        }}
      >
        <thead>
          {multiHeader ? (
            <>
              {multiHeader.rows.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ height: "auto" }}>
                  {row.map((cell, cellIndex) => (
                    <th
                      key={cellIndex}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      style={{
                        ...baseStickyStyle,
                        // Si deseas que cada fila de encabezado sticky tenga
                        // un `top` distinto, ajusta aquí según rowIndex:
                        // top: rowIndex * 40, etc.
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
                      }}
                    />
                  )}
                </tr>
              ))}
            </>
          ) : (
            <tr style={{ height: "auto" }}>
              {columns.map((col) => (
                <th
                  key={col.field}
                  style={{
                    ...baseStickyStyle,
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
            <tr key={rowIndex} style={{ height: "auto" }}>
              {columns.map((col) => (
                <td
                  key={col.field}
                  style={{
                    verticalAlign: "middle", // Centra verticalmente
                    textAlign: "center",     // Centra horizontalmente
                    padding: "8px",          // Añade algo de padding para mejorar la legibilidad
                  }}
                >
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
