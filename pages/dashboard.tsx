'use client'
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
import useAuth from "../src/hooks/useAuth";
import Card from "../src/components/common/Card";
import Breadcrumb from "../src/components/common/Breadcrumb";

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
    <div className="dashboard-container">
        <Card className="header-card">
          <div className="d-flex align-items-center w-100">
            <Title text="Dashboard" className="dashboard-title" />
            <Breadcrumb items={[
              { title: 'Dashboard', href: '/dashboard', active: true },
            ]} />
          </div>
        </Card>
        <Card>
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
        </Card>

      <style jsx>{`
        .dashboard-content {
          max-width: 1800px;
          margin: 0 auto;
        }
        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, var(--primary-color), #2980b9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .chart-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
          aspect-ratio: 16 / 9;
          display: flex;
          flex-direction: column;
          min-height: 200px;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .chart-container:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-color);
        }
        .chart-content {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .title-chart {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.75rem;
          background: linear-gradient(45deg, var(--primary-color), #2980b9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .title-chart:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(45deg, var(--primary-color), #2980b9);
          border-radius: 3px;
        }
        @media (max-width: 992px) {
          .dashboard-container {
            padding: 1.5rem;
          }
          .chart-container {
            padding: 1.25rem;
          }
        }
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          .chart-container {
            padding: 1rem;
            aspect-ratio: 4 / 3;
          }
          .title-chart {
            font-size: 1.1rem;
          }
        }
        @media (max-width: 576px) {
          .chart-container {
            aspect-ratio: 1 / 1;
          }
          .title-chart {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
