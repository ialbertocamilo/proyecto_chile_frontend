import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
type Constant = {
  id: number;
  name: string;
  type: string;
  user_id: number | null;
  is_deleted: boolean;
  atributs: { [key: string]: any };
  create_status: string;
};

const ConstantsManagement = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState("constants");
  const [constants, setConstants] = useState<Constant[]>([]);
  const [nameQuery, setNameQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const fetchConstants = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("per_page", String(perPage));
      if (nameQuery.trim() !== "") {
        params.append("name", nameQuery.trim());
      }
      if (typeQuery.trim() !== "") {
        params.append("type", typeQuery.trim());
      }

      const response = await fetch(
        `${constantUrlApiEndpoint}/constants/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener las constantes");
      }

      const data = await response.json();
      console.log("Constants recibidas:", data);
      setConstants(data.constants || []);
      setTotalPages(data.total_pages || 1);
    } catch (error: any) {
      console.error("Error en fetchConstants:", error.message);
    }
  };

  useEffect(() => {
    fetchConstants();
  }, [page, nameQuery, typeQuery]);

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleEditConstant = (constant: Constant) => {
    router.push(`/constant-edit?id=${constant.id}`);
  };

  const handleDeleteConstant = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta constante?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró un token en localStorage.");
      return;
    }
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/constant/${id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la constante");
      }

      fetchConstants();
    } catch (error: any) {
      console.error("Error eliminando la constante:", error.message);
    }
  };

  const renderContent = () => {
    return (
      <>
        {/* Filtros de búsqueda */}
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="form-control"
              value={nameQuery}
              onChange={(e) => {
                setNameQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Buscar por tipo..."
              className="form-control"
              value={typeQuery}
              onChange={(e) => {
                setTypeQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Botón para agregar nueva constante */}
        <div className="mb-4 text-center">
          <Button
            text="Agregar Constant"
            onClick={() => router.push("/constants-create")}
            className="btn-success"
          />
        </div>

        {/* Tabla de constantes */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Atributos</th>
                <th>Estado Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {constants.length > 0 ? (
                constants.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.type}</td>
                    <td>
                      {c.atributs &&
                        Object.entries(c.atributs).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                    </td>
                    <td>{c.create_status}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleEditConstant(c)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteConstant(c.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No hay constantes o no coinciden con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            className="btn btn-outline-primary me-2"
            onClick={goToPreviousPage}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-outline-primary ms-2"
            onClick={goToNextPage}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={setActiveView} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "60px" }}>
          <h2 className="fw-bold text-primary text-center mb-4">
            Gestión de Constants
          </h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ConstantsManagement;
