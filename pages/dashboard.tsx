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
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import Title from "../src/components/Title"; // Componente creado para mostrar títulos
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
  ChartTitle,
  Tooltip,
  Legend
);
function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCssVarValue(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

const DashboardPage: React.FC = () => {
  useAuth();
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");

  

  useEffect(() => {
    const pColor = getCssVarValue("--primary-color", "#3ca7b7");
    setPrimaryColor(pColor);
  }, []);

  const primaryColorAlpha = hexToRgba(primaryColor, 0.2);

  // Datos de los gráficos
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

  return (
    <div className="d-flex flex-column flex-grow-1 font-base">

      {/* Contenedor fluido que envuelve el custom-container */}
      <div className="container-fluid" style={{paddingLeft: "1rem"}}>
        <div className="custom-container">
          <Title text="Dashboard" />

          <div className="row gy-4">
            {/* Proyectos Nuevos */}
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <div className="card shadow-sm h-100">
                <div className="card-body chart-container">
                  <h3 className="text-center mb-3 title-chart text-primary">
                    Proyectos Nuevos
                  </h3>
                  <div className="chart-content">
                    <Line
                      data={lineData}
                      options={{ maintainAspectRatio: false, responsive: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Reportes de Usuario */}
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <div className="card shadow-sm h-100">
                <div className="card-body chart-container">
                  <h3 className="text-center mb-3 title-chart text-primary">
                    Reportes de Usuario
                  </h3>
                  <div className="chart-content">
                    <Bar
                      data={barData}
                      options={{ maintainAspectRatio: false, responsive: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Distribución de Proyectos */}
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <div className="card shadow-sm h-100">
                <div className="card-body chart-container">
                  <h3 className="text-center mb-3 title-chart text-primary">
                    Distribución de Proyectos
                  </h3>
                  <div className="chart-content">
                    <Pie
                      data={pieData}
                      options={{ maintainAspectRatio: false, responsive: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Estado de Proyectos */}
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <div className="card shadow-sm h-100">
                <div className="card-body chart-container">
                  <h3 className="text-center mb-3 title-chart text-primary">
                    Estado de Proyectos
                  </h3>
                  <div className="chart-content">
                    <Doughnut
                      data={doughnutData}
                      options={{ maintainAspectRatio: false, responsive: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Evaluación de Usuario */}
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <div className="card shadow-sm h-100">
                <div className="card-body chart-container">
                  <h3 className="text-center mb-3 title-chart text-primary">
                    Evaluación de Usuario
                  </h3>
                  <div className="chart-content">
                    <Radar
                      data={radarData}
                      options={{ maintainAspectRatio: false, responsive: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Reporte Extra 1 */}
            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <div className="card shadow-sm h-100">
                <div className="card-body chart-container">
                  <h3 className="text-center mb-3 title-chart text-primary">
                    Reporte Extra 1
                  </h3>
                  <div className="chart-content">
                    <Bar
                      data={barData}
                      options={{ maintainAspectRatio: false, responsive: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-container {
          max-width: 1700px;
          margin: 0 auto 50px auto;
          padding: 0 20px;
          color: var(--primary-color) !important;
        }
        .container-fluid {
          width: 100%;
          padding-right: var(--bs-gutter-x, 15px);
          padding-left: var(--bs-gutter-x, 15px);
          margin-right: auto;
          margin-left: auto;
        }
        /* Uso de aspect-ratio para mantener la proporción sin altura fija */
        .chart-container {
          background-color: #fff;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          aspect-ratio: 16 / 9;
          display: flex;
          flex-direction: column;
          min-height: 200px;
        }
        .chart-content {
          flex-grow: 1;
        }
        @media (max-width: 992px) {
          .chart-container {
            aspect-ratio: 16 / 9;
            padding: 8px;
          }
        }
        @media (max-width: 768px) {
          .chart-container {
            aspect-ratio: 4 / 3;
            padding: 6px;
          }
        }
        @media (max-width: 576px) {
          .chart-container {
            aspect-ratio: 1 / 1;
            padding: 4px;
          }
        }
        .text-primary {
          color: var(--primary-color) !important;
        }
        .title-chart {
          font-size: 1.1rem;
          font-weight: normal;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
