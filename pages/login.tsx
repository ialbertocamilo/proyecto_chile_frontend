import "../public/assets/css/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { useRouter } from "next/router";
import { useState } from "react";
import CustomButton from "../src/components/common/CustomButton";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

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
        router.push("/twofactorauth");
      }, 200);
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
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
        {error && (
          <p className="text-danger text-center fw-bold">{error}</p>
        )}

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
            <a
              href="/forgot-password"
              className="text-decoration-none"
              style={{
                color: "var(--primary-color)",
                fontFamily: "var(--font-family-base)",
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <CustomButton
            type="submit"
            variant="save"
            disabled={loading}
            style={{
              borderRadius: "0.5rem",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-base)",
              width: "100%"
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </CustomButton>
        </form>

        <div className="text-center mt-4">
          <p style={{ color: "var(--muted-text)" }} className="text-muted">
            ¿Aún no tienes cuenta?{" "}
            <a
              href="/register"
              className="text-decoration-none"
              style={{
                color: "var(--primary-color)",
                fontFamily: "var(--font-family-base)",
              }}
            >
              Crear una cuenta
            </a>
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

        .login-card {
          background: #fff;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
          text-align: left;
          position: relative;
          z-index: 2;
        }

        .mb-3 {
          margin-bottom: 1.5rem;
        }

        .form-control {
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: var(--secondary-color);
          box-shadow: 0 0 10px rgba(9, 132, 227, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Login;
