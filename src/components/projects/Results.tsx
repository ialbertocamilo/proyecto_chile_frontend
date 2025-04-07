import { Container, Tab, Tabs } from 'react-bootstrap';
import AguaCalienteSanitaria from './tabs/AguaCalienteSanitaria';
import IndicadoresFinales from './tabs/IndicadoresFinales';
import ResumenRecintos from './tabs/ResumenRecintos';

const Results = () => {
    return (
        <Container fluid className="py-4">
            <h2 className=" mb-4 mt-2 " >Resultados finales</h2>
            <br />
            <Tabs
                defaultActiveKey="acs"
                id="results-tabs"
                className="mb-4 custom-tabs"
                style={{
                    '--bs-nav-tabs-link-active-color': 'var(--primary-color)',
                    '--bs-nav-tabs-border-color': 'var(--primary-color)',
                    '--bs-nav-tabs-link-hover-color': 'var(--primary-color)',
                    '--bs-nav-tabs-link-hover-bg': '#f8f9fa',
                } as React.CSSProperties}
            >
                <Tab eventKey="acs" title="Agua Caliente Sanitaria">
                    <AguaCalienteSanitaria />
                </Tab>

                <Tab eventKey="recintos" title="Resumen de Recintos">
                    <ResumenRecintos />
                </Tab>
                <Tab eventKey="indicadores" title="Indicadores Finales">
                    <IndicadoresFinales />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default Results;
