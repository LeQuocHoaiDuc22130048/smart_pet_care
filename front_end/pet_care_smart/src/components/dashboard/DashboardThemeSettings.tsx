import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, type Theme } from '@/context/ThemeContext';

const OPTIONS: {
    value: Theme;
    label: string;
    hint: string;
    icon: typeof Sun;
    iconWrap: string;
}[] = [
    {
        value: 'light',
        label: 'Sáng',
        hint: 'Nền sáng, phù hợp ban ngày',
        icon: Sun,
        iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
        value: 'dark',
        label: 'Tối',
        hint: 'Giảm chói, phù hợp buổi tối',
        icon: Moon,
        iconWrap: 'bg-slate-800 text-slate-100 dark:bg-slate-950 dark:text-slate-200',
    },
    {
        value: 'system',
        label: 'Theo hệ thống',
        hint: 'Tự đổi theo cài đặt thiết bị',
        icon: Monitor,
        iconWrap: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    },
];

interface Props {
    className?: string;
}

/** Chọn sáng / tối / theo hệ thống — dùng trong tab Cài đặt dashboard */
export function DashboardThemeSettings({ className }: Props) {
    const { theme, setTheme } = useTheme();

    return (
        <div className={cn('space-y-4', className)}>
            <p className="text-sm font-semibold text-foreground">Chế độ hiển thị</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {OPTIONS.map(({ value, label, hint, icon: Icon, iconWrap }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        className={cn(
                            'flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all',
                            theme === value
                                ? 'border-[#448B3D] bg-[#448B3D]/10 shadow-sm dark:bg-[#448B3D]/20'
                                : 'border-border bg-muted/30 hover:border-[#448B3D]/40 hover:bg-muted/50'
                        )}
                    >
                        <span
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-full shadow-sm',
                                iconWrap
                            )}
                        >
                            <Icon className="h-6 w-6" />
                        </span>
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground leading-snug">{hint}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
