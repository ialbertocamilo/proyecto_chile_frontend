import { useConstants } from '@/hooks/useConstantsHook';
import { Card, Col, Row, Table } from 'react-bootstrap';

const ResumenRecintos = () => {

    return (
        <Row>
            <Col md={12}>
                <Card className="shadow">
                    <Card.Body>
                        <Card.Title className="text-center text-dark">Resumen de Recintos</Card.Title>
                        <Table bordered responsive className="table-sm">
                            <thead className="table-light">
                                <tr>
                                    <th>Recinto</th>
                                    <th>Perfil de Ocupación</th>
                                    <th>Superficie [m²]</th>
                                    <th>Demanda Total [kWh]</th>
                                    <th>Consumo Total [kWh/m²]</th>
                                    <th>CO2_eq [kg]</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>RECINTO 2</td>
                                    <td>Oficina</td>
                                    <td>50</td>
                                    <td>183.6</td>
                                    <td>3,005</td>
                                    <td>5,441</td>
                                </tr>
                                <tr>
                                    <td>Sub 1</td>
                                    <td>Sala Clase P</td>
                                    <td>130.2</td>
                                    <td>276.7</td>
                                    <td>3,134</td>
                                    <td>5,564</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ResumenRecintos;
