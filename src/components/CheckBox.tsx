import React from 'react';
import '../assets/css/CheckBox.css';

interface CheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  name: string;
  id: string;
}

function CheckBox({
  checked,
  onChange,
  disabled = false,
  className = '',
  label,
  name,
  id,
}: CheckBoxProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label 
      className={`checkbox-wrapper ${className} ${disabled ? 'checkbox-disabled' : ''}`}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="checkbox-native"
      />
      
      <span className="checkbox-custom">
        {checked && (
          <svg
            className="checkbox-check-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
}

export default CheckBox;