'use client';

import ChartComponent from "@/components/chart/ChartComponent";

const EnergyChart = () => {
    const chartData = {
        height: 600,
        labels: ['Calefacción', 'Refrigeración', 'Iluminación', 'ACS'],
        datasets: [
            { label: 'Demanda', data: [0, 0, 0, 0] },
            { label: 'Oferta', data: [0, 0, 0, 0] }
        ]
    };

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

    return (
        <ChartComponent
            title="Energy Report"
            chartData={chartData}
            chartType="Bar"
            options={chartOptions}
        />
    );
};

export default EnergyChart;
