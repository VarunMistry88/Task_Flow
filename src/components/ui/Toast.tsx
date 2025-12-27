import { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'warning' | 'info' | 'success';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast = ({ message, type = 'info', onClose, duration = 5000 }: ToastProps) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        warning: AlertTriangle,
        info: Info,
        success: CheckCircle
    };

    const Icon = icons[type];

    const styles = {
        warning: 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-100',
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
        success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100'
    };

    const iconStyles = {
        warning: 'text-orange-600 dark:text-orange-400',
        info: 'text-blue-600 dark:text-blue-400',
        success: 'text-green-600 dark:text-green-400'
    };

    return (
        <div className={cn(
            "fixed bottom-6 right-6 max-w-md p-4 rounded-xl border shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 z-50",
            styles[type]
        )}>
            <div className="flex items-start gap-3">
                <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconStyles[type])} />
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
