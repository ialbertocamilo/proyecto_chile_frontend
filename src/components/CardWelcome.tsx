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
    router.push('/edit-profile'); 
  };


  return (
    <div
      className="card h-100"
    >
      <div
        className="card-body"
        style={{
          backgroundImage: "url('/assets/images/dashboard/welcome.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-start">
            <h1 style={{ color: '#fff' }}>Hola, {name} {lastname}</h1>
            <p style={{ color: '#fff' }}>¡Bienvenidos de nuevo! </p>
            <p style={{ color: '#fff' }}>Empecemos desde donde lo dejaste.</p>
            <button
              className="btn profile-btn"
              onClick={handleViewProfile}
              style={{
                border: '1px solid #fff',
                color: '#fff',
                background: 'transparent',
                padding: '8px 24px',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              Ver perfil
              <style jsx>{`
                .profile-btn {
                  transition: all 0.3s ease;
                  cursor: pointer;
                }
                .profile-btn:hover {
                  transform: scale(1.05);
                  opacity: 0.9;
                  background-color: rgba(255, 255, 255, 0.1);
                  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                }
              `}</style>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
