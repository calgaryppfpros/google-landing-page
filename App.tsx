import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SmartQuoteWidget } from './components/SmartQuoteWidget';
import { GoogleReviewsWidget } from './components/GoogleReviewsWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareQuote, Star, CheckCircle2, X } from 'lucide-react';

// Google 'G' Logo Component
const GoogleG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function App() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  useEffect(() => {
    // Show bubble after 15 seconds to allow user to explore first
    const timer = setTimeout(() => {
      setIsBubbleVisible(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Close reviews if quote opens to prevent stacking
  const handleOpenQuote = () => {
    setIsReviewsOpen(false);
    setIsBubbleVisible(false); // Hide bubble when interacting
    setIsQuoteOpen(true);
  };

  const handleCloseBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBubbleVisible(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Content wrapper that shifts right when sidebar is open */}
      <motion.div
        animate={{ x: isReviewsOpen ? 380 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`will-change-transform origin-left w-full ${isReviewsOpen ? 'cursor-pointer opacity-90' : ''}`}
        onClick={() => isReviewsOpen && setIsReviewsOpen(false)}
      >
          <LandingPage onOpenQuote={handleOpenQuote} />
      </motion.div>
      
      <GoogleReviewsWidget 
        isOpen={isReviewsOpen} 
        onToggle={() => setIsReviewsOpen(!isReviewsOpen)} 
      />
      
      <SmartQuoteWidget 
        isOpen={isQuoteOpen} 
        onClose={() => setIsQuoteOpen(false)} 
      />

      {/* Floating Action Elements - Only visible when modal is closed */}
      {!isQuoteOpen && !isReviewsOpen && (
        <>
            {/* Google Reviews Badge Trigger - Unified for Mobile & Desktop */}
            <motion.div 
                className="fixed bottom-6 left-4 sm:left-6 z-30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <button
                    onClick={() => setIsReviewsOpen(true)}
                    className="bg-white dark:bg-slate-900 rounded-full shadow-xl shadow-slate-200 dark:shadow-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 pr-5 flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform group"
                >
                    <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                         <GoogleG />
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white text-sm leading-none pt-0.5">5.0</span>
                            <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">(72 Reviews)</span>
                            <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/10" />
                        </div>
                    </div>
                </button>
            </motion.div>

            {/* Right Side Action Group */}
            <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-4 items-end pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-end gap-4">
                    {/* Main FAB Container */}
                    <div className="relative">
                        {/* Engagement Bubble - Positioned on Top & Right Aligned */}
                        <AnimatePresence>
                            {isBubbleVisible && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8, x: 0 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    className="absolute bottom-[calc(100%+20px)] right-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 z-40 w-max origin-bottom-right"
                                >
                                    <div className="relative flex-shrink-0">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xs leading-tight">Curious what it costs for YOUR vehicle?</span>
                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Smart form adapts to your vehicle • Instant pricing ⚡</span>
                                    </div>

                                    {/* Arrow Pointing Down - Aligned to center of FAB (approx 30px from right) */}
                                    <div className="absolute -bottom-1.5 right-6 w-2.5 h-2.5 bg-white dark:bg-slate-800 transform rotate-45 border-b border-r border-slate-100 dark:border-slate-700"></div>

                                    {/* Close */}
                                    <button
                                        onClick={handleCloseBubble}
                                        className="absolute -top-1.5 -right-1.5 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-0.5 hover:scale-110 transition shadow-sm border border-slate-200 dark:border-slate-600"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main FAB */}
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={isBubbleVisible ? { 
                                scale: 1,
                                rotate: [0, -10, 10, -10, 10, 0],
                                opacity: 1
                            } : { scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ 
                                rotate: { 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    repeatDelay: 3.5,
                                    ease: "easeInOut"
                                }
                            }}
                            whileHover={{ scale: 1.1, rotate: 0 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setIsQuoteOpen(true); setIsBubbleVisible(false); }}
                            className="bg-gradient-to-br from-brand-400 to-brand-600 text-white p-4 rounded-full shadow-2xl shadow-brand-500/40 flex items-center justify-center group relative z-50"
                            aria-label="Get Smart Quote"
                        >
                            <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Get a Quote
                            </span>
                            {/* Ping Effect */}
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping pointer-events-none"></div>
                            <MessageSquareQuote className="w-7 h-7" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
}