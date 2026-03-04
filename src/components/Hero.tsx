import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero = ({ onJoinClick }: { onJoinClick: () => void }) => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
            {/* High-quality background accents following MASTER.md */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sky-400/5 blur-[140px] -z-10 animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10 px-6 max-w-5xl"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8"
                >
                    <Sparkles size={16} className="text-blue-500" />
                    <span>EMPOWERING EVERY JOURNEY</span>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-[1.1] text-slate-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Inclusive Tech for a <br />
                    <span className="text-gradient">Limitless World</span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-slate-600 mb-12 font-medium max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Experience the digital landscape through advanced vision, sound, and gesture intelligence.
                    Building a future where accessibility is a standard, not an option.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <button
                        onClick={onJoinClick}
                        className="btn-primary flex items-center gap-2 group w-full sm:w-auto"
                        aria-label="Join our movement"
                    >
                        Join the Movement
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        className="h-[44px] min-h-[44px] px-8 py-3 rounded-lg border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-colors focus-ring w-full sm:w-auto"
                        aria-label="Learn more about our technology"
                    >
                        Learn More
                    </button>
                </motion.div>
            </motion.div>

            {/* Premium Floating Elements Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        y: [0, -40, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 -right-16 w-32 h-32 glass-panel flex items-center justify-center opacity-40 blur-[1px] hidden lg:flex rounded-3xl"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        rotate: [0, -10, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 -left-16 w-40 h-40 glass-panel flex items-center justify-center opacity-40 blur-[1px] hidden lg:flex rounded-[2.5rem]"
                >
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl" />
                </motion.div>
            </div>
        </section>
    );
};
