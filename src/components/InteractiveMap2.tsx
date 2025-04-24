import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef } from "react";

interface InteractiveMapProps {
  initialLat?: number;
  initialLng?: number;
}

const InteractiveMap2: React.FC<InteractiveMapProps> = ({
  initialLat = -16.419167000391106,
  initialLng = -71.52432686007376,
}) => {
  L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.7.1/dist/images/";
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const zoomRef = useRef<number>(13);

  useEffect(() => {
    let map2 = L.map("map2").setView([initialLat, initialLng], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map2);

    let marker = L.marker([-16.419167000391106, -71.52432686007376], {
      draggable: true,
      autoPan: true,
    }).addTo(map2);
  }, []);

  return (
    <div
      id="map2"
      style={{
        height: "400px",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    ></div>
  );
};

export default InteractiveMap2;
