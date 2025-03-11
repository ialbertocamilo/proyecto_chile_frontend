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

  // Constantes de dimensiones
  const internalSidebarWidth = 380;
  const sidebarItemHeight = 100;
  const sidebarItemBorderSize = 1;
  const leftPadding = 50;

  return (
    <>
      <li
        className="sidebar-item"
        style={{
          cursor: "pointer",
          width: `${internalSidebarWidth}px`,
          padding: "20px",
          boxSizing: "border-box",
          borderRight: `1px solid ${inactiveColor}`,
          fontSize: "0.9rem",
        }}
        onClick={onStepChange}
      >
        <div
          className={`sidebar-item-content ${isActive ? "active" : ""}`}
          style={{
            width: "100%",
            height: `${sidebarItemHeight * 0.7}px`,
            border: `${sidebarItemBorderSize}px solid ${
              isActive ? primaryColor : inactiveColor
            }`,
            borderRadius: "4px",
            marginBottom: "-1.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: `${leftPadding * 0.8}px`,
            color: isActive ? primaryColor : inactiveColor,
            fontFamily: "var(--font-family-base)",
            position: "relative",
            overflow: "hidden",
            fontSize: "0.8rem",
            fontWeight: "normal",
          }}
        >
          <span
            className="icon-wrapper"
            style={{ marginRight: "15px", fontSize: "2rem" }}
          >
            <span className="material-icons">{step.iconName}</span>
          </span>
          <span className="title-wrapper">{step.title}</span>
        </div>
      </li>
      <style jsx global>{`
        /* Animación de aparición */
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

        .sidebar-item {
          perspective: 1000px;
          transform-style: preserve-3d;
          animation: sidebarItemAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
          animation-delay: calc(var(--item-index, 0) * 0.1s);
        }

        .sidebar-item-content {
          transform: translateX(0) translateZ(0);
          transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
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
          transition: transform 0.3s ease-out, filter 0.3s ease-out;
          transform-origin: center;
        }

        .sidebar-item-content:hover .icon-wrapper {
          transform: scale(1.2) rotate(8deg);
          filter: drop-shadow(0 2px 4px rgba(60, 167, 183, 0.3));
        }

        .title-wrapper {
          transition: transform 0.3s ease-out, letter-spacing 0.3s ease-out;
          transform-origin: left;
          position: relative;
        }

        .title-wrapper::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 100%;
          height: 2px;
          background: ${primaryColor};
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: right;
        }

        .sidebar-item-content:hover .title-wrapper {
          transform: translateX(5px) scale(1.02);
          letter-spacing: 0.2px;
        }

        .sidebar-item-content:hover .title-wrapper::before {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>
    </>
  );
};

interface AdminSidebarProps {
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: SidebarStep[];
  // Propiedad opcional para manejar la acción de navegación
  onClickAction?: (route: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeStep,
  onStepChange,
  steps,
  onClickAction,
}) => {
  const router = useRouter();

  const handleClick = (step: SidebarStep) => {
    if (onClickAction && step.route) {
      // Se utiliza la función pasada en AdminSidebar para la navegación.
      onClickAction(step.route);
      // Alternativamente, si prefieres hacer el push directamente aquí, podrías usar:
      // router.push(step.route);
    } else {
      onStepChange(step.stepNumber);
    }
  };

  return (
    <div className="internal-sidebar">
      <ul className="nav flex-column">
        {steps.map((step) => (
          <SidebarItem
            key={step.stepNumber}
            step={step}
            activeStep={activeStep}
            onStepChange={() => handleClick(step)}
          />
        ))}
      </ul>
    </div>
  );
};
