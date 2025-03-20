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
  onNavbarToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavbarToggle }) => {
  const router = useRouter();
  const [roleId, setRoleId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const isClient = useIsClient();

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
      // En dispositivos móviles se forzará que la navbar se mantenga cerrada.
      if (mobile) {
        setIsNavOpen(false);
      }
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

  // Función para alternar la visibilidad/estado de la navbar
  const handleNewFunction = () => {
    setIsNavOpen((prev) => {
      const newState = !prev;
      if (onNavbarToggle) {
        onNavbarToggle(newState);
      }
      return newState;
    });
  };

  // Estilo base para cada link
  const navLinkStyle: React.CSSProperties = {
    cursor: "pointer",
    fontFamily: "var(--font-family-base)",
    display: "flex",
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
    marginBottom: isNavOpen ? 0 : "1px",
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

  // Definimos tamaños separados para ancho y alto en desktop y móvil
  const desktopLogoWidth = 97;
  const desktopLogoHeight = 50;
  const mobileLogoWidth = 63;
  const mobileLogoHeight = 47;

  // Calcula el ancho de la navbar según si está desplegada y el dispositivo
  const navbarWidth = isNavOpen
    ? (isMobile ? "11.5em" : "18em")
    : (isMobile ? "6em" : "8.5em");

  return (
    <>
      <GoogleIcons />
      
      {/* Si es mobile y la navbar está cerrada, mostramos un botón flotante */}
      {isMobile && !isNavOpen && (
        <button 
          onClick={handleNewFunction}
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            zIndex: 1200,
            backgroundColor: "var(--primary-color)",
            border: "none",
            color: "#fff",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <span className="material-icons" style={{ fontSize: "1.5rem" }}>
            menu
          </span>
        </button>
      )}

      {/* Se muestra la navbar en desktop o en mobile cuando esté abierta */}
      {(!isMobile || (isMobile && isNavOpen)) && (
        <nav
          className="sidebar d-flex flex-column"
          style={{
            position: "fixed",
            top: isMobile ? "0" : 0,
            bottom: 0,
            left: 0,
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
              <Image
                src={isMobile ? "/assets/images/proyecto-deuman-logo.png" : "/assets/images/ceela.png"}
                alt="Logo"
                width={isMobile ? mobileLogoWidth : desktopLogoWidth}
                height={isMobile ? mobileLogoHeight : desktopLogoHeight}
                style={{ borderRadius: "0", zIndex: 1100 }}
              />
            {/* Botón debajo del logo para alternar la visibilidad (solo se muestra en desktop o si se quiere cerrar en mobile) */}
            {(!isMobile || (isMobile && isNavOpen)) && (
              <div
                className="navbar-toggle-inside"
                onClick={handleNewFunction}
                style={{
                  marginTop: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
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
                    style={{
                      ...navLinkStyle,
                      flexDirection: isNavOpen ? "row" : "column",
                      justifyContent: isNavOpen ? "flex-start" : "center",
                      padding: isNavOpen ? "10px 20px" : "10px 5px"
                    }}
                  >
                    <span style={iconStyle("/project-list")} className="material-icons">
                      dns
                    </span>
                    <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                      Proyectos
                    </span>
                  </Link>
                </li>
              )}
              {roleId !== "1" && (
                <li className="nav-item">
                  <Link
                    href="/workflow-part1-create"
                    className="nav-link text-white"
                    style={{
                      ...navLinkStyle,
                      flexDirection: isNavOpen ? "row" : "column",
                      justifyContent: isNavOpen ? "flex-start" : "center",
                      padding: isNavOpen ? "10px 20px" : "10px 5px"
                    }}
                  >
                    <span
                      style={iconStyle("/workflow-part1-create")}
                      className="material-icons"
                    >
                      note_add
                    </span>
                    <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                      Proyecto Nuevo
                    </span>
                  </Link>
                </li>
              )}
              {projectId && roleId === "2" && (
                <li className="nav-item">
                  <Link
                    href="/workflow-part2-create"
                    className="nav-link text-white"
                    style={{
                      ...navLinkStyle,
                      flexDirection: isNavOpen ? "row" : "column",
                      justifyContent: isNavOpen ? "flex-start" : "center",
                      padding: isNavOpen ? "10px 20px" : "10px 5px"
                    }}
                  >
                    <span
                      style={iconStyle("/workflow-part2-create")}
                      className="material-icons"
                    >
                      ballot
                    </span>
                    <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                      Desarrollo de proyecto
                    </span>
                  </Link>
                </li>
              )}
              {roleId !== "1" && (
                <li className="nav-item">
                  <Link
                    href="/data-entry"
                    className="nav-link text-white"
                    style={{
                      ...navLinkStyle,
                      flexDirection: isNavOpen ? "row" : "column",
                      justifyContent: isNavOpen ? "flex-start" : "center",
                      padding: isNavOpen ? "10px 20px" : "10px 5px"
                    }}
                  >
                    <span style={iconStyle("/data-entry")} className="material-icons">
                      input
                    </span>
                    <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                      Ingreso de Datos de entrada
                    </span>
                  </Link>
                </li>
              )}
              {roleId !== "1" && (
                <li className="nav-item">
                  <Link
                    href="/ifc"
                    className="nav-link text-white"
                    style={{
                      ...navLinkStyle,
                      flexDirection: isNavOpen ? "row" : "column",
                      justifyContent: isNavOpen ? "flex-start" : "center",
                      padding: isNavOpen ? "10px 20px" : "10px 5px"
                    }}
                  >
                    <span style={iconStyle("/ifc")} className="material-icons">
                      apartment
                    </span>
                    <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                      IFC
                    </span>
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
                      style={{
                        ...navLinkStyle,
                        flexDirection: isNavOpen ? "row" : "column",
                        justifyContent: isNavOpen ? "flex-start" : "center",
                        padding: isNavOpen ? "10px 20px" : "10px 5px"
                      }}
                    >
                      <span style={iconStyle("/dashboard")} className="material-icons">
                        dashboard
                      </span>
                      <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                        Dashboard
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      href="/project-status"
                      className="nav-link text-white"
                      style={{
                        ...navLinkStyle,
                        flexDirection: isNavOpen ? "row" : "column",
                        justifyContent: isNavOpen ? "flex-start" : "center",
                        padding: isNavOpen ? "10px 20px" : "10px 5px"
                      }}
                    >
                      <span style={iconStyle("/project-status")} className="material-icons">
                        format_list_bulleted
                      </span>
                      <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                        Proyectos registrados
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      href="/user-management"
                      className="nav-link text-white"
                      style={{
                        ...navLinkStyle,
                        flexDirection: isNavOpen ? "row" : "column",
                        justifyContent: isNavOpen ? "flex-start" : "center",
                        padding: isNavOpen ? "10px 20px" : "10px 5px"
                      }}
                    >
                      <span style={iconStyle("/user-management")} className="material-icons">
                        person
                      </span>
                      <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                        Usuarios
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      href="/administration"
                      className="nav-link text-white"
                      style={{
                        ...navLinkStyle,
                        flexDirection: isNavOpen ? "row" : "column",
                        justifyContent: isNavOpen ? "flex-start" : "center",
                        padding: isNavOpen ? "10px 20px" : "10px 5px"
                      }}
                    >
                      <span style={iconStyle("/administration")} className="material-icons">
                        build
                      </span>
                      <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                        Parámetros
                      </span>
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <div
                  className="nav-link text-white"
                  style={{
                    ...navLinkStyle,
                    flexDirection: isNavOpen ? "row" : "column",
                    justifyContent: isNavOpen ? "flex-start" : "center",
                    padding: isNavOpen ? "10px 20px" : "10px 5px",
                    cursor: "pointer"
                  }}
                  onClick={handleLogout}
                >
                  <span style={iconStyle("/logout")} className="material-icons">
                    logout
                  </span>
                  <span style={{ marginLeft: isNavOpen ? "10px" : "0", display: !isMobile && !isNavOpen ? "none" : "block" }}>
                    Salir
                  </span>
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
      )}
    </>
  );
};

export default Navbar;
