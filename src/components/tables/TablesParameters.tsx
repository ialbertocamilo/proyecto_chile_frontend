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
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-12 p-0">
          <div className="table-responsive w-100" style={{ maxHeight: "400px" }}>
            <table
              className="table table-hover w-100 mb-0"
              style={{
                tableLayout: "auto",    // Ajusta el ancho de las celdas al contenido
                borderCollapse: "collapse",
              }}
            >
              <thead className="bg-light border-bottom">
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
                              ...cell.style,
                            }}
                          >
                            {cell.label}
                          </th>
                        ))}
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
        </div></div>
    </div>
  );
}
