import React, { useState } from "react";
import CustomButton from "../common/CustomButton";

interface Step4TabsProps {
  showTabsInStep4: boolean;
}
type TabStep4 =
  | "detalles"
  | "muros"
  | "techumbre"
  | "pisos"
  | "ventanas"
  | "puertas";

const Step4Tabs: React.FC<Step4TabsProps> = (props) => {
  const [tabStep4, setTabStep4] = useState<TabStep4>("muros");
  const [primaryColor, setPrimaryColor] = useState("#3ca7b7");

  if (!props.showTabsInStep4) return null;

  const tabs = [
    { key: "muros", label: "Muros" },
    { key: "techumbre", label: "Techumbre" },
    { key: "pisos", label: "Pisos" },
    { key: "ventanas", label: "Ventanas" },
    { key: "puertas", label: "Puertas" },
  ] as { key: TabStep4; label: string }[];

  const handleNewButtonClick = () => {
    // setShowCreateModal(true);
    // fetchMaterials();
    // setShowDetallesModal(false);
    console.log("New button clicked");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <CustomButton variant="save" onClick={handleNewButtonClick}>
          + Nuevo
        </CustomButton>
      </div>
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
        {tabs.map((item) => (
          <li key={item.key} style={{ flex: 1, minWidth: "100px" }}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#fff",
                color:
                  tabStep4 === item.key
                    ? primaryColor
                    : "var(--secondary-color)",
                border: "none",
                cursor: "pointer",
                borderBottom:
                  tabStep4 === item.key ? `3px solid ${primaryColor}` : "none",
                fontFamily: "var(--font-family-base)",
                fontWeight: "normal",
              }}
              onClick={() => setTabStep4(item.key)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ height: "400px", position: "relative" }}>
        {tabStep4 === "muros" && <MurosTable />}
        {tabStep4 === "techumbre" && renderTechumbreTable()}
        {tabStep4 === "pisos" && renderPisosTable()}
        {tabStep4 === "ventanas" && renderVentanasTable()}
        {tabStep4 === "puertas" && renderPuertasTable()}
      </div>
    </div>
  );
};

export default Step4Tabs;
