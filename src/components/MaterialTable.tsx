import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MaterialTable = () => {
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Hormigón Armado', conductivity: 1.63, heat: 1.63, density: 1.63 },
    { id: 2, name: 'P.E 10kg/m3', conductivity: 0.043, heat: 0.043, density: 0.043 },
    { id: 3, name: 'Tierra', conductivity: 2.00, heat: 2.00, density: 2.00 },
  ]);

  const [newMaterial, setNewMaterial] = useState({ name: '', conductivity: '', heat: '', density: '' });

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMaterial({ ...newMaterial, [name]: value });
};

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.conductivity || !newMaterial.heat || !newMaterial.density) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    setMaterials([...materials, { 
      id: materials.length + 1, 
      name: newMaterial.name, 
      conductivity: parseFloat(newMaterial.conductivity), 
      heat: parseFloat(newMaterial.heat), 
      density: parseFloat(newMaterial.density) 
    }]);
    setNewMaterial({ name: '', conductivity: '', heat: '', density: '' });
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-primary text-center mb-4">Definición de Materiales</h2>
      <table className="table table-bordered text-center">
        <thead className="table-light">
          <tr>
            <th>Nombre Material</th>
            <th>Conductividad (W/mk)</th>
            <th>Calor específico (J/kgk)</th>
            <th>Densidad (kg/m3)</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id}>
              <td>{material.name}</td>
              <td>{material.conductivity}</td>
              <td>{material.heat}</td>
              <td>{material.density}</td>
            </tr>
          ))}
          <tr>
            <td><input type="text" name="name" value={newMaterial.name} onChange={handleInputChange} className="form-control" placeholder="Nombre" /></td>
            <td><input type="number" name="conductivity" value={newMaterial.conductivity} onChange={handleInputChange} className="form-control" placeholder="Conductividad" /></td>
            <td><input type="number" name="heat" value={newMaterial.heat} onChange={handleInputChange} className="form-control" placeholder="Calor" /></td>
            <td><input type="number" name="density" value={newMaterial.density} onChange={handleInputChange} className="form-control" placeholder="Densidad" /></td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleAddMaterial} className="btn btn-primary w-100">Agregar Material</button>
    </div>
  );
};

export default MaterialTable;
