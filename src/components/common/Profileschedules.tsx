import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { constantUrlApiEndpoint } from "../../utils/constant-url-endpoint";

interface ScheduleData {
  [key: string]: number | string | null;
}

interface ProfileSchedulesProps {
  type?: string;
}

const ProfileSchedules: React.FC<ProfileSchedulesProps> = () => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [typeSelect, setTypeSelect] = useState<string>('usuarios');

  // Obtener el perfil_id desde el LocalStorage
  useEffect(() => {
    const storedId = localStorage.getItem("perfil_id");
    if (storedId) {
      setPerfilId(parseInt(storedId, 10));
    }
  }, []);

  // Cargar datos cuando ya tengamos el perfilId y el valor del select
  useEffect(() => {
    if (perfilId === null) return; // Espera a obtener el perfilId

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

    // Opcionalmente, puedes poner un setLoading(true) aquí para mostrar el loader cada vez que cambie el select
    setLoading(true);
    fetchData();
  }, [typeSelect, perfilId]);

  // Procesamos los datos para generar el array de horas (de hour_1 a hour_24) y sus valores.
  let option = {};
  if (data) {
    const hours = Array.from({ length: 24 }, (_, i) => `hour_${i + 1}`);
    const values = hours.map(hour => data[hour]);

    option = {
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
          type: 'line',
          data: values,
          smooth: true,
          lineStyle: {
            type: 'dotted'
          }
        }
      ]
    };
  }

  return (
    <div className="apache-container" id="dotted">
      <div style={{ marginBottom: '1rem' }}>
        <select value={typeSelect} onChange={(e) => setTypeSelect(e.target.value)}>
          <option value="usuarios">usuarios</option>
          <option value="iluminacion verano">iluminacion verano</option>
          <option value="iluminacion invierno">iluminacion invierno</option>
          <option value="equipos">equipos</option>
        </select>
      </div>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <ReactECharts option={option} style={{ height: '390px', width: '498px' }} />
      )}
    </div>
  );
};

export default ProfileSchedules;
