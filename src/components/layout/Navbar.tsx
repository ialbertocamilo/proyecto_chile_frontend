import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

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

  useEffect(() => {
    setSidebarWidth(isOpen ? "300px" : "80px");
  }, [isOpen, setSidebarWidth]);

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
    // Limpia los datos del localStorage
    localStorage.clear();
    router.push("/login");
  };

  return (
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
        backgroundColor: "#2c99a4",
        color: "#fff",
        height: "100vh",
        fontFamily: "var(--font-family-base)",
      }}
    >
      {/* Encabezado */}
      <div
        className={`d-flex align-items-center mb-4 ${
          isOpen ? "justify-content-center" : "justify-content-between"
        }`}
        style={{ fontFamily: "var(--font-family-base)" }}
      >
        <Link href="/dashboard">
          <img
            src="/assets/images/proyecto-deuman-logo.png"
            alt="Proyecto Ceela"
            className="logo"
            style={{
              width: "55px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          />
        </Link>
        {/* El toggle se muestra solo si la barra está colapsada */}
        {!isOpen && (
          <div
            onClick={toggleSidebar}
            style={{
              cursor: "pointer",
              color: "#fff",
              fontSize: "24px",
              marginLeft: "10px",
              lineHeight: "0",
              fontFamily: "var(--font-family-base)",
            }}
          >
            <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
          </div>
        )}
      </div>

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
          {/* Dashboard */}
          <li className="nav-item mb-3">
            <Link
              href="/dashboard"
              className="nav-link text-white"
              style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
            >
              <i className="bi bi-speedometer2"></i>{" "}
              {isOpen && "Dashboard"}
            </Link>
          </li>

          {/* Proyectos */}
          <li className="nav-item mb-3">
            <div
              className="nav-link text-white d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
              onClick={() => toggleSubmenu("proyectos")}
            >
              <div>
                <i className="bi bi-list"></i>{" "}
                {isOpen && "Proyectos"}
              </div>
              {isOpen && (
                <i className={`bi ${submenuOpen.proyectos ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              )}
            </div>
            {submenuOpen.proyectos && isOpen && (
              <ul className="nav flex-column ms-3 submenu">
                <li className="nav-item">
                  <Link
                    href="/project-list"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Listado De Proyectos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/project-workflow"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Registro De Proyectos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/project-status"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Estado De Proyectos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/parametros"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Registro De Parámetros
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/recintos"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Registro De Recintos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/resultados"
                    className="nav-link text-white"
                    style={{ fontFamily: "var(--font-family-base)" }}
                  >
                    Emisión De Resultados
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Usuarios */}
          <li className="nav-item mb-3">
            <div
              className="nav-link text-white d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
              onClick={() => toggleSubmenu("user")}
            >
              <div>
                <i className="bi bi-person"></i>{" "}
                {isOpen && "Usuarios"}
              </div>
              {isOpen && (
                <i className={`bi ${submenuOpen.user ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              )}
            </div>
            {submenuOpen.user && isOpen && (
              <ul className="nav flex-column ms-3 submenu">
                <li className="nav-item">
                  <Link
                    href="/user-management"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Listado De Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/user-create"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Registro De Usuario
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Parametros */}
          <li className="nav-item mb-3">
            <div
              className="nav-link text-white d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
              onClick={() => toggleSubmenu("parametros")}
            >
              <div>
                <i className="bi bi-sliders"></i>{" "}
                {isOpen && "Parametros"}
              </div>
              {isOpen && (
                <i className={`bi ${submenuOpen.parametros ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              )}
            </div>
            {submenuOpen.parametros && isOpen && (
              <ul className="nav flex-column ms-3 submenu">
                <li className="nav-item">
                  <Link
                    href="/constants-management"
                    className="nav-link text-white"
                    style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
                  >
                    Listado De Materiales
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Configuracion */}
          <li className="nav-item mb-3">
            <Link
              href="/settings"
              className="nav-link text-white"
              style={{ fontFamily: "var(--font-family-base)" }}
            >
              <i className="bi bi-gear"></i>{" "}
              {isOpen && "Configuración"}
            </Link>
          </li>

          {/* Salir */}
          <li className="nav-item mb-3">
            <div
              className="nav-link text-white"
              style={{ cursor: "pointer", fontFamily: "var(--font-family-base)" }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>{" "}
              {isOpen && "Salir"}
            </div>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .sidebar {
          overflow-x: hidden;
        }
        .nav-link {
          font-size: 16px;
          font-family: var(--font-family-base);
        }
        /* Aumenta el tamaño de los íconos */
        .nav-link i {
          font-size: 1.5rem;
        }
        .submenu {
          margin-top: 0.5rem;
          font-family: var(--font-family-base);
        }
        .menu-container {
          width: 100%;
          flex: 1;
          background-color: #2c99a4;
          padding: 0;
          border-radius: 0.5rem;
          font-family: var(--font-family-base);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
