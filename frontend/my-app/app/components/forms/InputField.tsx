"use client";

import React, { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  endAdornment?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  error,
  endAdornment,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none transition-colors
            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-orange-500"
            }
            ${props.readOnly ? "bg-gray-50 text-gray-500" : "bg-white"}
            ${className}
          `}
          {...props}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAdornment}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default InputField;
