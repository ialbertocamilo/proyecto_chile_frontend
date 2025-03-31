import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { constantUrlApiEndpoint } from "../../utils/constant-url-endpoint";

interface ScheduleData {
  [key: string]: number | string | null;
}

const ProfileSchedules: React.FC = () => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${constantUrlApiEndpoint}/usuarios/schedule/1`, {
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMCwiZXhwIjoxNzQzNTY2OTMwfQ.4AKMXCCToFTmfFui_ASqlDoutlrOZNIkDO-kGfQzoxM'
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

    fetchData();
  }, []);

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
          name: 'usuarios',
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
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <ReactECharts option={option} style={{ height: '390px', width: '498px' }} />
      )}
    </div>
  );
};

export default ProfileSchedules;
