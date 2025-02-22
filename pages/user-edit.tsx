import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2"; 
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión.");
      }

      const response = await fetch(
        `${constantUrlApiEndpoint}/users/?limit=1000&num_pag=1`,
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("Fetch user error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!router.isReady) return;
    if (id) {
      fetchUser();
    }
  }, [router.isReady, id, fetchUser]);

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
      };

      console.log("Payload to update:", payload);

      const response = await fetch(`${constantUrlApiEndpoint}/user/${id}/update`, {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      console.error("Handle submit error:", message);
      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    Swal.fire({
      title: "Confirmar eliminación",
      text: `¿Estás seguro de eliminar el usuario ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Error", "No se encontró token", "error");
          return;
        }
        try {
          const response = await fetch(
            `${constantUrlApiEndpoint}/user/${user.id}/delete`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Error al eliminar usuario");
          }
          Swal.fire(
            "Eliminado",
            `El usuario ${user.name} ha sido eliminado.`,
            "success"
          ).then(() => {
            router.push("/user-management");
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Error desconocido";
          Swal.fire("Error", message, "error");
        }
      }
    });
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2
              className="fw-bold"
              style={{
                color: "var(--primary-color)",
                margin: 0,
                fontFamily: "var(--font-family-base)",
              }}
            >
              Editar Usuario
            </h2>
            <div className="d-flex" style={{ gap: "1rem" }}>
              <CustomButton
                variant="backIcon"
                onClick={() => router.push("/user-management")}
              >
                Regresar
              </CustomButton>
              <CustomButton
                variant="deleteIcon"
                onClick={handleDeleteUser}
                disabled={loading}
              >
                Eliminar
              </CustomButton>
              <CustomButton
                variant="save"
                type="submit"
                form="userEditForm"
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Actualizar Usuario"}
              </CustomButton>
            </div>
          </div>
          {loading && <p style={{ fontFamily: "var(--font-family-base)" }}>Cargando...</p>}
          {error && (
            <p className="text-danger" style={{ fontFamily: "var(--font-family-base)" }}>
              {error}
            </p>
          )}
          {user ? (
            <form id="userEditForm" onSubmit={handleSubmit} style={{ fontFamily: "var(--font-family-base)" }}>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={user.name}
                  readOnly
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={user.email}
                  readOnly
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>Role ID</label>
                <select
                  className="form-control"
                  value={roleId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setRoleId(Number(e.target.value))
                  }
                  required
                  style={{ fontFamily: "var(--font-family-base)" }}
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Operador</option>
                </select>
                <small className="text-muted" style={{ fontFamily: "var(--font-family-base)" }}>
                  Selecciona &quot;Administrador&quot; o &quot;Usuario&quot;.
                </small>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="activeCheck"
                  checked={active}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActive(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="activeCheck" style={{ fontFamily: "var(--font-family-base)" }}>
                  Activo
                </label>
              </div>
            </form>
          ) : (
            !loading && <p style={{ fontFamily: "var(--font-family-base)" }}>No se encontró información del usuario.</p>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-btn {
          background-color: var(--primary-color) !important;
          border: 2px solid var(--primary-color) !important;
          border-radius: 0.5rem !important;
          padding: 12px !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #fff !important;
          cursor: pointer;
          font-family: var(--font-family-base) !important;
        }
        .custom-btn:hover {
          background-color: var(--secondary-color) !important;
          border-color: var(--secondary-color) !important;
        }
        .btn-secondary {
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
        }
      `}</style>
    </div>
  );
};

export default UserEdit;
