import React from "react";
import CustomButton from "./CustomButton";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  isDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete, isDisabled = false}) => {
 return (
  <div style={{ display: "flex", flexDirection: "row",justifyContent: "center" }}>
    <CustomButton
      variant="editIcon"
      className="btn-table-list"
      onClick={onEdit}
      title="Editar"
      disabled={isDisabled}
    />
    <CustomButton
      variant="deleteIcon"
      className="btn-table-list"
      onClick={onDelete}
      title="Eliminar"
      disabled={isDisabled}
    />
  </div>
);

};

export default ActionButtons;