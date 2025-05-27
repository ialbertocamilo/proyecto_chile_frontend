import React, { JSX, useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useConstants } from '../../../hooks/useConstantsHook';
import { EnergySystemSelection, EnergySystemSelectorsProps, SystemOption } from '../../../types/energySystem';


export interface ConfigState {
    energySystems: SystemOption[];
    rendimientoCalef: SystemOption[];
    distribucionHvac: SystemOption[];
    controlHvac: SystemOption[];
    consumosEnergia: SystemOption[];
    rendimientoRef: SystemOption[];
}

const EnergySystemSelectors: React.FC<EnergySystemSelectorsProps> = ({
    onChange
}): JSX.Element => {
    const result = useConstants("energy_systems", "general");
    const [config, setConfig] = useState<ConfigState>({
        energySystems: [],
        rendimientoCalef: [],
        distribucionHvac: [],
        controlHvac: [],
        consumosEnergia: [],
        rendimientoRef: []
    });

    const [selection, setSelection] = useState<EnergySystemSelection>({
        combustibleCalef: null,
        rendimiento: null,
        distribucion: null,
        control: null
    });

    useEffect(() => {
        if (result.constant?.atributs) {
            const systems = result.constant.atributs.combustibles || [];
            const validatedSystems = systems.map((system: any) => ({
                code: system.code || '',
                description: system.name || system.descripcion || system.code || '',
                value: typeof system.value === 'number' ? system.value : 1,
                fep: typeof system.fep === 'number' ? system.fep : 1,
                co2_eq: typeof system.co2_eq === 'number' ? system.co2_eq : 0
            })).filter((system: SystemOption) => system.code && system.description);

            const processOptions = (items: any[]): SystemOption[] => {
                return items.map(item => ({
                    code: item.code || '',
                    description: item.name || item.descripcion || item.code || '',
                    value: typeof item.value === 'number' ? item.value : 1,
                    fep: typeof item.fep === 'number' ? item.fep : 1,
                    co2_eq: typeof item.co2_eq === 'number' ? item.co2_eq : 0
                })).filter(item => Boolean(item.code && item.description)) as SystemOption[];
            };

            const rendimientoCalef = processOptions(result.constant.atributs.rendimiento_calef || []);
            const distribucionHvac = processOptions(result.constant.atributs.distribucion_hvac || []);
            const controlHvac = processOptions(result.constant.atributs.control_hvac || []);
            const consumosEnergia = processOptions(result.constant.atributs.consumos_por_fuente_de_energia || []);
            const rendimientoRef = processOptions(result.constant.atributs.rendimiento_ref || []);

            setConfig({
                energySystems: validatedSystems,
                rendimientoCalef,
                distribucionHvac,
                controlHvac,
                consumosEnergia,
                rendimientoRef
            });

            // Seleccionar por defecto el primer valor después de "Seleccionar" si existe
            const defaultSelection: EnergySystemSelection = {
                combustibleCalef: validatedSystems.length > 0 ? validatedSystems[0] : null,
                rendimiento: rendimientoCalef.length > 0 ? rendimientoCalef[0] : null,
                distribucion: distribucionHvac.length > 0 ? distribucionHvac[0] : null,
                control: controlHvac.length > 0 ? controlHvac[0] : null
            };
            setSelection(defaultSelection);
            onChange(defaultSelection, consumosEnergia);
        }
    }, [result.constant]);

    const handleInputChange = (value: string, field: keyof EnergySystemSelection, options: SystemOption[]) => {
        const selectedOption = value ? options.find(opt => opt.code === value) || null : null;
        const newSelection = {
            ...selection,
            [field]: selectedOption
        };
        setSelection(newSelection);
        onChange(newSelection, config.consumosEnergia);
    };

    const renderSystemSelect = (
        label: string,
        field: keyof EnergySystemSelection,
        options: SystemOption[]
    ): JSX.Element => (
        <Form.Group className="mb-3" key={field}>
            <Form.Label>{label}</Form.Label>
            <Form.Select
                value={selection[field]?.code || ''}
                onChange={(e) => handleInputChange(e.target.value, field, options)}
            >
                <option value="">Seleccionar</option>
                {options.map((system) => (
                    <option key={system.code} value={system.code}>
                        {system.description}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );

    if (!config.energySystems.length) {
        return <div>Cargando sistemas energéticos...</div>;
    }

    return (
        <div className="mb-4">
            <Row className="mb-3">
                <Col md={6}>
                    {renderSystemSelect('Combustible', 'combustibleCalef', config.energySystems)}
                    {renderSystemSelect('Rendimiento', 'rendimiento', config.rendimientoCalef)}
                </Col>
                <Col md={6}>
                    {renderSystemSelect('Distribución', 'distribucion', config.distribucionHvac)}
                    {renderSystemSelect('Control', 'control', config.controlHvac)}
                </Col>
            </Row>
            <div className="alert alert-info">
                <strong>Nota:</strong> Los cambios en estos sistemas se aplicarán a todos los recintos.
            </div>
        </div>
    );
};

export default EnergySystemSelectors;
