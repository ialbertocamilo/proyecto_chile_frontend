import React from 'react';
import { Table } from 'react-bootstrap';
import { SystemOption } from '../../../types/energySystem';
import { Recinto } from '../../../types/recinto';

interface TablaEmisionesProps {
    recintos: Recinto[];
    combustibleCalef: SystemOption | null;
    consumosEnergia: SystemOption[];
}

/**
 * Component for displaying CO2 emissions data
 */
const TablaEmisiones: React.FC<TablaEmisionesProps> = ({ recintos, combustibleCalef, consumosEnergia }) => {


    const getConsumoEnergia = (code: string): number => {
        return consumosEnergia.find(c => c.code === code)?.co2_eq || 0;
    };

    const calculateCalefEmisiones = (recinto: Recinto): number => {
        const consumoEnergia = getConsumoEnergia(combustibleCalef?.code || '');
        const result = recinto.consumo_calef * consumoEnergia * recinto.superficie;
        return result;
    };

    const calculateRefEmisiones = (recinto: Recinto): number => {
        const consumoEnergia = getConsumoEnergia(combustibleCalef?.code || '');
        const result = recinto.consumo_ref * consumoEnergia * recinto.superficie;

        return result;
    };

    return (
        <Table className="tables-results">
            <thead>
                <tr>
                    <th className="text-center" colSpan={1} rowSpan={3}>
                        Recinto
                    </th>
                    <th className="text-center" colSpan={1} rowSpan={3}>
                        Perfil de uso
                    </th>
                    <th className="text-center" colSpan={1} rowSpan={3}>
                        Superficie (m²)
                    </th>
                    <th className="text-center">Calefacción</th>
                    <th className="text-center">Refrigeración</th>
                    <th className="text-center">Iluminación</th>
                    <th className="text-center">Total</th>
                </tr>
            </thead>
            <tbody>
                {recintos.map((recinto, index) => {
                    const emisionesCalef = calculateCalefEmisiones(recinto);
                    const emisionesRef = calculateRefEmisiones(recinto);
                    const emisionesIlum = recinto.co2_eq_ilum || 0;
                    const emisionesTotal = emisionesCalef + emisionesRef + emisionesIlum;

                    return (
                        <tr key={`emisiones-${recinto.id || index}`}>                        <td>{recinto.name_enclosure || `Recinto ${index + 1}`}</td>
                        <td>{recinto.usage_profile_name || 'N/A'}</td>
                        <td className="text-center">{recinto.superficie?.toFixed(2) || '0.00'}</td>
                        <td className="text-center">{emisionesCalef.toFixed(2)}</td>
                        <td className="text-center">{emisionesRef.toFixed(2)}</td>
                        <td className="text-center">{emisionesIlum.toFixed(2)}</td>
                        <td className="text-center">{emisionesTotal.toFixed(2)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default TablaEmisiones;
