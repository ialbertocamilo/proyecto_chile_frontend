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
    console.log('Ver perfil');
    router.push('/edit-profile'); 
  };


  return (
    <div
      style={{
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(60, 167, 183, 0.12)',
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
          padding: '1rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="d-flex align-items-center justify-content-center">
          <div className="text-start">
            <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Hola 👋, {name} {lastname}</h1>
            <p style={{ color: '#fff', fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.25rem' }}>¡Bienvenidos de nuevo! 🎉</p>
            <p style={{ color: '#fff', fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.75rem' }}>Empecemos desde donde lo dejaste.</p>
            <button
              className="btn profile-btn"
              onClick={handleViewProfile}
              style={{
                border: '1.5px solid rgba(255,255,255,0.8)',
                color: '#fff',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 500,
                letterSpacing: '0.2px',
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