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

const Navbar = ({ setActiveView }: NavbarProps) => {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("/assets/images/proyecto-deuman-logo.png");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

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

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
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
    transition: "none",
    color: "#fff",
  };

  const iconStyle = (path: string): React.CSSProperties => ({
    fontSize: "1.5rem",
    marginBottom: "1px",
    color: "#fff",
    backgroundColor: router.pathname === path ? "rgba(50, 50, 50, 0.3)" : "transparent",
    borderRadius: "50%",
    padding: "8px",
    transition: "background-color 0.3s ease",
  });

  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    width: "100%", 
    minHeight: "80px", 
    boxSizing: "border-box",
    padding: "0 0.5rem",
    marginBottom: "1rem",
    color: "#fff",
  };

  const logoSize = 80;

  return (
    <>
      <GoogleIcons />
      <nav
        className="sidebar d-flex flex-column p-3"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1200,
          width: "100px", // Ancho fijo
          backgroundColor: "var(--primary-color)",
          height: "100vh",
          fontFamily: "var(--font-family-base)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "none",
        }}
      >
        <div style={logoContainerStyle}>
          <Link href="/dashboard">
            <div style={{ cursor: "pointer" }} onClick={() => setActiveView("dashboard")}>
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
          <ul className="nav flex-column">
            {roleId !== "1" && (
              <li className="nav-item">
                <Link href="/project-list" className="nav-link text-white" style={navLinkStyle}>
                  <span style={iconStyle("/project-list")} className="material-icons">
                    dns
                  </span>
                  Proyectos
                </Link>
              </li>
            )}
            {roleId !== "1" && (
              <li className="nav-item">
                <Link href="/project-workflow-part1" className="nav-link text-white" style={navLinkStyle}>
                  <span style={iconStyle("/project-workflow-part1")} className="material-icons">
                    note_add
                  </span>
                  Proyecto Nuevo
                </Link>
              </li>
            )}
            {projectId && roleId === "2" && (
              <>
                <li className="nav-item">
                  <Link href="/project-workflow-part3" className="nav-link text-white" style={navLinkStyle}>
                    <span style={iconStyle("/project-workflow-part3")} className="material-icons">
                      ballot
                    </span>
                    Desarrollo de proyecto
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/project-workflow-part2" className="nav-link text-white" style={navLinkStyle}>
                    <span style={iconStyle("/project-workflow-part2")} className="material-icons">
                      input
                    </span>
                    Ingreso de Datos de entrada
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="nav flex-column" style={{ marginTop: "auto" }}>
            {roleId !== "2" && (
              <>
                <li className="nav-item">
                  <Link href="/dashboard" className="nav-link text-white" style={navLinkStyle}>
                    <span style={iconStyle("/dashboard")} className="material-icons">
                      dashboard
                    </span>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/project-status" className="nav-link text-white" style={navLinkStyle}>
                    <span style={iconStyle("/project-status")} className="material-icons">
                      format_list_bulleted
                    </span>
                    Proyectos registrados
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/user-management" className="nav-link text-white" style={navLinkStyle}>
                    <span style={iconStyle("/user-management")} className="material-icons">
                      person
                    </span>
                    Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/administration" className="nav-link text-white" style={navLinkStyle}>
                    <span style={iconStyle("/administration")} className="material-icons">
                      build
                    </span>
                    Parámetros
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <div className="nav-link text-white" style={navLinkStyle} onClick={handleLogout}>
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
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;
