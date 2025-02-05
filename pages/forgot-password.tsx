import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import { useRouter } from "next/router";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/forgot-password", {
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

      // guardar el email en localStorage
      localStorage.setItem("reset_email", email);

      // redirigire a reset-password
      router.push("/resetpassword");
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="forgot-password-container d-flex justify-content-center align-items-center" 
         style={{ height: "100vh", background: "url('/assets/images/background.jpg') no-repeat center center/cover" }}>
      <div className="card p-5 shadow-lg" style={{ width: "100%", maxWidth: "420px", borderRadius: "15px", backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
        <h4 className="text-start text-primary fw-bold">Recuperar contraseña</h4>
        <p className="text-start text-muted mb-4">Ingresa tu correo electrónico para recuperar tu contraseña</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="Example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Enviar enlace de recuperación</button>
        </form>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        <div className="text-center mt-3">
          <a href="/login" className="btn btn-outline-secondary">Regresar</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
