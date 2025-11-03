import React from 'react'
import { cn } from '../../lib/utils'

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  valueLabel?: string
  helperText?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueLabel, helperText, value, ...props }, ref) => {
    const sliderId = React.useId()

    return (
      <div className="w-full">
        {label && (
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor={sliderId} className="block text-sm font-medium text-slate-300">
              {label}
            </label>
            {valueLabel && (
              <span className="text-sm font-semibold text-purple-400">{valueLabel}</span>
            )}
          </div>
        )}
        <input
          type="range"
          id={sliderId}
          className={cn(
            'h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700',
            'accent-purple-600',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-lg',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        {helperText && <p className="mt-1 text-sm text-slate-400">{helperText}</p>}
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }

