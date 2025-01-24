import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    proyectos: false,
    usuarios: false,
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (menu) => {
    setSubmenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <nav className={`sidebar d-flex flex-column p-3 ${isOpen ? 'expanded' : 'collapsed'}`} style={{ width: isOpen ? '300px' : '100px', backgroundColor: '#2c99a4', color: '#fff', transition: 'width 0.3s ease', height: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <img src="/assets/images/proyecto-deuman-logo.png" alt="Proyecto DEUMAN" className="logo" style={{ width: '50px', borderRadius: '50%' }} />
        <button className="btn btn-light" onClick={toggleSidebar}>
          <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>
      </div>
      <ul className="nav flex-column flex-grow-1">
        <li className="nav-item mb-3">
          <a className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleSubmenu('proyectos')}>
            <div>
              <i className="bi bi-list"></i> {isOpen && 'Listado de proyectos'}
            </div>
            {isOpen && <i className={`bi ${submenuOpen.proyectos ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>}
          </a>
          {submenuOpen.proyectos && (
            <ul className="nav flex-column ms-3">
              <li className="nav-item"><Link href="#" className="nav-link text-white">Registro de proyecto</Link></li>
              <li className="nav-item"><Link href="#" className="nav-link text-white">Registro de parámetros</Link></li>
              <li className="nav-item"><Link href="#" className="nav-link text-white">Registro de recintos</Link></li>
              <li className="nav-item"><Link href="#" className="nav-link text-white">Emisión de resultados</Link></li>
            </ul>
          )}
        </li>
        <li className="nav-item mb-3">
          <Link href="#" className="nav-link text-white"><i className="bi bi-person"></i> {isOpen && 'Registro de usuarios'}</Link>
        </li>
        <li className="nav-item mb-3">
          <a className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleSubmenu('usuarios')}>
            <div>
              <i className="bi bi-bar-chart"></i> {isOpen && 'Cuadro de mando'}
            </div>
            {isOpen && <i className={`bi ${submenuOpen.usuarios ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>}
          </a>
          {submenuOpen.usuarios && (
            <ul className="nav flex-column ms-3">
              <li className="nav-item"><Link href="#" className="nav-link text-white">Aprobación de usuarios</Link></li>
              <li className="nav-item"><Link href="#" className="nav-link text-white">Configuración de parámetros</Link></li>
              <li className="nav-item"><Link href="#" className="nav-link text-white">Emisión de reportes</Link></li>
            </ul>
          )}
        </li>
      </ul>
      <div className="mt-auto">
        <Link href="#" className="nav-link text-white"><i className="bi bi-gear"></i> {isOpen && 'Configuración'}</Link>
      </div>
    </nav>
  );
};

export default Navbar;
