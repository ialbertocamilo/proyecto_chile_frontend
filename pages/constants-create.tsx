import React, { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";

interface ConstantData {
  atributs: Record<string, unknown>;
  name: string;
  type: string;
}

const ConstantsCreate = () => {
  const router = useRouter();
  const [constantData, setConstantData] = useState<ConstantData>({
    atributs: {},
    name: "string",
    type: "string",
  });
  const [loading, setLoading] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const handleAtributsChange = (key: string, value: string) => {
    setConstantData({
      ...constantData,
      atributs: {
        ...constantData.atributs,
        [key]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Por favor, inicia sesión.");
      }

      const response = await fetch(
        `${constantUrlApiEndpoint}/constants/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(constantData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            errorData.message ||
            "Error al crear la constante"
        );
      }

      const data = await response.json();
      console.log("Constant creada:", data);
      Swal.fire({
        title: "¡Constant creada!",
        text: "La constante se creó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error: any) {
      console.error("Error creando constant:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Error al crear la constante",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth, 
          width: "100%",
        }}
      >
        
        <TopBar sidebarWidth={sidebarWidth} />
        
        <div className="container p-4" style={{ marginTop: "60px" }}>
          {/* Boton de Regresar */}
          <div className="mb-4 text-center">
            <Button
              text="← Regresar"
              onClick={() => router.push("/constants-management")}
              className="btn-secondary"
            />
          </div>
          <h2 className="fw-bold text-primary text-center mb-4">
            Crear Constant
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Campo para 'name' */}
            <div className="mb-3">
              <label htmlFor="constantName" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                id="constantName"
                name="name"
                className="form-control"
                value={constantData.name}
                onChange={(e) =>
                  setConstantData({ ...constantData, name: e.target.value })
                }
                required
              />
            </div>
            {/* Campo para 'type' */}
            <div className="mb-3">
              <label htmlFor="constantType" className="form-label">
                Tipo
              </label>
              <input
                type="text"
                id="constantType"
                name="type"
                className="form-control"
                value={constantData.type}
                onChange={(e) =>
                  setConstantData({ ...constantData, type: e.target.value })
                }
                required
              />
            </div>
            {/* Mostrar campos adicionales si el type es "details_materials" */}
            {constantData.type === "details_materials" && (
              <>
                <div className="mb-3">
                  <label htmlFor="conductividad" className="form-label">
                    Conductividad
                  </label>
                  <input
                    type="text"
                    id="conductividad"
                    name="conductividad"
                    className="form-control"
                    value={
                      (constantData.atributs as any).conductividad || ""
                    }
                    onChange={(e) =>
                      handleAtributsChange("conductividad", e.target.value)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="calor_especifico" className="form-label">
                    Calor específico
                  </label>
                  <input
                    type="text"
                    id="calor_especifico"
                    name="calor_especifico"
                    className="form-control"
                    value={
                      (constantData.atributs as any).calor_especifico || ""
                    }
                    onChange={(e) =>
                      handleAtributsChange("calor_especifico", e.target.value)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="densidad" className="form-label">
                    Densidad
                  </label>
                  <input
                    type="text"
                    id="densidad"
                    name="densidad"
                    className="form-control"
                    value={(constantData.atributs as any).densidad || ""}
                    onChange={(e) =>
                      handleAtributsChange("densidad", e.target.value)
                    }
                  />
                </div>
              </>
            )}
            <div className="text-end">
              <Button
                text={loading ? "Creando..." : "Crear Constant"}
                onClick={() => {}}
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConstantsCreate;
