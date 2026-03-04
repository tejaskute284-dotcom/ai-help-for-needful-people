import { motion } from 'framer-motion';
import { Eye, Ear, Hand, Heart, Cpu, Activity, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const Dashboard = ({ onSelectMode }: { onSelectMode: (mode: any) => void }) => {
    const { announce } = useAccessibility();

    const handleModeSelect = (mode: string, label: string) => {
        announce(`${label} mode activated. Welcome to your personalized experience.`, 'success');
        onSelectMode(mode);
    };

    const modes = [
        {
            id: "blind",
            title: "Visual Aid",
            description: "AI-powered vision for total independence",
            icon: <Eye size={32} />,
            gradient: "from-blue-500/20 to-brand-primary/10",
            accent: "text-blue-400",
            stats: "99.8% Object Accuracy"
        },
        {
            id: "deaf",
            title: "Hearing Support",
            description: "Real-time sound-to-visual conversion",
            icon: <Ear size={32} />,
            gradient: "from-amber-500/20 to-orange-500/10",
            accent: "text-amber-400",
            stats: "Real-time Processing"
        },
        {
            id: "sign",
            title: "Gesture Studio",
            description: "Smart sign language interpretation",
            icon: <Hand size={32} />,
            gradient: "from-emerald-500/20 to-teal-500/10",
            accent: "text-emerald-400",
            stats: "32 Gestures Supported"
        }
    ];

    return (
        <div className="space-y-16">
            {/* Bento Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {modes.map((mode, idx) => (
                    <motion.div
                        key={mode.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -10 }}
                        onClick={() => handleModeSelect(mode.id, mode.title)}
                        className="group relative cursor-pointer"
                    >
                        <div className={`clay-card h-full p-8 relative overflow-hidden flex flex-col`}>
                            {/* Background Glow */}
                            <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${mode.gradient} blur-3xl group-hover:scale-150 transition-transform duration-700 opacity-50`} />

                            <div className={`w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-8 ${mode.accent} shadow-2xl`}>
                                {mode.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs font-black uppercase tracking-widest ${mode.accent}`}>Recommended</span>
                                    <div className={`h-px flex-1 bg-gradient-to-r from-white/20 to-transparent`} />
                                </div>
                                <h3 className="text-3xl font-black text-text-main mb-4 tracking-tight group-hover:translate-x-1 transition-transform">
                                    {mode.title}
                                </h3>
                                <p className="text-text-muted font-medium mb-8 leading-relaxed">
                                    {mode.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                <span className="text-sm font-bold text-text-muted">{mode.stats}</span>
                                <div className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all`}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Experience Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 rounded-[2.5rem] border border-white/20"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                            <Heart size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-text-main">Trust Map</h4>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Global Connection</p>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "94%" }}
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                        />
                    </div>
                    <p className="mt-4 text-3xl font-black text-text-main">94% <span className="text-sm text-text-muted">Empathy Score</span></p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-8 rounded-[2.5rem] border border-white/20"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-text-main">Neural Sync</h4>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Processing Latency</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 h-12">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                className="flex-1 bg-brand-primary/40 rounded-t-sm"
                            />
                        ))}
                    </div>
                    <p className="mt-4 text-3xl font-black text-text-main">12ms <span className="text-sm text-text-muted">Avg Response</span></p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-8 rounded-[2.5rem] border border-white/20"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-text-main">System Core</h4>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Neural Readiness</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="font-bold text-emerald-400">Vision & Audio Intelligence Active</span>
                    </div>
                    <p className="mt-4 text-3xl font-black text-text-main">3 <span className="text-sm text-text-muted">Core Modules</span></p>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
