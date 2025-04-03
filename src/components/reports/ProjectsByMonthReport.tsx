import ChartComponent from "@/components/chart/ChartComponent";
import { ChartLoader } from "./ChartLoader";

interface ProjectsByMonthReport {
    month: string[];
    total_projects: number[];
}

interface ProjectsByMonthReportProps {
    loading: boolean;
    data: ProjectsByMonthReport | null;
    primaryColor: string;
}

export const ProjectsByMonthReport = ({ loading, data, primaryColor }: ProjectsByMonthReportProps) => {
    const chartData = data ? {
        labels: Array.isArray(data?.month)
            ? data?.month.map(date => {
                const [year, month] = date.split('-');
                const monthDate = new Date(parseInt(year), parseInt(month) - 1);
                return monthDate
                    .toLocaleString('es', { month: 'long' })
                    .replace(/^\w/, (c) => c.toUpperCase());
            })
            : [],
        datasets: [
            {
                label: "Proyectos Registrados",
                data: Array.isArray(data?.total_projects) ? data?.total_projects : [],
                backgroundColor: (context) => {
                    const { chart } = context;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return primaryColor;
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, primaryColor);
                    gradient.addColorStop(1, "#FFFFFF");
                    return gradient;
                },
                borderColor: primaryColor,
                borderWidth: 1,
            },
        ],
    } : {
        labels: [],
        datasets: [
            {
                label: "Proyectos Registrados",
                data: [],
                backgroundColor: (context) => {
                    const { chart } = context;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return primaryColor;
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, primaryColor);
                    gradient.addColorStop(1, "#FFFFFF");
                    return gradient;
                },
                borderColor: primaryColor,
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return <ChartLoader title="Proyectos Registrados" />;
    }

    return (
        <div>
            <ChartComponent
                title="Proyectos Registrados"
                chartData={chartData}
                chartType="Bar"
                options={{
                    height: 600,
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Número de Proyectos'
                            },
                            grid: {
                                display: true
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }}
            />
        </div>
    );
};
