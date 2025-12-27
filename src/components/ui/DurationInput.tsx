import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DurationInputProps {
    value?: number;
    onChange: (value: number | undefined) => void;
    className?: string;
    placeholder?: string;
}

export const DurationInput = ({ value, onChange, className, placeholder = "Est. time (e.g. 1h 30m)" }: DurationInputProps) => {
    const [inputValue, setInputValue] = useState('');

    // Format milliseconds to display string
    useEffect(() => {
        if (!value) {
            setInputValue('');
            return;
        }

        const totalMinutes = Math.round(value / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        let text = '';
        if (hours > 0) text += `${hours}h`;
        if (minutes > 0) text += `${hours > 0 ? ' ' : ''}${minutes}m`;

        setInputValue(text);
    }, [value]);

    const parseDuration = (text: string): number | undefined => {
        if (!text.trim()) return undefined;

        // Normalize text
        const cleanText = text.toLowerCase().trim();

        // Check for simple number (default to minutes)
        if (/^\d+$/.test(cleanText)) {
            return parseInt(cleanText) * 60 * 1000;
        }

        // Parse complex string
        let totalMs = 0;

        // Hours
        const hoursMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hours?)/);
        if (hoursMatch) {
            totalMs += parseFloat(hoursMatch[1]) * 60 * 60 * 1000;
        }

        // Minutes
        const minutesMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(?:m|min|minutes?)/);
        if (minutesMatch) {
            totalMs += parseFloat(minutesMatch[1]) * 60 * 1000;
        }

        return totalMs > 0 ? totalMs : undefined;
    };

    const handleBlur = () => {
        const parsed = parseDuration(inputValue);
        onChange(parsed);

        // Re-format display if valid
        if (parsed) {
            const totalMinutes = Math.round(parsed / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            let text = '';
            if (hours > 0) text += `${hours}h`;
            if (minutes > 0) text += `${hours > 0 ? ' ' : ''}${minutes}m`;
            setInputValue(text);
        } else {
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    return (
        <div className={cn(
            "flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all",
            className
        )}>
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="bg-transparent text-sm focus:outline-none w-full dark:text-slate-200"
            />
        </div>
    );
};
