import { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";

const ConstantCreate = () => {
  const router = useRouter();

  const [constantData, setConstantData] = useState({
    material: "",
    property: {
      density: "",
      conductivity: "",
      specific_heat: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejo de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConstantData({
      ...constantData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo de cambios en el objeto `property`
  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConstantData({
      ...constantData,
      property: {
        ...constantData.property,
        [e.target.name]: e.target.value,
      },
    });
  };

  // Enviar datos al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Inicia sesión.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/constants/create", {
        method: "POST",
        mode: "cors", // 🔥 Solución para CORS
        credentials: "include", // 🔥 Solución adicional para CORS
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(constantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear la constante");
      }

      alert("✅ Constante creada correctamente");
      router.push("/constants-management");
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} />
      <div className="d-flex flex-column flex-grow-1">
        <TopBar />
        <div className="container mt-4">
          <h2 className="fw-bold text-primary text-center mb-4">Crear Nueva Constante</h2>

          <div className="mb-4">
            <Button
              text="Volver a Gestión de Constantes"
              onClick={() => router.push("/constants-management")}
              className="btn-secondary"
            />
          </div>

          {error && <p className="text-danger fw-bold">{error}</p>}
          {loading ? <p className="text-primary">Cargando...</p> : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Material</label>
                <input
                  type="text"
                  name="material"
                  className="form-control"
                  value={constantData.material}
                  onChange={handleChange}
                  required
                />
              </div>

              <h5>Propiedades del Material</h5>
              <div className="mb-3">
                <label>Densidad</label>
                <input
                  type="number"
                  name="density"
                  className="form-control"
                  value={constantData.property.density}
                  onChange={handlePropertyChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Conductividad</label>
                <input
                  type="number"
                  name="conductivity"
                  className="form-control"
                  value={constantData.property.conductivity}
                  onChange={handlePropertyChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Calor Específico</label>
                <input
                  type="number"
                  name="specific_heat"
                  className="form-control"
                  value={constantData.property.specific_heat}
                  onChange={handlePropertyChange}
                  required
                />
              </div>

              <div className="text-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creando..." : "Crear Constante"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstantCreate;
