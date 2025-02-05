import "../public/assets/css/globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useRouter } from "next/router";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const requestBody = { email, password };

    console.log("📤 Enviando datos al backend:", requestBody);

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("✅ Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Credenciales incorrectas.");
      }

      // guardar los datos en localStorage
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
        <h5 className="text-primary fw-bold text-center">Ingresa a tu cuenta</h5>
        <p className="text-muted text-center">Ingresa tu Email y contraseña para acceder</p>
        {error && <p className="text-danger text-center fw-bold">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Dirección de Email</label>
            <input 
              type="email" 
              className="form-control rounded-pill" 
              placeholder="Example@gmail.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3 position-relative">
            <label className="form-label fw-semibold">Contraseña</label>
            <div className="d-flex align-items-center">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control rounded-pill"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span 
                className="ms-2 text-primary fw-bold" 
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="text-center mt-3">
          <a href="/forgot-password" className="text-decoration-none text-primary">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="text-center mt-4">
          <p className="text-muted">
            ¿Aún no tienes cuenta? 
            <a href="/register" className="text-decoration-none text-primary"> Crear una cuenta</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('/assets/images/background.jpg') no-repeat center center/cover;
          position: relative;
        }

        .login-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .form-control {
          font-size: 1rem;
          padding: 10px;
          border: 2px solid #74b9ff;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #0984e3;
          box-shadow: 0 0 10px rgba(9, 132, 227, 0.2);
        }

        .btn-primary {
          background-color: #74b9ff;
          border: none;
          padding: 12px;
          font-size: 1rem;
          transition: background 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #0984e3;
        }
      `}</style>
    </div>
  );
};

export default Login;
