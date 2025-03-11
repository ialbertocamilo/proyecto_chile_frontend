import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  onLocationSelect: (latlng: { lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect, initialLat, initialLng }) => {
  L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.7.1/dist/images/';
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Inicializar el mapa solo si no existe
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView(
        initialLat && initialLng ? [initialLat, initialLng] : [0, 0],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Manejar clics en el mapa
      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });

        // Eliminar marcador anterior si existe
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Agregar un nuevo marcador en la ubicación seleccionada
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!);
      });
    }

    // Actualizar la vista y el marcador si cambian las coordenadas iniciales
    if (mapRef.current && initialLat && initialLng) {
      mapRef.current.setView([initialLat, initialLng], 13);
      
      // Eliminar marcador anterior si existe
      if (markerRef.current) {
        markerRef.current.remove();
      }
      
      // Agregar un nuevo marcador
      markerRef.current = L.marker([initialLat, initialLng]).addTo(mapRef.current);
    }

    // Limpiar el mapa al desmontar el componente
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialLat, initialLng]); // Dependencias reducidas

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