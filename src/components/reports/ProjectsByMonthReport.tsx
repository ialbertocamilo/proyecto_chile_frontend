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
                return monthDate.toLocaleString('es', { month: 'long', year: 'numeric' });
            })
            : [],
        datasets: [
            {
                label: "Proyectos Registrados",
                data: Array.isArray(data?.total_projects) ? data?.total_projects : [],
                backgroundColor: primaryColor,
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
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return <ChartLoader title="Proyectos Registrados por Mes" />;
    }

    return (
        <ChartComponent
            title="Proyectos Registrados por Mes"
            chartData={chartData}
            chartType="Bar"
            options={{
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
    );
};
