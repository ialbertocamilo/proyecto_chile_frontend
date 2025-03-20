import React from "react";
import CustomButton from "./CustomButton";

interface AcceptCancelButtonsProps {
  onAccept: () => void;
  onCancel: () => void;
}

const ActionButtonsConfirm: React.FC<AcceptCancelButtonsProps> = ({ onAccept, onCancel }) => {
  return (
    <div className="buttons-container">
      <CustomButton variant="save" className="btn-table-list" onClick={onAccept}>
        Aceptar
      </CustomButton>
      <CustomButton variant="closed" className="btn-table-list" onClick={onCancel}>
        Cancelar
      </CustomButton>
    </div>
  );
};

export default ActionButtonsConfirm;
