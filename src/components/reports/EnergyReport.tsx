'use client';


import ChartComponent from "@/components/chart/ChartComponent";
// import html2canvas from 'html2canvas';
import { exportToExcel } from "@/components/shared/exportToExcel";

const chartOptions = {
    scales: {
        x: {
            grid: { display: false }
        },
        y: {
            grid: { display: true }
        }
    },
    maintainAspectRatio: false,
    responsive: true
};

interface EnergyChartProps {
    chartData: any;
    loading?: boolean;
    primaryColor?: string;
    filters?: { year?: string | number; country?: string };
}

const EnergyChart = ({ chartData, loading = false, primaryColor = '#3CB6E3', filters }: EnergyChartProps) => {
    const handleDownloadExcel = () => {
        // Si los datos tienen varias columnas (total_energy, renewable, non_renewable), exportar como tabla completa
        if (chartData && chartData.labels && chartData.datasets && chartData.datasets.length > 0) {
            // Construir encabezados dinámicamente
            const headers = ['Año', 'País'];
            const datasetLabels = chartData.datasets.map((ds: any) => ds.label);
            headers.push(...datasetLabels);

            // Asumimos que los labels son tipo "2025 - Perú" o similar
            const rows = chartData.labels.map((label: string, idx: number) => {
                let year = '';
                let country = '';
                // Si el label es "2025 - Perú"
                if (label.includes(' - ')) {
                    [year, country] = label.split(' - ');
                } else {
                    year = filters?.year ? String(filters.year) : '';
                    country = filters?.country || '';
                }
                const values = chartData.datasets.map((ds: any) => ds.data[idx]);
                return [year, country, ...values];
            });
            exportToExcel({
                data: rows,
                fileName: 'reporte_energia.xlsx',
                sheetName: 'Reporte de energia',
                headers
            });
        }
    };

    // Estilo celeste igual que Proyectos Registrados, pero para todas las series
    const styledChartData = chartData && chartData.labels && chartData.datasets ? {
        ...chartData,
        datasets: chartData.datasets.map((ds: any) => ({
            ...ds,
            backgroundColor: (context: { chart: any; }) => {
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
        }))
    } : chartData;

    return (
        <div style={{ position: 'relative' }}>
            <button
                className="btn btn-sm btn-outline-primary"
                style={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}
                onClick={handleDownloadExcel}
                disabled={loading}
            >
                Descargar Excel
            </button>
            <ChartComponent
                title="Reporte de energia"
                chartData={styledChartData}
                chartType="Bar"
                options={chartOptions}
            />
        </div>
    );
};

export default EnergyChart;
