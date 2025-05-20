import React, { useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Recinto } from '../../../types/recinto';

interface TablaDisconfortProps {
    recintos: Recinto[];
}

/**
 * Component for displaying discomfort hours data
 */
const TablaDisconfort: React.FC<TablaDisconfortProps> = ({ recintos }) => {


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
                    <th className="text-center">Total</th>
                </tr>
            </thead>
            <tbody>
                {recintos.map((recinto, index) => (
                    <tr key={`disconfort-${recinto.id || index}`}>
                        <td>{recinto.name_enclosure || `Recinto ${index + 1}`}</td>
                        <td>{recinto.usage_profile_name || 'N/A'}</td>
                        <td className="text-end">{recinto.superficie?.toFixed(2) || '0.00'}</td>
                        <td className="text-end">{recinto.hrs_disconfort_calef?.toFixed(2) || '0.00'}</td>
                        <td className="text-end">{recinto.hrs_disconfort_ref?.toFixed(2) || '0.00'}</td>
                        <td className="text-end">{recinto.hrs_disconfort_total?.toFixed(2) || '0.00'}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default TablaDisconfort;
