import React from 'react';

interface SidebarItemProps {
  stepNumber: number;
  currentStep: number;
  iconClass: string;
  title: string;
  onStepChange: (step: number) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  stepNumber,
  currentStep,
  iconClass,
  title,
  onStepChange
}) => {
  const isSelected = currentStep === stepNumber;
  const activeColor = "#3ca7b7";
  const inactiveColor = "#ccc";
  const modifiedIconClass = isSelected ? iconClass.replace('bi-', 'bi-') + '-fill' : iconClass;
  const sidebarItemBorderSize = 1;
  const leftPadding = 50;
  return (
    <li className="nav-item sidebar-item" style={{ cursor: "pointer" }} onClick={() => onStepChange(stepNumber)}>
      <div
        className={`sidebar-item-content mr-2 pr-2 ${isSelected ? 'active' : ''}`}
        style={{
          height: `${100 * 0.7}px`, 
          border: `${sidebarItemBorderSize}px solid ${isSelected ? activeColor : inactiveColor}`,
          borderRadius: "4px",
          marginBottom: "12px", // Reduced margin
          paddingRight: "2em", 
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: `${leftPadding * 0.8}px`, // Reduced padding
          color: isSelected ? activeColor : inactiveColor,
          fontFamily: "var(--font-family-base)",
          position: "relative",
          overflow: "hidden",
          background: isSelected ? `rgba(60, 167, 183, 0.05)` : "transparent",
        }}
      >
        <span className="icon-wrapper" style={{ marginRight: "10px", position: "relative" }}>
          <i className={modifiedIconClass}></i>
        </span>
        <span className="title-wrapper" >{title}</span>
      </div>
    </li>
  );
};

interface AdminSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentStep, onStepChange }) => {
  return (
    <div className="internal-sidebar">
      <ul className="nav flex-column">
        <SidebarItem
          stepNumber={3}
          currentStep={currentStep}
          iconClass="bi bi-file-text"
          title="Materiales"
          onStepChange={onStepChange}
        />
        <SidebarItem
          stepNumber={4}
          currentStep={currentStep}
          iconClass="bi bi-tools"
          title="Detalles constructivos"
          onStepChange={onStepChange}
        />
        <SidebarItem
          stepNumber={5}
          currentStep={currentStep}
          iconClass="bi bi-house"
          title="Elementos translúcidos"
          onStepChange={onStepChange}
        />
      </ul>
    </div>
  );
};