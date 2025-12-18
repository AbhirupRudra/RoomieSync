
import React from 'react';

interface LifestyleSliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
}

/**
 * Maps a 0-100 value to a 0-6 index for the segmented slider
 */
const valToIndex = (val: number) => Math.round((val / 100) * 6);

/**
 * Maps a 0-6 index back to a 0-100 value
 */
const indexToVal = (index: number) => Math.round((index / 6) * 100);

const LifestyleSlider: React.FC<LifestyleSliderProps> = ({ 
  label, leftLabel, rightLabel, value, onChange, icon 
}) => {
  const currentIndex = valToIndex(value);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <label className="text-sm font-bold text-slate-800 uppercase tracking-widest">{label}</label>
      </div>
      
      <div className="relative h-6 flex items-center mb-2">
        {/* Visual Segmented Track */}
        <div className="absolute w-full h-1 bg-slate-200 rounded-full flex justify-between px-1">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full -mt-0.5 transition-colors duration-300 ${
                i <= currentIndex ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Transparent Range Input for Interaction */}
        <input
          type="range"
          min="0"
          max="6"
          step="1"
          value={currentIndex}
          onChange={(e) => onChange(indexToVal(parseInt(e.target.value)))}
          className="absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-10 accent-indigo-600 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>

      <div className="flex justify-between mt-3">
        <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${currentIndex === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
          {leftLabel}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${currentIndex === 6 ? 'text-indigo-600' : 'text-slate-400'}`}>
          {rightLabel}
        </span>
      </div>
    </div>
  );
};

export default LifestyleSlider;
