import 'bootstrap/dist/css/bootstrap.min.css';

const TopBar = () => {
  return (
    <nav className="navbar navbar-light bg-light shadow-sm px-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-secondary me-3">
            <i className="bi bi-list"></i>
          </button>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Buscar..."
            style={{ width: '250px' }}
          />
        </div>
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-secondary me-2">
            <i className="bi bi-gear"></i>
          </button>
          <button className="btn btn-outline-secondary me-2">
            <i className="bi bi-bell"></i>
          </button>
          <button className="btn btn-outline-secondary me-2">
            <i className="bi bi-envelope"></i>
          </button>
          <span className="fw-bold me-2">luis@gmail.com</span>
          <img
            src="/assets/images/user_icon.png"
            alt="User"
            className="rounded-circle"
            style={{ width: '40px', height: '40px' }}
          />
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
