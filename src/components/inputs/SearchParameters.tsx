import React from "react";
import CustomButton from "../common/CustomButton";

interface SearchParametersProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder: string;
  onNew: () => void;
  newButtonText?: string;
  style?: React.CSSProperties;
}

const SearchParameters: React.FC<SearchParametersProps> = ({
  value,
  onChange,
  placeholder,
  onNew,
  newButtonText = "Nuevo",
  style,
}) => {
  return (
    <div className="d-flex align-items-center p-2" style={style}>
      <div style={{ flex: 1, marginRight: "10px" }}>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ height: "40px" }}
        />
      </div>
      <CustomButton variant="save" onClick={onNew} style={{ height: "40px" }}>
        <span className="material-icons">add</span> {newButtonText}
      </CustomButton>
    </div>
  );
};

export default SearchParameters;
