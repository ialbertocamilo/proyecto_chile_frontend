import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { constantUrlApiEndpoint } from "../../utils/constant-url-endpoint";

interface ScheduleData {
  [key: string]: number | string | null;
}

const ProfileSchedules: React.FC = () => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [typeSelect, setTypeSelect] = useState<string>('usuarios');
  const chartRef = useRef<any>(null);

  // Obtener perfilId del LocalStorage
  useEffect(() => {
    const storedId = localStorage.getItem("perfil_id");
    if (storedId) {
      setPerfilId(parseInt(storedId, 10));
    }
  }, []);

  // Cargar datos según perfilId y tipo seleccionado
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

  // Construir opción de la gráfica
  const hours = Array.from({ length: 24 }, (_, i) => `hour_${i + 1}`);
  const values = data ? hours.map(hour => data[hour] as number) : [];

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: hours,
      name: 'Horas'
    },
    yAxis: {
      type: 'value',
      name: 'Valor'
    },
    series: [
      {
        name: typeSelect,
        type: 'bar', // gráfica de barras verticales
        data: values,
      }
    ]
  };

  // Función para enviar la actualización mediante PUT
  const updateSchedule = async (newData: ScheduleData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${constantUrlApiEndpoint}/${typeSelect}/schedule-update/${perfilId}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData)
      });
      const result = await response.json();
      console.log("Actualización exitosa", result);
      // Actualizar estado con los nuevos datos
      setData(result);
    } catch (error) {
      console.error("Error actualizando datos", error);
    }
  };

  // Ejemplo de listener para capturar clic en una barra y modificar su valor
  const onChartReady = (chart: any) => {
    chart.on('click', function (params: any) {
      // params.dataIndex indica la barra clickeada
      const index = params.dataIndex;
      // Por ejemplo, pedir al usuario el nuevo valor (esto es muy básico, se puede reemplazar por un slider o input)
      const nuevoValor = prompt(`Ingresa el nuevo valor para ${hours[index]}:`, params.value);
      if (nuevoValor !== null) {
        // Actualizar los datos localmente
        const newValues = [...values];
        newValues[index] = Number(nuevoValor);
        const newData = { ...data };
        newData[hours[index]] = Number(nuevoValor);
        // Actualizar la gráfica
        chart.setOption({
          series: [{
            data: newValues
          }]
        });
        // Enviar los cambios al servidor
        updateSchedule(newData);
      }
    });
  };

  return (
    <div className="apache-container">
      <div className="d-flex justify-content-center mb-3">
      <select className="form-select form-select-lg text-center"
    style={{ maxWidth: "300px", textAlignLast: "center" // importante para centrar el texto dentro del <select>
      }}
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
    </div>
  );
};

export default ProfileSchedules;
