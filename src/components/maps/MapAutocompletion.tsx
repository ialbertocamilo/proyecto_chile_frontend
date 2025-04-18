import axios from 'axios'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Autocompletion } from './Autocompletion'
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";

interface MapAutocompletionProps {
  formData: {
    latitude: number
    longitude: number
    address: string
    zone?: string
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

  // Nuevo efecto: geocodificación inversa para actualizar la dirección automáticamente
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      axios
        .get(`https://nominatim.openstreetmap.org/reverse`, {
          params: {
            format: "jsonv2",
            lat: formData.latitude,
            lon: formData.longitude,
          },
        })
        .then((response) => {
          const { display_name } = response.data;
          // Si la dirección obtenida es distinta de la almacenada, se actualiza.
          if (display_name && display_name !== formData.address) {
            handleFormInputChange("address", display_name);
            // Opcional: también puedes actualizar manualmente el textarea si es necesario
            const detailsTextArea = document.getElementById("locationDetails") as HTMLTextAreaElement;
            if (detailsTextArea) {
              detailsTextArea.value = `Dirección: ${display_name}`;
            }
          }
        })
        .catch((error) => {
          console.error("Error en la geocodificación inversa:", error);
        });
    }
  }, [formData.latitude, formData.longitude]);

  return (
    <div>
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
          {/* Se coloca el componente ZoneSelector justo debajo del recuadro de "Detalles de la ubicación" */}
          <div className="mt-3">
            <ZoneSelector 
              initialZone={formData.zone || ""}
              latitude={formData.latitude} 
              longitude={formData.longitude}
              handleFormInputChange={handleFormInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapAutocompletion;

interface Zone {
  id: number | string;
  zone: string;
}

interface ZoneSelectorProps {
  latitude: number;
  longitude: number;
  handleFormInputChange: (field: any, value: any) => void;
  initialZone?: string;
}

const ZoneSelector: React.FC<ZoneSelectorProps> = ({ latitude, longitude, handleFormInputChange, initialZone = "" }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>(initialZone);

  useEffect(() => {
    setSelectedZone(initialZone);
  }, [initialZone]);

  useEffect(() => {
    if (latitude && longitude) {
      axios
        .get(`${constantUrlApiEndpoint}/zones?latitude=${latitude}&longitude=${longitude}`)
        .then((response) => {
          setZones(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener las zonas:", error);
        });
    }
  }, [latitude, longitude]);

  return (
    <div>
      <label className="form-label">Zona</label>
      <select
        className="form-control"
        value={selectedZone}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedZone(value);
          handleFormInputChange("zone", value);
        }}
      >
        {zones.length > 0 ? (
          <>
            <option value="">Seleccione una zona</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.zone}>
                {zone.zone}
              </option>
            ))}
          </>
        ) : (
          <option value="">No hay datos para zona específica</option>
        )}
      </select>
    </div>
  );
};
