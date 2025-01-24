import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from '../src/components/Navbar';
import TopBar from '../src/components/TopBar';

const Dashboard = () => {
  return (
    <div className="d-flex">
      <Navbar />
      <div className="d-flex flex-column flex-grow-1" style={{ marginLeft: '0px', width: '100%' }}>
        <TopBar />
        <div className="content p-4" style={{ marginTop: '60px' }}>
          <h4 className="fw-bold">Listado de proyectos</h4>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado del proyecto</th>
                  <th>Nombre del proyecto</th>
                  <th>Nombre del propietario</th>
                  <th>Nombre del diseñador</th>
                  <th>Director responsable de las obras</th>
                  <th>Dirección</th>
                  <th>Departamento</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1001</td>
                  <td><span className="badge bg-danger">Rechazado</span></td>
                  <td>Proyecto 1</td>
                  <td>Propietario 1</td>
                  <td>Diseñador</td>
                  <td>Director 1</td>
                  <td>Fiering 540</td>
                  <td>Sansonate</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary">Nuevo proyecto</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
