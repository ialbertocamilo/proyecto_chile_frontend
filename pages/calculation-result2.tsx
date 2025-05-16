// pages/resumen-energia.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { Cloud, Droplet, Flame, Snowflake } from 'lucide-react';

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
export default function ResumenEnergia(props: any) {
    // Si se pasan props, usar los datos reales, si no, usar simulados
    const [consumoPrimario, setConsumoPrimario] = useState<any>(props.consumoPrimario || [
        { concepto: 'Calefacción', kwh_m2_ano: 216.7, kwh_ano: 43347.1, vsCasoBase: '0%' },
        { concepto: 'Refrigeración', kwh_m2_ano: 46.5, kwh_ano: 9297.5, vsCasoBase: '5%' },
        { concepto: 'Iluminación', kwh_m2_ano: 35.2, kwh_ano: 7039.3, vsCasoBase: '0%' },
        { concepto: 'ACS', kwh_m2_ano: 4.0, kwh_ano: 895.1, vsCasoBase: '-55%' },
        { concepto: 'Total', kwh_m2_ano: 302.9, kwh_ano: 60579.0, vsCasoBase: '1%' },
    ]);
    const [hrsDisconfort, setHrsDisconfort] = useState<any>(props.hrsDisconfort || [
        { concepto: 'Calefacción', hrs_ano: '19,106' },
        { concepto: 'Refrigeración', hrs_ano: '5,540' },
        { concepto: 'Total', hrs_ano: '24,646' },
        { concepto: 'Comparación caso base', hrs_ano: '3%', nota: '[%]' },
    ]);

    // Si se pasan los totales por props, calcular la comparación real
    // props.co2eqTotalRecintos: total CO2_eq actual
    // props.co2eqTotalBase: total CO2_eq caso base
    const co2eqTotalRecintos = Number(props.co2eqTotalRecintos ?? 20542.7);
    const co2eqTotalBase = Number(props.co2eqTotalBase ?? 18000); // valor base simulado
    const comparacionReal = co2eqTotalBase !== 0 ? ((co2eqTotalRecintos / co2eqTotalBase) * 100).toFixed(2) + '%' : '0%';

    interface DemandaItem {
            concepto: string;
            kwh_m2_ano: number;
            kwh_ano: number;
            vsCasoBase: string;
        }
    
    interface Co2eqData {
            total: number;
            unidad: string;
            comparacion: string;
        }
        
        const [demandaData, setDemandaData] = useState<DemandaItem[]>(props.demandaData as DemandaItem[] || [
            { concepto: 'Calefacción', kwh_m2_ano: 114.1, kwh_ano: 22814.2, vsCasoBase: '14%' },
            { concepto: 'Refrigeración', kwh_m2_ano: 72.1, kwh_ano: 14411.2, vsCasoBase: '-7%' },
            { concepto: 'Iluminación', kwh_m2_ano: 35.2, kwh_ano: 7039.3, vsCasoBase: '0%' },
            { concepto: 'ACS', kwh_m2_ano: 2.0, kwh_ano: 303.4, vsCasoBase: '0%' },
            { concepto: 'Total', kwh_m2_ano: 222.8, kwh_ano: 44568.1, vsCasoBase: '6%' },
        ]);
    
        const [co2eqData, setCo2eqData] = useState<Co2eqData>({
        total: (props.co2eqData as Co2eqData)?.total ?? co2eqTotalRecintos,
        unidad: (props.co2eqData as Co2eqData)?.unidad ?? '[kg CO2eq]',
        comparacion: (props.co2eqData as Co2eqData)?.comparacion ?? comparacionReal,
    });

    // Si cambian los props, actualiza los datos
    useEffect(() => {
        if (props.demandaData) setDemandaData(props.demandaData);
        if (props.consumoPrimario) setConsumoPrimario(props.consumoPrimario);
        if (props.hrsDisconfort) setHrsDisconfort(props.hrsDisconfort);
        // Si cambian los totales, recalcula la comparación
        if (props.co2eqTotalRecintos !== undefined && props.co2eqTotalBase !== undefined) {
            setCo2eqData((prev: any) => ({
                ...prev,
                total: props.co2eqTotalRecintos,
                comparacion: props.co2eqTotalBase !== 0 ? ((Number(props.co2eqTotalRecintos) / Number(props.co2eqTotalBase)) * 100).toFixed(2) + '%' : '0%',
            }));
        } else if (props.co2eqData && typeof props.co2eqData === 'object' && 'total' in props.co2eqData && 'unidad' in props.co2eqData && 'comparacion' in props.co2eqData) {
            setCo2eqData(props.co2eqData as Co2eqData);
        }
    }, [props.demandaData, props.consumoPrimario, props.hrsDisconfort, props.co2eqData, props.co2eqTotalRecintos, props.co2eqTotalBase]);

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
        </div>
    );
}
