import { Mic, Eye, Type, MessageSquare, Contrast, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { api } from '../services/api';

const features = [
    {
        icon: <Mic className="w-8 h-8" />,
        title: "Voice Navigation",
        description: "Navigate complex interfaces using only your voice with zero latency.",
        className: "md:col-span-2 md:row-span-2 bg-brand-primary/10 border-brand-primary/20",
        action: "Listening for commands…",
        iconColor: "text-brand-primary"
    },
    {
        icon: <Eye className="w-6 h-6" />,
        title: "Screen AI",
        description: "Deep content understanding for images.",
        className: "md:col-span-1 md:row-span-1 bg-brand-purple/10 border-brand-purple/20",
        action: "Analyzing screen content…",
        iconColor: "text-brand-purple"
    },
    {
        icon: <Type className="w-6 h-6" />,
        title: "CapSync",
        description: "Instant, accurate medical-grade captions.",
        className: "md:col-span-1 md:row-span-2 bg-brand-secondary/10 border-brand-secondary/20",
        action: "Generating captions…",
        iconColor: "text-brand-secondary"
    },
    {
        icon: <MessageSquare className="w-6 h-6" />,
        title: "Sign Trans",
        description: "Vision that translates sign language.",
        className: "md:col-span-1 md:row-span-1 bg-brand-accent/10 border-brand-accent/20",
        action: "Detecting gestures…",
        iconColor: "text-brand-accent"
    },
    {
        icon: <Contrast className="w-8 h-8" />,
        title: "Smart Contrast",
        description: "Dynamic color adjustments tailored to individual needs.",
        className: "md:col-span-2 md:row-span-1 bg-white/[0.03] border-white/10",
        action: "Optimizing colors…",
        iconColor: "text-white"
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Biometrics",
        description: "Advanced biometric security.",
        className: "md:col-span-1 md:row-span-1 bg-red-500/10 border-red-500/20",
        action: "Verifying identity…",
        iconColor: "text-red-400"
    }
];

export const Features = () => {
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const handleFeatureClick = async (title: string, action: string) => {
        setActiveAction(action);
        setAiResponse(null);

        try {
            const response = await api.post('/ai/process', { feature: title, action });
            setAiResponse(response.response);
        } catch (error) {
            setAiResponse(action);
        }

        setTimeout(() => {
            setActiveAction(null);
            setAiResponse(null);
        }, 5000);
    };

    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">AI Capabilities</h2>
                        <p className="text-xl text-slate-400 max-w-xl font-medium">
                            Breaking digital barriers with our advanced <span className="text-white">Bento Ecosystem</span>.
                        </p>
                    </div>
                </div>

                <div className="bento-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleFeatureClick(feature.title, feature.action)}
                            className={`group p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between ${feature.className} hover:scale-[1.02] hover:shadow-2xl`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/20 border border-white/5 ${feature.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>

                            {activeAction === feature.action && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 py-3 px-4 bg-white/10 rounded-2xl text-sm font-bold text-white border border-white/10"
                                >
                                    {aiResponse || 'AI is thinking…'}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
