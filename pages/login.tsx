import "../public/assets/css/button-builder.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@example.com" && password === "password123") {
      router.push("/admin");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const doLogin = () => {
    console.log('doLogin');
    axios.post('http://127.0.0.1:8000/login', {
      email: email,
      password: password
    })
    .then(function (response) { 
      console.log(response.data);
      if(response.status === 200){
        router.push("/admin");
      }else{
        setError("Credenciales incorrectas");
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  return (
    <div className="login-container d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#eef7fc" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="text-center mb-4">
          <img src="/assets/images/proyecto-deuman-logo.png" alt="Proyecto Deuman" className="img-fluid" style={{ maxWidth: "150px" }} />
        </div>
        <h5 className="text-start text-primary">Ingresa a tu cuenta</h5>
        <p className="text-start text-muted">Ingresa tu Email y contraseña para ingresar</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Selecciona el país</label>
            <select className="form-control">
              <option>Perú</option>
              <option>México</option>
              <option>Argentina</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Dirección de Email</label>
            <input type="email" className="form-control" placeholder="Example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3 position-relative">
            <label className="form-label">Contraseña</label>
            <div className="d-flex align-items-center">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span 
                className="ms-2 text-primary" 
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </span>
            </div>
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label">Recuérdame</label>
          </div>
          <button type="submit" className="btn btn-primary w-100">Ingresar</button>
        </form>
        <div className="text-start mt-3">
          <a href="/forgot-password" className="text-decoration-none text-primary">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="text-start mt-4">
          <p className="text-muted">Aún no tienes cuenta? <a href="/register" className="text-decoration-none text-primary">Crear una cuenta</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;