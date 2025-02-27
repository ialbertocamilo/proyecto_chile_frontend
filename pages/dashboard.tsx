import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import "../public/assets/css/globals.css";
import useAuth from "../src/hooks/useAuth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Función para convertir un color hex (#3ca7b7) a RGBA con alpha.
function hexToRgba(hex: string, alpha: number) {
  // Quita el '#' si existe
  const cleanHex = hex.replace("#", "");
  // Extrae los valores R, G, B
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Función para leer una variable CSS con fallback
function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback; // En SSR no hay window
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

const DashboardPage: React.FC = () => {
  useAuth();
  console.log("[DashboardPage] Página cargada y sesión validada.");

  // Manejamos dinámicamente el ancho de la barra lateral
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  // 1. Leemos las variables CSS al montar el componente (o cada vez que quieras refrescar).
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  // Eliminamos secondaryColor si no se va a usar

  useEffect(() => {
    // Al montar el componente, leemos las variables
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    // Eliminamos la lectura de secondaryColor
    setPrimaryColor(pColor);
  }, []);

  // 2. Creamos colores con alpha para usar en gráficas
  const primaryColorAlpha = hexToRgba(primaryColor, 0.2);

  // 3. Definimos los datos de las gráficas usando las variables
  const lineData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    datasets: [
      {
        label: "Proyectos Nuevos",
        data: [12, 19, 3, 5, 2, 3],
        borderColor: primaryColor,
        backgroundColor: primaryColorAlpha,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barData = {
    labels: ["Usuario A", "Usuario B", "Usuario C", "Usuario D", "Usuario E"],
    datasets: [
      {
        label: "Reportes",
        data: [5, 9, 3, 7, 4],
        backgroundColor: primaryColor,
      },
    ],
  };

  const pieData = {
    labels: ["Proyecto 1", "Proyecto 2", "Proyecto 3"],
    datasets: [
      {
        label: "Proyectos",
        data: [10, 20, 30],
        backgroundColor: [primaryColor, "#74b9ff", "#dfe6e9"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Completados", "En Progreso", "Pendientes"],
    datasets: [
      {
        label: "Estado de Proyectos",
        data: [50, 30, 20],
        backgroundColor: [primaryColor, "#74b9ff", "#dfe6e9"],
      },
    ],
  };

  const radarData = {
    labels: ["Eficiencia", "Creatividad", "Colaboración", "Innovación", "Rentabilidad"],
    datasets: [
      {
        label: "Evaluación de Usuario",
        data: [65, 59, 90, 81, 56],
        backgroundColor: primaryColorAlpha,
        borderColor: primaryColor,
        pointBackgroundColor: primaryColor,
      },
    ],
  };

  // Estilos para contenedores y títulos
  const chartContainerStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
    height: "350px",
    display: "flex",
    flexDirection: "column",
  };

  const chartTitleStyle: React.CSSProperties = {
    textAlign: "center",
    color: primaryColor,
    margin: "0 0 10px 0",
    fontWeight: "normal",
    fontSize: "1.1rem",
  };

  const chartContentStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div
          style={{
            padding: "20px",
            marginTop: "90px",
            marginRight: "50px",
            fontFamily: "var(--font-family-base)",
          }}
        >
          <h1 style={{ color: primaryColor, marginBottom: "20px" }}>Dashboard</h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "30px",
            }}
          >
            <div style={chartContainerStyle}>
              <h3 style={chartTitleStyle}>Proyectos Nuevos</h3>
              <div style={chartContentStyle}>
                <Line data={lineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div style={chartContainerStyle}>
              <h3 style={chartTitleStyle}>Reportes de Usuario</h3>
              <div style={chartContentStyle}>
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div style={chartContainerStyle}>
              <h3 style={chartTitleStyle}>Distribución de Proyectos</h3>
              <div style={chartContentStyle}>
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div style={chartContainerStyle}>
              <h3 style={chartTitleStyle}>Estado de Proyectos</h3>
              <div style={chartContentStyle}>
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div style={chartContainerStyle}>
              <h3 style={chartTitleStyle}>Evaluación de Usuario</h3>
              <div style={chartContentStyle}>
                <Radar data={radarData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div style={chartContainerStyle}>
              <h3 style={chartTitleStyle}>Reporte Extra 1</h3>
              <div style={chartContentStyle}>
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        table {
          width: 100%;
          background-color: #fff;
          border-collapse: separate;
          border-spacing: 1px;
        }
        .table th,
        .table td {
          border: 2px solid #ccc;
          border-radius: 4px;
          padding: 6px;
          text-align: center;
          background-color: #fff;
          font-weight: normal;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
