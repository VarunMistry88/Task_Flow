import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-slate-900 text-slate-50 hover:bg-slate-900/90": variant === 'primary',
                        "bg-slate-100 text-slate-900 hover:bg-slate-100/80": variant === 'secondary',
                        "hover:bg-slate-100 hover:text-slate-900": variant === 'ghost',
                        "bg-red-500 text-white hover:bg-red-600": variant === 'danger',
                        "h-8 px-3 text-xs": size === 'sm',
                        "h-10 px-4 py-2": size === 'md',
                        "h-12 px-8": size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
