'use client'
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import GoogleIcons from "../../../public/GoogleIcons";
import useIsClient from "../../utils/useIsClient";

interface NavbarProps {
  setActiveView?: (view: string) => void;
  onNavbarToggle?: (isOpen: boolean) => void; // Para notificar al componente padre sobre el estado de la navbar
}

const Navbar: React.FC<NavbarProps> = ({ onNavbarToggle }) => {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("/assets/images/proyecto-deuman-logo.png");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);
  const isClient = useIsClient();
  
  useEffect(() => {
    if (!isClient) return;
    const storedLogo = localStorage.getItem("logoUrl");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, [isClient]);
  
  useEffect(() => {
    if (!isClient) return;
    const storedRole = localStorage.getItem("role_id");
    if (storedRole) {
      setRoleId(storedRole);
    }
  }, [isClient]);
  
  useEffect(() => {
    if (!isClient) return;
    const storedProjectId = localStorage.getItem("project_id");
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, [isClient]);
  
  useEffect(() => {
    if (!isClient) return;
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  const handleLogout = () => {
    if (!isClient) return;
    localStorage.clear();
    router.push("/login");
  };

  const toggleNavbar = () => {
    setAnimateIcon(true);
    const newState = !isNavbarVisible;
    setIsNavbarVisible(newState);
    // Notifica al componente padre sobre el cambio de estado
    if (onNavbarToggle) {
      onNavbarToggle(newState);
    }
    setTimeout(() => setAnimateIcon(false), 300);
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
    padding: "10px 5px",
    marginBottom: "8px",
    boxSizing: "border-box",
    fontSize: "0.85rem",
    lineHeight: "1.3",
    whiteSpace: "normal",
    wordWrap: "break-word",
    transition: "all 0.3s ease",
    color: "#fff",
    fontWeight: "normal",
    borderRadius: "4px",
    opacity: 0.9,
  };
  
  const iconStyle = (path: string): React.CSSProperties => ({
    fontSize: "1.5rem",
    marginBottom: "1px",
    color: "#fff",
    backgroundColor:
      router.pathname === path ? "rgba(50, 50, 50, 0.3)" : "transparent",
    borderRadius: "50%",
    padding: "0.5rem",
    transition: "background-color 0.5s ease",
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
    minHeight: "100px",
    boxSizing: "border-box",
    padding: isMobile ? "1rem 0.5rem" : "1rem 0.5rem",
    marginBottom: "1rem",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    position: "relative",
    zIndex: 999
  };
  
  const logoSize = 70;
  
  // Calcula el ancho basado en el tipo de dispositivo
  const navbarWidth = isMobile ? "40%" : "6.5em";
  
  return (
    <>
      <GoogleIcons />
      
      {/* Botón flotante para expandir la navbar (solo se muestra cuando está comprimida) */}
      {!isNavbarVisible && (
        <div
          className="navbar-toggle"
          onClick={toggleNavbar}
          style={{
            position: "fixed",
            top: isMobile ? "1.5rem" : "1.5rem",
            left: "1.5rem",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: `2px solid rgba(0, 0, 0, 0.2)`,
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            transition: "all 0.3s ease",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            transform: animateIcon ? "scale(0.95)" : "scale(1)"
          }}
        >
          <span
            className="material-icons"
            style={{
              color: "#000",
              fontSize: "1.5rem"
            }}
          >
            menu
          </span>
        </div>
      )}
  
      <nav
        className="sidebar d-flex flex-column"
        style={{
          position: "fixed",
          top: isMobile ? "0" : 0,
          bottom: 0,
          left: isNavbarVisible ? 0 : isMobile ? "-50%" : "-6.5em",
          zIndex: 1200,
          width: navbarWidth,
          backgroundColor: "var(--primary-color)",
          fontFamily: "var(--font-family-base)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div style={logoContainerStyle}>
          <Link href="/dashboard" style={{ cursor: "pointer" }}>
            <Image
              src={logoUrl}
              alt="Proyecto Ceela"
              width={logoSize}
              height={logoSize}
              style={{ borderRadius: "50%", zIndex: 1100 }}
            />
          </Link>
          {/* Botón para colapsar la navbar: solo muestra el icono sin bordes ni fondo */}
          {isNavbarVisible && (
            <div
              className="navbar-toggle-inside"
              onClick={toggleNavbar}
              style={{
                marginTop: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                // Elimina el borde y fondo para que se "camufle"
                border: "none",
                backgroundColor: "transparent"
              }}
            >
              <span
                className="material-icons"
                style={{ color: "#fff", fontSize: "1.5rem" }}
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
                  <span style={iconStyle("/project-list")} className="material-icons">
                    dns
                  </span>
                  Proyectos
                </Link>
              </li>
            )}
            {roleId !== "1" && (
              <li className="nav-item">
                <Link
                  href="/workflow-part1-create"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span
                    style={iconStyle("/workflow-part1-create")}
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
                  href="/workflow-part2-create"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span
                    style={iconStyle("/workflow-part2-create")}
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
                  href="/data-entry"
                  className="nav-link text-white"
                  style={navLinkStyle}
                >
                  <span style={iconStyle("/data-entry")} className="material-icons">
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
                    <span style={iconStyle("/dashboard")} className="material-icons">
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
                    <span style={iconStyle("/project-status")} className="material-icons">
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
                    <span style={iconStyle("/user-management")} className="material-icons">
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
                    <span style={iconStyle("/administration")} className="material-icons">
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
          @media (max-width: 1024px) {
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
