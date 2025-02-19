import "../public/assets/css/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import CustomButton from "../src/components/common/CustomButton";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { push } = useRouter();

  // Verifica si el usuario está logeado y redirige a /dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      push("/dashboard");
    }
  }, [push]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const requestBody = { email, password };

    console.log("Enviando datos al backend:", requestBody);

    try {
      const response = await fetch(`${constantUrlApiEndpoint}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Credenciales incorrectas.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("user_name", data.name || "Usuario");

      console.log("Token guardado:", data.token);
      console.log("Email guardado para 2FA:", email);
      console.log("Nombre del usuario guardado:", data.name);

      setTimeout(() => {
        push("/twofactorauth");
      }, 200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error al iniciar sesión:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        height: "100vh",
        background: "url('/assets/images/background.jpg') no-repeat center center/cover",
        fontFamily: "var(--font-family-base)",
      }}
    >
      <div
        className="card p-5 shadow-lg forgot-password-card"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "15px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textAlign: "left",
        }}
      >
        <h5
          className="fw-bold"
          style={{
            color: "var(--primary-color)",
            textAlign: "left",
            fontFamily: "var(--font-family-base)",
          }}
        >
          Ingresa a tu cuenta
        </h5>
        <p
          style={{
            textAlign: "left",
            color: "var(--muted-text)",
            fontFamily: "var(--font-family-base)",
            fontSize: "var(--font-size-base)",
          }}
        >
          Ingresa tu Email y contraseña para acceder
        </p>
        {error && <p className="text-danger text-center fw-bold">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{
                textAlign: "left",
                display: "block",
                fontFamily: "var(--font-family-base)",
              }}
            >
              Dirección de Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                border: "2px solid var(--muted-text)",
                borderRadius: "0.5rem",
                fontFamily: "var(--font-family-base)",
                fontSize: "var(--font-size-base)",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{
                textAlign: "left",
                display: "block",
                fontFamily: "var(--font-family-base)",
              }}
            >
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: "2px solid var(--muted-text)",
                  borderRadius: "0.5rem",
                  paddingRight: "4rem",
                  fontFamily: "var(--font-family-base)",
                  fontSize: "var(--font-size-base)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "var(--primary-color)",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  fontFamily: "var(--font-family-base)",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              <label
                htmlFor="remember"
                style={{
                  cursor: "pointer",
                  color: "var(--muted-text)",
                  fontFamily: "var(--font-family-base)",
                }}
              >
                Recuérdame
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-decoration-none"
              style={{
                color: "var(--primary-color)",
                fontFamily: "var(--font-family-base)",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <CustomButton
            type="submit"
            variant="save"
            disabled={loading}
            style={{
              borderRadius: "0.5rem",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-base)",
              width: "100%",
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </CustomButton>
        </form>

        <div className="text-center mt-4">
          <p style={{ color: "var(--muted-text)" }} className="text-muted">
            ¿Aún no tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-decoration-none"
              style={{
                color: "var(--primary-color)",
                fontFamily: "var(--font-family-base)",
              }}
            >
              Crear una cuenta
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('/assets/images/background.jpg')
            no-repeat center center/cover;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default Login;
