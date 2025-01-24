import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  return (
    <footer className="footer bg-light text-center text-muted py-3 mt-auto">
      <div className="container">
        <p className="mb-0">&copy; {new Date().getFullYear()} Proyecto Deuman. Todos los derechos reservados.</p>
        <p className="mb-0">
          <a href="#" className="text-decoration-none text-primary">Términos y Condiciones</a> | 
          <a href="#" className="text-decoration-none text-primary ms-2">Política de Privacidad</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
