import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useRouter } from "next/router";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import CustomButton from "../src/components/common/CustomButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${constantUrlApiEndpoint}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error en el proceso de recuperación de contraseña");
      }

      localStorage.setItem("reset_email", email);
      router.push("/resetpassword");
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    }
  };

  return (
    <div 
      className="forgot-password-container d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "url('/assets/images/background.jpg') no-repeat center center/cover",
        fontFamily: "var(--font-family-base)",
      }}
    >
      <div className="card p-5 shadow-lg forgot-password-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "15px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textAlign: "left",
        }}
      >
        <h4 
          className="text-start fw-bold" 
          style={{ color: "var(--primary-color)", fontFamily: "var(--font-family-base)" }}
        >
          Recuperar contraseña
        </h4>
        <p 
          className="text-start" 
          style={{ color: "var(--muted-text)", marginBottom: "1.5rem", fontFamily: "var(--font-family-base)" }}
        >
          Ingresa tu correo electrónico para recuperar tu contraseña
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label 
              className="form-label fw-bold" 
              style={{ textAlign: "left", display: "block", marginBottom: "0.5rem", color: "#000", fontFamily: "var(--font-family-base)" }}
            >
              Correo electrónico
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
          <CustomButton
            type="submit"
            variant="save"
            style={{
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-base)",
              width: "100%",
            }}
          >
            Enviar enlace de recuperación
          </CustomButton>
        </form>
        {error && <p className="text-danger text-center mt-3" style={{ fontFamily: "var(--font-family-base)" }}>{error}</p>}
        <div className="text-center mt-3">
          <CustomButton
            type="button"
            variant="backIcon"
            onClick={() => router.push("/login")}
            style={{
              borderRadius: "0.5rem",
              fontFamily: "var(--font-family-base)",
              fontSize: "var(--font-size-base)",
            }}
          >
            Regresar
          </CustomButton>
        </div>
      </div>

      <style jsx>{`
        .forgot-password-container {
          height: 100vh;
          background: url('/assets/images/background.jpg') no-repeat center center/cover;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
