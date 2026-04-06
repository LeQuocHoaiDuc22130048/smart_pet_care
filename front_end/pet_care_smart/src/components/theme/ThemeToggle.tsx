import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            className='rounded-full relative overflow-hidden'
            aria-label={resolvedTheme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
        >
            <motion.div
                initial={false}
                animate={{
                    scale: resolvedTheme === 'light' ? 1 : 0,
                    opacity: resolvedTheme === 'light' ? 1 : 0,
                    rotate: resolvedTheme === 'light' ? 0 : 180
                }}
                transition={{ duration: 0.3 }}
                className='absolute'
            >
                <Sun className='h-5 w-5' />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: resolvedTheme === 'dark' ? 1 : 0,
                    opacity: resolvedTheme === 'dark' ? 1 : 0,
                    rotate: resolvedTheme === 'dark' ? 0 : -180
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
