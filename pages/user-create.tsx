import { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";
import "../public/assets/css/globals.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import useAuth from "../src/hooks/useAuth";

interface UserFormData {
  name: string;
  lastname: string;
  email: string;
  number_phone: string;
  birthdate: string;
  country: string;
  ubigeo: string;
  password: string;
  confirm_password: string;
  role_id: string; // Se usa string para el select y luego se convertirá a número
}

const UserCreate = () => {
  // Validar sesión
  useAuth();
  console.log("[UserCreate] Página cargada y sesión validada.");

  const router = useRouter();
  const [userData, setUserData] = useState<UserFormData>({
    name: "",
    lastname: "",
    email: "",
    number_phone: "",
    birthdate: "",
    country: "",
    ubigeo: "",
    password: "",
    confirm_password: "",
    role_id: "2", // Valor por defecto: Operador
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log(`[handleChange] ${e.target.name} cambiado a:`, e.target.value);
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const {
      name,
      lastname,
      email,
      number_phone,
      birthdate,
      country,
      ubigeo,
      password,
      confirm_password,
      role_id,
    } = userData;

    if (
      !name.trim() ||
      !lastname.trim() ||
      !email.trim() ||
      !number_phone.trim() ||
      !birthdate.trim() ||
      !country.trim() ||
      !ubigeo.trim() ||
      !password.trim() ||
      !confirm_password.trim() ||
      !role_id.trim()
    ) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Debe llenar todos los campos antes de continuar.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (password !== confirm_password) {
      Swal.fire({
        title: "Contraseñas no coinciden",
        text: "Las contraseñas ingresadas no coinciden.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión nuevamente.");
      }
      // Convertir role_id a número antes de enviarlo
      const bodyToSend = { 
        ...userData,
        role_id: Number(role_id)
      };

      console.log("[handleSubmit] Enviando datos al backend:", bodyToSend);

      const resp = await fetch(`${constantUrlApiEndpoint}/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        console.error("[handleSubmit] Servidor devolvió un error:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "No se pudo crear el usuario"
        );
      }

      await Swal.fire({
        title: "¡Usuario creado!",
        text: "El usuario se creó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      router.push("/user-management");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear usuario";
      console.error("[handleSubmit] Error:", message);
      setError(message);
      if (
        message.toLowerCase().includes("correo") ||
        message.toLowerCase().includes("email")
      ) {
        Swal.fire({
          title: "Correo ya registrado",
          text: "El correo ingresado ya se encuentra registrado. Por favor, use otro correo.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
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
          fontFamily: "var(--font-family-base)",
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
              Registro de Usuario
            </h2>
            <div className="d-flex gap-2">
              <Button
                text="Volver"
                onClick={() => router.push("/user-management")}
                className="btn-secondary"
              />
              <button
                type="submit"
                form="userCreateForm"
                className="btn custom-create-btn"
                disabled={loading}
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                {loading ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-danger fw-bold" style={{ fontFamily: "var(--font-family-base)" }}>
              {error}
            </p>
          )}
          {loading ? (
            <p className="text-primary" style={{ fontFamily: "var(--font-family-base)" }}>
              Cargando...
            </p>
          ) : (
            <form id="userCreateForm" onSubmit={handleSubmit}>
              <div className="border rounded p-3 mb-3" style={{ fontFamily: "var(--font-family-base)" }}>
                <div className="row">
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Nombre</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={userData.name}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Apellidos</label>
                    <input
                      type="text"
                      name="lastname"
                      className="form-control"
                      value={userData.lastname}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={userData.email}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Teléfono</label>
                    <input
                      type="text"
                      name="number_phone"
                      className="form-control"
                      value={userData.number_phone}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birthdate"
                      className="form-control"
                      value={userData.birthdate}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>País</label>
                    <input
                      type="text"
                      name="country"
                      className="form-control"
                      value={userData.country}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={userData.password}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Ubigeo</label>
                    <input
                      type="text"
                      name="ubigeo"
                      className="form-control"
                      value={userData.ubigeo}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Confirmar Contraseña</label>
                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      value={userData.confirm_password}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontFamily: "var(--font-family-base)" }}>Rol</label>
                    <select
                      name="role_id"
                      className="form-control"
                      value={userData.role_id}
                      onChange={handleChange}
                      style={{ fontFamily: "var(--font-family-base)" }}
                    >
                      <option value="1">Administrador</option>
                      <option value="2">Operador</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-create-btn {
          background-color: var(--primary-color) !important;
          border: none !important;
          border-radius: 0.5rem !important;
          padding: 12px !important;
          font-size: 1rem !important;
          transition: background 0.3s ease !important;
          color: #fff !important;
          cursor: pointer;
          font-family: var(--font-family-base) !important;
        }
        .custom-create-btn:hover {
          background-color: var(--secondary-color) !important;
        }
      `}</style>
    </div>
  );
};

export default UserCreate;
