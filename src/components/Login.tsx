import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ArrowRight, Mail, UserPlus, LogIn, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuroraBackground } from './ui/aurora-background';

type AuthMode = 'login' | 'register';

export default function Login() {
    const { login, register, loginWithOAuth, isLoading, error, clearError } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        clearError();
        setSuccessMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage('');

        if (mode === 'register') {
            const success = await register(email, password);
            if (success) {
                setSuccessMessage('Check your email for a confirmation link!');
            }
        } else {
            await login(email, password);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        clearError();
        await loginWithOAuth(provider);
    };

    return (
        <AuroraBackground>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg mx-auto px-6 relative z-10"
            >
                <div className="glass-panel rounded-[3.5rem] p-10 md:p-14 border border-white/20 shadow-2xl backdrop-blur-3xl">
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-20 h-20 bg-brand-primary rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-brand-primary/30"
                        >
                            <Shield className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-text-main">
                            {mode === 'login' ? 'Welcome' : 'Join Us'}
                        </h1>
                        <p className="text-text-muted text-lg font-medium">
                            {mode === 'login' ? 'Continue your compassionate journey' : 'Start empowering human experience'}
                        </p>
                        <p className="text-center text-gray-500 text-sm mt-6">
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={toggleMode} className="text-brand-primary font-semibold hover:underline">
                                {mode === 'login' ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex mb-8 bg-gray-100/50 p-1.5 rounded-[2rem] border border-gray-200/20">
                        <button
                            onClick={() => { setMode('login'); clearError(); setSuccessMessage(''); }}
                            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all flex items-center justify-center gap-3 ${mode === 'login'
                                ? 'bg-white text-brand-primary shadow-xl'
                                : 'text-text-muted hover:text-text-main hover:bg-white/30'
                                }`}
                        >
                            <LogIn size={18} /> Login
                        </button>
                        <button
                            onClick={() => { setMode('register'); clearError(); setSuccessMessage(''); }}
                            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all flex items-center justify-center gap-3 ${mode === 'register'
                                ? 'bg-white text-brand-primary shadow-xl'
                                : 'text-text-muted hover:text-text-main hover:bg-white/30'
                                }`}
                        >
                            <UserPlus size={18} /> Sign Up
                        </button>
                    </div>

                    {/* Error/Success alerts removed for brevity in replacement, but I should keep them for functionality */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600"
                            >
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{error}</span>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600"
                            >
                                <CheckCircle size={20} />
                                <span className="text-sm font-bold">{successMessage}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full h-16 bg-white/50 border border-gray-200 rounded-[1.5rem] pl-14 pr-6 outline-none focus:bg-white focus:shadow-xl focus:shadow-brand-primary/5 transition-all font-bold text-text-main placeholder:text-text-muted/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full h-16 bg-white/50 border border-gray-200 rounded-[1.5rem] pl-14 pr-6 outline-none focus:bg-white focus:shadow-xl focus:shadow-brand-primary/5 transition-all font-bold text-text-main placeholder:text-text-muted/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full h-16 bg-brand-primary text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/30 transition-all hover:bg-brand-primary/90 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In' : 'Get Started'} <ArrowRight size={24} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                        <p className="text-center text-text-muted text-sm font-bold uppercase tracking-widest">Or Continue With</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleOAuthLogin('google')} className="flex items-center justify-center gap-3 h-14 glass-panel rounded-2xl hover:bg-white transition-all font-bold text-text-main">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                            <button onClick={() => handleOAuthLogin('github')} className="flex items-center justify-center gap-3 h-14 bg-text-main rounded-2xl text-white font-bold hover:shadow-xl transition-all">
                                <Shield size={18} /> GitHub
                            </button>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 flex flex-center justify-center items-center gap-3 text-text-muted/60 font-bold text-xs uppercase tracking-widest"
                >
                    <Sparkles size={14} />
                    <span>Powered by Supabase & Open Source AI</span>
                </motion.div>
            </motion.div>
        </AuroraBackground>
    );
}
