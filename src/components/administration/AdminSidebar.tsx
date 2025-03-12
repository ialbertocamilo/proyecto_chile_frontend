import React from "react";
import { useRouter } from "next/router";

interface SidebarStep {
  stepNumber: number;
  iconName: string;
  title: string;
  // Se añade la propiedad opcional para la ruta
  route?: string;
}

interface SidebarItemProps {
  step: SidebarStep;
  activeStep: number;
  // Se espera una función ya preparada (sin parámetros) para manejar el click
  onStepChange: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  step,
  activeStep,
  onStepChange,
}) => {
  const primaryColor = "#3ca7b7";
  const inactiveColor = "#ccc";
  const isActive = activeStep === step.stepNumber;

  return (
    <>
      <li
        className="list-unstyled py-2 py-md-3 px-2 px-md-3 border-end border-light"
        onClick={onStepChange}
      >
        <div
          className={`sidebar-item-content d-flex align-items-center ps-2 ps-md-4 ${
            isActive ? "active" : ""
          }`}
          style={{
            height: "60px",
            border: `1px solid ${isActive ? primaryColor : inactiveColor}`,
            color: isActive ? primaryColor : inactiveColor,
          }}
        >
          <span className="icon-wrapper me-2 me-md-3 fs-5 fs-md-4">
            <span className="material-icons">{step.iconName}</span>
          </span>
          <span className="title-wrapper fs-7 fs-md-6">{step.title}</span>
        </div>
      </li>
      <style jsx>{`
        .sidebar-item {
          width: 100%;
          max-width: 380px;
          cursor: pointer;
          perspective: 1000px;
          transform-style: preserve-3d;
          animation: sidebarItemAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: calc(var(--item-index, 0) * 0.1s);
        }

        @media (max-width: 768px) {
          .sidebar-item {
            max-width: 300px;
          }

          .sidebar-item-content:hover {
            transform: none;
            box-shadow: none;
          }

          .sidebar-item:active .sidebar-item-content {
            transform: translateX(4px);
          }
        }

        .sidebar-item-content {
          border-radius: 4px;
          margin-bottom: -1.8rem;
          position: relative;
          overflow: hidden;
          transform: translateX(0) translateZ(0);
          transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
        }

        @keyframes sidebarItemAppear {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.9);
          }
          60% {
            transform: translateX(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .sidebar-item-content:hover {
          transform: translateX(8px) translateZ(10px);
          box-shadow: 0 4px 25px rgba(60, 167, 183, 0.1),
            0 1px 5px rgba(0, 0, 0, 0.1);
        }

        .sidebar-item:active .sidebar-item-content {
          transform: translateX(8px) translateY(10px) translateZ(10px);
        }

        .sidebar-item-content.active .icon-wrapper {
          border: 2px solid ${primaryColor};
          border-radius: 50%;
          padding: 5px;
          background: ${primaryColor};
          color: #fff;
        }

        .icon-wrapper {
          transition: transform 0.3s ease-out;
          transform-origin: center;
        }

        .sidebar-item-content:hover .icon-wrapper {
          transform: scale(1.2) rotate(8deg);
        }

        .title-wrapper {
          position: relative;
          transition: transform 0.3s ease-out, letter-spacing 0.3s ease-out;
        }

        .sidebar-item-content:hover .title-wrapper {
          transform: translateX(5px) scale(1.02);
          letter-spacing: 0.2px;
        }
      `}</style>
    </>
  );
};

interface AdminSidebarProps {
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: SidebarStep[];
  onClickAction?: (route: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeStep,
  onStepChange,
  steps,
  onClickAction,
}) => {
  const handleClick = (step: SidebarStep) => {
    if (onClickAction && step.route) {
      onClickAction(step.route);
    } else {
      onStepChange(step.stepNumber);
    }
  };
  return (
    <div className="internal-sidebar">
      <ul className="nav flex-column w-100">
        {steps.map((step) => (
          <SidebarItem
            key={step.stepNumber}
            step={step}
            activeStep={activeStep}
            onStepChange={() => {if (handleClick) handleClick(step)}}
          />
        ))}
      </ul>
      <style jsx>{`
        .internal-sidebar {
          width: 100%;
          max-width: 380px;
        }

        @media (max-width: 768px) {
          .internal-sidebar {
            max-width: 100%;
            padding: 0 1rem;
          }

          .nav {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          :global(.sidebar-item) {
            max-width: 100%;
            margin-bottom: 0.5rem;
          }

          :global(.sidebar-item-content) {
            margin-bottom: -0.5rem;
          }
        }

        @media (orientation: portrait) {
          .internal-sidebar {
            padding: 0.5rem;
          }

          :global(.sidebar-item) {
            width: 100%;
            max-width: none;
          }

          :global(.sidebar-item-content) {
            height: 55px !important;
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
