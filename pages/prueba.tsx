import React from "react";
import UseProfileTab from "../src/components/UseProfileTab";
const App: React.FC = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#3ca7b7" }}>
        Gestión de Recintos
      </h1>
      <UseProfileTab />
    </div>
  );
};

export default App;