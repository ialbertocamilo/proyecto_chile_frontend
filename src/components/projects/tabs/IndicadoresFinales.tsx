import { useRecintos } from "@/context/RecintosContext";
import { Cloud, Droplet, Flame, Snowflake } from "lucide-react";
import { useEffect, useMemo } from "react";

type Recinto = {
  superficie?: number;
  demanda_calef?: number;
  demanda_ref?: number;
  demanda_ilum?: number;
  base_demanda_calef?: number;
  base_demanda_ref?: number;
  base_demanda_ilum?: number;
  hrs_disconfort_total?: number;
  co2_eq_total?: number;
  base_co2eq_total?: number;
}

interface Calculo {
  kwh_m2_ano: number;
  kwh_ano: number;
  vsCasoBase: string;
}

interface Calculos {
  calefaccion: Calculo;
  refrigeracion: Calculo;
  iluminacion: Calculo;
  horasDisconfort: number;
  co2: {
    total: number;
    comparacionBase: string;
  };
}

const defaultCalculo: Calculo = {
  kwh_m2_ano: 0,
  kwh_ano: 0,
  vsCasoBase: "0%"
};

const defaultCalculos: Calculos = {
  calefaccion: defaultCalculo,
  refrigeracion: defaultCalculo,
  iluminacion: defaultCalculo,
  horasDisconfort: 0,
  co2: {
    total: 0,
    comparacionBase: "0%"
  }
};

// Utility functions
const safeNumber = (value: any): number => Number(value) || 0;

const calculatePercentageReduction = (actual: number, base: number): string => {
  if (base === 0) return "0%";
  return `${((1 - (actual / base)) * 100).toFixed(1)}%`;
};

const sumProperty = (recintos: Recinto[], property: keyof Recinto): number => {
  return recintos.reduce((acc, recinto) => acc + safeNumber(recinto[property]), 0);
};

export default function IndicadoresFinales() {
  const { recintos } = useRecintos();

  useEffect(() => {
    console.log("IndicadoresFinales - recintos updated:", recintos);
  }, [recintos]);

  const calculos = useMemo(() => {
    console.log("IndicadoresFinales - Recalculando con recintos:", recintos);

    if (!Array.isArray(recintos) || recintos.length === 0) {
      console.log("IndicadoresFinales - No hay recintos, retornando defaults");
      return defaultCalculos;
    }

    try {
      const sumaSuperficieTotal = recintos.reduce((acc, recinto) =>
        acc + safeNumber(recinto?.superficie), 0);

      const calcularDemanda = (tipo: 'calef' | 'ref' | 'ilum') => {
        const propMap = {
          calef: { actual: 'demanda_calef', base: 'base_demanda_calef' },
          ref: { actual: 'demanda_ref', base: 'base_demanda_ref' },
          ilum: { actual: 'demanda_ilum', base: 'base_demanda_ilum' }
        };

        const props = propMap[tipo];
        let total = 0;
        let baseCase = 0;

        recintos.forEach(recinto => {
          const superficie = safeNumber(recinto?.superficie);
          const demandaActual = safeNumber(recinto?.[props.actual as keyof Recinto]);
          const demandaBase = safeNumber(recinto?.[props.base as keyof Recinto]);

          total += demandaActual * superficie;
          baseCase += demandaBase * superficie;
        });

        const porM2 = sumaSuperficieTotal > 0 ? total / sumaSuperficieTotal : 0;
        const vsCasoBase = calculatePercentageReduction(total, baseCase);

        return {
          kwh_m2_ano: porM2,
          kwh_ano: total,
          vsCasoBase
        };
      };

      const horasDisconfort = sumProperty(recintos, 'hrs_disconfort_total');
      const co2Total = sumProperty(recintos, 'co2_eq_total');
      const co2Base = sumProperty(recintos, 'base_co2eq_total');

      return {
        calefaccion: calcularDemanda('calef'),
        refrigeracion: calcularDemanda('ref'),
        iluminacion: calcularDemanda('ilum'),
        horasDisconfort,
        co2: {
          total: co2Total,
          comparacionBase: calculatePercentageReduction(co2Total, co2Base)
        }
      };
    } catch (error) {
      console.error('Error calculando indicadores:', error);
      return defaultCalculos;
    }
  }, [recintos]);
    const { recintos:asd } = useRecintos();

    useEffect(() => {

        console.log("Recintos en CasoBaseTable", asd);
    }, [asd])
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
                    <th>% Versus caso base</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Calefacción</td>
                    <td className="text-center">{calculos.calefaccion.kwh_m2_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.calefaccion.kwh_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.calefaccion.vsCasoBase}</td>
                  </tr>
                  <tr>
                    <td>Refrigeración</td>
                    <td className="text-center">{calculos.refrigeracion.kwh_m2_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.refrigeracion.kwh_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.refrigeracion.vsCasoBase}</td>
                  </tr>
                  <tr>
                    <td>Iluminación</td>
                    <td className="text-center">{calculos.iluminacion.kwh_m2_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.iluminacion.kwh_ano.toFixed(1)}</td>
                    <td className="text-center">{calculos.iluminacion.vsCasoBase}</td>
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
                  </tr>
                  <tr className="text-center">
                    <th>[kWh/m2-año]</th>
                    <th>[kWh-año]</th>
                    <th>% Versus caso base</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total</td>
                    <td className="text-center">
                      {(calculos.calefaccion.kwh_m2_ano +
                        calculos.refrigeracion.kwh_m2_ano +
                        calculos.iluminacion.kwh_m2_ano).toFixed(1)}
                    </td>
                    <td className="text-center">
                      {(calculos.calefaccion.kwh_ano +
                        calculos.refrigeracion.kwh_ano +
                        calculos.iluminacion.kwh_ano).toFixed(1)}
                    </td>
                    <td className="text-center">-</td>
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
            <div className="card-body p-2">
              <table className="table table-sm mb-0">
                <thead>
                  <tr className="text-center">
                    <th>Concepto</th>
                    <th>[hrs -año]</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total</td>
                    <td className="text-center">{calculos.horasDisconfort.toFixed(1)}</td>
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
