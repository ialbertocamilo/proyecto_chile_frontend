import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Title from './Title';
import Card from './common/Card';

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
        filterProjectsByYear(selectedYear);
    }, [projects, selectedYear]);

    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            stacked: false,
            toolbar: {
                show: false,
            },
            dropShadow: {
                enabled: true,
                color: '#64748B',
                top: 12,
                left: 5,
                blur: 15,
                opacity: 0.15
            },
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        stroke: {
            width: [3, 2],
            curve: ['stepline'],
            dashArray: [0, 5]
        },

        plotOptions: {
            bar: {
                columnWidth: '100px'
            }
        },
        colors: ['#00B4D8', '#00B4D8'],
        fill: {
            type: "gradient",
            gradient: {
                type: "vertical",
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100],
                colorStops: [
                    {
                        offset: 0,
                        color: '#00B4D8',
                        opacity: 0.7
                    },
                    {
                        offset: 100,
                        color: '#90E0EF',
                        opacity: 0.2
                    }
                ]
            }
        },
        grid: {
            show: false,
        },
        markers: {
            size: 5,
            colors: ['#00B4D8'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: months,
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: 500,
                    colors: '#64748B',
                    fontFamily: 'Outfit, sans-serif',
                },
                offsetY: 5
            },
        },
        yaxis: {
            show: true,
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: 500,
                    colors: '#64748B',
                    fontFamily: 'Noto Sans, sans-serif',
                },
                formatter: function (value) {
                    return Math.round(value).toString();
                }
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        tooltip: {
            style: {
                fontSize: '12px',
                fontFamily: 'Outfit, sans-serif',
            },
            y: {
                formatter: function (value) {
                    return value + ' proyectos';
                }
            },
            marker: {
                show: false
            }
        },
    };

    const series = [
        {
            name: 'Proyectos',
            data: chartData,
            type: 'area'
        }
    ];

    const availableYears = [2021, 2022, 2023, 2024, new Date().getFullYear()];

    if (loading) {
        return <div>Loading chart...</div>;
    }

    return (
        <Card>
            <div className="card-header">
                <Title text="Proyectos creados" />
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
            <div className="card-body">
                <div style={{ minHeight: '100px', maxHeight: '200px', width: '100%', overflow: 'hidden' }} >
                    <div id="chart" style={{ width: '100%' }}>
                        <ReactApexChart
                            options={chartOptions}
                            series={series}
                            type="line"
                            height={100}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ChartProjectCreated;