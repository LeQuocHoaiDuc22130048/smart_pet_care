import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';

/** Tuỳ chọn người dùng; `system` = theo thiết bị */
export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function readStoredTheme(): Theme | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return null;
}

function resolveTheme(preference: Theme): ResolvedTheme {
    if (preference === 'system') return getSystemTheme();
    return preference;
}

function initialTheme(): Theme {
    const stored = readStoredTheme();
    if (stored) return stored;
    return getSystemTheme() === 'dark' ? 'dark' : 'light';
}

interface ThemeContextType {
    theme: Theme;
    /** Giao diện thực tế đang áp dụng lên `document.documentElement` */
    resolvedTheme: ResolvedTheme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(initialTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
        resolveTheme(initialTheme())
    );

    useEffect(() => {
        const root = document.documentElement;

        const apply = () => {
            const resolved = resolveTheme(theme);
            setResolvedTheme(resolved);
            root.classList.remove('light', 'dark');
            root.classList.add(resolved);
            localStorage.setItem('theme', theme);
        };

        apply();

        if (theme !== 'system') return;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => apply();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState((prev) => {
            const effective = resolveTheme(prev);
            return effective === 'light' ? 'dark' : 'light';
        });
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
