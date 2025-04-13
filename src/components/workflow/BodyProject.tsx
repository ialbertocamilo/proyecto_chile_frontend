import React from "react";
import Card from "../common/Card";
import { AdminSidebar } from "../administration/AdminSidebar";
import VerticalDivider from "../ui/HorizontalDivider";
import RecintoTabs from "./RecintoTabs";
import Step4Tabs from "./Step4Tabs";
import InitialDetails from "./InitialDetails";

interface BodyProjectProps {
  step: number;
  setStep: (step: number) => void;
  sidebarSteps: Array<{ iconName: string; title: string; stepNumber: number }>;
  showTabsInStep4: boolean;
}

const BodyProject: React.FC<BodyProjectProps> = (props) => {
  return (
    <Card>
      <div className="row">
        <div className="col-lg-3 col-12 order-lg-first order-first">
          <div className="mb-3 mb-lg-0">
            <AdminSidebar
              activeStep={props.step}
              onStepChange={props.setStep}
              steps={props.sidebarSteps}
            />
          </div>
          <VerticalDivider />
        </div>
        <div className="col-lg-9 col-12 order-last">
          <div style={{ padding: "20px" }}>
            {props.step === 4 && (
              <>
                {props.showTabsInStep4 ? (
                  <Step4Tabs showTabsInStep4={props.showTabsInStep4} />
                ) : (
                  <InitialDetails />
                )}
              </>
            )}
            {props.step === 7 && <RecintoTabs />}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BodyProject;
