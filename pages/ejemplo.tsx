// src/pages/button-variants.tsx
import React, { useState } from 'react';
import CustomButton from '../src/components/common/CustomButton';

const ButtonVariantsPage: React.FC = () => {
  // Estados para simular el estado de carga de cada botón
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingBack, setLoadingBack] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEditIcon, setLoadingEditIcon] = useState(false);
  const [loadingDeleteIcon, setLoadingDeleteIcon] = useState(false);
  const [loadingBackIcon, setLoadingBackIcon] = useState(false);
  const [loadingForwardIcon, setLoadingForwardIcon] = useState(false);

  // Función para simular una acción asíncrona al presionar un botón
  const handleClick = (
    actionName: string,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Botón ${actionName} presionado`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Ejemplos de Variaciones del Botón</h1>

      {/* Botón Guardar */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Guardar</h2>
        <CustomButton
          variant="save"
          isLoading={loadingSave}
          onClick={() => handleClick('Guardar', setLoadingSave)}
        >
          Guardar
        </CustomButton>
      </section>

      {/* Botón Regresar (Texto Completo) */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Regresar</h2>
        <CustomButton
          variant="back"
          isLoading={loadingBack}
          onClick={() => handleClick('Regresar', setLoadingBack)}
        >
          Regresar
        </CustomButton>
      </section>

      {/* Botón Eliminar (Texto Completo) */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Eliminar</h2>
        <CustomButton
          variant="delete"
          isLoading={loadingDelete}
          onClick={() => handleClick('Eliminar', setLoadingDelete)}
        >
          Eliminar
        </CustomButton>
      </section>

      {/* Botón Deshabilitado */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Deshabilitado</h2>
        <CustomButton variant="save" disabled>
          Deshabilitado
        </CustomButton>
      </section>

      {/* Botón Editar Icono */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Editar Icono</h2>
        <CustomButton
          variant="editIcon"
          isLoading={loadingEditIcon}
          onClick={() => handleClick('Editar', setLoadingEditIcon)}
        >
          Editar
        </CustomButton>
      </section>

      {/* Botón Eliminar Icono */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Eliminar Icono</h2>
        <CustomButton
          variant="deleteIcon"
          isLoading={loadingDeleteIcon}
          onClick={() => handleClick('Eliminar', setLoadingDeleteIcon)}
        >
          Eliminar
        </CustomButton>
      </section>

      {/* Botón Atrás Icono */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Atrás Icono</h2>
        <CustomButton
          variant="backIcon"
          isLoading={loadingBackIcon}
          onClick={() => handleClick('Atrás', setLoadingBackIcon)}
        >
          Atrás
        </CustomButton>
      </section>

      {/* Botón Adelante Icono */}
      <section style={{ margin: '1rem 0' }}>
        <h2>Botón Adelante Icono</h2>
        <CustomButton
          variant="forwardIcon"
          isLoading={loadingForwardIcon}
          onClick={() => handleClick('Adelante', setLoadingForwardIcon)}
        >
          Adelante
        </CustomButton>
      </section>
    </div>
  );
};

export default ButtonVariantsPage;
