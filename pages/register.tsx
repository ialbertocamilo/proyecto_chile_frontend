import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import "../public/assets/css/globals.css";
import CustomButton from "../src/components/common/CustomButton";

interface FormData {
  name: string;
  lastname: string;
  email: string;
  number_phone: string;
  country: string;
  direccion: string;
  proffesion: string;
  password: string;
  confirm_password: string;
  birthdate: string;
  ubigeo: string;
}

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    lastname: "",
    email: "",
    number_phone: "",
    country: "",
    direccion: "",
    proffesion: "",
    password: "",
    confirm_password: "",
    birthdate: "",
    ubigeo: "",
  });

  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (
      !formData.name ||
      !formData.lastname ||
      !formData.email ||
      !formData.number_phone ||
      !formData.country ||
      !formData.direccion ||
      !formData.proffesion ||
      !formData.birthdate ||
      !formData.ubigeo ||
      !formData.password ||
      !formData.confirm_password
    ) {
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 20) {
      return;
    }
    if (formData.password !== formData.confirm_password) {
      return;
    }
    setLoading(true);
    try {
      const requestBody = { ...formData };
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isError = (field: keyof FormData) => formSubmitted && !formData[field];
  const isInvalidPassword =
    formSubmitted &&
    (formData.password.length < 8 || formData.password.length > 20);
  const isMismatchPassword =
    formSubmitted && formData.password !== formData.confirm_password;

  const baseFontSize = "0.875rem"; // ~14px
  const labelStyle = {
    marginBottom: "0.1rem",
    fontFamily: "var(--font-family-base)",
    fontWeight: 400,
    fontSize: baseFontSize,
    color: "#000",
  } as React.CSSProperties;

  const inputStyle = {
    border: "1px solid #eee",
    borderRadius: "8px",
    margin: 0,
    padding: "0.45rem 0.75rem",
    fontFamily: "var(--font-family-base)",
    fontSize: baseFontSize,
  };

  const toggleStyle = {
    position: "absolute" as const,
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "var(--primary-color)",
    fontWeight: 600 as const,
    fontSize: baseFontSize,
    fontFamily: "var(--font-family-base)",
  };

  const fieldContainerStyle = {
    marginBottom: "1rem",
  };

  const borderedContainerStyle = {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    fontFamily: "var(--font-family-base)",
  };

  return (
    <div
      className="register-container d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "url('/assets/images/background.jpg') no-repeat center center/cover",
        fontFamily: "var(--font-family-base)",
      }}
    >
      <div
        className="card p-4"
        style={{
          width: "90%",
          minHeight: "55vh",
          maxWidth: "1400px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          border: "1px solid #eee",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
          fontSize: baseFontSize,
        }}
      >
        <h4
          className="text-start mb-4"
          style={{
            color: "#6dbdc9",
            fontFamily: "var(--font-family-base)",
            fontWeight: 400,
            fontSize: "1rem",
            margin: 0,
          }}
        >
          Crear perfil nuevo
        </h4>

        {successMessage && (
          <div
            className="alert alert-success"
            style={{
              marginBottom: "1rem",
              fontFamily: "var(--font-family-base)",
            }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Columna Izquierda */}
            <div className="col-md-5">
              <div style={borderedContainerStyle}>
                <label style={labelStyle}>Mi perfil</label>
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "1rem", marginBottom: "1rem" }}
                >
                  {/* Se reemplaza el ícono por la imagen de usuario */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src="/assets/images/profile-placeholder.png"
                      alt="Profile"
                      width={60}
                      height={60}
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div style={{ fontSize: baseFontSize }}>
                    <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>
                      {formData.name || "NOMBRES"}{" "}
                      {formData.lastname || "APELLIDOS"}
                    </div>
                    <div>{formData.proffesion || "Profesión u oficio"}</div>
                  </div>
                </div>

                <div style={fieldContainerStyle}>
                  <label
                    style={{
                      ...labelStyle,
                      color: isError("email") ? "red" : "#000",
                    }}
                  >
                    Dirección de Email {isError("email") && <span>*</span>}
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="ejemplo@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={fieldContainerStyle}>
                  <label
                    style={{
                      ...labelStyle,
                      color: isInvalidPassword ? "red" : "#000",
                    }}
                  >
                    Crear contraseña {isInvalidPassword && <span>*</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                    />
                    <span
                      style={toggleStyle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </div>
                  {isInvalidPassword && (
                    <small
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                        color: "red",
                      }}
                    >
                      La contraseña debe tener entre 8 y 20 caracteres.
                    </small>
                  )}
                </div>

                <div style={fieldContainerStyle}>
                  <label
                    style={{
                      ...labelStyle,
                      color: isMismatchPassword ? "red" : "#000",
                      paddingBottom: "0.9em",
                    }}
                  >
                    Confirmar contraseña {isMismatchPassword && <span>*</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      name="confirm_password"
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                    />
                    <span
                      style={toggleStyle}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "Ocultar" : "Mostrar"}
                    </span>
                  </div>
                  {isMismatchPassword && (
                    <small style={{ color: "red", fontSize: "0.75rem" }}>
                      Las contraseñas no coinciden.
                    </small>
                  )}
                  <div style={{ paddingBottom: "1.5em" }}></div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="col-md-7">
              <div style={borderedContainerStyle}>
                <div className="row g-2">
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("name") ? "red" : "#000",
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
                      style={inputStyle}
                    />
                  </div>
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("lastname") ? "red" : "#000",
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
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("proffesion") ? "red" : "#000",
                      }}
                    >
                      Profesión u oficio{" "}
                      {isError("proffesion") && <span>*</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="proffesion"
                      placeholder="Ej. Ingeniero Civil"
                      value={formData.proffesion}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("country") ? "red" : "#000",
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
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("direccion") ? "red" : "#000",
                      }}
                    >
                      Dirección {isError("direccion") && <span>*</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("number_phone") ? "red" : "#000",
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
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("birthdate") ? "red" : "#000",
                      }}
                    >
                      Fecha de nacimiento{" "}
                      {isError("birthdate") && <span>*</span>}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div className="col-md-6" style={fieldContainerStyle}>
                    <label
                      style={{
                        ...labelStyle,
                        color: isError("ubigeo") ? "red" : "#000",
                      }}
                    >
                      Ubigeo {isError("ubigeo") && <span>*</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="ubigeo"
                      placeholder="Ej. 150101"
                      value={formData.ubigeo}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ marginTop: "1rem" }}
                >
                  <CustomButton
                    type="button"
                    variant="back"
                    onClick={() => router.back()}
                    style={{
                      borderRadius: "8px",
                      minWidth: "auto",
                      fontFamily: "var(--font-family-base)",
                      fontSize: baseFontSize,
                    }}
                  >
                    <i className="bi bi-arrow-left"></i>
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="save"
                    disabled={loading}
                    style={{
                      borderRadius: "8px",
                      minWidth: "auto",
                      fontFamily: "var(--font-family-base)",
                      fontSize: baseFontSize,
                    }}
                  >
                    {loading ? "Registrando..." : "Crear y guardar datos"}
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url("/assets/images/background.jpg") no-repeat center
            center/cover;
          position: relative;
          input::placeholder {
            color: rgba(0, 0, 0, 0.3);
          }
          ,
          input::placeholder {
            color: rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
