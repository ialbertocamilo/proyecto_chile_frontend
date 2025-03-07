import { useState } from "react";
import { useRouter } from "next/router";
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
  role_id: string;
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
    role_id: "2",
  });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  // Se mantiene fieldErrors para otros tipos de error (por ejemplo, contraseñas o duplicación de email)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [sidebarWidth] = useState("300px");

  const CARD_WIDTH = "90%";
  const CARD_MARGIN_LEFT = "20%";
  const CARD_MARGIN_RIGHT = "auto";
  const CARD_MARGIN_TOP = "30px";
  const CARD_MARGIN_BOTTOM = "30px";
  const CARD_BORDER_RADIUS = "16px";
  const CARD_BOX_SHADOW = "0 2px 10px rgba(0,0,0,0.1)";
  const CARD_BORDER_COLOR = "#d3d3d3";
  const CONTAINER_MARGIN_LEFT = "10px";

  const cardStyle = {
    width: CARD_WIDTH,
    margin: `${CARD_MARGIN_TOP} ${CARD_MARGIN_RIGHT} ${CARD_MARGIN_BOTTOM} ${CARD_MARGIN_LEFT}`,
    borderRadius: CARD_BORDER_RADIUS,
    boxShadow: CARD_BOX_SHADOW,
    border: `1px solid ${CARD_BORDER_COLOR}`,
    padding: "20px",
    backgroundColor: "#fff",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = e.target.value;

    // Filtrar caracteres para el campo "number_phone"
    if (e.target.name === "number_phone") {
      // Permitir solo dígitos, +, -, paréntesis y espacios
      value = value.replace(/[^0-9+\-\(\)\s]/g, "");
    }

    // Filtrar caracteres para el campo "ubigeo"
    if (e.target.name === "ubigeo") {
      // Permitir solo dígitos
      value = value.replace(/[^0-9]/g, "");
    }

    console.log(`[handleChange] ${e.target.name} cambiado a:`, value);
    setUserData({ ...userData, [e.target.name]: value });

    // Si el usuario modifica el campo, se remueve el error en ese campo (para otros errores)
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
    // También se limpia el error general
    if (generalError) {
      setGeneralError(null);
    }
  };

  // Función auxiliar para renderizar el label con asterisco si el campo está vacío
  const renderLabel = (label: string, fieldName: keyof UserFormData) => (
    <>
      {label}{" "}
      {userData[fieldName].trim() === "" && (
        <span style={{ color: "red" }}>*</span>
      )}
    </>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    // Validar campos requeridos: si alguno está vacío, se evita el envío (solo se muestra el asterisco en el label)
    const requiredFields: (keyof UserFormData)[] = [
      "name",
      "lastname",
      "email",
      "number_phone",
      "birthdate",
      "country",
      "ubigeo",
      "password",
      "confirm_password",
      "role_id",
    ];

    const missingFields = requiredFields.filter(
      (field) => !userData[field].trim()
    );
    if (missingFields.length > 0) {
      return;
    }

    // Validar que las contraseñas coincidan
    if (userData.password.trim() && userData.confirm_password.trim() && userData.password !== userData.confirm_password) {
      setFieldErrors({ confirm_password: "Las contraseñas no coinciden." });
      return;
    } else {
      setFieldErrors({});
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión nuevamente.");
      }
      const bodyToSend = {
        ...userData,
        role_id: Number(userData.role_id),
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
        const message =
          errorData.detail || errorData.message || "No se pudo crear el usuario";
        // Si el error está relacionado al correo, se muestra debajo del campo email
        if (
          message.toLowerCase().includes("correo") ||
          message.toLowerCase().includes("email")
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email:
              "El correo ingresado ya se encuentra registrado. Por favor, use otro correo.",
          }));
        } else {
          setGeneralError(message);
        }
        return;
      }

      // Redirigir sin alerta de éxito
      router.push("/user-management");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al crear usuario";
      console.error("[handleSubmit] Error:", message);
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: "150px",
          width: "100%",
          fontFamily: "var(--font-family-base)",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div
          className="container p-4"
          style={{ marginTop: "80px", marginLeft: CONTAINER_MARGIN_LEFT }}
        >
          {/* Card para el Título */}
          <div style={cardStyle}>
            <h2
              style={{
                color: "black",
                margin: 0,
                fontFamily: "var(--font-family-base)",
              }}
            >
              Registro de Usuario
            </h2>
          </div>

          {/* Card para el Formulario */}
          <div style={cardStyle}>
            {generalError && (
              <p
                className="text-danger fw-bold"
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                {generalError}
              </p>
            )}
            {loading ? (
              <p
                className="text-primary"
                style={{ fontFamily: "var(--font-family-base)" }}
              >
                Cargando...
              </p>
            ) : (
              <form id="userCreateForm" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <label>{renderLabel("Nombre", "name")}</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={userData.name}
                      onChange={handleChange}
                    />
                    {/* No se muestran mensajes de error para campos vacíos */}
                  </div>
                  <div className="col-md-6">
                    <label>{renderLabel("Apellidos", "lastname")}</label>
                    <input
                      type="text"
                      name="lastname"
                      className="form-control"
                      value={userData.lastname}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <label>{renderLabel("Email", "email")}</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={userData.email}
                      onChange={handleChange}
                    />
                    {fieldErrors.email && (
                      <small className="text-danger d-block">
                        {fieldErrors.email}
                      </small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label>{renderLabel("Teléfono", "number_phone")}</label>
                    <input
                      type="text"
                      name="number_phone"
                      className="form-control"
                      value={userData.number_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <label>{renderLabel("Fecha de Nacimiento", "birthdate")}</label>
                    <input
                      type="date"
                      name="birthdate"
                      className="form-control"
                      value={userData.birthdate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>{renderLabel("País", "country")}</label>
                    <input
                      type="text"
                      name="country"
                      className="form-control"
                      value={userData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <label>{renderLabel("Contraseña", "password")}</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={userData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>{renderLabel("Ubigeo", "ubigeo")}</label>
                    <input
                      type="text"
                      name="ubigeo"
                      className="form-control"
                      value={userData.ubigeo}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <label>{renderLabel("Confirmar Contraseña", "confirm_password")}</label>
                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      value={userData.confirm_password}
                      onChange={handleChange}
                    />
                    {fieldErrors.confirm_password && (
                      <small className="text-danger d-block">
                        {fieldErrors.confirm_password}
                      </small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label>{renderLabel("Rol", "role_id")}</label>
                    <select
                      name="role_id"
                      className="form-control"
                      value={userData.role_id}
                      onChange={handleChange}
                    >
                      <option value="1">Administrador</option>
                      <option value="2">Operador</option>
                    </select>
                  </div>
                </div>

                {/* Mensaje de campos obligatorios */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <p style={{ textAlign: "left", margin: 0 }}>
                    (<span style={{ color: "red" }}>*</span>) Campos Obligatorios
                  </p>
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
                    >
                      {loading ? "Creando..." : "Crear"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <style jsx>{`
          .card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            border: none;
          }

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
    </div>
  );
};

export default UserCreate;
