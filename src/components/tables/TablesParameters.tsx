import React, { useState, useMemo } from "react";

const collator = new Intl.Collator("es", { sensitivity: "base" }); // ①
const isNumeric = (v: any) =>                                      // ②
typeof v === "number" ||
(!!v && !Array.isArray(v) && !isNaN(parseFloat(v as any)));

interface Column {
  headerName: string | React.ReactNode;
  field: string;
  headerStyle?: React.CSSProperties;
  renderCell?: (row: any) => React.ReactNode;
  headerClick?: () => void; // Optional property for header click handler
  sortable?: boolean;
}

interface TablesParametersProps {
  columns: Column[];
  data: any[];
  multiHeader?: MultiHeader;
}

interface HeaderCell {
  label: string | React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  style?: React.CSSProperties;
}

type HeaderRow = HeaderCell[];

interface MultiHeader {
  rows: HeaderRow[];
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export default function TablesParameters({
  columns,
  data,
  multiHeader,
}: TablesParametersProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

 

  const handleSort = (field: string) => {
    setSortConfig((current) => {
      if (current?.field === field) {
        return current.direction === 'asc' 
          ? { field, direction: 'desc' } 
          : null;
      }
      return { field, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
  
    const { field, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;   // ③
  
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
  
      // Null / undefined al final, independientemente de asc/desc
      if (aVal == null) return 1;
      if (bVal == null) return -1;
  
      // ④ Orden numérico robusto
      if (isNumeric(aVal) && isNumeric(bVal)) {
        return (parseFloat(aVal) - parseFloat(bVal)) * dir;
      }
  
      // ⑤ Orden alfabético «humano» para español
      return collator.compare(String(aVal), String(bVal)) * dir;
    });
  }, [data, sortConfig]);
  

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-12 p-0 d-flex flex-column">
          <div
            className="table-responsive w-100"
            style={{
              maxHeight: "400px", // Limitamos la altura para que tenga un scroll si es necesario
            }}
          >
            <table className="table table-hover table-sm mb-0">
              <thead
                className="border-bottom"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "#fff", // Fondo transparente
                  color: "var(--primary-color)", // Color del texto: color primario
                }}
              >
                {multiHeader ? (
                  <>
                    {multiHeader.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <th
                            key={cellIndex}
                            colSpan={cell.colSpan}
                            rowSpan={cell.rowSpan}
                            style={cell.style}
                            className="text-center align-middle" // Clases de Bootstrap para centrar el texto
                          >
                            {cell.label}
                          </th>
                        ))}
                        {rowIndex === 0 &&
                          row.reduce(
                            (acc, cell) => acc + (cell.colSpan ?? 1),
                            0
                          ) < columns.length && (
                            <th
                              colSpan={
                                columns.length - 
                                row.reduce(
                                  (acc, cell) => acc + (cell.colSpan ?? 1),
                                  0
                                )
                              }
                              className="text-center align-middle"
                            />
                          )}
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        className="text-center align-middle"
                        key={col.field}
                        onClick={() => col.sortable !== false && handleSort(col.field)}
                        style={{
                          cursor: col.sortable !== false ? "pointer" : "default",
                          ...col.headerStyle,
                        }}
                      >
                        {col.headerName}
                        {sortConfig?.field === col.field && (
                          <span className="ms-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>

              <tbody>
                {sortedData?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns?.map((col) => (
                      <td
                        key={col.field}
                        className="text-center align-middle"
                        style={{
                          padding: "8px 2px",
                          minWidth: "100px",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
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
        </div>
      </div>
    </div>
  );
}
