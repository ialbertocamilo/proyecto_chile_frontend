import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <div className="form-check mb-3">
      <input
        type="checkbox"
        id={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="form-check-input"
      />
      <label htmlFor={label} className="form-check-label">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
