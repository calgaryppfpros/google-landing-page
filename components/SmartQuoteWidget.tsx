import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, ShieldCheck, Sparkles, Car, Info, Tag, ThermometerSun, BrainCircuit, Cpu, PlusCircle, Gift, MessageSquare, Phone, Mail, Ticket, Ghost, Palette, Droplets, Search, Eraser, Armchair, AlertCircle, MousePointerClick, RotateCcw, ArrowRight, Shield, Sun, Eye, Umbrella, ScanLine, Zap, Radar, LocateFixed } from 'lucide-react';
import { 
  QuoteState, ServiceType, PPFPackage, CeramicPackage, 
  UndercoatingPackage, TintType, TintPackage, TINT_ADDONS_LIST, PROMOS, PPFFilmType, CAR_COLORS,
  PaintCorrectionLevel, InteriorProtectionOption, CAR_MAKES_AND_MODELS
} from '../types';
import { 
  buildSteps, INITIAL_STATE, getPPFIncludedZones, 
  getAvailablePPFAddons, getCeramicIncludedAddons, getAvailableCeramicAddons, 
  WizardStep, PPF_ZONE_DESCRIPTIONS, CERAMIC_ADDON_DESCRIPTIONS, WINDSHIELD_DESCRIPTIONS, TINT_TYPE_DESCRIPTIONS,
  analyzePromos, PromoOpportunity
} from '../services/quoteLogic';
import { submitLead } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// --- Searchable Select Component ---
interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  allowCustom?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled, allowCustom }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val: string) => {
      onChange(val);
      setIsOpen(false);
      setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={`p-3 border rounded-lg w-full flex items-center justify-between cursor-pointer transition-all duration-200 
          ${disabled 
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus-within:ring-2 focus-within:ring-brand-400 hover:border-brand-300 dark:hover:border-brand-700'
          }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500" 
                placeholder="Search..." 
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48 brand-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt} 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors 
                    ${value === opt 
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  onClick={() => handleSelect(opt)}
                >
                  {opt}
                </div>
              ))
            ) : (
               <>
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No results found</div>
                {allowCustom && search.trim().length > 0 && (
                    <div 
                        className="px-4 py-2 text-sm cursor-pointer bg-slate-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold border-t border-slate-100 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-800"
                        onClick={() => handleSelect(search)}
                    >
                        Use "{search}"
                    </div>
                )}
               </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// Detailed Value Props for PPF Packages
const PPF_PACKAGE_DESCRIPTIONS: Record<string, string> = {
    [PPFPackage.BRONZE]: "Entry-level protection for the leading 24” of the hood and fenders. Prevents common stone chips.",
    [PPFPackage.SILVER]: "Adds full bumper protection to the Bronze pack. Ideal for city driving.",
    [PPFPackage.GOLD]: "Our standard for complete front-end peace of mind. Full hood and fenders mean NO visible seams.",
    [PPFPackage.TRACK]: "Gold package + Rocker Panels. Essential for gravel roads, track days, or sticky tires.",
    [PPFPackage.DIAMOND]: "The ultimate solution. Every painted surface is wrapped. Change the color or freeze it in time."
};

// --- Enhanced Tooltip Component with Portal ---
interface TooltipProps {
    text: string;
    id: string;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const Tooltip = ({ text, id, isOpen, onToggle, onClose }: TooltipProps) => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (isOpen && e.key === 'Escape') onClose();
      };
      if (isOpen) document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Determine where to render the portal (document.body)
    const portalContainer = typeof document !== 'undefined' ? document.body : null;

    const tooltipContent = (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            />
            
            {/* Tooltip Card */}
            <motion.div
              id={`tooltip-${id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="relative w-full max-w-xs bg-white dark:bg-slate-900 p-0 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[10000] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                        <Info className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Details</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        aria-label="Close tooltip"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{text}</p>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="text-xs font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50 px-4 py-2 rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );

    return (
        <div className="relative ml-4 flex-shrink-0 inline-flex items-center justify-center">
            <button
                ref={triggerRef}
                type="button"
                className={`focus:outline-none p-1.5 rounded-full transition-colors 
                    ${isOpen 
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 ring-2 ring-brand-100 dark:ring-brand-900' 
                        : 'text-brand-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-slate-800'
                    }`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggle();
                }}
                aria-label="More info"
                aria-expanded={isOpen}
                aria-controls={`tooltip-${id}`}
            >
                <Info className="w-5 h-5" />
            </button>
            {portalContainer && createPortal(tooltipContent, portalContainer)}
        </div>
    );
};

export const SmartQuoteWidget: React.FC<Props> = ({ isOpen, onClose }) => {
  const [state, setState] = useState<QuoteState>(() => {
    const saved = localStorage.getItem('ppfpros_quote_state');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_STATE));
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Promo State
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  
  // Tooltip Management State
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // AI Step State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [opportunities, setOpportunities] = useState<PromoOpportunity[]>([]);

  // Framer Motion
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => buildSteps(state), [state.services, state.ppf.filmType]);
  const currentStep = isSuccess ? 'SUCCESS' : steps[currentStepIndex];

  // Persist state
  useEffect(() => {
    localStorage.setItem('ppfpros_quote_state', JSON.stringify(state));
  }, [state]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isOpen]);

  // Scroll to Top Effect
  useEffect(() => {
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }, [currentStepIndex, isSuccess]);

  // AI Step Logic
  useEffect(() => {
    if (currentStep === 'AI_MATCHING') {
        setIsAnalyzing(true);
        const timer = setTimeout(() => {
            const ops = analyzePromos(state);
            setOpportunities(ops);
            setIsAnalyzing(false);
            // If no opportunities, auto-advance after brief pause
            if (ops.length === 0) {
                setTimeout(() => handleNext(), 1000);
            }
        }, 4500); // Extended slightly for new animation
        return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Clear active tooltip when changing steps
  useEffect(() => {
      setActiveTooltipId(null);
  }, [currentStep]);

  // Handlers
  const updateState = (updates: Partial<QuoteState>) => {
    setState(prev => ({ ...prev, ...updates }));
    if (validationMsg) setValidationMsg(null); // Clear validation on interaction
  };

  const toggleTooltip = (id: string) => {
      setActiveTooltipId(prev => prev === id ? null : id);
  };

  const handleStartOver = () => {
    if (confirm("Are you sure you want to start over? All current progress will be lost.")) {
        // Deep copy reset
        setState(JSON.parse(JSON.stringify(INITIAL_STATE)));
        setCurrentStepIndex(0);
        setIsSuccess(false);
        setPromoInput('');
        setPromoError('');
        setValidationMsg(null);
        setIsAnalyzing(false);
        setOpportunities([]);
        localStorage.removeItem('ppfpros_quote_state');
    }
  };

  // Promo Handlers
  const handleAddPromo = () => {
      if (!promoInput) return;
      const codeUpper = promoInput.toUpperCase().trim();
      
      // Check if already applied
      if (state.promoCodes.includes(codeUpper)) {
          setPromoError('This code is already active.');
          return;
      }
      
      // Validate against PROMOS list
      const isValid = PROMOS.some(p => p.code === codeUpper);
      
      if (isValid) {
          updateState({ promoCodes: [...state.promoCodes, codeUpper] });
          setPromoInput('');
          setPromoError('');
      } else {
          setPromoError('Invalid or expired promo code.');
      }
  };

  const handleRemovePromo = (code: string) => {
      updateState({ promoCodes: state.promoCodes.filter(c => c !== code) });
  };

  const handleAddService = (service: ServiceType, startStep: WizardStep) => {
    const newServices = state.services.includes(service) 
        ? state.services // No op if already included
        : [...state.services, service];
    
    const newState = { ...state, services: newServices };
    
    // Update state immediately
    setState(newState);
    
    // Determine where to jump
    const newSteps = buildSteps(newState);
    const newIndex = newSteps.indexOf(startStep);
    
    if (newIndex !== -1) {
        setCurrentStepIndex(newIndex);
    }
  };

  const handleFreeAddon = (addon: string, code: string, exclusiveList?: string[]) => {
      let newAddons = [...state.ppf.addOns];
      
      // If exclusiveList provided, remove any existing items from that list to enforce single selection
      if (exclusiveList) {
          newAddons = newAddons.filter(a => !exclusiveList.includes(a));
      }

      // Add the new one if not present (simple selection mode)
      if (!newAddons.includes(addon)) {
          newAddons.push(addon);
      }

      const newCodes = state.promoCodes.includes(code) ? state.promoCodes : [...state.promoCodes, code];

      updateState({ 
          ppf: { ...state.ppf, addOns: newAddons },
          promoCodes: newCodes 
      });
  };

  const handleNext = () => {
    // Simple validation
    let error = null;

    if (currentStep === 'SERVICES' && state.services.length === 0) {
      error = "Please select at least one service.";
    }
    else if (currentStep === 'PPF_TYPE' && !state.ppf.filmType) {
        error = "Please select a PPF Film Type.";
    }
    else if (currentStep === 'PPF_COLOR' && !state.ppf.fashionColor) {
        error = "Please select a color.";
    }
    else if (currentStep === 'PPF_PACKAGE' && !state.ppf.package) {
      error = "Please select a PPF package.";
    }
    else if (currentStep === 'TINT_TYPE' && !state.tint.type) {
        error = "Please select a Tint Type.";
    }
    else if (currentStep === 'TINT_PACKAGE' && !state.tint.package) {
        error = "Please select a Tint Package.";
    }
    else if (currentStep === 'CERAMIC_PACKAGE' && !state.ceramic.package) {
      error = "Please select a Ceramic package.";
    }
    else if (currentStep === 'PAINT_CORRECTION' && !state.paintCorrection) {
        error = "Please select a paint correction level.";
    }
    else if (currentStep === 'INTERIOR' && state.interior.length === 0) {
         error = "Please select at least one interior option or go back.";
    }
    else if (currentStep === 'UNDERCOATING' && !state.undercoating) {
      error = "Please select an undercoating option.";
    }
    else if (currentStep === 'VEHICLE') {
        if(!state.vehicle.year || !state.vehicle.make || !state.vehicle.model) {
             error = "Please complete required vehicle details.";
        }
    }
    else if (currentStep === 'CONTACT') {
        if(!state.contact.firstName || !state.contact.lastName || !state.contact.phone || !state.contact.email) {
            error = "Please complete all contact fields.";
        }
    }

    if (error) {
        setValidationMsg(error);
        return;
    }
    
    setValidationMsg(null);

    // Smart Navigation: Return to AI/Upsell Engine if Vehicle/Contact are already done
    const serviceEndSteps: WizardStep[] = ['PPF_ADDONS', 'TINT_ADDONS', 'CERAMIC_ADDONS', 'PAINT_CORRECTION', 'INTERIOR', 'WINDSHIELD', 'UNDERCOATING', 'DETAILING'];
    
    if (serviceEndSteps.includes(currentStep)) {
        const isVehicleDone = state.vehicle.year && state.vehicle.make && state.vehicle.model;
        const isContactDone = state.contact.firstName && state.contact.lastName && state.contact.phone && state.contact.email;
        
        if (isVehicleDone && isContactDone) {
            const aiStepIndex = steps.indexOf('AI_MATCHING');
            // Only jump if the AI step is ahead of us (it should be)
            if (aiStepIndex !== -1 && aiStepIndex > currentStepIndex) {
                setCurrentStepIndex(aiStepIndex);
                return;
            }
        }
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationMsg(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitLead(state);
      setIsSuccess(true);
      localStorage.removeItem('ppfpros_quote_state');
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to filter packages based on Film Type
  const getFilteredPPFPackages = () => {
      const all = Object.values(PPFPackage);
      const type = state.ppf.filmType;

      if (type === PPFFilmType.STEALTH) {
          return all.filter(p => p === PPFPackage.GOLD || p === PPFPackage.DIAMOND);
      }
      if (type === PPFFilmType.FASHION) {
          return all.filter(p => p === PPFPackage.DIAMOND);
      }
      return all;
  };

  // Service Step Card Helper
  const ServiceCard = ({ type, icon: Icon, desc, selected, onClick }: any) => (
      <div 
        onClick={onClick}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group 
            ${selected 
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-lg transform scale-[1.02]' 
                : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
      >
          {selected && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
            </div>
          )}
          
          <div className="flex flex-col gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${selected ? 'bg-brand-500 text-white shadow-brand-500/30 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-brand-500'}`}>
                  <Icon className="w-6 h-6" />
              </div>
              <div>
                  <h4 className={`font-bold text-lg mb-1 transition-colors ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>{type}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
              </div>
          </div>
      </div>
  );

  // Render Content Helper
  const renderStepContent = () => {
    switch (currentStep) {
      case 'SERVICES':
        const SERVICE_DETAILS = [
            { type: ServiceType.PPF, icon: Shield, desc: "Stop rock chips & scratches." },
            { type: ServiceType.TINT, icon: Sun, desc: "Heat rejection & privacy." },
            { type: ServiceType.CERAMIC, icon: Droplets, desc: "Hydrophobic shine & easy cleaning." },
            { type: ServiceType.PAINT_CORRECTION, icon: Sparkles, desc: "Remove swirls & restore gloss." },
            { type: ServiceType.INTERIOR, icon: Armchair, desc: "Protect leather & fabric." },
            { type: ServiceType.WINDSHIELD, icon: Eye, desc: "Prevent chips & cracks." },
            { type: ServiceType.UNDERCOATING, icon: Umbrella, desc: "Winter rust protection." },
            { type: ServiceType.DETAILING, icon: Car, desc: "Deep cleaning & restoration." },
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white">Build Your Protection Package</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Select all services you're interested in.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {SERVICE_DETAILS.map(s => (
                   <ServiceCard 
                        key={s.type}
                        type={s.type.split('(')[0].trim()} // Simpler title
                        icon={s.icon}
                        desc={s.desc}
                        selected={state.services.includes(s.type)}
                        onClick={() => {
                             const newServices = state.services.includes(s.type) 
                                ? state.services.filter(i => i !== s.type)
                                : [...state.services, s.type];
                             updateState({ services: newServices });
                        }}
                   />
               ))}
            </div>
          </div>
        );

      case 'PPF_TYPE':
          return (
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select PPF Finish</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose the type of protection you want for your vehicle.</p>
                  <div className="grid gap-4">
                      {Object.values(PPFFilmType).map((type) => {
                          let Icon = ShieldCheck;
                          let desc = "Invisible protection.";
                          let style = "bg-white dark:bg-slate-900";

                          if (type === PPFFilmType.STEALTH) {
                              Icon = Ghost;
                              desc = "Turn gloss paint matte or protect factory matte finish.";
                              style = "bg-slate-50 dark:bg-slate-800";
                          } else if (type === PPFFilmType.FASHION) {
                              Icon = Palette;
                              desc = "Change your vehicle's color while protecting it.";
                              style = "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-800";
                          }

                          return (
                              <div key={type} 
                                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden 
                                    ${state.ppf.filmType === type 
                                        ? 'border-brand-400 shadow-md ring-1 ring-brand-400/30' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500'} 
                                    ${style}`}
                                  onClick={() => {
                                      // Auto-reset package if switching types to ensure validity
                                      const updates: any = { ppf: { ...state.ppf, filmType: type } };
                                      if (type === PPFFilmType.FASHION) {
                                          updates.ppf.package = PPFPackage.DIAMOND; // Fashion must be full wrap
                                      } else if (type === PPFFilmType.STEALTH && state.ppf.package && state.ppf.package !== PPFPackage.DIAMOND && state.ppf.package !== PPFPackage.GOLD) {
                                          updates.ppf.package = null; // Reset if invalid for Stealth
                                      }
                                      updateState(updates);
                                  }}
                              >
                                  <div className="flex items-center gap-4 relative z-10">
                                      <div className={`p-3 rounded-full ${state.ppf.filmType === type ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                                          <Icon className="w-6 h-6" />
                                      </div>
                                      <div className="flex-grow">
                                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{type}</h4>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                                      </div>
                                      {state.ppf.filmType === type && <Check className="w-6 h-6 text-brand-600 dark:text-brand-400" />}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          );

      case 'PPF_COLOR':
          const selectedColorObj = CAR_COLORS.find(c => c.name === state.ppf.fashionColor);
          return (
              <div className="space-y-4">
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select Color</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Choose from the official XPEL Fashion Film lineup.</p>
                   <div className="grid grid-cols-3 gap-3">
                       {CAR_COLORS.filter(c => c.id !== 'clear' && c.id !== 'stealth').map(c => (
                           <div 
                                key={c.id}
                                onClick={() => updateState({ ppf: { ...state.ppf, fashionColor: c.name } })}
                                className={`cursor-pointer rounded-xl p-2 border-2 transition-all flex flex-col items-center gap-2 
                                    ${state.ppf.fashionColor === c.name 
                                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20' 
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                           >
                               <div className="w-full aspect-square rounded-full shadow-inner border border-slate-100 dark:border-slate-600 relative overflow-hidden" style={{ backgroundColor: c.color }}>
                                   {c.type === 'Gloss' && <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-white/40 to-transparent rounded-full"></div>}
                               </div>
                               <span className="text-[10px] font-bold text-center text-slate-700 dark:text-slate-300 leading-tight">{c.name}</span>
                           </div>
                       ))}
                   </div>
                   {selectedColorObj && (
                       <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm mt-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                           <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                           <div>
                               <span className="font-bold text-slate-900 dark:text-white block">{selectedColorObj.name}</span>
                               <p className="text-slate-600 dark:text-slate-400">{selectedColorObj.desc}</p>
                           </div>
                       </div>
                   )}
              </div>
          );

      case 'PPF_PACKAGE':
        const availablePackages = getFilteredPPFPackages();
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select PPF Coverage Level</h3>
            
            {state.ppf.filmType === PPFFilmType.FASHION && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/50 text-sm mb-4 flex items-start gap-2">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <p>Color change films require a full vehicle wrap (Diamond Package) to ensure no original paint shows.</p>
                </div>
            )}
            
            {/* XPEL Fusion Toggle */}
            {state.ppf.filmType === PPFFilmType.CLEAR && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl text-white mb-4 shadow-lg border border-slate-700">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <Droplets className="w-6 h-6 text-brand-400" />
                             <div>
                                 <p className="font-bold text-sm">XPEL Ultimate Fusion™ Upgrade</p>
                                 <p className="text-xs text-slate-400">Hydrophobic top-coat built into the film.</p>
                             </div>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={state.ppf.isFusion} onChange={(e) => updateState({ ppf: { ...state.ppf, isFusion: e.target.checked } })} />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                     </div>
                </div>
            )}

            <div className="space-y-3">
              {availablePackages.map((pkg) => {
                // Custom Label Logic for Stealth
                let label = pkg;
                if (state.ppf.filmType === PPFFilmType.STEALTH) {
                    if (pkg === PPFPackage.GOLD) label = 'Front End Protection (For Matte Cars)' as any;
                    if (pkg === PPFPackage.DIAMOND) label = 'Full Stealth Conversion' as any;
                }

                return (
                    <div key={pkg}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${state.ppf.package === pkg
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                    onClick={() => updateState({ ppf: { ...state.ppf, package: pkg } })}
                    >
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <span className="font-bold text-slate-900 dark:text-white block">{label}</span>
                        </div>
                        {state.ppf.package === pkg && <Check className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-2 mb-2">
                         {PPF_PACKAGE_DESCRIPTIONS[pkg]}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-1">
                        <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mr-1">Covers:</span>
                        {getPPFIncludedZones(pkg).map((zone, i) => (
                            <span key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">{zone}</span>
                        ))}
                    </div>
                    </div>
                );
              })}
            </div>
          </div>
        );

      case 'PPF_ADDONS':
        if (!state.ppf.package) return null;
        const availablePPFAddons = getAvailablePPFAddons(state.ppf.package);
        
        if (state.ppf.package === PPFPackage.DIAMOND || availablePPFAddons.length === 0) {
          return (
            <div className="text-center py-10">
              <ShieldCheck className="w-16 h-16 text-brand-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Full Coverage Selected</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">The Diamond package covers every painted surface.</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select Extra PPF Zones</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">These are optional additions to your {state.ppf.package} package.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePPFAddons.map((addon) => (
                <div key={addon} 
                    className={`relative flex items-center justify-between p-3 rounded-lg border transition-all 
                        ${state.ppf.addOns.includes(addon) 
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  <label className="flex items-center flex-grow cursor-pointer select-none min-w-0">
                     <input 
                      type="checkbox" 
                      className="w-4 h-4 text-brand-500 rounded focus:ring-brand-400 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 flex-shrink-0"
                      checked={state.ppf.addOns.includes(addon)}
                      onChange={(e) => {
                        const newAddons = e.target.checked 
                          ? [...state.ppf.addOns, addon]
                          : state.ppf.addOns.filter(a => a !== addon);
                        updateState({ ppf: { ...state.ppf, addOns: newAddons } });
                      }}
                    />
                    <span className="ml-2 text-sm font-medium text-slate-900 dark:text-slate-100 truncate pr-1">{addon}</span>
                  </label>
                  <Tooltip 
                    text={PPF_ZONE_DESCRIPTIONS[addon] || "Protects this zone."} 
                    id={`ppf-${addon}`} 
                    isOpen={activeTooltipId === `ppf-${addon}`}
                    onToggle={() => toggleTooltip(`ppf-${addon}`)}
                    onClose={() => setActiveTooltipId(null)}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'TINT_TYPE':
          return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select Tint Technology</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">We offer the best in the industry by XPEL.</p>
                <div className="space-y-4">
                    {Object.values(TintType).map(type => (
                         <div key={type} 
                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all 
                                ${state.tint.type === type 
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-md' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                            onClick={() => updateState({ tint: { ...state.tint, type: type } })}
                         >
                             <div className="flex items-center gap-3 mb-3">
                                 {type.includes('XR') ? <ThermometerSun className="text-orange-500 w-6 h-6" /> : <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold">CS</div>}
                                 <span className="font-bold text-slate-900 dark:text-white text-lg">{type}</span>
                                 {state.tint.type === type && <Check className="w-5 h-5 text-brand-600 dark:text-brand-400 ml-auto" />}
                             </div>
                             
                             <div className="pl-9">
                                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                     {TINT_TYPE_DESCRIPTIONS[type]}
                                 </p>
                             </div>
                         </div>
                    ))}
                </div>
            </div>
          );

      case 'TINT_PACKAGE':
          return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">How many windows?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.values(TintPackage).map(pkg => (
                        <div key={pkg}
                            className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all 
                                ${state.tint.package === pkg 
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-md' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                            onClick={() => updateState({ tint: { ...state.tint, package: pkg } })}
                        >
                            <span className="font-medium text-slate-900 dark:text-slate-100">{pkg}</span>
                        </div>
                    ))}
                </div>
            </div>
          );

      case 'TINT_ADDONS':
          return (
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tint Add-ons</h3>
                  <div className="space-y-3">
                      {TINT_ADDONS_LIST.map(addon => (
                        <div key={addon} 
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all 
                                ${state.tint.addOns.includes(addon) 
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-sm' 
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}
                        >
                             <label className="flex items-center flex-grow cursor-pointer min-w-0">
                                <input type="checkbox" className="w-5 h-5 text-brand-500 rounded focus:ring-brand-400 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 flex-shrink-0"
                                    checked={state.tint.addOns.includes(addon)}
                                    onChange={(e) => {
                                        const newAddons = e.target.checked 
                                            ? [...state.tint.addOns, addon] 
                                            : state.tint.addOns.filter(a => a !== addon);
                                        updateState({ tint: { ...state.tint, addOns: newAddons } });
                                    }}
                                />
                                <span className="ml-3 text-slate-900 dark:text-slate-100 font-medium truncate pr-2">{addon}</span>
                            </label>
                            <Tooltip 
                                text={addon.includes('Windshield') ? "Clear ceramic film for heat rejection without darkening." : "Dark strip at the top of the windshield to block sun glare."} 
                                id={`tint-${addon}`} 
                                isOpen={activeTooltipId === `tint-${addon}`}
                                onToggle={() => toggleTooltip(`tint-${addon}`)}
                                onClose={() => setActiveTooltipId(null)}
                            />
                        </div>
                      ))}
                  </div>
              </div>
          );

      case 'CERAMIC_PACKAGE':
        const isStealth = state.ppf.filmType === PPFFilmType.STEALTH;
        return (
            <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {isStealth ? 'Select Fusion Stealth Coating' : 'Select Ceramic Coating Level'}
            </h3>
            {isStealth && (
                <div className="bg-slate-900 text-white p-3 rounded-lg text-sm mb-2 flex items-center gap-2">
                    <Ghost className="w-4 h-4" />
                    <span>Using Satin-Safe Ceramic to preserve matte finish.</span>
                </div>
            )}
            <div className="space-y-3">
              {Object.values(CeramicPackage).map((pkg) => (
                <div key={pkg}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${state.ceramic.package === pkg
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                  onClick={() => updateState({ ceramic: { ...state.ceramic, package: pkg } })}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        <span className="font-bold text-slate-900 dark:text-white block">{pkg}</span>
                    </div>
                    {state.ceramic.package === pkg && <Check className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {pkg === CeramicPackage.PLUS && "Single-layer coating + Top coat. 4-Year Warranty."}
                    {pkg === CeramicPackage.PREMIUM && "Two-layer base + Top coat. 8-Year Warranty."}
                    {pkg === CeramicPackage.SUPREME && "Multi-layer flagship protection. 8-Year Warranty."}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex flex-wrap gap-1">
                     <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mr-1">Includes:</span>
                     {getCeramicIncludedAddons(pkg).length > 0 ? (
                         getCeramicIncludedAddons(pkg).map((item, i) => (
                            <span key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{item}</span>
                         ))
                     ) : (
                         <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">Paint & PPF Only</span>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

        case 'CERAMIC_ADDONS':
            if (!state.ceramic.package) return null;
            const availCeramicAddons = getAvailableCeramicAddons(state.ceramic.package);
            const includedCeramic = getCeramicIncludedAddons(state.ceramic.package);

            return (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ceramic Add-ons</h3>
                
                {includedCeramic.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Already Included</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {includedCeramic.map(i => (
                                <span key={i} className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-full text-slate-700 dark:text-slate-200 flex items-center">
                                    <Check className="w-3 h-3 mr-1 text-green-500"/> {i}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {availCeramicAddons.map((addon) => (
                    <div key={addon} 
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer 
                            ${state.ceramic.addOns.includes(addon) 
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-sm' 
                                : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}
                    >
                       <label className="flex items-center flex-grow cursor-pointer min-w-0">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 text-brand-500 rounded focus:ring-brand-400 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 flex-shrink-0"
                                checked={state.ceramic.addOns.includes(addon)}
                                onChange={(e) => {
                                const newAddons = e.target.checked 
                                    ? [...state.ceramic.addOns, addon]
                                    : state.ceramic.addOns.filter(a => a !== addon);
                                updateState({ ceramic: { ...state.ceramic, addOns: newAddons } });
                                }}
                            />
                            <span className="ml-2 text-sm font-medium text-slate-900 dark:text-slate-100 truncate pr-2">{addon}</span>
                      </label>
                      <Tooltip 
                        text={CERAMIC_ADDON_DESCRIPTIONS[addon] || "Premium protection for this surface."} 
                        id={`ceramic-${addon}`} 
                        isOpen={activeTooltipId === `ceramic-${addon}`}
                        onToggle={() => toggleTooltip(`ceramic-${addon}`)}
                        onClose={() => setActiveTooltipId(null)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );

        case 'PAINT_CORRECTION':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Paint Correction</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Restore your paint's clarity by removing swirls and scratches before protection.</p>
                    <div className="space-y-3">
                        {Object.values(PaintCorrectionLevel).map((level) => (
                            <div key={level}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all 
                                    ${state.paintCorrection === level 
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-md' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                                onClick={() => updateState({ paintCorrection: level })}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white">{level}</span>
                                    {state.paintCorrection === level && <Check className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {level.includes('Stage 1') && "Removes light marring and increases gloss. Ideal for new cars."}
                                    {level.includes('Stage 2') && "Removes moderate swirls and scratches (~80% defect removal)."}
                                    {level.includes('Stage 3') && "Multi-step heavy compounding for restoration of neglected paint."}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'INTERIOR':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Interior Protection</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Protect delicate surfaces from UV rays, dye transfer, and stains.</p>
                    <div className="space-y-3">
                        {Object.values(InteriorProtectionOption).map((opt) => (
                            <div key={opt} 
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all 
                                    ${state.interior.includes(opt) 
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-sm' 
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}
                            >
                                <label className="flex items-center flex-grow cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 text-brand-500 rounded focus:ring-brand-400 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
                                        checked={state.interior.includes(opt)}
                                        onChange={(e) => {
                                            const newInterior = e.target.checked
                                                ? [...state.interior, opt]
                                                : state.interior.filter(i => i !== opt);
                                            updateState({ interior: newInterior });
                                        }}
                                    />
                                    <span className="ml-3 text-slate-900 dark:text-slate-100 font-medium">{opt}</span>
                                </label>
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-brand-500">
                                    <Armchair className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'WINDSHIELD':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Windshield Protection Options</h3>
                    <div className="p-4 border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
                        <p className="font-medium text-brand-900 dark:text-brand-100">Windshield Protection Film</p>
                        <p className="text-sm text-brand-700 dark:text-brand-300">Included as core service.</p>
                    </div>
                    <div className="space-y-3">
                         {['Rock chip repair (before film)', 'Windshield ceramic coating'].map(opt => (
                            <div key={opt} 
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer 
                                    ${state.windshield.addOns.includes(opt) 
                                        ? 'border-brand-500 bg-white dark:bg-slate-900 ring-1 ring-brand-500 shadow-sm' 
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}
                            >
                                <label className="flex items-center flex-grow cursor-pointer min-w-0">
                                    <input type="checkbox" className="w-5 h-5 text-brand-500 rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 flex-shrink-0"
                                        checked={state.windshield.addOns.includes(opt)}
                                        onChange={(e) => {
                                            const newAddons = e.target.checked 
                                                ? [...state.windshield.addOns, opt] 
                                                : state.windshield.addOns.filter(a => a !== opt);
                                            updateState({ windshield: { addOns: newAddons }});
                                        }}
                                    />
                                    <span className="ml-3 text-slate-900 dark:text-slate-100 truncate pr-2">{opt}</span>
                                </label>
                                <Tooltip 
                                    text={WINDSHIELD_DESCRIPTIONS[opt]} 
                                    id={`wind-${opt}`} 
                                    isOpen={activeTooltipId === `wind-${opt}`}
                                    onToggle={() => toggleTooltip(`wind-${opt}`)}
                                    onClose={() => setActiveTooltipId(null)}
                                />
                            </div>
                         ))}
                    </div>
                </div>
            );

        case 'UNDERCOATING':
             return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Undercoating & Rustproofing</h3>
                    <div className="space-y-3">
                    {Object.values(UndercoatingPackage).map((pkg) => (
                        <div key={pkg} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all 
                            ${state.undercoating === pkg 
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-md' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                        onClick={() => updateState({ undercoating: pkg })}
                        >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{pkg}</span>
                            {state.undercoating === pkg && <Check className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
            );

        case 'DETAILING':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Detailing Goals</h3>
                    <p className="text-slate-600 dark:text-slate-400">Tell us about your detailing needs. Interior deep clean? Paint correction? Smell removal?</p>
                    <textarea 
                        className="w-full h-32 p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                        placeholder="I need a full interior detail and..."
                        value={state.detailingNotes}
                        onChange={(e) => updateState({ detailingNotes: e.target.value })}
                    ></textarea>
                </div>
            );
        
        case 'VEHICLE':
            const availableModels = state.vehicle.make && CAR_MAKES_AND_MODELS[state.vehicle.make] 
                ? CAR_MAKES_AND_MODELS[state.vehicle.make] 
                : [];

            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" placeholder="Year (e.g. 2024)" 
                            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400" 
                            value={state.vehicle.year} onChange={e => updateState({ vehicle: { ...state.vehicle, year: e.target.value.replace(/\D/g, '').slice(0,4) } })} 
                        />
                        
                        <div className="col-span-1">
                             <SearchableSelect 
                                options={Object.keys(CAR_MAKES_AND_MODELS).sort()} 
                                value={state.vehicle.make} 
                                onChange={(val) => updateState({ vehicle: { ...state.vehicle, make: val, model: '' } })}
                                placeholder="Select Make"
                                allowCustom={true}
                             />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                             <SearchableSelect 
                                options={availableModels.sort()} 
                                value={state.vehicle.model} 
                                onChange={(val) => updateState({ vehicle: { ...state.vehicle, model: val } })}
                                placeholder="Select Model"
                                disabled={!state.vehicle.make && !state.vehicle.model}
                                allowCustom={true}
                             />
                        </div>
                        <select 
                            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                             value={state.vehicle.size} onChange={e => updateState({ vehicle: { ...state.vehicle, size: e.target.value } })}
                        >
                            <option value="">Select Size</option>
                            <option value="Coupe">Coupe</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Truck">Truck</option>
                            <option value="Exotic">Exotic/Supercar</option>
                        </select>
                    </div>
                    <input 
                        type="text" placeholder="Color" 
                        className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                        value={state.vehicle.color} onChange={e => updateState({ vehicle: { ...state.vehicle, color: e.target.value } })} 
                    />
                    <select 
                        className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                        value={state.vehicle.timing} onChange={e => updateState({ vehicle: { ...state.vehicle, timing: e.target.value } })}
                    >
                        <option value="">When are you looking to book?</option>
                        <option value="ASAP">ASAP</option>
                        <option value="1-2 Weeks">Next 1-2 Weeks</option>
                        <option value="Next Month">Next Month</option>
                        <option value="Researching">Just Researching</option>
                    </select>
                </div>
            );

        case 'CONTACT':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                            value={state.contact.firstName} onChange={e => updateState({ contact: { ...state.contact, firstName: e.target.value } })} />
                        <input type="text" placeholder="Last Name" className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                            value={state.contact.lastName} onChange={e => updateState({ contact: { ...state.contact, lastName: e.target.value } })} />
                    </div>
                    <input type="tel" placeholder="Phone Number" className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                        value={state.contact.phone} onChange={e => updateState({ contact: { ...state.contact, phone: e.target.value } })} />
                    <input type="email" placeholder="Email Address" className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg w-full focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                        value={state.contact.email} onChange={e => updateState({ contact: { ...state.contact, email: e.target.value } })} />
                    
                    <div>
                        <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Preferred Contact Method</p>
                        <div className="flex gap-3">
                            {['Text', 'Call', 'Email'].map(m => {
                                const Icon = m === 'Text' ? MessageSquare : m === 'Call' ? Phone : Mail;
                                return (
                                    <label key={m} 
                                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all 
                                            ${state.contact.method === m 
                                                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-400 text-brand-700 dark:text-brand-400 shadow-sm ring-1 ring-brand-200 dark:ring-brand-800' 
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        <input type="radio" name="method" className="hidden"
                                            checked={state.contact.method === m}
                                            onChange={() => updateState({ contact: { ...state.contact, method: m as any } })} />
                                        <Icon className="w-6 h-6" />
                                        <span className="text-xs font-bold uppercase">{m}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <textarea placeholder="Any other notes or questions?" className="w-full h-20 p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-brand-400 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400"
                        value={state.notes} onChange={e => updateState({ notes: e.target.value })}></textarea>
                </div>
            );

        case 'AI_MATCHING':
            if (isAnalyzing) {
                 return (
                    <div className="flex flex-col items-center justify-center h-96 text-center relative overflow-hidden bg-slate-950 rounded-2xl border border-slate-800">
                        {/* Background Grid Scanning */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
                        
                        {/* Scanning Line */}
                        <motion.div 
                             className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/20 to-transparent z-0 pointer-events-none"
                             animate={{ top: ['-100%', '200%'] }}
                             transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                             style={{ height: '50%' }}
                        />

                        <div className="relative z-10 mb-8">
                            {/* Central Radar Pulse */}
                            <div className="relative flex items-center justify-center">
                                <motion.div 
                                    className="w-24 h-24 rounded-full border border-brand-500/30 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                                    animate={{ boxShadow: ['0 0 0px rgba(14,165,233,0)', '0 0 30px rgba(14,165,233,0.4)', '0 0 0px rgba(14,165,233,0)'] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <BrainCircuit className="w-10 h-10 text-brand-400" />
                                </motion.div>
                                {/* Expanding Rings */}
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute inset-0 rounded-full border border-brand-500/30"
                                        initial={{ opacity: 0, scale: 1 }}
                                        animate={{ opacity: [0, 0.5, 0], scale: [1, 2.5] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 space-y-3 max-w-xs mx-auto">
                            <motion.div className="flex items-center justify-center gap-2 text-brand-400 font-mono text-xs font-bold tracking-widest uppercase mb-1">
                                <ScanLine className="w-4 h-4 animate-pulse" />
                                Analyzing System
                            </motion.div>
                            <motion.h3 
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-xl font-bold text-white tracking-wide"
                            >
                                Checking Database...
                            </motion.h3>
                            <div className="flex justify-center gap-2 mt-2">
                                {['Vehicle Spec', 'Promo Codes', 'Availability'].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.3) }}
                                    >
                                        {item}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                 );
            }

            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center mb-6">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 text-white rounded-full mb-4 shadow-lg shadow-green-500/30"
                        >
                            <Check className="w-8 h-8 stroke-[3px]" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Optimization Complete</h3>
                        {opportunities.length > 0 ? (
                             <p className="text-slate-600 dark:text-slate-400 mt-2">We found {opportunities.length} exclusive opportunities for you.</p>
                        ) : (
                             <p className="text-slate-600 dark:text-slate-400 mt-2">Your build is fully optimized. Proceed to review.</p>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        {opportunities.map((op, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.15 }}
                                className={`border p-1 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group
                                    ${op.type === 'FREE_ADDON' ? 'border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10' : 'border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10'}`}
                            >
                                {/* Glow Effect */}
                                <div className={`absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${op.type === 'FREE_ADDON' ? 'bg-purple-400/20' : 'bg-orange-400/20'}`}></div>

                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 h-full relative z-10">
                                     {/* Accent Line */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${op.type === 'FREE_ADDON' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>

                                    <div className="flex items-start gap-4 pl-3">
                                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${op.type === 'FREE_ADDON' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                                            {op.type === 'FREE_ADDON' ? <Gift className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                 <h4 className="font-bold text-slate-900 dark:text-white text-base">{op.title}</h4>
                                                 {op.type === 'UPSELL' && (
                                                     <motion.span 
                                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-200 dark:border-green-800"
                                                     >
                                                        Smart Pick
                                                     </motion.span>
                                                 )}
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-2 leading-relaxed">{op.description}</p>
                                            
                                            {/* REASONING SECTION */}
                                            <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mb-3 border border-slate-100 dark:border-slate-700/50">
                                                <BrainCircuit className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-snug">
                                                    "{op.reason}"
                                                </p>
                                            </div>

                                            {/* Free Addon Selection Logic */}
                                            {op.type === 'FREE_ADDON' && op.eligibleAddons && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {op.eligibleAddons.map(addon => (
                                                        <button
                                                            key={addon}
                                                            onClick={() => handleFreeAddon(addon, op.code, op.eligibleAddons)}
                                                            className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all flex items-center gap-1 ${
                                                                state.ppf.addOns.includes(addon) 
                                                                ? 'bg-brand-500 text-white border-brand-500 shadow-brand-500/30 shadow-sm'
                                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-300'
                                                            }`}
                                                        >
                                                            {state.ppf.addOns.includes(addon) && <Check className="w-3 h-3" />}
                                                            {addon}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Upsell Logic */}
                                            {op.type === 'UPSELL' && op.serviceToEnable && (
                                                <button 
                                                    onClick={() => {
                                                        if (op.serviceToEnable === ServiceType.CERAMIC) {
                                                            handleAddService(ServiceType.CERAMIC, 'CERAMIC_PACKAGE');
                                                        } else if (op.serviceToEnable === ServiceType.TINT) {
                                                            handleAddService(ServiceType.TINT, 'TINT_TYPE');
                                                        } else if (op.serviceToEnable === ServiceType.INTERIOR) {
                                                            handleAddService(ServiceType.INTERIOR, 'INTERIOR');
                                                        }
                                                    }}
                                                    className="w-full mt-2 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                                >
                                                    Add & Apply Discount <ArrowRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );

        case 'REVIEW':
             return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Review Your Quote</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl text-sm space-y-4 max-h-[35vh] overflow-y-auto border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-inner brand-scrollbar">
                        <div>
                            <span className="font-bold block text-slate-700 dark:text-slate-400 uppercase text-xs tracking-wider mb-1">Vehicle</span>
                            <div className="font-semibold text-base">{state.vehicle.year} {state.vehicle.make} {state.vehicle.model}</div>
                            <div className="text-slate-500 dark:text-slate-400">{state.vehicle.color} • {state.vehicle.size}</div>
                        </div>
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                            <span className="font-bold block text-slate-700 dark:text-slate-400 uppercase text-xs tracking-wider mb-2">Services Configured</span>
                            <ul className="space-y-3">
                                {state.services.includes(ServiceType.PPF) && state.ppf.package && (
                                    <li className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                                        <div className="font-bold text-slate-800 dark:text-white">Paint Protection Film</div>
                                        <div className="text-brand-600 dark:text-brand-400 font-medium">
                                            {state.ppf.filmType} - {state.ppf.package}
                                            {state.ppf.isFusion && <span className="block text-xs text-orange-500 flex items-center gap-1"><Droplets className="w-3 h-3" /> + XPEL Ultimate Fusion Upgrade</span>}
                                            {state.ppf.filmType === PPFFilmType.FASHION && <span className="block text-xs text-brand-500">Color: {state.ppf.fashionColor}</span>}
                                        </div>
                                        {state.ppf.addOns.length > 0 && <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">+ {state.ppf.addOns.join(', ')}</div>}
                                    </li>
                                )}
                                {state.services.includes(ServiceType.TINT) && state.tint.type && (
                                     <li className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                                        <div className="font-bold text-slate-800 dark:text-white">Window Tint</div>
                                        <div className="text-brand-600 dark:text-brand-400 font-medium">{state.tint.type} - {state.tint.package}</div>
                                        {state.tint.addOns.length > 0 && <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">+ {state.tint.addOns.join(', ')}</div>}
                                    </li>
                                )}
                                {state.services.includes(ServiceType.CERAMIC) && state.ceramic.package && (
                                     <li className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                                        <div className="font-bold text-slate-800 dark:text-white">Ceramic Coating</div>
                                        <div className="text-brand-600 dark:text-brand-400 font-medium">{state.ceramic.package}</div>
                                        {state.ceramic.addOns.length > 0 && <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">+ {state.ceramic.addOns.join(', ')}</div>}
                                    </li>
                                )}
                                {state.services.includes(ServiceType.PAINT_CORRECTION) && state.paintCorrection && (
                                    <li className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                                        <div className="font-bold text-slate-800 dark:text-white">Paint Correction</div>
                                        <div className="text-brand-600 dark:text-brand-400 font-medium">{state.paintCorrection}</div>
                                    </li>
                                )}
                                {state.services.includes(ServiceType.INTERIOR) && state.interior.length > 0 && (
                                    <li className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                                        <div className="font-bold text-slate-800 dark:text-white">Interior Protection</div>
                                        <div className="text-brand-600 dark:text-brand-400 font-medium text-xs mt-1">
                                            {state.interior.map(i => <div key={i}>• {i}</div>)}
                                        </div>
                                    </li>
                                )}
                                {state.services.filter(s => ![ServiceType.PPF, ServiceType.TINT, ServiceType.CERAMIC, ServiceType.PAINT_CORRECTION, ServiceType.INTERIOR].includes(s)).map(s => (
                                     <li key={s} className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 font-medium text-slate-800 dark:text-white">
                                         {s}
                                         {s === ServiceType.WINDSHIELD && state.windshield.addOns.length > 0 && (
                                             <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-normal">+ {state.windshield.addOns.join(', ')}</div>
                                         )}
                                         {s === ServiceType.UNDERCOATING && state.undercoating && (
                                              <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-normal">+ {state.undercoating}</div>
                                         )}
                                     </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Enhanced Promo Code Section */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Tag className="w-4 h-4 text-brand-500"/> Promo Codes
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                className="flex-grow p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg uppercase text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 transition-shadow"
                                placeholder="Enter Code"
                                value={promoInput}
                                onChange={(e) => {
                                    setPromoInput(e.target.value);
                                    setPromoError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPromo()}
                            />
                            <button 
                                onClick={handleAddPromo}
                                disabled={!promoInput}
                                className="px-5 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>

                        {/* Error Message */}
                        {promoError && (
                            <p className="text-red-500 text-xs mb-3 font-medium flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
                                <AlertCircle className="w-3 h-3"/> {promoError}
                            </p>
                        )}

                        {/* Applied Promos List */}
                        <AnimatePresence>
                            {state.promoCodes.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {state.promoCodes.map((code) => {
                                        const promoDetails = PROMOS.find(p => p.code === code);
                                        return (
                                            <motion.div 
                                                key={code}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg pl-3 pr-2 py-1.5 flex items-center gap-2"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">{code}</span>
                                                    {promoDetails && <span className="text-[10px] text-green-600 dark:text-green-400 leading-none">{promoDetails.description}</span>}
                                                </div>
                                                <button 
                                                    onClick={() => handleRemovePromo(code)}
                                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-full text-green-600 dark:text-green-400 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
                        By submitting, you agree to receive communication from PPF Pros regarding your quote via the methods provided.
                    </p>
                </div>
            );

      default: return null;
    }
  };

  // Animation variants
  const overlayVariants = {
    closed: { opacity: 0, pointerEvents: 'none' as const },
    open: { opacity: 1, pointerEvents: 'auto' as const }
  };

  const modalVariants = {
    closed: { scale: 0.9, opacity: 0, y: 20 },
    open: { scale: 1, opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial="closed" animate="open" exit="closed" variants={overlayVariants}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div 
            variants={modalVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] dark:border dark:border-slate-700 overflow-hidden"
          >
             {/* BLACK FRIDAY BANNER - Mobile Optimized with Animation */}
             {!isSuccess && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-600 text-white text-center py-2 px-3 relative overflow-hidden flex items-center justify-center gap-2 z-20"
                >
                    {/* Background Pulse */}
                    <div className="absolute inset-0 bg-red-500 animate-pulse opacity-50"></div>
                    {/* Shimmer */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }}></div>
                    
                    <motion.div 
                        className="relative z-10 flex items-center gap-2 text-xs md:text-sm font-black tracking-wide uppercase truncate"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Tag className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white/30" /> 
                        <span>Black Friday Sale <span className="hidden sm:inline opacity-90">- Ends Soon!</span></span>
                    </motion.div>
                </motion.div>
             )}

             {isSuccess ? (
                 <div className="p-10 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                     <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                         <Check className="w-10 h-10" />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quote Requested!</h2>
                     <p className="text-slate-600 dark:text-slate-400 mb-6">
                         Thanks {state.contact.firstName}. A specialist will review your {state.vehicle.model} details and send a personalized estimate shortly.
                         <br/><br/>
                         <span className="font-bold text-slate-800 dark:text-white">Please look out for a text or email from us.</span>
                     </p>
                     <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto">
                         <a href="tel:+14038303311" className="flex-1 bg-brand-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-brand-600 transition flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                             <Phone className="w-4 h-4" /> Call Now
                         </a>
                         <button onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold py-3 px-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition hover:scale-105 active:scale-95">
                             Close
                         </button>
                     </div>
                 </div>
             ) : (
               <>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 sticky top-0 z-10">
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                            <div className="bg-brand-400 p-1 rounded-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            Smart Quote
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step {currentStepIndex + 1} of {steps.length}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={handleStartOver} 
                            title="Start Over"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-500" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>

                {/* Body - Scrollable Container */}
                <div ref={scrollContainerRef} className="p-6 overflow-y-auto flex-grow brand-scrollbar relative scroll-smooth">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Validation Message */}
                {validationMsg && (
                    <div className="px-4 pb-2 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex justify-center absolute bottom-20 left-0 right-0 z-20 pointer-events-none">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in shadow-lg">
                             <AlertCircle className="w-4 h-4" /> {validationMsg}
                        </div>
                    </div>
                )}

                {/* Footer */}
                {currentStep !== 'AI_MATCHING' && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sm:rounded-b-2xl flex justify-between sticky bottom-0 z-10">
                        <button 
                            onClick={handleBack} 
                            disabled={currentStepIndex === 0}
                            className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all 
                                ${currentStepIndex === 0 
                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-105 active:scale-95'}`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </button>

                        {currentStep === 'REVIEW' ? (
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center px-6 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-lg hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quote'}
                            </button>
                        ) : (
                            <button 
                                onClick={handleNext}
                                className="flex items-center px-6 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-lg hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105 active:scale-95"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        )}
                    </div>
                )}

                {/* Custom Footer for AI_MATCHING (Always show next if not analyzing) */}
                {currentStep === 'AI_MATCHING' && !isAnalyzing && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sm:rounded-b-2xl flex justify-end sticky bottom-0 z-10">
                         <button 
                                onClick={handleNext}
                                className="flex items-center px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-all transform hover:scale-105 active:scale-95"
                            >
                                Continue to Review <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                )}
               </>
             )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
