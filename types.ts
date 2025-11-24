

export enum ServiceType {
  PPF = 'Paint Protection Film (PPF)',
  TINT = 'Window Tint',
  CERAMIC = 'Ceramic Coating',
  PAINT_CORRECTION = 'Paint Correction',
  INTERIOR = 'Interior Protection',
  WINDSHIELD = 'Windshield Protection',
  UNDERCOATING = 'Undercoating & Rustproofing',
  DETAILING = 'Detailing'
}

export enum PPFPackage {
  BRONZE = 'Bronze (Partial Front)',
  SILVER = 'Silver (Partial Front + Bumper)',
  GOLD = 'Gold (Full Front)',
  TRACK = 'Track Pack',
  DIAMOND = 'Diamond (Full Wrap)'
}

export enum PPFFilmType {
  CLEAR = 'Clear (Gloss)',
  STEALTH = 'Stealth (Satin)',
  FASHION = 'Fashion (Color)'
}

export enum CeramicPackage {
  PLUS = 'Plus (4-Year)',
  PREMIUM = 'Premium (8-Year)',
  SUPREME = 'Supreme (8-Year Multi-Layer)'
}

export enum PaintCorrectionLevel {
  STAGE_1 = 'Stage 1 (Enhancement)',
  STAGE_2 = 'Stage 2 (Correction)',
  STAGE_3 = 'Stage 3 (Restoration)'
}

export enum InteriorProtectionOption {
  LEATHER = 'Leather Protection',
  FABRIC = 'Fabric Protection',
  TRIM = 'Trim & Console Protection'
}

export enum UndercoatingPackage {
  UNDERCOATING = 'Undercoating only',
  RUSTPROOFING = 'Rustproofing only',
  COMPLETE = 'Complete package (both)'
}

// --- TINT TYPES ---
export enum TintType {
  CS = 'XPEL Prime CS (Color Stable)',
  XR = 'XPEL Prime XR (Nano-Ceramic)'
}

export enum TintPackage {
  TWO = '2 Windows (Front Matches)',
  THREE = '3 Windows (Rear Coupe/Truck)',
  FIVE = '5 Windows (Full Sedan)',
  SEVEN = '7 Windows (Full SUV)'
}

export const TINT_ADDONS_LIST = [
  'Front Windshield (Full)',
  'Sunstrip (Visor Strip)'
];

export interface QuoteState {
  services: ServiceType[];
  ppf: {
    package: PPFPackage | null;
    addOns: string[];
    filmType: PPFFilmType | null;
    fashionColor: string | null;
    isFusion: boolean; // New: Track Fusion upgrade
  };
  tint: {
    type: TintType | null;
    package: TintPackage | null;
    addOns: string[];
  };
  ceramic: {
    package: CeramicPackage | null;
    addOns: string[];
  };
  paintCorrection: PaintCorrectionLevel | null;
  interior: InteriorProtectionOption[];
  windshield: {
    addOns: string[];
  };
  undercoating: UndercoatingPackage | null;
  detailingNotes: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
    size: string;
    color: string;
    timing: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    method: 'Text' | 'Call' | 'Email';
  };
  promoCode: string;
  notes: string;
}

export const PPF_ZONES = [
  'Grille', 'Headlights', 'A pillars', 'Roofline', 'Door edges', 'Door cups', 
  'Door sills', 'Luggage strip', 'Rocker panels', 'Tailgate', 
  'Rear bumper only', 'Black Piano Pillars', 'Rear wheel splash area', 
  'Interior black trim', 'Interior screen'
];

export const CERAMIC_ADDONS = [
  'Fabric protection', 'Leather protection', 'Interior plastic trim', 
  'Full interior coating', 'Wheels off coating', 'Caliper coating', 
  'Wheel face coating', 'Windshield coating', 'All glass coating'
];

export interface Promo {
  code: string;
  description: string;
  rules: string;
}

export const PROMOS: Promo[] = [
  { code: 'FREEADDON25', description: 'Free door cups, edges, or luggage strip', rules: 'With Bronze, Silver, or Gold PPF' },
  { code: 'CERAMICGOLD30', description: '30% off Ceramic Coating', rules: 'When bundled with Gold PPF' },
  { code: 'CERAMICSILVER20', description: '20% off Ceramic Coating', rules: 'When bundled with Silver PPF' },
  { code: 'FULLCLEAR20', description: '20% off Full Clear PPF Wrap', rules: 'Full wraps only' },
  { code: 'TINTBUNDLE10', description: '10-20% off Tint', rules: 'When added to PPF Booking' },
  { code: 'CERAMICPLUS50', description: '50% off Ceramic Coating', rules: 'With Full Wrap' },
  { code: 'FALLSHIELD25', description: '25% off Front & Rocker Panel', rules: 'New customers only' },
];

// --- CAR DB ---
export const CAR_MAKES_AND_MODELS: Record<string, string[]> = {
  'Acura': ['ADX', 'Integra', 'TLX', 'RDX', 'MDX', 'ZDX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
  'Aston Martin': ['Vantage', 'DB12', 'DBX', 'Valhalla'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8', 'Q8 e-tron', 'e-tron GT', 'RS3', 'RS5', 'RS6', 'RS7', 'R8'],
  'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga'],
  'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'Z4', 'i4', 'i5', 'i7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'XM', 'M2', 'M3', 'M4', 'M5'],
  'Buick': ['Envista', 'Encore GX', 'Envision', 'Enclave'],
  'Bugatti': ['Chiron'],
  'Cadillac': ['CT4', 'CT5', 'Celestiq', 'XT4', 'XT5', 'XT6', 'Lyriq', 'Escalade', 'Escalade ESV', 'Escalade IQ'],
  'Chevrolet': ['Malibu', 'Corvette', 'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Silverado 1500', 'Silverado HD', 'Silverado EV', 'Equinox EV', 'Blazer EV'],
  'Chrysler': ['Pacifica'],
  'Dodge': ['Hornet', 'Durango', 'Charger', 'Challenger'],
  'Ferrari': ['SF90 Stradale', '296 GTB/GTS', 'Roma', 'Purosangue', '812 Superfast', 'F8 Tributo'],
  'Fisker': ['Ocean'],
  'Ford': ['Mustang', 'Mustang Mach-E', 'Maverick', 'Ranger', 'F-150', 'F-150 Lightning', 'F-Series Super Duty', 'Transit', 'Bronco Sport', 'Bronco', 'Escape', 'Explorer', 'Expedition'],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  'GMC': ['Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Canyon', 'Sierra 1500', 'Sierra HD', 'Hummer EV Pickup', 'Hummer EV SUV', 'Sierra EV'],
  'Honda': ['Civic', 'Accord', 'HR-V', 'CR-V', 'Pilot', 'Passport', 'Odyssey', 'Ridgeline', 'Prologue'],
  'Hyundai': ['Elantra', 'Sonata', 'Ioniq 5', 'Ioniq 6', 'Nexo', 'Venue', 'Kona', 'Tucson', 'Santa Fe', 'Palisade', 'Santa Cruz'],
  'Infiniti': ['Q50', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Jaguar': ['F-PACE', 'I-PACE', 'F-TYPE'],
  'Jeep': ['Compass', 'Wrangler', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee L', 'Wagoneer', 'Wagoneer L', 'Grand Wagoneer', 'Grand Wagoneer L'],
  'Kia': ['Forte', 'K5', 'Niro', 'EV6', 'EV9', 'Soul', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Carnival'],
  'Koenigsegg': ['Jesko', 'Gemera'],
  'Lamborghini': ['Huracan', 'Revuelto', 'Urus', 'Aventador'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque'],
  'Lexus': ['IS', 'ES', 'LS', 'RC', 'RC F', 'LC', 'UX (Hybrid)', 'NX', 'RX', 'GX', 'TX', 'LX', 'RZ'],
  'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
  'Lucid': ['Air', 'Gravity'],
  'Maserati': ['Grecale', 'Levante', 'MC20', 'GranTurismo'],
  'Mazda': ['Mazda3', 'MX-5 Miata', 'CX-30', 'CX-5', 'CX-50', 'CX-90', 'MX-30'],
  'McLaren': ['Artura', '750S', 'GT', '720S', '765LT'],
  'Mercedes-Benz': ['CLA', 'C-Class', 'CLE-Class', 'E-Class', 'S-Class', 'SL', 'AMG GT', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQB', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV'],
  'Mini': ['Cooper (Hardtop)', 'Cooper Convertible', 'Clubman', 'Countryman'],
  'Mitsubishi': ['Mirage', 'Mirage G4', 'Eclipse Cross', 'Outlander Sport', 'Outlander'],
  'Nissan': ['Versa', 'Sentra', 'Altima', 'Leaf', 'Z', 'GT-R', 'Kicks', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Ariya', 'Frontier'],
  'Pagani': ['Utopia', 'Huayra'],
  'Polestar': ['2', '3', '4'],
  'Porsche': ['718', '911', 'Taycan', 'Panamera', 'Macan', 'Cayenne', 'Macan EV'],
  'Ram': ['1500', '1500 Classic', '2500/3500 HD', 'ProMaster', '1500 REV'],
  'Rimac': ['Nevera'],
  'Rivian': ['R1T', 'R1S'],
  'Rolls-Royce': ['Phantom', 'Ghost', 'Cullinan', 'Spectre'],
  'Subaru': ['Impreza', 'Legacy', 'BRZ', 'WRX', 'Crosstrek', 'Forester', 'Outback', 'Ascent', 'Solterra'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  'Toyota': ['Camry', 'Corolla', 'Corolla Hatchback', 'Crown', 'Crown Signia', 'Mirai', 'Prius', 'Prius Prime', 'Sienna', '4Runner', 'bZ4X', 'Corolla Cross', 'Grand Highlander', 'Highlander', 'Land Cruiser', 'RAV4', 'RAV4 Prime', 'Sequoia', 'Tacoma', 'Tundra', 'Supra', 'GR86'],
  'VinFast': ['VF8', 'VF9'],
  'Volkswagen': ['Jetta', 'Golf GTI', 'Golf R', 'ID.4', 'ID.7', 'ID.Buzz', 'Taos', 'Tiguan', 'Atlas', 'Atlas Cross Sport'],
  'Volvo': ['S60', 'S90', 'V60', 'V60 Cross Country', 'V90 Cross Country', 'XC40', 'C40', 'XC60', 'XC90', 'EX30', 'EX90'],
  'Other': ['Other']
};

// --- CAR COLORS (XPEL LINEUP) ---
export interface CarColor {
  id: string;
  name: string;
  type: 'Gloss' | 'Satin';
  color: string;
  blendOp: number; // Opacity for blend
  desc: string;
}

export const CAR_COLORS: CarColor[] = [
  // Original options
  { id: 'clear', name: 'Original Paint', type: 'Gloss', color: 'transparent', blendOp: 0, desc: 'Crystal clear protection for your factory color.' },
  { id: 'stealth', name: 'XPEL Stealth™', type: 'Satin', color: 'rgba(255,255,255,0.05)', blendOp: 0.2, desc: 'Transforms your factory gloss paint into a satin finish.' },
  
  // XPEL Fashion Film Lineup - Official List
  { id: 'molten-orange', name: 'Molten Orange', type: 'Gloss', color: '#ea580c', blendOp: 0.85, desc: 'High-impact, fiery metallic orange.' },
  { id: 'monza-red', name: 'Monza Red', type: 'Gloss', color: '#b91c1c', blendOp: 0.9, desc: 'Deep, race-inspired Italian red.' },
  { id: 'satin-beige', name: 'Satin Thermal Beige', type: 'Satin', color: '#d6c0a1', blendOp: 0.85, desc: 'Rugged, desert-inspired matte beige.' },
  { id: 'satin-battle-green', name: 'Satin Battle Green', type: 'Satin', color: '#556b48', blendOp: 0.9, desc: 'Military-grade matte olive green.' },
  { id: 'moss-green', name: 'Moss Green', type: 'Gloss', color: '#14532d', blendOp: 0.9, desc: 'Deep, forest gloss green.' },
  { id: 'south-beach', name: 'South Beach Blue', type: 'Gloss', color: '#06b6d4', blendOp: 0.75, desc: 'Vibrant, tropical turquoise blue.' },
  { id: 'satin-abyss', name: 'Satin Abyss Blue', type: 'Satin', color: '#1e3a8a', blendOp: 0.9, desc: 'Dark, mysterious matte navy blue.' },
  { id: 'ultra-plum', name: 'Ultra Plum', type: 'Gloss', color: '#581c87', blendOp: 0.85, desc: 'Rich, royal metallic purple.' },
  { id: 'bond-silver', name: 'Bond Silver', type: 'Gloss', color: '#94a3b8', blendOp: 0.9, desc: 'Timeless, liquid metal silver.' },
  { id: 'heritage-grey', name: 'Heritage Grey', type: 'Gloss', color: '#475569', blendOp: 0.9, desc: 'Classic non-metallic dark grey.' },
  { id: 'satin-tarmac', name: 'Satin Tarmac', type: 'Satin', color: '#334155', blendOp: 0.9, desc: 'Aggressive, asphalt-inspired matte grey.' },
  { id: 'obsidian', name: 'Obsidian Black', type: 'Gloss', color: '#000000', blendOp: 0.95, desc: 'The deepest gloss black available.' },
  { id: 'satin-midnight', name: 'Satin Midnight Black', type: 'Satin', color: '#0a0a0a', blendOp: 0.95, desc: 'Stealthy, frozen black finish.' },
  { id: 'grey-black', name: 'Grey Black', type: 'Gloss', color: '#171717', blendOp: 0.92, desc: 'A hybrid deep charcoal gloss.' },
  { id: 'pearl-white', name: 'Pearl White', type: 'Gloss', color: '#f8fafc', blendOp: 0.6, desc: 'Metallic white with a pearl flake.' },
  { id: 'xpel-yellow', name: 'XPEL Yellow', type: 'Gloss', color: '#facc15', blendOp: 0.8, desc: 'Bold, track-ready racing yellow.' },
];