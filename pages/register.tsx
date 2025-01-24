import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import { useRouter } from "next/router";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirm_password: "",
    acceptTerms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { password, confirm_password, acceptTerms } = formData;

    if (password !== confirm_password) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar las políticas de privacidad");
      return;
    }

    console.log("Datos enviados:", formData);
    setError(null);
    setSuccessMessage("Registro exitoso. Ahora puedes iniciar sesión.");
  };

  return (
    <div className="register-container d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#eef7fc" }}>
      <div className="card p-5 shadow" style={{ width: "100%", maxWidth: "420px", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <img src="/assets/images/proyecto-deuman-logo.png" alt="Proyecto CEELA" className="img-fluid" style={{ maxWidth: "150px" }} />
        </div>
        <h4 className="text-start text-primary fw-bold">Crea tu cuenta</h4>
        <p className="text-start text-muted mb-4">Ingresa tus datos personales y crea tu cuenta</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Nombre</label>
            <div className="row">
              <div className="col">
                <input type="text" className="form-control" placeholder="Nombres" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col">
                <input type="text" className="form-control" placeholder="Apellidos" name="lastname" value={formData.lastname} onChange={handleChange} required />
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Dirección de Email</label>
            <input type="email" className="form-control" placeholder="Example@gmail.com" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Contraseña</label>
            <div className="input-group">
              <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Ingresa tu contraseña" name="password" value={formData.password} onChange={handleChange} required />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Repite contraseña" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
          </div>
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
            <label className="form-check-label text-muted">Acepto las <a href="#" className="text-decoration-none text-primary">Políticas de privacidad</a></label>
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          {successMessage && <p className="text-success text-center">{successMessage}</p>}
          <button type="submit" className="btn btn-primary w-100">Crear cuenta</button>
        </form>
        <div className="text-center mt-3">
          <p className="text-muted">¿Ya tienes una cuenta? <a href="/login" className="text-decoration-none text-primary">Ingresar</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;