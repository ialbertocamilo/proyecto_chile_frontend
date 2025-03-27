import React, { useEffect, useState } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";

interface EnclosureGeneralData {
  id: number;
  occupation_profile_id: number;
  height: number;
  co2_sensor: string;
  project_id: number;
  region_id: number;
  zona_termica: string;
  name_enclosure: string;
  comuna_id: number;
  nombre_comuna: string;
  nombre_region: string;
  usage_profile_name: string;
}

const TabRecintDataView: React.FC = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? null : null;
  const [projectId, setProjectId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("project_id_view") : null
  );

  const [data, setData] = useState<EnclosureGeneralData[]>([]);

  useEffect(() => {
    if (!token || !projectId) return;

    const fetchAllData = async () => {
      try {
        const headers = {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const enclosureRes = await fetch(
          `${constantUrlApiEndpoint}/enclosure-generals/${projectId}`,
          { headers }
        );

        if (enclosureRes.ok) {
          const enclosureData: EnclosureGeneralData[] = await enclosureRes.json();
          setData(enclosureData);
        } 
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchAllData();
  }, [projectId, token]);

  const columns = [
    {
      headerName: "ID",
      field: "id",
      renderCell: (row: EnclosureGeneralData) => row.id,
    },
    {
      headerName: "Nombre Recinto",
      field: "name_enclosure",
      renderCell: (row: EnclosureGeneralData) => row.name_enclosure,
    },
    {
      headerName: "Perfil Ocupación",
      field: "usage_profile_name",
      renderCell: (row: EnclosureGeneralData) => row.usage_profile_name,
    },
    {
      headerName: "Altura (m)",
      field: "height",
      renderCell: (row: EnclosureGeneralData) => row.height,
    },
    {
      headerName: "Sensor CO2",
      field: "co2_sensor",
      renderCell: (row: EnclosureGeneralData) => row.co2_sensor,
    },
    {
      headerName: "Región",
      field: "nombre_region",
      renderCell: (row: EnclosureGeneralData) => row.nombre_region, // Mostrar el nombre de la región
    },
    {
      headerName: "Comuna",
      field: "nombre_comuna",
      renderCell: (row: EnclosureGeneralData) => row.nombre_comuna, // Mostrar el nombre de la comuna
    },
    {
      headerName: "Zona Térmica",
      field: "zona_termica",
      renderCell: (row: EnclosureGeneralData) => row.zona_termica,
    },
  ];

  return (
    <div>
      {data.length === 0 ? (
        <p>No se encontraron datos</p>
      ) : (
        <TablesParameters columns={columns} data={data} />
      )}
    </div>
  );
};

export default TabRecintDataView;
