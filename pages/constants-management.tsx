import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";

type Constant = {
  id: number;
  property: {}; 
  material: string;
};

const ConstantsManagement = () => {
  const [constants, setConstants] = useState<Constant[]>([]);
  const [filteredConstants, setFilteredConstants] = useState<Constant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchConstants();
  }, []);

  // Obtener lista de constantes desde la API con token
  const fetchConstants = async () => {
    console.log("📡 Obteniendo constantes...");
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("🔴 No se encontró un token en localStorage.");
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/constants", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📩 Response status:", response.status);
      if (!response.ok) {
        throw new Error("Error al obtener las constantes");
      }

      const data = await response.json();
      console.log("📜 Constantes recibidas:", data);

      const constantsList = Array.isArray(data) ? data : [data];
      setConstants(constantsList);
      setFilteredConstants(constantsList);
    } catch (err: any) {
      console.error("❌ Error en fetchConstants:", err.message);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar constantes por búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = constants.filter((c) =>
      c.material.toLowerCase().includes(query)
    );

    setFilteredConstants(filtered);
  };

  // Eliminar una constante
  const handleDeleteConstant = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta constante?")) return;
    console.log(`🗑 Eliminando constante con ID: ${id}`);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado.");
      return;
    }

    try {
      const response = await fetch(
        `http://deuman-backend.svgdev.tech/constants/${id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔄 Response status:", response.status);
      if (!response.ok) {
        throw new Error("Error al eliminar la constante");
      }

      console.log(`✅ Constante con ID: ${id} eliminada correctamente`);
      setConstants((prevConstants) => prevConstants.filter((c) => c.id !== id));
      setFilteredConstants((prevFiltered) => prevFiltered.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error("❌ Error en handleDeleteConstant:", err.message);
      setError(err.message || "Error desconocido");
    }
  };

  // Redirigir a la página de creación
  const handleCreateNew = () => {
    router.push("/constant-create");
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} />
      <div className="d-flex flex-column flex-grow-1">
        <TopBar />
        <div className="container mt-4">
          <h2 className="fw-bold text-primary text-center mb-4">
            Gestión de Constantes
          </h2>

          {/* Botón para agregar nueva constante */}
          <div className="mb-4 text-center">
            <Button
              text="Agregar Constante"
              onClick={handleCreateNew}
              className="btn-success"
            />
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Buscar por material..."
              className="form-control"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Tabla de constantes */}
          {loading ? (
            <p className="text-primary">Cargando...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Material</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConstants.length > 0 ? (
                    filteredConstants.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.material}</td>
                        <td className="text-center">
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
                      <td colSpan={3} className="text-center text-muted">
                        No hay constantes disponibles o no coinciden con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstantsManagement;
