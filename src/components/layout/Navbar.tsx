import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Control de submenús
  const [submenuOpen, setSubmenuOpen] = useState({
    proyectos: false,
    usuarios: false,
  });

  // Expande/colapsa toda la barra
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Controla la expansión de submenús y cambia la vista activa
   */
  const handleClickAndExpand = (
    menu: "proyectos" | "usuarios" | null,
    view: string
  ) => {
    if (!isOpen) {
      setIsOpen(true);
    }

    // Si es "proyectos", lo abrimos Y cambiamos la vista activa a "projects"
    if (menu === "proyectos") {
      setSubmenuOpen((prev) => ({ ...prev, proyectos: !prev.proyectos }));
      setActiveView("projects"); // 📌 Se muestra ProjectList al hacer clic
    } else if (menu) {
      setSubmenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
    } else {
      setActiveView(view);
    }
  };

  return (
    <nav
      className={`sidebar d-flex flex-column p-3 ${isOpen ? "expanded" : "collapsed"}`}
      style={{
        width: isOpen ? "300px" : "80px",
        backgroundColor: "#2c99a4",
        color: "#fff",
        transition: "width 0.1s ease",
        height: "100vh",
      }}
    >
      {/* Encabezado: logo + icono expandir/colapsar */}
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

      <ul className="nav flex-column flex-grow-1">
        {/* LISTADO DE PROYECTOS (principal) */}
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
          {/* Submenú de "Listado de proyectos" */}
          {submenuOpen.proyectos && isOpen && (
            <ul className="nav flex-column ms-3">
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

        {/* REGISTRO DE USUARIOS */}
        <li className="nav-item mb-3">
          <a
            className="nav-link text-white"
            onClick={() => handleClickAndExpand(null, "usuarios")}
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-person"></i> {isOpen && "Registro de usuarios"}
          </a>
        </li>

        {/* CUADRO DE MANDO (principal) */}
        <li className="nav-item mb-3">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setSubmenuOpen((prev) => ({
                ...prev,
                usuarios: !prev.usuarios,
              }));
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
          {submenuOpen.usuarios && isOpen && (
            <ul className="nav flex-column ms-3">
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
      </ul>

      {/* CONFIGURACIÓN */}
      <div className="mt-auto">
        <Link href="#" className="nav-link text-white">
          <i className="bi bi-gear"></i> {isOpen && "Configuración"}
        </Link>
      </div>

      <style jsx>{`
        .sidebar {
          overflow-x: hidden;
        }
        .nav-link {
          font-size: 16px;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
