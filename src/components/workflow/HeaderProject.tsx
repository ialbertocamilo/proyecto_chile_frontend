import React from "react";
//Components
import Card from "../common/Card";
import ProjectInfoHeader from "../common/ProjectInfoHeader";
import Breadcrumb from "@/components/common/Breadcrumb";
import Title from "@/components/Title";
//Hooks
import useProjectId from "@/hooks/useProjectId";
import useRedirectIfNoProject from "@/hooks/useRedirectIfNoProject";
import useProjectInitialization from "@/hooks/useProjectInitialization";

interface HeaderProjectProps {
  projectName: string;
  projectDepartment: string;
  projectLinkText: string;
}

const HeaderProject: React.FC<HeaderProjectProps> = (props) => {
  return (
    <Card>
      <div
        className="d-flex align-items-center w-100"
        style={{ marginBottom: "2rem" }}
      >
        <Title text="Desarrollo de proyecto" />
      </div>
      <div className="d-flex align-items-center gap-4">
        <ProjectInfoHeader
          projectName={props.projectName}
          region={props.projectDepartment}
        />
        <div className="ms-auto" style={{ display: "flex" }}>
          <Breadcrumb
            items={[{ title: props.projectLinkText, href: "/", active: true }]}
          />
        </div>
      </div>
    </Card>
  );
};

export default HeaderProject;
