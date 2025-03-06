import "bootstrap/dist/css/bootstrap.min.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { useState } from "react";
import { useRouter } from "next/router";
import "../public/assets/css/globals.css";
import CustomButton from "../src/components/common/CustomButton";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    number_phone: "",
    birthdate: "",
    country: "",
    ubigeo: "",
    proffesion: "",
    password: "",
    confirm_password: "",
    acceptTerms: false,
  });

  // Estado para saber si un campo obligatorio ha sido tocado
  const [touched, setTouched] = useState<Record<keyof typeof formData, boolean>>({
    name: false,
    lastname: false,
    email: false,
    number_phone: false,
    birthdate: false,
    country: false,
    ubigeo: false,
    proffesion: false,
    password: false,
    confirm_password: false,
    acceptTerms: false,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Se actualiza el estado "touched" cuando un campo pierde el foco
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validación de campos obligatorios
    if (
      !formData.name ||
      !formData.lastname ||
      !formData.email ||
      !formData.number_phone ||
      !formData.birthdate ||
      !formData.country ||
      !formData.ubigeo ||
      !formData.proffesion ||
      !formData.password ||
      !formData.confirm_password
    ) {
      // Aquí podrías manejar un error global, pero se opta por la validación inline
      return;
    }
    // Validación de la longitud de la contraseña
    if (formData.password.length < 8 || formData.password.length > 20) {
      return;
    }
    // Validación de coincidencia de contraseñas
    if (formData.password !== formData.confirm_password) {
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
      proffesion: formData.proffesion,
      password: formData.password,
      confirm_password: formData.confirm_password,
    };

    try {
      const response = await fetch(`${constantUrlApiEndpoint}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario.");
      }
      setSuccessMessage("Registro exitoso. Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (err) {
      // Aquí se podría manejar el error de forma global o dejarlo en consola
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Estilos
  const leftSpacingStyle = { marginBottom: "0.5rem" };
  const rightSpacingStyle = { marginBottom: "0.5rem" };
  const labelStyle = {
    marginBottom: "0.1rem",
    fontFamily: "var(--font-family-base)",
  };
  const inputStyle = {
    border: "2px solid var(--muted-text)",
    borderRadius: "0.5rem",
    margin: 0,
    padding: "0.5rem",
    fontFamily: "var(--font-family-base)",
  };
  const toggleStyle = {
    position: "absolute" as const,
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "var(--primary-color)",
    fontWeight: "bold" as const,
    fontSize: "0.9rem",
    fontFamily: "var(--font-family-base)",
  };
  const borderedContainerStyle = {
    border: "2px solid var(--muted-text)",
    borderRadius: "0.5rem",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.1rem",
    fontFamily: "var(--font-family-base)",
  };

  // Función para determinar si un campo obligatorio está vacío y ha sido tocado
  const isError = (field: keyof typeof formData) => touched[field] && !formData[field];

  return (
    <div
      className="register-container d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "url('/assets/images/background.jpg') no-repeat center center/cover",
        fontFamily: "var(--font-family-base)",
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
        <h4
          className="text-start fw-bold mb-3"
          style={{ color: "#6dbdc9", fontFamily: "var(--font-family-base)" }}
        >
          Crear perfil nuevo
        </h4>
        {successMessage && (
          <div
            className="alert alert-success"
            style={{ marginBottom: "1rem", fontFamily: "var(--font-family-base)" }}
          >
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row align-items-stretch">
            {/* Sección Mi perfil (lado izquierdo) */}
            <div className="col-md-5 border-end pe-3" style={{ display: "flex" }}>
              <div style={borderedContainerStyle} className="w-100">
                <div>
                  <label className="form-label fw-bold" style={{ color: "#000", ...labelStyle }}>
                    Mi perfil
                  </label>
                  <div
                    className="d-flex align-items-center"
                    style={{
                      gap: "1rem",
                      marginBottom: "0.1rem",
                      textAlign: "left",
                    }}
                  >
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
                        color: "var(--primary-color)",
                        fontFamily: "var(--font-family-base)",
                      }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#000",
                          ...labelStyle,
                          marginBottom: "0.2rem",
                        }}
                      >
                        {formData.name || "Nombre"} {formData.lastname || "Apellido"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#000",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        {formData.proffesion || "Profesión"}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={leftSpacingStyle}>
                  <label
                    className="form-label fw-bold"
                    style={{
                      color: isError("email") ? "red" : "#000",
                      ...labelStyle,
                    }}
                  >
                    Dirección de Email {isError("email") && <span>*</span>}
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={leftSpacingStyle}>
                  <label
                    className="form-label fw-bold"
                    style={{
                      color: isError("password") ? "red" : "#000",
                      ...labelStyle,
                    }}
                  >
                    Crear contraseña {isError("password") && <span>*</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                    />
                    <span style={toggleStyle} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </div>
                  <small
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                      color: "#6dbdc9",
                    }}
                  >
                    La contraseña debe tener mínimo 8 y máximo 20 caracteres.
                  </small>
                </div>
                <div style={leftSpacingStyle}>
                  <label
                    className="form-label fw-bold"
                    style={{
                      color: isError("confirm_password") ? "red" : "#000",
                      ...labelStyle,
                    }}
                  >
                    Confirmar contraseña {isError("confirm_password") && <span>*</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      name="confirm_password"
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                    />
                    <span
                      style={toggleStyle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Sección formulario (lado derecho) */}
            <div className="col-md-7 d-flex flex-column">
              <div style={borderedContainerStyle} className="w-100 flex-grow-1">
                <div className="row">
                  <div className="col-md-6">
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("name") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        Nombres {isError("name") && <span>*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("lastname") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        Apellidos {isError("lastname") && <span>*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("birthdate") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        Fecha de Nacimiento {isError("birthdate") && <span>*</span>}
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("number_phone") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        Teléfono {isError("number_phone") && <span>*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="number_phone"
                        value={formData.number_phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("country") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        País {isError("country") && <span>*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("ubigeo") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        Ubigeo {isError("ubigeo") && <span>*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="ubigeo"
                        value={formData.ubigeo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={rightSpacingStyle}>
                      <label
                        className="form-label fw-bold"
                        style={{
                          color: isError("proffesion") ? "red" : "#000",
                          marginBottom: "0.25rem",
                          fontFamily: "var(--font-family-base)",
                        }}
                      >
                        Profesión {isError("proffesion") && <span>*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="proffesion"
                        value={formData.proffesion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ej. Ingeniero Civil"
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between" style={{ marginTop: "0.5rem" }}>
                  <CustomButton
                    type="button"
                    variant="backIcon"
                    onClick={() => router.push("/login")}
                    style={{
                      borderRadius: "0.5rem",
                      fontFamily: "var(--font-family-base)",
                    }}
                  >
                    Regresar
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="save"
                    disabled={loading}
                    style={{
                      borderRadius: "0.5rem",
                      minWidth: "auto",
                      fontFamily: "var(--font-family-base)",
                    }}
                  >
                    {loading ? (
                      "Registrando..."
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Crear y guardar datos
                      </>
                    )}
                  </CustomButton>
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
      `}</style>
    </div>
  );
};

export default Register;
