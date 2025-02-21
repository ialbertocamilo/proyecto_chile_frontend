// src/components/InteractiveMap.tsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";

interface InteractiveMapProps {
  onLocationSelect: (latlng: { lat: number; lng: number }) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Configurar los íconos de Leaflet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    });
  }, []);

  // Componente interno para manejar el click en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng);
      },
    });
    return null;
  };

  // Centro inicial: lat -33.047237, lng -71.612686
  const initialCenter: LatLngExpression = [-33.047237, -71.612686];

  return (
    <MapContainer center={initialCenter} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler />
      {position && (
        <Marker position={[position.lat, position.lng]}>
          <Popup>
            Lat: {position.lat.toFixed(4)} <br /> Lon: {position.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default InteractiveMap;
