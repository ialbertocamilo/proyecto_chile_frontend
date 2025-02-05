import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import { useRouter } from "next/router";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    number_phone: "",
    birthdate: "",
    country: "",
    ubigeo: "",
    password: "",
    confirm_password: "",
    acceptTerms: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!formData.name || !formData.lastname || !formData.email || !formData.password || !formData.confirm_password) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const requestBody = {
      name: formData.name,
      lastname: formData.lastname,
      email: formData.email,
      number_phone: formData.number_phone,
      birthdate: formData.birthdate,
      country: formData.country,
      ubigeo: formData.ubigeo,
      password: formData.password,
      confirm_password: formData.confirm_password,
    };

    console.log("📤 Enviando datos al backend:", requestBody); // consola para verificar datos enviados

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data); // consola para verificar respuesta del servidor

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario.");
      }

      setSuccessMessage("Registro exitoso. Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 500); 
    } catch (err: any) {
      console.error("Error al registrar:", err.message); // consola para errores
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container d-flex justify-content-center align-items-center" style={{ height: "100vh", background: "url('/assets/images/background.jpg') no-repeat center center/cover" }}>
      <div className="card p-5 shadow-lg" style={{ width: "100%", maxWidth: "900px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
        <h4 className="text-start text-primary fw-bold mb-4">Crear perfil nuevo</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            {}
            <div className="col-md-5 border-end pe-4">
              <label className="form-label fw-bold">Dirección de Email</label>
              <input type="email" className="form-control mb-2" name="email" placeholder="Example@gmail.com" value={formData.email} onChange={handleChange} required />
              <label className="form-label fw-bold">Crear contraseña</label>
              <div className="input-group mb-2">
                <input type={showPassword ? "text" : "password"} className="form-control" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
              </div>
              <label className="form-label fw-bold">Confirmar contraseña</label>
              <div className="input-group mb-3">
                <input type={showConfirmPassword ? "text" : "password"} className="form-control" name="confirm_password" placeholder="••••••••" value={formData.confirm_password} onChange={handleChange} required />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? "Ocultar" : "Mostrar"}</button>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                {loading ? "Registrando..." : "Guardar"}
              </button>
            </div>

            {/* Datos Personales */}
            <div className="col-md-7">
              <label className="form-label fw-bold">Nombres</label>
              <input type="text" className="form-control mb-3" name="name" value={formData.name} onChange={handleChange} required />
              <label className="form-label fw-bold">Apellidos</label>
              <input type="text" className="form-control mb-3" name="lastname" value={formData.lastname} onChange={handleChange} required />
              <label className="form-label fw-bold">Fecha de Nacimiento</label>
              <input type="date" className="form-control mb-3" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
              <label className="form-label fw-bold">Teléfono</label>
              <input type="text" className="form-control mb-3" name="number_phone" value={formData.number_phone} onChange={handleChange} required />
              <label className="form-label fw-bold">País</label>
              <input type="text" className="form-control mb-3" name="country" value={formData.country} onChange={handleChange} required />
              <label className="form-label fw-bold">Ubigeo</label>
              <input type="text" className="form-control mb-3" name="ubigeo" value={formData.ubigeo} onChange={handleChange} required />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
