import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import GoogleIcons from "./GoogleIcons";

interface NavbarProps {
  setSidebarWidth: (width: string) => void;
  setActiveView: (view: string) => void;
}

const Navbar = ({ setSidebarWidth, setActiveView }: NavbarProps) => {
  const router = useRouter();
  // Se elimina el estado "isOpen" ya que no se usará para expandir/colapsar
  const [logoUrl, setLogoUrl] = useState("/assets/images/proyecto-deuman-logo.png");

  // Se establece el ancho fijo de la sidebar (sin expansión)
  useEffect(() => {
    setSidebarWidth("100px");
  }, [setSidebarWidth]);

  useEffect(() => {
    const storedLogo = localStorage.getItem("logoUrl");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // --- ESTILOS PRINCIPALES ---
  const navLinkStyle: React.CSSProperties = {
    cursor: "pointer",
    fontFamily: "var(--font-family-base)",
    display: "flex",
    flexDirection: "column", // Ícono arriba, texto abajo
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
    padding: "5px",
    marginBottom: "10px",
    boxSizing: "border-box",
    fontSize: "0.7rem",
    lineHeight: "1.2",
    whiteSpace: "normal",
    wordWrap: "break-word",
    transition: "none",
    color: "#fff",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    marginBottom: "4px",
    color: "#fff",
  };

  // Contenedor del logo
  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centrado, ya que se eliminó la flecha
    width: "100%",         // Ocupa todo el ancho del nav
    minHeight: "80px",     // Ajusta el alto del área de logo
    boxSizing: "border-box",
    padding: "0 0.5rem",
    marginBottom: "1rem",
    color: "#fff",
  };

  // El tamaño del logo se mantiene fijo en el sidebar colapsado
  const logoSize = 80;

  return (
    <>
      <GoogleIcons />
      <nav
        className="sidebar d-flex flex-column p-3"
        // Se eliminan los eventos de mouse para evitar la expansión al pasar el mouse
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1000,
          width: "100px", // Ancho fijo
          backgroundColor: "#359EA7",
          height: "100vh",
          fontFamily: "var(--font-family-base)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "none", // Sin animación
        }}
      >
        {/* Contenedor del logo */}
        <div style={logoContainerStyle}>
          <Link href="/dashboard">
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setActiveView("dashboard")}
            >
              <Image
                src={logoUrl}
                alt="Proyecto Ceela"
                width={logoSize}
                height={logoSize}
                style={{ borderRadius: "50%" }}
              />
            </div>
          </Link>
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
          {/* Grupo Superior */}
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link href="/project-list" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">dns</span>
                Proyectos
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/project-workflow" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">note_add</span>
                Proyecto Nuevo
              </Link>
            </li>
          </ul>

          {/* Grupo Inferior alineado al fondo */}
          <ul className="nav flex-column" style={{ marginTop: "auto" }}>
            <li className="nav-item">
              <Link href="/dashboard" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/project-status" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">format_list_bulleted</span>
                Proyectos registrados
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/user-management" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">person</span>
                Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/administration" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">build</span>
                Parámetros
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className="nav-link text-white" style={navLinkStyle}>
                <span style={iconStyle} className="material-icons">settings</span>
                Ajustes
              </Link>
            </li>
            <li className="nav-item">
              <div className="nav-link text-white" style={navLinkStyle} onClick={handleLogout}>
                <span style={iconStyle} className="material-icons">logout</span>
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
            background-color: #359ea7;
            padding: 0;
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;
