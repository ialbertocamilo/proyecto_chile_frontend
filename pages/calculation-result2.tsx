// pages/resumen-energia.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { Cloud, Droplet, Flame, Snowflake, PlayCircle } from 'lucide-react';
import { notify } from '../src/utils/notify';

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import FileDropzone from '../src/components/FileDropzone';
import { constantUrlApiEndpoint } from '../src/utils/constant-url-endpoint';

export default function ResumenEnergia(props: any) {
    // Si se pasan props, usar los datos reales, si no, usar simulados
    const [consumoPrimario, setConsumoPrimario] = useState<any>([]);
    const [hrsDisconfort, setHrsDisconfort] = useState<any>([]);
    const [demandaData, setDemandaData] = useState<any>([]);
    const [co2eqData, setCo2eqData] = useState<any>({ total: 0, unidad: '[kg CO2eq]', comparacion: '0%' });
    const [recintoData, setRecintoData] = useState<any[]>([]); // <-- NUEVO ESTADO
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { id: projectId } = router.query;
    const [useAttachedData, setUseAttachedData] = useState<boolean>(false);


    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Verificar si el usuario es administrador
    useEffect(() => {
        const roleId = localStorage.getItem('role_id');
        setIsAdmin(roleId === '1');
    }, []);

    // Cargar resultados de cálculo al cargar la página
    useEffect(() => {
        if (!projectId) return;
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const url = `${constantUrlApiEndpoint}/calculation-results/projects/${projectId}`;
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                if (!res.ok) {
                    if (res.status === 404) {
                        setLoading(false);
                        return;
                    }
                    throw new Error('Error al obtener resultados de cálculo');
                }
                const data = await res.json();
                if (data && data.final_indicators) {
                    setDemandaData([
                        { concepto: 'Calefacción', kwh_m2_ano: Number(data.final_indicators.demanda_calefaccion_final).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_calefaccion_final2).toFixed(2), vsCasoBase: (data.final_indicators.demanda_calef_vs * 100).toFixed(2) + '%' },
                        { concepto: 'Refrigeración', kwh_m2_ano: Number(data.final_indicators.demanda_ref_final).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_ref_final2).toFixed(2), vsCasoBase: (data.final_indicators.demanda_ref_vs * 100).toFixed(2) + '%' },
                        { concepto: 'Iluminación', kwh_m2_ano: Number(data.final_indicators.demanda_iluminacion_final).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_iluminacion_final2).toFixed(2), vsCasoBase: (data.final_indicators.demanda_iluminacion_vs * 100).toFixed(2) + '%' },
                        { concepto: 'ACS', kwh_m2_ano: Number(data.final_indicators.demanda_acs_m2).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_acs).toFixed(2), vsCasoBase: (data.final_indicators.demanda_acs_vs_caso_base * 100).toFixed(2) + '%' },
                        { concepto: 'Total', kwh_m2_ano: (Number(data.final_indicators.demanda_calefaccion_final) + Number(data.final_indicators.demanda_ref_final) + Number(data.final_indicators.demanda_iluminacion_final) + Number(data.final_indicators.demanda_acs_m2)).toFixed(2), kwh_ano: (Number(data.final_indicators.demanda_calefaccion_final2) + Number(data.final_indicators.demanda_ref_final2) + Number(data.final_indicators.demanda_iluminacion_final2) + Number(data.final_indicators.demanda_acs)).toFixed(2), vsCasoBase: '-' },
                    ]);
                    setConsumoPrimario([
                        { concepto: 'Calefacción', kwh_m2_ano: Number(data.final_indicators.consumo_calefaccion_final).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_calefaccion_final2).toFixed(2), vsCasoBase: (data.final_indicators.consumo_calef_vs * 100).toFixed(2) + '%' },
                        { concepto: 'Refrigeración', kwh_m2_ano: Number(data.final_indicators.consumo_refrigeracion_final).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_refrigeracion_final2).toFixed(2), vsCasoBase: (data.final_indicators.consumo_ref_vs * 100).toFixed(2) + '%' },
                        { concepto: 'Iluminación', kwh_m2_ano: Number(data.final_indicators.consumo_iluminacion_final).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_iluminacion_final2).toFixed(2), vsCasoBase: (data.final_indicators.consumo_iluminacion_vs * 100).toFixed(2) + '%' },
                        { concepto: 'ACS', kwh_m2_ano: Number(data.final_indicators.consumo_acs_m2).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_acs).toFixed(2), vsCasoBase: Number(data.final_indicators.consumo_acs_vs_caso_base).toFixed(2) },
                        { concepto: 'Total', kwh_m2_ano: (Number(data.final_indicators.consumo_calefaccion_final) + Number(data.final_indicators.consumo_refrigeracion_final) + Number(data.final_indicators.consumo_iluminacion_final) + Number(data.final_indicators.consumo_acs_m2)).toFixed(2), kwh_ano: (Number(data.final_indicators.consumo_calefaccion_final2) + Number(data.final_indicators.consumo_refrigeracion_final2) + Number(data.final_indicators.consumo_iluminacion_final2) + Number(data.final_indicators.consumo_acs)).toFixed(2), vsCasoBase: '-' },
                    ]);
                    setHrsDisconfort([
                        { concepto: 'Calefacción', hrs_ano: Number(data.final_indicators.disconfort_calef).toFixed(2) },
                        { concepto: 'Refrigeración', hrs_ano: Number(data.final_indicators.disconfort_ref).toFixed(2) },
                        { concepto: 'Total', hrs_ano: Number(data.final_indicators.disconfort_total).toFixed(2) },
                        { concepto: 'Comparación caso base', hrs_ano: (data.final_indicators.disconfort_vs * 100).toFixed(2) + '%', nota: '[%]' },
                    ]);
                    setCo2eqData({
                        total: Number(data.final_indicators.co2_eq_total).toFixed(2),
                        unidad: '[kg CO2eq]',
                        comparacion: (data.final_indicators.co2_eq_vs_caso_base * 100).toFixed(0) + '%',
                    });
                    if (data.result_by_enclosure) {
                        setRecintoData(data.result_by_enclosure);
                    } else {
                        setRecintoData([]);
                    }
                } else {
                    setCo2eqData({ total: 0, unidad: '[kg CO2eq]', comparacion: '0%' });
                    setDemandaData([]);
                    setConsumoPrimario([]);
                    setHrsDisconfort([]);
                    setRecintoData([]);
                }
            } catch (err: any) {
                setError(err.message || 'Error inesperado');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [projectId]);

    const handleFileAccepted = (files: File[]) => {
        setUploadedFiles(files);
        // Aquí puedes agregar lógica para procesar los archivos
    };
    if (error) {
        return <div className="container my-4"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container my-4">
            <h1 className="mb-3">Resumen de Energía</h1>

            {/* Dropzone para subir archivos */}
            {/* <FileDropzone onFileAccepted={handleFileAccepted} /> */}
            {/* {uploadedFiles.length > 0 && (
                <div className="alert alert-success py-2">
                    Archivos subidos: <strong>{uploadedFiles.map(f => f.name).join(', ')}</strong>
                </div>
            )} */}


            {/* Botón Calcular */}
            <div className="d-flex align-items-center mb-3" style={{gap: 16}}>
                <button
                    type="button"
                    className="btn d-flex align-items-center"
                    style={{ backgroundColor: 'orange', color: 'white', fontWeight: 'bold' }}
                    disabled={loading || isAdmin}
                    onClick={async () => {
                    if (!projectId) return;
                    setLoading(true);
                    setError(null);
                    try {
                        // Si el toggle está activo, primero sube el archivo
                        if (useAttachedData) {
                            if (!uploadedFiles || uploadedFiles.length === 0) {
                                notify('Debe adjuntar al menos un archivo antes de calcular.', 'error');
                                setLoading(false);
                                return;
                            }
                            const formData = new FormData();
                            const token = localStorage.getItem('token');
                            uploadedFiles.forEach(file => formData.append('files', file));
                            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/calculator/upload/${projectId}`, {
                                method: 'POST',
                                body: formData,
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            if (!uploadRes.ok) {
                                const errMsg = await uploadRes.text();
                                throw new Error('Error al subir el archivo: ' + errMsg);
                            }
                        }
                        // Luego v2
                        const v2res = await fetch(`/api/calculate_v2/${projectId}?force_data=${useAttachedData ? 'true' : 'false'}`);
                        if (!v2res.ok) throw new Error('Error al ejecutar cálculo v2');
                        // Luego v3
                        const token = localStorage.getItem('token');
                        const res = await fetch(`/api/calculate_v3/${projectId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (!res.ok) throw new Error('Error al obtener resultados de cálculo');
                        const data = await res.json();
                            setDemandaData([
                                { concepto: 'Calefacción', kwh_m2_ano: Number(data.final_indicators.demanda_calefaccion_final).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_calefaccion_final2).toFixed(2), vsCasoBase: (data.final_indicators.demanda_calef_vs * 100).toFixed(2) + '%' },
                                { concepto: 'Refrigeración', kwh_m2_ano: Number(data.final_indicators.demanda_ref_final).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_ref_final2).toFixed(2), vsCasoBase: (data.final_indicators.demanda_ref_vs * 100).toFixed(2) + '%' },
                                { concepto: 'Iluminación', kwh_m2_ano: Number(data.final_indicators.demanda_iluminacion_final).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_iluminacion_final2).toFixed(2), vsCasoBase: (data.final_indicators.demanda_iluminacion_vs * 100).toFixed(2) + '%' },
                                { concepto: 'ACS', kwh_m2_ano: Number(data.final_indicators.demanda_acs_m2).toFixed(2), kwh_ano: Number(data.final_indicators.demanda_acs).toFixed(2), vsCasoBase: (data.final_indicators.demanda_acs_vs_caso_base * 100).toFixed(2) + '%' },
                                { concepto: 'Total', kwh_m2_ano: (Number(data.final_indicators.demanda_calefaccion_final) + Number(data.final_indicators.demanda_ref_final) + Number(data.final_indicators.demanda_iluminacion_final) + Number(data.final_indicators.demanda_acs_m2)).toFixed(2), kwh_ano: (Number(data.final_indicators.demanda_calefaccion_final2) + Number(data.final_indicators.demanda_ref_final2) + Number(data.final_indicators.demanda_iluminacion_final2) + Number(data.final_indicators.demanda_acs)).toFixed(2), vsCasoBase: '-' },
                            ]);
                            setConsumoPrimario([
                                { concepto: 'Calefacción', kwh_m2_ano: Number(data.final_indicators.consumo_calefaccion_final).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_calefaccion_final2).toFixed(2), vsCasoBase: (data.final_indicators.consumo_calef_vs * 100).toFixed(2) + '%' },
                                { concepto: 'Refrigeración', kwh_m2_ano: Number(data.final_indicators.consumo_refrigeracion_final).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_refrigeracion_final2).toFixed(2), vsCasoBase: (data.final_indicators.consumo_ref_vs * 100).toFixed(2) + '%' },
                                { concepto: 'Iluminación', kwh_m2_ano: Number(data.final_indicators.consumo_iluminacion_final).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_iluminacion_final2).toFixed(2), vsCasoBase: (data.final_indicators.consumo_iluminacion_vs * 100).toFixed(2) + '%' },
                                { concepto: 'ACS', kwh_m2_ano: Number(data.final_indicators.consumo_acs_m2).toFixed(2), kwh_ano: Number(data.final_indicators.consumo_acs).toFixed(2), vsCasoBase: Number(data.final_indicators.consumo_acs_vs_caso_base).toFixed(2) },
                                { concepto: 'Total', kwh_m2_ano: (Number(data.final_indicators.consumo_calefaccion_final) + Number(data.final_indicators.consumo_refrigeracion_final) + Number(data.final_indicators.consumo_iluminacion_final) + Number(data.final_indicators.consumo_acs_m2)).toFixed(2), kwh_ano: (Number(data.final_indicators.consumo_calefaccion_final2) + Number(data.final_indicators.consumo_refrigeracion_final2) + Number(data.final_indicators.consumo_iluminacion_final2) + Number(data.final_indicators.consumo_acs)).toFixed(2), vsCasoBase: '-' },
                            ]);
                            setHrsDisconfort([
                                { concepto: 'Calefacción', hrs_ano: Number(data.final_indicators.disconfort_calef).toFixed(2) },
                                { concepto: 'Refrigeración', hrs_ano: Number(data.final_indicators.disconfort_ref).toFixed(2) },
                                { concepto: 'Total', hrs_ano: Number(data.final_indicators.disconfort_total).toFixed(2) },
                                { concepto: 'Comparación caso base', hrs_ano: (data.final_indicators.disconfort_vs * 100).toFixed(2) + '%', nota: '[%]' },
                            ]);
                            setCo2eqData({
                                total: Number(data.final_indicators.co2_eq_total).toFixed(2),
                                unidad: '[kg CO2eq]',
                                comparacion: (data.final_indicators.co2_eq_vs_caso_base * 100).toFixed(0) + '%',
                            });
                            if (data.result_by_enclosure) {
                                setRecintoData(data.result_by_enclosure);
                            } else {
                                setRecintoData([]);
                            }
                       
                    } catch (err: any) {
                        notify(err.message || 'Error inesperado', 'error');
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                    <PlayCircle size={20} style={{marginRight: 8}} />
                )}
                Calcular
                </button>
                {/* <div className="form-check form-switch d-flex align-items-center" style={{marginLeft: 8}}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="useAttachedData"
                        checked={useAttachedData}
                        onChange={() => setUseAttachedData(v => !v)}
                        style={{cursor: 'pointer'}}
                    />
                    <label className="form-check-label ms-2" htmlFor="useAttachedData" style={{cursor: 'pointer'}}>
                        Usar datos adjuntos
                    </label>
                </div> */}
            </div>

            {/* Botón Descargar archivos adjuntos */}
            {/* {projectId && (
                <button
                    type="button"
                    className="btn btn-outline-primary me-2"
                    style={{fontWeight: 'bold'}}
                    disabled={loadingDownload}
                    onClick={async () => {
                        setLoadingDownload(true);
                        try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/calculator/download/${projectId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (!res.ok) throw new Error('Error al descargar archivos adjuntos');
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${projectId}_files.zip`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                        } catch (err: any) {
                            notify(err.message || 'Error inesperado al descargar', 'error');
                        } finally {
                            setLoadingDownload(false);
                        }
                    }}
                >
                    {loadingDownload ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                        <Cloud size={18} className="me-2" />
                    )}
                    Descargar archivos procesados
                </button>
            )} */}
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
                                <tbody>
                                    <tr>
                                        <td>Total</td>
                                        <td colSpan={2}  className="text-center">{co2eqData.total.toLocaleString()} {co2eqData.unidad}</td>
                                    </tr>
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
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header ">
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
                                        <tr key={recinto.enclosure_id || idx}>
                                            <td>{recinto.enclosure_id}</td>
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
