import { ChartLoader } from "./ChartLoader";
import Card from "@/components/common/Card";

interface PerformanceData {
    co2_equivalent: {
        total: number;
        baseline: number;
    };
    comfort_hours: {
        heating: number;
        cooling: number;
        baseline: number;
    };
}

interface PerformanceReportProps {
    loading: boolean;
    data: PerformanceData | null;
}

export const PerformanceReport = ({ loading, data }: PerformanceReportProps) => {
    if (loading) {
        return <ChartLoader title="Indicadores de desempeño" />;
    }

    return (
        <Card>
            <div className="container mb-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <h3 className="h6 text-muted mb-3 mt-2">
                            <i className="bi bi-cloud" style={{ color: '#2ab0c5', marginRight: 8 }} title="Emisiones de CO₂" />
                            CO₂ equivalente
                        </h3>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="card text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #e0f7fa 60%, #ffffff 100%)' }}>
                                    <div className="card-body">
                                        <div className="h2 fw-bold mb-1" style={{ color: '#2ab0c5' }} title="Total de emisiones equivalentes de CO₂">
                                            <i className="bi bi-bar-chart-fill me-2" />
                                            {data?.co2_equivalent?.total ?? 0}
                                        </div>
                                        <span className="badge bg-light text-dark border">Total</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f0f4c3 60%, #ffffff 100%)' }}>
                                    <div className="card-body">
                                        <div className="h2 fw-bold mb-1" style={{ color: '#b2b200' }} title="Porcentaje respecto a línea base">
                                            <i className="bi bi-percent me-2" />
                                            {data?.co2_equivalent?.baseline ?? 0}%
                                        </div>
                                        <span className="badge bg-light text-dark border">Línea base</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-12">
                        <h3 className="h6 text-muted mb-3">
                            <i className="bi bi-thermometer-half" style={{ color: '#2ab0c5', marginRight: 8 }} title="Horas de confort anual" />
                            Horas dentro del rango de confort anual
                        </h3>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="card text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #ffe0b2 60%, #ffffff 100%)' }}>
                                    <div className="card-body">
                                        <div className="h2 fw-bold mb-1" style={{ color: '#ff9800' }} title="Horas de calefacción en confort">
                                            <i className="bi bi-fire me-2" />
                                            {data?.comfort_hours?.heating ?? 0}
                                        </div>
                                        <span className="badge bg-light text-dark border">Calefacción</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #b3e5fc 60%, #ffffff 100%)' }}>
                                    <div className="card-body">
                                        <div className="h2 fw-bold mb-1" style={{ color: '#039be5' }} title="Horas de refrigeración en confort">
                                            <i className="bi bi-snow2 me-2" />
                                            {data?.comfort_hours?.cooling ?? 0}
                                        </div>
                                        <span className="badge bg-light text-dark border">Refrigeración</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f8bbd0 60%, #ffffff 100%)' }}>
                                    <div className="card-body">
                                        <div className="h2 fw-bold mb-1" style={{ color: '#d81b60' }} title="Porcentaje respecto a línea base">
                                            <i className="bi bi-percent me-2" />
                                            {data?.comfort_hours?.baseline ?? 0}%
                                        </div>
                                        <span className="badge bg-light text-dark border">Línea base</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .badge {
                    font-size: 1rem;
                    padding: 0.5em 1em;
                }
            `}</style>
        </Card>
    );
};