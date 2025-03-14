import React from "react";
import CustomButton from "./CustomButton";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="buttons-container">
      <CustomButton
        variant="editIcon"
        className="btn-table-list"
        onClick={onEdit}
        title="Editar en Workflow"
      />
      <CustomButton
        variant="deleteIcon"
        className="btn-table-list"
        onClick={onDelete}
        title="Eliminar proyecto"
      />
    </div>
  );
};

export default ActionButtons;