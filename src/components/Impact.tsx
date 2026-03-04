import { motion } from 'framer-motion';
import { Button } from './Button';

export const Impact = () => {
    return (
        <section id="impact" className="py-24 px-6 bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-3xl overflow-hidden glass border-white/5 group"
                        >
                            <img
                                src="/diverse_users_accessibility.png"
                                alt="Diverse people using accessible technology"
                                width={600}
                                height={600}
                                className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <p className="text-2xl font-bold text-white mb-2">Built for Everyone</p>
                                <p className="text-white/70">Empowering elderly, non-technical, and disabled users alike.</p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="order-1 lg:order-2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 italic">"No One Left Behind."</h2>
                        <div className="space-y-8">
                            <div className="glass p-6 border-l-4 border-secondary">
                                <p className="text-xl italic text-white/90">
                                    "This technology changed how I interact with my grandchildren. I don't feel lost in the digital world anymore."
                                </p>
                                <p className="mt-4 font-bold">— Maria, 72, retired teacher</p>
                            </div>
                            <p className="text-xl text-white/70 leading-relaxed">
                                Accessibility AI is more than a tool; it's a movement towards
                                universal digital inclusion. We create interfaces that adapt to
                                the user, not the other way around.
                            </p>
                            <Button variant="secondary">Read Success Stories</Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
