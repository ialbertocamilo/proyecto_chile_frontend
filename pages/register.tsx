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
    if (
      !formData.name ||
      !formData.lastname ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password
    ) {
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

    console.log("📤 Enviando datos al backend:", requestBody);

    try {
      const response = await fetch("http://deuman-backend.svgdev.tech/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      console.log("Respuesta del backend:", data);
      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario.");
      }
      setSuccessMessage("Registro exitoso. Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (err: any) {
      console.error("Error al registrar:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: "2px solid #e0e0e0",
    borderRadius: "0.5rem",
    margin: 0,
    padding: "0.5rem",
  };

  const leftSpacingStyle = { marginBottom: "0.1rem" };

  const rightSpacingStyle = { marginBottom: "0.5rem" };

  const labelStyle = { marginBottom: "0.1rem" };

  const toggleStyle = {
    position: "absolute" as const,
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#5cb5c3",
    fontWeight: "bold" as const,
    fontSize: "0.9rem",
  };

  const borderedContainerStyle = {
    border: "2px solid #e0e0e0",
    borderRadius: "0.5rem",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.1rem",
  };

  return (
    <div
      className="register-container d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "url('/assets/images/background.jpg') no-repeat center center/cover",
      }}
    >
      <div
        className="card p-5 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "1200px",
          borderRadius: "20px",
          backgroundColor: "#fff",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h4 className="text-start fw-bold mb-3" style={{ color: "#6dbdc9" }}>
          Crear perfil nuevo
        </h4>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row align-items-stretch">
            <div className="col-md-5 border-end pe-3" style={{ display: "flex" }}>
              <div style={borderedContainerStyle} className="w-100">
                
                <div>
                  <label className="form-label fw-bold" style={{ color: "#000", ...labelStyle }}>
                    Mi perfil
                  </label>
                  <div className="d-flex align-items-center" style={{ gap: "0.1rem", marginBottom: "0.1rem" }}>
                    
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        backgroundColor: "#e0e0e0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "2.5rem",
                        color: "#5cb5c3",
                      }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#000", ...labelStyle }}>
                        {formData.name || "Nombre"} {formData.lastname || "Apellido"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#000" }}>
                        Ingeniero Civil
                      </div>
                    </div>
                  </div>
                </div>
                <div style={leftSpacingStyle}>
                  <label className="form-label fw-bold" style={{ color: "#000", ...labelStyle }}>
                    Dirección de Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={leftSpacingStyle}>
                  <label className="form-label fw-bold" style={{ color: "#000", ...labelStyle }}>
                    Crear contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                    />
                    <span style={toggleStyle} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </div>
                </div>
                <div style={leftSpacingStyle}>
                  <label className="form-label fw-bold" style={{ color: "#000", ...labelStyle }}>
                    Confirmar contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      name="confirm_password"
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                    />
                    <span style={toggleStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-7 d-flex flex-column">
              <div style={borderedContainerStyle} className="w-100 flex-grow-1">
                <div className="row">
                  <div className="col-md-6">
                    <div style={rightSpacingStyle}>
                      <label className="form-label fw-bold" style={{ color: "#000", marginBottom: "0.25rem" }}>
                        Nombres
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label className="form-label fw-bold" style={{ color: "#000", marginBottom: "0.25rem" }}>
                        Apellidos
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label className="form-label fw-bold" style={{ color: "#000", marginBottom: "0.25rem" }}>
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={rightSpacingStyle}>
                      <label className="form-label fw-bold" style={{ color: "#000", marginBottom: "0.25rem" }}>
                        Teléfono
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="number_phone"
                        value={formData.number_phone}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label className="form-label fw-bold" style={{ color: "#000", marginBottom: "0.25rem" }}>
                        País
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label className="form-label fw-bold" style={{ color: "#000", marginBottom: "0.25rem" }}>
                        Ubigeo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="ubigeo"
                        value={formData.ubigeo}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end" style={{ marginTop: "0.5rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary py-2 fw-bold"
                    disabled={loading}
                    style={{ borderRadius: "0.5rem", minWidth: "auto" }}
                  >
                    {loading ? (
                      "Registrando..."
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Crear y guardar datos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <style jsx>{`
        .register-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('/assets/images/background.jpg') no-repeat center center/cover;
          position: relative;
        }
        .card {
          /* Estilos inline definidos para width, maxWidth, borderRadius y backgroundColor */
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

export default Register;
