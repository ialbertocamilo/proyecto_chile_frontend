import React from 'react';
import { Table } from 'react-bootstrap';
import { Recinto } from '../../../types/recinto';

interface TablaDemandasProps {
    recintos: Recinto[];
}

/**
 * Component for displaying demand data
 */
const TablaDemandas: React.FC<TablaDemandasProps> = ({ recintos }) => {

    return (
        <Table className="tables-results">
            <thead>
                <tr>
                    <th className="text-center" rowSpan={2}>Recinto</th>
                    <th className="text-center" rowSpan={2}>Perfil de Uso</th>
                    <th className="text-center" rowSpan={2}>Superficie (m²)</th>
                    <th className="text-center">Calefacción</th>
                    <th className="text-center">Refrigeración</th>
                    <th className="text-center">Iluminación</th>
                    <th className="text-center">Total</th>
                </tr>
            </thead>
            <tbody>                
                {recintos.map((recinto, index) => (
                <tr key={`demanda-${recinto.id || index}`}>
                    <td>{recinto.name_enclosure || `Recinto ${index + 1}`}</td>
                    <td>{recinto.usage_profile_name || 'No definido'}</td>
                    <td className="text-center">{recinto.superficie?.toFixed(2) || '0.00'}</td>
                    <td className="text-center">{recinto.demanda_calef?.toFixed(2) || '0.00'}</td>
                    <td className="text-center">{recinto.demanda_ref?.toFixed(2) || '0.00'}</td>
                    <td className="text-center">{recinto.demanda_ilum?.toFixed(2) || '0.00'}</td>
                    <td className="text-center">{recinto.demanda_total?.toFixed(2) || '0.00'}</td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
};

export default TablaDemandas;
