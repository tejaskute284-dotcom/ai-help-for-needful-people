import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera } from 'lucide-react';
import Assistant from './components/Assistant';
import BlindMode from './modes/BlindMode';
import DeafMode from './modes/DeafMode';
import SignLanguageMode from './modes/SignLanguageMode';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { useAccessibility } from './context/AccessibilityContext';

export type Mode = 'none' | 'blind' | 'deaf' | 'sign';

function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { announce } = useAccessibility();
  const [activeMode, setActiveMode] = useState<Mode>('none');
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (activeMode !== 'none' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${activeMode} mode activated`);
      window.speechSynthesis.speak(utterance);
    }
  }, [activeMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030712]">
        <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary">
      <Navbar
        onJoinClick={() => setIsAssistantExpanded(true)}
        isLoggedIn={isAuthenticated}
        onLogout={logout}
        onDashboardClick={() => setActiveMode('none')}
        onHomeClick={() => setActiveMode('none')}
      />

      <main className="relative">
        <AnimatePresence mode="wait">
          {activeMode === 'none' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onJoinClick={() => {
                const element = document.getElementById('mode-selection');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                  announce('Navigating to mode selection', 'info');
                }
              }} />

              <div id="mode-selection" className="max-w-7xl mx-auto px-6 py-20">
                <header className="mb-16 text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-text-main mb-6 tracking-tight"
                  >
                    Select Your <span className="text-brand-primary">Mode</span>
                  </motion.h2>
                  <p className="text-xl text-text-muted max-w-2xl mx-auto">
                    Choose the interface that works best for your current needs.
                  </p>
                </header>
                <Dashboard onSelectMode={setActiveMode} />
              </div>
            </motion.div>
          )}

          {activeMode === 'blind' && (
            <motion.div
              key="blind-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pt-32 px-6"
            >
              <BlindMode onBack={() => setActiveMode('none')} />
            </motion.div>
          )}

          {activeMode === 'deaf' && (
            <motion.div
              key="deaf-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pt-32 px-6"
            >
              <DeafMode onBack={() => setActiveMode('none')} />
            </motion.div>
          )}

          {activeMode === 'sign' && (
            <motion.div
              key="sign-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pt-32 px-6"
            >
              <SignLanguageMode onBack={() => setActiveMode('none')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Assistant Control */}
      <Assistant
        activeMode={activeMode}
        isExpanded={isAssistantExpanded}
        setIsExpanded={setIsAssistantExpanded}
      />

      {/* Quick Controls Bar (Mobile Optimized) */}
      {!isAssistantExpanded && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel rounded-full px-8 py-4 flex gap-10 items-center z-50 backdrop-blur-3xl shadow-2xl border border-white/20"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1 }}
        >
          <button
            className="p-2 text-white/60 hover:text-brand-primary transition-colors"
            aria-label="Quick Voice Command"
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            className="p-2 text-white/60 hover:text-brand-primary transition-colors"
            aria-label="Quick Camera Scan"
          >
            <Camera className="w-6 h-6" />
          </button>
        </motion.div>
      )}

      {/* Profile Modal */}
      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default App;
