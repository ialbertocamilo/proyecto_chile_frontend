import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      const response = await fetch("http://deuman-backend.svgdev.tech/reset-password", {
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
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="reset-password-container d-flex justify-content-center align-items-center" 
         style={{ height: "100vh", background: "url('/assets/images/background.jpg') no-repeat center center/cover" }}>
      <div className="card p-5 shadow-lg" style={{ width: "100%", maxWidth: "420px", borderRadius: "15px", backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
        <h4 className="text-start text-primary fw-bold">Restablecer contraseña</h4>
        <p className="text-start text-muted mb-4">Ingresa tu correo, el código de verificación y tu nueva contraseña</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Código de verificación</label>
            <input
              type="text"
              className="form-control"
              name="code"
              placeholder="Código recibido"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              name="new_password"
              placeholder="••••••••"
              value={formData.new_password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Confirmar nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              name="confirm_new_password"
              placeholder="••••••••"
              value={formData.confirm_new_password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Restablecer contraseña</button>
        </form>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        <div className="text-center mt-3">
          <a href="/login" className="btn btn-outline-secondary">Regresar</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
