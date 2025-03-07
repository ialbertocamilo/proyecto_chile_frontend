import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    userType: "", 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, ] = useState("300px");

  const CARD_WIDTH = "90%"; 
  const CARD_MARGIN_LEFT = "20%"; 
  const CARD_MARGIN_RIGHT = "auto";
  const CARD_MARGIN_TOP = "30px";
  const CARD_MARGIN_BOTTOM = "30px";
  const CARD_BORDER_RADIUS = "16px";
  const CARD_BOX_SHADOW = "0 2px 10px rgba(0,0,0,0.1)";
  const CARD_BORDER_COLOR = "#d3d3d3";
  const CONTAINER_MARGIN_LEFT = "10px";

  const cardStyle = {
    width: CARD_WIDTH,
    margin: `${CARD_MARGIN_TOP} ${CARD_MARGIN_RIGHT} ${CARD_MARGIN_BOTTOM} ${CARD_MARGIN_LEFT}`,
    borderRadius: CARD_BORDER_RADIUS,
    boxShadow: CARD_BOX_SHADOW,
    border: `1px solid ${CARD_BORDER_COLOR}`,
    padding: "20px",
    backgroundColor: "#fff",
  };
  
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
          userType: mapRoleIdToText(roleId), // Asegurar que userType se mantengaaaa
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
  
    if (!name.trim() || !lastname.trim() || !number_phone.trim() || !country.trim() || !ubigeo.trim()) {
      toast.warning("Por favor, complete todos los campos.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId: "warning"
      });
      return;
    }
  
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión.");
      }
  
      // Crear el payload sin `userTypea`
      const payload = { ...profile } as Partial<typeof profile>;
      delete payload.userType;
  
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
        throw new Error(errorData.detail || errorData.message || "No se pudo actualizar el perfil");
      }
  
      const resData = await response.json();
      localStorage.setItem("userProfile", JSON.stringify(payload));
  
      console.log("[EditProfile] Perfil actualizado correctamente:", resData);
  
      toast.success(resData.message || "Tu perfil se actualizó correctamente.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId: "success"
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[EditProfile] Error actualizando perfil:", err);
      const message = err instanceof Error ? err.message : "Error al actualizar el perfil";
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId: "warning"
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: "130px",
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "80px", marginLeft: CONTAINER_MARGIN_LEFT }}>
          {/* Card para el Título */}
          <div style={cardStyle} className="mb-4 shadow-sm">
            <div className="card-body">
              <h2 style={{ color: "black", margin: 0 }}>
                Perfil
              </h2>
            </div>
          </div>
  
          {/* Card para el Formulario */}
          <div style={cardStyle} className="shadow-sm">
            <div className="card-body">
              {error && (
                <p className="text-danger fw-bold">
                  {error}
                </p>
              )}
              {loading ? (
                <p className="text-primary">Cargando...</p>
              ) : (
                <form id="editProfileForm" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Nombre</label>
                    <input type="text" name="name" className="form-control" value={profile.name} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label>Apellidos</label>
                    <input type="text" name="lastname" className="form-control" value={profile.lastname} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label>Teléfono</label>
                    <input type="text" name="number_phone" className="form-control" value={profile.number_phone} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label>País</label>
                    <input type="text" name="country" className="form-control" value={profile.country} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label>Ubigeo</label>
                    <input type="text" name="ubigeo" className="form-control" value={profile.ubigeo} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label>Tipo de Usuario</label>
                    <input type="text" name="userType" className="form-control" value={profile.userType} readOnly />
                  </div>
                  {/* Botones de acción */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <CustomButton variant="back" onClick={() => router.push("/dashboard")}>
                      ← Regresar
                    </CustomButton>
                    <CustomButton variant="save" type="submit" form="editProfileForm" disabled={loading}>
                      {loading ? "Actualizando..." : "Actualizar Perfil"}
                    </CustomButton>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}  

export default EditProfile;