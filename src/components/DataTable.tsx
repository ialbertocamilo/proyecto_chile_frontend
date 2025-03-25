import { ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import Card from "./common/Card";
import IconButton from "./common/IconButton";
import SearchInput from "./inputs/SearchInput";

interface DataTableProps<T> {
  data: T[];
  columns: {
    id: number | string;
    label: string;
    minWidth?: number;
    format?: any;
    cell?: (props: { row: T }) => React.ReactNode;
  }[];
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
  pageSize?: number;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  // Estas props ahora son opcionales
  createText?: string;
  createUrl?: string;
  showButton?: boolean;
}

const TablePagination: React.FC<{
  page: number;
  rowsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ page, rowsPerPage, totalPages, onPageChange, onRowsPerPageChange }) => (
  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-1">
    <div
      className="w-100 w-sm-auto mb-2 mb-sm-0 mx-auto mx-sm-0"
      style={{ maxWidth: "180px" }}
    >
      <select
        className="form-select form-select-sm"
        value={rowsPerPage}
        onChange={onRowsPerPageChange}
      >
        <option value={5}>5 por página</option>
        <option value={10}>10 por página</option>
        <option value={25}>25 por página</option>
        <option value={50}>50 por página</option>
      </select>
    </div>
    <div className="d-flex align-items-center justify-content-center gap-1 gap-sm-2 w-100 w-sm-auto">
      <IconButton
        onClick={() => onPageChange(page - 1)}
        icon={ChevronLeft}
        disabled={page === 0}
      />
      <span className="text-nowrap">
        Página {page + 1} de {totalPages}
      </span>
      <div className="flex-shrink-0 primary-db">
        <IconButton
          onClick={() => onPageChange(page + 1)}
          icon={ChevronRight}
          disabled={page >= totalPages - 1}
        />
      </div>
    </div>
  </div>
);

export default function DataTable<T extends { [key: string]: any }>({
  data,
  columns,
  loading = false,
  pageSize = 10,
  createText,
  createUrl,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChangePage = (newPage: number) => {
    if (
      newPage >= 0 &&
      newPage < Math.ceil(filteredData.length / rowsPerPage)
    ) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Actualiza el searchQuery
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reinicia a la primera página al buscar
  };

  // Filtrado global: se recorre cada fila y se combinan todas sus propiedades para realizar la búsqueda
  const filteredData = searchQuery.trim()
    ? data.filter((row) => {
        const combined = Object.values(row)
          .map((val) => {
            if (val === undefined || val === null) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return String(val);
          })
          .join(" ")
          .toLowerCase();
        return combined.includes(searchQuery.toLowerCase());
      })
    : data;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <Card>
      <div className="">
        <div className="row mb-3 mt-3">
          <div className="col-12">
            <div className="d-flex flex-column flex-sm-row gap-2">
              <SearchInput
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                createUrl={createUrl}
                createText={createText}
                showButton={createText ? true : false}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div
              className="table-responsive mb-0 pb-0"
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                borderRadius: "8px",
                display: "block",
                width: "100%",
                maxWidth: "100%",
                position: "relative", // Added for the :after pseudo-element
              }}
            >
              <table
                className="table table-hover table-mobile border rounded"
                style={{ minWidth: "100%", borderColor: "#dee2e6" }}
              >
                <thead className="bg-light border-bottom">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.id.toString()}
                        className="text-center"
                        style={{ color: "var(--primary-color)" }}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        <Loader2
                          className="animate-spin me-2 inline"
                          size={18}
                        />
                        Cargando...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center ">
                        <Inbox className="me-2 inline" size={18} />
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    filteredData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <tr key={index} className="align-middle">
                          {columns.map((column) => (
                            <td
                              key={column.id.toString()}
                              className="text-center p-2 p-md-3"
                            >
                              {column.cell
                                ? column.cell({ row })
                                : column.format
                                ? column.format(row[column.id], row)
                                : row[column.id]}
                            </td>
                          ))}
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 ">
            <TablePagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        .primary-db {
          background-color: var(--primary-color) !important;
        }
      `}</style>
    </Card>
  );
}
