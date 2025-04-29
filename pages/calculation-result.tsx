import React, { useEffect, useState } from "react";
import Results from "../src/components/projects/Results";
import Title from "@/components/Title";
import Card from "@/components/common/Card";
import ProjectInfoHeader from "@/components/common/ProjectInfoHeader";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useRouter } from "next/router";
import CustomButton from "@/components/common/CustomButton";

const CalculationResultPage = () => {
  const [projectNameFromStorage, setProjectNameFromStorage] = useState("");
  const [regionFromStorage, setRegionFromStorage] = useState("");

  useEffect(() => {
    const storedProjectName = localStorage.getItem("project_name_edit") || "";
    const storedRegion = localStorage.getItem("project_department_edit") || "";
    setProjectNameFromStorage(storedProjectName);
    setRegionFromStorage(storedRegion);
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const router = useRouter();
  return (
    <div className="py-4">
      <Card>
        <div>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <ProjectInfoHeader
              projectName={projectNameFromStorage}
              region={regionFromStorage}
            />
            <Breadcrumb
              items={[
                {
                  title: "Editar",
                  href: "/",
                  active: true,
                },
              ]}
            />
          </div>
        </div>
      </Card>{" "}
      <Card>
        <Results />
        <CustomButton variant="back" onClick={handleBack}>
          Regresar
        </CustomButton>
      </Card>
    </div>
  );
};

export default CalculationResultPage;
