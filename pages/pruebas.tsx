import React from "react";
import Card from "../src/components/common/Card";
import ProjectInfoHeader from "../src/components/common/ProjectInfoHeader";

const TestProjectInfoPage: React.FC = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <Card>
        <div style={{ padding: "1rem" }}>
          <ProjectInfoHeader projectName="Proyecto Ejemplo" region="Región 1" />
        </div>
      </Card>
    </div>
  );
};

export default TestProjectInfoPage;
