import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";

type MaterialAtributs = {
  name: string;
  density: number;
  conductivity: number;
  [key: string]: any;
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
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  // -- Para la tabla y la paginación --
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

 
  // 1) LISTAR 
  const fetchMaterials = async () => {
    console.log("Fetching materials from backend...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró un token en localStorage.");
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("per_page", "5");
      params.append("name", "materials"); 

      const url = `${constantUrlApiEndpoint}/admin/constants/?${params.toString()}`;
      console.log("URL de materiales:", url);

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
      console.log("Materiales recibidos:", data);

      if (data && Array.isArray(data.constants)) {
        setMaterials(data.constants);
        setCurrentPage(data.page || 1);
        setTotalPages(data.total_pages || 1);
      } else {
        setMaterials([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("Error en fetchMaterials:", error.message);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [currentPage]);

  // 2) CREAR
  const handleCreateMaterial = async () => {
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
        `${constantUrlApiEndpoint}/admin/constants/create`,  //
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

      Swal.fire("Éxito", "Material creado correctamente", "success");
      setIsCreateModalOpen(false);

      setCreateName("Hormigón Armado");
      setCreateDensity(2400);
      setCreateConductivity(1.63);
      setCreateSpecificHeat(920);
      fetchMaterials();
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al crear material", "error");
    }
  };

  // 3) EDITAR 
  const openEditModal = (material: Material) => {
    setEditMaterialId(material.id);
    setEditName(material.atributs.name || "");
    setEditDensity(material.atributs.density || 0);
    setEditConductivity(material.atributs.conductivity || 0);
    const spHeat = material.atributs["specific_heat"] ?? material.atributs["specific heat"] ?? 0;
    setEditSpecificHeat(spHeat);
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async () => {
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

      const url = `${constantUrlApiEndpoint}/admin/constant/${editMaterialId}/update`;
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

      Swal.fire("Éxito", "Material editado correctamente", "success");
      setIsEditModalOpen(false);
      setEditMaterialId(null);
      fetchMaterials();
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al editar material", "error");
    }
  };

  // 4) ELIMINAR
  const handleDeleteMaterial = (material: Material) => {
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
            `${constantUrlApiEndpoint}/admin/constants/${material.id}`,
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

          Swal.fire(
            "Eliminado",
            `El material (ID: ${material.id}) ha sido eliminado.`,
            "success"
          );
          fetchMaterials();
        } catch (error: any) {
          Swal.fire("Error", error.message || "Error al eliminar material", "error");
        }
      }
    });
  };

  // 5) Paginación
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
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
          <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
            Listado de Materiales
          </h2>

          <div className="d-flex justify-content-end mb-3">
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

          {/* Tabla */}
          <div className="table-responsive">
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
                {materials.length > 0 ? (
                  materials.map((m) => {
                    const heatValue =
                      m.atributs["specific_heat"] ?? m.atributs["specific heat"] ?? 0;
                    return (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.atributs.name}</td>
                        <td>{m.atributs.density}</td>
                        <td>{m.atributs.conductivity}</td>
                        <td>{heatValue}</td>
                        <td className="text-center">
                          <div className="action-btn-group">
                            {/* Boton EDITAR abre modal */}
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
                            {/* Boton ELIMINAR */}
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

          {/* Controles de paginacion */}
          <div className="d-flex justify-content-center align-items-center mt-4">
            <CustomButton
              type="button"
              variant="backIcon"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              style={{ fontFamily: "var(--font-family-base)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-family-base)",
                margin: "0 1.5rem",
              }}
            >
              Página {currentPage} de {totalPages}
            </span>
            <CustomButton
              type="button"
              variant="forwardIcon"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{ fontFamily: "var(--font-family-base)" }}
            />
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
              // ancho 
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
              width: "500px", // ancho 
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
