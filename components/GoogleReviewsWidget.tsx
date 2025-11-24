
import React, { useState, useEffect } from 'react';
import { Star, Check, X, ExternalLink, Sparkles, MessageSquare, ArrowRight, Copy, Car, ThumbsUp, PenTool, Quote, Wand2, ChevronRight, ChevronLeft, Shield, Sun, Droplets, Wrench, Eye, Award, Clock, Heart, Zap, User, Truck, Gem, CheckCircle2, MessageSquareQuote, AlertCircle, Frown, Meh, AlertTriangle, Phone, Mail, FileText, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Your Google Review Link
const GOOGLE_REVIEW_URL = "https://g.page/r/CSL6eDU9KwVREBE/review";
const FEEDBACK_WEBHOOK_URL = "https://n8n.srv1046173.hstgr.cloud/webhook/reviews";

// --- Real Testimonials Data ---
const TESTIMONIAL_CATEGORIES = [
  {
    title: "PPF & Rock Chip Protection",
    reviews: [
      { author: "Mark van Zyl", car: "2025 Supra", text: "Just had a full front PPF done on my 2025 Supra and the results are flawless. Edges wrapped perfectly and the finish looks basically invisible. PPF Pros clearly take pride in their work." },
      { author: "Markus L", car: "2024 BMW X5", text: "Had my 2024 BMW X5 protected at PPF Pros, and I couldn’t be more impressed. The car looks even glossier than when I picked it up from the dealership." },
      { author: "smh rme", car: "2025 Ford Maverick", text: "I recently brought in my 2025 Ford Maverick for the XPEL Ultimate Plus PPF. It comes with a 10 year warranty and today when I washed the truck, the bugs came off so easily." },
    ]
  },
  {
    title: "Ceramic Coating",
    reviews: [
      { author: "Aya Amer", car: "2023 RAV4", text: "The car looks absolutely stunning and hasn’t felt this brand new since the dealership. I street park and now it practically repels dirt and water." },
      { author: "Mohamad Divar", car: "Toyota 4Runner", text: "I recently had ceramic coating and polishing done for my 4Runner at PPF Pros. The price was reasonable, the staff were friendly, and the quality of their work is top-notch." },
      { author: "Information Restaurant", car: "2024 Lexus RX500h", text: "At my first-year inspection they went above and beyond – detailed it inside and out and it looked showroom new when I picked it up." },
    ]
  },
  {
    title: "Tesla Owners",
    reviews: [
      { author: "Dean Côté", car: "Tesla Model 3", text: "Had my Tesla M3 fully wrapped here and it looks unreal. Super clean work, flawless finish, and great service all around." },
      { author: "Terry M", car: "Tesla Model X", text: "PPF Pros did an incredible job with a full PPF wrap on my Tesla Model X. Every edge and corner was perfectly aligned." },
      { author: "Darylle J", car: "Tesla", text: "Took my new Tesla to PPF Pros and I’m beyond impressed. Full-front PPF, XPEL ceramic coating, windshield film, tint, and interior ceramic." },
    ]
  },
  {
    title: "Luxury & Performance",
    reviews: [
      { author: "James Barnett", car: "Shelby", text: "PPF Pros did an unreal job on the Shelby. We did a PPF wrap over the whole car, including over the OEM vinyl stripes. The entire car turned out amazing." },
      { author: "Amro Saleh", car: "BMW 540", text: "Brought in my 2017 BMW 540. Great experience, excellent service, and outstanding results. Car looks like a mirror in my garage." },
    ]
  },
  {
    title: "Window Tint & Comfort",
    reviews: [
      { author: "Simon Li", car: "Range Rover", text: "I had my Range Rover fully tinted at PPF Pros with XPEL PRIME XR. The cabin stays much cooler now, and the added privacy is a huge bonus. Super clean work." },
      { author: "Drew Tellier", car: "", text: "Fantastic customer service, and got the job done on time. Their recommendations for the right level of tint were spot on." },
    ]
  }
];

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

// --- Concierge Types & Logic ---

// Updated Step Order: Rating is now towards the end
type WizardStep = 'VEHICLE' | 'SERVICE' | 'WHY' | 'EXPERIENCE' | 'NOTES' | 'RATING' | 'GENERATING' | 'RESULTS' | 'NEGATIVE_FORM';

interface ReviewData {
    year: string;
    make: string;
    model: string;
    services: string[];
    reasons: string[];
    experience: string[];
    additionalNotes: string;
}

interface NegativeFeedbackData {
    name: string;
    email: string;
    phone: string;
    issue: string;
}

const INITIAL_DATA: ReviewData = {
    year: '', make: '', model: '',
    services: [],
    reasons: [],
    experience: [],
    additionalNotes: ''
};

const INITIAL_NEGATIVE_DATA: NegativeFeedbackData = {
    name: '',
    email: '',
    phone: '',
    issue: ''
};

// Logical Flow for the Wizard (excluding End States)
const WIZARD_FLOW: WizardStep[] = ['VEHICLE', 'SERVICE', 'WHY', 'EXPERIENCE', 'NOTES', 'RATING'];

// Options Configuration
const OPTIONS = {
    services: [
        { id: 'ppf', label: 'PPF (Paint Protection)', icon: Shield },
        { id: 'tint', label: 'Window Tint', icon: Sun },
        { id: 'ceramic', label: 'Ceramic Coating', icon: Droplets },
        { id: 'detail', label: 'Detailing', icon: Sparkles },
        { id: 'windshield', label: 'Windshield Film', icon: Eye },
        { id: 'other', label: 'Other Service', icon: Wrench },
    ],
    reasons: [
        { id: 'reputation', label: 'Reputation / Reviews', icon: Star },
        { id: 'quality', label: 'Workmanship Quality', icon: Gem },
        { id: 'service', label: 'Customer Service', icon: Heart },
        { id: 'price', label: 'Fair Pricing', icon: Zap },
        { id: 'referral', label: 'Friend Referral', icon: User },
        { id: 'other', label: 'Other Reason', icon: CheckCircle2 },
    ],
    experience: [
        { id: 'flawless', label: 'Flawless Finish', icon: Sparkles },
        { id: 'communication', label: 'Great Communication', icon: MessageSquare },
        { id: 'speed', label: 'Fast Turnaround', icon: Clock },
        { id: 'clean', label: 'Shop Cleanliness', icon: Award },
        { id: 'easy', label: 'Easy Process', icon: ThumbsUp },
        { id: 'other', label: 'Something Else', icon: PenTool },
    ]
};

// --- AI Generation Logic (Expanded to 10 Variations) ---
const generateReviews = (data: ReviewData) => {
    const car = data.year && data.make && data.model ? `${data.year} ${data.make} ${data.model}` : 'my vehicle';
    
    // Format lists for natural language
    const cleanList = (list: string[]) => list.filter(i => !i.includes('Other')).join(' and ');

    const serviceList = cleanList(data.services) || 'service';
    const reasonText = cleanList(data.reasons) || 'their great reputation';
    const experienceText = cleanList(data.experience) || 'amazing service';
    
    const notes = data.additionalNotes ? ` ${data.additionalNotes}` : '';
    const notesIntro = data.additionalNotes ? ` I really appreciated that` : '';

    // Backend creates 10 unique variations
    return [
        {
            tone: "Professional & Detailed",
            text: `I recently brought my ${car} to PPF Pros for ${serviceList}. I chose them specifically for their ${reasonText}, and they did not disappoint. The results were ${experienceText}. The team was professional, transparent, and the shop is immaculate.${notes} Highly recommend if you want the best protection in Calgary.`
        },
        {
            tone: "Short & Enthusiastic",
            text: `Just got my ${car} back from PPF Pros! The ${serviceList} looks incredible. ${experienceText}! I picked them because of their ${reasonText} and I'm so glad I did.${notesIntro}${notes} If you care about your car, bring it here. 10/10!`
        },
        {
            tone: "Value Focused",
            text: `Great experience with PPF Pros. Had ${serviceList} done on my ${car}. Selected them based on ${reasonText}. The workmanship is ${experienceText} and the process was smooth.${notes} Definitely worth the investment for the peace of mind.`
        },
        {
            tone: "Quality First",
            text: `If you are looking for ${serviceList}, PPF Pros is the place. The attention to detail on my ${car} was next level. Their ${reasonText} is well deserved. Everything from the booking to the final result was ${experienceText}.${notes}`
        },
        {
            tone: "Gratitude",
            text: `Big thanks to the team at PPF Pros. They did an amazing job with the ${serviceList} on my ${car}. I can see why they are known for ${reasonText}. The finish is ${experienceText}.${notes} Will definitely be bringing my future vehicles here.`
        },
        {
            tone: "Concise",
            text: `Top notch service for ${serviceList}. Brought my ${car} in based on ${reasonText} and the team delivered. ${experienceText}.${notes} Highly recommended.`
        },
        {
            tone: "Calgary Specific",
            text: `Needed protection for Calgary roads on my ${car}. PPF Pros handled the ${serviceList} perfectly. ${experienceText}. I went with them for ${reasonText} and I'm very happy with the outcome.${notes}`
        },
        {
            tone: "Outcome Focused",
            text: `My ${car} looks better than new after getting ${serviceList} at PPF Pros. The result is ${experienceText}. Chosen for ${reasonText}, and they exceeded expectations.${notes} A+ service.`
        },
        {
            tone: "Trust",
            text: `Trusting someone with my ${car} is hard, but PPF Pros made it easy. They performed ${serviceList} and the quality is obvious. Their ${reasonText} is 100% accurate. ${experienceText}.${notes}`
        },
        {
            tone: "Friendly",
            text: `Super happy with the ${serviceList} on my ${car}! Everyone was so friendly and the ${reasonText} is real. The work was ${experienceText}.${notes} Thanks guys!`
        }
    ];
};

// Utility to shuffle and pick 3
const getRandomReviews = (reviews: {tone: string, text: string}[], count: number) => {
    const shuffled = [...reviews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const GoogleReviewsWidget: React.FC<Props> = ({ isOpen, onToggle }) => {
  // Concierge State
  const [showConcierge, setShowConcierge] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('VEHICLE');
  
  // Data State
  const [rating, setRating] = useState<number>(0);
  const [data, setData] = useState<ReviewData>(INITIAL_DATA);
  const [negativeData, setNegativeData] = useState<NegativeFeedbackData>(INITIAL_NEGATIVE_DATA);
  
  const [generatedOptions, setGeneratedOptions] = useState<{tone: string, text: string}[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (!isOpen) {
        setShowConcierge(false);
        setCurrentStep('VEHICLE');
        setRating(0);
        setData(INITIAL_DATA);
        setNegativeData(INITIAL_NEGATIVE_DATA);
        setCopiedIndex(null);
        setGeneratedOptions([]);
    }
  }, [isOpen]);

  // Handlers
  const handleRatingSelect = (stars: number) => {
      setRating(stars);
      // Small delay for UX
      setTimeout(() => {
          if (stars === 5) {
              setCurrentStep('GENERATING');
              setTimeout(() => {
                  const allReviews = generateReviews(data);
                  const selectedReviews = getRandomReviews(allReviews, 3); // Pick 3 random
                  setGeneratedOptions(selectedReviews);
                  setCurrentStep('RESULTS');
              }, 2500);
          } else {
              // Pre-fill issue with notes if they wrote any in the previous step
              if (data.additionalNotes) {
                  setNegativeData(prev => ({ ...prev, issue: data.additionalNotes }));
              }
              setCurrentStep('NEGATIVE_FORM');
          }
      }, 300);
  };

  const updateData = (updates: Partial<ReviewData>) => setData(prev => ({ ...prev, ...updates }));
  const updateNegativeData = (updates: Partial<NegativeFeedbackData>) => setNegativeData(prev => ({ ...prev, ...updates }));

  const toggleSelection = (field: keyof ReviewData, value: string) => {
      setData(prev => {
          const list = prev[field] as string[];
          if (list.includes(value)) {
              return { ...prev, [field]: list.filter(item => item !== value) };
          } else {
              if (list.length >= 3) return prev; 
              return { ...prev, [field]: [...list, value] };
          }
      });
  };

  const handleNext = () => {
      const idx = WIZARD_FLOW.indexOf(currentStep);
      if (idx !== -1 && idx < WIZARD_FLOW.length - 1) {
          setCurrentStep(WIZARD_FLOW[idx + 1]);
      }
  };

  const handleBack = () => {
      if (currentStep === 'VEHICLE') {
          setShowConcierge(false);
      } else if (currentStep === 'NEGATIVE_FORM') {
          setCurrentStep('RATING');
          setRating(0); 
      } else if (currentStep === 'RESULTS') {
          setCurrentStep('RATING');
      } else {
          const idx = WIZARD_FLOW.indexOf(currentStep);
          if (idx > 0) {
              setCurrentStep(WIZARD_FLOW[idx - 1]);
          }
      }
  };

  const handleCopy = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
  };

  const handleGoogleRedirect = () => {
      window.open(GOOGLE_REVIEW_URL, '_blank');
  };

  const submitNegativeFeedback = async () => {
      if (!negativeData.name || !negativeData.phone || !negativeData.issue) {
          alert("Please fill in the required fields.");
          return;
      }

      setIsSubmittingFeedback(true);
      
      const payload = {
          ...negativeData,
          rating: rating, // 1-4
          submittedAt: new Date().toISOString(),
          source: 'Negative Feedback Concierge'
      };

      try {
           await fetch(FEEDBACK_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          alert("Thank you. Management has been notified and will contact you shortly.");
          onToggle(); // Close widget
      } catch (e) {
          console.error(e);
          alert("Error submitting feedback. Please try again.");
      } finally {
          setIsSubmittingFeedback(false);
      }
  };

  // Selection Card Component
  const SelectionCard = ({ selected, onClick, icon: Icon, label }: any) => (
      <div 
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 
            ${selected 
                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 shadow-lg transform scale-105 z-10' 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 hover:shadow-md'
            }`}
      >
          <div className={`p-3 rounded-full mb-3 ${selected ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
              <Icon className="w-6 h-6" />
          </div>
          <span className={`text-sm font-bold text-center ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
              {label}
          </span>
          {selected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
              </div>
          )}
      </div>
  );

  // Step Renderers
  const renderStepContent = () => {
      switch(currentStep) {
          case 'VEHICLE':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-8">
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Vehicle Details</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">Help us customize your review.</p>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase tracking-wider">Year</label>
                                <input 
                                    type="text" placeholder="2025" 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-500 focus:ring-0 outline-none text-slate-900 dark:text-white font-bold text-center placeholder-slate-300 transition-all focus:scale-[1.02]"
                                    value={data.year}
                                    onChange={(e) => updateData({ year: e.target.value })}
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase tracking-wider">Make & Model</label>
                                <input 
                                    type="text" placeholder="e.g. Porsche 911 GT3" 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-500 focus:ring-0 outline-none text-slate-900 dark:text-white font-bold placeholder-slate-300 transition-all focus:scale-[1.02]"
                                    value={data.make} 
                                    onChange={(e) => updateData({ make: e.target.value })}
                                />
                            </div>
                      </div>
                  </div>
              );

          case 'SERVICE':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-6">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">What did we do?</h3>
                          <p className="text-slate-500 dark:text-slate-400">Select up to 3 services provided.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          {OPTIONS.services.map((opt) => (
                              <SelectionCard 
                                key={opt.id}
                                icon={opt.icon} 
                                label={opt.label} 
                                selected={data.services.includes(opt.label)}
                                onClick={() => toggleSelection('services', opt.label)}
                              />
                          ))}
                      </div>
                  </div>
              );

          case 'WHY':
               return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-6">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Why Choose Us?</h3>
                          <p className="text-slate-500 dark:text-slate-400">What stood out about PPF Pros?</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          {OPTIONS.reasons.map((opt) => (
                              <SelectionCard 
                                key={opt.id}
                                icon={opt.icon} 
                                label={opt.label} 
                                selected={data.reasons.includes(opt.label)}
                                onClick={() => toggleSelection('reasons', opt.label)}
                              />
                          ))}
                      </div>
                  </div>
              );

          case 'EXPERIENCE':
               return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-6">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">The Result</h3>
                          <p className="text-slate-500 dark:text-slate-400">How did the final product look?</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          {OPTIONS.experience.map((opt) => (
                              <SelectionCard 
                                key={opt.id}
                                icon={opt.icon} 
                                label={opt.label} 
                                selected={data.experience.includes(opt.label)}
                                onClick={() => toggleSelection('experience', opt.label)}
                              />
                          ))}
                      </div>
                  </div>
              );

          case 'NOTES':
              return (
                   <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-4">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Anything else?</h3>
                          <p className="text-slate-500 dark:text-slate-400">Add any specific details or shout-outs (optional).</p>
                      </div>
                      <textarea 
                          className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-500 focus:ring-0 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 resize-none transition-all focus:shadow-lg"
                          placeholder="e.g. Thanks to Mostafa for the ride home!"
                          value={data.additionalNotes}
                          onChange={(e) => updateData({ additionalNotes: e.target.value })}
                      ></textarea>
                  </div>
              );

          case 'RATING':
              return (
                  <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-300 py-10">
                      <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-4">
                            One Last Thing
                        </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Rate your experience</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-8 text-center">Tap a star to complete the wizard</p>
                      
                      <div className="flex gap-2 mb-8">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRatingSelect(star)}
                                onMouseEnter={() => setRating(star)}
                                className="group transition-transform hover:scale-110 focus:outline-none"
                              >
                                  <Star 
                                    className={`w-10 h-10 transition-colors duration-200 ${
                                        (rating >= star) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'
                                    }`} 
                                  />
                              </button>
                          ))}
                      </div>
                      
                      {rating > 0 && (
                          <p className="text-brand-600 dark:text-brand-400 font-bold animate-in fade-in">
                              {rating === 5 ? "It was amazing!" : rating >= 3 ? "It was good" : "It could be better"}
                          </p>
                      )}
                  </div>
              );

          case 'NEGATIVE_FORM':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-2">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                {rating <= 2 ? <Frown className="w-8 h-8" /> : <Meh className="w-8 h-8" />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">We want to make it right.</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Please tell management directly about your experience so we can fix it immediately.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-red-400 dark:focus:border-red-600 text-slate-900 dark:text-white"
                                        placeholder="Your Name"
                                        value={negativeData.name}
                                        onChange={(e) => updateNegativeData({ name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="tel" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-red-400 dark:focus:border-red-600 text-slate-900 dark:text-white"
                                            placeholder="Phone"
                                            value={negativeData.phone}
                                            onChange={(e) => updateNegativeData({ phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="email" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-red-400 dark:focus:border-red-600 text-slate-900 dark:text-white"
                                            placeholder="Email"
                                            value={negativeData.email}
                                            onChange={(e) => updateNegativeData({ email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">What went wrong? *</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <textarea 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-red-400 dark:focus:border-red-600 text-slate-900 dark:text-white h-32 resize-none"
                                        placeholder="Please provide details..."
                                        value={negativeData.issue}
                                        onChange={(e) => updateNegativeData({ issue: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <button 
                                onClick={submitNegativeFeedback}
                                disabled={isSubmittingFeedback}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmittingFeedback ? 'Sending...' : 'Send Feedback Directly'} <Send className="w-5 h-5" />
                            </button>
                        </div>
                  </div>
              );

          case 'GENERATING':
              return (
                  <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
                      <div className="relative mb-8">
                          <div className="absolute inset-0 bg-brand-400 rounded-full animate-ping opacity-20"></div>
                          <div className="w-24 h-24 bg-gradient-to-tr from-brand-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                              <Sparkles className="w-10 h-10 text-white animate-pulse" />
                          </div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Writing your review...</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs">
                          Our AI is crafting personalized reviews based on your vehicle details.
                      </p>
                  </div>
              );
          
          case 'RESULTS':
              return (
                  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="text-center mb-6 flex-shrink-0">
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Pick your favorite!</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-sm">Tap a card to copy, then paste it on Google.</p>
                      </div>

                      <div className="flex-grow overflow-y-auto brand-scrollbar pr-2 space-y-4 pb-20">
                          {generatedOptions.map((opt, i) => (
                               <div 
                                    key={i}
                                    onClick={() => handleCopy(opt.text, i)}
                                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group 
                                        ${copiedIndex === i 
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 shadow-lg scale-[1.02]' 
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 hover:shadow-md'
                                        }`}
                               >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${copiedIndex === i ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                            {opt.tone}
                                        </span>
                                        {copiedIndex === i ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                                                <Check className="w-3 h-3" /> Copied
                                            </span>
                                        ) : (
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-brand-500 flex items-center gap-1">
                                                <Copy className="w-3 h-3" /> Tap to Copy
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                        "{opt.text}"
                                    </p>
                               </div>
                          ))}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-100 dark:border-slate-800">
                           <button 
                                onClick={handleGoogleRedirect}
                                className={`w-full py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 
                                    ${copiedIndex !== null 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                                        : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                           >
                               {copiedIndex !== null ? (
                                   <>Open Google Reviews <ExternalLink className="w-5 h-5" /></>
                               ) : (
                                   <>I'll write my own <PenTool className="w-5 h-5" /></>
                               )}
                           </button>
                      </div>
                  </div>
              );
          
          default: return null;
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />

          {/* Sidebar Panel - Left Side */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col"
          >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <div className="bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                     </div>
                     PPF Pros Reviews
                  </h2>
                  <button onClick={onToggle} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                  </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-grow overflow-hidden relative">
                  {!showConcierge ? (
                      /* --- Standard Review View --- */
                      <div className="h-full overflow-y-auto brand-scrollbar p-6">
                          <div className="text-center mb-8">
                              <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full mb-4">
                                  <span className="font-bold text-slate-900 dark:text-white text-xl">5.0</span>
                                  <div className="flex gap-1 text-yellow-400">
                                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                  </div>
                              </div>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">We value your feedback</h3>
                              <p className="text-slate-500 dark:text-slate-400">Join our 70+ 5-star reviews on Google.</p>
                          </div>

                          <div className="space-y-3 mb-8">
                                <button 
                                onClick={() => setShowConcierge(true)}
                                className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white p-4 rounded-2xl shadow-xl shadow-brand-500/20 flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-2.5 rounded-xl">
                                            <Wand2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-lg">Use Review AI</p>
                                            <p className="text-brand-100 text-xs">Let AI write it for you.</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button 
                                onClick={handleGoogleRedirect}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:border-brand-300 dark:hover:border-slate-600 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-100 dark:bg-slate-700 p-2.5 rounded-xl text-slate-500 dark:text-slate-400">
                                            <PenTool className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-lg">Write my own</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Go directly to Google.</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                                </button>
                          </div>

                          <div className="space-y-8">
                                <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Recent Reviews</h4>
                                {TESTIMONIAL_CATEGORIES.map((cat, idx) => (
                                    <div key={idx}>
                                        <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3">{cat.title}</p>
                                        <div className="space-y-4">
                                            {cat.reviews.map((review, rIdx) => (
                                                <div key={rIdx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex text-yellow-400">
                                                            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{review.author}</span>
                                                        {review.car && <span className="text-xs text-slate-400">• {review.car}</span>}
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{review.text}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                          </div>
                      </div>
                  ) : (
                      /* --- Concierge Wizard View --- */
                      <div className="h-full flex flex-col">
                          {/* Progress Bar */}
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
                              <motion.div 
                                className="h-full bg-brand-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((WIZARD_FLOW.indexOf(currentStep) + 1) / WIZARD_FLOW.length) * 100}%` }}
                              />
                          </div>

                          <div className="flex-grow p-6 overflow-y-auto brand-scrollbar">
                              {renderStepContent()}
                          </div>

                          {/* Footer Actions (Hide on Rating/Generating/Results/Negative) */}
                          {!['RATING', 'GENERATING', 'RESULTS', 'NEGATIVE_FORM'].includes(currentStep) && (
                              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900">
                                  <button 
                                    onClick={handleBack}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                      <ChevronLeft className="w-4 h-4" /> Back
                                  </button>
                                  <button 
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-brand-500 text-white font-bold rounded-lg shadow-lg hover:bg-brand-600 transition-all flex items-center gap-1"
                                  >
                                      Next <ChevronRight className="w-4 h-4" />
                                  </button>
                              </div>
                          )}

                          {/* Custom Back Button for Negative Form & Results */}
                          {['NEGATIVE_FORM', 'RESULTS'].includes(currentStep) && (
                               <div className="p-4 absolute top-2 left-2 z-20">
                                   <button 
                                    onClick={handleBack}
                                    className="p-2 bg-white/50 dark:bg-black/50 backdrop-blur rounded-full hover:bg-white dark:hover:bg-black transition text-slate-600 dark:text-slate-300"
                                   >
                                       <ChevronLeft className="w-5 h-5" />
                                   </button>
                               </div>
                          )}
                      </div>
                  )}
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
