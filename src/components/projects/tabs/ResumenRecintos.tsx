import { useApi } from '@/hooks/useApi';
import { useConstants } from '@/hooks/useConstantsHook';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface ResumenRecintosProps {
    onRecintosCalculated: (recintos: Recinto[]) => void;
}

const ResumenRecintos = ({ onRecintosCalculated }: ResumenRecintosProps) => {
    const api = useApi();
    const router = useRouter();
    const result = useConstants("energy_systems", "general");

    interface Recinto {
        id: number;
        name_enclosure: string;
        usage_profile_name: string;
        height: number;
        superficie: number;
        demanda_calef: number;
        demanda_ref: number;
        demanda_ilum: number;
        demanda_total: number;
        consumo_calef: number;
        consumo_ref: number;
        consumo_total: number;
        co2_eq: number;
        hrs_disconfort: number;
        rendimiento_calef?: number;
        distribucion_calef?: number;
        control_calef?: number;
        scop_calef?: number;
        scop_mc_calef?: number;
        rendimiento_ref?: number;
        distribucion_ref?: number;
        control_ref?: number;
        scop_ref?: number;
        scop_mc_ref?: number;
        consumo_energia_primaria_calef?: number;
        consumo_energia_primaria_ref?: number;
        consumo_energia_primaria_total?: number;
    }

    const [recintos, setRecintos] = useState<Recinto[]>([]);
    const [calculatedRecintos, setCalculatedRecintos] = useState<Recinto[]>([]);
    const [selectedEnergySystems, setSelectedEnergySystems] = useState<{ [key: number]: string }>({});
    const [energySystems, setEnergySystems] = useState<any[]>([]);

    const handleEnergySystemChange = (recintoId: number, value: string) => {
        setSelectedEnergySystems(prev => ({ ...prev, [recintoId]: value }));
    };

    useEffect(() => {
        if (router.query.id) {
            api.get(`/enclosure-generals/${router.query.id}`).then(data => {
                const updatedData = data.map((recinto: any) => ({
                    ...recinto,
                    demanda_calef: recinto.demanda_calef || 2,
                    demanda_ref: recinto.demanda_ref || 0,
                    demanda_ilum: recinto.demanda_ilum || 0,
                    demanda_total: recinto.demanda_total || 0,
                    consumo_calef: recinto.consumo_calef || 0,
                    consumo_ref: recinto.consumo_ref || 0,
                    consumo_total: recinto.consumo_total || 0,
                    co2_eq: recinto.co2_eq || 0,
                }));
                console.log(updatedData)
                setRecintos(updatedData);
            });
        } else {
            setRecintos([]);
        }
    }, [router.query.id]);

    useEffect(() => {
        if (result.constant) {
            const systems = result.constant.atributs?.consumos_por_fuente_de_energia || [];
            setEnergySystems(systems);
            console.log("Energy Systems:", systems);
        }
    }, [result.constant]);

    useEffect(() => {
        if (recintos.length > 0 && result.constant) {
            const rendimiento_calef = parseFloat(energySystems.find((system: any) => system.code === 'Elect')?.co2_eq) || 0.8;
            const rendimiento_ref = parseFloat(energySystems.find((system: any) => system.code === 'Pet')?.co2_eq) || 0.6;


            const updatedRecintos = recintos.map(recinto => {
                console.log("Procesando recinto:", recinto);

                const demanda_calef = recinto.height * rendimiento_calef;
                const demanda_ref = recinto.height * rendimiento_ref;
                const demanda_ilum = recinto.height * 0.1;
                const demanda_total = demanda_calef + demanda_ref + demanda_ilum;

                const consumo_calef = demanda_calef * 0.5;
                const consumo_ref = demanda_ref * 0.3;
                const consumo_total = consumo_calef + consumo_ref;

                const co2_eq = consumo_total * 0.2;

                console.log(recinto.height)
                console.log("Resultados calculados:", {
                    demanda_calef,
                    demanda_ref,
                    demanda_ilum,
                    demanda_total,
                    consumo_calef,
                    consumo_ref,
                    consumo_total,
                    co2_eq,
                });

                return {
                    ...recinto,
                    demanda_calef,
                    demanda_ref,
                    demanda_ilum,
                    demanda_total,
                    consumo_calef,
                    consumo_ref,
                    consumo_total,
                    co2_eq,
                };
            });

            setCalculatedRecintos(updatedRecintos);
            onRecintosCalculated(updatedRecintos); // Notificar al componente padre
        }
    }, [recintos, result.constant]);

    return (
        <div className="container mt-4">
            <div className="table-responsive">
                <table className="table table-bordered table-hover table-sm align-middle">
                    <thead>
                        <tr>
                            <th rowSpan={3}>Recinto</th>
                            <th rowSpan={3}>Perfil de uso</th>
                            <th rowSpan={3}>Superficie (m²)</th>
                            <th colSpan={4} className="text-center">Demanda (kWh/m²)</th>
                            <th colSpan={15} className="text-center">Consumo (kWh/m²)</th>
                        </tr>
                        <tr>
                            <th>Calef</th>
                            <th>Ref</th>
                            <th>Ilum</th>
                            <th>Total</th>
                            <th colSpan={6} className="text-center">Calefacción</th>
                            <th colSpan={6} className="text-center">Refrigeración</th>
                            <th colSpan={3} className="text-center">Consumo de Energía Primaria</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>Combustible</th>
                            <th>Rendimiento</th>
                            <th>Distribución</th>
                            <th>Control</th>
                            <th>SCOP</th>
                            <th>SCOP de MC</th>
                            <th>Combustible</th>
                            <th>Rendimiento</th>
                            <th>Distribución</th>
                            <th>Control</th>
                            <th>SCOP</th>
                            <th>SCOP de MC</th>
                            <th>Calef.</th>
                            <th>Ref.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calculatedRecintos.map((recinto, index) => (
                            <tr key={index}>
                                <td>{recinto.name_enclosure}</td>
                                <td>{recinto.usage_profile_name}</td>
                                <td>{recinto.height || '0.00'}</td>
                                <td>{recinto.demanda_calef || '0.00'}</td>
                                <td>{recinto.demanda_ref || '0.00'}</td>
                                <td>{recinto.demanda_ilum || '0.00'}</td>
                                <td>{recinto.demanda_total || '0.00'}</td>
                                <td>
                                    <select
                                        value={selectedEnergySystems[recinto.id] || ''}
                                        onChange={(e) => handleEnergySystemChange(recinto.id, e.target.value)}
                                    >
                                        <option value="">Seleccione</option>
                                        {energySystems.map((system: any) => (
                                            <option key={system.code} value={system.code}>
                                                {system.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>{recinto.consumo_calef || '0.00'}</td>
                                <td>{recinto.consumo_ref || '0.00'}</td>
                                <td>{recinto.consumo_total || '0.00'}</td>
                                <td>{recinto.rendimiento_calef || '0.00'}</td>
                                <td>{recinto.distribucion_calef || '0.00'}</td>
                                <td>{recinto.control_calef || '0.00'}</td>
                                <td>{recinto.scop_calef || '0.00'}</td>
                                <td>{recinto.scop_mc_calef || '0.00'}</td>
                                <td>{recinto.rendimiento_ref || '0.00'}</td>
                                <td>{recinto.distribucion_ref || '0.00'}</td>
                                <td>{recinto.control_ref || '0.00'}</td>
                                <td>{recinto.scop_ref || '0.00'}</td>
                                <td>{recinto.scop_mc_ref || '0.00'}</td>
                                <td>{recinto.consumo_energia_primaria_calef || '0.00'}</td>
                                <td>{recinto.consumo_energia_primaria_ref || '0.00'}</td>
                                <td>{recinto.consumo_energia_primaria_total || '0.00'}</td>
                                <td>{recinto.co2_eq || '0.00'}</td>
                            </tr>
                        ))}
                        {calculatedRecintos.length === 0 && (
                            <tr>
                                <td colSpan={22} className="text-center">
                                    No hay recintos para el proyecto seleccionado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResumenRecintos;