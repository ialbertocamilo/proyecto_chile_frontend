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
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false); 
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
      // En móviles, forzamos que la navbar se mantenga cerrada.
      if (mobile) {
        setIsNavOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  // Abrir/cerrar el submenú según la ruta actual
  useEffect(() => {
    // Si estamos en /workflow-part1-create o /workflow-part2-create, abrimos el submenú
    if (
      router.pathname === "/workflow-part1-create" ||
      router.pathname === "/workflow-part2-create"
    ) {
      setIsSubmenuOpen(true);
    } else {
      setIsSubmenuOpen(false);
    }
  }, [router.pathname]);

  const handleLogout = () => {
    if (!isClient) return;
    localStorage.clear();
    router.push("/login");
  };

  // Alternar la visibilidad de la navbar
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

  // Para iconos generales: se marca solo si router.pathname === path
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

  // Ícono especial para "Crear Proyecto": se marca si la ruta es /workflow-part1-create o /workflow-part2-create
  const createProjectIconStyle: React.CSSProperties = {
    ...iconStyle(""), // base vacía para no comparar con path exacto
    backgroundColor:
      router.pathname === "/workflow-part1-create" ||
      router.pathname === "/workflow-part2-create"
        ? "rgba(50, 50, 50, 0.3)"
        : "transparent",
  };

  // Ícono especial para "Desarrollo de proyecto": se marca solo si router.pathname === /workflow-part2-create
  const developmentIconStyle: React.CSSProperties = {
    ...iconStyle(""),
    backgroundColor:
      router.pathname === "/workflow-part2-create"
        ? "rgba(50, 50, 50, 0.3)"
        : "transparent",
  };

  // Contenedor del logo
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
    zIndex: 999,
  };

  // Ancho dinámico del sidebar
  const navbarWidth = isNavOpen
    ? (isMobile ? "11.5em" : "18em")
    : (isMobile ? "6em" : "8.5em");

  // Tamaños de logo para desktop y móvil
  const desktopLogoWidth = 97;
  const desktopLogoHeight = 50;
  const mobileLogoWidth = 63;
  const mobileLogoHeight = 47;

  return (
    <>
      <GoogleIcons />
      
      {/* Botón flotante en mobile cuando la navbar está cerrada */}
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

      {/* Navbar en desktop o en mobile cuando está abierta */}
      {(!isMobile || (isMobile && isNavOpen)) && (
        <nav
          className="sidebar d-flex flex-column"
          style={{
            position: isMobile ? "fixed" : "absolute",
            top: 0,
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
          {/* Logo */}
          <div style={logoContainerStyle}>
            <Image
              src={isNavOpen ? "/assets/images/ceela.png" : "/assets/images/logo-min.png"}
              alt="Logo"
              width={isMobile ? mobileLogoWidth : desktopLogoWidth}
              height={isMobile ? mobileLogoHeight : desktopLogoHeight}
              style={{ borderRadius: "0", zIndex: 1100 }}
            />
            {/* Botón para alternar la navbar */}
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
              height: "100%"
            }}
          >
            <ul className="nav flex-column">
              {roleId === "1" ? (
                <>
                  {/* Sección General */}
                  <div className="nav-section">
                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "0.8rem",
                          opacity: 0.7
                        }}
                      >
                        General
                      </span>
                    </div>
                    <div style={{ display: 'block' }}>
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
                          <span
                            style={iconStyle("/dashboard")}
                            className="material-icons"
                          >
                            dashboard
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
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
                          <span
                            style={iconStyle("/project-status")}
                            className="material-icons"
                          >
                            folder
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
                            Proyectos
                          </span>
                        </Link>
                      </li>
                    </div>
                  </div>

                  {/* Sección Configuración */}
                  <div className="nav-section" style={{ marginTop: "20px" }}>
                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "0.8rem",
                          opacity: 0.7
                        }}
                      >
                        Configuración
                      </span>
                    </div>
                    <div style={{ display: 'block' }}>
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
                          <span
                            style={iconStyle("/user-management")}
                            className="material-icons"
                          >
                            people
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
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
                          <span
                            style={iconStyle("/administration")}
                            className="material-icons"
                          >
                            settings
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
                            Parámetros
                          </span>
                        </Link>
                      </li>
                    </div>
                  </div>
                </>
              ) : roleId === "2" && (
                <>
                  {/* Sección General */}
                  <div className="nav-section">
                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "0.8rem",
                          opacity: 0.7
                        }}
                      >
                        General
                      </span>
                    </div>
                    <div style={{ display: 'block' }}>
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
                          <span
                            style={iconStyle("/data-entry")}
                            className="material-icons"
                          >
                            input
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
                            Ingreso de Datos de entrada
                          </span>
                        </Link>
                      </li>
                    </div>
                  </div>

                  {/* Sección Proyecto */}
                  <div className="nav-section" style={{ marginTop: "20px" }}>
                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "0.8rem",
                          opacity: 0.7
                        }}
                      >
                        Proyecto
                      </span>
                    </div>
                    <div style={{ display: 'block' }}>
                      {/* Listado */}
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
                          <span
                            style={iconStyle("/project-list")}
                            className="material-icons"
                          >
                            dns
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
                            Listado
                          </span>
                        </Link>
                      </li>

                      {/* Crear Proyecto con submenú */}
                      <li className="nav-item">
                        <div
                          className="nav-link text-white"
                          style={{
                            ...navLinkStyle,
                            flexDirection: isNavOpen ? "row" : "column",
                            justifyContent: isNavOpen ? "flex-start" : "center",
                            padding: isNavOpen ? "10px 20px" : "10px 5px",
                            cursor: "pointer",
                          }}
                          // <--- AQUÍ: redirigimos a /workflow-part1-create y alternamos submenú
                          onClick={() => {
                            setIsSubmenuOpen((prev) => !prev);
                            router.push("/workflow-part1-create");
                          }}
                        >
                          <span
                            // Ícono de Crear Proyecto: se marca si ruta es /workflow-part1-create o /workflow-part2-create
                            style={createProjectIconStyle}
                            className="material-icons"
                          >
                            note_add
                          </span>
                          <span
                            style={{
                              marginLeft: isNavOpen ? "10px" : "0",
                              display: !isMobile && !isNavOpen ? "none" : "block"
                            }}
                          >
                            Crear Proyecto
                          </span>
                          {isNavOpen && (
                            <span
                              className="material-icons"
                              style={{
                                marginLeft: "auto",
                                transform: isSubmenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s ease",
                              }}
                            >
                              expand_more
                            </span>
                          )}
                        </div>
                        {/* Submenú (Desarrollo de proyecto) solo visible si la navbar está expandida */}
                        {isNavOpen && (
                          <div
                            style={{
                              maxHeight: isSubmenuOpen ? "200px" : "0px",
                              opacity: isSubmenuOpen ? 1 : 0,
                              overflow: "hidden",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <ul
                              className="nav flex-column"
                              style={{ paddingLeft: "20px" }}
                            >
                              <li className="nav-item">
                                <Link
                                  href="/workflow-part2-create"
                                  className="nav-link text-white"
                                  style={{
                                    ...navLinkStyle,
                                    flexDirection: "row",
                                    justifyContent: "flex-start",
                                    padding: "10px 20px"
                                  }}
                                >
                                  <span
                                    // Ícono de Desarrollo de proyecto: solo se marca si la ruta es /workflow-part2-create
                                    style={developmentIconStyle}
                                    className="material-icons"
                                  >
                                    ballot
                                  </span>
                                  <span
                                    style={{
                                      marginLeft: "10px",
                                      display: "block"
                                    }}
                                  >
                                    Desarrollo de proyecto
                                  </span>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        )}
                      </li>
                    </div>
                  </div>
                </>
              )}
            </ul>
            
            <ul className="nav flex-column" style={{ marginTop: "auto" }}>
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
                  <span
                    style={iconStyle("/logout")}
                    className="material-icons"
                  >
                    logout
                  </span>
                  <span
                    style={{
                      marginLeft: isNavOpen ? "10px" : "0",
                      display: !isMobile && !isNavOpen ? "none" : "block"
                    }}
                  >
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
