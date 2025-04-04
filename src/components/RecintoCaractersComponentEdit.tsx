// RecintoCaractersComponentEdit.tsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import TabMuroCreate from "@/components/tab_recint_create_edit/TabMuroCreate"; 
import TabWindowCreate from "@/components/tab_recint_create_edit/TabWindowCreate"; 
import TabFloorCreate from "@/components/tab_recint_create_edit/TabFloorCreate";
import TabRoofCreate from "@/components/tab_recint_create_edit/TabRoofCreate";
import TabDoorCreate from "@/components/tab_recint_create_edit/TabDoorCreate";
import TabObstructionsCreate from "@/components/tab_recint_create_edit/TabObstructionsCreate"; // Se importa el nuevo componente

type TabStep = "muros" | "ventanas" | "puertas" | "techumbre" | "pisos" | "obstrucciones"; // Se añade "obstrucciones"

const RecintoCaractersComponentEdit: React.FC = () => {
  const [tabStep, setTabStep] = useState<TabStep>("muros");

  const renderTabContent = () => {
    switch (tabStep) {
      case "muros":
        return <TabMuroCreate />;
      case "ventanas":
        return <TabWindowCreate />;
      case "puertas":
        return <TabDoorCreate />;
      case "techumbre":
        return <TabRoofCreate />;
      case "pisos":
        return <TabFloorCreate />;
      case "obstrucciones":
        return <TabObstructionsCreate />; // Renderiza el componente de obstrucciones
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
      <li className="nav-item">
        <button
          className={`nav-link ${tabStep === "obstrucciones" ? "active" : ""}`}
          onClick={() => setTabStep("obstrucciones")}
        >
          Obstrucciones
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

export default RecintoCaractersComponentEdit;
