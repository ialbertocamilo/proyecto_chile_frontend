import { useApi } from "@/hooks/useApi";
import { useConstants } from "@/hooks/useConstantsHook";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Nav, Row, Tab, Table } from "react-bootstrap";

interface Recinto {
  id: number;
  name_enclosure: string;
  usage_profile_name: string;
  height: number;
  superficie: number;
  demanda_calef: number;
  demanda_ref: number;
  demanda_ilum: number;
  demanda_total: number;
  consumo_calef: number;
  consumo_ref: number;
  consumo_total: number;
  co2_eq: number;
  hrs_disconfort: number;
  rendimiento_calef?: number;
  distribucion_calef?: number;
  control_calef?: number;
  scop_calef?: number;
  scop_mc_calef?: number;
  rendimiento_ref?: number;
  distribucion_ref?: number;
  control_ref?: number;
  scop_ref?: number;
  scop_mc_ref?: number;
  consumo_energia_primaria_calef?: number;
  consumo_energia_primaria_ref?: number;
  consumo_energia_primaria_total?: number;
}

interface ResumenRecintosProps {
  onRecintosCalculated: (recintos: Recinto[]) => void;
}

const ResumenRecintos = ({ onRecintosCalculated }: ResumenRecintosProps) => {
  const api = useApi();
  const router = useRouter();
  const result = useConstants("energy_systems", "general");

  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [calculatedRecintos, setCalculatedRecintos] = useState<Recinto[]>([]);
  const [selectedEnergySystems, setSelectedEnergySystems] = useState<{
    [key: number]: string;
  }>({});
  const [selectedEnergySystemsRef, setSelectedEnergySystemsRef] = useState<{
    [key: number]: string;
  }>({});
  const [selectedRendimientoCalef, setSelectedRendimientoCalef] = useState<{
    [key: number]: string;
  }>({});
  const [selectedDistribucionHvac, setSelectedDistribucionHvac] = useState<{
    [key: number]: string;
  }>({});
  const [selectedControlHvac, setSelectedControlHvac] = useState<{
    [key: number]: string;
  }>({});
  const [selectedRendimientoRef, setSelectedRendimientoRef] = useState<{
    [key: number]: string;
  }>({});
  const [energySystems, setEnergySystems] = useState<any[]>([]);
  const [rendimientoCalef, setRendimientoCalef] = useState<any[]>([]);
  const [distribucionHvac, setDistribucionHvac] = useState<any[]>([]);
  const [controlHvac, setControlHvac] = useState<any[]>([]);
  const [rendimientoRef, setRendimientoRef] = useState<any[]>([]);

  const handleEnergySystemChange = (recintoId: number, value: string) => {
    setSelectedEnergySystems((prev) => ({ ...prev, [recintoId]: value }));
  };
  const handleEnergySystemChangeRef = (recintoId: number, value: string) => {
    setSelectedEnergySystemsRef((prev) => ({ ...prev, [recintoId]: value }));
  };
  const handleRendimientoCalefChange = (recintoId: number, value: string) => {
    setSelectedRendimientoCalef((prev) => ({ ...prev, [recintoId]: value }));
  };
  const handleDistribucionHvacChange = (recintoId: number, value: string) => {
    setSelectedDistribucionHvac((prev) => ({ ...prev, [recintoId]: value }));
  };
  const handleControlHvacChange = (recintoId: number, value: string) => {
    setSelectedControlHvac((prev) => ({ ...prev, [recintoId]: value }));
  };
  const handleRendimientoRef = (recintoId: number, value: string) => {
    setSelectedRendimientoRef((prev) => ({ ...prev, [recintoId]: value }));
  };

  useEffect(() => {
    if (router.query.id) {
      api.get(`/enclosure-generals/${router.query.id}`).then((data) => {
        const updatedData = data.map((recinto: any) => ({
          ...recinto,
          demanda_calef: recinto.demanda_calef || 2,
          demanda_ref: recinto.demanda_ref || 0,
          demanda_ilum: recinto.demanda_ilum || 0,
          demanda_total: recinto.demanda_total || 0,
          consumo_calef: recinto.consumo_calef || 0,
          consumo_ref: recinto.consumo_ref || 0,
          consumo_total: recinto.consumo_total || 0,
          co2_eq: recinto.co2_eq || 0,
        }));
        console.log(updatedData);
        setRecintos(updatedData);
      });
    } else {
      setRecintos([]);
    }
  }, [router.query.id]);

  useEffect(() => {
    if (result.constant) {
      const systems =
        result.constant.atributs?.consumos_por_fuente_de_energia || [];
      setEnergySystems(systems);
      const rendCalef = result.constant.atributs?.rendimiento_calef || [];
      setRendimientoCalef(rendCalef);
      const distCalef = result.constant.atributs?.distribucion_hvac || [];
      setDistribucionHvac(distCalef);
      const controlCalef = result.constant.atributs?.control_hvac || [];
      setControlHvac(controlCalef);
      const rendRef = result.constant.atributs?.rendimiento_ref || [];
      setRendimientoRef(rendRef);
      console.log("Energy Systems:", systems);
    }
  }, [result.constant]);

  useEffect(() => {
    if (recintos.length > 0 && result.constant) {
      const rendimiento_calef =
        parseFloat(
          energySystems.find((system: any) => system.code === "Elect")?.co2_eq
        ) || 0.8;
      const rendimiento_ref =
        parseFloat(
          energySystems.find((system: any) => system.code === "Pet")?.co2_eq
        ) || 0.6;

      const updatedRecintos = recintos.map((recinto) => {
        console.log("Procesando recinto:", recinto);

        const demanda_calef = recinto.height * rendimiento_calef;
        const demanda_ref = recinto.height * rendimiento_ref;
        const demanda_ilum = recinto.height * 0.1;
        const demanda_total = demanda_calef + demanda_ref + demanda_ilum;

        const consumo_calef = demanda_calef * 0.5;
        const consumo_ref = demanda_ref * 0.3;
        const consumo_total = consumo_calef + consumo_ref;

        const co2_eq = consumo_total * 0.2;

        console.log(recinto.height);
        console.log("Resultados calculados:", {
          demanda_calef,
          demanda_ref,
          demanda_ilum,
          demanda_total,
          consumo_calef,
          consumo_ref,
          consumo_total,
          co2_eq,
        });

        return {
          ...recinto,
          demanda_calef,
          demanda_ref,
          demanda_ilum,
          demanda_total,
          consumo_calef,
          consumo_ref,
          consumo_total,
          co2_eq,
        };
      });

      setCalculatedRecintos(updatedRecintos);
      onRecintosCalculated(updatedRecintos); // Notificar al componente padre
    }
  }, [recintos, result.constant]);

  return (
    <div className="container-fluid mt-4">
      <div className="">
        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <Row className="mb-5">
            <Col sm={12}>
              <Nav variant="pills" className="flex-row">
                <Nav.Item>
                  <Nav.Link className="nav-pill-info" eventKey="first">
                    Demanda
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="nav-pill-info" eventKey="second">
                    Consumo (kWh/m²)
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="nav-pill-info" eventKey="third">
                    CO2_eq
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fourth" className="nav-pill-info">
                    Hrs Disconfort
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fifth" className="nav-pill-info">
                    Caso Base
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row className="gx-5 justify-content-between">
            <Col sm={4} className="overflow-x-scroll">
              <Table className="tables-recints">
                <thead style={{ height: "100px" }}>
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
                  </tr>
                </thead>
                <tbody>
                  {calculatedRecintos.map((recinto, index) => (
                    <tr key={index}>
                      <td className="text-center">{recinto.name_enclosure}</td>
                      <td className="text-center">
                        {recinto.usage_profile_name}
                      </td>
                      <td className="text-center">
                        {recinto.height || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col sm={8}>
              <Tab.Content>
                <Tab.Pane eventKey="first" className="overflow-x-scroll">
                  <Table className="tables-results">
                    <thead style={{ height: "100px" }}>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          Demanda
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          [kWh/m2]
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center">Calef</th>
                        <th className="text-center">Ref</th>
                        <th className="text-center">Ilum</th>
                        <th className="text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedRecintos.map((recinto, index) => (
                        <tr key={index}>
                          <td className="text-center">
                            {recinto.demanda_calef?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.demanda_ref?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.demanda_ilum?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.demanda_total?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane className="overflow-x-scroll" eventKey="second">
                  <Table className="tables-results">
                    <thead style={{ height: "100px" }}>
                      <tr>
                        <th className="text-center" colSpan={15}>
                          Consumo [kWh/m2]
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center" colSpan={6}>
                          Calefacción
                        </th>
                        <th className="text-center" colSpan={6}>
                          Refrigeración
                        </th>
                        <th className="text-center" colSpan={3}>
                          Consumo Energía Primaria
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center">Comb</th>
                        <th className="text-center">Rendimiento</th>
                        <th className="text-center">Distribución</th>
                        <th className="text-center">Control</th>
                        <th className="text-center">SCOP</th>
                        <th className="text-center">SCOP de MC</th>
                        <th className="text-center">Comb</th>
                        <th className="text-center">Rendimiento</th>
                        <th className="text-center">Distribución</th>
                        <th className="text-center">Control</th>
                        <th className="text-center">SEER</th>
                        <th className="text-center">SEER de MC</th>
                        <th className="text-center">Calef</th>
                        <th className="text-center">Ref</th>
                        <th className="text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedRecintos.map((recinto, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={selectedEnergySystems[recinto.id] || ""}
                              onChange={(e) =>
                                handleEnergySystemChange(
                                  recinto.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccione</option>
                              {energySystems.map((system: any) => (
                                <option key={system.code} value={system.code}>
                                  {system.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            <select
                              value={selectedRendimientoCalef[recinto.id] || ""}
                              onChange={(e) =>
                                handleRendimientoCalefChange(
                                  recinto.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccione</option>
                              {rendimientoCalef.map((system: any) => (
                                <option key={system.code} value={system.code}>
                                  {system.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            <select
                              value={selectedDistribucionHvac[recinto.id] || ""}
                              onChange={(e) =>
                                handleDistribucionHvacChange(
                                  recinto.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccione</option>
                              {distribucionHvac.map((system: any) => (
                                <option key={system.code} value={system.code}>
                                  {system.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            <select
                              value={selectedControlHvac[recinto.id] || ""}
                              onChange={(e) =>
                                handleControlHvacChange(
                                  recinto.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccione</option>
                              {controlHvac.map((system: any) => (
                                <option key={system.code} value={system.code}>
                                  {system.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            {recinto.rendimiento_calef?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.distribucion_calef?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                          <select
                              value={selectedEnergySystemsRef[recinto.id] || ""}
                              onChange={(e) =>
                                handleEnergySystemChangeRef(
                                  recinto.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccione</option>
                              {energySystems.map((system: any) => (
                                <option key={system.code} value={system.code}>
                                  {system.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            <select
                              value={selectedRendimientoRef[recinto.id] || ""}
                              onChange={(e) =>
                                handleRendimientoRef(recinto.id, e.target.value)
                              }
                            >
                              <option value="">Seleccione</option>
                              {rendimientoRef.map((system: any) => (
                                <option key={system.code} value={system.code}>
                                  {system.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            {recinto.scop_mc_calef?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.rendimiento_ref?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.distribucion_ref?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.control_ref?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.scop_ref?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.scop_mc_ref?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.consumo_energia_primaria_calef?.toFixed(
                              2
                            ) || "0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane className="overflow-x-scroll" eventKey="third">
                  <Table className="tables-results">
                    <thead style={{ height: "100px" }}>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          CO2_eq
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          kg CO2 Energía Primaria
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center">Calef</th>
                        <th className="text-center">Ref</th>
                        <th className="text-center">Ilum</th>
                        <th className="text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedRecintos.map((recinto, index) => (
                        <tr key={index}>
                          <td className="text-center">
                            {recinto.consumo_energia_primaria_calef?.toFixed(
                              2
                            ) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.consumo_energia_primaria_ref?.toFixed(2) ||
                              "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.consumo_energia_primaria_total?.toFixed(
                              2
                            ) || "0.00"}
                          </td>
                          <td className="text-center">
                            {recinto.co2_eq?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane className="overflow-x-scroll" eventKey="fourth">
                  <Table className="tables-results">
                    <thead>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          Hrs Disconfort
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          T° Libre
                        </th>
                      </tr>
                      <tr>
                        <th>Calef</th>
                        <th>Ref</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedRecintos.map((recinto, index) => (
                        <tr key={index}>
                          <td>{recinto.demanda_calef || "0.00"}</td>
                          <td>{recinto.demanda_ref || "0.00"}</td>
                          <td>{recinto.demanda_ilum?.toFixed(2) || "0.00"}</td>
                          <td>{recinto.demanda_total || "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane className="overflow-x-scroll" eventKey="fifth">
                  <Table className="tables-results">
                    <thead>
                      <tr>
                        <th className="text-center" colSpan={4}>
                          Caso Base
                        </th>
                      </tr>
                      <tr>
                        <th className="text-center" colSpan={3}>
                          Demanda
                        </th>
                        <th className="text-center" colSpan={2}>
                          Consumo
                        </th>
                        <th className="text-center" colSpan={1}>
                          CO2_eq
                        </th>
                        <th className="text-center" colSpan={2}>
                          Hrs Disconfort
                        </th>
                      </tr>
                      <tr>
                        <th>Calef</th>
                        <th>Ref</th>
                        <th>Ilum</th>
                        <th>Calef</th>
                        <th>Ref</th>
                        <th>Total</th>
                        <th>Calef</th>
                        <th>Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedRecintos.map((recinto, index) => (
                        <tr key={index}>
                          <td>
                            {recinto.consumo_energia_primaria_calef?.toFixed(
                              2
                            ) || "0.00"}
                          </td>
                          <td>
                            {recinto.consumo_energia_primaria_ref?.toFixed(2) ||
                              "0.00"}
                          </td>
                          <td>
                            {recinto.consumo_energia_primaria_total?.toFixed(
                              2
                            ) || "0.00"}
                          </td>
                          <td>{recinto.co2_eq?.toFixed(2) || "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
        {/* <table className="table table-bordered table-hover table-sm align-middle">
          <thead>
            <tr>
              <th rowSpan={3}>Recinto</th>
              <th rowSpan={3}>Perfil de uso</th>
              <th rowSpan={3}>Superficie (m²)</th>
              <th colSpan={4} className="text-center">
                Demanda (kWh/m²)
              </th>
              <th colSpan={15} className="text-center">
                Consumo (kWh/m²)
              </th>
            </tr>
            <tr>
              <th>Calef</th>
              <th>Ref</th>
              <th>Ilum</th>
              <th>Total</th>
              <th colSpan={6} className="text-center">
                Calefacción
              </th>
              <th colSpan={6} className="text-center">
                Refrigeración
              </th>
              <th colSpan={3} className="text-center">
                Consumo de Energía Primaria
              </th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>Combustible</th>
              <th>Rendimiento</th>
              <th>Distribución</th>
              <th>Control</th>
              <th>SCOP</th>
              <th>SCOP de MC</th>
              <th>Combustible</th>
              <th>Rendimiento</th>
              <th>Distribución</th>
              <th>Control</th>
              <th>SCOP</th>
              <th>SCOP de MC</th>
              <th>Calef.</th>
              <th>Ref.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {calculatedRecintos.map((recinto, index) => (
              <tr key={index}>
                <td>{recinto.name_enclosure}</td>
                <td>{recinto.usage_profile_name}</td>
                <td>{recinto.height || "0.00"}</td>
                <td>{recinto.demanda_calef || "0.00"}</td>
                <td>{recinto.demanda_ref || "0.00"}</td>
                <td>{recinto.demanda_ilum || "0.00"}</td>
                <td>{recinto.demanda_total || "0.00"}</td>
                <td>
                  <select
                    value={selectedEnergySystems[recinto.id] || ""}
                    onChange={(e) =>
                      handleEnergySystemChange(recinto.id, e.target.value)
                    }
                  >
                    <option value="">Seleccione</option>
                    {energySystems.map((system: any) => (
                      <option key={system.code} value={system.code}>
                        {system.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{recinto.consumo_calef || "0.00"}</td>
                <td>{recinto.consumo_ref || "0.00"}</td>
                <td>{recinto.consumo_total || "0.00"}</td>
                <td>{recinto.rendimiento_calef || "0.00"}</td>
                <td>{recinto.distribucion_calef || "0.00"}</td>
                <td>{recinto.control_calef || "0.00"}</td>
                <td>{recinto.scop_calef || "0.00"}</td>
                <td>{recinto.scop_mc_calef || "0.00"}</td>
                <td>{recinto.rendimiento_ref || "0.00"}</td>
                <td>{recinto.distribucion_ref || "0.00"}</td>
                <td>{recinto.control_ref || "0.00"}</td>
                <td>{recinto.scop_ref || "0.00"}</td>
                <td>{recinto.scop_mc_ref || "0.00"}</td>
                <td>{recinto.consumo_energia_primaria_calef || "0.00"}</td>
                <td>{recinto.consumo_energia_primaria_ref || "0.00"}</td>
                <td>{recinto.consumo_energia_primaria_total || "0.00"}</td>
                <td>{recinto.co2_eq || "0.00"}</td>
              </tr>
            ))}
            {calculatedRecintos.length === 0 && (
              <tr>
                <td colSpan={22} className="text-center">
                  No hay recintos para el proyecto seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table> */}
      </div>
    </div>
  );
};

export default ResumenRecintos;
