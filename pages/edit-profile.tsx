import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";

interface ProfileData {
  name: string;
  lastname: string;
  number_phone: string;
  country: string;
  ubigeo: string;
  userType: string;
}


const mapRoleIdToText = (roleId: string | null): string => {
  if (roleId === "1") {
    return "Administrador";
  } else if (roleId === "2") {
    return "Operador";
  }
  return "Desconocido"; // En caso de que el role_id no sea 1 ni 2
};

const EditProfile = () => {
  // Validación de sesión
  useAuth();
  console.log("[EditProfile] Página cargada y sesión validada.");

  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    lastname: "",
    number_phone: "",
    country: "",
    ubigeo: "",
    userType: "", // Inicializar el tipo de usuario
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    const roleId = localStorage.getItem("role_id");
    if (storedProfile) {
      try {
        const parsedProfile: ProfileData = JSON.parse(storedProfile);
        setProfile({
          name: parsedProfile.name || "",
          lastname: parsedProfile.lastname || "",
          number_phone: parsedProfile.number_phone || "",
          country: parsedProfile.country || "",
          ubigeo: parsedProfile.ubigeo || "",
          userType: mapRoleIdToText(roleId), // Mapear el role_id a texto
        });
        console.log("[EditProfile] Perfil cargado desde localStorage:", parsedProfile);
      } catch (err) {
        console.error("[EditProfile] Error al parsear el perfil desde localStorage", err);
      }
    } else {
      console.warn("[EditProfile] No se encontró información del perfil en localStorage.");
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
      console.log("[EditProfile] Enviando actualización del perfil:", payload);

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
        console.error("[EditProfile] Error actualizando perfil:", errorData);
        throw new Error(
          errorData.detail ||
            errorData.message ||
            "No se pudo actualizar el perfil"
        );
      }

      const resData = await response.json();
      localStorage.setItem("userProfile", JSON.stringify(payload));
      console.log("[EditProfile] Perfil actualizado correctamente:", resData);

      await Swal.fire({
        title: "Perfil actualizado",
        text: resData.message || "Tu perfil se actualizó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[EditProfile] Error actualizando perfil:", err);
      const message = err instanceof Error ? err.message : "Error al actualizar el perfil";
      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "150px" }}>
          {/* Encabezado y botones */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2
              className="fw-bold"
              style={{
                color: "var(--primary-color)",
                margin: 0,
                fontFamily: "var(--font-family-base)",
              }}
            >
              Perfil
            </h2>
            <div className="d-flex" style={{ gap: "1rem" }}>
              <CustomButton
                variant="back"
                onClick={() => router.push("/dashboard")}
              >
                ← Regresar
              </CustomButton>
              <CustomButton
                variant="save"
                type="submit"
                form="editProfileForm"
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Actualizar Perfil"}
              </CustomButton>
            </div>
          </div>
          {loading ? (
            <p
              className="text-primary"
              style={{ fontFamily: "var(--font-family-base)" }}
            >
              Cargando...
            </p>
          ) : (
            <form
              id="editProfileForm"
              onSubmit={handleSubmit}
              style={{ fontFamily: "var(--font-family-base)" }}
            >
              {error && (
                <p
                  className="text-danger"
                  style={{ fontFamily: "var(--font-family-base)" }}
                >
                  {error}
                </p>
              )}
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={profile.name}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Apellidos
                </label>
                <input
                  type="text"
                  name="lastname"
                  className="form-control"
                  value={profile.lastname}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Teléfono
                </label>
                <input
                  type="text"
                  name="number_phone"
                  className="form-control"
                  value={profile.number_phone}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  className="form-control"
                  value={profile.country}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Ubigeo
                </label>
                <input
                  type="text"
                  name="ubigeo"
                  className="form-control"
                  value={profile.ubigeo}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              {/* Nuevo campo para mostrar el tipo de usuario */}
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Tipo de Usuario
                </label>
                <input
                  type="text"
                  name="userType"
                  className="form-control"
                  value={profile.userType}
                  readOnly
                  style={{ fontFamily: "var(--font-family-base)" }}
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