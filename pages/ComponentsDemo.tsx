import { useState } from 'react';
import Navbar from '../src/components/layout/Navbar';
import TopBar from '../src/components/layout/TopBar';
import Button from '../src/components/common/Button';
import Input from '../src/components/common/Input';
import Select from '../src/components/common/Select';
import Card from '../src/components/common/Card';
import RadioGroup from '../src/components/common/RadioGroup';
import Checkbox from '../src/components/common/Checkbox';
import DatePicker from '../src/components/common/DatePicker';
import Modal from '../src/components/common/Modal';
import Table from '../src/components/common/Table';
import Chart from '../src/components/common/Chart';
import StatsCard from '../src/components/common/StatsCard';
import SearchBar from '../src/components/common/SearchBar';
import Tooltip from '../src/components/common/Tooltip';
import Accordion from '../src/components/common/Accordion';
import Badge from '../src/components/common/Badge';

const ComponentsDemo = () => {
  const [selectedRadio, setSelectedRadio] = useState('');
  const [checked, setChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tableColumns = ['ID', 'Nombre', 'Estado'];
  const tableData = [
    { ID: 1, Nombre: 'Proyecto A', Estado: 'Activo' },
    { ID: 2, Nombre: 'Proyecto B', Estado: 'Pendiente' },
  ];

  const chartData = {
    labels: ['Enero', 'Febrero', 'Marzo'],
    datasets: [
      {
        label: 'Proyectos',
        data: [10, 20, 30],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={() => {}} setSidebarWidth={() => {}} />
      <div className="d-flex flex-column flex-grow-1">
        <TopBar sidebarWidth="250px" />
        <div className="container mt-4">
          <h2 className="fw-bold text-primary text-center mb-4">Demostración de Componentes</h2>

          {/* Input */}
          <h5 className="fw-bold">Input</h5>
          <Input
            label="Nombre del Proyecto"
            value={selectedRadio}
            onChange={(e) => setSelectedRadio(e.target.value)}
            placeholder="Ingrese el nombre"
          />

          {/* Select */}
          <h5 className="fw-bold mt-4">Select</h5>
          <Select
            label="Departamento"
            value={selectedRadio}
            onChange={(e) => setSelectedRadio(e.target.value)}
            options={[
              { value: 'dep1', label: 'Departamento 1' },
              { value: 'dep2', label: 'Departamento 2' },
            ]}
          />

          {/* RadioGroup */}
          <h5 className="fw-bold mt-4">RadioGroup</h5>
          <RadioGroup
            name="categoría"
            options={[
              { value: 'residencial', label: 'Residencial' },
              { value: 'comercial', label: 'Comercial' },
            ]}
            selectedValue={selectedRadio}
            onChange={setSelectedRadio}
          />

          {/* Checkbox */}
          <h5 className="fw-bold mt-4">Checkbox</h5>
          <Checkbox label="Acepto los términos" checked={checked} onChange={setChecked} />

          {/* DatePicker */}
          <h5 className="fw-bold mt-4">DatePicker</h5>
          <DatePicker label="Fecha de inicio" selectedDate={selectedDate} onChange={setSelectedDate} />

          {/* Modal */}
          <h5 className="fw-bold mt-4">Modal</h5>
          <Button text="Abrir Modal" onClick={() => setShowModal(true)} className="btn-primary" />
          <Modal title="Información" show={showModal} onClose={() => setShowModal(false)}>
            <p>Esta es una ventana modal de prueba.</p>
          </Modal>

          {/* Table */}
          <h5 className="fw-bold mt-4">Table</h5>
          <Table columns={tableColumns} data={tableData} />

          {/* Chart */}
          <h5 className="fw-bold mt-4">Chart</h5>
          <Chart title="Proyectos Mensuales" data={chartData} />

          {/* StatsCard */}
          <h5 className="fw-bold mt-4">StatsCard</h5>
          <StatsCard title="Proyectos Activos" value={150} icon="bi-clipboard-check" color="success" />

          {/* SearchBar */}
          <h5 className="fw-bold mt-4">SearchBar</h5>
          <SearchBar onSearch={(query) => setSearchQuery(query)} />

          {/* Tooltip */}
          <h5 className="fw-bold mt-4">Tooltip</h5>
          <Tooltip text="Información adicional sobre el botón">
            <Button text="Pasa el mouse" onClick={() => {}} className="btn-info" />
          </Tooltip>

          {/* Accordion */}
          <h5 className="fw-bold mt-4">Accordion</h5>
          <Accordion title="Detalles del Proyecto">
            <p>Información detallada sobre el proyecto seleccionado.</p>
          </Accordion>

          {/* Badge */}
          <h5 className="fw-bold mt-4">Badge</h5>
          <Badge text="Activo" type="success" />
          <Badge text="Pendiente" type="warning" />
          <Badge text="Rechazado" type="danger" />
        </div>
      </div>
    </div>
  );
};

export default ComponentsDemo;
