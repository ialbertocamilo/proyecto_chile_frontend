// TestModalPage.tsx
import React, { useState } from 'react';
import ModalCreate from '@/components/common/ModalCreate'; // Ajusta la ruta según tu estructura de proyecto

const TestModalPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    // Aquí va la lógica para el botón "Guardar"
    console.log("¡Se ha ejecutado la acción de guardar!");
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>Página de Prueba del ModalCreate</h2>
      <button
        onClick={handleOpenModal}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#007bff',
          color: '#fff'
        }}
      >
        Abrir Modal
      </button>
      <ModalCreate
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        title="Modal de Prueba"
        saveLabel="Guardar"
      >
        {/* Contenido del modal */}
        <div style={{ marginBottom: '16px' }}>
          <p>Este es el contenido del modal. Puedes agregar aquí tus campos o lo que necesites.</p>
          <input
            type="text"
            placeholder="Escribe algo..."
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </ModalCreate>
    </div>
  );
};

export default TestModalPage;
