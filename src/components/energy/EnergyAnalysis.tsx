import { Flame } from 'lucide-react';
import { useState, useMemo } from 'react';
import ChartComponent from '../chart/ChartComponent';

interface ChartDataItem {
    concepto: string;
    kwh_m2_ano: string | number;
    kwh_ano?: string | number;
    vsCasoBase?: string;
    nota?: string;
}

interface EnergyAnalysisProps {
    demandaData: ChartDataItem[];
    consumoPrimario: ChartDataItem[];
    showPercentage: boolean;
}

export default function EnergyAnalysis({ demandaData, consumoPrimario, showPercentage }: EnergyAnalysisProps) {
    const [showEnergyAnalysis, setShowEnergyAnalysis] = useState<boolean>(false);

    // Calculate chart data based on current view and percentage mode
    const chartData = useMemo(() => {
        const labels = demandaData
            .filter((item) => item.concepto !== 'Total')
            .map((item) => item.concepto);
            
        const demandaValues = demandaData
            .filter((item) => item.concepto !== 'Total')
            .map((item) => parseFloat(item.kwh_m2_ano?.toString() || '0'));
            
        const consumoValues = consumoPrimario
            .filter((item) => item.concepto !== 'Total')
            .map((item) => parseFloat(item.kwh_m2_ano?.toString() || '0'));
        if (showPercentage) {
            const totalDemanda = demandaValues.reduce((sum, val) => sum + val, 0);
            const totalConsumo = consumoValues.reduce((sum, val) => sum + val, 0);
            
            return {
                labels,
                demandaValues: totalDemanda > 0 ? demandaValues.map((val) => (val / totalDemanda) * 100) : demandaValues,
                consumoValues: totalConsumo > 0 ? consumoValues.map((val) => (val / totalConsumo) * 100) : consumoValues,
                yAxisSuffix: '%',
                tooltipSuffix: '%',
                isPercentage: true
            };
        }
        
        return {
            labels,
            demandaValues,
            consumoValues,
            yAxisSuffix: ' kWh/m²·año',
            tooltipSuffix: ' kWh/m²·año',
            isPercentage: false
        };
    }, [demandaData, consumoPrimario, showPercentage]);

    return (
        <div className="card mb-4 border shadow-sm">
            <div 
                className="card-header bg-white border-bottom py-3" 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowEnergyAnalysis(!showEnergyAnalysis)}
                aria-expanded={showEnergyAnalysis}
                aria-controls="energyAnalysisCollapse"
            >
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <Flame className="me-2 text-primary" size={20} />
                        <h5 className="mb-0 fw-semibold text-dark">Análisis Comparativo de Demanda y Consumo Energético</h5>
                    </div>
                    <div>
                        {showEnergyAnalysis ? (
                            <i className="bi bi-chevron-up"></i>
                        ) : (
                            <i className="bi bi-chevron-down"></i>
                        )}
                    </div>
                </div>
            </div>
            <div 
                className={`collapse ${showEnergyAnalysis ? 'show' : ''}`} 
                id="energyAnalysisCollapse"
            >
                <div className="card-body p-4">
                    <div className="row align-items-center mb-3">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <div className="me-3" style={{ width: '16px', height: '16px', backgroundColor: 'rgba(54, 162, 235, 0.8)' }}></div>
                                <span className="small">Demanda Energética</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="me-3" style={{ width: '16px', height: '2px', backgroundColor: 'rgba(255, 99, 132, 1)' }}></div>
                                <span className="small">Consumo de Energía Primaria</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ height: '450px', position: 'relative' }}>
                        {demandaData.length > 0 && consumoPrimario.length > 0 && (
                            <ChartComponent
                                title="Demanda vs Consumo Energético"
                                chartType="Bar"
                                chartData={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            label: 'Demanda Energética',
                                            data: chartData.demandaValues,
                                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                                            borderColor: 'rgba(54, 162, 235, 1)',
                                            borderWidth: 1,
                                            type: 'bar',
                                            yAxisID: 'y',
                                            order: 1,
                                            borderRadius: 4,
                                            barPercentage: 0.7,
                                            categoryPercentage: 0.8
                                        },
                                        {
                                            label: 'Consumo Primario',
                                            data: chartData.consumoValues,
                                            borderColor: 'rgba(255, 99, 132, 1)',
                                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                                            borderWidth: 2,
                                            type: 'line',
                                            yAxisID: 'y1',
                                            order: 0,
                                            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                                            pointBorderColor: '#fff',
                                            pointHoverRadius: 6,
                                            pointHoverBorderWidth: 2,
                                            tension: 0.3
                                        },
                                        {
                                            label: 'Diferencia',
                                            data: chartData.labels.map((_: string, index: number) => {
                                                const demanda = chartData.demandaValues[index] || 0;
                                                const consumo = chartData.consumoValues[index] || 0;
                                                return consumo - demanda;
                                            }),
                                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                                            borderColor: 'rgba(153, 102, 255, 1)',
                                            borderWidth: 1,
                                            type: 'bar',
                                            yAxisID: 'y1',
                                            order: 2,
                                            borderRadius: 4,
                                            barPercentage: 0.7,
                                            categoryPercentage: 0.8,
                                            hidden: true
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: {
                                        mode: 'index',
                                        intersect: false,
                                    },
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.96)',
                                            titleColor: '#1a1a1a',
                                            bodyColor: '#333',
                                            borderColor: 'rgba(0, 0, 0, 0.1)',
                                            borderWidth: 1,
                                            padding: 12,
                                            usePointStyle: true,
                                            callbacks: {
                                                label: function(context: any) {
                                                    const label = context.dataset.label || '';
                                                    const value = context.parsed.y;
                                                    
                                                    // For other datasets, show the value with units
                                                    return `${label}: ${value.toLocaleString('es-CL', { 
                                                        minimumFractionDigits: 2, 
                                                        maximumFractionDigits: 2 
                                                    })} ${chartData.tooltipSuffix}`;
                                                },
                                            }
                                        },
                                        datalabels: {
                                            display: false
                                        },
                                        annotation: {
                                            annotations: []
                                        }
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear',
                                            display: true,
                                            position: 'left',
                                            title: {
                                                display: true,
                                                text: `Demanda [${chartData.isPercentage ? '%' : 'kWh/m²·año'}]`,
                                                color: 'rgba(54, 162, 235, 0.9)',
                                                font: {
                                                    weight: 'bold'
                                                }
                                            },
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)',
                                                drawBorder: false
                                            },
                                            ticks: {
                                                color: 'rgba(54, 162, 235, 0.9)',
                                                callback: function(value: number) {
                                                    return value.toLocaleString('es-CL');
                                                }
                                            },
                                            beginAtZero: true
                                        },
                                        y1: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            title: {
                                                display: true,
                                                text: `Consumo [${chartData.isPercentage ? '%' : 'kWh/m²·año'}]`,
                                                color: 'rgba(255, 99, 132, 0.9)',
                                                font: {
                                                    weight: 'bold'
                                                }
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                                drawBorder: false
                                            },
                                            ticks: {
                                                color: 'rgba(255, 99, 132, 0.9)',
                                                callback: function(value: number) {
                                                    return value.toLocaleString('es-CL');
                                                }
                                            },
                                            beginAtZero: true
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                                drawBorder: false
                                            }
                                        }
                                    },
                                    animation: {
                                        duration: 1000,
                                        easing: 'easeInOutQuart'
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
