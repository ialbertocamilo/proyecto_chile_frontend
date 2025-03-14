import React from "react";
import CustomButton from "@/components/common/CustomButton";

interface ProjectInfoHeaderProps {
  projectName: string;
  region: string;
}

const ProjectInfoHeader: React.FC<ProjectInfoHeaderProps> = ({ projectName, region }) => {
  return (
    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
      <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
        Proyecto:
      </span>
      <CustomButton
        variant="save"
        className="no-hover"
        style={{ padding: "0.8rem 3rem" }}
      >
        {`Nombre del proyecto: ${projectName}`}
      </CustomButton>
      <CustomButton
        variant="save"
        className="no-hover"
        style={{ padding: "0.8rem 3rem" }}
      >
        {`Región: ${region}`}
      </CustomButton>
    </div>
  );
};

export default ProjectInfoHeader;
