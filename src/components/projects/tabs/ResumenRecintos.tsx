import { EnergySystemSelection } from '@/types/energySystem';
import React, { useEffect, useState } from 'react';
import { Col, Nav, Row, Tab } from 'react-bootstrap';
import { useEnergySystems } from '../../../hooks/energy/useEnergySystems';
import CasoBaseTable from '../recinto/CasoBaseTable';
import EnergySystemSelectors, { ConfigState } from '../recinto/EnergySystemSelectors';
import TablaConsumos from '../recinto/TablaConsumos';
import TablaDemandas from '../recinto/TablaDemandas';
import TablaDisconfort from '../recinto/TablaDisconfort';
import TablaEmisiones from '../recinto/TablaEmisiones';


interface ResumenRecintosProps {
  globalResults: any;
  onCalculationsUpdate?: (data: any) => void;
  onUpdated?: (data: any) => void;
}

const ResumenRecintos: React.FC<ResumenRecintosProps> = ({ globalResults, onCalculationsUpdate, onUpdated }) => {
  const [config, setConfig] = useState<ConfigState>({
    energySystems: [],
    rendimientoCalef: [],
    distribucionHvac: [],
    controlHvac: [],
    rendimientoRef: [],
    consumosEnergia: []
  });

  const {
    calculatedRecintos,
    casoBaseRecintos,
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
  } = useEnergySystems({
    globalResults,
    onCalculationsUpdate
  });

  // Build configuration objects and update state
  useEffect(() => {
    const newConfig = {
      energySystems: energySystems.map(system => ({
        code: system.code,
        description: system.description || system.code
      })),
      rendimientoCalef: rendimientoCalef.map(system => ({
        code: system.code,
        description: system.description || system.code
      })),
      distribucionHvac: distribucionHvac.map(system => ({
        code: system.code,
        description: system.description || system.code
      })),
      controlHvac: controlHvac.map(system => ({
        code: system.code,
        description: system.description || system.code
      })),
      rendimientoRef: rendimientoRef.map(system => ({
        code: system.code,
        description: system.description || system.code
      })),
      consumosEnergia: []
    };
    setConfig(newConfig);
  }, [energySystems, rendimientoCalef, distribucionHvac, controlHvac, rendimientoRef]);

  // Ref for tracking previous signatures

  const [energyConfig, setEnergyConfig] = useState<EnergySystemSelection>({
    combustibleCalef: null,
    rendimiento: null,
    distribucion: null,
    control: null
  });


  const onUpdate = (recintos: any[]) => {

    onUpdated?.(recintos);
  }



  return (
    <div className="container-fluid mt-4">      <div className="col-12 mb-4">
      <EnergySystemSelectors
        onChange={(selection: EnergySystemSelection, consumosEnergia?: any[]) => {
          setEnergyConfig(selection);
          setConfig(prev => ({
            ...prev,
            consumosEnergia: consumosEnergia || []
          }));
        }}
      />
    </div>
      <div>
        <Tab.Container id="tabs-recintos" defaultActiveKey="demanda">
          <Row className="mb-5">
            <Col sm={12}>
              <Nav variant="pills" className="flex-row">
                <Nav.Item>
                  <Nav.Link className="nav-pill-info" eventKey="demanda">
                    Demanda
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="nav-pill-info" eventKey="consumo">
                    Consumo
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="nav-pill-info" eventKey="co2">
                    CO2_eq
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="disconfort" className="nav-pill-info">
                    Hrs Disconfort T° Libre
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="base" className="nav-pill-info">
                    Caso Base
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row className="gx-5 justify-content-between">
            <Col sm={12}>
              <Tab.Content>
                <Tab.Pane eventKey="demanda" className="overflow-x-scroll">
                  <TablaDemandas recintos={calculatedRecintos} />
                </Tab.Pane>
                <Tab.Pane eventKey="consumo" className="overflow-x-scroll">
                  <TablaConsumos
                    combustibleCalef={energyConfig.combustibleCalef}
                    config={{
                      recintos: calculatedRecintos,
                      ...config,
                      selectedEnergySystems,
                      selectedEnergySystemsRef,
                      selectedRendimientoCalef,
                      selectedDistribucionHvac,
                      selectedControlHvac,
                      selectedRendimientoRef,
                      selectedDistribucionHvacRef,
                      selectedControlHvacRef,
                      onEnergySystemChange: handleEnergySystemChange,
                      onEnergySystemRefChange: handleEnergySystemChangeRef,
                      onRendimientoCalefChange: handleRendimientoCalefChange,
                      onDistribucionHvacChange: handleDistribucionHvacChange,
                      onControlHvacChange: handleControlHvacChange,
                      onRendimientoRefChange: handleRendimientoRef,
                      onDistribucionHvacRefChange: handleDistribucionHvacRefChange,
                      onControlHvacRefChange: handleControlHvacRefChange
                    }}
                  />
                </Tab.Pane>                <Tab.Pane eventKey="co2" className="overflow-x-scroll">
                  <TablaEmisiones
                    recintos={calculatedRecintos}
                    combustibleCalef={energyConfig.combustibleCalef}
                    consumosEnergia={config.consumosEnergia}
                    onUpdate={onUpdate}
                  />
                </Tab.Pane>

                <Tab.Pane eventKey="disconfort" className="overflow-x-scroll">
                  <TablaDisconfort recintos={calculatedRecintos} />
                </Tab.Pane>                <Tab.Pane eventKey="base" className="overflow-x-scroll">
                  <CasoBaseTable
                    recintos={casoBaseRecintos}
                    combustibleCalef={energyConfig.combustibleCalef}
                    consumosEnergia={config.consumosEnergia}
                    onUpdate={onUpdate}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    </div>
  );
};

export default ResumenRecintos;
