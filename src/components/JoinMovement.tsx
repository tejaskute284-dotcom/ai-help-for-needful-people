import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { api } from '../services/api';

interface JoinMovementProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const JoinMovement = ({ isOpen, onClose, onSuccess }: JoinMovementProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const result = await api.post(endpoint, { email, password });

            setMessage({ type: 'success', text: result.message });
            if (isLogin) {
                // Handle successful login
                api.setToken(result.token);
                onSuccess?.();
            } else {
                setTimeout(() => setIsLogin(true), 2000);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md glass border-white/20 p-8 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/50 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Join the Movement'}</h2>
                            <p className="text-white/60 mt-2">
                                {isLogin ? 'Access your personalized accessibility dashboard.' : 'Be part of the inclusive future.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary transition-colors"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`flex items-center gap-3 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}
                                >
                                    {message.type === 'error' && <AlertCircle size={18} />}
                                    <span>{message.text}</span>
                                </motion.div>
                            )}

                            <Button
                                variant="primary"
                                className="w-full py-4 text-center justify-center"
                                ariaLabel={isLogin ? 'Log In' : 'Sign Up'}
                            >
                                {isLoading ? 'Processing…' : isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                {isLogin ? "Don't have an account? Join us" : "Already a member? Sign in"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
