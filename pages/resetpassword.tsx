import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import Link from "next/link";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Estados para mostrar/ocultar contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("reset_email");
    if (storedEmail) {
      setFormData((prevData) => ({ ...prevData, email: storedEmail }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_new_password) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(`${constantUrlApiEndpoint}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al restablecer la contraseña");
      }

      // Mostrar alerta de éxito con SweetAlert2 y redireccionar
      await Swal.fire({
        icon: "success",
        title: "Contraseña cambiada exitosamente",
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          popup: "rounded-swal"
        }
      });
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    }
  };

  const inputStyle = {
    border: "2px solid var(--muted-text)",
    borderRadius: "0.5rem",
    padding: "0.5rem",
    margin: 0,
    fontFamily: "var(--font-family-base)",
    fontSize: "var(--font-size-base)",
  };

  const spacingStyle = { marginBottom: "0.5rem" };

  const labelStyle = {
    marginBottom: "0.25rem",
    fontWeight: "bold",
    color: "var(--text-color)",
    fontFamily: "var(--font-family-base)",
  };

  const regresarButtonStyle = {
    border: "none",
    backgroundColor: "transparent",
    color: "var(--primary-color)",
    fontSize: "var(--font-size-base)",
    cursor: "pointer",
    textDecoration: "none" as const,
    fontFamily: "var(--font-family-base)",
  };

  return (
    <div
      className="reset-password-container d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "url('/assets/images/background.jpg') no-repeat center center/cover",
        fontFamily: "var(--font-family-base)",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "15px",
          backgroundColor: "#fff",
        }}
      >
        <h4
          className="text-start fw-bold"
          style={{
            color: "var(--primary-color)",
            marginBottom: "0.5rem",
            fontFamily: "var(--font-family-base)",
          }}
        >
          Restablecer contraseña
        </h4>
        <p
          className="text-start"
          style={{
            color: "var(--muted-text)",
            marginBottom: "1rem",
            fontFamily: "var(--font-family-base)",
          }}
        >
          Ingresa tu correo, el código de verificación y tu nueva contraseña
        </p>
        <form onSubmit={handleSubmit}>
          <div style={spacingStyle}>
            <label className="form-label fw-bold" style={labelStyle}>
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
              style={inputStyle}
            />
          </div>
          <div style={spacingStyle}>
            <label className="form-label fw-bold" style={labelStyle}>
              Código de verificación
            </label>
            <input
              type="text"
              className="form-control"
              name="code"
              placeholder="Código recibido"
              value={formData.code}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={spacingStyle}>
            <label className="form-label fw-bold" style={labelStyle}>
              Nueva contraseña
            </label>
            <div className="input-group">
              <input
                type={showNewPassword ? "text" : "password"}
                className="form-control"
                name="new_password"
                placeholder="••••••••"
                value={formData.new_password}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <button
                type="button"
                className="btn"
                style={{ border: "none", background: "transparent" }}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <div style={spacingStyle}>
            <label className="form-label fw-bold" style={labelStyle}>
              Confirmar nueva contraseña
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                name="confirm_new_password"
                placeholder="••••••••"
                value={formData.confirm_new_password}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <button
                type="button"
                className="btn"
                style={{ border: "none", background: "transparent" }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              borderRadius: "0.5rem",
              backgroundColor: "var(--primary-color)",
              border: "none",
              padding: "12px",
              fontSize: "var(--font-size-base)",
              transition: "background 0.3s ease",
              color: "#fff",
              fontFamily: "var(--font-family-base)",
            }}
          >
            Restablecer contraseña
          </button>
        </form>
        {error && (
          <p className="text-danger text-center mt-3" style={{ fontFamily: "var(--font-family-base)" }}>
            {error}
          </p>
        )}
        <div className="text-center mt-3">
          <Link href="/login" style={regresarButtonStyle}>
            ← Regresar
          </Link>
        </div>
      </div>

      <style jsx>{`
        .reset-password-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('/assets/images/background.jpg') no-repeat center center/cover;
          position: relative;
        }
        a:hover {
          color: var(--secondary-color);
        }
      `}</style>
      {/* Estilos globales para SweetAlert2 */}
      <style jsx global>{`
        .swal2-popup.rounded-swal {
          border-radius: 1rem !important;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
