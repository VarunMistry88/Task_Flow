import { cn } from '../../utils/cn';

interface TimeProgressRingProps {
    used: number; // ms
    total: number; // ms
    size?: number;
    className?: string;
}

export const TimeProgressRing = ({ used, total, size = 32, className }: TimeProgressRingProps) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const percentage = Math.min((used / total) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    const isOverBudget = used > total;
    const isNearLimit = used >= total * 0.8;

    const colorClass = isOverBudget
        ? 'text-red-500'
        : isNearLimit
            ? 'text-orange-500'
            : 'text-blue-500';

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-500 ease-out", colorClass)}
                />
            </svg>
            {/* Center Icon/Text can be added here if needed */}
        </div>
    );
};
