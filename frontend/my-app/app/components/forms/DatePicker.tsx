// app/components/forms/DatePicker.tsx
"use client";

import React from "react";

interface DatePickerProps {
  label?: string;
  selectedDay: string;
  selectedMonth: string;
  selectedYear: string;
  onDayChange: (day: string) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  error?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  selectedDay,
  selectedMonth,
  selectedYear,
  onDayChange,
  onMonthChange,
  onYearChange,
  error,
  className = "",
}) => {
  // Tạo mảng ngày từ 1-31
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Danh sách tháng
  const months = [
    { value: "01", label: "Tháng 1" },
    { value: "02", label: "Tháng 2" },
    { value: "03", label: "Tháng 3" },
    { value: "04", label: "Tháng 4" },
    { value: "05", label: "Tháng 5" },
    { value: "06", label: "Tháng 6" },
    { value: "07", label: "Tháng 7" },
    { value: "08", label: "Tháng 8" },
    { value: "09", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  // Tạo mảng năm từ năm hiện tại trở về 100 năm trước
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) =>
    (currentYear - i).toString()
  );

  const selectStyles = `
    block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm
    focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm
    ${error ? "border-red-500" : ""}
  `;

  // Tạo ID duy nhất cho label nếu có
  const labelId = label
    ? `date-picker-${label.replace(/\s+/g, "-").toLowerCase()}`
    : undefined;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label id={labelId} className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <select
            id="date-day-select"
            value={selectedDay}
            onChange={(e) => onDayChange(e.target.value)}
            className={selectStyles}
            aria-label="Ngày"
            aria-labelledby={labelId ? `${labelId} date-day-select` : undefined}
            title="Chọn ngày"
          >
            <option value="">Ngày</option>
            {days.map((day) => (
              <option key={day} value={day.padStart(2, "0")}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="date-month-select"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className={selectStyles}
            aria-label="Tháng"
            aria-labelledby={
              labelId ? `${labelId} date-month-select` : undefined
            }
            title="Chọn tháng"
          >
            <option value="">Tháng</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="date-year-select"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className={selectStyles}
            aria-label="Năm"
            aria-labelledby={
              labelId ? `${labelId} date-year-select` : undefined
            }
            title="Chọn năm"
          >
            <option value="">Năm</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
};
