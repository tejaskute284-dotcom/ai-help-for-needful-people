import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Menu, X, LayoutDashboard, Home, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import SettingsDropdown from './SettingsDropdown';

interface NavbarProps {
    onJoinClick: () => void;
    isLoggedIn?: boolean;
    onLogout?: () => void;
    onDashboardClick?: () => void;
    onHomeClick?: () => void;
}

export const Navbar = ({ onJoinClick, isLoggedIn, onLogout, onDashboardClick, onHomeClick }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'About', href: '#about' },
        { name: 'Features', href: '#features' },
        { name: 'Impact', href: '#impact' },
        { name: 'Principles', href: '#principles' },
    ];

    return (
        <nav
            className={`nav-capsule transition-all duration-300 ${isScrolled ? 'top-4 py-2 bg-white/80' : 'top-6 py-3'
                }`}
            role="navigation"
            aria-label="Main Navigation"
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div
                    className="flex items-center gap-3 cursor-pointer group focus-ring rounded-lg p-1"
                    onClick={onHomeClick}
                    tabIndex={0}
                    role="button"
                    aria-label="Go to Home"
                    onKeyDown={(e) => e.key === 'Enter' && onHomeClick?.()}
                >
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                        <Accessibility className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-text-main">AccessAI</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {!isLoggedIn && navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-slate-600 hover:text-brand-primary font-medium transition-colors focus-ring rounded-md px-2 py-1"
                        >
                            {item.name}
                        </a>
                    ))}

                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onHomeClick}
                                className="flex items-center gap-2 text-slate-600 hover:text-brand-primary transition-colors font-medium focus-ring rounded-lg px-3 py-2"
                                aria-label="Go to Home"
                            >
                                <Home size={18} />
                                <span>Home</span>
                            </button>
                            <button
                                onClick={onDashboardClick}
                                className="flex items-center gap-2 text-slate-600 hover:text-brand-primary transition-colors font-medium focus-ring rounded-lg px-3 py-2"
                                aria-label="Go to Dashboard"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </button>

                            {/* Restored Settings Dropdown */}
                            <SettingsDropdown onProfileClick={onJoinClick} />
                        </div>
                    ) : (
                        <button
                            onClick={onJoinClick}
                            className="btn-primary"
                            aria-label="Join the movement"
                        >
                            Join Us
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-900 focus-ring rounded-xl"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-[calc(100%+12px)] left-0 w-full glass-panel p-6 flex flex-col gap-2 md:hidden rounded-2xl border border-slate-200"
                    >
                        {!isLoggedIn ? (
                            <>
                                {navItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="text-lg font-medium py-3 px-4 hover:bg-slate-50 rounded-xl transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                                <button
                                    onClick={() => { onJoinClick(); setIsOpen(false); }}
                                    className="btn-primary w-full mt-2"
                                >
                                    Join the Movement
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { onHomeClick?.(); setIsOpen(false); }} className="text-left text-lg font-medium py-3 px-4 hover:bg-slate-50 rounded-xl flex items-center gap-3"><Home size={20} /> Home</button>
                                <button onClick={() => { onDashboardClick?.(); setIsOpen(false); }} className="text-left text-lg font-medium py-3 px-4 hover:bg-slate-50 rounded-xl flex items-center gap-3"><LayoutDashboard size={20} /> Dashboard</button>
                                <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="text-left text-lg font-medium py-3 px-4 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3"><LogOut size={20} /> Logout</button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
