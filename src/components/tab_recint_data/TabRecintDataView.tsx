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
}

interface OccupationProfile {
  id: number;
  code: string;
  name: string;
}

interface Region {
  id: number;
  nombre_region: string;
}

interface Comuna {
  id: number;
  zonas_termicas: string[];
  region_id: number;
  nombre_comuna: string;
  latitud: number;
  longitud: number;
}

const TabRecintDataView: React.FC = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? null : null;
  const [projectId, setProjectId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("project_id_view") : null
  );

  const [data, setData] = useState<EnclosureGeneralData[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [zonasTermicas, setZonasTermicas] = useState<string[]>([]);
  const [occupationProfiles, setOccupationProfiles] = useState<OccupationProfile[]>([]);

  useEffect(() => {
    if (!token || !projectId) return;

    const fetchAllData = async () => {
      try {
        const headers = {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [
          enclosureRes,
          regionesRes,
          comunasRes,
          zonasRes,
          profilesRes,
        ] = await Promise.all([
          fetch(`${constantUrlApiEndpoint}/enclosure-generals/${projectId}`, { headers }),
          fetch(`${constantUrlApiEndpoint}/regiones`, { headers }),
          fetch(`${constantUrlApiEndpoint}/comunas/4`, { headers }),
          fetch(`${constantUrlApiEndpoint}/zonas-termicas/24`, { headers }),
          fetch(`${constantUrlApiEndpoint}/user/enclosures-typing/`, { headers }),
        ]);

        if (enclosureRes.ok) {
          const enclosureData: EnclosureGeneralData[] = await enclosureRes.json();
          setData(enclosureData);
        }

        if (regionesRes.ok) {
          const regionesData: Region[] = await regionesRes.json();
          setRegiones(regionesData);
        } else {
          notify("Error al cargar las regiones");
        }

        if (comunasRes.ok) {
          const comunasData: Comuna[] = await comunasRes.json();
          setComunas(comunasData);
        } else {
          notify("Error al cargar las comunas");
        }

        if (zonasRes.ok) {
          const zonasData: string[] = await zonasRes.json();
          setZonasTermicas(zonasData);
        } else {
          notify("Error al cargar las zonas térmicas");
        }

        if (profilesRes.ok) {
          const profilesData: OccupationProfile[] = await profilesRes.json();
          setOccupationProfiles(profilesData);
        } else {
          notify("Error al cargar los perfiles de ocupación");
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        notify("Ocurrió un error al cargar los datos del proyecto");
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
      field: "occupation_profile_id",
      renderCell: (row: EnclosureGeneralData) =>
        occupationProfiles.find((p) => p.id === row.occupation_profile_id)?.name ||
        row.occupation_profile_id,
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
      field: "region_id",
      renderCell: (row: EnclosureGeneralData) =>
        regiones.find((r) => r.id === row.region_id)?.nombre_region || row.region_id,
    },
    {
      headerName: "Zona Térmica",
      field: "zona_termica",
      renderCell: (row: EnclosureGeneralData) => row.zona_termica,
    },
    {
      headerName: "Comuna",
      field: "comuna_id",
      renderCell: (row: EnclosureGeneralData) =>
        comunas.find((c) => c.id === row.comuna_id)?.nombre_comuna || row.comuna_id,
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
