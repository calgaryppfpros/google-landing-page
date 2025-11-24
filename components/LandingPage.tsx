
import React, { useState, useEffect, useRef } from 'react';
import { Star, Shield, Sun, Moon, Droplets, Eye, Wrench, Play, CheckCircle, ChevronDown, Mail, Menu, Sparkles, Phone, Tag, Award, Timer, Check, Layers, ShieldCheck, Ghost, Palette, MousePointerClick, RefreshCcw, X, ArrowRight, Loader2, Maximize2, Armchair, History, Trophy, Globe, Car, HeartHandshake, MapPin, Users, AlertTriangle, Hammer, Snowflake, Calculator } from 'lucide-react';
import { PROMOS, CAR_COLORS, CarColor } from '../types';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionValue, useSpring } from 'framer-motion';

interface Props {
  onOpenQuote: () => void;
}

// --- Antigravity Physics Engine ---
const PARTICLE_COUNT = 140;
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
    shape: 'rect'; // Force capsules
    aspectRatio: number; // for rects (capsules)

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
        this.aspectRatio = Math.random() * 3 + 1.5; // Length vs width for dashes

        // Antigravity Google Colors (Vibrant Blues + Brand)
        const colorsLight = ['#0ea5e9', '#0284c7', '#38bdf8', '#0369a1', '#7dd3fc'];
        const colorsDark = ['#38bdf8', '#7dd3fc', '#bae6fd', '#0ea5e9', '#ffffff'];
        const palette = theme === 'dark' ? colorsDark : colorsLight;
        this.color = palette[Math.floor(Math.random() * palette.length)];

        // Restoring Capsules: 100% capsules
        this.shape = 'rect';
    }

    update(width: number, height: number, mouseX: number, mouseY: number) {
        // 1. Mouse Interaction (Magnetic Repulsion)
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < MOUSE_INFLUENCE_RADIUS) {
            const force = (MOUSE_INFLUENCE_RADIUS - dist) / MOUSE_INFLUENCE_RADIUS;
            // Smoother ease-out curve
            const ease = force * force; 
            const angle = Math.atan2(dy, dx);
            
            // Nearer particles move more (parallax feel)
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

        // 3. Float Keepalive (Zero-G drift)
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
        // Fade out based on depth for atmospheric depth
        ctx.globalAlpha = 0.5 + (this.depth * 0.5); 

        const w = this.size * this.aspectRatio;
        const h = this.size;
        // Draw rounded rect manually (Capsule shape)
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
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<DebrisParticle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Init Particles (reduced count on mobile for performance)
        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const isMobile = window.innerWidth < 768;
            const particleCount = isMobile ? 50 : PARTICLE_COUNT;
            particlesRef.current = Array.from({ length: particleCount }, () => new DebrisParticle(canvas.width, canvas.height, theme));
        };
        init();

        const handleMouseMove = (e: MouseEvent) => {
             const rect = canvas.getBoundingClientRect();
             mouseRef.current = {
                 x: e.clientX - rect.left,
                 y: e.clientY - rect.top
             };
        };

        const handleResize = () => init();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particlesRef.current.forEach(p => {
                p.update(canvas.width, canvas.height, mouseRef.current.x, mouseRef.current.y);
                p.draw(ctx);
            });

            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
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
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  
  // Hero Opacity Logic: Fade out as user scrolls
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 100]); // Gentle parallax

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });
  
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
        await fetch('https://n8n.srv1046173.hstgr.cloud/webhook/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'Landing Page Footer', date: new Date().toISOString() })
        });

        // GTM Tracking
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


  // Animation Variants
  const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
          opacity: 1,
          transition: {
              staggerChildren: 0.1
          }
      }
  };

  const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20 } }
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
      {/* Modern Floating Pill Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 pointer-events-none"
      >
        <div className={`pointer-events-auto transition-all duration-500 ease-out max-w-7xl w-full mx-4 rounded-2xl flex items-center justify-between px-6 py-3 ${
             isScrolled 
             ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl scale-100' 
             : 'bg-transparent scale-105 border-transparent'
        }`}>
            
            {/* Logo Area */}
            <div 
                className="flex items-center gap-3 cursor-pointer text-slate-900 dark:text-white transition-transform hover:scale-105" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <BrandLogo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 bg-slate-100/50 dark:bg-slate-800/50 rounded-full px-6 py-2 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                {['Services', 'Technology', 'Process', 'About'].map((item) => (
                    <button 
                        key={item}
                        onClick={() => scrollToSection(item.toLowerCase() === 'services' ? 'benefits' : item.toLowerCase() === 'process' ? 'how-it-works' : item.toLowerCase())} 
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

                {/* Desktop Phone */}
                <a href="tel:+14038303311" className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors">
                    <Phone className="w-4 h-4" />
                </a>

                {/* CTA Button */}
                <button 
                    onClick={onOpenQuote} 
                    className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-brand-600 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-5 py-2 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
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
        </div>

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
                                onClick={() => scrollToSection(item.toLowerCase() === 'services' ? 'benefits' : item.toLowerCase() === 'process' ? 'how-it-works' : item.toLowerCase())}
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
                            className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold mt-2 hover:bg-brand-600 transition shadow-lg"
                        >
                            Get Smart Quote
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.header>

      {/* --- ANTIGRAVITY HERO SECTION --- */}
      <section
        className="relative pt-32 pb-16 lg:pt-48 lg:pb-24 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 1. Background Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-black z-0"></div>

        {/* 2. Interactive Gravity Canvas (Debris) */}
        {/* Wrapped with motion.div to control opacity on scroll */}
        <motion.div 
            style={{ opacity: heroOpacity, y: heroY }} 
            className="absolute inset-0 z-0 pointer-events-none"
        >
            <GravityCanvas theme={theme} />
        </motion.div>

        {/* 3. Gradient Blend to Next Section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent z-10 pointer-events-none" />

        {/* 4. Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 perspective-1000">
          <div className="max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-brand-200/50 dark:border-slate-700/50 text-brand-700 dark:text-brand-300 text-sm font-bold mb-8 shadow-sm"
            >
                <Award className="w-4 h-4 text-brand-500" />
                <span>Consumer Choice Award Winner 3 Years • Family Owned</span>
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
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl">
                <span className="block">Save $3,200+ on</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                  Paint Repairs.
                </span>
              </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 mb-4">
                <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-bold text-brand-900 dark:text-brand-100">
                  Museum-Quality Protection • Quality Over Volume
                </span>
              </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl font-medium"
            >
              Expert Paint Protection Film (PPF), Ceramic Coatings, and XPEL Window Tint by 3 brothers who treat every vehicle like family.
              Specialized for Calgary's gravel-covered highways, winter salt, and intense UV that destroys unprotected paint.
            </motion.p>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
            >
              <button onClick={onOpenQuote} className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-brand-400 to-brand-600 rounded-full hover:shadow-xl hover:shadow-brand-400/30 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 ring-4 ring-brand-400/20">
                Get Your Smart Quote
              </button>
            </motion.div>

            <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                         <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-lg">
                             <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Client" />
                         </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 shadow-lg">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-sm">
                    <div className="flex text-yellow-400 mb-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-lg flex items-center gap-2">
                        1000+ Vehicles Protected
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE CALGARY PROBLEM SECTION */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 relative z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-bold mb-6">
                      <AlertTriangle className="w-4 h-4" />
                      <span>The Reality of Calgary Driving</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                      Your Paint is Under <span className="text-red-600 dark:text-red-500">Constant Attack</span>
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                      Calgary roads destroy more paint than anywhere else in Canada. Here's what your vehicle faces every single day:
                  </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center mb-4">
                          <Hammer className="w-6 h-6 text-red-600 dark:text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Gravel Season = Chip Season</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                          Calgary uses <strong className="text-slate-900 dark:text-white">millions of pounds of gravel</strong> every winter for traction. One Deerfoot commute = 5-10 rock impacts.
                      </p>
                      <p className="text-red-600 dark:text-red-500 font-bold text-sm">
                          Result: Hood repaints cost $1,500-2,500
                      </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/30 rounded-xl flex items-center justify-center mb-4">
                          <Snowflake className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Road Salt Corrosion</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                          Winter road salt bonds to paint and undercarriage, causing <strong className="text-slate-900 dark:text-white">permanent staining and rust</strong> within 3-5 years.
                      </p>
                      <p className="text-orange-600 dark:text-orange-500 font-bold text-sm">
                          Result: 15-20% lower resale value
                      </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/30 rounded-xl flex items-center justify-center mb-4">
                          <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Intense UV Damage</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                          Calgary gets <strong className="text-slate-900 dark:text-white">2,400+ hours of sunshine yearly</strong>. UV rays fade paint, crack dashboards, and destroy interiors.
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-500 font-bold text-sm">
                          Result: $2,000+ interior replacement
                      </p>
                  </div>
              </div>

              <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-2xl border border-slate-800">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                              <Calculator className="w-7 h-7 text-brand-400" />
                              The Real Cost of Doing Nothing
                          </h3>
                          <div className="space-y-2 text-slate-300 mb-4">
                              <div className="flex items-center justify-between">
                                  <span>Average paint repairs (5 years):</span>
                                  <span className="font-bold text-white">$2,500</span>
                              </div>
                              <div className="flex items-center justify-between">
                                  <span>Windshield replacement:</span>
                                  <span className="font-bold text-white">$1,000</span>
                              </div>
                              <div className="flex items-center justify-between">
                                  <span>Interior sun damage:</span>
                                  <span className="font-bold text-white">$1,500</span>
                              </div>
                              <div className="flex items-center justify-between">
                                  <span>Lost resale value:</span>
                                  <span className="font-bold text-white">$3,000</span>
                              </div>
                              <div className="border-t border-slate-700 pt-3 mt-3 flex items-center justify-between text-xl">
                                  <span className="font-bold">Total damage over 5 years:</span>
                                  <span className="font-black text-red-500 text-3xl">$8,000+</span>
                              </div>
                          </div>
                      </div>
                      <div className="text-center">
                          <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-6 rounded-2xl mb-4">
                              <p className="text-sm font-bold mb-2 opacity-90">Protection investment</p>
                              <p className="text-5xl font-black">$2,500</p>
                              <p className="text-sm mt-2 opacity-90">One-time cost</p>
                          </div>
                          <p className="text-brand-400 font-bold">You save $5,500+</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* NEW: Trust Indicators Strip */}
      <section className="bg-slate-900 dark:bg-black py-12 border-y border-slate-800 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
                  <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                          <Award className="w-8 h-8 text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Consumer Choice</h3>
                        <p className="text-sm text-slate-400">Award Winner (3 Years)</p>
                      </div>
                  </div>
                   <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                          <ShieldCheck className="w-8 h-8 text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Authorized Dealer</h3>
                        <p className="text-sm text-slate-400">Official XPEL Installer</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                          <Globe className="w-8 h-8 text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Warranty</h3>
                        <p className="text-sm text-slate-400">Valid Across North America</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="p-4 bg-white/5 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                          <Car className="w-8 h-8 text-brand-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Uber Rides</h3>
                        <p className="text-sm text-slate-400">Available with Packages</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Benefits / Services Grid */}
      <section id="benefits" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Comprehensive Protection</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xl">Battle-tested solutions for Calgary's harsh climate and gravel roads.</p>
            </div>

            <motion.div 
                className="grid md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {[
                    {
                        title: 'Paint Protection Film',
                        icon: Shield,
                        desc: 'One Deerfoot commute can chip your hood 5+ times. PPF stops every rock before it reaches paint.',
                        value: 'Save $2,000+ in future repairs',
                        whoFor: 'New car owners, highway drivers'
                    },
                    {
                        title: 'Ceramic Coating',
                        icon: Droplets,
                        desc: 'Calgary winter salt bonds to bare paint, causing permanent staining and corrosion. Ceramic coating creates a microscopic shield.',
                        value: 'Preserve 15-20% more resale value',
                        whoFor: 'Daily drivers, lease returns'
                    },
                    {
                        title: 'Window Tint (XPEL)',
                        icon: Sun,
                        desc: 'Summer dashboard temperatures hit 70°C+ (over 30°C outside) in Calgary sun. XPEL Prime XR blocks 98% of heat and UV rays.',
                        value: 'Prevent $1,500+ interior fading',
                        whoFor: 'Anyone with leather seats'
                    },
                    {
                        title: 'Windshield Protection',
                        icon: Eye,
                        desc: 'Windshield replacement costs $800-1,200. One rock on Deerfoot and you\'re paying. Film stops chips before they crack.',
                        value: 'Avoid $1,000+ replacement',
                        whoFor: 'Daily highway commuters'
                    },
                    {
                        title: 'Undercoating',
                        icon: Wrench,
                        desc: 'Road salt eats through undercarriage metal within 3-5 winters. Rust repair is expensive and lowers resale by thousands.',
                        value: 'Protect $3,000+ frame value',
                        whoFor: 'Trucks, SUVs, winter drivers'
                    },
                    {
                        title: 'Correction & Detail',
                        icon: Sparkles,
                        desc: 'Trapping swirls and scratches under PPF locks in imperfections forever. We restore paint to showroom condition first.',
                        value: 'Remove years of damage',
                        whoFor: 'Used vehicles, pre-protection'
                    },
                ].map((service, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group perspective-1000 border border-slate-100 dark:border-slate-700"
                    >
                        <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <service.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{service.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{service.desc}</p>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-brand-600 dark:text-brand-400 font-bold text-sm mb-2">{service.value}</p>
                            <p className="text-slate-500 dark:text-slate-500 text-sm">
                                <span className="font-semibold">Essential for:</span> {service.whoFor}
                            </p>
                        </div>
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
                            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000" 
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
                            Check Stealth Pricing
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
                                src="https://images.unsplash.com/photo-1544552866-d3ed42536cfd?auto=format&fit=crop&q=80&w=1000" 
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
                            Get Color Change Quote <ArrowRight className="w-5 h-5" />
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
                       <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-4">
                            <History className="w-4 h-4" /> Our Story
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Born From Frustration.</h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 mb-6">
                                <p className="text-slate-700 dark:text-slate-300 font-medium italic">
                                    "We took our own vehicles—an $80K Audi and a new Porsche—to Calgary's 'premier' PPF shops. What we saw shocked us: razor blade marks on the paint, peeling edges after two weeks, and installers who rushed through $3,000+ jobs like they were applying screen protectors."
                                </p>
                            </div>
                            <p>
                                That's when we knew: <strong className="text-slate-900 dark:text-white">if we wanted it done right, we'd have to do it ourselves.</strong>
                            </p>
                            <p>
                                In 2021, three brothers—with backgrounds in engineering, detailing, and business—opened PPF Pros. Our promise was simple: treat every vehicle like it's our own family's car. No corners cut. No volume quotas. Just meticulous, obsessive attention to detail.
                            </p>
                            <p>
                                We invested in <strong className="text-slate-900 dark:text-white">hospital-grade clean rooms</strong> to eliminate dust contamination. We mastered <strong className="text-slate-900 dark:text-white">"bulk installation"</strong>—custom-cutting film and tucking edges so installations look invisible. We limit our bookings so every vehicle gets the time it deserves.
                            </p>
                            <p className="text-brand-600 dark:text-brand-400 font-bold text-xl">
                                Today, 1,000+ vehicles later, we're still that same family-owned studio that refuses to compromise quality for quantity.
                            </p>
                        </div>
                        
                        {/* Stats Timeline */}
                        <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                             <div>
                                 <div className="text-3xl font-black text-slate-900 dark:text-white">2021</div>
                                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wide mt-1">Established</div>
                             </div>
                             <div>
                                 <div className="text-3xl font-black text-slate-900 dark:text-white">Family</div>
                                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wide mt-1">Owned & Operated</div>
                             </div>
                             <div>
                                 <div className="text-3xl font-black text-slate-900 dark:text-white">1000+</div>
                                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wide mt-1">Cars Protected</div>
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
                        src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000" 
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
                        q: "Is PPF worth the investment in Calgary?",
                        a: "Absolutely. Calgary roads use **millions of pounds of gravel** every winter for traction, which destroys paint. A single Deerfoot commute can cause **5-10 rock chips**. Repainting a hood costs **$1,500-2,500** and lowers resale value by removing original paint. PPF preserves the original finish permanently for a **one-time investment** of ~$2,000-3,000. You break even in year 2-3, then it's pure savings."
                    },
                    {
                        q: "Why not just fix rock chips as they happen?",
                        a: "Touch-up paint and chip repairs are **visible under direct light** and signal to buyers that the vehicle has damage history. Even professional repaints can't match factory paint perfectly. Once you repaint, the vehicle loses its **\"original paint\" status**, dropping resale value by **$2,000-5,000**. PPF prevents the damage entirely, preserving factory finish."
                    },
                    {
                        q: "What if I lease my vehicle?",
                        a: "PPF is **essential for leases**. Lease return inspections ding you for **every chip, scratch, and dent**. A typical Calgary lease return without protection can cost **$1,500-3,000 in damage fees**. PPF pays for itself by avoiding these penalties, plus you can **remove it before return** to restore factory condition. Many of our clients are lease drivers."
                    },
                    {
                        q: "How do I know you won't damage my new car?",
                        a: "Valid concern—we've seen competitors leave **razor marks, adhesive residue, and scratches** on brand-new paint. Here's how we're different: (1) **Hospital-grade clean rooms** eliminate dust contamination, (2) **Bulk installation technique** means we custom-cut film off the car, not on it—zero blade contact with paint, (3) We limit bookings to **2-3 vehicles per week** max, giving your car the time it deserves. You can visit our bay and inspect our work on any vehicle."
                    },
                    {
                        q: "How long does installation take?",
                        a: "A standard **front-end package takes 1-2 days**. A **full vehicle wrap takes 4-5 days** to ensure edges are wrapped, dried, and cured properly. Rush jobs lead to peeling and bubbles—we won't compromise quality for speed. We'll provide a loaner Uber credit if needed during installation."
                    },
                    {
                        q: "What is the warranty?",
                        a: "We offer a **10-year manufacturer warranty** against yellowing, cracking, peeling, and staining on all XPEL films. This warranty is **transferable** and **valid across North America**, adding to your vehicle's resale value. If you sell the car, the new owner inherits the remaining warranty—a huge selling point."
                    },
                    {
                        q: "What is the difference between PPF and Ceramic Coating?",
                        a: "**PPF** is a thick **(8-10mil) physical urethane film** that **stops rock chips and deep scratches**—it's impact protection. **Ceramic Coating** is a microscopic liquid layer that bonds to paint, providing **gloss and hydrophobic properties** (water beads off), but it **does NOT stop rock chips**. Think of PPF as a bulletproof vest, Ceramic as a raincoat. We recommend **PPF for high-impact zones** (hood, fenders, bumper) and **Ceramic for the rest** for easy cleaning."
                    },
                    {
                        q: "Can I see PPF Pros' work vs. competitors?",
                        a: "Absolutely. Look for these telltale signs of bad PPF: **(1) Visible edges** along body lines, **(2) Razor marks** or scratches in the paint under the film, **(3) Dirt/dust trapped under film**, **(4) Peeling corners** within months. Our installations have **tucked, invisible edges**, zero blade marks, and stay pristine for **10+ years**. Visit our shop or check our Google reviews for close-up photos from real customers."
                    },
                    {
                        q: "How long does window tint last?",
                        a: "Our **XPEL Prime XR Nano-Ceramic tint** comes with a **lifetime transferable warranty**. It will **never bubble, peel, fade, or turn purple** for as long as you own the vehicle. Cheap tint from quick-service shops fails within **2-3 years**. XPEL tint is **nano-ceramic technology**—blocks **98% of IR heat** while maintaining clarity."
                    },
                    {
                        q: "Can I wash my car right after installation?",
                        a: "We recommend waiting **at least 7 days** before the first wash. This allows the film adhesive and any ceramic coating to **fully cure and bond** to the vehicle surface. After the cure period, you can wash normally—PPF is **pressure-washer safe** and loves soap and water."
                    }
                ].map((faq, i) => (
                    <details key={i} className="group bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm cursor-pointer border border-transparent hover:border-brand-200 dark:hover:border-slate-700 transition">
                        <summary className="flex justify-between items-center font-bold text-slate-900 dark:text-white list-none text-lg">
                            {faq.q}
                            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                        </summary>
                        <div className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed pl-4 border-l-2 border-brand-200">
                            {faq.a.split('**').map((part, idx) =>
                                idx % 2 === 0 ? (
                                    <span key={idx}>{part}</span>
                                ) : (
                                    <strong key={idx} className="text-slate-900 dark:text-white font-bold">{part}</strong>
                                )
                            )}
                        </div>
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
};
