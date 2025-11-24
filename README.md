# PPF Pros - Landing Page

High-conversion landing page for PPF Pros Calgary, a premium paint protection film and automotive detailing service.

## Overview

This is a modern, React-based landing page designed to convert Calgary vehicle owners into qualified leads through education, trust-building, and a sophisticated quoting process. The site emphasizes Calgary-specific challenges (gravel roads, road salt, UV damage) and positions PPF Pros as the quality-focused alternative to volume shops.

## Key Features

### Value Proposition & Messaging
- **Quantifiable savings**: Hero section leads with "$3,200+ saved on paint repairs"
- **Calgary-specific problems**: Every service addresses local challenges (Deerfoot gravel, winter salt, UV)
- **Education-first approach**: "The Calgary Problem" section builds urgency through cost breakdown
- **Authentic storytelling**: Family origin story with real frustrations and solutions

### User Experience
- **Interactive hero**: Physics-based particle animation with 3D tilt effects
- **Mobile optimized**: Reduced particle count (50 vs 140) on mobile for performance
- **Smart quote widget**: Multi-step form with price transparency and real-time validation
- **Price indicators**: All packages show typical price ranges upfront
- **Enhanced FAQ**: 10 questions with bold formatting for scanability

### Technical Highlights
- React 19.2 with TypeScript
- Framer Motion for animations
- Tailwind CSS for styling
- Custom physics engine for hero section
- Dark mode support
- Google Analytics & Tag Manager integration

## Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS (CDN)
- **Animation**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.554.0
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/calgaryppfpros/google-landing-page.git
cd google-landing-page
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env.local file with your configuration
```

4. Start development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ppf-pros-lp/
├── components/
│   ├── LandingPage.tsx          # Main landing page component
│   ├── SmartQuoteWidget.tsx     # Multi-step quote form
│   └── GoogleReviewsWidget.tsx  # Review collection widget
├── services/
│   ├── api.ts                   # Webhook integration
│   └── quoteLogic.ts            # Quote calculation logic
├── types.ts                      # TypeScript definitions
├── App.tsx                       # Root component
├── index.tsx                     # React renderer
└── index.html                    # HTML entry point
```

## Key Sections

### 1. Hero Section
- Headline: "Save $3,200+ on Paint Repairs"
- Consumer Choice Award badge
- Interactive particle physics background
- Social proof: 1000+ vehicles protected

### 2. The Calgary Problem
- 3 damage types with cost breakdowns
- $8,000+ damage calculator
- Emphasizes local road conditions

### 3. Services (6 offerings)
Each service includes:
- Calgary-specific problem statement
- Dollar value saved
- "Essential for" qualifier

### 4. Technology Showcase
- XPEL Ultimate Fusion™ (PPF + Ceramic)
- XPEL Stealth™ (Matte finish)
- Color Change PPF (16 colors)

### 5. About Section
- "Born From Frustration" story
- Personal experience with bad installations
- Differentiators: hospital-grade rooms, bulk installation

### 6. Enhanced FAQ
10 questions addressing:
- ROI and cost justification
- Common objections (leasing, damage concerns)
- Technical differences (PPF vs Ceramic)
- Quality assurance

## Analytics & Tracking

The site includes:
- Google Tag Manager (GTM-WMBZZ247)
- Google Analytics 4 (G-E087BBXK9Z)
- Event tracking for:
  - Form submissions
  - Newsletter signups
  - Quote widget interactions

## Webhooks

The site integrates with n8n workflows:
- Quote submissions: `n8n.srv1046173.hstgr.cloud/webhook/ppfprosformai`
- Newsletter signups: `n8n.srv1046173.hstgr.cloud/webhook/news`
- Negative reviews: `n8n.srv1046173.hstgr.cloud/webhook/reviews`

## Recent Improvements

### November 2024 Update
1. **Hero Section**: Changed headline to quantifiable value ("Save $3,200+")
2. **Services**: Added Calgary-specific problems and dollar values to all 6 services
3. **The Calgary Problem**: New section with damage calculator
4. **About Story**: Rewrote with personal frustration narrative
5. **FAQ Enhancement**: 10 questions with bold formatting and 4 new objection-handlers
6. **Mobile Performance**: Reduced particles from 140 to 50 on mobile
7. **Price Transparency**: Added price ranges to all quote widget packages
8. **Removed Visualizer**: Simplified color PPF section with direct quote CTA

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: 90+

## Contributing

This is a private project for PPF Pros Calgary. For issues or suggestions, contact the development team.

## License

Proprietary - All rights reserved by PPF Pros Calgary

## Contact

- Website: [ppfpros.ca](https://ppfpros.ca)
- Phone: (403) 830-3311
- Location: Calgary, Alberta, Canada

---

Built with ❤️ for Calgary vehicle owners
