import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import GoogleIcons from "../../../public/GoogleIcons";
import "../../../public/assets/css/globals.css";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({}: NavbarProps) => {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(
    "/assets/images/proyecto-deuman-logo.png"
  );
  const [roleId, setRoleId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedLogo = localStorage.getItem("logoUrl");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem("role_id");
    if (storedRole) {
      setRoleId(storedRole);
    }
  }, []);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("project_id");
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);

  // Detecta si estamos en modo móvil y ajusta el estado inicial
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  const navLinkStyle: React.CSSProperties = {
    cursor: "pointer",
    fontFamily: "var(--font-family-base)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
    padding: "5px",
    marginBottom: "10px",
    boxSizing: "border-box",
    fontSize: "0.78rem",
    lineHeight: "1.2",
    whiteSpace: "normal",
    wordWrap: "break-word",
    transition: "color 0.3s ease, background-color 0.3s ease",
    color: "#fff",
    fontWeight: "normal",
  };

  const iconStyle = (path: string): React.CSSProperties => ({
    fontSize: "1.5rem",
    marginBottom: "1px",
    color: "#fff",
    backgroundColor:
      router.pathname === path ? "rgba(50, 50, 50, 0.3)" : "transparent",
    borderRadius: "50%",
    padding: "0.5rem",
    transition: "background-color 0.3s ease",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  });

  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "80px",
    boxSizing: "border-box",
    padding: "0 0.5rem",
    marginBottom: "1rem",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  };

  const logoSize = 80;

  // Estilo para el botón toggle dentro del sidebar
  const toggleStyle: React.CSSProperties = isNavbarVisible
    ? {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "all 0.3s ease",
        backgroundColor: "transparent",
        padding: "8px",
      }
    : {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        left: "0",
        top: isMobile ? "10px" : "80px",
        transition: "all 0.3s ease",
        backgroundColor: "var(--primary-color)",
        borderRadius: "0 8px 8px 0",
        padding: "8px",
        zIndex: 1300,
      };

  return (
    <>
      <GoogleIcons />

      {/* Ícono de menú flotante en móviles */}
      {isMobile && (
        <span
          className="material-icons"
          onClick={toggleNavbar}
          style={{
            position: "fixed",
            top: "20px",
            left: "30px",
            color: "#000",
            fontSize: "1.5rem", // Se reduce de 2rem a 1.5rem
            cursor: "pointer",
            zIndex: 1400,
          }}
        >
          menu
        </span>
      )}

      <nav
        className="sidebar d-flex flex-column"
        style={{
          position: "fixed",
          top: isMobile ? "0" : 0,
          bottom: 0,
          left: isNavbarVisible ? 0 : isMobile ? "-50%" : "-6.5em",
          zIndex: 1200,
          width: isMobile ? "30%" : "6.5em",
          backgroundColor: "var(--primary-color)",
          fontFamily: "var(--font-family-base)",
          display: isMobile && !isNavbarVisible ? "none" : "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "left 0.3s ease",
        }}
      >
        <div style={logoContainerStyle}>
          <Image
            src={logoUrl}
            alt="Proyecto Ceela"
            width={logoSize}
            height={logoSize}
            style={{ borderRadius: "50%" }}
          />

          {/* Botón toggle dentro del sidebar en desktop */}
          {!isMobile && (
            <div
              className="navbar-toggle"
              onClick={toggleNavbar}
              style={toggleStyle}
            >
              <span
                className="material-icons"
                style={{ color: "#fff", fontSize: "1.5rem" }} // Se reduce de 1.7rem a 1.5rem
              >
                menu
              </span>
            </div>
          )}
        </div>

        <div
          className="menu-container"
          style={{
            fontFamily: "var(--font-family-base)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <ul className="nav flex-column">
            {roleId !== "1" && (
              <li className="nav-item">
                <Link
                  href="/project-list"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span
                    style={iconStyle("/project-list")}
                    className="material-icons"
                  >
                    dns
                  </span>
                  Proyectos
                </Link>
              </li>
            )}
            {roleId !== "1" && (
              <li className="nav-item">
                <Link
                  href="/project-workflow-part1"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span
                    style={iconStyle("/project-workflow-part1")}
                    className="material-icons"
                  >
                    note_add
                  </span>
                  Proyecto Nuevo
                </Link>
              </li>
            )}
            {projectId && roleId === "2" && (
              <li className="nav-item">
                <Link
                  href="/project-workflow-part3"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span
                    style={iconStyle("/project-workflow-part3")}
                    className="material-icons"
                  >
                    ballot
                  </span>
                  Desarrollo de proyecto
                </Link>
              </li>
            )}
            {roleId !== "1" && (
              <li className="nav-item">
                <Link
                  href="/project-workflow-part2"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span
                    style={iconStyle("/project-workflow-part2")}
                    className="material-icons"
                  >
                    input
                  </span>
                  Ingreso de Datos de entrada
                </Link>
              </li>
            )}
          </ul>

          <ul className="nav flex-column" style={{ marginTop: "auto" }}>
            {roleId !== "2" && (
              <>
                <li className="nav-item">
                  <Link
                    href="/dashboard"
                    className="nav-link text-white"
                    style={navLinkStyle}
                  >
                    <span
                      style={iconStyle("/dashboard")}
                      className="material-icons"
                    >
                      dashboard
                    </span>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/project-status"
                    className="nav-link text-white"
                    style={navLinkStyle}
                  >
                    <span
                      style={iconStyle("/project-status")}
                      className="material-icons"
                    >
                      format_list_bulleted
                    </span>
                    Proyectos registrados
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/user-management"
                    className="nav-link text-white"
                    style={navLinkStyle}
                  >
                    <span
                      style={iconStyle("/user-management")}
                      className="material-icons"
                    >
                      person
                    </span>
                    Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/administration"
                    className="nav-link text-white"
                    style={navLinkStyle}
                  >
                    <span
                      style={iconStyle("/administration")}
                      className="material-icons"
                    >
                      build
                    </span>
                    Parámetros
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <div
                className="nav-link text-white"
                style={navLinkStyle}
                onClick={handleLogout}
              >
                <span style={iconStyle("/logout")} className="material-icons">
                  logout
                </span>
                Salir
              </div>
            </li>
          </ul>
        </div>

        <style jsx>{`
          .sidebar {
            overflow-x: hidden;
          }
          .menu-container {
            width: 100%;
            flex: 1;
            background-color: var(--primary-color);
            padding: 0;
          }
          @media (max-width: 768px) {
            .sidebar {
              width: 50%;
            }
            .sidebar .nav-link {
              font-size: 0.7rem;
              padding: 3px;
            }
            .sidebar .nav-link .material-icons {
              margin-bottom: 0;
            }
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;
