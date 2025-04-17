import React from "react";
import CustomButton from "./CustomButton";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onDetails?: () => void;
  isDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onDetails,
  isDisabled = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
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
      {onDetails && (
        <button
          type="button"
          className="button btn-small px-3 btn btn-primary btn-icon-only btn-table-list"
          onClick={onDetails}
          disabled={isDisabled}
          style={{
            margin: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.5rem !important",
          }}
        >
          <span
            style={{
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="btn-icon-content material-icons animate__animated"
          >
            thermostat
          </span>
        </button>
        // <CustomButton
        //   variant="deleteIcon"
        //   className="btn-table-list"
        //   onClick={onDetails}
        //   title="Puentes Térmicos"
        //   disabled={isDisabled}
        // />
      )}
    </div>
  );
};

export default ActionButtons;
