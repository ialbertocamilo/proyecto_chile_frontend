'use client'
import { useEffect, useState } from "react"
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
} from "chart.js"
import { Bar, Doughnut, Line, Pie, Radar } from "react-chartjs-2"
import Title from "../src/components/Title" // Componente creado para mostrar títulos
import useAuth from "../src/hooks/useAuth"
import Card from "../src/components/common/Card"
import Breadcrumb from "../src/components/common/Breadcrumb"

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
)
function hexToRgba(hex: string, alpha: number) {
    const cleanHex = hex.replace("#", "")
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getCssVarValue(varName: string, fallback: string) {
    if (typeof window === "undefined") return fallback
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim()
    return value || fallback
}

const DashboardPage: React.FC = () => {
    useAuth()
    const [primaryColor, setPrimaryColor] = useState("#3ca7b7")

    useEffect(() => {
        const pColor = getCssVarValue("--primary-color", "#3ca7b7")
        setPrimaryColor(pColor)
    }, [])

    const primaryColorAlpha = hexToRgba(primaryColor, 0.2)

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
    }

    const barData = {
        labels: ["Usuario A", "Usuario B", "Usuario C", "Usuario D", "Usuario E"],
        datasets: [
            {
                label: "Reportes",
                data: [5, 9, 3, 7, 4],
                backgroundColor: primaryColor,
            },
        ],
    }

    const pieData = {
        labels: ["Proyecto 1", "Proyecto 2", "Proyecto 3"],
        datasets: [
            {
                label: "Proyectos",
                data: [10, 20, 30],
                backgroundColor: [primaryColor, "#74b9ff", "#dfe6e9"],
            },
        ],
    }

    const doughnutData = {
        labels: ["Completados", "En Progreso", "Pendientes"],
        datasets: [
            {
                label: "Estado de Proyectos",
                data: [50, 30, 20],
                backgroundColor: [primaryColor, "#74b9ff", "#dfe6e9"],
            },
        ],
    }

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
    }
    return (
        <div className="dashboard-container">
            <Card className="header-card">
                <div className="d-flex align-items-center w-100">
                    <Title text="Dashboard"  />
                    <Breadcrumb items={[
                        { title: 'Dashboard', href: '/dashboard', active: true },
                    ]} />
                </div>
            </Card>
            <Card className="charts-card">
             <div className="row g-4">
                {/* Proyectos Nuevos */}
                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                    <div className="chart-container">
                        <h3 className="title-chart">
                            Proyectos Nuevos
                        </h3>
                        <div className="chart-wrapper">
                            <Line
                                data={lineData}
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                {/* Reportes de Usuario */}
                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                    <div className="card shadown-sm h-100">
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
            .dashboard-container {
                width: 100%;
                padding: 1rem;
                max-width: 1800px;
                margin: 0 auto;
            }
            .charts-card {
                overflow: hidden;
            }
            .chart-container {
                background: #fff;
                padding: 1rem;
                border-radius: 12px;
                height: 100%;
                display: flex;
                flex-direction: column;
                transition: all 0.3s ease;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            .chart-wrapper {
                position: relative;
                height: 300px;
                width: 100%;
            }
            .title-chart {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--primary-color);
                text-align: center;
            }
            @media (max-width: 1200px) {
                .chart-wrapper {
                    height: 250px;
                }
            }
            @media (max-width: 992px) {
                .chart-wrapper {
                    height: 220px;
                }
            }
            @media (max-width: 768px) {
                .dashboard-container {
                    padding: 0.5rem;
                }
                .chart-container {
                    padding: 0.75rem;
                }
                .chart-wrapper {
                    height: 200px;
                }
                .title-chart {
                    font-size: 0.9rem;
                }
            }
            @media (max-width: 576px) {
                .chart-wrapper {
                    height: 180px;
                }
            }
        `}</style>
        </div>
    )
}

export default DashboardPage
