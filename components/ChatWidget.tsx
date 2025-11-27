import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, ChevronRight, Zap, Shield, Sparkles, User, Phone, Car, CheckCircle2, Bot, Loader2, Minimize2, RefreshCcw, CornerDownLeft, ThumbsUp, ThumbsDown, Trash2, Mail, Wrench, Check } from 'lucide-react';
import { CAR_MAKES_AND_MODELS, ServiceType } from '../types';
import { INITIAL_STATE } from '../services/quoteLogic';

// --- Types ---

type MessageType = 'text' | 'form-contact' | 'form-vehicle-select' | 'options' | 'feedback';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  type: MessageType;
  content: string;
  options?: string[]; // For quick replies
  data?: any; // To store form state if needed
}

interface ChatState {
  name: string;
  phone: string;
  email: string;
  vehicle: { year: string; make: string; model: string };
  services: string[];
}

// --- KNOWLEDGE BASE ENGINE ---
// (Kept same as before, omitted for brevity but included in full file below)
interface KnowledgeChunk {
    id: string;
    triggers: string[];
    response: string;
    options?: string[];
    action?: 'trigger-quote';
}

const KNOWLEDGE_BASE: KnowledgeChunk[] = [
    // ... (Same Knowledge Base Content) ...
    {
        id: 'G1',
        triggers: ['who are you', 'what do you do', 'about you', 'shop'],
        response: "We are an automotive protection studio and XPEL Authorized Dealer. We specialize in premium services to protect your investment, ensuring higher resale value and an easier-to-maintain vehicle.",
        options: ["View All Services", "Get a Quote"]
    },
    {
        id: 'SERVICES_MENU',
        triggers: ['services', 'menu', 'options', 'what services', 'view all services'],
        response: "We offer a complete range of automotive protection services. Tap an option below to learn more:",
        options: [
            "Paint Protection Film (PPF)",
            "Window Tint",
            "Ceramic Coating",
            "Paint Correction",
            "Interior Protection",
            "Windshield Protection",
            "Undercoating & Rustproofing",
            "Detailing"
        ]
    },
    {
        id: 'G2',
        triggers: ['how to book', 'booking process', 'schedule', 'appointment', 'process'],
        response: "To build an accurate quote, we start with your vehicle details, the type of protection you want, and how you use the car. We can usually provide a ballpark estimate from photos, then confirm exact pricing after seeing the vehicle in person. If you’re happy with the package, we schedule a drop-off date, take a small deposit for larger jobs, and send you reminders with prep instructions.",
        options: ["Start Quote", "Call Us"]
    },
    {
        id: 'G3',
        triggers: ['price', 'cost', 'how much', 'quote', 'estimate', 'pricing'],
        response: "Pricing varies based on vehicle size, condition, and coverage. PPF ranges from targeted high-impact areas to full-body protection. Tint pricing depends on how many windows and which XPEL film you choose. I can help narrow it down and have a specialist send your exact quote.",
        action: 'trigger-quote'
    },
    {
        id: 'G4',
        triggers: ['warranty', 'guarantee', 'lifetime'],
        response: "As an XPEL Authorized Dealer, we install products backed by manufacturer warranties when properly maintained:\n\n• XPEL ULTIMATE PLUS & STEALTH PPF: 10-year warranty against yellowing, cracking, peeling.\n• XPEL PRIME Window Tint: Lifetime warranty against bubbling, peeling, discoloration.\n• XPEL FUSION PLUS Ceramic: Multi-year protection with proper care.\n\nOur shop warranty also covers workmanship.",
        options: ["PPF Warranty", "Tint Warranty"]
    },
    // --- PPF ---
    {
        id: 'P1',
        triggers: ['what is ppf', 'paint protection film (ppf)', 'is ppf worth it', 'rock chips', 'stone chips', 'protection film', 'bra'],
        response: "Paint Protection Film (PPF) is a clear urethane film applied to painted surfaces to prevent rock chips, scratches, and staining. XPEL ULTIMATE PLUS and STEALTH are self-healing films—light swirls fade with heat. We use XPEL’s DAP pattern software for your exact year/make/model to ensure precise installation without cutting on your paint.",
        options: ["View PPF Packages", "Get PPF Quote"]
    },
    {
        id: 'P_PACKAGES',
        triggers: ['ppf packages', 'ppf levels', 'bronze', 'silver', 'gold', 'track pack', 'diamond', 'coverage', 'view ppf packages'],
        response: "We offer 5 levels of PPF coverage:\n\n" +
        "🥉 **Bronze (Partial Front)**\nEntry-level protection. Prevents common stone chips.\n*Covers: Leading 24” of hood & fenders, Mirrors.*\n\n" +
        "🥈 **Silver (Partial Front + Bumper)**\nAdds full bumper protection to Bronze. Ideal for city driving.\n*Covers: Front bumper, 24\" hood & fenders, Mirrors.*\n\n" +
        "🏆 **Gold (Full Front)**\nOur standard. Full hood/fenders means NO visible seams.\n*Covers: Bumper, Full hood, Full fenders, Mirrors, Headlights, A-pillars, Roofline.*\n\n" +
        "🏎️ **Track Pack**\nGold + Rocker Panels. Essential for gravel roads or track days.\n\n" +
        "💎 **Diamond (Full Wrap)**\nThe ultimate solution. Every painted surface is wrapped. Change the color or freeze it in time.",
        options: ["Get PPF Quote", "Stealth vs Gloss"]
    },
    {
        id: 'P2',
        triggers: ['stealth', 'matte', 'satin', 'gloss', 'stealth vs gloss'],
        response: "We offer:\n\n• ULTIMATE PLUS (Gloss): High-gloss, virtually invisible protection.\n• STEALTH (Satin): Same protection in a matte finish; ideal for factory matte paint or converting glossy cars.",
        options: ["Get Quote"]
    },
    {
        id: 'P3',
        triggers: ['how long does ppf take', 'install time', 'how long to install'],
        response: "Small front-end packages usually take about a day; full-body installs take multiple days. We wash, decontaminate, cut precise patterns, and install in a clean environment.",
        options: ["Book Now"]
    },
    {
        id: 'P4',
        triggers: ['aftercare', 'washing', 'wash car', 'bubbles', 'care'],
        response: "It’s normal to see slight haziness or moisture pockets after installation—they clear as the film cures. Avoid pressure washing or strong chemicals for the first week. Wash with pH-balanced soap and a soft mitt."
    },
    // --- TINT ---
    {
        id: 'T1',
        triggers: ['what tint', 'window tint', 'ceramic tint', 'xr plus', 'heat rejection'],
        response: "We install XPEL PRIME window films. Our most popular option is PRIME XR PLUS, a nano-ceramic film that rejects a high percentage of infrared heat and blocks over 99% of UV rays. We also offer PRIME XR and PRIME CS/HP for different budgets. All films include a lifetime transferable warranty.",
        options: ["Tint Pricing", "Legal Limits"]
    },
    {
        id: 'T2',
        triggers: ['legal', 'tint law', 'darkness', '5%', 'shade'],
        response: "We offer multiple tint shades from light (70%) to dark (5%). We always recommend staying within your local tint laws, especially on front windows. Many customers choose a legal shade up front and go darker on the rears for privacy and heat rejection."
    },
    // --- CERAMIC ---
    {
        id: 'C1',
        triggers: ['what is ceramic', 'ceramic coating', 'fusion plus', 'coating', 'wax'],
        response: "Ceramic coating is a liquid layer that cures into a hard, glossy, hydrophobic surface using XPEL FUSION PLUS. It boosts gloss, reduces maintenance, and adds chemical resistance.\n\n⚠️ NOTE: It does NOT prevent rock chips—that’s where PPF is needed.",
        options: ["View Ceramic Packages", "Ceramic vs PPF"]
    },
    {
        id: 'C_PACKAGES',
        triggers: ['ceramic packages', 'ceramic levels', 'plus', 'premium', 'supreme', 'view ceramic packages'],
        response: "Our FUSION PLUS Ceramic Coating packages:\n\n" +
        "✨ **Plus (4-Year)**\nSingle-layer + Top coat.\n*Includes: Paint & PPF Only*\n\n" +
        "🌟 **Premium (8-Year)**\nTwo-layer base + Top coat.\n*Includes: Paint & PPF, Wheel face coating*\n\n" +
        "👑 **Supreme (8-Year Multi-Layer)**\nFlagship protection.\n*Includes: Paint & PPF, Wheel face coating, Windshield coating, Interior plastic trim*",
        options: ["Get Ceramic Quote"]
    },
    {
        id: 'C2',
        triggers: ['wheels', 'glass coating', 'interior coating', 'calipers'],
        response: "We can ceramic coat bare paint, PPF, wheels, calipers, glass, plastic trim, and interior upholstery using FUSION PLUS formulas designed for each surface. We’ll recommend a setup based on your driving habits.",
        options: ["Get Quote"]
    },
    // --- PAINT CORRECTION ---
    {
        id: 'PC1',
        triggers: ['paint correction', 'swirls', 'scratches', 'buffing', 'polishing'],
        response: "Paint correction uses machine polishing to remove swirls, light scratches, haze, and oxidation by refining the clear coat. This is the ideal prep before PPF or ceramic coating to lock in a flawless finish.",
        options: ["Get Quote"]
    },
    // --- INTERIOR ---
    {
        id: 'IP1',
        triggers: ['interior protection', 'interior', 'seats', 'screen', 'touchscreen', 'leather'],
        response: "We can install clear film on touchscreens and high-wear trim to prevent scratches, and apply ceramic protection to leather, vinyl, and fabric to help resist stains. Great for family vehicles or new cars.",
        options: ["Get Quote"]
    },
    // --- WINDSHIELD ---
    {
        id: 'W1',
        triggers: ['windshield protection', 'windshield', 'glass film', 'cracked windshield', 'exo shield'],
        response: "Windshield Protection Film is a clear layer installed on the outside of the glass to help absorb rock impacts before they chip or crack the windshield. It significantly reduces the chance of chips but isn't bulletproof. It's a sacrificial layer designed to save your factory glass.",
        options: ["Get Quote"]
    },
    // --- UNDERCOATING ---
    {
        id: 'U1',
        triggers: ['undercoating', 'rustproofing', 'rust', 'salt', 'corrosion', 'undercoating & rustproofing'],
        response: "Undercoating is a thick protective coating for the underbody to shield against salt and debris. Rustproofing is a thinner oil/wax sprayed inside seams. Both are essential for Calgary winters. We recommend applying before heavy rust sets in.",
        options: ["Get Quote"]
    },
    // --- DETAILING ---
    {
        id: 'D1',
        triggers: ['detail', 'detailing', 'cleaning', 'interior clean', 'shampoo'],
        response: "We offer maintenance details, interior/exterior deep cleaning, and full resets. A full detail typically includes wash, decontamination, light protection, wheel/tire cleaning, vacuuming, and deep interior cleaning. Perfect for a yearly refresh or prep-for-sale.",
        options: ["Book Detail"]
    }
];

// --- Animation Variants ---

const springTransition = { type: "spring" as const, stiffness: 350, damping: 30 };

const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 20 } }
};

// --- Components ---

const TypingIndicator = () => (
  <motion.div 
    initial="hidden" animate="visible" exit="hidden" variants={bubbleVariants}
    className="bg-slate-100 dark:bg-slate-800 self-start rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5 w-fit shadow-sm border border-slate-200 dark:border-slate-700"
  >
    {[0, 1, 2].map((dot) => (
      <motion.div
        key={dot}
        className="w-1.5 h-1.5 bg-brand-400 rounded-full"
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot * 0.15
        }}
      />
    ))}
  </motion.div>
);

// Vehicle Selector Form Component
const VehicleSelectorForm = ({ onSubmit }: { onSubmit: (data: { year: string, make: string, model: string }) => void }) => {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Prepare datalist options
    const makes = Object.keys(CAR_MAKES_AND_MODELS).sort();
    const foundMake = makes.find(m => m.toLowerCase() === make.toLowerCase());
    const models = foundMake ? CAR_MAKES_AND_MODELS[foundMake] : [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (year && make && model) {
            setSubmitted(true);
            onSubmit({ year, make, model });
        }
    };

    if (submitted) {
        return (
            <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-brand-200 dark:border-brand-900 flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Selected: {year} {make} {model}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full min-w-[260px] space-y-3 p-1">
             <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                <Car className="w-4 h-4 text-brand-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Vehicle Identifier</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                    <input 
                        type="text" 
                        placeholder="Year"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-slate-100"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                        maxLength={4}
                    />
                </div>
                <div className="col-span-2 relative">
                    <input
                        list="makes-list"
                        placeholder="Make (e.g. BMW)"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-slate-100"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        required
                    />
                    <datalist id="makes-list">
                        {makes.map(m => <option key={m} value={m} />)}
                    </datalist>
                </div>
            </div>
            
            <div className="relative">
                <input
                    list="models-list"
                    placeholder="Model (e.g. X5)"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-slate-100"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                />
                <datalist id="models-list">
                    {models.map(m => <option key={m} value={m} />)}
                </datalist>
            </div>

            <button 
                type="submit" 
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={!year || !make || !model}
            >
                Confirm Vehicle <ChevronRight className="w-3 h-3" />
            </button>
        </form>
    );
};

// High Tech Contact Form with Multi-Select Services
const ContactForm = ({ onSubmit }: { onSubmit: (name: string, phone: string, email: string, services: string[]) => void }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const SERVICES = [
        ServiceType.PPF,
        ServiceType.CERAMIC,
        ServiceType.TINT,
        ServiceType.DETAILING,
        ServiceType.WINDSHIELD
    ];

    const toggleService = (s: string) => {
        if (selectedServices.includes(s)) setSelectedServices(prev => prev.filter(i => i !== s));
        else setSelectedServices(prev => [...prev, s]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        onSubmit(name, phone, email, selectedServices.length > 0 ? selectedServices : ["Not Specified"]);
    };

    if (submitted) {
        return (
            <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-brand-200 dark:border-brand-900 text-brand-600 dark:text-brand-400 text-sm font-bold">
                 <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Request Sent
                 </div>
                 <div className="text-xs text-slate-500 font-normal pl-6">
                    We'll contact {name.split(' ')[0]} shortly.
                 </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full min-w-[260px] space-y-3 mt-1">
             <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                <Shield className="w-4 h-4 text-brand-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Encrypted Priority Link</span>
            </div>

            <div className="relative group">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    placeholder="Full Name"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400 dark:text-white"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="relative group">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    placeholder="Mobile Number"
                    type="tel"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400 dark:text-white"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            <div className="relative group">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    placeholder="Email Address"
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400 dark:text-white"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Multi-Select Services */}
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Services of Interest:</p>
                <div className="flex flex-wrap gap-1.5">
                    {SERVICES.map(s => (
                        <button
                            type="button"
                            key={s}
                            onClick={() => toggleService(s)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1
                                ${selectedServices.includes(s) 
                                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm' 
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                                }`}
                        >
                            {selectedServices.includes(s) && <Check className="w-3 h-3" />}
                            {s.replace('Protection', '').replace('Coating', '').trim()}
                        </button>
                    ))}
                </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 mt-2">
                Submit Priority Request <Sparkles className="w-3 h-3" />
            </button>
            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Your information is kept private.
            </p>
        </form>
    );
};

// Feedback Component
const Feedback = () => {
    const [status, setStatus] = useState<'pending' | 'rated'>('pending');

    if (status === 'rated') {
        return (
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 animate-in fade-in">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Thank you for your feedback.
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400 font-medium">Was this helpful?</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => setStatus('rated')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-green-500 transition-colors"
                >
                    <ThumbsUp className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setStatus('rated')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                    <ThumbsDown className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Helper to generate a random ID
const generateThreadId = () => 'thread_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  
  // Thread ID for Session Tracking
  const [threadId, setThreadId] = useState<string>(() => {
    const saved = localStorage.getItem('ppf_chat_thread_id');
    return saved || generateThreadId();
  });
  
  // Persistence Init
  const [messages, setMessages] = useState<Message[]>(() => {
      const saved = localStorage.getItem('ppf_chat_history');
      if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) { console.error("Chat history parse error", e); }
      }
      return [
        {
          id: '1',
          sender: 'bot',
          type: 'text',
          content: "System Online. Welcome to PPF Pros. I'm your virtual protection specialist.",
        },
        {
          id: '2',
          sender: 'bot',
          type: 'options',
          content: "How can I enhance your vehicle today?",
          options: ["Get a Quote", "View Services", "PPF Packages", "Ceramic Packages"]
        }
      ];
  });

  const [chatState, setChatState] = useState<ChatState>({
    name: '',
    phone: '',
    email: '',
    vehicle: { year: '', make: '', model: '' },
    services: []
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persistence Effect
  useEffect(() => {
      localStorage.setItem('ppf_chat_history', JSON.stringify(messages));
      localStorage.setItem('ppf_chat_thread_id', threadId);
  }, [messages, threadId]);

  // Auto-scroll logic
  const scrollToBottom = () => {
     if (bottomRef.current) {
         bottomRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Focus input on open (Desktop only to prevent mobile keyboard jump)
  useEffect(() => {
    if (isOpen && window.innerWidth > 768) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  // Reset Logic
  const handleReset = () => {
      const newThreadId = generateThreadId();
      setThreadId(newThreadId);
      
      const initialMsgs: Message[] = [
        {
          id: Date.now().toString(),
          sender: 'bot',
          type: 'text',
          content: "Chat reset. How can I help you?",
        },
        {
          id: (Date.now()+1).toString(),
          sender: 'bot',
          type: 'options',
          content: "Choose an option below:",
          options: ["Get a Quote", "View Services", "PPF Packages", "Ceramic Packages"]
        }
      ];
      setMessages(initialMsgs);
      setChatState({ name: '', phone: '', email: '', vehicle: { year: '', make: '', model: '' }, services: [] });
      localStorage.removeItem('ppf_chat_history');
      localStorage.setItem('ppf_chat_thread_id', newThreadId);
  };

  // Enhanced Natural Typing Engine for Local Messages
  const simulateBotResponse = async (responseNodes: Message[]) => {
    for (const node of responseNodes) {
      setIsTyping(true);
      
      let delay = 600;
      if (node.type === 'text') {
         // Calculate base speed (approx 20-30ms per character)
         const charSpeed = 25 + Math.random() * 10; 
         const typingTime = node.content.length * charSpeed;
         
         // Add "thinking" latency
         const thinkingTime = 400 + Math.random() * 400;
         
         delay = typingTime + thinkingTime;
         // Cap delay to avoid frustration
         delay = Math.min(delay, 2500);
      } else {
         // Forms and options appear slightly faster but with some processing delay
         delay = 800 + Math.random() * 200;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      
      setIsTyping(false);
      addMessage(node);
      
      // Variable pause between messages to mimic human cadence
      if (responseNodes.indexOf(node) < responseNodes.length - 1) {
          const pause = 400 + Math.random() * 300;
          await new Promise(resolve => setTimeout(resolve, pause));
      }
    }
  };

  // Webhook Interaction for General Queries
  const fetchAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Ensure at least a small delay so typing indicator is seen (better UX)
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Prepare history for context
      const historyPayload = messages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: typeof m.content === 'string' ? m.content : '[Interactive Element]'
      }));

      const responsePromise = fetch('https://n8n.srv1046173.hstgr.cloud/webhook/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat_message',
          threadId: threadId,
          message: userMessage,
          history: historyPayload
        })
      });

      const [response] = await Promise.all([responsePromise, minDelayPromise]);

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Handle flexible response formats
      const botText = typeof data === 'string' ? data : (data.output || data.message || data.text || data.response);

      if (botText) {
          addMessage({
            id: Date.now().toString(),
            sender: 'bot',
            type: 'text',
            content: botText
          });
      } else {
          // Fallback if no text in response
          throw new Error('Empty response from AI');
      }

    } catch (error) {
      console.error("AI Webhook Error:", error);
      // Failover to local support message
      addMessage({
        id: Date.now().toString(),
        sender: 'bot',
        type: 'text',
        content: "I'm currently updating my knowledge base. For immediate service questions, please call our studio at (403) 830-3311."
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content: input
    };
    
    addMessage(userMsg);
    setInput('');
    processUserIntent(input);
  };

  const handleQuickReply = (option: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content: option
    };
    addMessage(userMsg);
    processUserIntent(option);
  };

  // --- Logic Engine ---
  const processUserIntent = (text: string) => {
    const lower = text.toLowerCase();

    // 1. KNOWLEDGE BASE MATCH (Priority)
    // We check if the user query matches any triggers in our local DB
    const kbMatch = KNOWLEDGE_BASE.find(chunk => 
        chunk.triggers.some(t => lower.includes(t))
    );

    if (kbMatch) {
        const msgs: Message[] = [
            { id: Date.now().toString(), sender: 'bot', type: 'text', content: kbMatch.response }
        ];

        // If chunk has specific action (like Quote Form)
        if (kbMatch.action === 'trigger-quote') {
            msgs.push({ 
                id: (Date.now()+1).toString(), 
                sender: 'bot', 
                type: 'form-vehicle-select', 
                content: "To build an accurate quote, I need a few details. First, what vehicle are we protecting?" 
            });
        }
        // If chunk has options
        else if (kbMatch.options) {
             msgs.push({ 
                id: (Date.now()+1).toString(), 
                sender: 'bot', 
                type: 'options', 
                content: "How else can I help?", 
                options: kbMatch.options 
            });
        }

        simulateBotResponse(msgs);
        return;
    }

    // 2. Greeting (Fallback if not in KB)
    if (['hi', 'hello', 'hey'].includes(lower.replace(/[^a-z]/g, ''))) {
      simulateBotResponse([
        { id: Date.now().toString(), sender: 'bot', type: 'text', content: "Hello! I'm the PPF Pros AI. Ask me detailed questions about our services, warranty, or start a quote." },
        { id: (Date.now()+1).toString(), sender: 'bot', type: 'options', content: "", options: ["Get a Quote", "View Services", "PPF Packages"] }
      ]);
      return;
    }

    // 3. Fallback to AI Webhook for unknown/complex queries
    fetchAIResponse(text);
  };

  // --- Form Handlers ---

  const handleVehicleSubmit = (vehicleData: { year: string, make: string, model: string }) => {
    setChatState(prev => ({ ...prev, vehicle: vehicleData }));
    const vehicleString = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
    simulateBotResponse([
      { id: Date.now().toString(), sender: 'bot', type: 'text', content: `Excellent choice. The ${vehicleString} deserves the best protection.` },
      { id: (Date.now()+1).toString(), sender: 'bot', type: 'form-contact', content: "Where should I send the detailed estimate?" }
    ]);
  };

  const handleContactSubmit = async (name: string, phone: string, email: string, services: string[]) => {
    setChatState(prev => ({ ...prev, name, phone, email, services }));
    
    // Simulate Submission
    setIsTyping(true);
    
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ') || '';

    // CONSTRUCT PAYLOAD EXACTLY LIKE QUOTE WIDGET
    const payload = {
        ...INITIAL_STATE, // Use initial defaults from Quote Widget
        services: services, // Override with Chat choices
        vehicle: {
            ...INITIAL_STATE.vehicle,
            year: chatState.vehicle.year,
            make: chatState.vehicle.make,
            model: chatState.vehicle.model,
        },
        contact: {
            ...INITIAL_STATE.contact,
            firstName,
            lastName,
            phone,
            email,
            method: 'Text' as const
        },
        notes: `Chat Widget Lead. Thread ID: ${threadId}`,
        // Add extra fields for webhook context if needed
        threadId: threadId,
        formType: 'Chat Widget Lead',
        source: 'Chat Widget',
        submittedAt: new Date().toISOString()
    };

    try {
        await fetch('https://n8n.srv1046173.hstgr.cloud/webhook/ppfprosformai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Exact GTM Event from Quote Widget
        if (window.dataLayer) {
             window.dataLayer.push({
                event: 'form_submission',
                form_type: 'chat_widget_lead',
                services_count: services.length,
                has_ppf: services.includes(ServiceType.PPF),
                has_ceramic: services.includes(ServiceType.CERAMIC),
                has_tint: services.includes(ServiceType.TINT)
            });
        }

    } catch (e) {
        console.error("Chat lead submission error", e);
    }

    setIsTyping(false);
    
    simulateBotResponse([
        { 
            id: Date.now().toString(),
            sender: 'bot',
            type: 'text',
            content: `Done. I've secured a priority slot for your request, ${firstName}. A specialist will contact you shortly.`
        },
        {
            id: (Date.now()+1).toString(),
            sender: 'bot',
            type: 'feedback',
            content: "How was your chat experience?",
        }
    ]);
  };

  return (
    <>
      {/* --- Launcher --- */}
      <AnimatePresence>
        {!isOpen && (
          // Positioned bottom-right (aligned with Quote FAB in App.tsx)
          <motion.div className="fixed bottom-6 right-6 z-[45] group">
             {/* Tooltip - Now on the Left of the button */}
            <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none hidden md:block"
            >
                AI Assistant Online
                {/* Arrow pointing right */}
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-slate-800 transform rotate-45"></div>
            </motion.div>

            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="w-14 h-14 rounded-full bg-slate-900 border-2 border-brand-500 shadow-[0_0_30px_rgba(14,165,233,0.4)] flex items-center justify-center relative overflow-hidden"
            >
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border border-brand-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                
                <div className="relative z-10">
                    <Bot className="w-7 h-7 text-brand-400 group-hover:text-white transition-colors" />
                </div>
                
                {/* Online Dot */}
                <div className="absolute top-2 right-3 w-2.5 h-2.5 bg-green-500 rounded-full border border-slate-900 shadow-[0_0_10px_#22c55e]"></div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Window --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Anchor to Bottom-Right
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={springTransition}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[45] w-[calc(100vw-2rem)] md:w-[380px] h-[80vh] md:h-[600px] bg-white dark:bg-slate-950 md:rounded-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden font-inter"
          >
            {/* Header */}
            <div className="bg-slate-950 text-white p-4 flex justify-between items-center border-b border-slate-800 relative overflow-hidden flex-shrink-0">
                {/* Tech Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner relative">
                        <Bot className="w-6 h-6 text-brand-400" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide text-white">PPF PROS <span className="text-brand-400">AI</span></h3>
                        <p className="text--[10px] text-slate-400 uppercase tracking-wider font-medium">Protection Specialist</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                    <button 
                        onClick={handleReset} 
                        className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white" 
                        title="Reset Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div 
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-4 space-y-5 bg-slate-50 dark:bg-slate-950 relative scroll-smooth brand-scrollbar"
            >
                {/* Grid Background Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial="hidden"
                        animate="visible"
                        variants={bubbleVariants}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} relative z-10`}
                    >
                        {/* Avatar for Bot */}
                        {msg.sender === 'bot' && (
                            <span className="text-[10px] text-slate-400 ml-1 mb-1.5 flex items-center gap-1 font-medium tracking-wide">
                                <Zap className="w-3 h-3 text-brand-500 fill-brand-500" /> AI ASSISTANT
                            </span>
                        )}

                        <div 
                            className={`max-w-[90%] px-4 py-3.5 text-sm leading-relaxed shadow-sm backdrop-blur-sm
                                ${msg.sender === 'user' 
                                    ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl rounded-br-sm shadow-brand-500/20' 
                                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm'
                                }`
                            }
                        >
                            <p className="whitespace-pre-line">{msg.content}</p>
                            
                            {msg.type === 'options' && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {msg.options?.map((opt, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleQuickReply(opt)}
                                                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-700 hover:border-brand-200 dark:hover:border-brand-900 transition-all shadow-sm"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* --- Vehicle Selector Form --- */}
                             {msg.type === 'form-vehicle-select' && (
                                <div className="w-full mt-2">
                                    <VehicleSelectorForm onSubmit={handleVehicleSubmit} />
                                </div>
                             )}

                            {/* --- High Tech Form: Contact --- */}
                             {msg.type === 'form-contact' && (
                                <ContactForm onSubmit={handleContactSubmit} />
                             )}

                             {/* --- Feedback --- */}
                             {msg.type === 'feedback' && (
                                <div className="mt-2">
                                    <Feedback />
                                </div>
                             )}

                        </div>
                    </motion.div>
                ))}
                
                {isTyping && (
                    <div className="flex flex-col items-start gap-1 ml-2">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            <Zap className="w-3 h-3 text-brand-500" /> AI IS TYPING...
                        </span>
                        <TypingIndicator />
                    </div>
                )}
                
                {/* Invisible bottom div for scrolling */}
                <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2 relative"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow placeholder-slate-400 text-sm border border-slate-200 dark:border-slate-800"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-brand-500 text-white p-3.5 rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                    >
                        <CornerDownLeft className="w-5 h-5" />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400">Powered by PPF Pros Neural Engine</p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
