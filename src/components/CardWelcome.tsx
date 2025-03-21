

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
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 20px rgba(60, 167, 183, 0.15)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
      }}
    >
      <div
        className="card-body"
        style={{
          backgroundImage: 'linear-gradient(135deg, #3ca7b7 0%, #2a8794 100%)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          padding: '2.5rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-start">
            <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 600, marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Hola 👋, {name} {lastname}</h1>
            <p style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.9, marginBottom: '0.5rem' }}>¡Bienvenidos de nuevo! 🎉</p>
            <p style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>Empecemos desde donde lo dejaste.</p>
            <button
              className="btn profile-btn"
              onClick={handleViewProfile}
              style={{
                border: '2px solid rgba(255,255,255,0.8)',
                color: '#fff',
                background: 'rgba(255,255,255,0.1)',
                padding: '12px 30px',
                borderRadius: '30px',
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease'
              }}
            >
              Ver perfil 👤
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