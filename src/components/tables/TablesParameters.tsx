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


  const unwrap = (v: any): string | number | null => {
    // 1) Si es un elemento React
    if (React.isValidElement(v)) {
      const children = (v as React.ReactElement<any>).props.children;
      // 1a) Si los hijos son un string o number, simplemente lo devolvemos
      if (typeof children === "string" || typeof children === "number") {
        return children;
      }
      // 1b) Si es un array (p. ej. [ 'foo', <b>bar</b> ]), concatenamos todo
      if (Array.isArray(children)) {
        return children.map((c) => (typeof c === "string" ? c : "")).join("");
      }
    }
    // 2) Si no es un ReactNode, devolvemos el valor crudo (string, number, null…)
    return v;
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { field, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;   // ③

    return [...data].sort((a, b) => {
      // Extraemos siempre valor primitivo
      const rawA = a[field];
      const rawB = b[field];
      const aVal = unwrap(rawA);
      const bVal = unwrap(rawB);

      // Null / undefined al final, independientemente de asc/desc
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // ④ Orden numérico robusto
      if (isNumeric(aVal) && isNumeric(bVal)) {
        return (parseFloat(String(aVal)) - parseFloat(String(bVal))) * dir;
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
