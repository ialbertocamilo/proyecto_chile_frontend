import { Line, Bar, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';

interface ChartComponentProps {
    title: string;
    chartData: any;
    chartType: 'Line' | 'Bar' | 'Pie' | 'Doughnut' | 'PolarArea' | 'Radar';
    className?: string;
    options?: any;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ 
    title, 
    chartData, 
    chartType,
    className = "col-xl-4 col-lg-6 col-md-6 col-sm-12",
    options = {} 
}) => {
    const defaultOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        }
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const renderChart = () => {
        switch (chartType) {
            case 'Line':
                return <Line data={chartData} options={mergedOptions} />;
            case 'Bar':
                return <Bar data={chartData} options={mergedOptions} />;
            case 'Pie':
                return <Pie data={chartData} options={mergedOptions} />;
            case 'Doughnut':
                return <Doughnut data={chartData} options={mergedOptions} />;
            case 'PolarArea':
                return <PolarArea data={chartData} options={mergedOptions} />;
            case 'Radar':
                return <Radar data={chartData} options={mergedOptions} />;
            default:
                return null;
        }
    };
    return (
        <div className={className}>
            <div className="chart-container">
                <h3 className="title-chart">
                    {title}
                </h3>
                <div className="chart-wrapper">
                    {renderChart()}
                </div>
            </div>
        </div>
    );
};

export default ChartComponent;
