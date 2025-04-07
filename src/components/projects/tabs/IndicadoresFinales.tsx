import { Card, Col, Row, Table } from 'react-bootstrap';

const IndicadoresFinales = () => {
    return (
        <Row className="mb-4">
            <Col md={6}>
                <Card className="shadow">
                    <Card.Body>
                        <Card.Title className="text-center text-dark">Demanda Energética</Card.Title>
                        <Table bordered responsive className="table-sm mb-4">
                            <thead className="table-light">
                                <tr>
                                    <th>Demanda</th>
                                    <th>[kWh/m²-año]</th>
                                    <th>[kWh-año]</th>
                                    <th>% Versus caso base</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Calefacción</td>
                                    <td>116.3</td>
                                    <td>17,442.4</td>
                                    <td>15%</td>
                                </tr>
                                <tr>
                                    <td>Refrigeración</td>
                                    <td>52.6</td>
                                    <td>7,832.4</td>
                                    <td>-7%</td>
                                </tr>
                                <tr>
                                    <td>Iluminación</td>
                                    <td>33.3</td>
                                    <td>5,083.3</td>
                                    <td>0%</td>
                                </tr>
                                <tr className="table-secondary">
                                    <td>Total</td>
                                    <td>202.8</td>
                                    <td>30,418.7</td>
                                    <td>8%</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="shadow">
                    <Card.Body>
                        <Card.Title className="text-center text-dark">Consumo Energía Primaria</Card.Title>
                        <Table bordered responsive className="table-sm">
                            <thead className="table-light">
                                <tr>
                                    <th>Consumo Energía Primaria</th>
                                    <th>[kWh/m²-año]</th>
                                    <th>[kWh-año]</th>
                                    <th>% Versus caso base</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Calefacción</td>
                                    <td>220.3</td>
                                    <td>33,406.0</td>
                                    <td>0%</td>
                                </tr>
                                <tr>
                                    <td>Refrigeración</td>
                                    <td>52.6</td>
                                    <td>5,018.5</td>
                                    <td>5%</td>
                                </tr>
                                <tr>
                                    <td>Iluminación</td>
                                    <td>33.3</td>
                                    <td>5,083.3</td>
                                    <td>0%</td>
                                </tr>
                                <tr className="table-secondary">
                                    <td>Total</td>
                                    <td>288.8</td>
                                    <td>43,316.4</td>
                                    <td>1%</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default IndicadoresFinales;
