'use client'
import ChartComponent from "@/components/chart/ChartComponent";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Title as ChartTitle,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import Breadcrumb from "../src/components/common/Breadcrumb";
import Card from "../src/components/common/Card";
import Title from "../src/components/Title"; // Componente creado para mostrar títulos
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
                    <Title text="Dashboard" />
                    <Breadcrumb items={[
                        { title: 'Dashboard', href: '/dashboard', active: true },
                    ]} />
                </div>
            </Card>
            <Card className="charts-card">
                <div className="row g-4">
                    <ChartComponent title={"Proyectos nuevos"} chartData={lineData} chartType={"Line"} />
                    <ChartComponent
                        title="Reportes de Usuario"
                        chartData={barData}
                        chartType="Bar"
                    />
                    <ChartComponent
                        title="Distribucion de proyectos"
                        chartData={pieData}
                        chartType="Pie"
                    />
                    <ChartComponent
                        title="Estado de Proyectos"
                        chartData={doughnutData}
                        chartType="Doughnut"
                        options={{ maintainAspectRatio: false, responsive: true }}
                    />

                    <ChartComponent
                        title="Evaluación de usuario"
                        chartData={radarData}
                        chartType="Radar"
                        options={{ maintainAspectRatio: false, responsive: true }}
                    />

                </div>
            </Card>
        </div>
    )
}

export default DashboardPage
