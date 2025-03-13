import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const WelcomeCard: React.FC = () => {
  const router = useRouter();
  const [lastname, setLastname] = useState<string>('');

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setLastname(profile.lastname);
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
            <h1>Hola, {lastname}</h1>
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
              ver Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
