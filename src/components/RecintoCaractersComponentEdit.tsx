// RecintoCaractersComponent.tsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import TabMuroCreate from "@/components/tab_recint_create_edit/TabMuroCreate"; 
import TabWindowCreate from "@/components/tab_recint_create_edit/TabWindowCreate"; 
import TabFloorCreate from "@/components/tab_recint_create_edit/TabFloorCreate";
import TabRoofCreate from "@/components/tab_recint_create_edit/TabRoofCreate";
import TabDoorCreate from "@/components/tab_recint_create_edit/TabDoorCreate";


type TabStep = "muros" | "techumbre" | "pisos" | "ventanas" | "puertas";

const RecintoCaractersComponent: React.FC = () => {
  const [tabStep, setTabStep] = useState<TabStep>("muros");

  const renderTabContent = () => {
    switch (tabStep) {
      case "muros":
        return <TabMuroCreate />;
      case "ventanas":
        return <TabWindowCreate />;
      case "techumbre":
        return <TabRoofCreate />;
      case "pisos":
        return <TabFloorCreate />;
      case "puertas":
        return <TabDoorCreate />; default:
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
