import React, { useState, useEffect, useRef } from 'react';
import { Star, Shield, Sun, Moon, Droplets, Eye, Wrench, Play, CheckCircle, ChevronDown, Mail, Menu, Sparkles, Phone, Tag, Award, Timer, Check, Layers, ShieldCheck, Ghost, Palette, MousePointerClick, RefreshCcw, X, ArrowRight, Loader2, Maximize2, Armchair, History, Trophy, Globe, Car, HeartHandshake, MapPin, Users, Ticket, Copy, Zap } from 'lucide-react';
import { PROMOS, CAR_COLORS, CarColor } from '../types';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

interface Props {
  onOpenQuote: () => void;
}

// --- Antigravity Physics Engine (Mobile Optimized & High DPI) ---
const MOUSE_INFLUENCE_RADIUS = 350;
const MOUSE_REPULSION_STRENGTH = 3;
const FRICTION = 0.95;
const FLOAT_SPEED = 0.3;

class DebrisParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotSpeed: number;
    depth: number; // 0.1 (far) to 1.0 (near)
    color: string;
    shape: 'rect';
    aspectRatio: number;

    constructor(width: number, height: number, theme: 'light' | 'dark') {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * FLOAT_SPEED;
        this.vy = (Math.random() - 0.5) * FLOAT_SPEED;
        
        // Depth creates parallax and size variation
        this.depth = Math.random() * 0.8 + 0.2; 
        
        // Size based on depth
        const baseSize = Math.random() * 8 + 3;
        this.size = baseSize * this.depth;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
        this.aspectRatio = Math.random() * 3 + 1.5;

        // Theme-aware colors
        const colorsLight = ['#ef4444', '#dc2626', '#334155', '#0ea5e9', '#cbd5e1'];
        const colorsDark = ['#ef4444', '#b91c1c', '#38bdf8', '#ffffff', '#475569'];
        const palette = theme === 'dark' ? colorsDark : colorsLight;
        this.color = palette[Math.floor(Math.random() * palette.length)];

        this.shape = 'rect';
    }

    update(width: number, height: number, inputX: number, inputY: number) {
        // 1. Interaction (Magnetic Repulsion)
        const dx = this.x - inputX;
        const dy = this.y - inputY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < MOUSE_INFLUENCE_RADIUS) {
            const force = (MOUSE_INFLUENCE_RADIUS - dist) / MOUSE_INFLUENCE_RADIUS;
            const ease = force * force; 
            const angle = Math.atan2(dy, dx);
            const push = ease * MOUSE_REPULSION_STRENGTH * this.depth;
            
            this.vx += Math.cos(angle) * push;
            this.vy += Math.sin(angle) * push;
        }

        // 2. Physics & Friction
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // 3. Float Keepalive
        if (Math.abs(this.vx) < FLOAT_SPEED * 0.2) this.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(this.vy) < FLOAT_SPEED * 0.2) this.vy += (Math.random() - 0.5) * 0.05;

        // 4. Infinite Canvas Wrap
        if (this.x < -100) this.x = width + 100;
        if (this.x > width + 100) this.x = -100;
        if (this.y < -100) this.y = height + 100;
        if (this.y > height + 100) this.y = -100;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5 + (this.depth * 0.5); 

        const w = this.size * this.aspectRatio;
        const h = this.size;
        this.drawRoundedRect(ctx, -w/2, -h/2, w, h, h/2);
        ctx.fill();
        
        ctx.restore();
    }

    drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}

const GravityCanvas: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<DebrisParticle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Init Particles with Mobile Optimization
        const init = () => {
            // High DPI Scaling
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            
            ctx.scale(dpr, dpr);

            // Determine particle count based on screen size
            const isMobile = window.innerWidth < 768;
            const count = isMobile ? 60 : 140; // Reduced count for mobile performance
            
            particlesRef.current = Array.from({ length: count }, () => new DebrisParticle(window.innerWidth, window.innerHeight, theme));
        };
        init();

        // Handle both Mouse and Touch
        const updateInput = (x: number, y: number) => {
             const rect = canvas.getBoundingClientRect();
             inputRef.current = {
                 x: x - rect.left,
                 y: y - rect.top
             };
        };

        const handleMouseMove = (e: MouseEvent) => updateInput(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if(e.touches.length > 0) {
                updateInput(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleResize = () => init();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('resize', handleResize);

        const animate = () => {
            // Clear logical pixels
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            
            particlesRef.current.forEach(p => {
                p.update(window.innerWidth, window.innerHeight, inputRef.current.x, inputRef.current.y);
                p.draw(ctx);
            });

            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [theme]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// Custom Logo Component
const BrandLogo = ({ forceTheme }: { forceTheme?: 'light' | 'dark' }) => {
  const lightLogo = "https://imagedelivery.net/M6yPAnH_Zd_28iUzKcUW1A/1b5d4695-5480-470c-ae73-d9c2aa7a0d00/public";
  const darkLogo = "https://imagedelivery.net/M6yPAnH_Zd_28iUzKcUW1A/ffec02ed-f8fc-4cd7-fccd-e08157cb1c00/public";

  const renderImg = (src: string, className: string) => (
    <img 
        src={src} 
        alt="PPF Pros" 
        className={className} 
    />
  );

  if (forceTheme === 'dark') return renderImg(darkLogo, "h-8 md:h-10 w-auto");
  if (forceTheme === 'light') return renderImg(lightLogo, "h-8 md:h-10 w-auto");

  return (
    <>
      {renderImg(lightLogo, "h-8 md:h-10 w-auto block dark:hidden")}
      {renderImg(darkLogo, "h-8 md:h-10 w-auto hidden dark:block")}
    </>
  );
};

export const LandingPage: React.FC<Props> = ({ onOpenQuote }) => {
  const [email, setEmail] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeColor, setActiveColor] = useState(CAR_COLORS[2]);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const { scrollY } = useScroll();
  
  // Hero Opacity Logic: Fade out as user scrolls
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 100]); 

  // Header Animation Transforms
  const navTop = useTransform(scrollY, [0, 100], ["1rem", "0rem"]);
  const navWidth = useTransform(scrollY, [0, 100], ["95%", "100%"]);
  const navMaxWidth = useTransform(scrollY, [0, 100], ["1280px", "100%"]); // Constrain to 7xl (approx 1280) then go full
  const navRadius = useTransform(scrollY, [0, 100], ["1rem", "0rem"]);
  const navBlur = useTransform(scrollY, [0, 100], [0, 12]);
  const navBgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const navBorderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  // Dark Mode State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Dynamic Styles for Header based on Theme
  const navBg = useMotionTemplate`rgba(${theme === 'dark' ? '2, 6, 23' : '255, 255, 255'}, ${navBgOpacity})`;
  const navBorderColor = useMotionTemplate`rgba(${theme === 'dark' ? '30, 41, 59' : '226, 232, 240'}, ${navBorderOpacity})`;
  const backdropFilter = useMotionTemplate`blur(${navBlur}px)`;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
        await fetch('https://n8n.srv1046173.hstgr.cloud/webhook/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'Landing Page Footer', date: new Date().toISOString() })
        });

        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'newsletter_signup',
                location: 'footer'
            });
        }

        alert(`Thanks for joining! ${email} has been added to the Car Care Advantage list.`);
        setEmail('');
    } catch (err) {
        console.error("Newsletter error", err);
        alert("There was an error subscribing. Please try again.");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // --- 3D Tilt Logic for Hero ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = (mouseX / width) - 0.5;
      const yPct = (mouseY / height) - 0.5;
      x.set(xPct);
      y.set(yPct);
  };

  const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 overflow-x-hidden font-inter transition-colors duration-300">
      {/* Modern Sticky Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      >
        <motion.div 
            style={{ 
                top: navTop,
                width: navWidth,
                maxWidth: navMaxWidth,
                borderRadius: navRadius,
                backgroundColor: navBg,
                borderColor: navBorderColor,
                backdropFilter: backdropFilter,
            }}
            className="pointer-events-auto flex items-center justify-between px-6 py-3 border border-transparent shadow-sm transition-shadow duration-300"
        >
            {/* Logo Area */}
            <div 
                className="flex items-center gap-3 cursor-pointer text-slate-900 dark:text-white transition-transform hover:scale-105" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <BrandLogo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 px-6 py-2">
                {['Services', 'Technology', 'Process', 'About'].map((item) => (
                    <button 
                        key={item}
                        onClick={() => scrollToSection(item.toLowerCase())} 
                        className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors relative group"
                    >
                        {item}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-500 transition-all group-hover:w-1/2"></span>
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                {/* Phone Button - Visible on Mobile Only (md:hidden) */}
                <a href="tel:+14038303311" className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors">
                    <Phone className="w-4 h-4" />
                </a>

                {/* CTA Button */}
                <button 
                    onClick={onOpenQuote} 
                    className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-red-600 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-5 py-2 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                    <span>Get Quote</span>
                    <ArrowRight className="w-4 h-4" />
                </button>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </motion.div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="absolute top-20 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto z-50"
                >
                    <div className="p-4 space-y-2">
                        {['Services', 'Technology', 'Process', 'About'].map((item) => (
                            <button 
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className="block w-full text-left font-bold text-lg text-slate-800 dark:text-slate-200 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                {item}
                            </button>
                        ))}
                        <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                            <a href="tel:+14038303311" className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-400 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                                <Phone className="w-5 h-5" /> (403) 830-3311
                            </a>
                        </div>
                        <button 
                            onClick={() => { onOpenQuote(); setMobileMenuOpen(false); }} 
                            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2"
                        >
                           <Tag className="w-4 h-4" /> Black Friday Quote
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.header>

      {/* --- IMPACTFUL BLACK FRIDAY HERO SECTION --- */}
      <section 
        className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500"
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
      >
        {/* 1. Background Elements */}
        <div className="absolute inset-0 z-0">
            {/* Theme-Aware Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-black dark:via-slate-900 dark:to-slate-950 opacity-90 transition-colors duration-500"></div>
            
            {/* Atmospheric Glow - Adjusted for Light Mode */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-600/10 dark:bg-red-600/20 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 dark:bg-brand-600/20 rounded-full blur-[120px]"></div>
        </div>

        {/* 2. Interactive Gravity Canvas (Debris) */}
        <motion.div 
            style={{ opacity: heroOpacity, y: heroY }} 
            className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        >
            <GravityCanvas theme={theme} />
        </motion.div>

        {/* 3. Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 perspective-1000">
          <div className="max-w-5xl mx-auto text-center md:text-left">
            
            {/* BLACK FRIDAY BADGE */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 inline-flex justify-center md:justify-start w-full md:w-auto"
            >
                <div className="bg-red-600 text-white px-6 py-2 rounded-full border border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] flex items-center gap-3 animate-pulse">
                    <span className="font-black text-sm tracking-widest uppercase flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Black Friday Sale
                    </span>
                    <span className="bg-white text-red-600 px-2 py-0.5 rounded text-[11px] font-bold">LIVE NOW</span>
                </div>
            </motion.div>

            {/* TRUST BADGE (Mobile Optimized) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center md:justify-start mb-6"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm sm:text-base font-bold shadow-sm">
                    <Award className="w-5 h-5 md:w-4 md:h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                    <span>Calgary's Premier Protection Studio • 25+ Years Experience</span>
                </div>
            </motion.div>
            
            {/* 3D TILT HEADLINE */}
            <motion.div
              style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d"
              }}
              className="perspective-1000"
            >
              <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl">
                <span className="block">BLACK</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-brand-600">
                  FRIDAY
                </span>
                <span className="block text-4xl sm:text-5xl md:text-7xl mt-2 text-slate-500 dark:text-slate-300">PROTECTION EVENT</span>
              </h1>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto md:mx-0 font-medium"
            >
              Don't wait for the first rock chip. Secure the year's best pricing on XPEL Paint Protection Film and Ceramic Coating. 
              <span className="text-slate-900 dark:text-white block mt-2 font-bold">Limited spots available for 2025 pricing.</span>
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <button onClick={onOpenQuote} className="inline-flex justify-center items-center px-10 py-5 text-xl font-black text-white bg-red-600 rounded-full hover:bg-red-700 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 ring-4 ring-red-600/20">
                CLAIM OFFER <ArrowRight className="w-6 h-6 ml-2" />
              </button>
              <a href="tel:+14038303311" className="inline-flex justify-center items-center px-10 py-5 text-lg font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                Call (403) 830-3311
              </a>
            </motion.div>

            <div className="mt-12 flex items-center justify-center md:justify-start gap-8">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                         <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-lg relative">
                             <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Client" />
                         </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-brand-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        1k+
                    </div>
                </div>
                <div className="text-left">
                    <div className="flex text-yellow-400 mb-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="font-bold text-slate-500 dark:text-slate-300 text-lg">
                        Calgary's Top Rated
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW PROMOTIONS SECTION (Mobile Friendly) */}
      <section className="py-20 bg-white dark:bg-slate-900 relative overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
        {/* Black Friday decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-brand-600 to-red-600"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
            {/* Fixed Mobile Alignment: items-start on mobile, items-end on md */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-500 border border-red-600/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <Zap className="w-4 h-4" /> Doorbuster Deals
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Stackable Savings</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                    Apply these codes during your quote to unlock exclusive Black Friday pricing.
                </p>
            </div>

            {/* Mobile-Friendly Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {PROMOS.map((promo, idx) => (
                    <div key={idx} className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 p-6 rounded-2xl relative group hover:border-red-500/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between min-h-[220px]">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-brand-600 dark:text-brand-400 font-black text-2xl tracking-wide font-mono bg-white dark:bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                    {promo.code}
                                </div>
                                <div className="text-slate-400 group-hover:text-red-500 transition-colors">
                                    <Ticket className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-slate-900 dark:text-white font-bold text-lg mb-2 leading-tight">{promo.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{promo.rules}</p>
                        </div>
                        <button 
                            onClick={() => {navigator.clipboard.writeText(promo.code); alert('Code copied!')}}
                            className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-red-600 dark:hover:bg-red-600 text-slate-800 dark:text-white hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy className="w-4 h-4" /> Copy Code
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* NEW: Trust Indicators Strip */}
      <section className="bg-slate-100 dark:bg-slate-950 py-12 border-y border-slate-200 dark:border-slate-800 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
                  <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white dark:bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none">
                          <Award className="w-8 h-8 text-brand-500 dark:text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">3× Consumer Choice Award</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Calgary's Highest-Rated PPF Shop</p>
                      </div>
                  </div>
                   <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white dark:bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none">
                          <ShieldCheck className="w-8 h-8 text-brand-500 dark:text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Authorized XPEL Dealer</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">1 of Only 5 in Calgary</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white dark:bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none">
                          <Globe className="w-8 h-8 text-brand-500 dark:text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">10-Year Warranty</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Honored at 1,000+ Shops</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white dark:bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none">
                          <Car className="w-8 h-8 text-brand-500 dark:text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Uber Rides</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">On Select Services</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Your Paint is Under Constant Attack Section */}
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full border border-red-200 dark:border-red-800">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-bold text-sm">The Reality of Calgary Driving</span>
                  </div>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl md:text-6xl font-black text-center mb-6">
                  <span className="text-slate-900 dark:text-white">Your Paint is Under </span>
                  <span className="text-red-600 dark:text-red-500">Constant Attack</span>
              </h2>

              <p className="text-center text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto mb-16">
                  Calgary roads destroy more paint than anywhere else in Canada. Here's what your vehicle faces every single day:
              </p>

              {/* Threat Cards */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                  {/* Gravel Season */}
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-100 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                  >
                      <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Gravel Season = Chip Season</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                          Calgary uses <strong>millions of pounds of gravel</strong> every winter for traction. One Deerfoot commute = 5-10 rock impacts.
                      </p>
                      <p className="text-red-600 dark:text-red-400 font-bold text-sm">
                          Result: Hood repaints cost $1,500-2,500
                      </p>
                  </motion.div>

                  {/* Road Salt */}
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors"
                  >
                      <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Road Salt Corrosion</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                          Winter road salt bonds to paint and undercarriage, causing <strong>permanent staining and rust</strong> within 3-5 years.
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                          Result: 15-20% lower resale value
                      </p>
                  </motion.div>

                  {/* UV Damage */}
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-100 dark:border-slate-700 hover:border-yellow-200 dark:hover:border-yellow-800 transition-colors"
                  >
                      <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center mb-6">
                          <Sun className="w-7 h-7 text-yellow-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Intense UV Damage</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                          Calgary gets <strong>2,400+ hours of sunshine yearly</strong>. UV rays fade paint, crack dashboards, and destroy interiors.
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                          Result: $2,000+ interior replacement
                      </p>
                  </motion.div>
              </div>

              {/* Cost Calculator */}
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-slate-900 dark:bg-slate-950 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-12 border border-slate-800 relative overflow-hidden mx-auto shadow-2xl"
              >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                      <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-3 md:gap-4 mb-6 md:mb-8">
                          <div className="p-2.5 md:p-3 bg-white/10 rounded-xl flex-shrink-0">
                              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                          </div>
                          <div className="text-center md:text-left">
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">The Real Cost of Doing Nothing</h3>
                          </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                          {/* Cost Breakdown */}
                          <div className="space-y-3 md:space-y-4 max-w-md mx-auto w-full">
                              <div className="flex justify-between items-center py-2.5 md:py-3 border-b border-slate-700 gap-3 md:gap-4">
                                  <span className="text-slate-300 text-xs sm:text-sm md:text-base">Average paint repairs (5 years):</span>
                                  <span className="text-white font-bold text-base sm:text-lg md:text-xl whitespace-nowrap">$2,500</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 md:py-3 border-b border-slate-700 gap-3 md:gap-4">
                                  <span className="text-slate-300 text-xs sm:text-sm md:text-base">Windshield replacement:</span>
                                  <span className="text-white font-bold text-base sm:text-lg md:text-xl whitespace-nowrap">$1,000</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 md:py-3 border-b border-slate-700 gap-3 md:gap-4">
                                  <span className="text-slate-300 text-xs sm:text-sm md:text-base">Interior sun damage:</span>
                                  <span className="text-white font-bold text-base sm:text-lg md:text-xl whitespace-nowrap">$1,500</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 md:py-3 border-b border-slate-700 gap-3 md:gap-4">
                                  <span className="text-slate-300 text-xs sm:text-sm md:text-base">Lost resale value:</span>
                                  <span className="text-white font-bold text-base sm:text-lg md:text-xl whitespace-nowrap">$3,000</span>
                              </div>

                              <div className="flex justify-between items-center pt-4 md:pt-6 mt-4 md:mt-6 border-t-2 border-red-500 gap-3 md:gap-4">
                                  <span className="text-white font-bold text-sm sm:text-base md:text-xl">Total damage over 5 years:</span>
                                  <span className="text-red-500 font-black text-xl sm:text-2xl md:text-3xl whitespace-nowrap">$8,000+</span>
                              </div>
                          </div>

                          {/* Protection Investment */}
                          <div className="flex flex-col justify-center max-w-md mx-auto w-full">
                              <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 text-center shadow-lg">
                                  <p className="text-brand-100 font-bold mb-2 text-xs sm:text-sm md:text-base">Protection Investment</p>
                                  <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 md:mb-4">$2,500</div>
                                  <p className="text-brand-100 text-xs md:text-sm mb-5 md:mb-6">One-time cost</p>

                                  <div className="bg-white/10 backdrop-blur rounded-lg md:rounded-xl p-3 md:p-4 mb-5 md:mb-6">
                                      <p className="text-green-300 font-black text-lg sm:text-xl md:text-2xl">You save $5,500+</p>
                                      <p className="text-white/80 text-xs mt-1">Over 5 years</p>
                                  </div>

                                  <button
                                      onClick={onOpenQuote}
                                      className="w-full bg-white text-brand-600 font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl hover:bg-brand-50 transition-all transform hover:scale-105 active:scale-95 shadow-xl text-xs sm:text-sm md:text-base"
                                  >
                                      Get Your Protection Quote
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </motion.div>
          </div>
      </section>

      {/* Services Grid (Key Services) */}
      <section id="services" className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Comprehensive Protection</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xl">Battle-tested solutions for Calgary's harsh climate and gravel roads.</p>
            </div>

            <motion.div
                className="grid md:grid-cols-3 gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                      opacity: 1,
                      transition: {
                          staggerChildren: 0.1
                      }
                  }
                }}
            >
                {[
                    {
                        title: 'Paint Protection Film',
                        icon: Shield,
                        desc: 'One Deerfoot commute can chip your hood 5+ times. PPF stops every rock before it reaches paint.',
                        benefit: 'Save $2,000+ in future repairs',
                        essential: 'New car owners, highway drivers'
                    },
                    {
                        title: 'Ceramic Coating',
                        icon: Droplets,
                        desc: 'Calgary winter salt bonds to bare paint, causing permanent staining and corrosion. Ceramic coating creates a microscopic shield.',
                        benefit: 'Preserve 15-20% more resale value',
                        essential: 'Daily drivers, lease returns'
                    },
                    {
                        title: 'Window Tint (XPEL)',
                        icon: Sun,
                        desc: 'Summer dashboard temperatures hit 70°C+ (over 30°C outside) in Calgary sun. XPEL Prime XR blocks 98% of heat and UV rays.',
                        benefit: 'Prevent $1,500+ interior fading',
                        essential: 'Anyone with leather seats'
                    },
                    {
                        title: 'Windshield Protection',
                        icon: Eye,
                        desc: 'Windshield replacement costs $800-1,200. One rock on Deerfoot and you\'re paying. Film stops chips before they crack.',
                        benefit: 'Avoid $1,000+ replacement',
                        essential: 'Daily highway commuters'
                    },
                    {
                        title: 'Undercoating',
                        icon: Wrench,
                        desc: 'Road salt eats through undercarriage metal within 3-5 winters. Rust repair is expensive and lowers resale by thousands.',
                        benefit: 'Protect $3,000+ frame value',
                        essential: 'Trucks, SUVs, winter drivers'
                    },
                    {
                        title: 'Correction & Detail',
                        icon: Sparkles,
                        desc: 'Trapping swirls and scratches under PPF locks in imperfections forever. We restore paint to showroom condition first.',
                        benefit: 'Remove years of damage',
                        essential: 'Used vehicles, pre-protection'
                    },
                ].map((service, idx) => (
                    <motion.div
                        key={idx}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
                        }}
                        className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group perspective-1000 border border-slate-100 dark:border-slate-700"
                    >
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <service.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{service.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{service.desc}</p>
                        <p className="text-brand-600 dark:text-brand-400 font-bold text-sm mb-3">{service.benefit}</p>
                        <p className="text-slate-500 dark:text-slate-500 text-xs">
                            <span className="font-bold">Essential for:</span> {service.essential}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </section>

      {/* TECHNOLOGY SUITE SECTION START */}
      <div id="technology">
        
        {/* XPEL Ultimate Fusion Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-400 to-purple-500 rounded-2xl opacity-30 blur-xl group-hover:opacity-50 transition duration-500"></div>
                    {/* Generated Image Simulation */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
                        <img 
                            src="https://imagedelivery.net/M6yPAnH_Zd_28iUzKcUW1A/73f4e3e4-0ffe-46a1-317d-046980761100/public" 
                            alt="Water beading on XPEL Ultimate Fusion protected paint" 
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-700"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <p className="text-white font-bold text-lg flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-brand-400" />
                            Simulated Hydrophobic Test
                            </p>
                        </div>
                    </div>
                    {/* Floating Stats Card */}
                    <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden md:block animate-float">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-500">
                            <Droplets className="w-5 h-5" />
                            </div>
                            <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Hydrophobicity</p>
                            <p className="font-bold text-slate-900 dark:text-white">Self-Cleaning</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <div className="order-1 lg:order-2">
                <div className="inline-block bg-black dark:bg-white dark:text-slate-900 text-white px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-4">New Technology</div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">XPEL ULTIMATE FUSION™</h2>
                <h3 className="text-xl text-brand-600 dark:text-brand-400 font-bold mb-6">PPF + Ceramic Coating. United.</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                    Experience the next evolution in paint protection. ULTIMATE FUSION is an optically clear, high-gloss, self-healing film developed with a hydrophobic top-coat.
                </p>
                <ul className="space-y-4 mb-8">
                    {[
                        { title: "Self-Healing", desc: "Heat from the sun or engine repairs light swirls automatically." },
                        { title: "Hydrophobic", desc: "Naturally beads up water, dirt, and grime for easier washing." },
                        { title: "Stain Resistant", desc: "Protects against bird droppings, bug guts, and road tar." }
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-brand-500 flex-shrink-0 mt-0.5" />
                            <div>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{item.title}:</span>
                            <span className="text-slate-600 dark:text-slate-400 ml-1">{item.desc}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <button onClick={onOpenQuote} className="text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-2 group">
                    Get a Fusion Quote <ChevronDown className="w-4 h-4 transform -rotate-90 group-hover:translate-x-1 transition" />
                </button>
                </div>
            </div>
            </div>
        </section>

        {/* XPEL STEALTH Section */}
        <section className="py-24 bg-slate-900 dark:bg-black text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-800 dark:bg-slate-900 rounded-full blur-[120px] opacity-30"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                     <div>
                        <div className="inline-flex items-center gap-2 bg-slate-800 dark:bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-4">
                            <Ghost className="w-4 h-4" /> Satin Finish
                        </div>
                        <h2 className="text-4xl font-extrabold text-white mb-6">XPEL STEALTH™</h2>
                        <h3 className="text-xl text-slate-400 font-bold mb-6">Transform Gloss to Matte. Instantly.</h3>
                        <p className="text-slate-300 text-lg leading-relaxed mb-6">
                            Always wanted that factory "Frozen" or "Magno" matte look? XPEL STEALTH™ Paint Protection Film protects your paint while transforming glossy surfaces into a sleek, satin finish.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                             <div className="bg-slate-800/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                                 <h4 className="font-bold text-white mb-2">Matte Protection</h4>
                                 <p className="text-sm text-slate-400">Protect factory matte paint without adding unwanted gloss.</p>
                             </div>
                             <div className="bg-slate-800/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                                 <h4 className="font-bold text-white mb-2">Restyle Your Ride</h4>
                                 <p className="text-sm text-slate-400">Turn any gloss color into a stunning satin masterpiece.</p>
                             </div>
                        </div>

                        <button onClick={onOpenQuote} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition hover:scale-105 active:scale-95">
                            Get Stealth Quote
                        </button>
                     </div>

                     <div className="relative">
                         <div className="absolute -inset-4 bg-slate-700 rounded-2xl opacity-20 blur-xl"></div>
                         <img 
                            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000" 
                            alt="Matte Black Vehicle with XPEL Stealth" 
                            className="w-full h-auto object-cover rounded-2xl shadow-2xl border border-slate-700 grayscale-[20%]"
                        />
                     </div>
                </div>
            </div>
        </section>

        {/* RESTYLE & PROTECT STATIC SECTION */}
        <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                     {/* Visual Content */}
                     <div className="relative group order-2 lg:order-1">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
                            <img 
                                src="https://imagedelivery.net/M6yPAnH_Zd_28iUzKcUW1A/31d3c0e0-c7c8-4060-5154-66d55ce20400/public" 
                                alt="Color Change PPF" 
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-700"
                            />
                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-bold text-slate-900 flex items-center gap-2 shadow-lg">
                                <Palette className="w-4 h-4 text-brand-500" /> Real PPF. Not Vinyl.
                            </div>
                        </div>
                     </div>

                     {/* Text Content */}
                     <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-4">
                            <Palette className="w-4 h-4" /> Fashion Films
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Change Color.<br/>Keep Protection.</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                            Vinyl wraps are thin, have orange peel texture, and offer minimal protection. 
                            XPEL Colored PPF is 8-mil thick polyurethane that heals scratches, shines like paint, and protects your investment while changing its look.
                        </p>
                        
                        <div className="space-y-6 mb-10">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">16</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Unique Colors</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Molten Orange, Miami Blue, Nardo Grey & More</p>
                                </div>
                            </motion.div>
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">10yr</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Warranty</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Guaranteed not to delaminate or fade.</p>
                                </div>
                            </motion.div>
                        </div>

                        <button
                            onClick={onOpenQuote}
                            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                        >
                            Get Your Quote <ArrowRight className="w-5 h-5" />
                        </button>
                     </div>
                </div>
            </div>
        </section>

      </div>
      {/* TECHNOLOGY SUITE SECTION END */}

      {/* NEW: Enhanced About PPF Pros Section */}
      <section id="about" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-20 left-0 w-64 h-64 bg-brand-100 dark:bg-brand-900/20 rounded-full blur-3xl opacity-50"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                  <motion.div
                    className="order-2 md:order-1"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                  >
                       <div className="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-4">
                            <History className="w-4 h-4" /> OUR STORY
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">Born From Frustration.</h2>

                        {/* Customer Story Quote */}
                        <div className="bg-white dark:bg-slate-800 border-l-4 border-red-500 p-6 rounded-r-xl mb-8 shadow-sm">
                            <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed mb-4">
                                "We took our own vehicles—an $80K Audi and a new Porsche—to Calgary's 'premier' PPF shops. What we saw shocked us: razor blade marks on the paint, peeling edges after two weeks, and installers who rushed through $3,000+ jobs like they were applying screen protectors."
                            </p>
                        </div>

                        <p className="text-slate-900 dark:text-white font-bold text-xl mb-8">
                            That's when we knew: <span className="text-brand-500">if we wanted it done right, we'd have to do it ourselves.</span>
                        </p>

                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                            <p>
                                In 2021, three brothers—bringing 25+ years of combined experience in engineering, detailing, and business—opened PPF Pros. Our promise was simple: treat every vehicle like it's our own family's car. No corners cut. No volume quotas. Just meticulous, obsessive attention to detail.
                            </p>
                            <p>
                                We maintain <strong>climate-controlled clean rooms</strong> to eliminate dust contamination. We offer both industry-leading <strong>DAP precision-cut templates with wrapped edges</strong> and <strong>custom hand-cut installation</strong> for complex curves and unique modifications—giving you the best of both worlds. We limit our bookings so every vehicle gets the time it deserves.
                            </p>
                        </div>

                        {/* Differentiators */}
                        <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-4">What Makes Us Different:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                                    <span className="text-slate-700 dark:text-slate-300"><strong>Your Choice of Installation:</strong> Industry-leading DAP precision-cut templates with wrapped edges OR custom hand-cut for complex curves and unique body modifications—you choose what's best for your vehicle</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                                    <span className="text-slate-700 dark:text-slate-300"><strong>Climate-Controlled Clean Rooms:</strong> Zero dust, perfect temperature for adhesion</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                                    <span className="text-slate-700 dark:text-slate-300"><strong>Limited Daily Intake:</strong> Only 2-3 vehicles per day for undivided focus</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                                    <span className="text-slate-700 dark:text-slate-300"><strong>Owner-Supervised:</strong> One of us oversees every single installation</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-brand-500 dark:text-brand-400 font-bold text-xl italic">
                            Today, 1,000+ vehicles later, we're still that same family-owned studio that refuses to compromise quality for quantity.
                        </p>

                        {/* Stats Timeline */}
                        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                             <div className="text-center sm:text-left">
                                 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">25+</div>
                                 <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-tight sm:tracking-wide mt-1 leading-tight">Years Experience</div>
                             </div>
                             <div className="text-center sm:text-left">
                                 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">3 Bros</div>
                                 <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-tight sm:tracking-wide mt-1 leading-tight">Family Owned</div>
                             </div>
                             <div className="text-center sm:text-left">
                                 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">1,000+</div>
                                 <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-tight sm:tracking-wide mt-1 leading-tight">Cars Protected</div>
                             </div>
                        </div>
                  </motion.div>
                  
                  <motion.div 
                    className="order-1 md:order-2 relative"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                      <div className="absolute -inset-4 bg-brand-400 rounded-3xl opacity-20 blur-2xl transform rotate-3"></div>
                      <img 
                        src="https://imagedelivery.net/M6yPAnH_Zd_28iUzKcUW1A/cc93452f-1942-44ed-a831-493583060600/public" 
                        alt="PPF Pros Workshop" 
                        className="relative rounded-3xl shadow-2xl border border-white dark:border-slate-700 object-cover h-[500px] w-full"
                      />
                      <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-xl shadow-lg max-w-xs border border-white/20">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">"We treat every vehicle as if it were our own."</p>
                          <div className="flex items-center gap-2 mt-2">
                              <Users className="w-4 h-4 text-brand-500" />
                              <p className="text-xs text-brand-500 font-bold uppercase">The Brothers</p>
                          </div>
                      </div>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* Owner Video Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Video Container */}
                <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer transform hover:scale-[1.01] transition-all duration-500" onClick={() => setVideoPlaying(true)}>
                    {!videoPlaying ? (
                        <>
                            <img src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=1200" alt="Detailing Shop" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-brand-400 group-hover:text-white transition-all border border-white/30 shadow-lg">
                                    <Play className="w-8 h-8 fill-current ml-1" />
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="font-bold text-xl">Meet the Owner</p>
                                <p className="text-sm opacity-80">Why installation quality matters</p>
                            </div>
                        </>
                    ) : (
                         <iframe 
                            src="https://customer-81vzy8uv51nfith6.cloudflarestream.com/5cc45e22d1d571301c1c859b9b10ef5e/iframe?autoplay=true"
                            className="w-full h-full absolute inset-0"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                            allowFullScreen 
                            title="PPF Pros Owner Video"
                        ></iframe>
                    )}
                </div>

                {/* Content */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Who’s Touching Your Car <span className="text-brand-500">Actually Matters.</span></h2>
                    <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10">
                        <p>Hi, I'm Mostafa. With years of experience in the Calgary automotive scene, I started PPF Pros because I was tired of seeing "premium" cars ruined by volume-focused shops.</p>
                        <p>PPF is an art form. We tuck every edge, remove badges for seamless coverage, and treat your vehicle like our own. No razor marks, no peeling corners—just perfection.</p>
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border-l-4 border-brand-400 italic text-slate-700 dark:text-slate-300 shadow-sm">
                            "We don't just protect paint; we perfect it."
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={onOpenQuote} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-lg hover:scale-105 active:scale-95">
                            Start My Smart Quote
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-900 dark:bg-black text-white overflow-hidden relative">
         {/* BG blobs */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600 rounded-full blur-[150px] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">The PPF Pros Experience</h2>
            
            <div className="grid md:grid-cols-4 gap-10">
                {[
                    { step: '01', title: 'Smart Quote', desc: 'Answer a few questions to get a personalized estimate range.' },
                    { step: '02', title: 'Consultation', desc: 'We review your goals and inspect the vehicle condition.' },
                    { step: '03', title: 'Installation', desc: 'Precision install in our dust-free, climate-controlled Calgary bay.' },
                    { step: '04', title: 'Support', desc: 'Free check-up wash after 2 weeks and warranty support.' },
                ].map((item, idx) => (
                    <div key={idx} className="relative group">
                        <div className="text-7xl font-black text-slate-600/20 mb-6 group-hover:text-brand-500/20 transition-colors duration-500">{item.step}</div>
                        <h3 className="text-xl font-bold mb-3 text-brand-400">{item.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                        {idx !== 3 && <div className="hidden md:block absolute top-12 right-[-20px] w-12 h-[1px] bg-gradient-to-r from-brand-900 to-transparent"></div>}
                    </div>
                ))}
            </div>
            <div className="mt-20 text-center">
                <button onClick={onOpenQuote} className="px-10 py-5 bg-white text-slate-900 font-bold rounded-full hover:bg-brand-50 transition shadow-xl transform hover:scale-105 active:scale-95">
                    Get Started Now
                </button>
            </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {[
                    {
                        q: "How much does PPF cost?",
                        a: "PPF pricing varies by vehicle size and coverage level. We offer packages ranging from partial front coverage to full vehicle wraps. Contact us for a personalized quote based on your specific vehicle and protection needs. All packages include professional installation, warranty registration, and 2-week follow-up inspection."
                    },
                    {
                        q: "What makes PPF Pros different from other shops?",
                        a: "We focus on quality over quantity. We use industry-leading DAP precision-cut templates with wrapped edges (or custom hand-cut for complex work), climate-controlled clean rooms, and limit to 2-3 cars per day. Many shops rush installations to maximize volume. We take our time to ensure perfection. Plus, poor installation voids your film warranty—we do it right the first time."
                    },
                    {
                        q: "Is PPF worth it in Calgary?",
                        a: "Absolutely. Calgary roads are uniquely destructive: gravel from Deerfoot trucks, 6 months of salt, chinook wind storms, and intense UV. Rock chips, paint damage, and windshield cracks are common. PPF pays for itself by preventing paint damage that would otherwise require expensive repairs. Plus, protected vehicles maintain significantly higher resale value."
                    },
                    {
                        q: "How long does installation take?",
                        a: "Bronze/Silver: 1-2 days. Gold: 2-3 days. Full Wrap: 4-5 days. We never rush. Uber rides available on select services."
                    },
                    {
                        q: "What is the warranty?",
                        a: "10-year warranty against yellowing, cracking, peeling, and staining on all XPEL Ultimate films. Warranty is valid at 1,000+ authorized XPEL shops across North America."
                    },
                    {
                        q: "What if I'm not happy with the installation?",
                        a: "We stand behind our work 100%. If you notice any installation issues, contact us immediately and we'll make it right. In 3+ years and 1,000+ installations, our commitment to perfection means every customer leaves satisfied."
                    },
                    {
                        q: "PPF vs. Ceramic Coating vs. Wax?",
                        a: "PPF (8-mil thick film): Physical protection against rock chips and scratches. Ceramic Coating (microscopic liquid): Protects against UV, water spots, makes washing easier—no rock chip protection. Wax: Temporary shine only. Best combo: PPF on high-impact areas + ceramic on rest of car."
                    },
                    {
                        q: "Can I wash my car after installation?",
                        a: "Wait 7 days for first wash to let adhesive fully cure. After that, wash as normal. Avoid automatic car washes with brushes—touchless or hand wash only."
                    },
                    {
                        q: "How much does Ceramic Coating cost?",
                        a: "Our ceramic coating packages protect your paint from UV damage, water spots, and make maintenance easier. We offer three tiers:\n\n• Plus: Entry-level protection\n• Premium: Enhanced durability\n• Supreme: Maximum protection and longevity\n\nPricing varies by vehicle size. All packages include full decontamination, paint prep, and multi-year warranties. Contact us for a personalized quote."
                    },
                    {
                        q: "What are your Window Tint prices?",
                        a: "We offer two premium tint lines:\n\n• Ceramic Series (CS): Advanced heat rejection and clarity\n• XR Series (Premium): Maximum performance and IR blocking\n\nPricing varies based on the number of windows and vehicle type. All tints include lifetime warranty and professional installation. Contact us for a quote."
                    },
                    {
                        q: "Do you offer Detailing and Paint Correction?",
                        a: "Yes! We offer comprehensive detailing and paint correction services:\n\n• Professional Detailing\n• Paint Correction (Single Stage): Light imperfections\n• Paint Correction (2-Stage): Moderate swirls and scratches\n• Paint Correction (Multi-Stage): Heavy correction for show-quality finish\n\nPaint correction removes swirl marks, scratches, and oxidation for a showroom finish before PPF or ceramic coating. Contact us for pricing."
                    },
                    {
                        q: "What other protection services do you offer?",
                        a: "We're a complete vehicle protection shop offering:\n\n• Undercoating: Rust prevention for Calgary winters\n• Rustproofing: Long-term corrosion protection\n• Undercoating + Rustproofing Combo: Complete undercarriage protection\n• Windshield Protection Film: Prevent chips and cracks\n• Interior Protection: Fabric and leather protection\n\nAll services use premium products and include professional installation. Contact us for pricing on your specific vehicle."
                    }
                ].map((faq, i) => (
                    <details key={i} className="group bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm cursor-pointer border border-transparent hover:border-brand-200 dark:hover:border-slate-700 transition">
                        <summary className="flex justify-between items-center font-bold text-slate-900 dark:text-white list-none text-lg">
                            {faq.q}
                            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed pl-4 border-l-2 border-brand-200">{faq.a}</p>
                    </details>
                ))}
            </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="py-24 bg-slate-900 dark:bg-black text-white relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>

         <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
             <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-500/30 transform rotate-6">
                 <Mail className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-4xl font-bold mb-6">Join the Car Care Advantage</h2>
             <p className="text-brand-100 max-w-2xl mx-auto mb-10 text-lg">
                 Get weekly tips on maintaining your vehicle's value, seasonal protection guides, and exclusive offers for subscribers. No spam, ever.
             </p>
             <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                 <input 
                    type="email" 
                    required
                    placeholder="Enter your email address" 
                    className="px-6 py-4 rounded-full bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 w-full text-lg shadow-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
                 <button type="submit" className="px-8 py-4 bg-brand-500 hover:bg-brand-400 rounded-full font-bold transition shadow-lg text-lg whitespace-nowrap text-white hover:scale-105 active:scale-95">
                     Join Now
                 </button>
             </form>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center bg-white dark:bg-slate-900 relative">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-8">Ready to protect your investment?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">It takes 60 seconds to get a personalized estimate for your specific vehicle.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onOpenQuote} className="px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-brand-400 to-brand-600 rounded-full hover:shadow-2xl hover:shadow-brand-400/40 transition transform hover:scale-105 active:scale-95">
                    Get Your Smart Quote
                </button>
                <a href="tel:+14038303311" className="px-12 py-5 text-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                    <Phone className="w-5 h-5" /> Call Us
                </a>
            </div>
          </div>
      </section>

      <footer className="bg-slate-950 text-slate-500 py-16 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0 text-white">
                <BrandLogo forceTheme="dark" />
              </div>
              <div className="text-sm">
                  &copy; {new Date().getFullYear()} PPF Pros Calgary. All rights reserved.
              </div>
          </div>
      </footer>
    </div>
  );
}
