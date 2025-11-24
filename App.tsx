import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { SmartQuoteWidget } from './components/SmartQuoteWidget';
import { GoogleReviewsWidget } from './components/GoogleReviewsWidget';
import { motion } from 'framer-motion';
import { MessageSquareQuote, Phone, Star, CheckCircle2 } from 'lucide-react';

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
  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
  const [showQuoteTooltip, setShowQuoteTooltip] = useState(false);
  const [showReviewTooltip, setShowReviewTooltip] = useState(false);

  // Close reviews if quote opens to prevent stacking
  const handleOpenQuote = () => {
    setIsReviewsOpen(false);
    setIsQuoteOpen(true);
  };

  // Show tooltips after page load
  React.useEffect(() => {
    const timer1 = setTimeout(() => setShowQuoteTooltip(true), 2000);
    const timer2 = setTimeout(() => setShowQuoteTooltip(false), 7000);
    const timer3 = setTimeout(() => setShowReviewTooltip(true), 8000);
    const timer4 = setTimeout(() => setShowReviewTooltip(false), 13000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

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
            {/* NEW: Bottom Left Google Reviews Badge Trigger */}
            <motion.div
                className="fixed bottom-6 left-6 z-30 hidden sm:block"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div className="relative">
                    <button
                        onClick={() => {
                            setIsReviewsOpen(true);
                            setShowReviewTooltip(false);
                        }}
                        onMouseEnter={() => setShowReviewTooltip(true)}
                        onMouseLeave={() => setShowReviewTooltip(false)}
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

                    {/* Animated Tooltip Bubble */}
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                        animate={{
                            opacity: showReviewTooltip ? 1 : 0,
                            x: showReviewTooltip ? 0 : -20,
                            scale: showReviewTooltip ? 1 : 0.8
                        }}
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-2xl relative">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">⭐</span>
                                <div className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">See What Customers Say</div>
                            </div>
                            <div className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">72 verified reviews • 5.0 rating</div>
                            {/* Arrow */}
                            <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white dark:border-r-slate-800"></div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Mobile Only: Simple Review Button Bottom Left */}
            <motion.button
                 onClick={() => setIsReviewsOpen(true)}
                 className="fixed bottom-6 left-4 z-30 sm:hidden bg-white dark:bg-slate-900 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 text-yellow-500"
            >
                <Star className="w-6 h-6 fill-current" />
            </motion.button>

            {/* Right Side Action Group */}
            <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-4 items-end">
                {/* Floating Call Button (Small) */}
                <motion.div className="relative">
                    <motion.a
                    href="tel:+14038303311"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setShowPhoneTooltip(true)}
                    onMouseLeave={() => setShowPhoneTooltip(false)}
                    className="bg-white text-brand-600 p-3 rounded-full shadow-xl border border-brand-100 flex items-center justify-center group relative"
                    aria-label="Call Us"
                    >
                    <Phone className="w-6 h-6" />
                    </motion.a>

                    {/* Animated Tooltip Bubble */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{
                            opacity: showPhoneTooltip ? 1 : 0,
                            x: showPhoneTooltip ? 0 : 20,
                            scale: showPhoneTooltip ? 1 : 0.8
                        }}
                        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl relative">
                            <div className="text-xs font-bold whitespace-nowrap">📞 Quick Questions?</div>
                            <div className="text-[10px] text-slate-300 whitespace-nowrap">(403) 830-3311</div>
                            {/* Arrow */}
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Main FAB */}
                <motion.div className="relative">
                    <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setIsQuoteOpen(true);
                        setShowQuoteTooltip(false);
                    }}
                    onMouseEnter={() => setShowQuoteTooltip(true)}
                    onMouseLeave={() => setShowQuoteTooltip(false)}
                    className="bg-gradient-to-br from-brand-400 to-brand-600 text-white p-4 rounded-full shadow-2xl shadow-brand-500/40 flex items-center justify-center group relative"
                    aria-label="Get Smart Quote"
                    >
                    {/* Ping Effect */}
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping pointer-events-none"></div>
                    <MessageSquareQuote className="w-7 h-7" />
                    </motion.button>

                    {/* Animated Tooltip Bubble */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{
                            opacity: showQuoteTooltip ? 1 : 0,
                            x: showQuoteTooltip ? 0 : 20,
                            scale: showQuoteTooltip ? 1 : 0.8
                        }}
                        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-3 rounded-xl shadow-2xl relative">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">✨</span>
                                <div className="text-xs font-bold whitespace-nowrap">Get Instant Pricing!</div>
                            </div>
                            <div className="text-[10px] text-brand-100 whitespace-nowrap">Takes 60 seconds • No commitment</div>
                            {/* Arrow */}
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-brand-500"></div>
                            {/* Pulse animation */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-xl bg-white opacity-10"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </>
      )}
    </div>
  );
}