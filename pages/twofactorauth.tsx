import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      setError("No se encontró el email. Inicia sesión nuevamente.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email) {
      setError("El email no está definido. Vuelve a iniciar sesión.");
      setLoading(false);
      return;
    }

    const requestBody = { email, otp: otp.toString() };
    console.log("Enviando código al backend:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/2fa-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Respuesta completa del backend:", response);

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        console.error("Error en la verificación:", data);
        throw new Error(data.detail || "Código incorrecto.");
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        console.log("Token almacenado correctamente:", data.access_token);
      } else {
        console.error("No se recibió un token válido del backend.");
        throw new Error("No se pudo autenticar el usuario.");
      }

      if (data.user) {
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        console.log("Perfil de usuario guardado correctamente:", data.user);
      } else {
        console.warn("No se recibió información de perfil del usuario.");
      }

      console.log("Autenticación completada. Redirigiendo...");
      localStorage.setItem("isAuthenticated", "true");

      setTimeout(() => {
        router.push("/dashboard");
      }, 200);
    } catch (err: any) {
      console.error("Error en la verificación:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const otpInputStyle = {
    textAlign: "center" as const,
    fontSize: "2rem",
    fontWeight: "bold" as const,
    letterSpacing: "8px",
    width: "100%",
    padding: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    marginBottom: "1rem",
  };

  const submitButtonStyle = {
    backgroundColor: "#3ca7b7",
    border: "none",
    borderRadius: "0.5rem",
    padding: "12px",
    fontSize: "1.1rem",
    transition: "background 0.3s ease",
    color: "#fff",
    width: "100%",
  };

  const regresarButtonStyle = {
    border: "none",
    backgroundColor: "transparent",
    color: "#3ca7b7",
    fontSize: "1rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    textDecoration: "none" as const,
  };

  return (
    <div
      className="twofactor-container d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "url('/assets/images/background.jpg') no-repeat center center/cover",
      }}
    >
      <div
        className="card p-5 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "15px",
          backgroundColor: "#fff",
        }}
      >
        <h5 
          className="fw-bold text-center" 
          style={{ color: "#6dbdc9", marginBottom: "0.5rem" }}
        >
          Autenticación de Dos Pasos
        </h5>
        <p className="text-muted text-center" style={{ marginBottom: "1rem" }}>
          Ingresa el código de 6 dígitos enviado a tu email.
        </p>
        {error && <p className="text-danger text-center fw-bold">{error}</p>}
        <form onSubmit={handleSubmit} className="form-auth">
          <input
            type="text"
            style={otpInputStyle}
            placeholder="******"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            pattern="[0-9]{6}"
            inputMode="numeric"
          />
          <button type="submit" style={submitButtonStyle} disabled={loading}>
            {loading ? "Verificando..." : "Confirmar Código"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <a href="/login" style={regresarButtonStyle}>
            ← Regresar
          </a>
        </div>
      </div>
      <style jsx>{`
        .twofactor-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('/assets/images/background.jpg') no-repeat center center/cover;
        }
        a:hover {
          color: #359aa9;
        }
      `}</style>
    </div>
  );
};

export default TwoFactorAuth;
