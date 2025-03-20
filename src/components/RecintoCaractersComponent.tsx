// RecintoCaractersComponent.tsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { notify } from "@/utils/notify";

type TabStep = "muros" | "techumbre" | "pisos";

const RecintoCaractersComponent: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");
  const [tabStep, setTabStep] = useState<TabStep>("muros");

  // Obtiene el valor de la variable CSS --primary-color
  useEffect(() => {
    const value =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim()
        : "#3ca7b7";
    setPrimaryColor(value || "#3ca7b7");
  }, []);

  // Renderiza el contenido de cada pestaña (actualmente con un placeholder)
  const renderTabContent = () => {
    switch (tabStep) {
      case "muros":
        return <div style={{ padding: "20px" }}>Contenido de Muros pendiente de implementación.</div>;
      case "techumbre":
        return <div style={{ padding: "20px" }}>Contenido de Techumbre pendiente de implementación.</div>;
      case "pisos":
        return <div style={{ padding: "20px" }}>Contenido de Pisos pendiente de implementación.</div>;
      default:
        return null;
    }
  };

  // Renderiza la interfaz de pestañas
  const renderTabs = () => (
    <div>
      <ul
        className="nav"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 0,
          listStyle: "none",
        }}
      >
        {[
          { key: "muros", label: "Muros" },
          { key: "techumbre", label: "Techumbre" },
          { key: "pisos", label: "Pisos" },
        ].map((item) => (
          <li key={item.key} style={{ flex: 1, minWidth: "100px" }}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#fff",
                color: tabStep === item.key ? primaryColor : "var(--secondary-color)",
                border: "none",
                cursor: "pointer",
                borderBottom: tabStep === item.key ? `3px solid ${primaryColor}` : "none",
                fontFamily: "var(--font-family-base)",
                fontWeight: "normal",
              }}
              onClick={() => setTabStep(item.key as TabStep)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ minHeight: "400px", overflowY: "auto", position: "relative", marginTop: "20px" }}>
        {renderTabContent()}
      </div>
    </div>
  );

  return (
    <div className="recinto-caracters-container" style={{ padding: "20px" }}>
      {renderTabs()}
    </div>
  );
};

export default RecintoCaractersComponent;
