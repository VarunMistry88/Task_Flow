import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
    value: string;
    label: string | React.ReactNode;
    className?: string; // For option-specific styling (e.g. text color)
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    icon,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border transition-all text-sm",
                    "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
                    "hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                    isOpen && "ring-2 ring-blue-500/20 border-blue-500/50"
                )}
            >
                {icon && <span className="text-slate-500 dark:text-slate-400">{icon}</span>}
                <span className={cn(
                    "flex-1 text-left truncate",
                    !selectedOption && "text-slate-400"
                )}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full mt-1 w-full min-w-[150px] max-h-[240px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg animate-in fade-in zoom-in-95 duration-100 p-1">
                    {options.length === 0 ? (
                        <div className="px-2 py-2 text-xs text-slate-500 text-center italic">
                            No options
                        </div>
                    ) : (
                        options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition-colors",
                                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                                    value === option.value ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-200",
                                    option.className
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.value && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
