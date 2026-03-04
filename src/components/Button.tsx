import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    ariaLabel?: string;
}

export const Button = ({ children, onClick, variant = 'primary', className = '', ariaLabel }: ButtonProps) => {
    const baseStyles = "px-10 py-5 rounded-3xl font-black text-lg transition-all duration-500 focus-visible:ring-4 focus-visible:ring-brand-primary/40 outline-none backdrop-blur-xl border flex items-center justify-center gap-3";

    const variants = {
        primary: "bg-brand-primary/20 text-white border-brand-primary/30 hover:bg-brand-primary/30 shadow-2xl shadow-brand-primary/10",
        secondary: "bg-brand-secondary/20 text-white border-brand-secondary/30 hover:bg-brand-secondary/30 shadow-2xl shadow-brand-secondary/10",
        outline: "bg-white/[0.03] text-white border-white/10 hover:bg-white/[0.08] hover:border-white/20",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            aria-label={ariaLabel}
        >
            {children}
        </motion.button>
    );
};
