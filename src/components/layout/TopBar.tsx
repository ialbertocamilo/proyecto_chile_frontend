import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import "../../../public/assets/css/globals.css";

interface TopBarProps {
  sidebarWidth: string;
}

const getUserTypeText = (roleId: string): string => {
  switch (roleId) {
    case "1":
      return "Administrador";
    case "2":
      return "Operador";
    default:
      return "Tipo de Usuario";
  }
};

const TopBar = ({}: TopBarProps) => {
  const [user, setUser] = useState({
    name: "Usuario",
    email: "",
    userType: "Tipo de Usuario",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          const userTypeFromProfile = parsedProfile.userType
            ? parsedProfile.userType
            : localStorage.getItem("role_id") || "Tipo de Usuario";

          setUser({
            name: nameFromProfile,
            email: emailFromProfile,
            userType: userTypeFromProfile,
          });
        } catch (err) {
          console.error("Error al parsear el perfil desde localStorage:", err);
          const storedName = localStorage.getItem("user_name") || "Usuario";
          const storedEmail = localStorage.getItem("email") || "";
          const storedUserType =
            localStorage.getItem("role_id") || "Tipo de Usuario";
          setUser({
            name: storedName,
            email: storedEmail,
            userType: storedUserType,
          });
        }
      } else {
        const storedName = localStorage.getItem("user_name") || "Usuario";
        const storedEmail = localStorage.getItem("email") || "";
        const storedUserType =
          localStorage.getItem("role_id") || "Tipo de Usuario";
        setUser({
          name: storedName,
          email: storedEmail,
          userType: storedUserType,
        });
      }
    }
  }, []);

  // Cerrar el menú dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (!isMounted) {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <nav
      className="navbar shadow-sm px-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        fontFamily: "var(--font-family-base)",
        minHeight: "120px",
        padding: "10px 20px",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(7px)",
        boxShadow: "0px 12px 16px rgba(0, 0, 0, 0.3)",
        width: "100%",
        overflow: "visible",
      }}
    >
      <div
        className="container-fluid d-flex justify-content-end align-items-center"
        style={{ flexWrap: "wrap" }}
      >
        <div
          className="dropdown"
          style={{ position: "relative", fontFamily: "var(--font-family-base)" }}
          ref={dropdownRef}
        >
          {/* Botón del usuario */}
          <button
            className="btn d-flex align-items-center"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {/* Ícono más grande (50x50) */}
            <Image
              src="/assets/images/user_icon.png"
              alt="User"
              width={50}
              height={50}
              className="rounded-circle"
              style={{ marginRight: "8px" }}
            />

            {/* Vista extendida (Desktop) */}
            <div className="d-none d-md-flex flex-column align-items-start">
              {/* Email en fuente más grande */}
              <span
                style={{
                  fontSize: "16px",
                  color: "var(--primary-color)",
                  fontWeight: 500,
                }}
              >
                {user.email}
              </span>
              {/* Nombre y caret */}
              <span
                style={{
                  fontSize: "16px",
                  color: "var(--secondary-color)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {user.name}{" "}
                <i
                  className="bi bi-caret-down-fill ms-1"
                  style={{ fontSize: "14px" }}
                />
              </span>
              {/* Rol en un "badge" más grande */}
              <span
                style={{
                  fontSize: "12px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  marginTop: "6px",
                }}
              >
                {getUserTypeText(user.userType)}
              </span>
            </div>

            <div className="d-flex d-md-none">
            </div>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show mt-2 shadow-sm"
              style={{ right: 0 }}
            >
              {/* En móviles, mostrar la info extendida dentro del dropdown */}
              <div className="d-md-none p-2 border-bottom">
                <span
                >
                  {user.email}
                </span>
                <span
                >
                  {user.name}
                </span>
                <span
                >
                  {getUserTypeText(user.userType)}
                </span>
              </div>

              <Link href="/edit-profile" className="dropdown-item">
                <i className="bi bi-person me-2"></i> Perfil
              </Link>
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
