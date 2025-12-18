
import React from 'react';

interface LifestyleSliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
}

const LifestyleSlider: React.FC<LifestyleSliderProps> = ({ 
  label, leftLabel, rightLabel, value, onChange, icon 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between mt-2">
        <span className="text-xs font-medium text-slate-500">{leftLabel}</span>
        <span className="text-xs font-medium text-slate-500">{rightLabel}</span>
      </div>
    </div>
  );
};

export default LifestyleSlider;
