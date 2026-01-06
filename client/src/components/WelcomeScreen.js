import React, { useEffect, useState } from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ user, onFinished }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setShow(true);

    // Trigger exit animation before unmounting
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onFinished, 500); // Wait for exit animation to finish
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className={`welcome-overlay ${show ? 'visible' : 'hidden'}`}>
      <div className="welcome-content">
        <div className="welcome-logo-container">
           <img
            src="/logo_sin_fondo_logo.png"
            alt="Logo Municipio de Tigre"
            className="welcome-logo"
          />
        </div>
        <h1 className="welcome-title">¡Hola, {user.nombre}!</h1>
        <p className="welcome-subtitle">Bienvenido al Sistema de Gestión</p>
        <div className="welcome-spinner"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
