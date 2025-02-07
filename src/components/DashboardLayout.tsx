"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import Navbar from './layout/Navbar';
import TopBar from './layout/TopBar';
import ProjectList from './forms/ProjectList';
import ProjectWorkflow from './forms/ProjectWorkflow';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('projects'); // manejar las vistas

  // renderizar la vista activa
  const renderContent = () => {
    if (activeView === 'projectWorkflow') {
      return <ProjectWorkflow setActiveView={function (view: string): void {
        throw new Error('Function not implemented.');
      } } />;
    }
    if (activeView === 'projects') {
      return <ProjectList setActiveView={setActiveView} />;
    }
    return (
      <div className="text-center mt-5">
        <h1 className="fw-bold text-primary">¡Bienvenido!</h1>
        <p>Gestiona tus proyectos de manera eficiente.</p>
        <i className="bi bi-bar-chart-fill text-primary" style={{ fontSize: '50px' }}></i>
      </div>
    );
  };

  return (
    <div className="d-flex">
      {/* Barra lateral */}
      <Navbar setActiveView={setActiveView} />

      {/* Contenedor principal */}
      <div className="d-flex flex-column flex-grow-1">
        <TopBar />
        <div className="content p-4" style={{ marginTop: '60px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
