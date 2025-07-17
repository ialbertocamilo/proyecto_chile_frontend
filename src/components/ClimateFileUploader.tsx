import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import React, { useEffect, useState, useMemo } from "react";
import { find } from "geo-tz";
import { useDropzone } from "react-dropzone";
import { LocationSearchInput } from "./LocationSearchInput";
import CustomButton from "./common/CustomButton";
import SearchParameters from "./SearchParameters";
import TablesParameters from "@/components/tables/TablesParameters";

const ClimateFileUploader: React.FC = () => {
  
  const [uploadedCsvFiles, setUploadedCsvFiles] = useState<File[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [stationName, setStationName] = useState("");
  const [thermalZone, setThermalZone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [weatherFiles, setWeatherFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);

  const { get, post } = useApi();

  useEffect(() => {
    const fetchWeatherFiles = async () => {
      try {
        const data = await get("/list");
        setWeatherFiles(data);
      } catch (error) {
        console.error("Error fetching weather files:", error);
      }
    };
    fetchWeatherFiles();
  }, []);

  useEffect(() => setFilteredFiles(weatherFiles), [weatherFiles]);

  useEffect(() => {
    if (selectedLocation) {
      const [lon, lat] = selectedLocation.Position;
      const tzArray = find(lat, lon);
      if (tzArray.length > 0) {
        const tz = tzArray[0];
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            timeZoneName: "longOffset",
          });
          const parts = formatter.formatToParts(new Date());
          const timeZoneNamePart = parts.find(
            (part) => part.type === "timeZoneName"
          );
          if (timeZoneNamePart) {
            const gmtString = timeZoneNamePart.value;
            const formattedUtc = gmtString
              .replace("GMT", "UTC")
              .replace(/([+-])/, " $1 ");
            setTimezone(`${tz} (${formattedUtc})`);
          } else {
            setTimezone(tz);
          }
        } catch (error) {
          console.error("Error formatting timezone:", error);
          setTimezone(tzArray.join(", "));
        }
      } else {
        setTimezone("No se encontró zona horaria");
      }
    } else {
      setTimezone("");
    }
  }, [selectedLocation]);

  
  const handleSearch = (searchTerm: string) => {
    const q = searchTerm.toLowerCase();
    const filtered = weatherFiles.filter(
      (f) =>
        f.country.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.zone.toLowerCase().includes(q)
    );
    setFilteredFiles(filtered);
  };

  
  const onDrop = (files: File[]) => setUploadedCsvFiles(files.slice(0, 1));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxSize: 50 * 1024 * 1024,
  });

  
  const uploadFile = async (file: File) => {
    if (!selectedLocation) {
      notify("Debe seleccionar una ubicación antes de subir el archivo.", "error");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("latitude", selectedLocation.Position[1]);
    formData.append("longitude", selectedLocation.Position[0]);
    formData.append("zone", thermalZone);

    try {
      const query = new URLSearchParams({
        latitude: selectedLocation.Position[1],
        longitude: selectedLocation.Position[0],
        zone: thermalZone,
      });
      const res = await post(`/upload-by-coordinates?${query}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res) throw new Error("Error al subir el archivo.");
      notify("Archivo subido exitosamente.");
      setWeatherFiles((prev) => [...prev, res.metadata]);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      notify(error?.response?.data?.detail || "Error al subir el archivo.", "error");
    }
  };

  
  const columns = useMemo(
    () => [
      { headerName: "Nombre", field: "name" },
      { headerName: "País", field: "country" },
      { headerName: "Ciudad", field: "city" },
      { headerName: "Distrito", field: "district" },
      { headerName: "Zona", field: "zone" },
      {
        headerName: "Fecha de Creación",
        field: "created_at",
        renderCell: (row: any) => new Date(row.created_at).toLocaleDateString(),
      },
      {
        headerName: "Año",
        field: "year",
        renderCell: (row: any) => new Date(row.created_at).getFullYear(),
      },
      {
        headerName: "Tamaño (KB)",
        field: "file_size",
        renderCell: (row: any) => (row.file_size / 1024).toFixed(2),
      },
    ],
    []
  );

  
  return (
    <>
      <h4>Adjuntar archivo de procesamiento de clima</h4>
      <br />

      
      <div className="row mb-3">
        <div className="col-md-12">
          <label>Buscar ubicación</label>
          <LocationSearchInput
            onSelectLocation={(loc: any) => setSelectedLocation(loc)}
          />
        </div>
      </div>

      
      <div className="mb-3">
        <label>Detalles de la ubicación seleccionada:</label>
        <textarea
          className="form-control"
          rows={4}
          readOnly
          value={
            selectedLocation
              ? `País: ${selectedLocation.Address.Country.Name}
Región: ${selectedLocation.Address.Region.Name}
Ciudad: ${selectedLocation.Address.Locality}
Distrito: ${selectedLocation.Address.SubRegion?.Name || "No especificado"}
Latitud: ${selectedLocation.Position[1]}
Longitud: ${selectedLocation.Position[0]}`
              : "No seleccionada"
          }
        />
      </div>

      
      <div className="mb-3">
        <label>Zona Horaria (TZ):</label>
        <input
          type="text"
          className="form-control"
          style={{ opacity: 0.4 }}
          readOnly
          value={timezone || "Calculando..."}
        />
      </div>

      
      <div className="mb-3">
        <label>Zona Térmica:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ingrese la zona térmica"
          value={thermalZone}
          onChange={(e) => {
            const v = e.target.value.toUpperCase();
            if (v.length <= 5) setThermalZone(v);
          }}
        />
      </div>

      
      <div className="mb-3">
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed gray",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive
            ? "Suelta aquí el archivo..."
            : "Arrastra o haz clic para subir archivo excel..."}
        </div>
      </div>

      
      <div>
        {uploadedCsvFiles.map((file, i) => (
          <div key={i} className="d-flex justify-content-end">
            <strong className="me-3 align-self-center">{file.name}</strong>
            <CustomButton
              className="btn-table-list"
              onClick={() => uploadFile(file)}
              title="Subir archivo"
            >
              <span className="material-icons" style={{ fontSize: "24px" }}>
                upload_file
              </span>{" "}
              Subir archivo
            </CustomButton>
          </div>
        ))}
      </div>

      
      <div className="mt-4">
        <h4>Listado de archivos clima</h4>
        <SearchParameters onSearch={handleSearch} />

        <div className="table-responsive">
          <TablesParameters data={filteredFiles} columns={columns} />
        </div>
      </div>
    </>
  );
};

export default ClimateFileUploader;
