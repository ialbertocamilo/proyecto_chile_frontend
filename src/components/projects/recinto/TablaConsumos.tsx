import React from 'react';
import { Table } from 'react-bootstrap';
import { SystemOption } from '../../../types/energySystem';
import { Recinto } from '../../../types/recinto';

interface TablaConsumosProps {
    combustibleCalef: any;
    config: {
        recintos: Recinto[];
        energySystems: SystemOption[];
        rendimientoCalef: any[];
        distribucionHvac: any[];
        controlHvac: any[];
        rendimientoRef: any[];
        selectedEnergySystems: any;
        selectedEnergySystemsRef: any;
        selectedRendimientoCalef: any;
        selectedDistribucionHvac: any;
        selectedControlHvac: any;
        selectedRendimientoRef: any;
        selectedDistribucionHvacRef: any;
        selectedControlHvacRef: any;
        onEnergySystemChange: (recintoId: number, value: string) => void;
        onEnergySystemRefChange: (recintoId: number, value: string) => void;
        onRendimientoCalefChange: (recintoId: number, value: string) => void;
        onDistribucionHvacChange: (recintoId: number, value: string) => void;
        onControlHvacChange: (recintoId: number, value: string) => void;
        onRendimientoRefChange: (recintoId: number, value: string) => void;
        onDistribucionHvacRefChange: (recintoId: number, value: string) => void;
        onControlHvacRefChange: (recintoId: number, value: string) => void;
    }
}

/**
 * Component for displaying consumption data
 */
const TablaConsumos: React.FC<TablaConsumosProps> = ({ config, combustibleCalef }) => {
    const { recintos } = config;

    const calculateCalefConsumo = (recinto: Recinto): number => {
        const result = recinto.demanda_calef * combustibleCalef?.fep;
        if (isNaN(result))
            return 0
        recinto.consumo_calef = result;
        return result;
    };

    const calculateRefConsumo = (recinto: Recinto): number => {

        const result = (recinto.demanda_ref / 2.95) * combustibleCalef?.fep;
        if (isNaN(result))
            return 0
        recinto.consumo_ref = result;
        return result
    };



    return (
        <div>
            <Table className="tables-results">
                <thead>
                    <tr>
                        <th className="text-center" rowSpan={2}>Recinto</th>
                        <th className="text-center" rowSpan={2}>Perfil de Uso</th>
                        <th className="text-center" rowSpan={2}>Superficie (m²)</th>
                        <th className="text-center">Calefacción</th>
                        <th className="text-center">Refrigeración</th>
                        <th className="text-center">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {recintos.map((recinto, index) => {
                        const consumoCalef = calculateCalefConsumo(recinto);
                        const consumoRef = calculateRefConsumo(recinto);
                        const consumoTotal = consumoCalef + consumoRef;

                        recinto.consumo_calef = consumoCalef;
                        recinto.consumo_ref = consumoRef;
                        recinto.consumo_total = consumoTotal;
                        return (
                            <tr key={`consumo-${recinto.id || index}`}>                                <td>{recinto.name_enclosure || `Recinto ${index + 1}`}</td>
                                <td>{recinto.usage_profile_name || 'No definido'}</td>
                                <td className="text-center">{recinto.superficie?.toFixed(2) || '0.00'}</td>
                                <td className="text-center">{consumoCalef.toFixed(2)}</td>
                                <td className="text-center">{consumoRef.toFixed(2)}</td>
                                <td className="text-center">{consumoTotal.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
};

export default TablaConsumos;
