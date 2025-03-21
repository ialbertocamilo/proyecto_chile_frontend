import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Project {
    created_at?: string;
}

interface ProjectsResponse {
    projects: Project[];
}

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const ChartProjectCreated: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const filterProjectsByYear = (year: number) => {
        const counts = new Array(12).fill(0);
        projects.forEach((project) => {
            if (project.created_at) {
                const date = new Date(project.created_at);
                if (date.getFullYear() === year) {
                    counts[date.getMonth()]++;
                }
            }
        });
        setChartData(counts);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get<ProjectsResponse>('/api/projects_user', {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                },
                params: { limit: 999999, num_pag: 1 }
            })
            .then((response) => setProjects(response.data.projects))
            .catch((error) => console.error("Error fetching projects:", error))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
    
    }, [projects, selectedYear]);

    const chartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            foreColor: '#8d8d8d',
            background: 'transparent'
        },
        plotOptions: {
            bar: {
                columnWidth: '40%',
                borderRadius: 0
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0,
                gradientToColors: ['#FFFFFF'],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 90, 100]
            }
        },
        stroke: {
            show: false
        },
        colors: ['#008FFB'],
        title: {
            text: `Proyectos Creados por Mes - ${selectedYear}`,
            align: 'center'
        },
        xaxis: {
            categories: months,
        },
        yaxis: {
            title: {
                text: 'Cantidad',
            },
        },
    };

    const series = [
        {
            name: 'Proyectos',
            data: chartData,
        },
    ];

    const availableYears = [2021, 2022, 2023, 2024, new Date().getFullYear()];

    if (loading) {
        return <div>Loading chart...</div>;
    }

    return (
            <div className="card">
                <div className="card-header pb-0">
                    <div className="header-top d-flex justify-content-between align-items-center">
                        <div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="form-select"
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div id="revenuegrowth-1" style={{ minHeight: '350px' }}>
                        <div id="chart">
                            <ReactApexChart
                                options={chartOptions}
                                series={series}
                                type="bar"
                                height={350}
                            />
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default ChartProjectCreated;
