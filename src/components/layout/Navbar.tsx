'use client'
import "bootstrap/dist/css/bootstrap.min.css";
import { FileInput, FilePlus, FolderKanban, LayoutDashboard, ListTodo, LogOut, Menu, Settings, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useIsClient from "../../utils/useIsClient";

interface NavbarProps {
  setActiveView?: (view: string) => void;  // Make it optional since it's not being used
}

const Navbar: React.FC<NavbarProps> = () => {  // Changed to proper type declaration
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("/assets/images/proyecto-deuman-logo.png");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);
  // State for tracking expanded menu sections
  const [expandedMenus, setExpandedMenus] = useState<{
    projects: boolean;
    configuration: boolean;
    general: boolean;
    project: boolean;
  }>({ projects: false, configuration: false, general: false, project: false });
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
      const mobile = isClient && window.innerWidth <= 1024;
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
    setIsNavbarVisible(!isNavbarVisible);
    setTimeout(() => setAnimateIcon(false), 300);
  };

  // Toggle functions for each menu section
  const toggleMenu = (menuName: 'projects' | 'configuration' | 'general' | 'project') => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
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
  
  const menuHeaderStyle: React.CSSProperties = {
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
    fontWeight: "bold",
    lineHeight: "1.3",
    whiteSpace: "normal",
    wordWrap: "break-word",
    transition: "all 0.3s ease",
    color: "#fff",
    borderRadius: "4px",
    opacity: 0.9,
    position: "relative",
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
  const logoSize = 80;
  return (
    <>
      {/* Toggle button for both mobile and desktop */}
      <div
        className="navbar-toggle"
        onClick={toggleNavbar}
        style={{
          position: "fixed",
          top: isMobile ? "1.5rem" : "1.5rem",
          left: isMobile && isNavbarVisible ? "calc(40% + 1rem)" : isNavbarVisible ? "6.5em" : "1.5rem",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: `2px solid ${isNavbarVisible ? "#fff" : "rgba(0, 0, 0, 0.2)"}`,
          backgroundColor: isNavbarVisible ? "var(--primary-color)" : "#fff",
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
        <Menu 
          size={24}
          style={{
            color: isNavbarVisible ? "#fff" : "#000"
          }}
        />
      </div>
  
      <nav
        className="sidebar d-flex flex-column"
        style={{
          position: "fixed",
          top: isMobile ? "0" : 0,
          bottom: 0,
          left: isNavbarVisible ? 0 : isMobile ? "-50%" : "-6.5em",
          zIndex: 1200,
          width: isMobile ? "40%" : "6.5em",
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
            {/* Admin-specific menu items */}
            {roleId === "1" && (
              <>
                {/* General section - Dashboard */}
                <li className="nav-item">
                  <div 
                    className="nav-link text-white" 
                    style={menuHeaderStyle}
                    onClick={() => toggleMenu('general')}
                  >
                    General
                    <span style={{ 
                      position: "absolute", 
                      right: "5px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      transition: "transform 0.3s ease",
                      transform: expandedMenus.general ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)"
                    }}>
                      ▼
                    </span>
                  </div>
                  {expandedMenus.general && (
                    <ul className="nav flex-column" style={{ paddingLeft: "10px" }}>
                      <li className="nav-item">
                        <Link
                          href="/dashboard"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/dashboard")}>
                            <LayoutDashboard size={20} />
                          </div>
                          Dashboard
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Projects section for Admin */}
                <li className="nav-item mt-3 mb-1">
                  <div 
                    className="nav-link text-white" 
                    style={menuHeaderStyle}
                    onClick={() => toggleMenu('projects')}
                  >
                    <div style={iconStyle("/project-status")}>
                      <FolderKanban size={24} />
                    </div>
                    Proyectos
                    <span style={{ 
                      position: "absolute", 
                      right: "5px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      transition: "transform 0.3s ease",
                      transform: expandedMenus.projects ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)"
                    }}>
                      ▼
                    </span>
                  </div>
                  {expandedMenus.projects && (
                    <ul className="nav flex-column" style={{ paddingLeft: "10px" }}>
                      <li className="nav-item">
                        <Link
                          href="/project-status"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/project-status")}>
                            <FolderKanban size={20} />
                          </div>
                          Ver Proyectos
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                
                {/* Configuration section header */}
                <li className="nav-item mt-3 mb-1">
                  <div 
                    className="nav-link text-white" 
                    style={menuHeaderStyle}
                    onClick={() => toggleMenu('configuration')}
                  >
                    <div style={iconStyle("/administration")}>
                      <Settings size={24} />
                    </div>
                    Configuración
                    <span style={{ 
                      position: "absolute", 
                      right: "5px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      transition: "transform 0.3s ease",
                      transform: expandedMenus.configuration ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)"
                    }}>
                      ▼
                    </span>
                  </div>
                  
                  {/* Nested items under Configuración */}
                  {expandedMenus.configuration && (
                    <ul className="nav flex-column" style={{ paddingLeft: "10px" }}>
                      {/* Users */}
                      <li className="nav-item">
                        <Link
                          href="/user-management"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/user-management")}>
                            <Users size={20} />
                          </div>
                          Usuarios
                        </Link>
                      </li>
                      
                      {/* Parameters */}
                      <li className="nav-item">
                        <Link
                          href="/administration"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/administration")}>
                            <Settings size={20} />
                          </div>
                          Parámetros
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}

            {/* Operator-specific menu items */}
            {roleId === "2" && (
              <>
                {/* General section */}
                <li className="nav-item">
                  <div 
                    className="nav-link text-white" 
                    style={menuHeaderStyle}
                    onClick={() => toggleMenu('general')}
                  >
                    <div style={iconStyle("/dashboard")}>
                      <LayoutDashboard size={24} />
                    </div>
                    General
                    <span style={{ 
                      position: "absolute", 
                      right: "5px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      transition: "transform 0.3s ease",
                      transform: expandedMenus.general ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)"
                    }}>
                      ▼
                    </span>
                  </div>
                  {expandedMenus.general && (
                    <ul className="nav flex-column" style={{ paddingLeft: "10px" }}>
                      {/* Dashboard */}
                      <li className="nav-item">
                        <Link
                          href="/dashboard"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/dashboard")}>
                            <LayoutDashboard size={20} />
                          </div>
                          Dashboard
                        </Link>
                      </li>
                      
                      {/* Data Entry */}
                      <li className="nav-item">
                        <Link
                          href="/data-entry"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/data-entry")}>
                            <FileInput size={20} />
                          </div>
                          Datos de Entrada
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                
                {/* Project section header */}
                <li className="nav-item mt-3 mb-1">
                  <div 
                    className="nav-link text-white" 
                    style={menuHeaderStyle}
                    onClick={() => toggleMenu('project')}
                  >
                    <div style={iconStyle("/project-list")}>
                      <FolderKanban size={24} />
                    </div>
                    Proyecto
                    <span style={{ 
                      position: "absolute", 
                      right: "5px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      transition: "transform 0.3s ease",
                      transform: expandedMenus.project ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)"
                    }}>
                      ▼
                    </span>
                  </div>
                  
                  {/* Nested items under Proyecto */}
                  {expandedMenus.project && (
                    <ul className="nav flex-column" style={{ paddingLeft: "10px" }}>
                      {/* Project List */}
                      <li className="nav-item">
                        <Link
                          href="/project-list"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/project-list")}>
                            <ListTodo size={20} />
                          </div>
                          Listado
                        </Link>
                      </li>
                      
                      {/* Create Project */}
                      <li className="nav-item">
                        <Link
                          href="/workflow-part1-create"
                          className="nav-link text-white"
                          style={{...navLinkStyle, fontSize: "0.8rem", padding: "8px 5px"}}
                        >
                          <div style={iconStyle("/workflow-part1-create")}>
                            <FilePlus size={20} />
                          </div>
                          Crear Proyecto
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
  
          <ul className="nav flex-column" style={{ marginTop: "auto" }}>
            {/* Logout button - common for both roles */}
            <li className="nav-item">
              <div
                className="nav-link text-white"
                style={navLinkStyle}
                onClick={handleLogout}
              >
                <div style={iconStyle("/logout")}>
                  <LogOut size={24} />
                </div>
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
