"use client";

import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  className = "",
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              inline-flex items-center cursor-pointer
              ${error ? "text-red-500" : "text-gray-700"}
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              className={`
                w-5 h-5 flex items-center justify-center rounded-full border mr-2
                ${
                  value === option.value
                    ? "border-orange-500"
                    : error
                    ? "border-red-500"
                    : "border-gray-300"
                }
              `}
            >
              {value === option.value && (
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              )}
            </span>
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
