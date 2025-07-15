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
                    <h3 className="h6 text-muted mb-3 mt-2">tCO2 equivalente</h3>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card text-center" style={{ borderColor: '#2ab0c5' }}>
                                <div className="card-body">
                                    <div className="h3" style={{ color: '#2ab0c5' }}>{data?.co2_equivalent?.total || 0}</div>
                                    <div className="text-muted">Total</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card text-center" style={{ borderColor: '#2ab0c5' }}>
                                <div className="card-body">
                                    <div className="h3" style={{ color: '#2ab0c5' }}>{data?.co2_equivalent?.baseline || 0}%</div>
                                    <div className="text-muted">Línea base</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <h3 className="h6 text-muted mb-3">Horas dentro del rango de confort anual</h3>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="card text-center" style={{ borderColor: '#2ab0c5' }}>
                                <div className="card-body">
                                    <div className="h3" style={{ color: '#2ab0c5' }}>{data?.comfort_hours?.heating || 0}</div>
                                    <div className="text-muted">Calefacción</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center" style={{ borderColor: '#2ab0c5' }}>
                                <div className="card-body">
                                    <div className="h3" style={{ color: '#2ab0c5' }}>{data?.comfort_hours?.cooling || 0}</div>
                                    <div className="text-muted">Refrigeración</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center" style={{ borderColor: '#2ab0c5' }}>
                                <div className="card-body">
                                    <div className="h3" style={{ color: '#2ab0c5' }}>{data?.comfort_hours?.baseline || 0}%</div>
                                    <div className="text-muted">Línea base</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            </Card>
    );
};