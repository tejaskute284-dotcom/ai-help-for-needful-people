import { motion } from 'framer-motion';
import { Eye, Ear, Hand, ArrowRight, Zap, Heart } from 'lucide-react';
import type { Mode } from '../App';

interface DashboardProps {
    onSelectMode: (mode: Mode) => void;
}

const modes = [
    {
        id: 'blind' as Mode,
        title: 'Blind Mode',
        description: 'AI Voice Guidance • Object Recognition • Audio Cues',
        icon: Eye,
        color: 'from-brand-primary/10 to-brand-accent/10',
        iconColor: 'text-brand-primary',
        borderColor: 'border-brand-primary/30'
    },
    {
        id: 'deaf' as Mode,
        title: 'Deaf Mode',
        description: 'Real-time Captions • Visual Sound Alerts • Lip Reading',
        icon: Ear,
        color: 'from-brand-secondary/10 to-orange-400/10',
        iconColor: 'text-brand-secondary',
        borderColor: 'border-brand-secondary/30'
    },
    {
        id: 'sign' as Mode,
        title: 'Sign Language',
        description: 'Gesture Navigation • ASL Recognition • Avatar Feedback',
        icon: Hand,
        color: 'from-brand-purple/10 to-purple-400/10',
        iconColor: 'text-brand-purple',
        borderColor: 'border-brand-purple/30'
    }
];

export default function Dashboard({ onSelectMode }: DashboardProps) {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modes.map((mode, index) => (
                    <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectMode(mode.id)}
                        className={`group relative text-left p-8 rounded-[2rem] glass-panel border ${mode.borderColor} overflow-hidden transition-all duration-300`}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className={`w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-12 group-hover:bg-gray-50 transition-colors`}>
                                <mode.icon className={`w-8 h-8 ${mode.iconColor}`} />
                            </div>

                            <h3 className="text-3xl font-bold mb-3 flex items-center gap-2 text-[#1A2847]">
                                {mode.title}
                                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </h3>

                            <p className="text-gray-500 text-lg leading-relaxed">
                                {mode.description}
                            </p>
                        </div>

                        {/* Decorative Corner Element */}
                        <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${mode.iconColor.replace('text', 'bg')}`} />
                    </motion.button>
                ))}
            </div>

            {/* Comfort Meter & Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="clay-card rounded-3xl p-8 flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-rose-500/10 rounded-2xl">
                            <Heart className="w-8 h-8 text-rose-400 fill-rose-400/20" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-[#1A2847]">Emotional Connection</h4>
                            <p className="text-gray-400 text-xs">Sync level: Deep</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end relative z-10">
                        <span className="text-4xl font-bold text-rose-400">98%</span>
                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '98%' }}
                                className="h-full bg-rose-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="clay-card rounded-3xl p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-2xl">
                            <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-[#1A2847]">AI Latency</h4>
                            <p className="text-gray-400 text-xs">Edge processing enabled</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-medium text-[#1A2847]">12ms</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                    </div>
                </div>

                <div className="clay-card rounded-3xl p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-brand-primary/10 rounded-2xl">
                            <Eye className="w-8 h-8 text-brand-primary" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-[#1A2847]">Trust Pulse</h4>
                            <p className="text-gray-400 text-xs">Verifying sensor integrity</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5 items-end h-6">
                            {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: ['20%', '100%', '20%'] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                    className="w-1 bg-brand-primary rounded-full"
                                    style={{ height: `${h * 100}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
