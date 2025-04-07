import { useApi } from '@/hooks/useApi';
import { useConstants } from '@/hooks/useConstantsHook';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';

const ResumenRecintos = () => {

    const api = useApi();
    const router = useRouter();
    const { result: energySystems } = useConstants("energy_systems", "general");

    interface Recinto {
        id: number;
        name_enclosure: string;
        usage_profile_name: string;
        height: number;
        region_id: number;
        zona_termica: string;
        comuna_id: number;
        occupation_profile_id: number;
        co2_sensor: string;
        project_id: number;
        is_deleted: boolean;
        nombre_comuna: string;
        nombre_region: string;
        superficie: number; // New field
        demanda_calef: number; // New field
        demanda_ref: number; // New field
        demanda_ilum: number; // New field
        demanda_total: number; // New field
        consumo_calef: number; // New field
        consumo_ref: number; // New field
        consumo_total: number; // New field
        co2_eq: number; // New field
        hrs_disconfort: number; // New field
    }

    const [recintos, setRecintos] = useState<Recinto[]>([])

    useEffect(() => {
        if (router.query.id)
            api.get(`/enclosure-generals/${router.query.id}`).then(data => {
                console.log(data)
                setRecintos(data)
            })
    }, [router.query.id])

    const calculateValues = (recinto: Recinto) => {
        const rendimiento_calef = energySystems?.rendimiento_calef?.[0]?.value || 0;
        const rendimiento_ref = energySystems?.rendimiento_ref?.[0]?.value || 0;
        const consumo_calef_factor = energySystems?.consumos_por_fuente_de_energia?.find(f => f.code === "Elect")?.co2_eq || 0;
        const consumo_ref_factor = energySystems?.consumos_por_fuente_de_energia?.find(f => f.code === "Pet")?.co2_eq || 0;

        const demanda_calef = recinto.superficie * rendimiento_calef;
        const demanda_ref = recinto.superficie * rendimiento_ref;
        const demanda_ilum = recinto.superficie * 0.1; // Example calculation
        const demanda_total = demanda_calef + demanda_ref + demanda_ilum;

        const consumo_calef = demanda_calef * consumo_calef_factor;
        const consumo_ref = demanda_ref * consumo_ref_factor;
        const consumo_total = consumo_calef + consumo_ref;

        const co2_eq = consumo_total * (energySystems?.consumos_por_fuente_de_energia?.find(f => f.code === "Elect")?.co2_eq || 0.5);
        const hrs_disconfort = recinto.superficie * 0.05; // Example calculation

        return {
            demanda_calef: isNaN(demanda_calef) ? 0 : demanda_calef,
            demanda_ref: isNaN(demanda_ref) ? 0 : demanda_ref,
            demanda_ilum: isNaN(demanda_ilum) ? 0 : demanda_ilum,
            demanda_total: isNaN(demanda_total) ? 0 : demanda_total,
            consumo_calef: isNaN(consumo_calef) ? 0 : consumo_calef,
            consumo_ref: isNaN(consumo_ref) ? 0 : consumo_ref,
            consumo_total: isNaN(consumo_total) ? 0 : consumo_total,
            co2_eq: isNaN(co2_eq) ? 0 : co2_eq,
            hrs_disconfort: isNaN(hrs_disconfort) ? 0 : hrs_disconfort
        };
    };

    return (
        <Row>
            <Col md={12}>
                <Card className="shadow">
                    <Card.Body>
                        <Card.Title className="text-center text-dark">Resumen de Recintos</Card.Title>
                        <Table bordered responsive className="table-sm">
                            <thead className="table-light">
                                <tr>
                                    <th>Recinto</th>
                                    <th>Perfil de Ocupación</th>
                                    <th>Superficie [m²]</th>
                                    <th>Demanda Calef [kWh/m²]</th>
                                    <th>Demanda Ref [kWh/m²]</th>
                                    <th>Demanda Ilum [kWh/m²]</th>
                                    <th>Demanda Total [kWh/m²]</th>
                                    <th>Consumo Calef [kWh/m²]</th>
                                    <th>Consumo Ref [kWh/m²]</th>
                                    <th>Consumo Total [kWh/m²]</th>
                                    <th>CO2_eq [kg]</th>
                                    <th>Hrs Disconfort</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recintos.map((recinto: Recinto, index: number) => {
                                    const calculated = calculateValues(recinto);
                                    return (
                                        <tr key={index}>
                                            <td>{recinto.name_enclosure}</td>
                                            <td>{recinto.usage_profile_name}</td>
                                            <td>{recinto.height}</td>
                                            <td>{calculated.demanda_calef}</td>
                                            <td>{calculated.demanda_ref}</td>
                                            <td>{calculated.demanda_ilum}</td>
                                            <td>{calculated.demanda_total}</td>
                                            <td>{calculated.consumo_calef}</td>
                                            <td>{calculated.consumo_ref}</td>
                                            <td>{calculated.consumo_total}</td>
                                            <td>{calculated.co2_eq}</td>
                                            <td>{calculated.hrs_disconfort}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ResumenRecintos;
