import { useState, useEffect, useCallback } from "react";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";

type MaterialAtributs = {
  name: string;
  density: number;
  conductivity: number;
  [key: string]: unknown;
};

type Material = {
  id: number;
  name: string;
  type: string;
  create_status: string;
  is_deleted: boolean;
  atributs: MaterialAtributs;
};

const ConstantsManagement = () => {
  // Validamos la sesión usando el hook personalizado
  useAuth();
  console.log("[ConstantsManagement] Sesión validada y página cargada.");

  // Se elimina router ya que no se utiliza.
  const [sidebarWidth, ] = useState("300px");

  // -- Para la tabla (se muestran todos los materiales sin paginación) --
  const [materials, setMaterials] = useState<Material[]>([]);

  // -- Estado para búsqueda --
  const [searchQuery, setSearchQuery] = useState("");

  // -- Modal CREAR --
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("Hormigón Armado");
  const [createDensity, setCreateDensity] = useState(2400);
  const [createConductivity, setCreateConductivity] = useState(1.63);
  const [createSpecificHeat, setCreateSpecificHeat] = useState(920);

  // -- Modal EDITAR --
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDensity, setEditDensity] = useState<number>(0);
  const [editConductivity, setEditConductivity] = useState<number>(0);
  const [editSpecificHeat, setEditSpecificHeat] = useState<number>(0);

  // 1) LISTAR TODOS LOS MATERIALES
  const fetchMaterials = useCallback(async () => {
    console.log("[fetchMaterials] Obteniendo todos los materiales desde el backend...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("[fetchMaterials] No se encontró un token en localStorage.");
      return;
    }
    try {
      // Se omiten parámetros de paginación para traer todos los materiales
      const params = new URLSearchParams();
      params.append("name", "materials");

      const url = `${constantUrlApiEndpoint}/constants/?page=1&per_page=500`;
      console.log("[fetchMaterials] URL de materiales:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los materiales");
      }

      const data = await response.json();
      console.log("[fetchMaterials] Materiales recibidos:", data);

      if (data && Array.isArray(data.constants)) {
        setMaterials(data.constants);
      } else {
        setMaterials([]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      console.error("[fetchMaterials] Error:", message);
      Swal.fire("Error", "Error al obtener materiales. Ver consola.", "error");
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // 2) CREAR
  const handleCreateMaterial = async () => {
    console.log("[handleCreateMaterial] Creando material...");
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No se encontró token", "error");
      return;
    }
    try {
      const bodyPayload = {
        atributs: {
          name: createName,
          density: createDensity,
          conductivity: createConductivity,
          specific_heat: createSpecificHeat,
        },
        name: "materials",
        type: "definition materials",
      };

      const response = await fetch(
        `${constantUrlApiEndpoint}/constants/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear el material");
      }

      console.log("[handleCreateMaterial] Material creado correctamente.");
      Swal.fire("Éxito", "Material creado correctamente", "success");
      setIsCreateModalOpen(false);

      // Reiniciamos los valores por defecto
      setCreateName("Hormigón Armado");
      setCreateDensity(2400);
      setCreateConductivity(1.63);
      setCreateSpecificHeat(920);
      fetchMaterials();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear material";
      console.error("[handleCreateMaterial] Error:", message);
      Swal.fire("Error", message, "error");
    }
  };

  // 3) EDITAR 
  const openEditModal = (material: Material) => {
    console.log("[openEditModal] Abriendo modal para editar material:", material.id);
    setEditMaterialId(material.id);
    setEditName(material.atributs.name);
    setEditDensity(material.atributs.density);
    setEditConductivity(material.atributs.conductivity);
    const spHeat = Number(
      material.atributs["specific_heat"] ??
      material.atributs["specific heat"] ??
      0
    );
    setEditSpecificHeat(spHeat);
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async () => {
    console.log("[handleUpdateMaterial] Actualizando material:", editMaterialId);
    if (!editMaterialId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No se encontró token", "error");
      return;
    }
    try {
      const bodyPayload = {
        atributs: {
          name: editName,
          density: editDensity,
          conductivity: editConductivity,
          specific_heat: editSpecificHeat,
        },
        name: "materials",
        type: "definition materials",
      };

      const url = `${constantUrlApiEndpoint}/constant/${editMaterialId}/update`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error("Error al editar el material");
      }

      console.log("[handleUpdateMaterial] Material actualizado correctamente.");
      Swal.fire("Éxito", "Material editado correctamente", "success");
      setIsEditModalOpen(false);
      setEditMaterialId(null);
      fetchMaterials();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al editar material";
      console.error("[handleUpdateMaterial] Error:", message);
      Swal.fire("Error", message, "error");
    }
  };

  // 4) ELIMINAR
  const handleDeleteMaterial = (material: Material) => {
    console.log("[handleDeleteMaterial] Solicitando eliminación del material:", material.id);
    Swal.fire({
      title: "Confirmar eliminación",
      text: `¿Estás seguro de eliminar el material (ID: ${material.id}) ${material.atributs.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            Swal.fire("Error", "No se encontró token", "error");
            return;
          }
          const resp = await fetch(
            `${constantUrlApiEndpoint}/constant/${material.id}/delete`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!resp.ok) {
            throw new Error("Error al eliminar el material");
          }

          console.log("[handleDeleteMaterial] Material eliminado correctamente:", material.id);
          Swal.fire(
            "Eliminado",
            `El material (ID: ${material.id}) ha sido eliminado.`,
            "success"
          );
          fetchMaterials();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Error al eliminar material";
          console.error("[handleDeleteMaterial] Error:", message);
          Swal.fire("Error", message, "error");
        }
      }
    });
  };

  // Filtrado de materiales basado en la búsqueda
  const filteredMaterials = materials.filter((material) => {
    const query = searchQuery.toLowerCase();
    const { id, atributs } = material;
    const name = atributs.name?.toLowerCase() || "";
    const density = atributs.density?.toString() || "";
    const conductivity = atributs.conductivity?.toString() || "";
    const specificHeat =
      (atributs.specific_heat || atributs["specific heat"])?.toString() || "";
    return (
      id.toString().includes(query) ||
      name.includes(query) ||
      density.includes(query) ||
      conductivity.includes(query) ||
      specificHeat.includes(query)
    );
  });

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}}/>
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: "100px",
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />

        <div className="container p-4" style={{ marginTop: "60px" }}>
          <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
            Listado de Materiales
          </h2>

          {/* Fila superior con buscador y botón de crear */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "0.5rem",
                fontSize: "var(--font-size-base)",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "300px",
              }}
            />
            <CustomButton
              type="button"
              variant="save"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-base)",
              }}
            >
              Crear Material
            </CustomButton>
          </div>

          {/* Tabla con scroll interno */}
          <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Densidad</th>
                  <th>Conductividad</th>
                  <th>Calor Específico</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((m) => {
                    const heatValue = Number(
                      m.atributs["specific_heat"] ??
                      m.atributs["specific heat"] ??
                      0
                    );
                    return (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.atributs.name}</td>
                        <td>{m.atributs.density}</td>
                        <td>{m.atributs.conductivity}</td>
                        <td>{heatValue}</td>
                        <td className="text-center">
                          <div className="action-btn-group">
                            <CustomButton
                              variant="editIcon"
                              onClick={() => openEditModal(m)}
                              className="action-btn"
                              style={{
                                backgroundColor: "var(--primary-color)",
                                border: `2px solid var(--primary-color)`,
                                fontFamily: "var(--font-family-base)",
                                padding: "0.5rem",
                                width: "40px",
                                height: "40px",
                              }}
                            />
                            <CustomButton
                              variant="deleteIcon"
                              onClick={() => handleDeleteMaterial(m)}
                              className="action-btn"
                              style={{
                                fontFamily: "var(--font-family-base)",
                                padding: "0.5rem",
                                width: "40px",
                                height: "40px",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No hay materiales creados o la lista está vacía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -------- MODAL CREAR -------- */}
      {isCreateModalOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "500px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>Crear nuevo material</h3>

            <div className="mb-3">
              <label>Nombre</label>
              <input
                type="text"
                className="form-control"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label>Densidad</label>
              <input
                type="number"
                className="form-control"
                value={createDensity}
                onChange={(e) => setCreateDensity(Number(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label>Conductividad</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                value={createConductivity}
                onChange={(e) => setCreateConductivity(Number(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label>Calor Específico</label>
              <input
                type="number"
                className="form-control"
                value={createSpecificHeat}
                onChange={(e) => setCreateSpecificHeat(Number(e.target.value))}
              />
            </div>

            <div className="d-flex justify-content-end" style={{ gap: "0.5rem" }}>
              <CustomButton
                variant="back"
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                Cancelar
              </CustomButton>
              <CustomButton
                variant="save"
                type="button"
                onClick={handleCreateMaterial}
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                Crear
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* -------- MODAL EDITAR -------- */}
      {isEditModalOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "500px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>Editar material</h3>

            <div className="mb-3">
              <label>Nombre</label>
              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label>Densidad</label>
              <input
                type="number"
                className="form-control"
                value={editDensity}
                onChange={(e) => setEditDensity(Number(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label>Conductividad</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                value={editConductivity}
                onChange={(e) => setEditConductivity(Number(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label>Calor Específico</label>
              <input
                type="number"
                className="form-control"
                value={editSpecificHeat}
                onChange={(e) => setEditSpecificHeat(Number(e.target.value))}
              />
            </div>

            <div className="d-flex justify-content-end" style={{ gap: "0.5rem" }}>
              <CustomButton
                variant="back"
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                Cancelar
              </CustomButton>
              <CustomButton
                variant="save"
                type="button"
                onClick={handleUpdateMaterial}
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                Guardar
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .action-btn-group {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
        }
        .custom-table {
          width: 100%;
          border: 1px solid #ddd;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff !important;
          border-radius: 8px;
          overflow: hidden;
          font-family: var(--font-family-base);
        }
        .custom-table th,
        .custom-table td {
          border: none;
          padding: 8px;
        }
        .custom-table th {
          color: var(--primary-color);
          font-weight: bold;
          border-bottom: 1px solid #ddd;
          background-color: #fff !important;
          font-family: var(--font-family-base);
        }
      `}</style>
    </div>
  );
};

export default ConstantsManagement;
