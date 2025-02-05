import { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2"; 
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";

interface UserFormData {
  name: string;
  lastname: string;
  email: string;
  number_phone: string;  
  birthdate: string;     
  country: string;
  ubigeo: string;
  password: string;
  confirm_password: string;
}

const UserCreate = () => {
  const router = useRouter();

  const [userData, setUserData] = useState<UserFormData>({
    name: "",
    lastname: "",
    email: "",
    number_phone: "",
    birthdate: "",
    country: "",
    ubigeo: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const {
      name,
      lastname,
      email,
      number_phone,
      birthdate,
      country,
      ubigeo,
      password,
      confirm_password,
    } = userData;
    if (
      !name.trim() ||
      !lastname.trim() ||
      !email.trim() ||
      !number_phone.trim() ||
      !birthdate.trim() ||
      !country.trim() ||
      !ubigeo.trim() ||
      !password.trim() ||
      !confirm_password.trim()
    ) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Debe llenar todos los campos antes de continuar.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (password !== confirm_password) {
      Swal.fire({
        title: "Contraseñas no coinciden",
        text: "Las contraseñas ingresadas no coinciden.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión nuevamente.");
      }

      const url = "http://deuman-backend.svgdev.tech/register";
      const method = "POST";

      const bodyToSend = { ...userData };

      console.log("Enviando datos al backend:", bodyToSend);

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        console.error("Servidor devolvió un error:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "No se pudo crear el usuario"
        );
      }

      await Swal.fire({
        title: "¡Usuario creado!",
        text: "El usuario se creó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      router.push("/user-management");
    } catch (err: any) {
      console.error("Error en handleSubmit:", err);
      setError(err.message || "Error al crear usuario");
      if (
        err.message &&
        (err.message.toLowerCase().includes("correo") ||
          err.message.toLowerCase().includes("email"))
      ) {
        Swal.fire({
          title: "Correo ya registrado",
          text: "El correo ingresado ya se encuentra registrado. Por favor, use otro correo.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: err.message || "Error al crear usuario",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} />
      <div className="d-flex flex-column flex-grow-1">
        <TopBar />
        <div className="container mt-4">
          <h2 className="fw-bold text-primary text-center mb-4">Crear Usuario</h2>

          <div className="mb-4">
            <Button
              text="Volver a Gestión de Usuarios"
              onClick={() => router.push("/user-management")}
              className="btn-secondary"
            />
          </div>

          {error && <p className="text-danger fw-bold">{error}</p>}

          {loading ? (
            <p className="text-primary">Cargando...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={userData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="lastname"
                    className="form-control"
                    value={userData.lastname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={userData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="number_phone"
                    className="form-control"
                    value={userData.number_phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="birthdate"
                    className="form-control"
                    value={userData.birthdate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label>País</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    value={userData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label>Ubigeo</label>
                <input
                  type="text"
                  name="ubigeo"
                  className="form-control"
                  value={userData.ubigeo}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={userData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-control"
                  value={userData.confirm_password}
                  onChange={handleChange}
                />
              </div>

              <div className="text-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCreate;
