import { useConstants } from "@/hooks/useConstantsHook";
import { Plus, Trash2 } from "lucide-react"; // Importing Lucide icons
import { useEffect, useState } from "react";
import { Card, Col, Form, Row, Table } from "react-bootstrap";
import CustomButton from "../../common/CustomButton"; // Assuming CustomButton is located here

const AguaCalienteSanitaria = () => {
  const result = useConstants("energy_systems", "general");
  const occupancyResult = useConstants("acs", "occupancy");
  const tempRedResult = useConstants("temperature", "red");
  const waterMonthly = useConstants("water", "monthly");

  const acsDataList = Object.entries(
    occupancyResult.constant?.atributs?.tipo_de_ocupacion_acs || {}
  ).map(([tipo, consumo]) => ({ tipo, cantidad: 0, consumo: Number(consumo) }));

  interface TableRow {
    tipo: string;
    cantidad: number;
    consumo: number;
  }

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [demandaACS, setDemandaACS] = useState<number>(100);
  const [consumoACS, setConsumoACS] = useState<number>(3.251);
  const [consumoEnergiaPrimariaACS, setConsumoEnergiaPrimariaACS] =
    useState<number>(3.576);
  const [co2eqEnergiaPrimaria, setCo2eqEnergiaPrimaria] = useState<number>(815);
  const [combustible, setCombustible] = useState<any>("");
  const [rendimiento, setRendimiento] = useState<string>("");
  const [sistDistribucion, setSistDistribucion] = useState<string>("");
  const [sistControl, setSistControl] = useState<string | number>(
    "Automático base a T° agua"
  );
  const [tAcs, setTAcs] = useState<number>(0);

  const [combustibleOptions, setCombustibleOptions] = useState<
    { value: string; label: string; fep: number }[]
  >([]);
  const [rendimientoOptions, setRendimientoOptions] = useState<
    { value: string; label: string; rendimiento: number }[]
  >([]);
  const [sistDistribucionOptions, setSistDistribucionOptions] = useState<
    { value: string; label: string; distribucion: number }[]
  >([]);
  const [sistControlOptions, setSistControlOptions] = useState<
    { value: string; label: string; control: number }[]
  >([]);

  const [energySourceConsumption, setEnergySourceConsumption] = useState<{
    [key: string]: number;
  }>({});
  useEffect(() => {
    if (result.constant?.atributs?.consumos_por_fuente_de_energia) {
      setEnergySourceConsumption(
        result.constant?.atributs?.consumos_por_fuente_de_energia
      );
    }
  }, []);

  useEffect(() => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Calculate total daily consumption from table data
    const sumTotalConsumo = tableData.reduce(
      (acc, row) => acc + row.cantidad * row.consumo,
      0
    );

    // Calculate monthly consumption (liters per month)
    const litrosMes = daysInMonth.map((days) => sumTotalConsumo * days);

    console.log("Total consumo diario:", sumTotalConsumo);
    console.log("Litros por mes:", litrosMes);
    tempRedResult.constant?.atributs?.monthly;
    const monthlyTemp = Object.entries(
      tempRedResult.constant?.atributs?.monthly || {}
    )
      .sort((a, b) => {
        const months = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];
        return months.indexOf(a[0]) - months.indexOf(b[0]);
      })
      .map(([_, value]) => Number(value));

    console.log(monthlyTemp);
    const litrosDtMes = litrosMes.map(
      (litros, index) => litros * (tAcs - Number(monthlyTemp[index]))
    );

    const sumLitrosDtmes = litrosDtMes.reduce((acc, value) => acc + value, 0);
    setDemandaACS(parseFloat((sumLitrosDtmes / 860).toFixed(2))); // Limitar a 2 decimales
  }, [tableData, tAcs]);

  const [combustibleLabel, setCombustibleLabel] = useState<string>("");

  useEffect(() => {
    if (result.constant?.atributs) {
      const { combustibles, rendimiento_acs, distribucion_acs, control_acs } =
        result.constant.atributs;

      setCombustibleOptions(
        combustibles.map((item: any) => ({
          value: item.code,
          label: item.name,
          fep: item.fep,
        }))
      );
      setRendimientoOptions(
        rendimiento_acs.map((item: any) => ({
          value: item.code,
          label: item.name,
          rendimiento: item.value,
        }))
      );
      setSistDistribucionOptions(
        distribucion_acs.map((item: any) => ({
          value: item.code,
          label: item.name,
          distribucion: item.value,
        }))
      );
      setSistControlOptions(
        control_acs.map((item: any) => ({
          value: item.code,
          label: item.name,
          control: item.value,
        }))
      );

      // Set default values only if they are not already set
      if (!combustible && combustibles.length > 0)
        setCombustible(combustibles[0].code);
      if (!rendimiento && rendimiento_acs.length > 0)
        setRendimiento(rendimiento_acs[0].code);
      if (!sistDistribucion && distribucion_acs.length > 0)
        setSistDistribucion(distribucion_acs[0].code);
      if (!sistControl && control_acs.length > 0)
        setSistControl(control_acs[0].code);
    }
  }, [result.constant]);

  const getValueFromValue = (options: any[], code: string, key: string) => {
    const option = options.find((opt) => opt.value === code);
    return option ? option[key] : 1;
  };

  const getValueFromCode = (options: any[], name: string, key: string) => {
    const option = options.find((opt) => opt?.code === name);
    return option?.[key];
  };

  useEffect(() => {
    const rendimientoValue = getValueFromValue(
      rendimientoOptions,
      rendimiento,
      "rendimiento"
    );
    const sistDistribucionValue = getValueFromValue(
      sistDistribucionOptions,
      sistDistribucion,
      "distribucion"
    );
    const sistControlValue = getValueFromValue(
      sistControlOptions,
      sistControl as string,
      "control"
    );

    if (rendimientoValue && sistDistribucionValue && sistControlValue) {
      const calculatedConsumoACS =
        demandaACS /
        (rendimientoValue * sistDistribucionValue * sistControlValue);
      setConsumoACS(parseFloat(calculatedConsumoACS.toFixed(3)));
    }
  }, [
    demandaACS,
    rendimiento,
    sistDistribucion,
    sistControl,
    rendimientoOptions,
    sistDistribucionOptions,
    sistControlOptions,
  ]);

  useEffect(() => {
    const rendimientoValue = getValueFromValue(
      rendimientoOptions,
      rendimiento,
      "rendimiento"
    );
    const sistDistribucionValue = getValueFromValue(
      sistDistribucionOptions,
      sistDistribucion,
      "distribucion"
    );
    const sistControlValue = getValueFromValue(
      sistControlOptions,
      String(sistControl),
      "control"
    );
    const combustibleFep = getValueFromValue(
      combustibleOptions,
      combustible,
      "fep"
    );

    if (
      rendimientoValue &&
      sistDistribucionValue &&
      sistControlValue &&
      combustibleFep
    ) {
      const calculatedConsumoEnergiaPrimariaACS =
        (combustibleFep * demandaACS) /
        (sistControlValue * sistDistribucionValue * rendimientoValue);
      setConsumoEnergiaPrimariaACS(
        parseFloat(calculatedConsumoEnergiaPrimariaACS.toFixed(3))
      );
    }

    const co2EqValue = getValueFromCode(
      result.constant?.atributs?.consumos_por_fuente_de_energia || [],
      combustible,
      "co2_eq"
    );

    if (co2EqValue && consumoEnergiaPrimariaACS) {
      const calculatedCo2Eq = co2EqValue * consumoEnergiaPrimariaACS;
      setCo2eqEnergiaPrimaria(parseFloat(calculatedCo2Eq.toFixed(3)));
    }
  }, [
    demandaACS,
    rendimiento,
    sistDistribucion,
    sistControl,
    combustible,
    consumoEnergiaPrimariaACS,
    rendimientoOptions,
    sistDistribucionOptions,
    sistControlOptions,
    combustibleOptions,
    result.constant?.atributs?.consumos_por_fuente_de_energia,
  ]);

  const handleInputChange = (
    index: number,
    field: keyof TableRow,
    value: string
  ) => {
    const updatedData = [...tableData];
    if (field === "tipo") {
      const selectedOption = acsDataList.find(
        (option) => option.tipo === value
      );
      updatedData[index].consumo = selectedOption ? selectedOption.consumo : 0;
    }
    updatedData[index] = {
      ...updatedData[index],
      [field]:
        field === "cantidad" || field === "consumo"
          ? parseFloat(value) || 0
          : value,
    };
    setTableData(updatedData);
  };

  const addRow = () => {
    const newRow =
      acsDataList.length > 0
        ? acsDataList[0]
        : { tipo: "", cantidad: 0, consumo: 0 };
    setTableData([...tableData, { ...newRow }]);
  };

  const deleteRow = (index: number) => {
    const updatedData = tableData.filter((_, i) => i !== index);
    setTableData(updatedData);
  };

  const handleCombustibleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedOption = combustibleOptions.find(
      (option) => option.value === selectedCode
    );
    if (selectedOption) {
      setCombustible(selectedOption.value);
      setCombustibleLabel(selectedOption.label);
    }
  };

  return (
    <Row className="mb-4">
      <Col md={12}>
        <Card className="shadow">
          <Card.Body>
            <Card.Title className="text-center text-dark">
              Agua Caliente Sanitaria
            </Card.Title>
            <div
              style={{
                display: "block",
                marginBottom: "15px",
              }}
            >
              <CustomButton
                style={{ marginLeft: "auto" }}
                className="mt-3"
                onClick={addRow}
              >
                <Plus className="me-1" size={16} /> Nueva Fila
              </CustomButton>
            </div>
            <Table bordered responsive className="table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tipo de ocupación para sistema ACS</th>
                  <th>Cantidad personas</th>
                  <th>
                    <span className="fw-bold">[l/pers-día]</span>
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Select
                        value={row.tipo}
                        onChange={(e) =>
                          handleInputChange(index, "tipo", e.target.value)
                        }
                      >
                        {acsDataList.map((option, i) => (
                          <option key={i} value={option.tipo}>
                            {option.tipo}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={row.cantidad}
                        onChange={(e) =>
                          handleInputChange(index, "cantidad", e.target.value)
                        }
                      />
                    </td>
                    <td>{(row.cantidad * row.consumo).toFixed(2)}</td>
                    <td>
                      <CustomButton
                        color="red"
                        onClick={() => deleteRow(index)}
                      >
                        <Trash2 className="me-1" size={16} /> Eliminar
                      </CustomButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  T&apos; ACS
                </Form.Label>
                <Col sm={4} className="text-end">
                  <Form.Control
                    type="number"
                    min="0"
                    value={tAcs}
                    onChange={(e) => setTAcs(parseFloat(e.target.value) || 0)}
                  />
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>°C</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Demanda ACS
                </Form.Label>
                <Col sm={4} className="text-end">
                  <div className="form-control-plaintext fw-bold">
                    {demandaACS}
                  </div>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>[kWh]</span>
                </Col>
              </Form.Group>
            </div>

            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Combustible
                </Form.Label>
                <Col sm={4} className="text-end">
                  <Form.Select
                    value={combustible}
                    onChange={handleCombustibleChange}
                  >
                    <option value="">Seleccione</option>
                    {combustibleOptions.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>
                    {getValueFromValue(combustibleOptions, combustible, "fep")}
                  </span>{" "}
                  <span>[FEP]</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Rendimiento
                </Form.Label>
                <Col sm={4} className="text-end">
                  <Form.Select
                    value={rendimiento}
                    onChange={(e) => setRendimiento(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {rendimientoOptions.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>
                    {getValueFromValue(
                      rendimientoOptions,
                      rendimiento,
                      "rendimiento"
                    )}
                  </span>{" "}
                  <span>[FEP]</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Sist. Distribución
                </Form.Label>
                <Col sm={4} className="text-end">
                  <Form.Select
                    value={sistDistribucion}
                    onChange={(e) =>
                      setSistDistribucion(String(e.target.value))
                    }
                  >
                    <option value="">Seleccione</option>
                    {sistDistribucionOptions.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>
                    {getValueFromValue(
                      sistDistribucionOptions,
                      sistDistribucion,
                      "distribucion"
                    )}
                  </span>{" "}
                  <span>[FEP]</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Sist. Control
                </Form.Label>
                <Col sm={4} className="text-end">
                  <Form.Select
                    value={sistControl}
                    onChange={(e) => setSistControl(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {sistControlOptions.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>
                    {getValueFromValue(
                      sistControlOptions,
                      String(sistControl),
                      "control"
                    )}
                  </span>{" "}
                  <span>[FEP]</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Consumo ACS
                </Form.Label>
                <Col sm={4} className="text-end">
                  <div className="form-control-plaintext fw-bold">
                    {consumoACS}
                  </div>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>[kWh]</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  Consumo Energía primaria ACS
                </Form.Label>
                <Col sm={4} className="text-end">
                  <div className="form-control-plaintext fw-bold">
                    {consumoEnergiaPrimariaACS}
                  </div>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>[kWh]</span>
                </Col>
              </Form.Group>
            </div>
            <div className="mt-3">
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={2} className="text-end">
                  CO2eq Energía primaria
                </Form.Label>
                <Col sm={4} className="text-end">
                  <div className="form-control-plaintext fw-bold">
                    {co2eqEnergiaPrimaria}
                  </div>
                </Col>
                <Col sm="auto" className="align-self-center">
                  <span>[kg CO2]</span>
                </Col>
              </Form.Group>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AguaCalienteSanitaria;
