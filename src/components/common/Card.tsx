import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  marginTop?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", style, marginTop }) => {
  const cardStyle: React.CSSProperties = {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)", // Sombra sutil
    border: "1px solid rgba(0, 0, 0, 0.1)", // Borde tenue
    backgroundColor: "#ffffff", // Fondo blanco
    overflow: "hidden",
    marginTop,
    borderRadius: "10px", // Bordes redondeados
    padding: "15px", // Espaciado interno
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
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;