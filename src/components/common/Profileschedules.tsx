import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState } from 'react';
import { constantUrlApiEndpoint } from "../../utils/constant-url-endpoint";
import ModalCreate from './ModalCreate'; // Asegúrate de ajustar la ruta si es necesario

interface ScheduleData {
  [key: string]: number | string | null;
}

const ProfileSchedules: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [typeSelect, setTypeSelect] = useState<string>('usuarios');
  const chartRef = useRef<any>(null);

  // Estados para el modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<number>(0);

  useEffect(() => {
    const storedId = localStorage.getItem("perfil_id");
    if (storedId) {
      setPerfilId(parseInt(storedId, 10));
    }
  }, []);

  useEffect(() => {
    if (perfilId === null) return;

    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        const response = await fetch(`${constantUrlApiEndpoint}/${typeSelect}/schedule/${perfilId}`, {
          headers: {
            'accept': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [typeSelect, perfilId]);

  // Definimos el eje X como números del 1 al 24
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1).toString());
  const values = data ? hours.map((_, i) => data[`hour_${i + 1}`] ?? 0) : [];

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: hours, name: 'Horas' },
    yAxis: { type: 'value', name: 'Horas de uso', axisLabel: { formatter: '{value}%' } },
    series: [{
      name: typeSelect,
      type: 'bar',
      data: values,
      barMinHeight: 10,
      itemStyle: { color: '#2ab0c5', borderRadius: [10, 10, 0, 0] }
    }]
  };

  const updateSchedule = async (newData: ScheduleData) => {
    const token = localStorage.getItem("token");
    try {
      // Ejecuta la petición PUT y espera su respuesta
      const putResponse = await fetch(`${constantUrlApiEndpoint}/${typeSelect}/schedule-update/${perfilId}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData)
      });
  
      console.log("PUT response:", putResponse);
      
      if (!putResponse.ok) {
        console.error("Error en el PUT:", putResponse.status, putResponse.statusText);
        return;
      }
  
      // Si el PUT fue exitoso, se procede a hacer la petición GET para traer los datos actualizados
      const response = await fetch(`${constantUrlApiEndpoint}/${typeSelect}/schedule/${perfilId}`, {
        headers: {
          'accept': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      const updatedResult = await response.json();
      console.log("Datos actualizados", updatedResult);
      setData(updatedResult);
      // Llamamos al callback onUpdate si está definido
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error actualizando datos", error);
    }
  };

  const onChartReady = (chart: any) => {
    chart.on('click', function (params: any) {
      const index = params.dataIndex;
      setCurrentHourIndex(index);
      setCurrentValue(params.value);
      setInputValue(params.value); // Inicializamos el input con el valor actual
      setShowModal(true);
    });
  };

  const handleModalConfirm = () => {
    if (currentHourIndex === null) return;
  
    // Construir el objeto completo usando los valores actuales de 'data' o 0 por defecto.
    const completeSchedule: ScheduleData = {};
    for (let i = 1; i <= 24; i++) {
      completeSchedule[`hour_${i}`] = data && data[`hour_${i}`] !== undefined ? data[`hour_${i}`] as number : 0;
    }
    // Sobrescribir la hora modificada con el nuevo valor.
    completeSchedule[`hour_${currentHourIndex + 1}`] = inputValue;
    
    // Verifica en consola que completeSchedule tenga los valores esperados
    console.log("completeSchedule:", completeSchedule);
    
    // Actualiza el gráfico con el nuevo valor
    const newValues = [...values];
    newValues[currentHourIndex] = inputValue;
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      chartInstance.setOption({
        series: [{
          data: newValues
        }]
      });
    }
  
    // Envía el objeto completo al servidor
    updateSchedule(completeSchedule);
  
    setShowModal(false);
    setCurrentHourIndex(null);
    setCurrentValue(null);
  };
  

  return (
    <div className="apache-container">
      <div className="d-flex justify-content-center mb-3">
        <select
          className="form-select form-select-lg text-center"
          style={{ maxWidth: "300px", textAlignLast: "center" }}
          value={typeSelect}
          onChange={(e) => setTypeSelect(e.target.value)}
        >
          <option value="usuarios">Usuarios</option>
          <option value="iluminacion verano">Iluminacion verano</option>
          <option value="iluminacion invierno">Iluminacion invierno</option>
          <option value="equipos">Equipos</option>
        </select>
      </div>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: "100%", width: "100%", minHeight: "400px" }}
          onChartReady={onChartReady}
        />
      )}
      {showModal && (
        <ModalCreate 
          isOpen={showModal}
          initialValue={currentValue}
          onSave={handleModalConfirm}
          onClose={() => {
            setShowModal(false);
            setCurrentHourIndex(null);
            setCurrentValue(null);
          }}
        >
          <div className="container d-flex flex-column align-items-center space-y-4">
            <label 
              htmlFor="valueInput" 
              className="text-lg font-medium text-gray-800 text-center"
            >
              Ingrese el nuevo valor:
            </label>
            <br />
            <div className="d-flex align-items-center">
              <input
                id="valueInput"
                type="number"
                min="0"
                max="100"
                className="border border-gray-300 rounded p-2 text-gray-800 text-center"
                value={inputValue}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  // Si el valor supera 100, se limita a 100
                  if (value > 100) {
                    setInputValue(100);
                  } else {
                    setInputValue(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />
              <span style={{ marginLeft: '10px' }}>%</span>
            </div>
          </div>
        </ModalCreate>
      )}
    </div>
  );
};

export default ProfileSchedules;
