//Hooks
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/router";
//Components
import GoogleIcons from "../public/GoogleIcons";
import HeaderProject from "@/components/workflow/HeaderProject";
import BodyProject from "@/components/workflow/BodyProject";
import FooterProject from "@/components/workflow/FooterProject";
import { useEffect } from "react";
import useProjectInitialization from "@/hooks/useProjectInitialization";
import useRedirectIfNoProject from "@/hooks/useRedirectIfNoProject";

const WorkFlowpar2createPage: React.FC = () => {
  useAuth();
  const router = useRouter();

  const { projectId, projectName, projectDepartment, hasLoaded, setProjectId } =
    useProjectInitialization();

  useRedirectIfNoProject(hasLoaded, projectId);

  return (
    <>
      <GoogleIcons />
      <HeaderProject
        projectDepartment={projectDepartment}
        projectName={projectName}
        projectLinkText="Proyecto Nuevo"
      />
      <BodyProject />
      <FooterProject />
    </>
  );
};

export default WorkFlowpar2createPage;
