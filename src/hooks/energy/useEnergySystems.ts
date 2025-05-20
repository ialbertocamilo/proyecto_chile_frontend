import { useRecintos } from "@/context/RecintosContext";
import { Recinto } from "@/types/recinto";


import { calculateCO2EmissionsCalef, calculateCO2EmissionsIlum, calculateCO2EmissionsRef, calculatePrimaryEnergyCalef, calculatePrimaryEnergyRef, calculateSCOP, calculateSEER, calculateTotalCO2Emissions, calculateTotalPrimaryEnergy, getValueByCode, processBaseResults, processGlobalResults } from "@/utils/calculations/energyCalculations";
import { useCallback, useEffect, useState } from "react";
import { useConstants } from "../useConstantsHook";

export interface UseEnergySystemsProps {
    globalResults: any;
    onCalculationsUpdate?: (data: any[]) => void;
}

export const useEnergySystems = ({ globalResults, onCalculationsUpdate }: UseEnergySystemsProps) => {
    const result = useConstants("energy_systems", "general");
    const { recintos, setRecintos } = useRecintos();

    const [calculatedRecintos, setCalculatedRecintos] = useState<Recinto[]>([]);
    const [casoBaseRecintos, setCasoBaseRecintos] = useState<Recinto[]>([]);
    const [combustibleCalef, setCombustibleCalef] = useState<any>(null);
    const [consumosEnergia, setConsumosEnergia] = useState<any[]>([]);

    const [selectedEnergySystems, setSelectedEnergySystems] = useState<{ [key: number]: string }>({});
    const [selectedEnergySystemsRef, setSelectedEnergySystemsRef] = useState<{ [key: number]: string }>({});

    const [selectedRendimientoCalef, setSelectedRendimientoCalef] = useState<{ [key: number]: string }>({});
    const [selectedDistribucionHvac, setSelectedDistribucionHvac] = useState<{ [key: number]: string }>({});
    const [selectedControlHvac, setSelectedControlHvac] = useState<{ [key: number]: string }>({});
    const [selectedRendimientoRef, setSelectedRendimientoRef] = useState<{ [key: number]: string }>({});
    const [selectedDistribucionHvacRef, setSelectedDistribucionHvacRef] = useState<{ [key: number]: string }>({});
    const [selectedControlHvacRef, setSelectedControlHvacRef] = useState<{ [key: number]: string }>({});

    const [energySystems, setEnergySystems] = useState<any[]>([]);
    const [rendimientoCalef, setRendimientoCalef] = useState<any[]>([]);
    const [distribucionHvac, setDistribucionHvac] = useState<any[]>([]);
    const [controlHvac, setControlHvac] = useState<any[]>([]);
    const [rendimientoRef, setRendimientoRef] = useState<any[]>([]);

    const [triggeredRecintoId, setTriggeredRecintoId] = useState<number | null>(null);
    const [recalculateAll, setRecalculateAll] = useState<boolean>(false);

    useEffect(() => {
        if (result.constant) {
            const systems = result.constant.atributs?.combustibles || []; const validatedSystems = systems.map((system: any) => {
                if (typeof system.value !== 'number' || isNaN(system.value)) {
                    system.value = 1;
                }
                return system;
            });

            setEnergySystems(validatedSystems);
            setRendimientoCalef(result.constant.atributs?.rendimiento_calef || []);
            setDistribucionHvac(result.constant.atributs?.distribucion_hvac || []);
            setControlHvac(result.constant.atributs?.control_hvac || []);
            setRendimientoRef(result.constant.atributs?.rendimiento_ref || []);

            // Set initial combustible and consumos values
            const defaultCombustible = validatedSystems.find((s:any) => s.is_default);
            setCombustibleCalef(defaultCombustible || validatedSystems[0]);
            setConsumosEnergia(validatedSystems);

            console.log("Energy Systems loaded:", validatedSystems.length);
        }
    }, [result.constant]);

    useEffect(() => {
        if (globalResults?.result_by_enclosure) {
            const updatedRecintos = processGlobalResults(globalResults.result_by_enclosure);
            setCalculatedRecintos(updatedRecintos as any);
            setRecintos(updatedRecintos as any);
        }
    }, [globalResults, setRecintos]);

    useEffect(() => {
        if (globalResults?.base_by_enclosure && energySystems.length > 0) {
            const baseRecintos = processBaseResults(globalResults.base_by_enclosure, energySystems);
            setCasoBaseRecintos(baseRecintos as any);
        }
    }, [globalResults, energySystems]);

    useEffect(() => {
        if (calculatedRecintos.length > 0) {
            setRecintos(calculatedRecintos);
        }
    }, [calculatedRecintos, setRecintos]);

    const handleEnergySystemChange = useCallback((recintoId: number, value: string) => {
        setSelectedEnergySystems((prev) => ({ ...prev, [recintoId]: value }));

        const sistemaSeleccionado = energySystems.find(system => system.code === value);

        if (sistemaSeleccionado && typeof sistemaSeleccionado.value === 'number') {
            setCasoBaseRecintos(prev => prev.map(recinto => {
                if (recinto.id === recintoId) {
                    const valorCombustible = sistemaSeleccionado.fep || 1;
                    const nuevoConsumoCalef = recinto.demanda_calef * valorCombustible;
                    const nuevoConsumoTotal = nuevoConsumoCalef + recinto.consumo_ref;

                    return {
                        ...recinto,
                        combustible_calef_code: value,
                        combustible_calef_value: valorCombustible,
                        consumo_calef: nuevoConsumoCalef,
                        consumo_total: nuevoConsumoTotal
                    };
                }
                return recinto;
            }));
        }

        setTriggeredRecintoId(recintoId);
    }, [energySystems]);

    const handleEnergySystemChangeRef = useCallback((recintoId: number, value: string) => {
        setSelectedEnergySystemsRef((prev) => ({ ...prev, [recintoId]: value }));

        const sistemaSeleccionado = energySystems.find(system => system.code === value);

        if (sistemaSeleccionado) {
            setCasoBaseRecintos(prev => prev.map(recinto => {
                if (recinto.id === recintoId) {
                    const seerRefValue = sistemaSeleccionado.value || 1;
                    const nuevoConsumoRef = seerRefValue > 0 ? recinto.demanda_ref / seerRefValue : 0;
                    const nuevoConsumoTotal = recinto.consumo_calef + nuevoConsumoRef;

                    return {
                        ...recinto,
                        seer_ref: seerRefValue,
                        consumo_ref: nuevoConsumoRef,
                        consumo_total: nuevoConsumoTotal
                    };
                }
                return recinto;
            }));
        }

        setTriggeredRecintoId(recintoId);
    }, [energySystems]);

    const handleRendimientoCalefChange = useCallback((recintoId: number, value: string) => {
        setSelectedRendimientoCalef((prev) => ({ ...prev, [recintoId]: value }));
        setTriggeredRecintoId(recintoId);
    }, []);

    const handleDistribucionHvacChange = useCallback((recintoId: number, value: string) => {
        setSelectedDistribucionHvac((prev) => ({ ...prev, [recintoId]: value }));
        setTriggeredRecintoId(recintoId);
    }, []);

    const handleControlHvacChange = useCallback((recintoId: number, value: string) => {
        setSelectedControlHvac((prev) => ({ ...prev, [recintoId]: value }));
        setTriggeredRecintoId(recintoId);
    }, []);

    const handleRendimientoRef = useCallback((recintoId: number, value: string) => {
        setSelectedRendimientoRef((prev) => ({ ...prev, [recintoId]: value }));
        setTriggeredRecintoId(recintoId);
    }, []);

    const handleDistribucionHvacRefChange = useCallback((recintoId: number, value: string) => {
        setSelectedDistribucionHvacRef((prev) => ({ ...prev, [recintoId]: value }));
        setTriggeredRecintoId(recintoId);
    }, []);

    const handleControlHvacRefChange = useCallback((recintoId: number, value: string) => {
        setSelectedControlHvacRef((prev) => ({ ...prev, [recintoId]: value }));
        setTriggeredRecintoId(recintoId);
    }, []);

    const calculateSCOPForRecinto = useCallback((recintoId: number) => {
        const recinto = calculatedRecintos.find(r => r.id === recintoId);
        if (!recinto) return 0;

        // Get selected values for this recinto
        const rendimientoCode = recinto.rendimiento_calef_code || selectedRendimientoCalef[recintoId];
        const distribucionCode = recinto.distribucion_hvac_code || selectedDistribucionHvac[recintoId];
        const controlCode = recinto.control_hvac_code || selectedControlHvac[recintoId];

        console.log(`SCOP calculation for recinto #${recintoId}:`, {
            rendimiento: rendimientoCode,
            distribucion: distribucionCode,
            control: controlCode
        });

        const co2RendCalef = getValueByCode(
            rendimientoCalef,
            rendimientoCode
        );

        const co2DistCalef = getValueByCode(
            distribucionHvac,
            distribucionCode
        );

        const co2ControlCalef = getValueByCode(
            controlHvac,
            controlCode
        );

        const scopCalefValue = calculateSCOP(co2RendCalef, co2DistCalef, co2ControlCalef);
        console.log(`SCOP value for recinto #${recintoId}:`, scopCalefValue);

        setCalculatedRecintos((prev) =>
            prev.map((recinto) =>
                recinto.id === recintoId
                    ? {
                        ...recinto,
                        rendimiento_calef_code: rendimientoCode,
                        distribucion_hvac_code: distribucionCode,
                        control_hvac_code: controlCode,
                        scop_calef: scopCalefValue
                    }
                    : recinto
            )
        );

        return scopCalefValue;
    }, [rendimientoCalef, distribucionHvac, controlHvac, selectedRendimientoCalef, selectedDistribucionHvac, selectedControlHvac, calculatedRecintos]);

    const calculateSEERForRecinto = useCallback((recintoId: number) => {
        const recinto = calculatedRecintos.find(r => r.id === recintoId);
        if (!recinto) return 0;

        // Get selected values for this recinto
        const rendimientoCode = recinto.rendimiento_ref_code || selectedRendimientoRef[recintoId];
        const distribucionCode = recinto.distribucion_hvac_ref_code || selectedDistribucionHvacRef[recintoId];
        const controlCode = recinto.control_hvac_ref_code || selectedControlHvacRef[recintoId];

        console.log(`SEER calculation for recinto #${recintoId}:`, {
            rendimiento: rendimientoCode,
            distribucion: distribucionCode,
            control: controlCode
        });

        const co2RendRef = getValueByCode(
            rendimientoRef,
            rendimientoCode
        );

        const co2DistRef = getValueByCode(
            distribucionHvac,
            distribucionCode
        );

        const co2ControlRef = getValueByCode(
            controlHvac,
            controlCode
        );

        const seerValue = calculateSEER(co2RendRef, co2DistRef, co2ControlRef);
        console.log(`SEER value for recinto #${recintoId}:`, seerValue);

        setCalculatedRecintos((prev) =>
            prev.map((r) =>
                r.id === recintoId
                    ? {
                        ...r,
                        rendimiento_ref_code: rendimientoCode,
                        distribucion_hvac_ref_code: distribucionCode,
                        control_hvac_ref_code: controlCode,
                        seer_ref: seerValue
                    }
                    : r
            )
        );

        return seerValue;
    }, [rendimientoRef, distribucionHvac, controlHvac, selectedRendimientoRef, selectedDistribucionHvacRef, selectedControlHvacRef, calculatedRecintos]);

    const calculatePrimaryEnergyCalefForRecinto = useCallback((recintoId: number) => {
        const recinto = calculatedRecintos.find((r) => r.id === recintoId);
        if (!recinto) return;

        const demandaCalef = recinto.demanda_calef || 0;
        const scopCalef = recinto.scop_calef || 1;

        // Get the energy system factor if available
        let energyFactor = 1;
        if (recinto.combustible_calef_code) {
            const system = energySystems.find(s => s.code === recinto.combustible_calef_code);
            if (system && system.value) {
                energyFactor = system.value;
                console.log(`Using energy factor ${energyFactor} for system ${recinto.combustible_calef_code}`);
            }
        }

        console.log(`Primary energy calculation for recinto #${recintoId}:`, {
            demandaCalef,
            scopCalef,
            energyFactor,
            combustibleCode: recinto.combustible_calef_code
        });

        // Apply energy factor to the result of primary energy calculation
        const basePrimaryEnergy = calculatePrimaryEnergyCalef(demandaCalef, scopCalef);
        const consumoEnergiaPrimariaCalef = basePrimaryEnergy * energyFactor;

        console.log(`Primary energy calef for recinto #${recintoId}:`, {
            basePrimaryEnergy,
            withFactor: consumoEnergiaPrimariaCalef
        });

        setCalculatedRecintos((prev) =>
            prev.map((r) =>
                r.id === recintoId
                    ? {
                        ...r,
                        consumo_energia_primaria_calef: consumoEnergiaPrimariaCalef
                    }
                    : r
            )
        );

        return consumoEnergiaPrimariaCalef;
    }, [calculatedRecintos, energySystems]);

    const calculatePrimaryEnergyRefForRecinto = useCallback((recintoId: number) => {
        const recinto = calculatedRecintos.find((r) => r.id === recintoId);
        if (!recinto) return;

        const demandaRef = recinto.demanda_ref || 0;
        const seerRef = recinto.seer_ref || 1;

        // Get the energy system factor if available
        let energyFactor = 1;
        if (recinto.combustible_ref_code) {
            const system = energySystems.find(s => s.code === recinto.combustible_ref_code);
            if (system && system.value) {
                energyFactor = system.value;
                console.log(`Using ref energy factor ${energyFactor} for system ${recinto.combustible_ref_code}`);
            }
        }

        console.log(`Primary energy ref calculation for recinto #${recintoId}:`, {
            demandaRef,
            seerRef,
            energyFactor,
            combustibleCode: recinto.combustible_ref_code
        });

        // Apply energy factor to the result of primary energy calculation
        const basePrimaryEnergy = calculatePrimaryEnergyRef(demandaRef, seerRef);
        const consumoEnergiaPrimariaRef = basePrimaryEnergy * energyFactor;

        console.log(`Primary energy ref for recinto #${recintoId}:`, {
            basePrimaryEnergy,
            withFactor: consumoEnergiaPrimariaRef
        });

        setCalculatedRecintos((prev) =>
            prev.map((r) =>
                r.id === recintoId
                    ? {
                        ...r,
                        consumo_energia_primaria_ref: consumoEnergiaPrimariaRef
                    }
                    : r
            )
        );

        return consumoEnergiaPrimariaRef;
    }, [calculatedRecintos, energySystems]);

    const calculateTotalPrimaryEnergyForRecinto = useCallback((recintoId: number) => {
        const recinto = calculatedRecintos.find((r) => r.id === recintoId);
        if (!recinto) return;

        const consumoCalef = recinto.consumo_energia_primaria_calef || 0;
        const consumoRef = recinto.consumo_energia_primaria_ref || 0;
        const demandaIlum = recinto.demanda_ilum || 0;

        console.log(`Calculating total primary energy for recinto #${recintoId}:`, {
            consumoCalef,
            consumoRef,
            demandaIlum
        });

        const consumoTotal = calculateTotalPrimaryEnergy(consumoCalef, consumoRef, demandaIlum);
        console.log(`Total primary energy for recinto #${recintoId}:`, consumoTotal);

        setCalculatedRecintos((prev) =>
            prev.map((r) =>
                r.id === recintoId
                    ? { ...r, consumo_energia_primaria_total: consumoTotal }
                    : r
            )
        );

        return consumoTotal;
    }, [calculatedRecintos]); const calculateCO2EmissionsForRecinto = useCallback((recintoId: number) => {
        const recinto = calculatedRecintos.find((r) => r.id === recintoId);
        if (!recinto) return;

        const co2FactorCalef = selectedEnergySystems[recintoId]
            ? energySystems.find(system => system.code === selectedEnergySystems[recintoId])?.co2_eq || 0
            : 0;

        console.log('Calculating CO2 emissions for recinto:', { recintoId, co2FactorCalef });

        const co2FactorRef = selectedEnergySystemsRef[recintoId]
            ? energySystems.find(system => system.code === selectedEnergySystemsRef[recintoId])?.co2_eq || 0
            : 0;

        const co2FactorIlum = 0;

        const superficie = recinto.superficie || 0;
        const co2EqCalef = calculateCO2EmissionsCalef(
            recinto.consumo_energia_primaria_calef || 0,
            co2FactorCalef,
            superficie
        );

        const co2EqRef = calculateCO2EmissionsRef(
            recinto.consumo_energia_primaria_ref || 0,
            co2FactorRef,
            superficie
        );

        const co2EqIlum = calculateCO2EmissionsIlum(
            recinto.demanda_ilum || 0,
            co2FactorIlum,
            superficie
        );

        const co2EqTotal = calculateTotalCO2Emissions(co2EqCalef, co2EqRef, co2EqIlum);

        setCalculatedRecintos(prev =>
            prev.map(r =>
                r.id === recintoId
                    ? {
                        ...r,
                        co2_eq_calef: co2EqCalef,
                        co2_eq_ref: co2EqRef,
                        co2_eq_ilum: co2EqIlum,
                        co2_eq_total: co2EqTotal
                    }
                    : r
            )
        );

        return { co2EqCalef, co2EqRef, co2EqIlum, co2EqTotal };
    }, [calculatedRecintos, energySystems, selectedEnergySystems, selectedEnergySystemsRef]);    // Recalculate all recintos with the latest settings
    const recalculateAllRecintos = useCallback(() => {
        if (calculatedRecintos.length === 0) return;

        console.log('Starting recalculation for all recintos:', calculatedRecintos.length);
        setRecalculateAll(true);

        // Asegurarnos de que el contexto tenga los datos más recientes
        setRecintos(calculatedRecintos);

        const recalculatePromises = calculatedRecintos.map(recinto => {
            return new Promise<void>((resolve) => {
                console.log(`Recalculating recinto #${recinto.id}:`, recinto.name_enclosure);
                // Calculate SCOP and SEER first
                const scopValue = calculateSCOPForRecinto(recinto.id);
                const seerValue = calculateSEERForRecinto(recinto.id);

                console.log(`Recinto #${recinto.id} - SCOP: ${scopValue}, SEER: ${seerValue}`);

                // Then calculate energy consumption based on those values
                setTimeout(() => {
                    const primaryCalef = calculatePrimaryEnergyCalefForRecinto(recinto.id);
                    const primaryRef = calculatePrimaryEnergyRefForRecinto(recinto.id);

                    console.log(`Recinto #${recinto.id} - Primary Energy: Calef=${primaryCalef}, Ref=${primaryRef}`);

                    // Calculate total consumption
                    setTimeout(() => {
                        const totalEnergy = calculateTotalPrimaryEnergyForRecinto(recinto.id);
                        console.log(`Recinto #${recinto.id} - Total Energy: ${totalEnergy}`);

                        // Finally calculate CO2 emissions
                        setTimeout(() => {
                            const emissions = calculateCO2EmissionsForRecinto(recinto.id);
                            console.log(`Recinto #${recinto.id} - CO2 Emissions:`, emissions);
                            resolve();
                        }, 0);
                    }, 0);

                    setTimeout(() => {
                        const demandaCalef = recinto.demanda_calef || 0;
                        const demandaRef = recinto.demanda_ref || 0;
                        const demandaIlum = recinto.demanda_ilum || 0;

                        // Cálculos de consumo base usando las fórmulas correctas
                        const baseConsumoCalef = calculateConsumoCalef(demandaCalef);
                        const baseConsumoRef = calculateConsumoRef(demandaRef);
                        const baseConsumoTotal = baseConsumoCalef + baseConsumoRef;

                        // Calculate CO2eq total
                        const co2eqTotal = calculateCO2eqTotal(recinto, baseConsumoCalef, baseConsumoRef, demandaIlum);

                        Object.assign(recinto, {
                            base_demanda_calef: demandaCalef,
                            base_demanda_ref: demandaRef,
                            base_demanda_ilum: demandaIlum,
                            base_demanda_total: demandaCalef + demandaRef,
                            base_consumo_calef: baseConsumoCalef,
                            base_consumo_ref: baseConsumoRef,
                            base_consumo_total: baseConsumoTotal,
                            base_co2eq_total: co2eqTotal
                        });

                        // Continue with energy calculations
                        calculatePrimaryEnergyCalefForRecinto(recinto.id);
                        calculatePrimaryEnergyRefForRecinto(recinto.id);

                        setTimeout(() => {
                            calculateTotalPrimaryEnergyForRecinto(recinto.id);
                            calculateCO2EmissionsForRecinto(recinto.id);
                            resolve();
                        }, 0);
                    }, 0);
                }, 0);
            });
        }); Promise.all(recalculatePromises).then(() => {
            setRecalculateAll(false);
            console.log("All recintos recalculated successfully");
            // Update both local state and context
            const updatedRecintos = [...calculatedRecintos];
            setCalculatedRecintos(updatedRecintos);
            setRecintos(updatedRecintos);
        });
    }, [
        calculatedRecintos,
        calculateSCOPForRecinto,
        calculateSEERForRecinto,
        calculatePrimaryEnergyCalefForRecinto,
        calculatePrimaryEnergyRefForRecinto,
        calculateTotalPrimaryEnergyForRecinto,
        calculateCO2EmissionsForRecinto
    ]);

    useEffect(() => {
        if (triggeredRecintoId !== null) {
            calculateSCOPForRecinto(triggeredRecintoId);
            calculateSEERForRecinto(triggeredRecintoId);

            setTimeout(() => {
                calculatePrimaryEnergyCalefForRecinto(triggeredRecintoId);
                calculatePrimaryEnergyRefForRecinto(triggeredRecintoId);

                setTimeout(() => {
                    calculateTotalPrimaryEnergyForRecinto(triggeredRecintoId);

                    setTimeout(() => {
                        calculateCO2EmissionsForRecinto(triggeredRecintoId);
                        setTriggeredRecintoId(null);
                    }, 0);
                }, 0);
            }, 0);
        }
    }, [
        triggeredRecintoId,
        calculateSCOPForRecinto,
        calculateSEERForRecinto,
        calculatePrimaryEnergyCalefForRecinto,
        calculatePrimaryEnergyRefForRecinto,
        calculateTotalPrimaryEnergyForRecinto,
        calculateCO2EmissionsForRecinto
    ]);

    const getCalculationSummary = useCallback(() => {
        // Simply return the calculatedRecintos array directly since it already contains
        // all the necessary information in the correct Recinto format
        return calculatedRecintos;
    }, [calculatedRecintos]);

    useEffect(() => {
        if (calculatedRecintos.length > 0 && onCalculationsUpdate) {
            const summaryData = getCalculationSummary();
            onCalculationsUpdate(summaryData);
        }
    }, [
        calculatedRecintos,
        getCalculationSummary,
        onCalculationsUpdate
    ]);

    const calculateConsumoCalef = (demandaCalef: number | undefined): number => {
        if (!demandaCalef || !combustibleCalef || typeof combustibleCalef.fep !== 'number') {
            return 0;
        }
        const result = (demandaCalef * combustibleCalef.fep) / 1;
        return result;
    };

    const calculateConsumoRef = (demandaRef: number | undefined): number => {
        if (!demandaRef || !combustibleCalef || typeof combustibleCalef.fep !== 'number') {
            return 0;
        }
        const result = (demandaRef * combustibleCalef.fep) / 1;
        return result;
    };

    const getConsumoEnergia = (code: string): number => {
        return consumosEnergia?.find(c => c.code === code)?.co2_eq || 0;
    };

    const calculateCO2eqTotal = (
        recinto: Recinto,
        consumoCalef: number,
        consumoRef: number,
        demandaIlum: number = 31.3 // TODO: Verify if this fixed value for illumination is correct for all cases
    ): number => {
        const fep = combustibleCalef?.fep || 1;
        const consumoElectricidad = getConsumoEnergia(combustibleCalef?.code || '');
        return (consumoCalef * fep * recinto.superficie) +
            (consumoRef * fep * recinto.superficie) +
            (demandaIlum * recinto.superficie * consumoElectricidad * fep);
    };

    return {
        calculatedRecintos,
        casoBaseRecintos,
        setCalculatedRecintos,
        energySystems,
        rendimientoCalef,
        distribucionHvac,
        controlHvac,
        rendimientoRef,
        selectedEnergySystems,
        selectedEnergySystemsRef,
        selectedRendimientoCalef,
        selectedDistribucionHvac,
        selectedControlHvac,
        selectedRendimientoRef,
        selectedDistribucionHvacRef,
        selectedControlHvacRef,
        handleEnergySystemChange,
        handleEnergySystemChangeRef,
        handleRendimientoCalefChange,
        handleDistribucionHvacChange,
        handleControlHvacChange,
        handleRendimientoRef,
        handleDistribucionHvacRefChange,
        handleControlHvacRefChange,
        getCalculationSummary,
        recalculateAllRecintos,
        isRecalculating: recalculateAll,
        calculateConsumoCalef,
        calculateConsumoRef,
        getConsumoEnergia,
        calculateCO2eqTotal
    };
};
