// Card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  width?: string;
  borderRadius?: string;
  marginTop?: string;
  marginRight?: string;
  marginLeft?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  width = "100%",
  borderRadius = "16px",
  marginTop = "1px",
  marginRight = "auto",
  marginLeft = "0px",
  style,
}) => {
  const cardStyle: React.CSSProperties = {
    width,
    borderRadius,
    marginTop,
    marginRight,
    marginLeft,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    border: "1px solid #fff",
    overflow: "hidden",
    ...style,
  };

  return (
    <>
      <div className="card" style={cardStyle}>
        <div className="card-body">{children}</div>
      </div>
      <style jsx>{`
        

        /* Asegura que el contenido interno se comporte bien */
        .card-body {
          overflow: hidden;
        }

        /* Estilos para tablas dentro de la card */
        .card table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          display: block;
          overflow-x: auto;
        }
        .card table th,
        .card table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .card table th {
          background-color: #f2f2f2;
        }

        /* Estilos para botones dentro de la card */
        .card button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 0.25rem;
        }

        /* Media queries para distintos tamaños de pantalla */
        @media (max-width: 1024px) {
          .card {
            max-width: 90%;
          }
        }

        @media (max-width: 768px) {
          .card {
            max-width: 90%;
            margin-top: 60px;
            padding: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .card {
            max-width: 100%;
            margin-top: 30px;
            padding: 0.5rem;
          }
          .card table th,
          .card table td {
            padding: 6px;
          }
          .card button {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
};

export default Card;
