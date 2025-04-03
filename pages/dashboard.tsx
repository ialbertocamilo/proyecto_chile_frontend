'use client'
import { BuildingLevelsReport } from "@/components/reports/BuildingLevelsReport";
import { BuildingTypesReport } from "@/components/reports/BuildingTypesReport";
import { DetailedUsersReport } from "@/components/reports/DetailedUsersReport";
import EnergyChart from "@/components/reports/EnergyReport";
import { PerformanceReport } from "@/components/reports/PerformanceReport";
import { ProjectsByMonthReport } from "@/components/reports/ProjectsByMonthReport";
import { ProjectsStatusReport } from "@/components/reports/ProjectsStatusReport";
import { TotalSurfaceReport } from "@/components/reports/TotalSurfaceReport";
import { UserReport } from "@/components/reports/UserReport";
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
import { useApi } from "../src/hooks/useApi";
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

// Interfaces for report data
interface UsersReport {
    active: string[];
    total: number[];
}

interface ProjectsByCountryReport {
    country: string[];
    total: number[];
}

interface ProjectsStatusReport {
    status: string[];
    total: number[];
}

interface BuildingLevelsReport {
    number_levels: number[];
    total: number[];
}

interface TotalSurfaceByCountryReport {
    country: string[];
    total_surface: number[];
}

interface BuildingTypeReport {
    building_type: string[];
    total_proyectos: number[];
}

interface ProjectsByUserReport {
    usuario: string[];
    total_proyectos: number[]
}

interface ProjectsByMonthReport {
    month: string[];
    total_projects: number[];
}

interface DetailedUser {
    id: number;
    name: string;
    email: string;
    last_name: string;
    created_at: string;
    status: boolean;
    project_count: number;
    project_ids: number[];
}

// Función para convertir datos de objeto a array
function convertObjectToArrays(data: any): any {
    if (!data) return null;

    // Crear un objeto con la misma estructura pero con arrays
    const result: any = {};

    // Para cada propiedad del objeto
    Object.keys(data).forEach(key => {
        // Si la propiedad es un objeto (como los que vienen de pandas.to_dict())
        if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
            // Convertir de {0: valor, 1: valor} a [valor, valor]
            result[key] = Object.values(data[key]);
        } else {
            // Si ya es un array, mantenerlo igual
            result[key] = data[key];
        }
    });

    return result;
}

function hexToRgba(hex: string, alpha: number) {

    const cleanHex = hex.replace("#", "")
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Función para generar una paleta de colores para los gráficos
function generateColorPalette(numColors: number) {
    // Colores base para diferentes categorías (colores vibrantes pero armoniosos)
    const baseColors = [
        "#3ca7b7", // Color primario
        "#ff6b6b", // Rojo coral
        "#feca57", // Amarillo
        "#1dd1a1", // Verde menta
        "#5f27cd", // Púrpura
        "#54a0ff", // Azul claro
        "#ff9ff3", // Rosa
        "#00d2d3", // Turquesa
        "#ff9f43", // Naranja
        "#10ac84", // Verde esmeralda
        "#ee5253", // Rojo
        "#2e86de", // Azul
        "#8395a7", // Gris azulado
        "#6a89cc", // Índigo
        "#e056fd", // Magenta
        "#f368e0", // Rosa fuerte
    ];

    // Si necesitamos más colores de los que tenemos en la base, generamos más
    const colors = [...baseColors];

    // Si necesitamos más colores, generamos variaciones
    if (numColors > colors.length) {
        for (let i = 0; i < numColors - colors.length; i++) {
            // Generamos un color aleatorio en formato hex
            const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
            colors.push(randomColor);
        }
    }

    // Devolvemos solo los colores necesarios
    return colors.slice(0, numColors);
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
    const api = useApi();

    const [loadingProjectsByMonth, setLoadingProjectsByMonth] = useState(true);
    const [loadingDetailedUsers, setLoadingDetailedUsers] = useState(true);
    const [projectsByMonth, setProjectsByMonth] = useState<ProjectsByMonthReport | null>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [performanceData, setPerformanceData] = useState<any>(null);

    const [detailedUsers, setDetailedUsers] = useState<DetailedUser[] | null>(null);

    useEffect(() => {
        const pColor = getCssVarValue("--primary-color", "#3ca7b7")
        setPrimaryColor(pColor)
    }, [])

    // Fetch all report data concurrently
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Prepare all API requests to run concurrently
                const requests = [
                    api.get('reports/projects_registered_by_month').then(response => {
                        if (response?.status === 'success') {
                            setProjectsByMonth(convertObjectToArrays(response?.data));
                        }
                        setLoadingProjectsByMonth(false);
                    }).catch(error => {
                        console.error("Error fetching projects by month:", error);
                        setLoadingProjectsByMonth(false);
                    }),

                    // Detailed users report
                    api.get('reports/users/detailed').then(response => {
                        if (response?.status === 'success') {
                            setDetailedUsers(response?.data);
                        }
                        setLoadingDetailedUsers(false);
                    }).catch(error => {
                        console.error("Error fetching detailed users:", error);
                        setLoadingDetailedUsers(false);
                    }),
                ];
                setLoadingPerformance(false);

                // Execute all requests concurrently
                await Promise.all(requests);

            } catch (error) {
                console.error("Error fetching report data:", error);
                setLoadingProjectsByMonth(false);
                setLoadingDetailedUsers(false);
            }
        };

        fetchReportData();
    }, []);


    return (
        <div className="">
            <Card className="header-card">
                <div className="d-flex align-items-center w-100">
                    <Title text="Dashboard" />
                    <Breadcrumb items={[
                        { title: 'Dashboard', href: '/dashboard', active: true },
                    ]} />
                </div>
            </Card>

            <Card className="charts-card p-2">
                <div className="row g-3 mt-1">

                    <div className="col-md-6 col-lg-6">
                        <ProjectsByMonthReport
                            loading={loadingProjectsByMonth}
                            data={projectsByMonth}
                            primaryColor={primaryColor}
                        />
                    </div>

                    <div className="col-md-6 col-lg-6">
                        <EnergyChart />
                    </div>

                    <div className="col-md-6 col-lg-6">
                        <DetailedUsersReport
                            loading={loadingDetailedUsers}
                            data={detailedUsers}
                        />
                    </div>

                    <div className="col-md-6 col-lg-6">

                        <PerformanceReport
                            loading={loadingPerformance}
                            data={performanceData}
                        />
                    </div>

                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;
