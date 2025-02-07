import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface TopBarProps {
  sidebarWidth: string;
}

const TopBar = ({ sidebarWidth }: TopBarProps) => {
  const [user, setUser] = useState({ name: "Usuario", email: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          const emailFromProfile = parsedProfile.email
            ? parsedProfile.email
            : localStorage.getItem("email") || "";
          const nameFromProfile = parsedProfile.name
            ? parsedProfile.name
            : localStorage.getItem("user_name") || "Usuario";
          setUser({ name: nameFromProfile, email: emailFromProfile });
        } catch (err) {
          console.error("Error al parsear el perfil desde localStorage:", err);
          const storedName = localStorage.getItem("user_name") || "Usuario";
          const storedEmail = localStorage.getItem("email") || "";
          setUser({ name: storedName, email: storedEmail });
        }
      } else {
        const storedName = localStorage.getItem("user_name") || "Usuario";
        const storedEmail = localStorage.getItem("email") || "";
        setUser({ name: storedName, email: storedEmail });
      }
    }
  }, []);

  // Evitamos renderizar hasta que el componente esté montado
  if (!isMounted) {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <nav
      className="navbar navbar-light bg-light shadow-sm px-4"
      style={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        right: 0,
        zIndex: 1100,
      }}
    >
      <div className="container-fluid d-flex justify-content-end align-items-center">
        <div className="dropdown">
          <button
            className="btn d-flex align-items-center"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Icono de perfil */}
            <img
              src="/assets/images/user_icon.png"
              alt="User"
              className="rounded-circle"
              style={{ width: "40px", height: "40px", marginRight: "8px" }}
            />
            {/* Información del usuario */}
            <div className="d-flex flex-column align-items-start">
              <span
                className="fw-bold"
                style={{ fontSize: "14px", color: "#3ca7b7" }}
              >
                {user.email}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {user.name}{" "}
                <i
                  className="bi bi-caret-down-fill ms-1"
                  style={{ fontSize: "10px" }}
                ></i>
              </span>
            </div>
          </button>
          {menuOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show mt-2 shadow-sm"
              style={{ right: 0 }}
            >
              <a className="dropdown-item" href="/edit-profile">
                <i className="bi bi-person me-2"></i> Perfil
              </a>
              <a className="dropdown-item" href="/settings">
                <i className="bi bi-gear me-2"></i> Configuración
              </a>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
