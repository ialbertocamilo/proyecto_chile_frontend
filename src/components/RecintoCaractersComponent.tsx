// RecintoCaractersComponent.tsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import TabMuroCreate from "@/components/tab_recint_create/TabMuroCreate"; // Ajusta la ruta si es necesario
import TabWindowCreate from "@/components/tab_recint_create/TabWindowCreate"; // Componente para Ventanas
import TabWindowFAVCreate from "@/components/tab_recint_create/TabWindowFAVCreate"; // Componente para FAV

type TabStep = "muros" | "techumbre" | "pisos" | "ventanas" | "puertas";

const RecintoCaractersComponent: React.FC = () => {
  const [tabStep, setTabStep] = useState<TabStep>("muros");

  const renderTabContent = () => {
    switch (tabStep) {
      case "muros":
        return <TabMuroCreate />;
      case "ventanas":
        return (
          <div className="row">
            <div className="col-md-6">
              <TabWindowCreate />
            </div>
            <div className="col-md-6">
              <TabWindowFAVCreate />
            </div>
          </div>
        );
      case "techumbre":
        return <div className="p-3">Contenido de Techumbre pendiente de implementación.</div>;
      case "pisos":
        return <div className="p-3">Contenido de Pisos pendiente de implementación.</div>;
      case "puertas":
        return <div className="p-3">Contenido de Puertas pendiente de implementación.</div>;
      default:
        return null;
    }
  };

  const renderTabs = () => (
    <ul className="nav nav-tabs nav-fill">
      <li className="nav-item">
        <button
          className={`nav-link ${tabStep === "muros" ? "active" : ""}`}
          onClick={() => setTabStep("muros")}
        >
          Muros
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${tabStep === "ventanas" ? "active" : ""}`}
          onClick={() => setTabStep("ventanas")}
        >
          Ventanas
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${tabStep === "puertas" ? "active" : ""}`}
          onClick={() => setTabStep("puertas")}
        >
          Puertas
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${tabStep === "techumbre" ? "active" : ""}`}
          onClick={() => setTabStep("techumbre")}
        >
          Techumbre
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${tabStep === "pisos" ? "active" : ""}`}
          onClick={() => setTabStep("pisos")}
        >
          Pisos
        </button>
      </li>
    </ul>
  );

  return (
    <div className="container-fluid">
      {renderTabs()}
      <div className="mt-3">{renderTabContent()}</div>
    </div>
  );
};

export default RecintoCaractersComponent;
