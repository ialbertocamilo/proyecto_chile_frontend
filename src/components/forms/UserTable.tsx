interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  country: string;
  ubigeo: string;
}

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete, onEdit }) => {
    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Fecha de Nacimiento</th>
            <th>País</th>
            <th>Ubigeo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.birthDate}</td>
              <td>{user.country}</td>
              <td>{user.ubigeo}</td>
              <td>
                <button className="btn btn-warning me-2" onClick={() => onEdit(user)}>Editar</button>
                <button className="btn btn-danger" onClick={() => onDelete(user.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default UserTable;
  