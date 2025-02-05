import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table } from "react-bootstrap";

const projectsData = [
  { id: 1001, status: "Finalizado", name: "Proyecto 1", owner: "Propietario 1", designer: "Diseñador", director: "Director 1", address: "Flering 540", department: "Sansonate" },
  { id: 1002, status: "Registrado", name: "Proyecto 1", owner: "Propietario 1", designer: "Diseñador", director: "Director 1", address: "Flering 540", department: "Sansonate" },
  { id: 1003, status: "Registrado", name: "Proyecto 1", owner: "Propietario 1", designer: "Diseñador", director: "Director 1", address: "Flering 540", department: "Sansonate" },
  { id: 1004, status: "En proceso", name: "Proyecto 1", owner: "Propietario 1", designer: "Diseñador", director: "Director 1", address: "Flering 540", department: "Sansonate" },
  { id: 1005, status: "En proceso", name: "Proyecto 1", owner: "Propietario 1", designer: "Diseñador", director: "Director 1", address: "Flering 540", department: "Sansonate" },
];

const ProjectList = () => {
  const [projects, setProjects] = useState(projectsData);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-primary">Listado de proyectos</h2>
      <Button variant="primary" className="mb-3">+ Proyecto nuevo</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Estado del proyecto</th>
            <th>Nombre del proyecto</th>
            <th>Nombre del propietario</th>
            <th>Nombre del Diseñador</th>
            <th>Director responsable de obras</th>
            <th>Dirección</th>
            <th>Departamento</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>
                <span className={`badge ${project.status === "Finalizado" ? "bg-danger" : project.status === "Registrado" ? "bg-success" : "bg-warning"}`}>{project.status}</span>
              </td>
              <td>{project.name}</td>
              <td>{project.owner}</td>
              <td>{project.designer}</td>
              <td>{project.director}</td>
              <td>{project.address}</td>
              <td>{project.department}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjectList;
