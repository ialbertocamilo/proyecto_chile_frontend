// pages/resumen-energia.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { Cloud, Droplet, Flame, Snowflake } from 'lucide-react';

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ResumenEnergia(props: any) {
    // Si se pasan props, usar los datos reales, si no, usar simulados
    const [consumoPrimario, setConsumoPrimario] = useState<any>([]);
    const [hrsDisconfort, setHrsDisconfort] = useState<any>([]);
    const [demandaData, setDemandaData] = useState<any>([]);
    const [co2eqData, setCo2eqData] = useState<any>({ total: 0, unidad: '[kg CO2eq]', comparacion: '0%' });
    const [recintoData, setRecintoData] = useState<any[]>([]); // <-- NUEVO ESTADO
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { id: projectId } = router.query;

    useEffect(() => {
        if (!projectId) return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Ejecutar v2 primero
                await fetch(`/api/calculate_v2/${projectId}`);
                // Luego v3
                const res = await fetch(`/api/calculate_v3/${projectId}`);
                if (!res.ok) throw new Error('Error al obtener resultados de cálculo');
                const data = await res.json();
                // Mapear resultados al estado
                // Demanda
                setDemandaData([
                    { concepto: 'Calefacción', kwh_m2_ano: data.final_indicators.demanda_calefaccion_final, kwh_ano: data.final_indicators.demanda_calefaccion_final2, vsCasoBase: (data.final_indicators.demanda_calef_vs * 100).toFixed(0) + '%' },
                    { concepto: 'Refrigeración', kwh_m2_ano: data.final_indicators.demanda_ref_final, kwh_ano: data.final_indicators.demanda_ref_final2, vsCasoBase: (data.final_indicators.demanda_ref_vs * 100).toFixed(0) + '%' },
                    { concepto: 'Iluminación', kwh_m2_ano: data.final_indicators.demanda_iluminacion_final, kwh_ano: data.final_indicators.demanda_iluminacion_final2, vsCasoBase: (data.final_indicators.demanda_iluminacion_vs * 100).toFixed(0) + '%' },
                    { concepto: 'Total', kwh_m2_ano: data.final_indicators.demanda_calefaccion_final + data.final_indicators.demanda_ref_final + data.final_indicators.demanda_iluminacion_final, kwh_ano: data.final_indicators.demanda_calefaccion_final2 + data.final_indicators.demanda_ref_final2 + data.final_indicators.demanda_iluminacion_final2, vsCasoBase: '-' },
                ]);
                // Consumo
                setConsumoPrimario([
                    { concepto: 'Calefacción', kwh_m2_ano: data.final_indicators.consumo_calefaccion_final, kwh_ano: data.final_indicators.consumo_calefaccion_final2, vsCasoBase: (data.final_indicators.consumo_calef_vs * 100).toFixed(0) + '%' },
                    { concepto: 'Refrigeración', kwh_m2_ano: data.final_indicators.consumo_refrigeracion_final, kwh_ano: data.final_indicators.consumo_refrigeracion_final2, vsCasoBase: (data.final_indicators.consumo_ref_vs * 100).toFixed(0) + '%' },
                    { concepto: 'Iluminación', kwh_m2_ano: data.final_indicators.consumo_iluminacion_final, kwh_ano: data.final_indicators.consumo_iluminacion_final2, vsCasoBase: (data.final_indicators.consumo_iluminacion_vs * 100).toFixed(0) + '%' },
                    { concepto: 'Total', kwh_m2_ano: data.final_indicators.consumo_calefaccion_final + data.final_indicators.consumo_refrigeracion_final + data.final_indicators.consumo_iluminacion_final, kwh_ano: data.final_indicators.consumo_calefaccion_final2 + data.final_indicators.consumo_refrigeracion_final2 + data.final_indicators.consumo_iluminacion_final2, vsCasoBase: '-' },
                ]);
                // Disconfort
                setHrsDisconfort([
                    { concepto: 'Calefacción', hrs_ano: data.final_indicators.disconfort_calef },
                    { concepto: 'Refrigeración', hrs_ano: data.final_indicators.disconfort_ref },
                    { concepto: 'Total', hrs_ano: data.final_indicators.disconfort_total },
                    { concepto: 'Comparación caso base', hrs_ano: (data.final_indicators.disconfort_vs * 100).toFixed(0) + '%', nota: '[%]' },
                ]);
                // CO2
                setCo2eqData({
                    total: data.final_indicators.co2_eq_total,
                    unidad: '[kg CO2eq]',
                    comparacion: (data.final_indicators.co2_eq_vs_caso_base * 100).toFixed(0) + '%',
                });
                // Recintos
                if (Array.isArray(data.result_by_enclosure_v2)) {
                    setRecintoData(data.result_by_enclosure_v2);
                } else {
                    setRecintoData([]);
                }
            } catch (err: any) {
                setError(err.message || 'Error inesperado');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    // --- Solo lógica de fetch y estados nuevos, sin props ni efectos antiguos ---

    if (loading) {
        return <div className="container my-4"><div className="alert alert-info">Cargando resumen de energía...</div></div>;
    }
    if (error) {
        return <div className="container my-4"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container my-4">
            <h1 className="mb-3">Resumen de Energía</h1>

            {/* Grid principal */}
            <div className="row">
                {/* Sección Demanda */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <Flame className="me-2" />
                            <strong>Demanda</strong>
                        </div>
                        <div className="card-body p-2">
                            <table className="table table-bordered table-sm mb-0">
                                <thead>
                                    <tr className="table-light">
                                        <th rowSpan={2}>Concepto</th>
                                        <th colSpan={3} className="text-center">Demanda</th>
                                    </tr>
                                    <tr className="table-light">
                                        <th>[kWh/m2-año]</th>
                                        <th>[kWh-año]</th>
                                        <th>% Versus caso base</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demandaData?.map((item:any, index:number) => (
                                        <tr key={index}>
                                            <td>{item.concepto}</td>
                                            <td>{item.kwh_m2_ano}</td>
                                            <td>{item.kwh_ano.toLocaleString()}</td>
                                            <td>{item.vsCasoBase}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sección Consumo Energía Primaria */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <Droplet className="me-2" />
                            <strong>Consumo Energía Primaria</strong>
                        </div>
                        <div className="card-body p-2">
                            <table className="table table-bordered table-sm mb-0">
                                <thead>
                                    <tr className="table-light">
                                        <th rowSpan={2}>Concepto</th>
                                        <th colSpan={3} className="text-center">
                                            Consumo Energía Primaria
                                        </th>
                                    </tr>
                                    <tr className="table-light">
                                        <th>[kWh/m2-año]</th>
                                        <th>[kWh-año]</th>
                                        <th>% Versus caso base</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consumoPrimario.map((item: { concepto: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; kwh_m2_ano: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; kwh_ano: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; vsCasoBase: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, idx: Key | null | undefined) => (
                                        <tr key={idx}>
                                            <td>{item.concepto}</td>
                                            <td>{item.kwh_m2_ano}</td>
                                            <td>{item.kwh_ano.toLocaleString()}</td>
                                            <td>{item.vsCasoBase}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sección Hrs Disconfort */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <Snowflake className="me-2" />
                            <strong>Hrs Disconfort T° libre</strong>
                        </div>
                        <div className="card-body p-2">
                            <table className="table table-bordered table-sm mb-0">
                                <thead>
                                    <tr className="table-light">
                                        <th>Concepto</th>
                                        <th>[hrs -año]</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hrsDisconfort.map((item: { concepto: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; hrs_ano: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; nota: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, idx: Key | null | undefined) => (
                                        <tr key={idx}>
                                            <td>{item.concepto}</td>
                                            <td>
                                                {item.hrs_ano} {item.nota && <small>{item.nota}</small>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sección CO2_eq */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <Cloud className="me-2" />
                            <strong>CO₂_eq</strong>
                        </div>
                        <div className="card-body p-2">
                            <table className="table table-bordered table-sm mb-0">
                                <thead>
                                    <tr className="table-light">
                                        <th>Total</th>
                                        <th className="text-end">{co2eqData.total.toLocaleString()}</th>
                                        <th>{co2eqData.unidad}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Comparación caso base</td>
                                        <td colSpan={2} className="text-center">
                                            {co2eqData.comparacion}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        {/* Tabla de Recintos */}
        <div className="row mt-5">
            <div className="col-12">
                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <strong>Datos del Recinto</strong>
                    </div>
                    <div className="card-body p-2">
                        <table className="table table-bordered table-sm mb-0">
                            <thead>
                                <tr className="table-light">
                                    <th>#</th>
                                    <th>Recinto</th>
                                    <th>Perfil de Ocupación</th>
                                    <th>Superficie [m2]</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recintoData.length > 0 ? (
                                    recintoData.map((recinto, idx) => (
                                        <tr key={recinto.id || idx}>
                                            <td>{idx + 1}</td>
                                            <td>{recinto.nombre_recinto || recinto.name_enclosure || '-'}</td>
                                            <td>{recinto.perfil_uso || recinto.usage_profile_name || '-'}</td>
                                            <td>{recinto.superficie != null ? recinto.superficie.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center">No hay datos de recintos</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
