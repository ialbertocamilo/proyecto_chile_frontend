import React from "react";
import { useRouter } from "next/router";
import CustomButton from "@/components/common/CustomButton";

interface ProjectInfoHeaderProps {
  projectName: string;
  region: string;
  project_id? : string | number;
}

const ProjectInfoHeader: React.FC<ProjectInfoHeaderProps> = ({ projectName, region, project_id }) => {
  const router = useRouter();

  const handleProjectClick = () => {
    router.push(`/workflow-part1-edit?id=${project_id}&step=1`);
  };

  const handleRegionClick = () => {
    router.push(`/workflow-part1-edit?id=${project_id}&step=2`);
  };

  return (
    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
      <span style={{ fontWeight: "normal", fontFamily: "var(--font-family-base)" }}>
        Proyecto:
      </span>
      <CustomButton
        variant="save"
        style={{ padding: "0.8rem 3rem", cursor: "pointer" }}
        onClick={handleProjectClick}
      >
        {`Nombre del proyecto: ${projectName}`}
      </CustomButton>
      <CustomButton
        variant="save"
        style={{ padding: "0.8rem 3rem", cursor: "pointer" }}
        onClick={handleRegionClick}
      >
        {`Región: ${region}`}
      </CustomButton>
    </div>
  );
};

export default ProjectInfoHeader;
