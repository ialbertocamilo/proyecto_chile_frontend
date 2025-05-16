// pages/resumen-energia.js
import "bootstrap/dist/css/bootstrap.min.css";
import { Cloud, Droplet, Flame, Snowflake } from "lucide-react";
import { useEffect } from "react";

// Define interface for props
interface IndicadoresFinalesProps {
  onDataUpdate?: (data: {
    demandaData: any[];
    consumoPrimario: any[];
    hrsDisconfort: any[];
    co2eqData: any;
  }) => void;
  calculatedComp?: {
    co2eqTotalRecintos?: number;
    co2eqTotalBase?: number;
  };
}

export default function IndicadoresFinales({ onDataUpdate, calculatedComp }: IndicadoresFinalesProps = {}) {
  // Datos simulados para cada sección
  const demandaData = [
    {
      concepto: "Calefacción",
      kwh_m2_ano: 114.1,
      kwh_ano: 22814.2,
      vsCasoBase: "14%",
    },
    {
      concepto: "Refrigeración",
      kwh_m2_ano: 72.1,
      kwh_ano: 14411.2,
      vsCasoBase: "-7%",
    },
    {
      concepto: "Iluminación",
      kwh_m2_ano: 35.2,
      kwh_ano: 7039.3,
      vsCasoBase: "0%",
    },
    { concepto: "ACS", kwh_m2_ano: 2.0, kwh_ano: 303.4, vsCasoBase: "0%" },
    {
      concepto: "Total",
      kwh_m2_ano: 222.8,
      kwh_ano: 44568.1,
      vsCasoBase: "6%",
    },
  ];

  const consumoPrimario = [
    {
      concepto: "Calefacción",
      kwh_m2_ano: 216.7,
      kwh_ano: 43347.1,
      vsCasoBase: "0%",
    },
    {
      concepto: "Refrigeración",
      kwh_m2_ano: 46.5,
      kwh_ano: 9297.5,
      vsCasoBase: "5%",
    },
    {
      concepto: "Iluminación",
      kwh_m2_ano: 35.2,
      kwh_ano: 7039.3,
      vsCasoBase: "0%",
    },
    { concepto: "ACS", kwh_m2_ano: 4.0, kwh_ano: 895.1, vsCasoBase: "-55%" },
    {
      concepto: "Total",
      kwh_m2_ano: 302.9,
      kwh_ano: 60579.0,
      vsCasoBase: "1%",
    },
  ];

  const hrsDisconfort = [
    { concepto: "Calefacción", hrs_ano: "19,106" },
    { concepto: "Refrigeración", hrs_ano: "5,540" },
    { concepto: "Total", hrs_ano: "24,646" },
    { concepto: "Comparación caso base", hrs_ano: "3%", nota: "[%]" },
  ];  // Calculamos el CO2eq y la comparación con el caso base usando los valores pasados por props
  const co2eqTotalRecintos = calculatedComp?.co2eqTotalRecintos || 20542.7;
  const co2eqTotalBase = calculatedComp?.co2eqTotalBase || 1;
  const energiaelectrica = 1.9; // Constante para energía eléctrica

  // Calculamos la comparación: 1 - ((actual - energiaelectrica) / (base - energiaelectrica))
  const co2eqComparacion = co2eqTotalBase !== energiaelectrica ?
    (1 - ((co2eqTotalRecintos - energiaelectrica) / (co2eqTotalBase - energiaelectrica))) : 0;
  const comparacionPorcentaje = co2eqComparacion * 100;
  const signo = comparacionPorcentaje >= 0 ? '' : '-';
  const comparacionStr = `${signo}${Math.abs(comparacionPorcentaje).toFixed(2)}%`;

  const co2eqData = {
    total: co2eqTotalRecintos,
    unidad: "[kg CO2eq]",
    comparacion: comparacionStr
  };
  // Send data to parent component on mount and when CO2eq values change
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate({
        demandaData,
        consumoPrimario,
        hrsDisconfort,
        co2eqData
      });
    }
  }, [calculatedComp?.co2eqTotalRecintos, calculatedComp?.co2eqTotalBase]);

  return (
    <div className="container my-4">
      {/* Grid principal */}
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
                  <tr className="">
                    <th className="text-center" rowSpan={2}>
                      Concepto
                    </th>
                    <th colSpan={3} className="text-center">
                      Demanda
                    </th>
                  </tr>
                  <tr className="text-center">
                    <th>[kWh/m2-año]</th>
                    <th>[kWh-año]</th>
                    <th>% Versus caso base</th>
                  </tr>
                </thead>
                <tbody>
                  {demandaData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="">{item.concepto}</td>
                      <td style={{ textAlign: "center" }}>{item.kwh_m2_ano}</td>
                      <td style={{ textAlign: "center" }}>
                        {item.kwh_ano.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.vsCasoBase}</td>
                    </tr>
                  ))}
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
                  <tr className="">
                    <th className="text-center" rowSpan={2}>
                      Concepto
                    </th>
                    <th colSpan={3} className="text-center">
                      Consumo Energía Primaria
                    </th>
                  </tr>
                  <tr className="">
                    <th className="text-center">[kWh/m2-año]</th>
                    <th className="text-center">[kWh-año]</th>
                    <th className="text-center">% Versus caso base</th>
                  </tr>
                </thead>
                <tbody>
                  {consumoPrimario.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.concepto}</td>
                      <td style={{ textAlign: "center" }}>{item.kwh_m2_ano}</td>
                      <td style={{ textAlign: "center" }}>
                        {item.kwh_ano.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.vsCasoBase}</td>
                    </tr>
                  ))}
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
                  {hrsDisconfort.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.concepto}</td>
                      <td style={{ textAlign: "center" }}>
                        {item.hrs_ano} {item.nota && <small>{item.nota}</small>}
                      </td>
                    </tr>
                  ))}
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
                  <tr className="">
                    <th>Total</th>
                    <th className="text-end">
                      {co2eqData.total.toLocaleString()}
                    </th>
                    <th>{co2eqData.unidad}</th>
                  </tr>
                </thead>                <tbody>                  <tr>
                  <td>Comparación caso base</td>
                  <td colSpan={2} className="text-center">
                    {co2eqData.comparacion}
                  </td>
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
