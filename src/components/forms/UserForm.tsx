import { useState, useEffect } from 'react';

interface User {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  country: string;
  ubigeo: string;
  password: string;
}

interface UserFormProps {
  onSubmit: (user: User) => void;
  selectedUser?: User;
  onUpdate: (user: User) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, selectedUser, onUpdate }) => {
  const [user, setUser] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    country: '',
    ubigeo: '',
    password: ''
  });

  useEffect(() => {
    if (selectedUser) {
      setUser(selectedUser);
    }
  }, [selectedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUser) {
      onUpdate(user);
    } else {
      onSubmit(user);
    }
    setUser({
      name: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      country: '',
      ubigeo: '',
      password: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input type="text" className="form-control" name="name" value={user.name} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Apellido</label>
          <input type="text" className="form-control" name="lastName" value={user.lastName} onChange={handleChange} />
        </div>
      </div>
      
      <div className="row mb-3">
        <div className="col-md-12">
          <label className="form-label">Correo Electrónico</label>
          <input type="email" className="form-control" name="email" value={user.email} onChange={handleChange} />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input type="text" className="form-control" name="phone" value={user.phone} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fecha de Nacimiento</label>
          <input type="date" className="form-control" name="birthDate" value={user.birthDate} onChange={handleChange} />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">País</label>
          <input type="text" className="form-control" name="country" value={user.country} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Ubigeo</label>
          <input type="text" className="form-control" name="ubigeo" value={user.ubigeo} onChange={handleChange} />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <label className="form-label">Contraseña</label>
          <input type="password" className="form-control" name="password" value={user.password} onChange={handleChange} />
        </div>
      </div>

      <button className="btn btn-primary" type="submit">
        {selectedUser ? 'Actualizar Usuario' : 'Guardar Usuario'}
      </button>
    </form>
  );
};

export default UserForm;
