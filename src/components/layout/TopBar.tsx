import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

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
        fontFamily: "var(--font-family-base)",
      }}
    >
      <div
        className="container-fluid d-flex justify-content-end align-items-center"
        style={{ fontFamily: "var(--font-family-base)" }}
      >
        <div className="dropdown" style={{ fontFamily: "var(--font-family-base)" }}>
          <button
            className="btn d-flex align-items-center"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              fontFamily: "var(--font-family-base)",
            }}
          >
            {/* Icono de perfil usando next/image */}
            <Image
              src="/assets/images/user_icon.png"
              alt="User"
              width={40}
              height={40}
              className="rounded-circle"
              style={{ marginRight: "8px" }}
            />
            {/* Información del usuario */}
            <div
              className="d-flex flex-column align-items-start"
              style={{ fontFamily: "var(--font-family-base)" }}
            >
              <span
                className="fw-bold"
                style={{
                  fontSize: "14px",
                  color: "#3ca7b7",
                  fontFamily: "var(--font-family-base)",
                }}
              >
                {user.email}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "var(--font-family-base)",
                }}
              >
                {user.name}{" "}
                <i
                  className="bi bi-caret-down-fill ms-1"
                  style={{ fontSize: "10px", fontFamily: "var(--font-family-base)" }}
                ></i>
              </span>
            </div>
          </button>
          {menuOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show mt-2 shadow-sm"
              style={{ right: 0, fontFamily: "var(--font-family-base)" }}
            >
              <Link href="/edit-profile" className="dropdown-item" style={{ fontFamily: "var(--font-family-base)" }}>
                <i className="bi bi-person me-2"></i> Perfil
              </Link>
              <Link href="/settings" className="dropdown-item" style={{ fontFamily: "var(--font-family-base)" }}>
                <i className="bi bi-gear me-2"></i> Configuración
              </Link>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
                style={{ fontFamily: "var(--font-family-base)" }}
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
