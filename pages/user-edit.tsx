import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2"; 
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";

type User = {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  active?: boolean;
  is_deleted?: boolean;
};

const UserEdit = () => {
  const router = useRouter();
  const { id } = router.query; 

  const [user, setUser] = useState<User | null>(null);
  const [roleId, setRoleId] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState("300px");

  useEffect(() => {
    if (!router.isReady) return;
    if (id) {
      fetchUser();
    }
  }, [router.isReady, id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión.");
      }

      const response = await fetch(
        `http://deuman-backend.svgdev.tech/users/?limit=1000&num_pag=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status (GET users):", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text (GET users):", errorText);
        throw new Error("Error al obtener los usuarios");
      }

      const data = await response.json();
      console.log("Respuesta completa:", data);
      
      const usersArray: User[] =
        data.users && Array.isArray(data.users)
          ? data.users
          : Array.isArray(data)
          ? data
          : [];

      const foundUser = usersArray.find((u) => u.id.toString() === id);
      if (!foundUser) {
        throw new Error("No se encontró información del usuario.");
      }
      setUser(foundUser);

      setRoleId(foundUser.role_id || 0);
      setActive(foundUser.active ?? true);
      setIsDeleted(foundUser.is_deleted ?? false);
    } catch (err: any) {
      console.error("Fetch user error:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión.");
      }

      const payload = {
        role_id: roleId,
        active: active,
        is_deleted: isDeleted,
      };

      console.log("Payload to update:", payload);

      const response = await fetch(`http://deuman-backend.svgdev.tech/user/${id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status (PUT update):", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update error response:", errorData);
        const errorMsg =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail || errorData);
        throw new Error(errorMsg || "Error al actualizar el usuario");
      }

      Swal.fire({
        title: "¡Actualización exitosa!",
        text: "Usuario actualizado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.push("/user-management");
      });
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      console.error("Handle submit error:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Error desconocido",
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: "#6dbdc9", margin: 0 }}>
              Editar Usuario
            </h2>
            <div className="d-flex" style={{ gap: "1rem" }}>
              <Button
                text="← Cancelar"
                onClick={() => router.push("/user-management")}
                className="btn-secondary"
              />
              <button
                type="submit"
                form="userEditForm"
                className="btn"
                disabled={loading}
                style={{
                  backgroundColor: "#3ca7b7",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "12px",
                  fontSize: "1rem",
                  transition: "background 0.3s ease",
                  color: "#fff",
                }}
              >
                {loading ? "Actualizando..." : "Actualizar Usuario"}
              </button>
            </div>
          </div>
          {loading && <p>Cargando...</p>}
          {error && <p className="text-danger">{error}</p>}
          {user ? (
            <form id="userEditForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Nombre</label>
                <input type="text" className="form-control" value={user.name} readOnly />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input type="email" className="form-control" value={user.email} readOnly />
              </div>
              <div className="mb-3">
                <label>Role ID (solo se permite 1 o 2)</label>
                <input
                  type="number"
                  className="form-control"
                  value={roleId}
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (value > 2) value = 2;
                    if (value < 1) value = 1;
                    setRoleId(value);
                  }}
                  required
                  max={2}
                  min={1}
                />
                <small className="text-muted">Solo se permiten los valores 1 y 2.</small>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="activeCheck">
                  Activo
                </label>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="deletedCheck"
                  checked={isDeleted}
                  onChange={(e) => setIsDeleted(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="deletedCheck">
                  Eliminado
                </label>
              </div>
            </form>
          ) : (
            !loading && <p>No se encontró información del usuario.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
