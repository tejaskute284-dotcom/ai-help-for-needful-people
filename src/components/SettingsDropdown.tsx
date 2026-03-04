import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, HelpCircle, Moon, LogOut, Shield, Contrast, Type, Hand, Mic, Volume2, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { GesturePanel } from './GesturePanel';
import { STTPanel } from './STTPanel';
import { TTSPanel } from './TTSPanel';

interface SettingsDropdownProps {
    onProfileClick?: () => void;
}

// Settings Menu Component
export default function SettingsDropdown({ onProfileClick }: SettingsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState<'main' | 'accessibility'>('main');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    // Accessibility States
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(1);
    const [activeAccessTab, setActiveAccessTab] = useState<'controls' | 'gestures' | 'stt' | 'tts'>('controls');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Accessibility Effects
    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [highContrast]);

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize * 100}%`;
    }, [fontSize]);

    const handleItemClick = (label: string) => {
        showToast(label, "info", "This feature is coming soon!");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full clay-card hover:bg-gray-50 transition-all duration-300 glow-focus ${isOpen ? 'bg-gray-50 ring-2 ring-brand-primary/20' : ''}`}
                aria-label="Settings"
            >
                <Settings className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-[#1A2847]'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.2, ease: "circOut" }}
                        className="absolute right-0 top-full mt-4 w-96 clay-card p-2 z-[100] flex flex-col shadow-2xl overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 mb-2 flex items-center gap-3">
                            {activeView === 'accessibility' && (
                                <button
                                    onClick={() => setActiveView('main')}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div>
                                <h3 className="font-bold text-[#1A2847] text-lg">
                                    {activeView === 'main' ? 'Settings' : 'Accessibility Tools'}
                                </h3>
                                <p className="text-xs text-brand-primary font-medium tracking-wide">
                                    {activeView === 'main' ? 'PREFERENCES & CONTROLS' : 'ASSISTANCE SUITE'}
                                </p>
                            </div>
                        </div>

                        {activeView === 'main' ? (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-1"
                            >
                                <MenuItem icon={User} label="My Profile" desc="Manage your info" onClick={() => {
                                    if (onProfileClick) {
                                        onProfileClick();
                                        setIsOpen(false);
                                    } else {
                                        handleItemClick("Profile Settings");
                                    }
                                }} />
                                <div onClick={() => setActiveView('accessibility')}>
                                    <MenuItem icon={Hand} label="Accessibility Tools" desc="Gestures, Voice, & Display" onClick={() => { }} />
                                </div>
                                <MenuItem icon={Bell} label="Notifications" desc="Alert preferences" onClick={() => handleItemClick("Notification Settings")} />
                                <MenuItem icon={Moon} label="Appearance" desc="Theme settings" onClick={() => handleItemClick("Appearance Settings")} />
                                <MenuItem icon={Shield} label="Privacy" desc="Data controls" onClick={() => handleItemClick("Privacy Settings")} />
                                <div className="h-px bg-gray-100 my-2 mx-2" />
                                <MenuItem icon={HelpCircle} label="Help & Support" desc="Get assistance" onClick={() => handleItemClick("Help Center")} />
                                <MenuItem icon={LogOut} label="Reset App" desc="Clear session" onClick={() => window.location.reload()} variant="danger" />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col h-[500px]" // Fixed height for panels
                            >
                                {/* Accessibility Tabs */}
                                <div className="flex gap-1 mb-2 px-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <AccessTab active={activeAccessTab === 'controls'} onClick={() => setActiveAccessTab('controls')} icon={Settings} label="Display" />
                                    <AccessTab active={activeAccessTab === 'gestures'} onClick={() => setActiveAccessTab('gestures')} icon={Hand} label="Gesture" />
                                    <AccessTab active={activeAccessTab === 'stt'} onClick={() => setActiveAccessTab('stt')} icon={Mic} label="STT" />
                                    <AccessTab active={activeAccessTab === 'tts'} onClick={() => setActiveAccessTab('tts')} icon={Volume2} label="TTS" />
                                </div>

                                <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
                                    {activeAccessTab === 'controls' && (
                                        <div className="space-y-6 pt-2">
                                            {/* Contrast Toggle */}
                                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <Contrast className="w-5 h-5 text-brand-secondary" />
                                                        <span className="font-bold text-[#1A2847]">High Contrast</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setHighContrast(!highContrast)}
                                                        className={`w-12 h-6 rounded-full transition-colors ${highContrast ? 'bg-brand-primary' : 'bg-white/10'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-7' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500">Increases visibility and reduces eye strain.</p>
                                            </div>

                                            {/* Font Size Controls */}
                                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Type className="w-5 h-5 text-brand-primary" />
                                                    <span className="font-bold text-[#1A2847]">Text Size</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[0.8, 1, 1.2, 1.5].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setFontSize(s)}
                                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${fontSize === s ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-gray-100 border-gray-200 text-[#1A2847] hover:bg-gray-200'}`}
                                                        >
                                                            {s === 1 ? 'Aa' : `${Math.round(s * 100)}%`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setHighContrast(false);
                                                    setFontSize(1);
                                                    showToast("Settings Reset", "success", "Display settings restored to default.");
                                                }}
                                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#1A2847] rounded-xl text-sm font-bold transition-all"
                                            >
                                                Reset Display Settings
                                            </button>
                                        </div>
                                    )}

                                    {activeAccessTab === 'gestures' && <GesturePanel />}
                                    {activeAccessTab === 'stt' && <STTPanel />}
                                    {activeAccessTab === 'tts' && <TTSPanel />}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuItem({
    icon: Icon,
    label,
    desc,
    onClick,
    variant = 'default'
}: {
    icon: any,
    label: string,
    desc?: string,
    onClick: () => void,
    variant?: 'default' | 'danger'
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group text-left
                ${variant === 'danger' ? 'hover:bg-red-50' : 'hover:bg-gray-50'}
            `}
        >
            <div className={`p-2 rounded-lg transition-colors ${variant === 'danger' ? 'bg-red-100 text-red-500 group-hover:text-red-600' : 'bg-gray-100 text-gray-600 group-hover:text-brand-primary group-hover:bg-brand-primary/10'}`}>
                <Icon className="w-5 h-5 shadow-sm" />
            </div>
            <div className="flex-1">
                <span className={`block text-sm font-bold transition-colors ${variant === 'danger' ? 'text-red-500 group-hover:text-red-600' : 'text-[#1A2847] group-hover:text-[#1A2847]'}`}>
                    {label}
                </span>
                {desc && <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">{desc}</span>}
            </div>
            {label === 'Accessibility Tools' && <div className="text-gray-300 group-hover:text-[#1A2847] transition-colors">→</div>}
        </button>
    );
}

function AccessTab({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center whitespace-nowrap
                ${active ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#1A2847]'}
            `}
        >
            <Icon className="w-3 h-3" />
            {label}
        </button>
    );
}
