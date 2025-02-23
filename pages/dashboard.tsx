import React, { useState } from "react";
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

const DashboardPage: React.FC = () => {
  // Ejecutamos la validación de autenticación
  useAuth();
  console.log("[DashboardPage] Página cargada y sesión validada.");

  // Manejamos dinámicamente el ancho de la barra lateral
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  const lineData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    datasets: [
      {
        label: "Proyectos Nuevos",
        data: [12, 19, 3, 5, 2, 3],
        borderColor: "#3ca7b7",
        backgroundColor: "rgba(60, 167, 183, 0.2)",
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
        backgroundColor: "#3ca7b7",
      },
    ],
  };

  const pieData = {
    labels: ["Proyecto 1", "Proyecto 2", "Proyecto 3"],
    datasets: [
      {
        label: "Proyectos",
        data: [10, 20, 30],
        backgroundColor: ["#3ca7b7", "#74b9ff", "#dfe6e9"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Completados", "En Progreso", "Pendientes"],
    datasets: [
      {
        label: "Estado de Proyectos",
        data: [50, 30, 20],
        backgroundColor: ["#3ca7b7", "#74b9ff", "#dfe6e9"],
      },
    ],
  };

  const radarData = {
    labels: ["Eficiencia", "Creatividad", "Colaboración", "Innovación", "Rentabilidad"],
    datasets: [
      {
        label: "Evaluación de Usuario",
        data: [65, 59, 90, 81, 56],
        backgroundColor: "rgba(60, 167, 183, 0.2)",
        borderColor: "#3ca7b7",
        pointBackgroundColor: "#3ca7b7",
      },
    ],
  };

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
    color: "#3ca7b7",
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
      {/* Se utiliza el componente Navbar y se le pasa el setSidebarWidth para gestionar el ancho dinámicamente */}
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
        }}
      >
        {/* TopBar recibe el ancho de la barra lateral */}
        <TopBar sidebarWidth={sidebarWidth} />
        <div
          style={{
            padding: "20px",
            marginTop: "90px",
            marginRight: "50px",
            fontFamily: "var(--font-family-base)",
          }}
        >
          <h1 style={{ color: "#3ca7b7", marginBottom: "20px" }}>Dashboard</h1>
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
        /* Estilos para las tablas, en caso de usarse en otros componentes */
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
