'use client'
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const WelcomeCard: React.FC = () => {
  const router = useRouter();
  const [lastname, setLastname] = useState<string>('');
  const [name, setName] = useState<string>('');

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setLastname(profile.lastname);
      setName(profile.name);
    }
  }, []);

  const handleViewProfile = () => {
    router.push('/edit-profile'); // Ajusta la ruta según tu proyecto
  };


  return (
    <div
      className="card welcome-card"
      style={{
        backgroundImage: "url('/assets/images/dashboard/welcome.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <div
        className="card-body"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: '#fff'
        }}
      >
        <div className="d-flex">
          <div className="flex-grow-1">
            <h1>Hola, {name} {lastname}</h1>
            <p>¡Bienvenidos de nuevo!</p>
            <p>Empecemos desde donde lo dejaste.</p>
            <button
              className="btn"
              onClick={handleViewProfile}
              style={{
                border: '1px solid #fff',
                color: '#fff',
                background: 'transparent'
              }}
            >
              Ver perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
