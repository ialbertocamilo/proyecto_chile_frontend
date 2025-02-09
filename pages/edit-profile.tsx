import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import Button from "../src/components/common/Button";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
interface ProfileData {
  name: string;
  lastname: string;
  number_phone: string;
  country: string;
  ubigeo: string;
}

const EditProfile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    lastname: "",
    number_phone: "",
    country: "",
    ubigeo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const parsedProfile: ProfileData = JSON.parse(storedProfile);
        setProfile({
          name: parsedProfile.name || "",
          lastname: parsedProfile.lastname || "",
          number_phone: parsedProfile.number_phone || "",
          country: parsedProfile.country || "",
          ubigeo: parsedProfile.ubigeo || "",
        });
      } catch (err) {
        console.error("Error al parsear el perfil desde localStorage", err);
      }
    } else {
      console.warn("No se encontró información del perfil en localStorage.");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { name, lastname, number_phone, country, ubigeo } = profile;

    if (
      !name.trim() ||
      !lastname.trim() ||
      !number_phone.trim() ||
      !country.trim() ||
      !ubigeo.trim()
    ) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión.");
      }
      const payload = { ...profile };
      console.log("Enviando actualización del perfil:", payload);

      const response = await fetch(`${constantUrlApiEndpoint}/user/me/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error actualizando perfil:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "No se pudo actualizar el perfil"
        );
      }

      const resData = await response.json();

      localStorage.setItem("userProfile", JSON.stringify(payload));

      await Swal.fire({
        title: "Perfil actualizado",
        text: resData.message || "Tu perfil se actualizó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error actualizando perfil:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Error al actualizar el perfil",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "60px" }}>
          {/* Encabezado y botones */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: "#6dbdc9", margin: 0 }}>
              Editar Perfil
            </h2>
            <div className="d-flex" style={{ gap: "1rem" }}>
              <Button
                text="← Regresar"
                onClick={() => router.push("/dashboard")}
                className="btn-secondary"
              />
              <button
                type="submit"
                form="editProfileForm"
                className="btn"
                disabled={loading}
                style={{
                  backgroundColor: "#3ca7b7",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "12px",
                  fontSize: "1rem",
                  transition: "background 0.3s ease",
                  color: "#fff",
                }}
              >
                {loading ? "Actualizando..." : "Actualizar Perfil"}
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-primary">Cargando...</p>
          ) : (
            <form id="editProfileForm" onSubmit={handleSubmit}>
              {error && <p className="text-danger">{error}</p>}
              <div className="mb-3">
                <label>Nombre</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={profile.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Apellidos</label>
                <input
                  type="text"
                  name="lastname"
                  className="form-control"
                  value={profile.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="number_phone"
                  className="form-control"
                  value={profile.number_phone}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>País</label>
                <input
                  type="text"
                  name="country"
                  className="form-control"
                  value={profile.country}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Ubigeo</label>
                <input
                  type="text"
                  name="ubigeo"
                  className="form-control"
                  value={profile.ubigeo}
                  onChange={handleChange}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
