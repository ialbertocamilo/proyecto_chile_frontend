import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import { useRouter } from "next/router";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(`Si el correo ${email} está registrado, recibirás un enlace para restablecer tu contraseña.`);
    setEmail("");
  };

  return (
    <div className="forgot-password-container d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#eef7fc" }}>
      <div className="card p-5 shadow" style={{ width: "100%", maxWidth: "420px", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <img src="/assets/images/proyecto-deuman-logo.png" alt="Proyecto CEELA" className="img-fluid" style={{ maxWidth: "150px" }} />
        </div>
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
        {message && <p className="text-success text-center mt-3">{message}</p>}
        <div className="text-center mt-3">
          <p className="text-muted">¿Recordaste tu contraseña? <a href="/login" className="text-decoration-none text-primary">Ingresar</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
