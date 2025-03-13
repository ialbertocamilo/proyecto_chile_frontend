import React from 'react';
import WelcomeCard from '../src/components/CardWelcome';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Página de Prueba</h1>
      <WelcomeCard  />
    </div>
  );
};

export default TestPage;
