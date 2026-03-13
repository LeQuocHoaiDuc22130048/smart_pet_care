import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            className='rounded-full relative overflow-hidden'
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'light' ? 1 : 0,
                    opacity: theme === 'light' ? 1 : 0,
                    rotate: theme === 'light' ? 0 : 180
                }}
                transition={{ duration: 0.3 }}
                className='absolute'
            >
                <Sun className='h-5 w-5' />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 1 : 0,
                    opacity: theme === 'dark' ? 1 : 0,
                    rotate: theme === 'dark' ? 0 : -180
                }}
                transition={{ duration: 0.3 }}
                className='absolute'
            >
                <Moon className='h-5 w-5' />
            </motion.div>
        </Button>
    );
};

export default ThemeToggle;
