import React from "react";

interface SidebarItemComponentProps {
  stepNumber: number;
  iconName: string;
  title: string;
  activeStep: number;
  onClickAction?: () => void;
}

const SidebarItemComponent: React.FC<SidebarItemComponentProps> = ({
  stepNumber,
  iconName,
  title,
  activeStep,
  onClickAction,
}) => {
  const primaryColor = "#3ca7b7";
  const inactiveColor = "#ccc";
  const isActive = activeStep === stepNumber;

  return (
    <li
      className="nav-item"
      style={{
        cursor: "pointer",
        width: "400px",
        padding: "20px",
        boxSizing: "border-box",
        borderRight: "1px solid #ccc",
      }}
      onClick={onClickAction}
    >
      <div
        style={{
          width: "100%",
          height: "100px",
          border: `1px solid ${isActive ? primaryColor : inactiveColor}`,
          borderRadius: "8px",
          marginBottom: "-7%",
          display: "flex",
          alignItems: "center",
          paddingLeft: "50px",
          color: isActive ? primaryColor : inactiveColor,
          fontFamily: "var(--font-family-base)",
        }}
      >
        <span style={{ marginRight: "15px", fontSize: "1.5rem" }}>
          <span className="material-icons">{iconName}</span>
        </span>
        <span>{title}</span>
      </div>
    </li>
  );
};

export default SidebarItemComponent;
