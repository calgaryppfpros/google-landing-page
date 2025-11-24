

import { QuoteState, ServiceType, PPFPackage, CeramicPackage, PPF_ZONES, CERAMIC_ADDONS, PROMOS, PPFFilmType, InteriorProtectionOption } from '../types';

// --- Helpers for PPF Logic ---

export const getPPFIncludedZones = (pkg: PPFPackage): string[] => {
  switch (pkg) {
    case PPFPackage.BRONZE:
      return ['24" hood & fenders', 'Mirrors'];
    case PPFPackage.SILVER:
      return ['Front bumper', '24" hood & fenders', 'Mirrors'];
    case PPFPackage.GOLD:
      return ['Front bumper', 'Full hood', 'Full fenders', 'Mirrors', 'Headlights', 'A pillars', 'Roofline'];
    case PPFPackage.TRACK:
      return ['Front bumper', 'Full hood', 'Full fenders', 'Mirrors', 'Headlights', 'A pillars', 'Roofline', 'Rocker panels'];
    case PPFPackage.DIAMOND:
      // Full wrap coverage
      return ['Full hood', 'Full fenders', 'Front bumper', 'Mirrors', 'Headlights', 'Doors', 'Tailgate', 'Rear bumper', 'Roof', 'Pillars', 'Rear quarter panel', 'Rocker panels']; 
    default:
      return [];
  }
};

export const getAvailablePPFAddons = (pkg: PPFPackage): string[] => {
  const included = getPPFIncludedZones(pkg);
  if (pkg === PPFPackage.DIAMOND) return []; // All included
  // Filter out zones that are already conceptually covered
  return PPF_ZONES.filter(zone => {
      // Simple text matching usually works, but for "Full" items we need to be careful.
      // Since Diamond is handled above, we just check strict inclusion for others.
      // However, "Full hood" in Gold means "24 inch hood" is not needed, etc.
      // The PPF_ZONES list contains specific add-ons.
      return !included.includes(zone);
  });
};

export const PPF_ZONE_DESCRIPTIONS: Record<string, string> = {
  'Grille': 'Protects the front grille slats and surround from direct impact.',
  'Headlights': 'Prevents fogging, pitting, and cracking from road debris.',
  'A pillars': 'Covers the vertical pillars on either side of the windshield.',
  'Roofline': 'Protects the leading edge of the roof above the windshield.',
  'Door edges': 'Shields the very edge of doors from chips when opening.',
  'Door cups': 'Prevents scratches from fingernails and rings behind handles.',
  'Door sills': 'Protects the entry step area from shoe scuffs.',
  'Luggage strip': 'Protects the top of the rear bumper when loading cargo.',
  'Rocker panels': 'Covers lower side panels highly vulnerable to road spray.',
  'Tailgate': 'Protects the rear hatch or trunk lid surface.',
  'Rear bumper only': 'Complete protection for the painted rear bumper surface.',
  'Black Piano Pillars': 'Prevents swirl marks on delicate gloss black trim pieces.',
  'Rear wheel splash area': 'Protects the paint behind the rear wheels from gravel rash.',
  'Interior black trim': 'Protects glossy interior consoles from scratches.',
  'Interior screen': 'Protects infotainment screens from fingerprints and scratches.'
};

// --- Helpers for Ceramic Logic ---

export const getCeramicIncludedAddons = (pkg: CeramicPackage): string[] => {
  switch (pkg) {
    case CeramicPackage.PLUS:
      return []; // Just paint/PPF top coat
    case CeramicPackage.PREMIUM:
      return ['Wheel face coating'];
    case CeramicPackage.SUPREME:
      return ['Wheel face coating', 'Windshield coating', 'Interior plastic trim']; // "Trim" interpreted as generic trim or plastic
    default:
      return [];
  }
};

export const getAvailableCeramicAddons = (pkg: CeramicPackage): string[] => {
  const included = getCeramicIncludedAddons(pkg);
  return CERAMIC_ADDONS.filter(addon => !included.includes(addon));
};

export const CERAMIC_ADDON_DESCRIPTIONS: Record<string, string> = {
  'Fabric protection': 'Hydrophobic barrier for seats/carpets to prevent stains.',
  'Leather protection': 'Resists dye transfer (jeans) and UV fading.',
  'Interior plastic trim': 'Protects dash and panels from UV fading and dust.',
  'Full interior coating': 'Complete protection for all leather, fabric, and plastic.',
  'Wheels off coating': 'Coats the inner barrel and caliper, not just the face.',
  'Caliper coating': 'Makes cleaning brake dust effortless.',
  'Wheel face coating': 'Protects the visible face of rims from brake dust.',
  'Windshield coating': 'Hydrophobic layer for extreme water beading in rain.',
  'All glass coating': 'Improves visibility on all windows and mirrors.'
};

// --- Helpers for Windshield Logic ---

export const WINDSHIELD_DESCRIPTIONS: Record<string, string> = {
    'Rock chip repair (before film)': 'Fill existing pits/chips so the film lays flat.',
    'Windshield ceramic coating': 'Adds water beading on top of the film for clarity.'
};

// --- Helpers for Tint Logic ---

export const TINT_TYPE_DESCRIPTIONS: Record<string, string> = {
    'XPEL Prime CS (Color Stable)': 'UV-blocking dyed film for style and privacy. Lifetime warranty against fading or bubbling. Great for OEM look.',
    'XPEL Prime XR (Nano-Ceramic)': 'Premium nano-ceramic film with 99% UV protection. Rejects up to 88% of infrared heat to keep cabin cool. Maintains GPS signal.'
};

// --- AI Promo Matching Logic ---

export interface PromoOpportunity {
    type: 'FREE_ADDON' | 'UPSELL';
    title: string;
    description: string;
    reason: string; // Contextual explanation for the user
    code: string;
    serviceToEnable?: ServiceType; // If UPSELL, which service to add
    eligibleAddons?: string[]; // If FREE_ADDON, choices
}

export const analyzePromos = (state: QuoteState): PromoOpportunity[] => {
    const opportunities: PromoOpportunity[] = [];
    const hasPPF = state.services.includes(ServiceType.PPF) && state.ppf.package;
    const hasCeramic = state.services.includes(ServiceType.CERAMIC);
    const hasTint = state.services.includes(ServiceType.TINT);

    // Contextual Analysis
    const lowerColor = state.vehicle.color ? state.vehicle.color.toLowerCase() : '';
    const isDarkColor = ['black', 'blue', 'grey', 'gray', 'green', 'red', 'midnight', 'obsidian', 'carbon', 'charcoal'].some(c => lowerColor.includes(c));
    const isNewVehicle = state.vehicle.year ? parseInt(state.vehicle.year) >= 2024 : false;
    const vehicleModel = state.vehicle.model || 'vehicle';

    // 1. Free Add-on Opportunity (Bronze/Silver/Gold PPF)
    if (hasPPF && (state.ppf.package === PPFPackage.BRONZE || state.ppf.package === PPFPackage.SILVER || state.ppf.package === PPFPackage.GOLD)) {
        opportunities.push({
            type: 'FREE_ADDON',
            title: 'Claim Your Free PPF Zone',
            description: 'Your package qualifies for one free protection zone.',
            reason: `As a thank you for choosing the ${state.ppf.package} package, we include high-wear areas like Door Cups or Edges at no extra cost to prevent common scratches.`,
            code: 'FREEADDON25',
            eligibleAddons: ['Door cups', 'Door edges', 'Luggage strip']
        });
    }

    // 2. Ceramic Upsell
    if (hasPPF && !hasCeramic) {
        let discount = '';
        if (state.ppf.package === PPFPackage.GOLD) discount = '30%';
        else if (state.ppf.package === PPFPackage.SILVER) discount = '20%';
        else if (state.ppf.package === PPFPackage.DIAMOND) discount = '50%';
        
        if (discount) {
            let reason = "Ceramic seals the porous PPF surface, extending its life and making washing effortless.";
            
            if (isDarkColor) {
                reason = `Dark paint on your ${vehicleModel} shows swirls easily. Ceramic coating adds a hard sacrificial layer to prevent wash-induced marring.`;
            } else if (state.ppf.package === PPFPackage.TRACK) {
                reason = "Track use exposes the car to rubber and hot brake dust. Ceramic coating prevents these contaminants from bonding to the PPF.";
            } else if (state.ppf.package === PPFPackage.DIAMOND) {
                reason = "Since you're wrapping the whole car, Ceramic Coating will keep the film hydrophobic and looking cleaner for longer.";
            }

            opportunities.push({
                type: 'UPSELL',
                title: `Add Ceramic & Save ${discount}`,
                description: `Bundle Ceramic Coating with your ${state.ppf.package} to unlock huge savings.`,
                reason: reason,
                code: discount === '30%' ? 'CERAMICGOLD30' : (discount === '20%' ? 'CERAMICSILVER20' : 'CERAMICPLUS50'),
                serviceToEnable: ServiceType.CERAMIC
            });
        }
    }

    // 3. Tint Upsell
    if (hasPPF && !hasTint) {
        let reason = "Protect your interior from UV rays and heat while the car is already in the shop.";
        
        if (state.interior.includes(InteriorProtectionOption.LEATHER)) {
             reason = "Since you selected Leather Protection, Window Tint is the perfect partner to block UV rays that dry out and crack leather over time.";
        } else if (isNewVehicle) {
             reason = `Keep your ${state.vehicle.year} interior looking brand new by blocking 99% of damaging UV rays right from day one.`;
        }

        opportunities.push({
            type: 'UPSELL',
            title: 'Add Tint - Save 10%',
            description: 'Complete the look and save 10% on Window Tinting when bundled.',
            reason: reason,
            code: 'TINTBUNDLE10',
            serviceToEnable: ServiceType.TINT
        });
    }

    // 4. Interior Upsell (Special for new cars)
    if (isNewVehicle && !state.services.includes(ServiceType.INTERIOR) && !state.services.includes(ServiceType.TINT)) {
         opportunities.push({
            type: 'UPSELL',
            title: 'New Car Interior Defense',
            description: 'Keep that new car look and smell.',
            reason: `For brand new ${state.vehicle.year} models, sealing the interior surfaces now prevents dye transfer and stains from ever setting in.`,
            code: 'INTERIOR10',
            serviceToEnable: ServiceType.INTERIOR
        });
    }

    return opportunities;
};

// --- Step Management ---

export type WizardStep = 
  | 'SERVICES'
  | 'PPF_TYPE'    // New
  | 'PPF_COLOR'   // New
  | 'PPF_PACKAGE'
  | 'PPF_ADDONS'
  | 'TINT_TYPE'
  | 'TINT_PACKAGE'
  | 'TINT_ADDONS'
  | 'CERAMIC_PACKAGE'
  | 'CERAMIC_ADDONS'
  | 'PAINT_CORRECTION' // New
  | 'INTERIOR'         // New
  | 'WINDSHIELD'
  | 'UNDERCOATING'
  | 'DETAILING'
  | 'VEHICLE'
  | 'CONTACT'
  | 'AI_MATCHING'
  | 'REVIEW'
  | 'SUCCESS';

export const buildSteps = (state: QuoteState): WizardStep[] => {
  const steps: WizardStep[] = ['SERVICES'];

  if (state.services.includes(ServiceType.PPF)) {
    steps.push('PPF_TYPE');
    
    // Only show Color step if Fashion is selected
    if (state.ppf.filmType === PPFFilmType.FASHION) {
        steps.push('PPF_COLOR');
    }

    steps.push('PPF_PACKAGE');
    // Skip add-ons for Diamond/Fashion (Full Wrap) as logic usually handles it, 
    // but we keep it for logic consistency, the UI handles displaying "Nothing to add".
    steps.push('PPF_ADDONS'); 
  }

  if (state.services.includes(ServiceType.TINT)) {
    steps.push('TINT_TYPE');
    steps.push('TINT_PACKAGE');
    steps.push('TINT_ADDONS');
  }

  if (state.services.includes(ServiceType.CERAMIC)) {
    steps.push('CERAMIC_PACKAGE');
    steps.push('CERAMIC_ADDONS');
  }

  if (state.services.includes(ServiceType.PAINT_CORRECTION)) {
    steps.push('PAINT_CORRECTION');
  }
  
  if (state.services.includes(ServiceType.INTERIOR)) {
    steps.push('INTERIOR');
  }

  if (state.services.includes(ServiceType.WINDSHIELD)) {
    steps.push('WINDSHIELD');
  }

  if (state.services.includes(ServiceType.UNDERCOATING)) {
    steps.push('UNDERCOATING');
  }

  if (state.services.includes(ServiceType.DETAILING)) {
    steps.push('DETAILING');
  }

  steps.push('VEHICLE');
  steps.push('CONTACT');
  steps.push('AI_MATCHING');
  steps.push('REVIEW');

  return steps;
};

export const INITIAL_STATE: QuoteState = {
  services: [],
  ppf: { package: null, addOns: [], filmType: null, fashionColor: null, isFusion: false },
  tint: { type: null, package: null, addOns: [] },
  ceramic: { package: null, addOns: [] },
  paintCorrection: null,
  interior: [],
  windshield: { addOns: [] },
  undercoating: null,
  detailingNotes: '',
  vehicle: { year: '', make: '', model: '', size: '', color: '', timing: '' },
  contact: { firstName: '', lastName: '', phone: '', email: '', method: 'Text' },
  promoCode: '',
  notes: ''
};
