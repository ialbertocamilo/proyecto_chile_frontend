//Hooks
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/router";
//Components
import GoogleIcons from "../public/GoogleIcons";
import HeaderProject from "@/components/workflow/HeaderProject";
import BodyProject from "@/components/workflow/BodyProject";
import FooterProject from "@/components/workflow/FooterProject";
import { useEffect, useState } from "react";
import useProjectInitialization from "@/hooks/useProjectInitialization";
import useRedirectIfNoProject from "@/hooks/useRedirectIfNoProject";
import useStepFromQuery from "@/hooks/useStepFromQuery";

const WorkFlowpar2createPage: React.FC = () => {
  const [step, setStep] = useState<number>(4);
  const [showTabsInStep4, setShowTabsInStep4] = useState(true);

  useStepFromQuery(setStep); // Use the custom hook

  useAuth();
  const router = useRouter();

  const {
    projectId,
    projectName,
    projectDepartment,
    hasLoaded,
    projectStatus,
  } = useProjectInitialization();

  useRedirectIfNoProject(hasLoaded, projectId);

  const sidebarSteps = [
    { stepNumber: 4, iconName: "build", title: "Detalles constructivos" },
    { stepNumber: 7, iconName: "design_services", title: "Recinto" },
  ];

  return (
    <>
      <GoogleIcons />
      <HeaderProject
        projectDepartment={projectDepartment}
        projectName={projectName}
        projectLinkText="Proyecto Nuevo"
      />
      <BodyProject
        step={step}
        setStep={setStep}
        sidebarSteps={sidebarSteps}
        showTabsInStep4={showTabsInStep4}
      />
      <FooterProject projectId={projectId} projectStatus={projectStatus} />
    </>
  );
};

export default WorkFlowpar2createPage;
