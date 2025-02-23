"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import GoogleIcons from "./GoogleIcons"; // Asegúrate de tener este archivo en la misma carpeta

interface NavbarProps {
  setSidebarWidth: (width: string) => void;
  setActiveView: (view: string) => void;
}

const Navbar = ({ setSidebarWidth, setActiveView }: NavbarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    proyectos: false,
    user: false,
    parametros: false,
  });
  const [logoUrl, setLogoUrl] = useState("/assets/images/proyecto-deuman-logo.png");

  useEffect(() => {
    setSidebarWidth(isOpen ? "300px" : "80px");
  }, [isOpen, setSidebarWidth]);

  useEffect(() => {
    const storedLogo = localStorage.getItem("logoUrl");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (menu: "proyectos" | "user" | "parametros") => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setSubmenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const navLinkStyle: React.CSSProperties = {
    cursor: "pointer",
    fontFamily: "var(--font-family-base)",
    display: "flex",
    alignItems: "center",
    justifyContent: isOpen ? "flex-start" : "center",
    width: "100%",
    paddingLeft: "2px",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "2rem",     // Tamaño del ícono
    width: "2rem",        // Ancho
    textAlign: "center",  // Centra el contenido
    marginRight: isOpen ? "10px" : "0",
    marginLeft: "5px",
  };

  return (
    <>
      {/* Inyecta la librería de Google Icons */}
      <GoogleIcons />
      <nav
        className="sidebar d-flex flex-column p-3"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1000,
          width: isOpen ? "300px" : "80px",
          backgroundColor: "var(--primary-color)",
          color: "#fff",
          height: "100vh",
          fontFamily: "var(--font-family-base)",
        }}
      >
        <div
          className={`d-flex align-items-center mb-4 ${isOpen ? "justify-content-center" : "justify-content-between"}`}
          style={{ fontFamily: "var(--font-family-base)" }}
        >
          <Link href="/dashboard">
            {/* Uso de setActiveView al hacer clic en la imagen */}
            <div onClick={() => setActiveView("dashboard")}>
              <Image
                src={logoUrl}
                alt="Proyecto Ceela"
                width={55}
                height={55}
                style={{ borderRadius: "50%", cursor: "pointer" }}
              />
            </div>
          </Link>
          {/* Muestra el toggle solo cuando la sidebar está colapsada */}
          {!isOpen && (
            <div
              onClick={toggleSidebar}
              style={{
                cursor: "pointer",
                color: "#fff",
                fontSize: "2rem",
                lineHeight: "0",
                fontFamily: "var(--font-family-base)",
              }}
            >
              <span style={iconStyle} className="material-icons">
                {isOpen ? "chevron_left" : "chevron_right"}
              </span>
            </div>
          )}
        </div>

        {/* Contenedor del menú de navegación */}
        <div
          className="menu-container"
          style={{
            fontFamily: "var(--font-family-base)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          <ul className="nav flex-column">
            {/* Elemento Dashboard */}
            <li className="nav-item mb-3">
              <Link href="/dashboard" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">dashboard</span>
                {isOpen && "Dashboard"}
              </Link>
            </li>

            {/* Menú de Proyectos */}
            <li className="nav-item mb-3">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                style={navLinkStyle}
                onClick={() => toggleSubmenu("proyectos")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={iconStyle} className="material-icons">view_list</span>
                  {isOpen && "Proyectos"}
                </div>
                {isOpen && (
                  <span style={iconStyle} className="material-icons">
                    {submenuOpen.proyectos ? "expand_less" : "expand_more"}
                  </span>
                )}
              </div>
              {submenuOpen.proyectos && isOpen && (
                <ul className="nav flex-column ms-3 submenu">
                  <li className="nav-item">
                    <Link href="/project-list" className="nav-link text-white" style={navLinkStyle}>
                      Listado De Proyectos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/project-workflow" className="nav-link text-white" style={navLinkStyle}>
                      Registro De Proyectos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/project-status" className="nav-link text-white" style={navLinkStyle}>
                      Estado De Proyectos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/parametros" className="nav-link text-white" style={navLinkStyle}>
                      Registro De Parámetros
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/recintos" className="nav-link text-white" style={navLinkStyle}>
                      Registro De Recintos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/resultados" className="nav-link text-white" style={navLinkStyle}>
                      Emisión De Resultados
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Menú de Usuarios */}
            <li className="nav-item mb-3">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                style={navLinkStyle}
                onClick={() => toggleSubmenu("user")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={iconStyle} className="material-icons">person</span>
                  {isOpen && "Usuarios"}
                </div>
                {isOpen && (
                  <span style={iconStyle} className="material-icons">
                    {submenuOpen.user ? "expand_less" : "expand_more"}
                  </span>
                )}
              </div>
              {submenuOpen.user && isOpen && (
                <ul className="nav flex-column ms-3 submenu">
                  <li className="nav-item">
                    <Link href="/user-management" className="nav-link text-white" style={navLinkStyle}>
                      Listado De Usuarios
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/user-create" className="nav-link text-white" style={navLinkStyle}>
                      Registro De Usuario
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Menú de Parámetros */}
            <li className="nav-item mb-3">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                style={navLinkStyle}
                onClick={() => toggleSubmenu("parametros")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={iconStyle} className="material-icons">tune</span>
                  {isOpen && "Parametros"}
                </div>
                {isOpen && (
                  <span style={iconStyle} className="material-icons">
                    {submenuOpen.parametros ? "expand_less" : "expand_more"}
                  </span>
                )}
              </div>
              {submenuOpen.parametros && isOpen && (
                <ul className="nav flex-column ms-3 submenu">
                  <li className="nav-item">
                    <Link href="/constants-management" className="nav-link text-white" style={navLinkStyle}>
                      Listado De Materiales
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/administration" className="nav-link text-white" style={navLinkStyle}>
                      Administrador de Parametros
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Elemento de Configuración */}
            <li className="nav-item mb-3">
              <Link href="/settings" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">settings</span>
                {isOpen && "Configuración"}
              </Link>
            </li>

            {/* Elemento Salir */}
            <li className="nav-item mb-3">
              <div className="nav-link text-white" style={navLinkStyle} onClick={handleLogout}>
                <span style={iconStyle} className="material-icons">logout</span>
                {isOpen && "Salir"}
              </div>
            </li>
          </ul>
        </div>

        {/* Estilos adicionales locales */}
        <style jsx>{`
          .sidebar {
            overflow-x: hidden;
          }
          .submenu {
            margin-top: 0.5rem;
            font-family: var(--font-family-base);
          }
          .menu-container {
            width: 100%;
            flex: 1;
            background-color: var(--primary-color);
            padding: 0;
            border-radius: 0.5rem;
            font-family: var(--font-family-base);
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;
