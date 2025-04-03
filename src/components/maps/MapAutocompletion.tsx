

import axios from 'axios'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Autocompletion } from './Autocompletion'

interface MapAutocompletionProps {
    formData: {
        latitude: number
        longitude: number
        address: string
    }
    handleFormInputChange: (field: any, value: any) => void
}

const NoSSRInteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
    ssr: false,
});

export const MapAutocompletion: React.FC<MapAutocompletionProps> = ({ formData, handleFormInputChange }) => {
    const [locationSearch, setLocationSearch] = useState('')

    const [completionList, setCompletionList] = useState<{
        Title: string;
        Position: [number, number];
    }[]>([]);

    useEffect(() => {
        if (!locationSearch.trim()) return;

        const delaySearch = setTimeout(() => {
            console.log("Buscando ubicación:", locationSearch);
            axios
                .get(`/api/map?q=${locationSearch}&lat=${formData.latitude}&long=${formData.longitude}`)
                .then((response) => {
                    const { data } = response;
                    console.log("Respuesta de ubicación", data.results.ResultItems);
                    setCompletionList(data.results.ResultItems);
                })
                .catch((error) => {
                    console.error("Error al buscar la ubicación:", error);
                });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [locationSearch, formData.latitude, formData.longitude]);

    return (
        <div className="row">
            <div className="col-12 mb-3">
                <Autocompletion
                    locationSearch={locationSearch}
                    setLocationSearch={setLocationSearch}
                    completionList={completionList}
                    handleFormInputChange={handleFormInputChange}
                    setCompletionList={setCompletionList}
                />
            </div>
            <div className="col-12 col-md-8 mb-3">
                <NoSSRInteractiveMap
                    onLocationSelect={(latlng) => {
                        handleFormInputChange("latitude", latlng.lat);
                        handleFormInputChange("longitude", latlng.lng);
                    }}
                    initialLat={formData.latitude}
                    initialLng={formData.longitude}
                    onLocationDetails={(locationDetails) => {
                        console.log("Detalles de la ubicación:", locationDetails);
                        const details = [
                            `Dirección: ${locationDetails?.Label || "N/A"}`,
                        ].join("\n");
                        handleFormInputChange("address", details);
                        const detailsTextArea = document.getElementById("locationDetails") as HTMLTextAreaElement;
                        if (detailsTextArea) {
                            detailsTextArea.value = details;
                        }
                    }}
                />
            </div>
            <div className="col-12 col-md-4">
                <label
                    className="form-label"
                    style={{
                        width: "100%",
                        marginBottom: "8px"
                    }}
                >
                    Datos de ubicaciones encontradas
                </label>
                <textarea
                    className="form-control mb-3"
                    rows={2}
                    value={`Latitud: ${formData.latitude}, Longitud: ${formData.longitude}`}
                    readOnly
                    style={{
                        width: "100%",
                        resize: "none"
                    }}
                />
                <label className="form-label">Detalles de la ubicación</label>
                <textarea
                    id="locationDetails"
                    className="form-control"
                    rows={6}
                    readOnly
                    value={formData.address}
                    style={{
                        width: "100%",
                        resize: "none"
                    }}
                />
            </div>
        </div>
    )
}

export default MapAutocompletion