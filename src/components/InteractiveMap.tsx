import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  onLocationSelect: (latlng: { lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect, initialLat, initialLng }) => {
  L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.7.1/dist/images/';

  useEffect(() => {
    // Inicializar el mapa
    const leafletMap = L.map("map").setView(
      initialLat && initialLng ? [initialLat, initialLng] : [0, 0],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(leafletMap);

    // Agregar un marcador si hay una ubicación inicial
    if (initialLat && initialLng) {
      L.marker([initialLat, initialLng]).addTo(leafletMap);
    }

    // Manejar clics en el mapa
    leafletMap.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });

      // Agregar un marcador en la ubicación seleccionada
      L.marker([lat, lng]).addTo(leafletMap);
    });

    

    // Limpiar el mapa al desmontar el componente
    return () => {
      leafletMap.remove();
    };
  }, [onLocationSelect, initialLat, initialLng]);

  return (
    <div
      id="map"
      style={{
        height: "400px", // Ajusta la altura del mapa
        width: "80%",   // Ajusta el ancho del mapa
        borderRadius: "20px", // Bordes circulares
        overflow: "hidden", // Asegura que el contenido del mapa no sobresalga de los bordes
        marginTop: "20px"
      }}
    ></div>
  );
};

export default InteractiveMap;