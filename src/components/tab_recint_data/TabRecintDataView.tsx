import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "@/components/common/CustomButton";
import ModalCreate from "@/components/common/ModalCreate";
import { notify } from "@/utils/notify";

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

const TabEnclosureGenerals: React.FC = () => {
  const router = useRouter();
  const projectId = localStorage.getItem("project_id_view") || "44";
  const token = localStorage.getItem("token") || "";

  // Estados para la tabla principal
  const [data, setData] = useState<EnclosureGeneralData[]>([]);

  // Estados para regiones, comunas, zonas térmicas
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [zonasTermicas, setZonasTermicas] = useState<string[]>([]);

  // Estado para los perfiles de ocupación
  const [occupationProfiles, setOccupationProfiles] = useState<OccupationProfile[]>([]);

  // Estados para edición en la tabla
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Omit<EnclosureGeneralData, "id">>({
    occupation_profile_id: 0,
    height: 0,
    co2_sensor: "",
    project_id: Number(projectId),
    region_id: 0,
    zona_termica: "",
    name_enclosure: "",
    comuna_id: 0,
  });

  // ===========================================================
  // 1. Funciones para fetch de datos
  // ===========================================================
  const fetchEnclosureGenerals = async () => {
    try {
      const url = `https://ceela-backend.svgdev.tech/enclosure-generals/${projectId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener datos de enclosure-generals");
      const responseData: EnclosureGeneralData[] = await response.json();
      setData(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar los datos");
    }
  };

  const fetchRegiones = async () => {
    try {
      const url = "https://ceela-backend.svgdev.tech/regiones";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener regiones");
      const responseData: Region[] = await response.json();
      setRegiones(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar las regiones");
    }
  };

  const fetchComunas = async () => {
    try {
      const url = "https://ceela-backend.svgdev.tech/comunas/4";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener comunas");
      const responseData: Comuna[] = await response.json();
      setComunas(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar las comunas");
    }
  };

  const fetchZonasTermicas = async () => {
    try {
      const url = "https://ceela-backend.svgdev.tech/zonas-termicas/24";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener zonas térmicas");
      const responseData: string[] = await response.json();
      setZonasTermicas(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar las zonas térmicas");
    }
  };

  const fetchOccupationProfiles = async () => {
    try {
      const url = "https://ceela-backend.svgdev.tech/user/enclosures-typing/";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener los perfiles de ocupación");
      const responseData: OccupationProfile[] = await response.json();
      setOccupationProfiles(responseData);
    } catch (error) {
      console.error(error);
      notify("Error al cargar los perfiles de ocupación");
    }
  };

  // ===========================================================
  // 2. useEffect para cargar los datos al inicio
  // ===========================================================
  useEffect(() => {
    fetchEnclosureGenerals();
    fetchRegiones();
    fetchComunas();
    fetchZonasTermicas();
    fetchOccupationProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================================================
  // (Se omiten las funciones relacionadas con el botón "Acciones")
  // ===========================================================

  // ===========================================================
  // 6. Definición de columnas para la tabla
  // ===========================================================
  const columns = [
    {
      headerName: "ID",
      field: "id",
      renderCell: (row: EnclosureGeneralData) => row.id,
    },
    {
      headerName: "Nombre Recinto",
      field: "name_enclosure",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <input
            type="text"
            className="form-control"
            value={editingValues.name_enclosure}
            onChange={(e) =>
              setEditingValues({ ...editingValues, name_enclosure: e.target.value })
            }
          />
        ) : (
          row.name_enclosure
        ),
    },
    {
      headerName: "Perfil Ocupación",
      field: "occupation_profile_id",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.occupation_profile_id}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                occupation_profile_id: Number(e.target.value),
              })
            }
          >
            <option value="">Seleccione perfil</option>
            {occupationProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        ) : (
          occupationProfiles.find((p) => p.id === row.occupation_profile_id)?.name ||
          row.occupation_profile_id
        ),
    },
    {
      headerName: "Altura (m)",
      field: "height",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <input
            type="number"
            className="form-control"
            value={editingValues.height}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                height: Number(e.target.value),
              })
            }
          />
        ) : (
          row.height
        ),
    },
    {
      headerName: "Sensor CO2",
      field: "co2_sensor",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.co2_sensor}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                co2_sensor: e.target.value,
              })
            }
          >
            <option value="">Seleccione</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        ) : (
          row.co2_sensor
        ),
    },
    {
      headerName: "Región",
      field: "region_id",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.region_id}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                region_id: Number(e.target.value),
              })
            }
          >
            <option value="">Seleccione región</option>
            {regiones.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nombre_region}
              </option>
            ))}
          </select>
        ) : (
          regiones.find((r) => r.id === row.region_id)?.nombre_region || row.region_id
        ),
    },
    {
      headerName: "Zona Térmica",
      field: "zona_termica",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.zona_termica}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                zona_termica: e.target.value,
              })
            }
          >
            <option value="">Seleccione zona</option>
            {zonasTermicas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        ) : (
          row.zona_termica
        ),
    },
    {
      headerName: "Comuna",
      field: "comuna_id",
      renderCell: (row: EnclosureGeneralData) =>
        editingRowId === row.id ? (
          <select
            className="form-control"
            value={editingValues.comuna_id}
            onChange={(e) =>
              setEditingValues({
                ...editingValues,
                comuna_id: Number(e.target.value),
              })
            }
          >
            <option value="">Seleccione comuna</option>
            {comunas.map((comuna) => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.nombre_comuna}
              </option>
            ))}
          </select>
        ) : (
          comunas.find((c) => c.id === row.comuna_id)?.nombre_comuna || row.comuna_id
        ),
    },
    // Se elimina la columna "Acciones"
  ];

  return (
    <div>
      {/* Se elimina el botón "+ Nuevo" */}

      {/* Tabla de datos */}
      <TablesParameters columns={columns} data={data} />

      {/* Se elimina el Modal de confirmación para eliminar */}
    </div>
  );
};

export default TabEnclosureGenerals;
