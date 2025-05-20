export interface Recinto {
    id: number;
    name_enclosure: string;
    usage_profile_name: string;
    superficie: number;

    // Demands
    demanda_calef: number;
    demanda_ref: number;
    demanda_ilum: number;
    demanda_total: number;

    // Consumption
    consumo_calef: number;
    consumo_ref: number;
    consumo_total: number;

    // CO2 emissions
    co2_eq: number;
    co2_eq_calef: number;
    co2_eq_ref: number;
    co2_eq_ilum: number;
    co2_eq_total: number;

    // Primary energy consumption
    consumo_energia_primaria_calef: number;
    consumo_energia_primaria_ref: number;
    consumo_energia_primaria_total: number;

    // Efficiency
    scop_calef: number;
    seer_ref: number;

    // Discomfort hours
    hrs_disconfort_calef: number;
    hrs_disconfort_ref: number;
    hrs_disconfort_total: number;

    // Systems configuration
    combustible_calef_code: string;
    combustible_calef_value: number;
    combustible_calef_fep: number;

    combustible_ref_code: string;
    combustible_ref_value: number;
    combustible_ref_fep: number;
    rendimiento_calef_code: string;
    distribucion_hvac_code: string;
    control_hvac_code: string;
    rendimiento_ref_code: string;
    distribucion_hvac_ref_code: string;
    control_hvac_ref_code: string;


    base_consumo_calef: number;
    base_consumo_ref: number;
    base_consumo_total: number;
    base_co2eq_total: number;

    base_demanda_calef: number;
    base_demanda_ref: number;
    base_demanda_ilum: number;
    base_demanda_total: number;
}
