import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  marginTop?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", style, marginTop }) => {
  const cardStyle: React.CSSProperties = {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.01)", // Sombra sutil
    border: "1px solid rgba(0, 0, 0, 0.01)", // Borde muy sutil
    backgroundColor: "#ffffff", // Fondo blanco
    overflow: "hidden",
    marginTop,
    borderRadius: "15px", // Bordes suaves
    padding: "15px", // Espaciado interno
    height: "75vh", // Altura fija
    ...style,
  };

  return (
    <div className={`card news-update ${className}`} style={cardStyle}>
      <div className="card-header pb-0">
        <div className="header-top d-flex justify-content-between align-items-center">
          <div className="dropdown icon-dropdown">
            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userdropdown">
              <a className="dropdown-item" href="#">Weekly</a>
              <a className="dropdown-item" href="#">Monthly</a>
              <a className="dropdown-item" href="#">Yearly</a>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body" style={{ width: "100%", padding: 0, margin: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
