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

      localStorage.setItem("reset_email", email);

      router.push("/resetpassword");
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div 
      className="forgot-password-container d-flex justify-content-center align-items-center"
    >
      <div className="card p-5 shadow-lg forgot-password-card">
        <h4 className="text-start fw-bold" style={{ color: "#5cb5c3" }}>
          Recuperar contraseña
        </h4>
        <p 
          className="text-start" 
          style={{ color: "#d3d3d3", marginBottom: "1.5rem" }}
        >
          Ingresa tu correo electrónico para recuperar tu contraseña
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label 
              className="form-label fw-bold" 
              style={{ textAlign: "left", display: "block", marginBottom: "0.5rem", color: "#000" }}
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
                border: "2px solid #d3d3d3",
                borderRadius: "0.5rem",
              }}
            />
          </div>
          <button 
            type="submit" 
            className="btn w-100 fw-bold" 
            style={{ borderRadius: "0.5rem", marginBottom: "1.5rem" }}
          >
            Enviar enlace de recuperación
          </button>
        </form>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        <div className="text-center mt-3">
          <a 
            href="/login" 
            className="btn btn-outline-secondary" 
            style={{ borderRadius: "0.5rem" }}
          >
            Regresar
          </a>
        </div>
      </div>

      <style jsx>{`
        .forgot-password-container {
          height: 100vh;
          background: url('/assets/images/background.jpg') no-repeat center center/cover;
          position: relative;
        }
        .forgot-password-card {
          width: 100%;
          max-width: 420px;
          border-radius: 15px;
          background-color: rgba(255, 255, 255, 0.9);
          text-align: left;
        }
        .mb-3 {
          margin-bottom: 1.5rem;
        }
        .form-control {
          font-size: 1rem;
          padding: 10px;
          transition: all 0.3s ease;
        }
        .form-control:focus {
          border-color: #0984e3;
          box-shadow: 0 0 10px rgba(9, 132, 227, 0.2);
        }
        button.btn {
          background-color: #3ca7b7;
          border: none;
          padding: 12px;
          font-size: 1rem;
          transition: background 0.3s ease;
          color: #fff;
        }
        button.btn:hover {
          background-color: #359aa9;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
