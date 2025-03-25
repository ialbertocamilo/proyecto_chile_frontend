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
import { useApi } from "../src/hooks/useApi";
import useAuth from "../src/hooks/useAuth";
import WelcomeCard from "@/components/CardWelcome";

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
    total_proyectos: number[];
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

    // Individual loading states for each chart
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingProjectsByCountry, setLoadingProjectsByCountry] = useState(true);
    const [loadingProjectsStatus, setLoadingProjectsStatus] = useState(true);
    const [loadingBuildingLevels, setLoadingBuildingLevels] = useState(true);
    const [loadingTotalSurface, setLoadingTotalSurface] = useState(true);
    const [loadingBuildingTypes, setLoadingBuildingTypes] = useState(true);
    const [loadingProjectsByUser, setLoadingProjectsByUser] = useState(true);

    // State variables for report data
    const [usersReport, setUsersReport] = useState<UsersReport | null>(null);
    const [projectsByCountry, setProjectsByCountry] = useState<ProjectsByCountryReport | null>(null);
    const [projectsStatus, setProjectsStatus] = useState<ProjectsStatusReport | null>(null);
    const [buildingLevels, setBuildingLevels] = useState<BuildingLevelsReport | null>(null);
    const [totalSurfaceByCountry, setTotalSurfaceByCountry] = useState<TotalSurfaceByCountryReport | null>(null);
    const [buildingTypes, setBuildingTypes] = useState<BuildingTypeReport | null>(null);
    const [projectsByUser, setProjectsByUser] = useState<ProjectsByUserReport | null>(null);

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
                    // Users report
                    api.get('reports/users').then(response => {
                        if (response?.status === 'success') {
                            setUsersReport(convertObjectToArrays(response?.data));
                        }
                        setLoadingUsers(false);
                    }).catch(error => {
                        console.error("Error fetching users report:", error);
                        setLoadingUsers(false);
                    }),

                    // Projects by country
                    api.get('reports/projects_by_country').then(response => {
                        if (response?.status === 'success') {
                            setProjectsByCountry(convertObjectToArrays(response?.data));
                        }
                        setLoadingProjectsByCountry(false);
                    }).catch(error => {
                        console.error("Error fetching projects by country:", error);
                        setLoadingProjectsByCountry(false);
                    }),

                    // Projects status
                    api.get('reports/projects_status').then(response => {
                        if (response?.status === 'success') {
                            setProjectsStatus(convertObjectToArrays(response?.data));
                        }
                        setLoadingProjectsStatus(false);
                    }).catch(error => {
                        console.error("Error fetching projects status:", error);
                        setLoadingProjectsStatus(false);
                    }),

                    // Building levels distribution
                    api.get('reports/building_levels_distribution').then(response => {
                        if (response?.status === 'success') {
                            setBuildingLevels(convertObjectToArrays(response?.data));
                        }
                        setLoadingBuildingLevels(false);
                    }).catch(error => {
                        console.error("Error fetching building levels:", error);
                        setLoadingBuildingLevels(false);
                    }),

                    // Total surface by country
                    api.get('reports/total_surface_by_country').then(response => {
                        if (response?.status === 'success') {
                            setTotalSurfaceByCountry(convertObjectToArrays(response?.data));
                        }
                        setLoadingTotalSurface(false);
                    }).catch(error => {
                        console.error("Error fetching surface by country:", error);
                        setLoadingTotalSurface(false);
                    }),

                    // Building type distribution
                    api.get('reports/building_type_distribution').then(response => {
                        if (response?.status === 'success') {
                            setBuildingTypes(convertObjectToArrays(response?.data));
                        }
                        setLoadingBuildingTypes(false);
                    }).catch(error => {
                        console.error("Error fetching building types:", error);
                        setLoadingBuildingTypes(false);
                    }),

                    // Projects by user distribution
                    api.get('reports/projects_by_user').then(response => {
                        if (response?.status === 'success') {
                            setProjectsByUser(convertObjectToArrays(response?.data));
                        }
                        setLoadingProjectsByUser(false);
                    }).catch(error => {
                        console.error("Error fetching projects by user:", error);
                        setLoadingProjectsByUser(false);
                    }),
                ];

                // Execute all requests concurrently
                await Promise.all(requests);

            } catch (error) {
                console.error("Error fetching report data:", error);
                // Set all loading states to false on error
                setLoadingUsers(false);
                setLoadingProjectsByCountry(false);
                setLoadingProjectsStatus(false);
                setLoadingBuildingLevels(false);
                setLoadingTotalSurface(false);
                setLoadingBuildingTypes(false);
            }
        };

        fetchReportData();
    }, []);

    const primaryColorAlpha = hexToRgba(primaryColor, 0.2)

    // Create chart data from API responses
    const projectsStatusChartData = projectsStatus ? {
        labels: Array.isArray(projectsStatus?.status) ? projectsStatus?.status : [],
        datasets: [
            {
                label: "Estado de Proyectos",
                data: Array.isArray(projectsStatus?.total) ? projectsStatus?.total : [],
                backgroundColor: generateColorPalette(
                    Array.isArray(projectsStatus?.status) ? projectsStatus?.status.length : 3
                ),
            },
        ],
    } : {
        labels: ["Completados", "En Progreso", "Pendientes"],
        datasets: [
            {
                label: "Estado de Proyectos",
                data: [50, 30, 20],
                backgroundColor: generateColorPalette(3),
            },
        ],
    }

    const userReportChartData = usersReport ? {
        labels: Array.isArray(usersReport?.active) ? usersReport?.active : [],
        datasets: [
            {
                label: "Usuarios",
                data: Array.isArray(usersReport?.total) ? usersReport?.total : [],
                backgroundColor: usersReport?.active?.map((status) =>
                    status === "Activo" || status === "Activos" ? "#1dd1a1" : "#8395a7" // Verde para activos, gris para inactivos
                ),
            },
        ],
    } : {
        labels: ["Activos", "Inactivos"],
        datasets: [
            {
                label: "Usuarios",
                data: [75, 25],
                backgroundColor: ["#1dd1a1", "#8395a7"], // Verde para activos, gris para inactivos
            },
        ],
    }

    const projectsByCountryChartData = projectsByCountry ? {
        labels: Array.isArray(projectsByCountry?.country) ? projectsByCountry?.country : [],
        datasets: [
            {
                label: "Proyectos por País",
                data: Array.isArray(projectsByCountry?.total) ? projectsByCountry?.total : [],
                backgroundColor: generateColorPalette(
                    Array.isArray(projectsByCountry?.country) ? projectsByCountry?.country.length : 5
                ),
            },
        ],
    } : {
        labels: ["Chile", "Argentina", "Brasil", "Colombia", "Perú"],
        datasets: [
            {
                label: "Proyectos por País",
                data: [5, 9, 3, 7, 4],
                backgroundColor: generateColorPalette(5),
            },
        ],
    }

    const buildingTypesChartData = buildingTypes ? {
        labels: Array.isArray(buildingTypes?.building_type) ? buildingTypes?.building_type : [],
        datasets: [
            {
                label: "Tipos de Edificios",
                data: Array.isArray(buildingTypes?.total_proyectos) ? buildingTypes?.total_proyectos : [],
                backgroundColor: generateColorPalette(
                    Array.isArray(buildingTypes?.building_type) ? buildingTypes?.building_type.length : 5
                ),
            },
        ],
    } : {
        labels: ["Proyecto 1", "Proyecto 2", "Proyecto 3"],
        datasets: [
            {
                label: "Proyectos",
                data: [10, 20, 30],
                backgroundColor: generateColorPalette(3),
            },
        ],
    }

    const buildingLevelsChartData = buildingLevels ? {
        labels: Array.isArray(buildingLevels?.number_levels)
            ? buildingLevels?.number_levels?.map(level => `${level} Niveles`)
            : [],
        datasets: [
            {
                label: "Distribución de Niveles",
                data: buildingLevels?.total || [],
                borderColor: primaryColor,
                backgroundColor: primaryColorAlpha,
                tension: 0.4,
                fill: true,
            },
        ],
    } : {
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

    const totalSurfaceChartData = totalSurfaceByCountry ? {
        labels: Array.isArray(totalSurfaceByCountry?.country) ? totalSurfaceByCountry?.country : [],
        datasets: [
            {
                label: "Superficie Total (m²)",
                data: Array.isArray(totalSurfaceByCountry?.total_surface) ? totalSurfaceByCountry?.total_surface : [],
                backgroundColor: generateColorPalette(
                    Array.isArray(totalSurfaceByCountry?.country) ? totalSurfaceByCountry?.country.length : 5
                ),
                borderWidth: 1,
            },
        ],
    } : {
        labels: ["Chile", "Argentina", "Brasil", "Colombia", "Perú"],
        datasets: [
            {
                label: "Superficie Total (m²)",
                data: [15000, 12000, 18000, 9000, 11000],
                backgroundColor: generateColorPalette(5),
                borderWidth: 1,
            },
        ],
    }

    // Chart data configuration for Projects by User report
    const projectsByUserChartData = projectsByUser ? {
        labels: Array.isArray(projectsByUser?.usuario) ? projectsByUser?.usuario : [],
        datasets: [
            {
                label: "Proyectos por Usuario",
                data: Array.isArray(projectsByUser?.total_proyectos) ? projectsByUser?.total_proyectos : [],
                backgroundColor: generateColorPalette(
                    Array.isArray(projectsByUser?.usuario) ? projectsByUser?.usuario.length : 5
                ),
                borderWidth: 1,
                borderColor: "#ffffff",
            },
        ],
    } : {
        labels: ["Usuario A", "Usuario B", "Usuario C", "Usuario D", "Usuario E"],
        datasets: [
            {
                label: "Proyectos por Usuario",
                data: [8, 5, 12, 3, 9],
                backgroundColor: generateColorPalette(5),
                borderWidth: 1,
                borderColor: "#ffffff",
            },
        ],
    }

    // Componente de carga para cada gráfico
    const ChartLoader = ({ title }: { title: string }) => (
        <div className="col-md-6 col-lg-4">
            <Card className="chart-card p-4 text-center h-100">
                <h5>{title}</h5>
                <div className="spinner-border text-primary mt-4" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando datos...</p>
            </Card>
        </div>
    );

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
                <div className="row g-3">
                    <div className="col-sm-12 col-lg-4">
                        <WelcomeCard />
                    </div>
                </div>
                <div className="row g-3 mt-1">
                    {loadingBuildingLevels ? (
                        <ChartLoader title="Distribución de Niveles de Edificios" />
                    ) : (
                        <div className="col-md-6 col-lg-4">
                            <ChartComponent
                                title="Distribución de Niveles de Edificios"
                                chartData={buildingLevelsChartData}
                                chartType="Line"
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true,
                                    aspectRatio: 1.5
                                }}
                            />
                        </div>
                    )}

                    {/* Apply the same pattern to all other chart components */}
                    {loadingUsers ? (
                        <ChartLoader title="Usuarios Activos vs Inactivos" />
                    ) : (
                        <div className="col-md-6 col-lg-4">
                            <ChartComponent
                                title="Usuarios Activos vs Inactivos"
                                chartData={userReportChartData}
                                chartType="Bar"
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true
                                }}
                            />
                        </div>
                    )}

                    {loadingProjectsByCountry ? (
                        <ChartLoader title="Proyectos por País" />
                    ) : (
                        <div className="col-md-6 col-lg-4">
                            <ChartComponent
                                title="Proyectos por País"
                                chartData={projectsByCountryChartData}
                                chartType="Pie"
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true
                                }}
                            />
                        </div>
                    )}

                    {loadingProjectsStatus ? (
                        <ChartLoader title="Estado de Proyectos" />
                    ) : (
                        <div className="col-md-6 col-lg-4">
                            <ChartComponent
                                title="Estado de Proyectos"
                                chartData={projectsStatusChartData}
                                chartType="Doughnut"
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true
                                }}
                            />
                        </div>
                    )}

                    {loadingBuildingTypes ? (
                        <ChartLoader title="Distribución de Tipos de Edificios" />
                    ) : (
                        <div className="col-md-6 col-lg-4">
                            <ChartComponent
                                title="Distribución de Tipos de Edificios"
                                chartData={buildingTypesChartData}
                                chartType="Bar"
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true
                                }}
                            />
                        </div>
                    )}

                    {loadingProjectsByUser ? (
                        <ChartLoader title="Proyectos por Usuario" />
                    ) : (
                        <div className="col-md-6 col-lg-4">
                            <ChartComponent
                                title="Proyectos por Usuario"
                                chartData={projectsByUserChartData}
                                chartType="Bar"
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Número de Proyectos'
                                            }
                                        },
                                        x: {
                                            ticks: {
                                                maxRotation: 45,
                                                minRotation: 45
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default DashboardPage
