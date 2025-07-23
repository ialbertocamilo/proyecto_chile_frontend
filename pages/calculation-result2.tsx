// pages/resumen-energia.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { Cloud, Droplet, Flame, Snowflake, PlayCircle, Download } from 'lucide-react';
import ChartComponent from '../src/components/chart/ChartComponent';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}
import { notify } from '../src/utils/notify';

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';

import FileDropzone from '../src/components/FileDropzone';
import { constantUrlApiEndpoint } from '../src/utils/constant-url-endpoint';
import EnergyAnalysis from '@/components/energy/EnergyAnalysis';

interface ChartDataItem {
    concepto: string;
    kwh_m2_ano: string | number;
    kwh_ano?: string | number;
    vsCasoBase?: string;
    nota?: string;
}

export default function ResumenEnergia(props: any) {
    // Si se pasan props, usar los datos reales, si no, usar simulados
    const [consumoPrimario, setConsumoPrimario] = useState<ChartDataItem[]>([]);
    const [hrsDisconfort, setHrsDisconfort] = useState<ChartDataItem[]>([]);
    const [demandaData, setDemandaData] = useState<ChartDataItem[]>([]);
    const [co2eqData, setCo2eqData] = useState<any>({ total: 0, unidad: '[kg CO2eq]', comparacion: '0%' });
    const [showPercentage, setShowPercentage] = useState<boolean>(false);
    const [chartView, setChartView] = useState<'monthly' | 'annual'>('annual');
    
    // Calculate base case values from current data and percentages
    const baseCaseValues = useMemo(() => {
        if (demandaData.length === 0) return { 
            demandaTotal_m2: 0, 
            demandaTotal_ano: 0, 
            consumoTotal_m2: 0, 
            consumoTotal_ano: 0,
            demandaItems: [],
            consumoItems: []
        };
        
        // Calculate base case values by working backwards from percentages
        // If vsCasoBase is "X%", then current = base * (1 + X/100)
        // So base = current / (1 + X/100)
        let demandaBaseTotal_m2 = 0;
        let demandaBaseTotal_ano = 0;
        let consumoBaseTotal_m2 = 0;
        let consumoBaseTotal_ano = 0;
        
        const demandaItems = demandaData.map((item: any) => {
            if (item.concepto !== 'Total' && item.vsCasoBase !== '-') {
                const percentage = parseFloat(item.vsCasoBase.replace('%', '')) / 100;
                const current_m2 = parseFloat(item.kwh_m2_ano || '0');
                const current_ano = parseFloat(item.kwh_ano || '0');
                
                // Calculate base case values
                const base_m2 = current_m2 / (1 + percentage);
                const base_ano = current_ano / (1 + percentage);
                
                demandaBaseTotal_m2 += base_m2;
                demandaBaseTotal_ano += base_ano;
                
                return {
                    ...item,
                    baseCaseKwh_ano: base_ano
                };
            }
            return {
                ...item,
                baseCaseKwh_ano: item.concepto === 'Total' ? demandaBaseTotal_ano : 0
            };
        });
        
        const consumoItems = consumoPrimario.map((item: any) => {
            if (item.concepto !== 'Total' && item.vsCasoBase !== '-') {
                const percentage = parseFloat(item.vsCasoBase.replace('%', '')) / 100;
                const current_m2 = parseFloat(item.kwh_m2_ano || '0');
                const current_ano = parseFloat(item.kwh_ano || '0');
                
                // Calculate base case values
                const base_m2 = current_m2 / (1 + percentage);
                const base_ano = current_ano / (1 + percentage);
                
                consumoBaseTotal_m2 += base_m2;
                consumoBaseTotal_ano += base_ano;
                
                return {
                    ...item,
                    baseCaseKwh_ano: base_ano
                };
            }
            return {
                ...item,
                baseCaseKwh_ano: item.concepto === 'Total' ? consumoBaseTotal_ano : 0
            };
        });
        
        return {
            demandaTotal_m2: demandaBaseTotal_m2,
            demandaTotal_ano: demandaBaseTotal_ano,
            consumoTotal_m2: consumoBaseTotal_m2,
            consumoTotal_ano: consumoBaseTotal_ano,
            demandaItems,
            consumoItems
        };
    }, [demandaData, consumoPrimario]);

    // Calculate chart data based on current view and percentage mode
    const chartData = useMemo(() => {
        const labels = demandaData
            .filter((item: any) => item.concepto !== 'Total')
            .map((item: any) => item.concepto);
            
        const demandaValues = demandaData
            .filter((item: any) => item.concepto !== 'Total')
            .map((item: any) => parseFloat(item.kwh_m2_ano || '0'));
            
        const consumoValues = consumoPrimario
            .filter((item: any) => item.concepto !== 'Total')
            .map((item: any) => parseFloat(item.kwh_m2_ano || '0'));
            
        // Calculate percentages if showPercentage is true
        if (showPercentage) {
            const totalDemanda = demandaValues.reduce((sum: number, val: number) => sum + val, 0);
            const totalConsumo = consumoValues.reduce((sum: number, val: number) => sum + val, 0);
            
            return {
                labels,
                demandaValues: totalDemanda > 0 ? demandaValues.map((val: number) => (val / totalDemanda) * 100) : demandaValues,
                consumoValues: totalConsumo > 0 ? consumoValues.map((val: number) => (val / totalConsumo) * 100) : consumoValues,
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
    const [recintoData, setRecintoData] = useState<any[]>([]); // <-- NUEVO ESTADO
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
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
                        { concepto: 'Calefacción', kwh_m2_ano: Number(data.final_indicators.disconfort_calef).toFixed(2) },
                        { concepto: 'Refrigeración', kwh_m2_ano: Number(data.final_indicators.disconfort_ref).toFixed(2) },
                        { concepto: 'Total', kwh_m2_ano: Number(data.final_indicators.disconfort_total).toFixed(2) },
                        { concepto: 'Ahorro versus caso base', kwh_m2_ano: (data.final_indicators.disconfort_vs * 100).toFixed(2) + '%', nota: '[%]' },
                    ]);
                    setCo2eqData({
                        total: Number(data.final_indicators.co2_eq_total).toFixed(2),
                        unidad: '[kg CO2eq/KWh]',
                        comparacion: (data.final_indicators.co2_eq_vs_caso_base * 100).toFixed(0) + '%',
                    });
                    if (data.result_by_enclosure) {
                        setRecintoData(data.result_by_enclosure);
                    } else {
                        setRecintoData([]);
                    }
                } else {
                    setCo2eqData({ total: 0, unidad: '[kgCO2eq/KWh]', comparacion: '0%' });
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


            {/* Botones de acción */}
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
                                { concepto: 'Calefacción', kwh_m2_ano: Number(data.final_indicators.disconfort_calef).toFixed(2) },
                                { concepto: 'Refrigeración', kwh_m2_ano: Number(data.final_indicators.disconfort_ref).toFixed(2) },
                                { concepto: 'Total', kwh_m2_ano: Number(data.final_indicators.disconfort_total).toFixed(2) },
                                { concepto: 'Ahorro versus caso base', kwh_m2_ano: (data.final_indicators.disconfort_vs * 100).toFixed(2) + '%', nota: '[%]' },
                            ]);
                            setCo2eqData({
                                total: Number(data.final_indicators.co2_eq_total).toFixed(2),
                                unidad: '[kg CO2eq/KWh]',
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
                
                {/* Botón Descargar PDF */}
                <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center"
                    style={{ fontWeight: 'bold' }}
                    disabled={loadingPdf || demandaData.length === 0}
                    onClick={async () => {
                        if (demandaData.length === 0) return;
                        setLoadingPdf(true);
                        try {
                            // Crear un nuevo documento PDF
                            const doc = new jsPDF();
                            const pageWidth = doc.internal.pageSize.getWidth();
                            const margin = 15;
                            let yPos = 20;
                            
                            // Título del reporte
                            doc.setFontSize(18);
                            doc.text('Reporte de Análisis Energético', pageWidth / 2, yPos, { align: 'center' });
                            yPos += 15;
                            
                            // Fecha de generación
                            doc.setFontSize(10);
                            doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth - margin, 10, { align: 'right' });
                            
                            // Función auxiliar para agregar tablas
                            const addTable = (title: string, headers: string[][], data: any[], columns: string[]) => {
                                if (yPos > 250) {
                                    doc.addPage();
                                    yPos = 20;
                                }
                                
                                doc.setFontSize(12);
                                doc.text(title, margin, yPos);
                                yPos += 8;
                                
                                // Add table using autoTable
                                autoTable(doc, {
                                    startY: yPos,
                                    head: headers,
                                    body: data.map(row => columns.map(col => row[col] || '')),
                                    margin: { left: margin, right: margin },
                                    styles: { fontSize: 8, cellPadding: 2 },
                                    headStyles: { 
                                        fillColor: [41, 128, 185], 
                                        textColor: 255, 
                                        fontStyle: 'bold' 
                                    },
                                    alternateRowStyles: { fillColor: 245 }
                                });
                                
                                // Get the final Y position after the table
                                yPos = (doc as any).lastAutoTable.finalY + 10;
                            };
                            
                            // Tabla de Demanda
                            addTable(
                                'Demanda Energética',
                                [
                                    ['Concepto', 'kWh/m²-año', 'kWh-año', '% vs Caso Base']
                                ],
                                demandaData,
                                ['concepto', 'kwh_m2_ano', 'kwh_ano', 'vsCasoBase']
                            );
                            
                            // Tabla de Consumo Primario
                            addTable(
                                'Consumo de Energía Primaria',
                                [
                                    ['Concepto', 'kWh/m²-año', 'kWh-año', '% vs Caso Base']
                                ],
                                consumoPrimario,
                                ['concepto', 'kwh_m2_ano', 'kwh_ano', 'vsCasoBase']
                            );
                            
                            // Tabla de Horas de Disconfort
                            addTable(
                                'Horas de Disconfort Térmico',
                                [
                                    ['Concepto', 'Horas/año', 'Nota']
                                ],
                                hrsDisconfort,
                                ['concepto', 'hrs_ano', 'nota']
                            );
                            
                            // Emisiones de CO2
                            doc.setFontSize(12);
                            doc.text('Emisiones de CO2 Equivalente', margin, yPos);
                            yPos += 8;
                            doc.text(`Total: ${co2eqData.total} ${co2eqData.unidad} (${co2eqData.comparacion} vs caso base)`, margin + 5, yPos);
                            yPos += 10;
                            
                            // Guardar el PDF
                            doc.save(`reporte-energetico-${new Date().toISOString().split('T')[0]}.pdf`);
                            
                        } catch (err) {
                            console.error('Error al generar el PDF:', err);
                            notify('Error al generar el reporte PDF', 'error');
                        } finally {
                            setLoadingPdf(false);
                        }
                    }}
                >
                    {loadingPdf ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                        <Download size={20} style={{marginRight: 8}} />
                    )}
                    Descargar Reporte PDF
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
                    onClick={async () => {
                        setLoadingDownload(true);
                        try {
                            const res = await fetch(`/api/attachments/${projectId}/download`);
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
            </div>

            {/* Combined Energy Chart */}
            <EnergyAnalysis
                demandaData={demandaData}
                consumoPrimario={consumoPrimario}
                showPercentage={showPercentage}
            />
            {/* Sección Demanda */}
            <div className="row">
                <div className="col-12 col-lg-6 mb-4">
                    <div className="card h-100 border">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center">
                                <Flame className="me-2 text-warning" size={20} />
                                <h5 className="mb-0 fw-semibold text-dark">Demanda Energética</h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-borderless mb-0">
                                    <thead>
                                        <tr className="border-bottom border-200">
                                            <th rowSpan={2} className="text-uppercase text-900 fw-medium fs--1 text-center align-middle py-3 ps-3">Concepto</th>
                                        </tr>
                                        <tr className="border-bottom border-200">
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">[kWh/m²·año]</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">[kWh/año]</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">Base kWh/año</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">% vs Caso Base</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {baseCaseValues.demandaItems?.map((item:any, index:number) => (
                                            <tr 
                                                key={index} 
                                                className={`border-bottom border-200 ${item.concepto === 'Total' ? 'bg-100 fw-bold' : 'bg-white'}`}
                                            >
                                                <td className="text-nowrap ps-3 py-2">{item.concepto}</td>
                                                <td className="text-end font-mono text-900 py-2">
                                                    {parseFloat(item.kwh_m2_ano).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </td>
                                                <td className="text-end font-mono text-900 py-2">
                                                    {parseFloat(item.kwh_ano).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </td>
                                                <td className="text-end font-mono text-600 py-2">
                                                    {item.concepto === 'Total' ? 
                                                        baseCaseValues.demandaTotal_ano.toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2}) :
                                                        (item.baseCaseKwh_ano || 0).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                                    }
                                                </td>
                                                <td className="text-end font-mono fw-semi-bold text-900 py-2">
                                                    {item.vsCasoBase}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección Consumo Energía Primaria */}
                <div className="col-12 col-lg-6 mb-4">
                    <div className="card h-100 border">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center">
                                <Droplet className="me-2  text-danger" size={20} />
                                <h5 className="mb-0 fw-semibold text-dark">Consumo Energía Primaria</h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-borderless mb-0">
                                    <thead>
                                        <tr className="border-bottom border-200">
                                            <th rowSpan={2} className="text-uppercase text-900 fw-medium fs--1 text-center align-middle py-3 ps-3">Concepto</th>
                                        </tr>
                                        <tr className="border-bottom border-200">
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">[kWh/m²·año]</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">[kWh/año]</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">Base kWh/año</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">% vs Caso Base</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {baseCaseValues.consumoItems?.map((item: any, idx: number) => (
                                            <tr 
                                                key={idx} 
                                                className={`border-bottom border-200 ${item.concepto === 'Total' ? 'bg-100 fw-bold' : 'bg-white'}`}
                                            >
                                                <td className="text-nowrap ps-3 py-2">{item.concepto}</td>
                                                <td className="text-end font-mono text-900 py-2">
                                                    {parseFloat(item.kwh_m2_ano).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </td>
                                                <td className="text-end font-mono text-900 py-2">
                                                    {parseFloat(item.kwh_ano).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </td>
                                                <td className="text-end font-mono text-600 py-2">
                                                    {item.concepto === 'Total' ? 
                                                        baseCaseValues.consumoTotal_ano.toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2}) :
                                                        (item.baseCaseKwh_ano || 0).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                                    }
                                                </td>
                                                <td className="text-end font-mono fw-semi-bold text-900 py-2">
                                                    {item.vsCasoBase}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección Hrs Disconfort */}
                <div className="col-12 col-lg-6 mb-4">
                    <div className="card h-100 border">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center">
                                <Snowflake className="me-2 text-primary" size={20} />
                                <h5 className="mb-0 fw-semibold text-dark">Horas de Disconfort Térmico</h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-borderless mb-0">
                                    <thead>
                                        <tr className="border-bottom border-200">
                                            <th className="text-uppercase text-900 fw-medium fs--1 ps-3 py-3">Concepto</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-end pe-3 py-3">[horas/año]</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hrsDisconfort.map((item: any, idx: number) => (
                                            <tr 
                                                key={idx} 
                                                className={`border-bottom border-200 ${item.concepto === 'Total' ? 'bg-100 fw-bold' : 'bg-white'}`}
                                            >
                                                <td className="ps-3 py-2">{item.concepto}</td>
                                                <td className="text-end pe-3 py-2">
                                                    <div className="d-flex flex-column align-items-end">
                                                        <span className="font-mono text-900">
                                                            {parseFloat(item.kwh_m2_ano).toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                        </span>
                                                        {item.nota && <small className="text-500 font-sans-serif">{item.nota}</small>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección CO2eq */}
                <div className="col-12 col-lg-6 mb-4">
                    <div className="card h-100 border">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center">
                                <Cloud className="me-2 text-info" size={20} />
                                <h5 className="mb-0 fw-semibold text-dark">Emisiones de CO₂ Equivalente</h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-borderless mb-0">
                                    <thead>
                                        <tr className="border-bottom border-200">
                                            <th className="text-uppercase text-900 fw-medium fs--1 ps-3 py-3">Concepto</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">Valor</th>
                                            <th className="text-uppercase text-900 fw-medium fs--1 text-center py-3">Ahorro vs Caso Base</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-bottom border-200">
                                            <td className="ps-3 py-2">Emisiones Totales</td>
                                            <td className="text-center font-mono text-900 py-2">
                                                {co2eqData.total} {co2eqData.unidad}
                                            </td>
                                            <td className="text-center font-mono text-900 py-2">
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
                                <tr className="table-light text-center">
                                    <th>#</th>
                                    <th>Recinto</th>
                                    <th>Perfil de Ocupación</th>
                                    <th>Superficie [m2]</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recintoData.length > 0 ? (
                                    recintoData.map((recinto, idx) => (
                                        <tr key={recinto.enclosure_id || idx} className="text-center">
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
