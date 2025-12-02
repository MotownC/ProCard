import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Wand2, AlertCircle, CheckCircle, Layers, Maximize2, X } from 'lucide-react';
import { PlayerDetails } from '../types';
import { generatePlayerBio } from '../services/geminiService';

// Generate color variants for richer designs
const getColorVariants = (hexColor: string) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const lighten = (amount: number) => {
    const nr = Math.min(255, r + amount);
    const ng = Math.min(255, g + amount);
    const nb = Math.min(255, b + amount);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };
  
  const darken = (amount: number) => {
    const nr = Math.max(0, r - amount);
    const ng = Math.max(0, g - amount);
    const nb = Math.max(0, b - amount);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };
  
  return {
    lighter2: lighten(80),
    lighter1: lighten(40),
    base: hexColor,
    darker1: darken(40),
    darker2: darken(80)
  };
};
// Border Frame Component
interface BorderFrameProps {
  style: string;
  primaryColor: string;
  secondaryColor: string;
}

const BorderFrame: React.FC<BorderFrameProps> = ({ style, primaryColor, secondaryColor }) => {
  if (style === 'tech-frame') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          {/* Glowing filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for metallic look */}
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#666', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#ccc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#444', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Outer metallic frame */}
        <rect x="4" y="4" width="312" height="472" fill="none" stroke="url(#metalGrad)" strokeWidth="8" />
        
        {/* Inner glowing line */}
        <rect x="12" y="12" width="296" height="456" fill="none" stroke={primaryColor} strokeWidth="2" filter="url(#glow)" opacity="0.8" />
        
        {/* Corner hexagons - Top Left */}
        <g transform="translate(40, 40)">
          <polygon points="0,-20 17.32,-10 17.32,10 0,20 -17.32,10 -17.32,-10" fill="none" stroke="url(#metalGrad)" strokeWidth="3"/>
          <polygon points="0,-16 13.86,-8 13.86,8 0,16 -13.86,8 -13.86,-8" fill="none" stroke={primaryColor} strokeWidth="1.5" filter="url(#glow)"/>
        </g>
        
        {/* Corner hexagons - Top Right */}
        <g transform="translate(280, 40)">
          <polygon points="0,-20 17.32,-10 17.32,10 0,20 -17.32,10 -17.32,-10" fill="none" stroke="url(#metalGrad)" strokeWidth="3"/>
          <polygon points="0,-16 13.86,-8 13.86,8 0,16 -13.86,8 -13.86,-8" fill="none" stroke={secondaryColor} strokeWidth="1.5" filter="url(#glow)"/>
        </g>
        
        {/* Corner hexagons - Bottom Left */}
        <g transform="translate(40, 440)">
          <polygon points="0,-20 17.32,-10 17.32,10 0,20 -17.32,10 -17.32,-10" fill="none" stroke="url(#metalGrad)" strokeWidth="3"/>
          <polygon points="0,-16 13.86,-8 13.86,8 0,16 -13.86,8 -13.86,-8" fill="none" stroke={secondaryColor} strokeWidth="1.5" filter="url(#glow)"/>
        </g>
        
        {/* Corner hexagons - Bottom Right */}
        <g transform="translate(280, 440)">
          <polygon points="0,-20 17.32,-10 17.32,10 0,20 -17.32,10 -17.32,-10" fill="none" stroke="url(#metalGrad)" strokeWidth="3"/>
          <polygon points="0,-16 13.86,-8 13.86,8 0,16 -13.86,8 -13.86,-8" fill="none" stroke={primaryColor} strokeWidth="1.5" filter="url(#glow)"/>
        </g>
        
        {/* Circuit traces - Top */}
        <line x1="80" y1="15" x2="240" y2="15" stroke={primaryColor} strokeWidth="1" opacity="0.6"/>
        <line x1="100" y1="18" x2="220" y2="18" stroke={primaryColor} strokeWidth="0.5" opacity="0.4"/>
        
        {/* Circuit traces - Bottom */}
        <line x1="80" y1="465" x2="240" y2="465" stroke={secondaryColor} strokeWidth="1" opacity="0.6"/>
        <line x1="100" y1="462" x2="220" y2="462" stroke={secondaryColor} strokeWidth="0.5" opacity="0.4"/>
        
        {/* Side accent lines */}
        <line x1="15" y1="80" x2="15" y2="400" stroke={primaryColor} strokeWidth="1" opacity="0.5"/>
        <line x1="305" y1="80" x2="305" y2="400" stroke={secondaryColor} strokeWidth="1" opacity="0.5"/>
      </svg>
    );
  }
  
  if (style === 'chrome-metal') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          {/* Chrome gradient */}
          <linearGradient id="chrome1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: '#888', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#ddd', stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: '#666', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#aaa', stopOpacity: 1 }} />
          </linearGradient>
          
          {/* Inner bevel */}
          <linearGradient id="bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 0.4 }} />
          </linearGradient>
          
          {/* Carbon fiber pattern */}
          <pattern id="carbon" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#1a1a1a"/>
            <path d="M0,5 L5,0 M5,10 L10,5" stroke="#0a0a0a" strokeWidth="1"/>
          </pattern>
        </defs>
        
        {/* Outer chrome frame */}
        <path d="M 0,20 L 20,0 L 300,0 L 320,20 L 320,460 L 300,480 L 20,480 L 0,460 Z" 
              fill="url(#chrome1)" stroke="#333" strokeWidth="2"/>
        
        {/* Inner frame */}
        <path d="M 8,24 L 24,8 L 296,8 L 312,24 L 312,456 L 296,472 L 24,472 L 8,456 Z" 
              fill="none" stroke="url(#bevel)" strokeWidth="2"/>
        
        {/* Team color accent bars - Top */}
        <rect x="60" y="4" width="200" height="4" fill={primaryColor} opacity="0.8"/>
        
        {/* Team color accent bars - Bottom */}
        <rect x="60" y="472" width="200" height="4" fill={secondaryColor} opacity="0.8"/>
        
        {/* Corner carbon fiber panels - Top Left */}
        <polygon points="0,20 20,0 60,0 40,20" fill="url(#carbon)"/>
        <polygon points="0,20 40,20 20,40 0,60" fill="url(#carbon)"/>
        
        {/* Corner carbon fiber panels - Top Right */}
        <polygon points="320,20 300,0 260,0 280,20" fill="url(#carbon)"/>
        <polygon points="320,20 280,20 300,40 320,60" fill="url(#carbon)"/>
        
        {/* Corner carbon fiber panels - Bottom Left */}
        <polygon points="0,460 20,480 60,480 40,460" fill="url(#carbon)"/>
        <polygon points="0,460 40,460 20,440 0,420" fill="url(#carbon)"/>
        
        {/* Corner carbon fiber panels - Bottom Right */}
        <polygon points="320,460 300,480 260,480 280,460" fill="url(#carbon)"/>
        <polygon points="320,460 280,460 300,440 320,420" fill="url(#carbon)"/>
        
        {/* Corner brackets with team colors */}
        <polyline points="25,60 25,25 60,25" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.8"/>
        <polyline points="295,60 295,25 260,25" fill="none" stroke={secondaryColor} strokeWidth="2" opacity="0.8"/>
        <polyline points="25,420 25,455 60,455" fill="none" stroke={secondaryColor} strokeWidth="2" opacity="0.8"/>
        <polyline points="295,420 295,455 260,455" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.8"/>
      </svg>
    );
  }
  
  if (style === 'carbon-fiber') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <pattern id="carbonWeave" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#0a0a0a"/>
            <path d="M0,4 L4,0 M4,8 L8,4" stroke="#1a1a1a" strokeWidth="2"/>
            <path d="M0,4 L4,8 M4,0 L8,4" stroke="#050505" strokeWidth="1"/>
          </pattern>
          
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Wide carbon fiber border */}
        <rect x="0" y="0" width="320" height="480" fill="url(#carbonWeave)"/>
        <rect x="20" y="20" width="280" height="440" fill="transparent"/>
        
        {/* Inner glowing frame */}
        <rect x="18" y="18" width="284" height="444" fill="none" stroke={primaryColor} strokeWidth="3" filter="url(#innerGlow)" opacity="0.9"/>
        <rect x="22" y="22" width="276" height="436" fill="none" stroke={secondaryColor} strokeWidth="1" opacity="0.6"/>
        
        {/* Angled corner cuts with glow */}
        <polygon points="0,0 60,0 40,20 0,20" fill="url(#carbonWeave)" stroke={primaryColor} strokeWidth="1"/>
        <polygon points="320,0 260,0 280,20 320,20" fill="url(#carbonWeave)" stroke={secondaryColor} strokeWidth="1"/>
        <polygon points="0,480 60,480 40,460 0,460" fill="url(#carbonWeave)" stroke={secondaryColor} strokeWidth="1"/>
        <polygon points="320,480 260,480 280,460 320,460" fill="url(#carbonWeave)" stroke={primaryColor} strokeWidth="1"/>
        
        {/* Metallic accents on corners */}
        <line x1="40" y1="20" x2="50" y2="20" stroke="#666" strokeWidth="2"/>
        <line x1="270" y1="20" x2="280" y2="20" stroke="#666" strokeWidth="2"/>
        <line x1="40" y1="460" x2="50" y2="460" stroke="#666" strokeWidth="2"/>
        <line x1="270" y1="460" x2="280" y2="460" stroke="#666" strokeWidth="2"/>
      </svg>
    );
  }
  
  if (style === 'neon-glow') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer glow line */}
        <rect x="10" y="10" width="300" height="460" fill="none" 
              stroke={primaryColor} strokeWidth="3" filter="url(#neonGlow)" opacity="0.9"/>
        
        {/* Inner glow line */}
        <rect x="15" y="15" width="290" height="450" fill="none" 
              stroke={secondaryColor} strokeWidth="1.5" filter="url(#neonGlow)" opacity="0.7"/>
        
        {/* Corner accent dots */}
        <circle cx="30" cy="30" r="4" fill={primaryColor} filter="url(#neonGlow)"/>
        <circle cx="290" cy="30" r="4" fill={secondaryColor} filter="url(#neonGlow)"/>
        <circle cx="30" cy="450" r="4" fill={secondaryColor} filter="url(#neonGlow)"/>
        <circle cx="290" cy="450" r="4" fill={primaryColor} filter="url(#neonGlow)"/>
        
        {/* Edge accent lines */}
        <line x1="50" y1="12" x2="270" y2="12" stroke={primaryColor} strokeWidth="1" opacity="0.5"/>
        <line x1="50" y1="468" x2="270" y2="468" stroke={secondaryColor} strokeWidth="1" opacity="0.5"/>
      </svg>
    );
  }
  
  if (style === 'geometric') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <linearGradient id="geomGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 0.8 }} />
          </linearGradient>
          
          <linearGradient id="geomGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: secondaryColor, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: primaryColor, stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
        
        {/* Angular corner pieces - Top Left */}
        <polygon points="0,0 80,0 60,20 20,20 0,40" fill="url(#geomGrad1)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        <polygon points="0,0 20,20 20,60 0,80" fill="url(#geomGrad2)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        
        {/* Angular corner pieces - Top Right */}
        <polygon points="320,0 240,0 260,20 300,20 320,40" fill="url(#geomGrad1)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        <polygon points="320,0 300,20 300,60 320,80" fill="url(#geomGrad2)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        
        {/* Angular corner pieces - Bottom Left */}
        <polygon points="0,480 80,480 60,460 20,460 0,440" fill="url(#geomGrad1)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        <polygon points="0,480 20,460 20,420 0,400" fill="url(#geomGrad2)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        
        {/* Angular corner pieces - Bottom Right */}
        <polygon points="320,480 240,480 260,460 300,460 320,440" fill="url(#geomGrad1)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        <polygon points="320,480 300,460 300,420 320,400" fill="url(#geomGrad2)" stroke="#fff" strokeWidth="1" opacity="0.9"/>
        
        {/* Connecting beveled edges */}
        <polygon points="80,0 240,0 240,5 80,5" fill="#333" stroke={primaryColor} strokeWidth="1"/>
        <polygon points="80,480 240,480 240,475 80,475" fill="#333" stroke={secondaryColor} strokeWidth="1"/>
        <polygon points="0,80 0,400 5,400 5,80" fill="#333" stroke={primaryColor} strokeWidth="1"/>
        <polygon points="320,80 320,400 315,400 315,80" fill="#333" stroke={secondaryColor} strokeWidth="1"/>
      </svg>
    );
  }
  
  if (style === 'classic') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <linearGradient id="classicBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ddd', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#888', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#444', stopOpacity: 1 }} />
          </linearGradient>
          
          <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>
        
        {/* Outer beveled frame */}
        <rect x="0" y="0" width="320" height="480" fill="url(#classicBevel)" stroke="#222" strokeWidth="2"/>
        
        {/* Inner frame with team color tint */}
        <rect x="12" y="12" width="296" height="456" fill="none" stroke="url(#teamGradient)" strokeWidth="8"/>
        
        {/* Clean inner border */}
        <rect x="18" y="18" width="284" height="444" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3"/>
        
        {/* Subtle corner accents */}
        <line x1="25" y1="40" x2="25" y2="25" stroke={primaryColor} strokeWidth="2" opacity="0.6"/>
        <line x1="25" y1="25" x2="40" y2="25" stroke={primaryColor} strokeWidth="2" opacity="0.6"/>
        
        <line x1="295" y1="40" x2="295" y2="25" stroke={secondaryColor} strokeWidth="2" opacity="0.6"/>
        <line x1="295" y1="25" x2="280" y2="25" stroke={secondaryColor} strokeWidth="2" opacity="0.6"/>
        
        <line x1="25" y1="440" x2="25" y2="455" stroke={secondaryColor} strokeWidth="2" opacity="0.6"/>
        <line x1="25" y1="455" x2="40" y2="455" stroke={secondaryColor} strokeWidth="2" opacity="0.6"/>
        
        <line x1="295" y1="440" x2="295" y2="455" stroke={primaryColor} strokeWidth="2" opacity="0.6"/>
        <line x1="295" y1="455" x2="280" y2="455" stroke={primaryColor} strokeWidth="2" opacity="0.6"/>
      </svg>
    );
  }
  
  return null;
};
// Define the available background styles
const BACKGROUND_STYLES = [
  { id: 'classic', name: 'Classic Fade', type: 'css' },
  { id: 'classic-enhanced', name: 'Classic Enhanced', type: 'canvas' },
  { id: 'cyber', name: 'Cyber Grid', type: 'canvas' },
  { id: 'velocity', name: 'Velocity', type: 'canvas' },
  { id: 'hex', name: 'Hex Tech', type: 'css' },
  { id: 'shatter', name: 'Shatter', type: 'canvas' },
  { id: 'energy', name: 'Energy', type: 'canvas' },
  { id: 'splatter', name: 'Splatter', type: 'canvas' }, 
  { id: 'hurricane', name: 'Hurricane', type: 'canvas' },
];

const OrderForm: React.FC = () => {
  const [details, setDetails] = useState<PlayerDetails>({
    name: '',
    team: '',
    position: '',
    number: '',
    sport: 'Athlete',
    bio: ''
  });
  
  const [colors, setColors] = useState({
    primary: '#22d3ee', // Cyan-400 default
    secondary: '#a855f7' // Purple-500 default
  });

  const [backgroundStyle, setBackgroundStyle] = useState('shatter');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [enableGlow, setEnableGlow] = useState(false); 
  const [glowOpacity, setGlowOpacity] = useState(100);
  const [glowColor, setGlowColor] = useState<'primary' | 'secondary'>('primary');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [enableBorder, setEnableBorder] = useState(false);
  const [borderStyle, setBorderStyle] = useState('tech-frame');

  // Close full screen on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBio = async () => {
    if (!details.name || !details.team) {
      alert("Please enter at least a Name and Team to generate a bio.");
      return;
    }
    setIsGenerating(true);
    try {
      const bio = await generatePlayerBio(details);
      setDetails(prev => ({ ...prev, bio }));
    } catch (error) {
      console.error("Bio generation failed", error);
    }
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Prototype: Order submitted! In a real app, this would process payment and upload to storage.");
  };

  // --- OPTION 2: PROCEDURAL GENERATION LOGIC ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const fgCanvas = foregroundCanvasRef.current;
    if (!canvas || !fgCanvas) return;

    const ctx = canvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');
    if (!ctx || !fgCtx) return;

    // High DPI Scaling for both canvases
    const dpr = window.devicePixelRatio || 1;
    
    // Background Canvas
    canvas.width = 320 * dpr;
    canvas.height = 480 * dpr;
    ctx.scale(dpr, dpr); 
    ctx.clearRect(0, 0, 320, 480);

    // Foreground Canvas
    fgCanvas.width = 320 * dpr;
    fgCanvas.height = 480 * dpr;
    fgCtx.scale(dpr, dpr);
    fgCtx.clearRect(0, 0, 320, 480);

    // Helper: Hex to RGBA
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const rng = (min: number, max: number) => Math.random() * (max - min) + min;

    // Generate color palettes
    const primaryPalette = getColorVariants(colors.primary);
    const secondaryPalette = getColorVariants(colors.secondary);

    // Helper to pick random variant from a palette
    const pickVariant = (palette: ReturnType<typeof getColorVariants>, alpha: number = 1) => {
      const variants = [palette.lighter2, palette.lighter1, palette.base, palette.darker1, palette.darker2];
      const chosen = variants[Math.floor(Math.random() * variants.length)];
      return alpha < 1 ? hexToRgba(chosen, alpha) : chosen;
    };

    // --- GENERATORS ---

    if (backgroundStyle === 'shatter') {
      // --- BACKGROUND LAYER (Behind Player) ---
      
      // Dark base
      const grad = ctx.createLinearGradient(0, 0, 320, 480);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 480);

      // 1. Impact Web (Spiderweb cracks radiating from center)
      ctx.beginPath();
      const cx = 160;
      const cy = 240;
      // Radial lines
      for(let i=0; i<24; i++) {
          ctx.moveTo(cx, cy);
          const angle = (i / 24) * Math.PI * 2 + rng(-0.1, 0.1);
          const len = rng(150, 450);
          // Zig zag cracks
          let currX = cx; 
          let currY = cy;
          let currLen = 0;
          while(currLen < len) {
            currLen += rng(15, 40);
            currX += Math.cos(angle) * rng(15,40) + rng(-3,3);
            currY += Math.sin(angle) * rng(15,40) + rng(-3,3);
            ctx.lineTo(currX, currY);
          }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Concentric cracks
      for(let r=40; r<450; r+=40) {
          ctx.beginPath();
          for(let a=0; a<Math.PI*2; a+=0.4) {
              const radius = r + rng(-15, 15);
              const x = cx + Math.cos(a)*radius;
              const y = cy + Math.sin(a)*radius;
              ctx.lineTo(x,y);
          }
          ctx.closePath();
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.stroke();
      }

      // 2. Background Shards (Darker/Distant)
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        const x = rng(0, 320);
        const y = rng(0, 480);
        const s = rng(15, 50);
        ctx.moveTo(x, y);
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.fillStyle = i % 2 === 0 
          ? pickVariant(primaryPalette, 0.03) 
          : pickVariant(secondaryPalette, 0.03);
        ctx.fill();
      }

      // --- FOREGROUND LAYER (In Front of Player) ---
      // We draw these on fgCtx
      
      // 3. Foreground High-Energy Shards
      fgCtx.shadowBlur = 10;
      for (let i = 0; i < 90; i++) {
        fgCtx.beginPath();
        const x = rng(-50, 370);
        const y = rng(-50, 530);
        
        fgCtx.moveTo(x, y);
        const s = rng(5, 70);
        fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
        fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
        fgCtx.closePath();

        const isPrimary = Math.random() > 0.4;
        const palette = isPrimary ? primaryPalette : secondaryPalette;
        fgCtx.fillStyle = pickVariant(palette, rng(0.1, 0.35));
        fgCtx.shadowColor = isPrimary ? colors.primary : colors.secondary;
        fgCtx.fill();
        
        // Highlight edges
        fgCtx.lineWidth = 0.5;
        fgCtx.strokeStyle = pickVariant(palette, 0.3);
        fgCtx.stroke();
      }
      fgCtx.shadowBlur = 0; // Reset

      // 4. Dust/Debris
      for(let i=0; i<150; i++) {
          fgCtx.beginPath();
          fgCtx.arc(rng(0,320), rng(0,480), rng(0.5, 1.5), 0, Math.PI*2);
          fgCtx.fillStyle = 'rgba(255,255,255,0.6)';
          fgCtx.fill();
      }
    }
    else if (backgroundStyle === 'classic-enhanced') {
      // Smooth base gradient (50/50 split)
      const baseGrad = ctx.createLinearGradient(0, 0, 320, 480);
      baseGrad.addColorStop(0, primaryPalette.base);
      baseGrad.addColorStop(0.4, primaryPalette.darker1);
      baseGrad.addColorStop(0.6, secondaryPalette.darker1);
      baseGrad.addColorStop(1, secondaryPalette.base);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 320, 480);

      // Radial overlay for depth
      const radialGrad = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
      radialGrad.addColorStop(0, pickVariant(primaryPalette, 0.2));
      radialGrad.addColorStop(0.5, 'transparent');
      radialGrad.addColorStop(1, pickVariant(secondaryPalette, 0.3));
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, 320, 480);

      // Subtle diagonal brush strokes
      ctx.globalAlpha = 0.15;
      for(let i = 0; i < 40; i++) {
        const x = rng(-100, 420);
        const y = rng(-100, 580);
        const length = rng(80, 200);
        const angle = 135 * (Math.PI / 180) + rng(-0.3, 0.3);
        const width = rng(15, 40);
        
        const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
        const strokeGrad = ctx.createLinearGradient(
          x, y, 
          x + Math.cos(angle) * length, 
          y + Math.sin(angle) * length
        );
        strokeGrad.addColorStop(0, 'transparent');
        strokeGrad.addColorStop(0.5, pickVariant(palette, 1));
        strokeGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = strokeGrad;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillRect(0, -width/2, length, width);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Color banding (retro poster effect)
      const bands = 6;
      ctx.globalAlpha = 0.08;
      for(let i = 0; i < bands; i++) {
        const y = (480 / bands) * i;
        const height = 480 / bands;
        const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
        
        ctx.fillStyle = pickVariant(palette, 1);
        ctx.fillRect(0, y, 320, height);
      }
      ctx.globalAlpha = 1;

      // Geometric accent shapes
      ctx.globalAlpha = 0.12;
      for(let i = 0; i < 15; i++) {
        ctx.beginPath();
        const x = rng(0, 320);
        const y = rng(0, 480);
        const size = rng(30, 100);
        const sides = Math.floor(rng(3, 6));
        
        for(let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const px = x + Math.cos(angle) * size;
          const py = y + Math.sin(angle) * size;
          if(j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
        ctx.fillStyle = pickVariant(palette, 1);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Light particles
      for(let i = 0; i < 30; i++) {
        const x = rng(0, 320);
        const y = rng(0, 480);
        const size = rng(2, 8);
        const palette = i % 3 === 0 ? primaryPalette : secondaryPalette;
        
        const particleGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
        particleGrad.addColorStop(0, pickVariant(palette, 0.8));
        particleGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = particleGrad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fine texture overlay
      ctx.globalAlpha = 0.05;
      for(let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(Math.random() * 320, Math.random() * 480, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    else if (backgroundStyle === 'energy') {
      // Deep space background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 320, 480);

      // Glowing Center
      const centerGlow = ctx.createRadialGradient(160, 240, 0, 160, 240, 300);
      centerGlow.addColorStop(0, pickVariant(primaryPalette, 0.3));
      centerGlow.addColorStop(0.5, pickVariant(primaryPalette, 0.15));
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0,0, 320, 480);

      // Fractal Lightning
      const drawBolt = (x1: number, y1: number, x2: number, y2: number, width: number, colorPalette: ReturnType<typeof getColorVariants>, depth: number = 0) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (depth > 6 || dist < 10) {
            const color = pickVariant(colorPalette, 1);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.shadowBlur = width * 3;
            ctx.shadowColor = color;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            return;
        }

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const jX = midX + (Math.random() - 0.5) * dist * 0.3;
        const jY = midY + (Math.random() - 0.5) * dist * 0.3;

        drawBolt(x1, y1, jX, jY, width, colorPalette, depth + 1);
        drawBolt(jX, jY, x2, y2, width, colorPalette, depth + 1);

        if (Math.random() > 0.7 && depth < 4) {
            const bx = jX + (Math.random() - 0.5) * dist * 0.7;
            const by = jY + (Math.random() - 0.5) * dist * 0.7;
            drawBolt(jX, jY, bx, by, width * 0.5, colorPalette, depth + 1);
        }
      };

      // Main Bolts
      drawBolt(-50, 0, 220, 480, 3, primaryPalette);           
      drawBolt(370, 0, 100, 480, 3, primaryPalette);           
      drawBolt(50, -50, 160, 300, 2.5, secondaryPalette);      
      drawBolt(270, -50, 160, 300, 2.5, secondaryPalette);     
      drawBolt(160, 180, 20, 480, 2, primaryPalette);          
      drawBolt(160, 180, 300, 480, 2, primaryPalette);         
      
      drawBolt(0, 240, 320, 240, 2, secondaryPalette);         
      drawBolt(160, 0, 80, 480, 2.5, primaryPalette);          
      drawBolt(160, 0, 240, 480, 2.5, secondaryPalette);       

      // Static Particles
      for(let i=0; i<60; i++) {
          ctx.beginPath();
          ctx.arc(rng(0, 320), rng(0, 480), rng(0.5, 2), 0, Math.PI*2);
          const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
          const particleColor = pickVariant(palette, 1);
          ctx.fillStyle = particleColor;
          ctx.shadowBlur = 5;
          ctx.shadowColor = particleColor;
          ctx.fill();
      }
      
      // Glowing orbs
      for(let i=0; i<8; i++) {
          const x = rng(0, 320);
          const y = rng(0, 480);
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          const orbGlow = ctx.createRadialGradient(x, y, 0, x, y, rng(30, 60));
          orbGlow.addColorStop(0, pickVariant(palette, 0.4));
          orbGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = orbGlow;
          ctx.beginPath();
          ctx.arc(x, y, rng(30, 60), 0, Math.PI * 2);
          ctx.fill();
      }
    }
    else if (backgroundStyle === 'splatter') {
      // 1. Concrete/Grunge Wall Base
      const gradient = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
      gradient.addColorStop(0, '#2a2a2a');
      gradient.addColorStop(1, '#050505'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 320, 480);

      // Add Noise Texture
      for(let i=0; i<8000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)';
          ctx.fillRect(Math.random() * 320, Math.random() * 480, 1.5, 1.5);
      }

      // Helper: Explosive Paintball Splat
      const drawPaintball = (cx: number, cy: number, radius: number, palette: ReturnType<typeof getColorVariants>) => {
          const color = pickVariant(palette, 1);
          ctx.fillStyle = color;
          
          // Core Impact
          ctx.beginPath();
          for(let i=0; i<Math.PI*2; i+=0.1) {
              const r = radius * (0.7 + Math.random() * 0.6); 
              ctx.lineTo(cx + Math.cos(i)*r, cy + Math.sin(i)*r);
          }
          ctx.fill();

          // Spray rays
          const rays = 15 + Math.random() * 20;
          for(let i=0; i<rays; i++) {
              const angle = Math.random() * Math.PI * 2;
              const len = radius * (3 + Math.random() * 6);
              
              ctx.fillStyle = pickVariant(palette, rng(0.7, 1));
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(angle)*radius*0.5, cy + Math.sin(angle)*radius*0.5);
              const endx = cx + Math.cos(angle) * len;
              const endy = cy + Math.sin(angle) * len;
              
              ctx.lineTo(endx, endy);
              ctx.lineTo(cx + Math.cos(angle + 0.15)*radius*0.5, cy + Math.sin(angle + 0.15)*radius*0.5);
              ctx.fill();
          }

          // Satellite Droplets
          const droplets = 40 + Math.random() * 50;
          for(let i=0; i<droplets; i++) {
              const dist = radius * (1.5 + Math.random() * 6);
              const angle = Math.random() * Math.PI * 2;
              const size = Math.random() * (radius * 0.25);
              
              ctx.fillStyle = pickVariant(palette, rng(0.6, 1));
              ctx.beginPath();
              ctx.arc(cx + Math.cos(angle)*dist, cy + Math.sin(angle)*dist, size, 0, Math.PI*2);
              ctx.fill();
          }
      };

      // Helper: Aggressive Brush Stroke
      const drawPowerStroke = (x1: number, y1: number, x2: number, y2: number, palette: ReturnType<typeof getColorVariants>, thickness: number) => {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const angle = Math.atan2(dy, dx);
          
          ctx.save();
          ctx.translate(x1, y1);
          ctx.rotate(angle);
          
          const bristles = thickness * 3;
          for(let i=0; i<bristles; i++) {
              const offset = (Math.random() - 0.5) * thickness;
              const lengthFactor = 0.5 + Math.random() * 0.7; 
              const currentLen = dist * lengthFactor;
              
              ctx.globalAlpha = 0.4 + Math.random() * 0.6;
              ctx.lineWidth = 0.5 + Math.random() * 2.5;
              ctx.strokeStyle = pickVariant(palette, 1);

              ctx.beginPath();
              ctx.moveTo(0, offset);
              ctx.bezierCurveTo(
                  currentLen * 0.3, offset + rng(-15, 15),
                  currentLen * 0.7, offset + rng(-30, 30),
                  currentLen, offset + rng(-10, 10)
              );
              ctx.stroke();
          }
          ctx.restore();
      };

      // LAYOUT GENERATION
      
      // 1. Background Power Strokes
      drawPowerStroke(-80, 80, 380, 450, secondaryPalette, 140);
      drawPowerStroke(380, -80, -80, 520, primaryPalette, 160);

      // 2. Main Paintball Impacts
      for(let i=0; i<7; i++) {
          const x = rng(40, 280);
          const y = rng(80, 400);
          const palette = Math.random() > 0.4 ? primaryPalette : secondaryPalette;
          drawPaintball(x, y, rng(10, 30), palette);
      }
      
      // 3. White contrast splatters
      for(let i=0; i<3; i++) {
          const x = rng(20, 300);
          const y = rng(20, 460);
          const size = rng(4, 12);
          
          if(Math.random() > 0.6) {
              const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
              ctx.fillStyle = pickVariant(palette, 0.3);
              ctx.shadowBlur = 8;
              ctx.shadowColor = pickVariant(palette, 0.6);
          } else {
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 6;
              ctx.shadowColor = '#ffffff';
          }
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // 4. Foreground Swipe
      drawPowerStroke(-40, 320, 360, 240, primaryPalette, 50);
      
      // 5. Drips
      for(let i=0; i<15; i++) {
          const x = rng(0, 320);
          const y = rng(0, 400);
          const w = rng(1.5, 4);
          const h = rng(60, 180);
          
          const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
          ctx.fillStyle = pickVariant(palette, rng(0.7, 1));
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.arc(x + w/2, y + h, w, 0, Math.PI*2); 
          ctx.fill();
          ctx.globalAlpha = 1;
      }
      
      // 6. Accent spots
      for(let i=0; i<5; i++) {
          const x = rng(20, 300);
          const y = rng(20, 460);
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          drawPaintball(x, y, rng(5, 15), palette);
      }
    }
    else if (backgroundStyle === 'velocity') {
      // Speed base
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 320, 480);

      // Motion streaks
      for (let i = 0; i < 150; i++) {
        const x = rng(-150, 470);
        const y = rng(-150, 630);
        const length = rng(50, 300);
        const angle = 60 * (Math.PI / 180);

        const isPrimary = i % 3 !== 0; 
        const palette = isPrimary ? primaryPalette : secondaryPalette;

        const grad = ctx.createLinearGradient(x, y, x + Math.cos(angle)*length, y + Math.sin(angle)*length);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, pickVariant(palette, rng(0.2, 0.8)));
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = rng(1, 3);
        ctx.stroke();
      }
      
      // Speed particles
      for(let i=0; i<50; i++){
          ctx.beginPath();
          ctx.arc(rng(0,320), rng(0,480), rng(0.5, 1.5), 0, Math.PI*2);
          if(Math.random() > 0.7) {
              const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
              ctx.fillStyle = pickVariant(palette, 0.8);
          } else {
              ctx.fillStyle = '#fff';
          }
          ctx.fill();
      }
      
      // Glowing speed trails
      for(let i=0; i<12; i++) {
          const x = rng(0, 320);
          const y = rng(0, 480);
          const length = rng(100, 250);
          const angle = 60 * (Math.PI / 180);
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          
          const trailGrad = ctx.createLinearGradient(x, y, x + Math.cos(angle)*length, y + Math.sin(angle)*length);
          trailGrad.addColorStop(0, pickVariant(palette, 0.6));
          trailGrad.addColorStop(0.3, pickVariant(palette, 0.4));
          trailGrad.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = rng(3, 6);
          ctx.lineCap = 'round';
          ctx.shadowBlur = 15;
          ctx.shadowColor = pickVariant(palette, 0.8);
          ctx.stroke();
      }
    }
    else if (backgroundStyle === 'cyber') {
      // Perspective Grid
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 320, 480);
      const horizonY = 280;

      // Starfield background
      for(let i = 0; i < 80; i++) {
          const x = rng(0, 320);
          const y = rng(0, horizonY - 20);
          const size = rng(0.5, 2);
          const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
          const starColor = pickVariant(palette, rng(0.4, 0.9));
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = starColor;
          ctx.shadowBlur = size * 3;
          ctx.shadowColor = starColor;
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // Floating geometric shapes
      for(let i = 0; i < 12; i++) {
          const x = rng(20, 300);
          const y = rng(20, horizonY - 40);
          const size = rng(15, 40);
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          
          ctx.strokeStyle = pickVariant(palette, rng(0.3, 0.6));
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 6;
          ctx.shadowColor = pickVariant(palette, 0.5);
          
          ctx.strokeRect(x, y, size, size * 0.6);
          ctx.beginPath();
          ctx.moveTo(x + size/2, y);
          ctx.lineTo(x + size/2, y - rng(10, 30));
          ctx.stroke();
          ctx.shadowBlur = 0;
      }

      // Scan lines across top
      ctx.globalAlpha = 0.1;
      for(let y = 0; y < horizonY; y += 8) {
          const palette = y % 16 === 0 ? primaryPalette : secondaryPalette;
          ctx.strokeStyle = pickVariant(palette, 1);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(320, y);
          ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Glowing data streams
      for(let i = 0; i < 5; i++) {
          const x = rng(40, 280);
          const y1 = rng(0, horizonY - 100);
          const y2 = y1 + rng(60, 120);
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          
          const streamGrad = ctx.createLinearGradient(x, y1, x, y2);
          streamGrad.addColorStop(0, 'transparent');
          streamGrad.addColorStop(0.5, pickVariant(palette, 0.8));
          streamGrad.addColorStop(1, 'transparent');
          
          ctx.strokeStyle = streamGrad;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = pickVariant(palette, 0.6);
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
      }  
      // Horizon glow
      const grad = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 80);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, pickVariant(secondaryPalette, 0.6));
      grad.addColorStop(0.5, pickVariant(secondaryPalette, 0.9));
      grad.addColorStop(0.7, pickVariant(secondaryPalette, 0.6));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizonY - 50, 320, 130);

      const centerX = 160;
      
      // Vertical grid lines
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      
      for (let x = -400; x <= 720; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 480);
          ctx.lineTo(centerX + (x - centerX) * 0.15, horizonY);
          
          const palette = Math.abs(x - centerX) < 160 ? primaryPalette : secondaryPalette;
          const lineColor = pickVariant(palette, rng(0.5, 0.8));
          ctx.strokeStyle = lineColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = lineColor;
          ctx.stroke();
      }

      // Horizontal grid lines
      let y = 480;
      let lineCount = 0;
      while (y > horizonY + 5) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(320, y);
          
          const palette = lineCount % 3 === 0 ? primaryPalette : secondaryPalette;
          const lineColor = pickVariant(palette, rng(0.4, 0.7));
          ctx.strokeStyle = lineColor;
          ctx.shadowBlur = 6;
          ctx.shadowColor = lineColor;
          ctx.stroke();
          
          const dist = y - horizonY;
          const step = Math.max(2, dist * 0.2); 
          y -= step;
          lineCount++;
      }
      
      // Sun
      const sunGrad = ctx.createLinearGradient(0, horizonY - 80, 0, horizonY + 20);
      sunGrad.addColorStop(0, pickVariant(secondaryPalette, 1));
      sunGrad.addColorStop(0.3, pickVariant(secondaryPalette, 0.9));
      sunGrad.addColorStop(0.6, pickVariant(primaryPalette, 0.7));
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.shadowBlur = 40;
      ctx.shadowColor = pickVariant(secondaryPalette, 0.8);
      ctx.beginPath();
      ctx.arc(160, horizonY - 30, 50, 0, Math.PI, true);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Add glowing grid intersections
      for(let gx = -360; gx <= 680; gx += 80) {
          for(let gy = 480; gy > horizonY + 20; gy -= 40) {
              if(Math.random() > 0.7) {
                  const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
                  const glowColor = pickVariant(palette, rng(0.6, 1));
                  
                  ctx.beginPath();
                  ctx.arc(gx, gy, rng(2, 4), 0, Math.PI * 2);
                  ctx.fillStyle = glowColor;
                  ctx.shadowBlur = 10;
                  ctx.shadowColor = glowColor;
                  ctx.fill();
                  ctx.shadowBlur = 0;
              }
          }
      }
      
      // Add floating data particles
      for(let i=0; i<20; i++) {
          const x = rng(0, 320);
          const y = rng(horizonY - 100, horizonY + 50);
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          const particleColor = pickVariant(palette, rng(0.7, 1));
          
          ctx.fillStyle = particleColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = particleColor;
          ctx.fillRect(x, y, rng(1, 3), rng(1, 3));
          ctx.shadowBlur = 0;
      }
    }
    else if (backgroundStyle === 'hurricane') {
      // Stormy base
      const grad = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 480);

      // Spiral Center Glow
      const eye = ctx.createRadialGradient(160, 240, 5, 160, 240, 50);
      eye.addColorStop(0, pickVariant(primaryPalette, 0.4));
      eye.addColorStop(0.5, pickVariant(primaryPalette, 0.2));
      eye.addColorStop(1, 'transparent');
      ctx.fillStyle = eye;
      ctx.fillRect(0, 0, 320, 480);

      const cx = 160;
      const cy = 240;
      const maxR = 400;

      // 1. Draw Cloud Wall Particles
      for(let i=0; i<500; i++) {
          const r = rng(20, maxR);
          const theta = rng(0, Math.PI*2);
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          
          ctx.beginPath();
          ctx.arc(x, y, rng(5, 25), 0, Math.PI*2);
          
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          const alpha = 0.02 + (1 - r/maxR) * 0.06;
          ctx.fillStyle = pickVariant(palette, alpha);
          ctx.fill();
      }

      // 2. Draw Swirling Arms
      for (let i = 0; i < 700; i++) {
        const r = Math.pow(Math.random(), 0.7) * maxR;
        const armIndex = i % 3;
        const spiralOffset = r * 0.025;
        const theta = (armIndex * (Math.PI * 2 / 3)) + spiralOffset + (Math.random() - 0.5) * 0.6;

        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;

        const trailTheta = theta - 0.2;
        const tx = cx + Math.cos(trailTheta) * (r + 5); 
        const ty = cy + Math.sin(trailTheta) * (r + 5);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (tx-x)/2, y + (ty-y)/2, tx, ty);
        
        const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
        ctx.strokeStyle = pickVariant(palette, rng(0.2, 0.6));
        
        ctx.lineWidth = rng(0.5, 3);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 3. Storm Lightning
      for(let i=0; i<12; i++) {
          const r = rng(40, 250);
          const armIndex = i % 3;
          const spiralOffset = r * 0.025;
          const theta = (armIndex * (Math.PI * 2 / 3)) + spiralOffset + rng(-0.2, 0.2);
          
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          
          ctx.beginPath();
          ctx.moveTo(x,y);
          // Jagged bolt
          let currX = x, currY = y;
          for(let j=0; j<6; j++) {
            currX += rng(-15, 15);
            currY += rng(-15, 15);
            ctx.lineTo(currX, currY);
          }
          
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          const boltColor = pickVariant(palette, 1);
          
          ctx.strokeStyle = boltColor;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = boltColor;
          ctx.stroke();
      }
      
      // 4. Energized storm cores
      for(let i=0; i<6; i++) {
          const r = rng(80, 200);
          const theta = rng(0, Math.PI * 2);
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          
          const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
          const coreGlow = ctx.createRadialGradient(x, y, 0, x, y, 40);
          coreGlow.addColorStop(0, pickVariant(palette, 0.6));
          coreGlow.addColorStop(0.5, pickVariant(palette, 0.3));
          coreGlow.addColorStop(1, 'transparent');
          
          ctx.fillStyle = coreGlow;
          ctx.beginPath();
          ctx.arc(x, y, 40, 0, Math.PI * 2);
          ctx.fill();
      }
    }

  }, [backgroundStyle, colors]);


  // Helper for CSS styles (Option 3)
  const getCssBackground = () => {
    switch (backgroundStyle) {
      case 'classic':
        const midColor1 = getColorVariants(colors.primary).darker1;
        const midColor2 = getColorVariants(colors.secondary).lighter1;
        
        return { 
          background: `linear-gradient(135deg, 
            ${colors.primary} 0%, 
            ${midColor1} 25%,
            ${midColor2} 75%,
            ${colors.secondary} 100%)`
        };
      case 'hex':
  const primaryVariants = getColorVariants(colors.primary);
  const secondaryVariants = getColorVariants(colors.secondary);
  
  return {
    backgroundColor: '#0a0a0a',
    backgroundImage: `
      radial-gradient(circle at 50% 0%, ${primaryVariants.lighter1}90, ${primaryVariants.base}60 30%, ${primaryVariants.darker1}30 50%, transparent 70%),
      radial-gradient(circle at 0% 100%, ${secondaryVariants.base}50, ${secondaryVariants.darker1}30 40%, transparent 60%),
      radial-gradient(circle at 100% 100%, ${primaryVariants.base}40, transparent 55%),
      radial-gradient(circle at 50% 50%, ${secondaryVariants.lighter1}15, transparent 40%),
      radial-gradient(ellipse at 30% 40%, ${primaryVariants.lighter2}20, transparent 35%),
      radial-gradient(ellipse at 70% 60%, ${secondaryVariants.lighter1}20, transparent 35%),
      repeating-linear-gradient(60deg, ${secondaryVariants.base}25 0px, ${secondaryVariants.base}25 2px, transparent 2px, transparent 18px),
      repeating-linear-gradient(-60deg, ${primaryVariants.base}20 0px, ${primaryVariants.base}20 2px, transparent 2px, transparent 18px),
      repeating-linear-gradient(0deg, ${primaryVariants.darker1}15 0px, ${primaryVariants.darker1}15 1.5px, transparent 1.5px, transparent 20px),
      repeating-linear-gradient(120deg, ${secondaryVariants.darker1}10 0px, ${secondaryVariants.darker1}10 1px, transparent 1px, transparent 22px)
    `
  };
      default:
        return { background: 'transparent' }; // Canvas handles it
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Form */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white font-['Teko']">DESIGN YOUR LEGEND</h2>
            <p className="text-gray-400 mt-2">Upload your photo and let us craft the perfect card.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            
            {/* File Upload */}
            <div 
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer bg-slate-900/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              {imagePreview ? (
                <div className="flex items-center justify-center gap-4">
                  <CheckCircle className="text-green-500 w-6 h-6" />
                  <span className="text-white font-medium">Photo Uploaded</span>
                  <span className="text-xs text-gray-500">(Click to change)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-gray-300 font-medium">Click to upload action shot</span>
                  <span className="text-xs text-gray-500 mt-1">High resolution works best</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Player Name</label>
                <input 
                  type="text" 
                  value={details.name}
                  onChange={(e) => setDetails({...details, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="e.g. Jaxson Smith"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Jersey Number</label>
                <input 
                  type="text" 
                  value={details.number}
                  onChange={(e) => setDetails({...details, number: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="e.g. 23"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Team Name</label>
                <input 
                  type="text" 
                  value={details.team}
                  onChange={(e) => setDetails({...details, team: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="e.g. Tigers"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Position</label>
                <input 
                  type="text" 
                  value={details.position}
                  onChange={(e) => setDetails({...details, position: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="e.g. Point Guard"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Team Colors</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-600 rounded-lg p-2 flex items-center gap-3">
                  <input 
                    type="color" 
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                    title="Primary Color"
                  />
                  <div>
                    <span className="text-xs text-gray-400 block">Primary</span>
                    <span className="text-xs text-white font-mono">{colors.primary}</span>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-600 rounded-lg p-2 flex items-center gap-3">
                  <input 
                    type="color" 
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                    title="Secondary Color"
                  />
                  <div>
                    <span className="text-xs text-gray-400 block">Secondary</span>
                    <span className="text-xs text-white font-mono">{colors.secondary}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Glow Toggle */}
            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={enableGlow}
                    onChange={(e) => setEnableGlow(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Add glow around player image
                  </span>
                </label>
                
                {enableGlow && (
                  <button
                    type="button"
                    onClick={() => setGlowColor(glowColor === 'primary' ? 'secondary' : 'primary')}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all border"
                    style={{ 
                      backgroundColor: `${glowColor === 'primary' ? colors.primary : colors.secondary}20`,
                      borderColor: glowColor === 'primary' ? colors.primary : colors.secondary,
                      color: glowColor === 'primary' ? colors.primary : colors.secondary
                    }}
                  >
                    {glowColor === 'primary' ? 'Primary' : 'Secondary'}
                  </button>
                )}
              </div>
              
              {/* Glow Intensity Slider */}
              {enableGlow && (
                <div className="pl-6 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Glow Intensity</label>
                    <span className="text-xs text-gray-300 font-mono">{glowOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={glowOpacity}
                    onChange={(e) => setGlowOpacity(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700"
                    style={{
                      background: `linear-gradient(to right, ${glowColor === 'primary' ? colors.primary : colors.secondary} 0%, ${glowColor === 'primary' ? colors.primary : colors.secondary} ${glowOpacity}%, #334155 ${glowOpacity}%, #334155 100%)`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Background Style Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Card Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUND_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setBackgroundStyle(style.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide text-left transition-all border flex items-center justify-between ${
                      backgroundStyle === style.id 
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                      : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <span>{style.name}</span>
                    {style.type === 'canvas' && <Sparkles className="w-3 h-3 text-yellow-500" />}
                  </button>
                ))}
              </div>
            </div>
            {/* Border Frame Selector */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={enableBorder}
                  onChange={(e) => setEnableBorder(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  Add border frame
                </span>
              </label>
              
              {enableBorder && (
                <div className="pl-6 space-y-2">
                  <label className="text-xs text-gray-400">Frame Style</label>
                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="tech-frame">Tech Frame</option>
                    <option value="chrome-metal">Chrome Metal</option>
                    <option value="carbon-fiber">Carbon Fiber</option>
                    <option value="neon-glow">Neon Glow</option>
                    <option value="geometric">Geometric</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>
              )}
            </div>
            {/* Bio Generation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Card Bio</label>
                <button 
                  type="button"
                  onClick={handleGenerateBio}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                  style={{ color: colors.primary }}
                >
                  <Sparkles className="w-3 h-3" />
                  {isGenerating ? 'Writing Legend...' : 'AI Generate Bio'}
                </button>
              </div>
              <textarea 
                value={details.bio}
                onChange={(e) => setDetails({...details, bio: e.target.value})}
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 outline-none transition-colors"
                style={{ '--tw-ring-color': colors.primary } as React.CSSProperties}
                placeholder="Enter stats or click AI Generate..."
              />
            </div>

            <button 
                type="submit" 
                className="w-full text-white font-bold py-3 rounded-lg transition-all shadow-lg flex justify-center items-center gap-2"
                style={{ 
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 4px 14px 0 ${colors.primary}40`
                }}
            >
              <Wand2 className="w-5 h-5" />
              Create My Card Preview
            </button>
          </form>
        </div>

        {/* Right Column: Live Preview */}
        {/* Right Column: Live Preview */}
        {/* 
            LOGIC: We toggle the class names of this container. 
            If isFullScreen is true, it becomes a fixed overlay (Gallery Style).
            If false, it sits in the sticky sidebar.
        */}
        <div 
          className={`
            transition-all duration-300 ease-in-out
            ${isFullScreen 
              ? 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md' // Gallery Modal Styles
              : 'lg:sticky lg:top-24' // Default Sidebar Styles
            }
          `}
          // Optional: click background to close
          onClick={(e) => {
            if (e.target === e.currentTarget && isFullScreen) setIsFullScreen(false);
          }}
        >
          {/* Header/Label - Only show when NOT full screen */}
          {!isFullScreen && (
            <div className="text-center mb-6">
               <span className="bg-slate-800 text-gray-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider border border-slate-700">LIVE PREVIEW</span>
            </div>
          )}

          {/* Close Button - Gallery Style (Only visible when full screen) */}
          {isFullScreen && (
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[110]"
              onClick={(e) => { e.stopPropagation(); setIsFullScreen(false); }}
            >
              <X className="w-8 h-8" />
            </button>
          )}
          
          {/* Card Container Wrapper 
              We use 'transform scale' to make the 320px card look huge in modal mode 
              without changing the actual canvas dimensions (which would blur it).
          */}
          <div className={`
             relative transition-all duration-500
             ${isFullScreen ? 'scale-110 md:scale-125 lg:scale-[1.4]' : 'w-[320px] h-[480px] mx-auto perspective-1000 group'}
          `}>
            
            <div 
              className={`
                relative w-[320px] h-[480px] bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl transition-transform duration-500 transform
                ${!isFullScreen && 'group-hover:rotate-y-6 group-hover:rotate-x-6'}
              `}
              // Allow clicking the card itself to trigger full screen if not already
              onClick={() => !isFullScreen && setIsFullScreen(true)}
            >
              
              {/* --- CARD CONTENT STARTS HERE (Your existing logic) --- */}

              {/* OPTION 3: CSS BACKGROUND */}
              <div className="absolute inset-0 transition-all duration-500" style={getCssBackground()}></div>

              {/* OPTION 2: CANVAS PROCEDURAL BACKGROUND */}
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full z-0"
              />
              {/* Foreground debris layer (shatter only) */}
              <canvas 
                ref={foregroundCanvasRef} 
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
              />
              
              {/* User Uploaded Image */}
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="absolute inset-0 w-full h-full object-cover z-10 mix-blend-normal" 
                  style={enableGlow ? {
                    filter: `drop-shadow(0 0 ${20 * (glowOpacity / 100)}px ${glowColor === 'primary' ? colors.primary : colors.secondary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')}) drop-shadow(0 0 ${40 * (glowOpacity / 100)}px ${glowColor === 'primary' ? colors.primary : colors.secondary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')})`
                  } : undefined}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <p className="text-white/20 text-4xl font-black font-['Teko'] uppercase -rotate-12 select-none">
                    {backgroundStyle}
                  </p>
                </div>
              )}
              
              {/* Effects Overlays */}
              <div 
                  className="absolute inset-0 z-20 opacity-60 pointer-events-none"
                  style={{ background: `linear-gradient(to top, #0f172a 0%, transparent 40%, ${colors.secondary}10 100%)` }}
              ></div>
              
              <div 
                  className="absolute inset-0 z-30 border-[12px] rounded-xl pointer-events-none mix-blend-overlay opacity-50"
                  style={{ borderColor: colors.primary }}
              ></div>
              
              <div className="absolute inset-0 z-40 card-shine opacity-30 pointer-events-none"></div>

              {/* Text Content */}
              <div className="absolute bottom-6 left-4 right-4 z-50">
                <div className="flex justify-between items-end border-b border-white/30 pb-2 mb-2">
                   <div>
                      <p 
                        className="font-bold tracking-widest text-sm font-['Teko'] uppercase drop-shadow-md"
                        style={{ color: colors.primary }}
                      >
                        {details.team || 'TEAM NAME'}
                      </p>
                      <h1 className="text-4xl font-['Teko'] font-bold text-white leading-none italic uppercase drop-shadow-lg">{details.name || 'PLAYER NAME'}</h1>
                   </div>
                   <div className="text-5xl font-['Teko'] text-white font-bold opacity-40 outline-text drop-shadow-lg">
                      {details.number || '00'}
                   </div>
                </div>
                
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                  <span>{details.position || 'POS'}</span>
                  <span style={{color: colors.secondary}}>{backgroundStyle.toUpperCase()} ED.</span>
                </div>

                <p className="text-[10px] text-gray-300 leading-tight line-clamp-3 drop-shadow-sm">
                  {details.bio || "Stats and legendary moments go here. Generated by AI or written by you."}
                </p>
              </div>
              
              {/* Top Badge */}
              <div className="absolute top-4 right-4 z-50">
                 <div 
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center bg-slate-900/80 backdrop-blur shadow-lg"
                    style={{ borderColor: colors.primary }}
                >
                    <div 
                        className="font-bold text-xs text-center leading-none"
                        style={{ color: colors.primary }}
                    >
                       PRO<br/>CARD
                    </div>
                 </div>
              </div>
              {/* Border Frame Overlay */}
{enableBorder && (
  <BorderFrame 
    style={borderStyle} 
    primaryColor={colors.primary} 
    secondaryColor={colors.secondary} 
  />
)}
               {/* --- END CARD CONTENT --- */}

               {/* "Click to Expand" Icon Overlay (Gallery Style) */}
               {!isFullScreen && (
                  <div className="absolute top-3 left-3 z-50 p-1.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
               )}

            </div>
            
            {/* Reflection underneath (Hidden in full screen) */}
            {!isFullScreen && (
               <div className="absolute -bottom-8 left-4 right-4 h-4 bg-black/50 blur-xl rounded-[100%]"></div>
            )}
          </div>

          {!isFullScreen && (
            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
               <div>
                  <h4 className="text-yellow-400 font-bold text-sm">Pro Tip</h4>
                  <p className="text-yellow-200/60 text-xs">Upload a photo with a transparent background (PNG) for the best "cutout" effect, or let our designers handle the masking manually.</p>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderForm;