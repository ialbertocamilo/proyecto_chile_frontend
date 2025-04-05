import { useApi } from "@/hooks/useApi";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { LocationSearchInput } from "./LocationSearchInput";

const ClimateFileUploader: React.FC = () => {
    const [uploadedCsvFiles, setUploadedCsvFiles] = useState<File[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [thermalZone, setThermalZone] = useState<string>("");
    const [weatherFiles, setWeatherFiles] = useState<any[]>([]);

    const { get } = useApi()
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

    const onDrop = (acceptedFiles: File[]) => {
        setUploadedCsvFiles([...uploadedCsvFiles, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"] },
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

        console.log('Uploading file:', file.name);
        console.log('Location:', selectedLocation.Position);
        console.log('Thermal zone:', thermalZone);
        try {
            const queryParams = new URLSearchParams({
            latitude: selectedLocation.Position[1],
            longitude: selectedLocation.Position[0],
            zone: thermalZone
            });

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${constantUrlApiEndpoint}/upload-by-coordinates?${queryParams}`, {
            method: "POST",
            body: formData,
            });

            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al subir el archivo.");
            }

            const result = await response.json();
            notify("Archivo subido exitosamente.");
            setWeatherFiles([...weatherFiles, result.metadata]);
        } catch (error: unknown) {
            console.error("Error uploading file:", error);
            if (error instanceof Error) {
                notify(error.message || "Error al subir el archivo.", "error");
            } else {
                notify("Error al subir el archivo.", "error");
            }
        }
    };

    return (
        <>
            <h4>Adjuntar archivo de procesamiento de clima</h4>
            <br />
            <div className="row mb-3">
                <div className="col-md-12">
                    <label>Buscar ubicación</label>
                    <LocationSearchInput
                        onSelectLocation={(location: any) => setSelectedLocation(location)}
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
                            ? `País: ${selectedLocation.Address.Country.Name}\nRegión: ${selectedLocation.Address.Region.Name}\nCiudad: ${selectedLocation.Address.Locality}\nDistrito: ${selectedLocation.Address.SubRegion?.Name || "No especificado"}\nLatitud: ${selectedLocation.Position[1]}\nLongitud: ${selectedLocation.Position[0]}`
                            : "No seleccionada"
                    }
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
                        const value = e.target.value.toUpperCase();
                        if (value.length <= 5) {
                            setThermalZone(value);
                        }
                    }}
                />
            </div>
            <div className="mb-3">
                <div
                    {...getRootProps()}
                    style={{ border: "2px dashed gray", padding: "20px", textAlign: "center" }}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? "Suelta aquí el archivo..." : "Arrastra o haz clic para subir CSV..."}
                </div>
            </div>
            <div>
                {uploadedCsvFiles.map((file, index) => (
                    <div key={index}>
                        <strong>{file.name}</strong>
                        <br />
                        <button
                            className="btn btn-primary btn-sm ml-2"
                            onClick={() => uploadFile(file)}
                        >
                            Subir
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <h4>Archivos Meteorológicos Subidos</h4>
                <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>País</th>
                                <th>Ciudad</th>
                                <th>Distrito</th>
                                <th>Zona</th>
                                <th>Fecha de Creación</th>
                                <th>Tamaño (KB)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weatherFiles.map((file) => (
                                <tr key={file.id}>
                                    <td>{file.name}</td>
                                    <td>{file.country}</td>
                                    <td>{file.city}</td>
                                    <td>{file.district}</td>
                                    <td>{file.zone}</td>
                                    <td>{new Date(file.created_at).toLocaleDateString()}</td>
                                    <td>{(file.file_size / 1024).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ClimateFileUploader;
