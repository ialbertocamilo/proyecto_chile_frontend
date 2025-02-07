import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  setActiveView: (view: string) => void;
  setSidebarWidth: (width: string) => void;
}

const Navbar = ({ setActiveView, setSidebarWidth }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    proyectos: false,
    usuarios: false,
  });

  useEffect(() => {
    setSidebarWidth(isOpen ? "300px" : "80px");
  }, [isOpen, setSidebarWidth]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleClickAndExpand = (
    menu: "proyectos" | "usuarios" | null,
    view: string
  ) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    if (menu === "proyectos") {
      setSubmenuOpen((prev) => ({ ...prev, proyectos: !prev.proyectos }));
      setActiveView("projects");
    } else if (menu) {
      setSubmenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
    } else {
      setActiveView(view);
    }
  };

  return (
    <nav
      className="sidebar d-flex flex-column p-3"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        width: isOpen ? "300px" : "80px",
        backgroundColor: "#2c99a4",
        color: "#fff",
        transition: "width 0.1s ease",
        height: "100vh",
        
      }}
    >
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <img
          src="/assets/images/proyecto-deuman-logo.png"
          alt="Proyecto DEUMAN"
          className="logo"
          style={{ width: "50px", borderRadius: "50%", cursor: "pointer" }}
          onClick={() => handleClickAndExpand(null, "dashboard")}
        />
        <div
          onClick={toggleSidebar}
          style={{
            cursor: "pointer",
            color: "#fff",
            fontSize: "24px",
            marginLeft: "10px",
            lineHeight: "0",
          }}
        >
          <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
        </div>
      </div>

      <div className="menu-container">
        
        <ul className="nav flex-column">
          {/* Listado de proyectos */}
          <li className="nav-item mb-3">
            <a
              className="nav-link text-white d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => handleClickAndExpand("proyectos", "projects")}
            >
              <div>
                <i className="bi bi-list"></i> {isOpen && "Listado de proyectos"}
              </div>
              {isOpen && (
                <i
                  className={`bi ${
                    submenuOpen.proyectos ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              )}
            </a>
            {submenuOpen.proyectos && isOpen && (
              <ul className="nav flex-column ms-3 submenu">
                <li className="nav-item">
                  <a
                    onClick={() => handleClickAndExpand(null, "projectWorkflow")}
                    className="nav-link text-white"
                    style={{ cursor: "pointer" }}
                  >
                    Registro de proyecto
                  </a>
                </li>
                <li className="nav-item">
                  <Link href="#" className="nav-link text-white">
                    Registro de parámetros
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="#" className="nav-link text-white">
                    Registro de recintos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="#" className="nav-link text-white">
                    Emisión de resultados
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Registro de usuarios */}
          <li className="nav-item mb-3">
            <a
              className="nav-link text-white"
              onClick={() => handleClickAndExpand(null, "usuarios")}
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-person"></i> {isOpen && "Registro de usuarios"}
            </a>
          </li>

          {/* Cuadro de mando */}
          <li className="nav-item mb-3">
            <a
              className="nav-link text-white d-flex justify-content-between align-items-center"
              onClick={() => {
                if (!isOpen) setIsOpen(true);
                setSubmenuOpen((prev) => ({ ...prev, usuarios: !prev.usuarios }));
              }}
              style={{ cursor: "pointer" }}
            >
              <div>
                <i className="bi bi-bar-chart"></i> {isOpen && "Cuadro de mando"}
              </div>
              {isOpen && (
                <i
                  className={`bi ${
                    submenuOpen.usuarios ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              )}
            </a>
            {isOpen && submenuOpen.usuarios && (
              <ul className="nav flex-column ms-3 submenu">
                <li className="nav-item">
                  <Link href="#" className="nav-link text-white">
                    Aprobación de usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="#" className="nav-link text-white">
                    Configuración de parámetros
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="#" className="nav-link text-white">
                    Emisión de reportes
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Configuracion */}
          <li className="nav-item mb-3">
            <Link href="#" className="nav-link text-white">
              <i className="bi bi-gear"></i> {isOpen && "Configuración"}
            </Link>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .sidebar {
          overflow-x: hidden;
        }
        .nav-link {
          font-size: 16px;
        }
        .submenu {
          margin-top: 0.5rem;
        }
        .menu-container {
          width: 100%;
          flex: 1;
          background-color: #2c99a4;
          padding: 0.0rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
