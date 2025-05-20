import { useRecintos } from "@/context/RecintosContext";
import { Cloud, Droplet, Flame, Snowflake } from "lucide-react";
import { useEffect, useMemo } from "react";

type Recinto = {
  superficie?: number;
  demanda_calef?: number;
  demanda_ref?: number;
  demanda_ilum?: number;
  base_consumo_calef?: number;
  base_consumo_ref?: number;
  base_consumo_ilum?: number;
  consumo_calef?: number;
  consumo_ref?: number;
  consumo_ilum?: number;
  hrs_disconfort_total?: number;
  co2_eq_total?: number;
  base_co2eq_total?: number;
  co2_eq_energia_primaria?: number;  // Nueva propiedad para CO2_eq de energía primaria
}

interface Calculo {
  kwh_m2_ano: number;
  kwh_ano: number;
  vsCasoBase: string | number;
  totalDemandaBase?: number;
  totalConsumoBase?: number;
}

interface Calculos {
  calefaccion: Calculo;
  refrigeracion: Calculo;
  iluminacion: Calculo;
  consumo: {
    calefaccion: Calculo;
    refrigeracion: Calculo;
    iluminacion: Calculo;
  };
  horasDisconfort: {
    total: number;
    comparacionBase: string;
  };
  co2: {
    total: number;
    comparacionBase: string;
  };
}

const defaultCalculo: Calculo = {
  kwh_m2_ano: 0,
  kwh_ano: 0,
  vsCasoBase: "0%",
  totalDemandaBase: 0,
  totalConsumoBase: 0
};

const defaultCalculos: Calculos = {
  calefaccion: defaultCalculo,
  refrigeracion: defaultCalculo,
  iluminacion: defaultCalculo,
  consumo: {
    calefaccion: defaultCalculo,
    refrigeracion: defaultCalculo,
    iluminacion: defaultCalculo,
  },
  horasDisconfort: {
    total: 0,
    comparacionBase: "0%"
  },
  co2: {
    total: 0,
    comparacionBase: "0%"
  }
};

// Interfaces y tipos
type TipoDemanda = 'calef' | 'ref' | 'ilum';



// Mapeo de propiedades para cada tipo de demanda
const PROP_TYPES_MAP = {
  calef: {
    actual: 'demanda_calef',
    base: 'base_consumo_calef',
    label: 'Calefacción',
    consumo: 'consumo_calef',         // Valor actual de consumo
    consumo_base: 'base_consumo_calef' // Valor base de consumo
  },
  ref: {
    actual: 'demanda_ref',
    base: 'base_consumo_ref',
    label: 'Refrigeración',
    consumo: 'consumo_ref',           // Valor actual de consumo
    consumo_base: 'base_consumo_ref'  // Valor base de consumo
  },
  ilum: {
    actual: 'demanda_ilum',
    base: 'base_consumo_ilum',
    label: 'Iluminación',
    consumo: 'consumo_ilum',          // Valor actual de consumo
    consumo_base: 'base_consumo_ilum' // Valor base de consumo
  }
} as const;

// Utility functions
const safeNumber = (value: any): number => Number(value) || 0;

const calculatePercentageReduction = (actual: number, base: number): string => {
  if (base === 0) return "0%";
  return `${((1 - (actual / base)) * 100).toFixed(1)}%`;
};

const sumProperty = (recintos: Recinto[], property: keyof Recinto): number => {
  return recintos.reduce((acc, recinto) => acc + safeNumber(recinto[property]), 0);
};

const calcularDemanda = (recintos: Recinto[], tipo: TipoDemanda, sumaSuperficieTotal: number) => {
  const { actual, base } = PROP_TYPES_MAP[tipo];

  // Función para calcular la demanda total (normal o base)
  const calcularTotalDemanda = (usarBase: boolean): number => {
    const propiedad = usarBase ? base : actual;
    return recintos.reduce((total, recinto) => {
      const superficie = safeNumber(recinto.superficie);
      const valor = safeNumber(recinto[propiedad as keyof Recinto] as any) || 0;
      return total + (valor * superficie);
    }, 0);
  };

  // Calcular totales
  const totalDemanda = calcularTotalDemanda(false);
  const totalDemandaBase = calcularTotalDemanda(true);

  // Calcular métricas finales
  const demandaPorM2 = sumaSuperficieTotal > 0 ? totalDemanda / sumaSuperficieTotal : 0;
  const vsCasoBase = totalDemandaBase !== 0
    ? `${((1 - (totalDemanda / totalDemandaBase)) * 100).toFixed(1)}%`
    : "0%";

  return {
    kwh_m2_ano: demandaPorM2,
    kwh_ano: totalDemanda,
    vsCasoBase,
    totalDemandaBase
  };
};

const calcularConsumoEnergiaPrimaria = (recintos: Recinto[], tipo: TipoDemanda, sumaSuperficieTotal: number) => {
  const { consumo_base } = PROP_TYPES_MAP[tipo];

  const calcularTotalConsumoBase = (): number => {
    return recintos.reduce((total, recinto) => {
      const superficie = safeNumber(recinto.superficie);
      const valor = safeNumber(recinto[consumo_base as keyof Recinto]);
      return total + (valor * superficie);
    }, 0);
  };

  const totalConsumoBase = calcularTotalConsumoBase();
  const consumoPorM2 = sumaSuperficieTotal > 0 ? totalConsumoBase / sumaSuperficieTotal : 0;

  const totalConsumo = recintos.reduce((total, recinto) => {
    const superficie = safeNumber(recinto.superficie);
    const valor = safeNumber(recinto[consumo_base as keyof Recinto]);
    return total + (valor * superficie);
  }, 0);

  console.log("totalConsumoBase", totalConsumoBase);
  console.log("totalConsumo", totalConsumo);
  return {
    kwh_m2_ano: consumoPorM2,
    kwh_ano: totalConsumo,
    vsCasoBase: 1 - totalConsumoBase / totalConsumo,
    totalConsumoBase: totalConsumoBase
  };
};

const calcularHorasDisconfort = (recintos: Recinto[]): { total: number; comparacionBase: string } => {
  // Valor simulado entre 1 y 5
  const total = 3.5;
  // Simulamos un valor base mayor para mostrar reducción
  const valorBase = 4.2;
  
  // Calculamos el porcentaje de reducción: 1 - (actual/base)
  const comparacionBase = valorBase > 0
    ? `${((1 - (total / valorBase)) * 100).toFixed(1)}%`
    : "0%";

  return {
    total,
    comparacionBase
  };
};

const CO2_ENERGIA_PRIMARIA_DEFAULT = 2500; // valor por defecto en kg CO2eq/año

const calcularCO2eq = (recintos: Recinto[]) => {
  // Sumatoria de CO2_eq_total de todos los recintos
  const totalCO2 = sumProperty(recintos, 'co2_eq_total');

  // Sumatoria de CO2_eq de caso base (base_co2eq_total)
  const totalCO2Base = sumProperty(recintos, 'base_co2eq_total');

  // Total actual con energía primaria
  const totalConEnergiaPrimaria = totalCO2 + CO2_ENERGIA_PRIMARIA_DEFAULT;
  console.log("totalConEnergiaPrimaria", totalConEnergiaPrimaria);

  // Total base con energía primaria
  const totalBaseConEnergiaPrimaria = totalCO2Base + CO2_ENERGIA_PRIMARIA_DEFAULT;
  console.log("totalBaseConEnergiaPrimaria", totalCO2Base);

  // Cálculo de la comparación: 1 - (total actual / total base)
  const comparacionBase = totalBaseConEnergiaPrimaria > 0
    ? `${((1 - (totalConEnergiaPrimaria / totalBaseConEnergiaPrimaria))).toFixed(1)}%`
    : "0%";

  return {
    total: totalConEnergiaPrimaria,
    comparacionBase
  };
};

export default function IndicadoresFinales() {
  const { recintos } = useRecintos();

  useEffect(() => {
    // Aquí puedes agregar lógica para manejar cambios en los recintos
    console.log("Recintos actualizados:", recintos);
  }, [recintos]);

  const calculos = useMemo(() => {
    if (!Array.isArray(recintos) || recintos.length === 0) {
      return defaultCalculos;
    }

    try {
      const sumaSuperficieTotal = recintos.reduce((acc, recinto) =>
        acc + safeNumber(recinto?.superficie), 0);

      // Calcular resultados finales
      const resultado = {
        calefaccion: calcularDemanda(recintos, 'calef', sumaSuperficieTotal),
        refrigeracion: calcularDemanda(recintos, 'ref', sumaSuperficieTotal),
        iluminacion: calcularDemanda(recintos, 'ilum', sumaSuperficieTotal),
        consumo: {
          calefaccion: calcularConsumoEnergiaPrimaria(recintos, 'calef', sumaSuperficieTotal),
          refrigeracion: calcularConsumoEnergiaPrimaria(recintos, 'ref', sumaSuperficieTotal),
          iluminacion: calcularConsumoEnergiaPrimaria(recintos, 'ilum', sumaSuperficieTotal),
        },
        horasDisconfort: calcularHorasDisconfort(recintos),
        co2: calcularCO2eq(recintos)
      };

      return resultado;
    } catch (error) {
      console.error('Error calculando indicadores:', error);
      return defaultCalculos;
    }
  }, [recintos]);

  return (
    <div className="container my-4">
      <div className="row">
        {/* Sección Demanda */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <Flame className="me-2" />
              <strong>Demanda</strong>
            </div>
            <div className="card-body p-2">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th className="text-center" rowSpan={2}>Concepto</th>
                    <th colSpan={3} className="text-center">Demanda</th>
                  </tr>
                  <tr className="text-center">
                    <th>[kWh/m2-año]</th>
                    <th>[kWh-año]</th>
                    <th>
                      % Versus caso base
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Calefacción</td>
                    <td className="text-center">{calculos.calefaccion.kwh_m2_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.calefaccion.kwh_ano.toFixed(1)}</td>
                    <td className="text-center">
                      <span className="text-center">{calculos.calefaccion.vsCasoBase}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Refrigeración</td>
                    <td className="text-center">{calculos.refrigeracion.kwh_m2_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.refrigeracion.kwh_ano.toFixed(1)}</td>
                    <td className="text-center">
                      <span className="text-center">{calculos.refrigeracion.vsCasoBase}</span >
                    </td>
                  </tr>                  <tr>
                    <td>Iluminación</td>
                    <td className="text-center">14.5</td>
                    <td className="text-center">7850.0</td>
                    <td className="text-center">
                      <span className="text-center">12.5%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sección Consumo Energía Primaria */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <Droplet className="me-2" />
              <strong>Consumo Energía Primaria</strong>
            </div>
            <div className="card-body p-2">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th className="text-center" rowSpan={2}>Concepto</th>
                    <th colSpan={3} className="text-center">Consumo Energía Primaria</th>
                  </tr>                  <tr className="text-center">
                    <th>[kWh/m2-año]</th>
                    <th>[kWh-año]</th>
                    <th>% Versus caso base</th>
                  </tr>
                </thead>                <tbody>                  <tr>
                  <td>Calefacción</td>
                  <td className="text-center">{calculos?.consumo?.calefaccion?.kwh_m2_ano.toFixed(1)}</td>
                  <td className="text-center">{calculos?.consumo?.calefaccion?.kwh_ano.toFixed(1)}</td>
                  <td className="text-center">
                    {calculos?.consumo?.calefaccion?.vsCasoBase}%
                  </td>
                </tr>                  <tr>
                    <td>Refrigeración</td>
                    <td className="text-center">{calculos?.consumo?.refrigeracion?.kwh_m2_ano?.toFixed(1)}</td>
                    <td className="text-center">{calculos?.consumo?.refrigeracion?.kwh_ano?.toFixed(1)}</td>
                    <td className="text-center">
                      {calculos.consumo.refrigeracion?.vsCasoBase || 0}%
                    </td>
                  </tr>                  <tr>
                    <td>Iluminación</td>
                    <td className="text-center">15.2</td>
                    <td className="text-center">8100.0</td>
                    <td className="text-center">13.5%</td>
                  </tr>
                  <tr>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sección Hrs Disconfort */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <Snowflake className="me-2" />
              <strong>Hrs Disconfort T° libre</strong>
            </div>
            <div className="card-body p-2">              <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Total</th>
                  <th className="text-end">{calculos.horasDisconfort.total.toFixed(1)} hrs/año</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Comparación caso base</td>
                  <td colSpan={2} className="text-center">{calculos.horasDisconfort.comparacionBase}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Sección CO2_eq */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <Cloud className="me-2" />
              <strong>CO₂_eq</strong>
            </div>
            <div className="card-body p-2">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Total</th>
                    <th className="text-end">{calculos.co2.total.toFixed(1)} kg CO₂eq/año</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Comparación caso base</td>
                    <td colSpan={2} className="text-center">{calculos.co2.comparacionBase}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
