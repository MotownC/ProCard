import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Wand2, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import { PlayerDetails } from '../types';
import { generatePlayerBio } from '../services/geminiService';

// Define the available background styles
const BACKGROUND_STYLES = [
  { id: 'classic', name: 'Classic Fade', type: 'css' },
  { id: 'cyber', name: 'Cyber Grid', type: 'canvas' },
  { id: 'velocity', name: 'Velocity', type: 'canvas' },
  { id: 'hex', name: 'Hex Tech', type: 'css' },
  { id: 'shatter', name: 'Shatter', type: 'canvas' },
  { id: 'energy', name: 'Energy', type: 'canvas' },
  { id: 'splatter', name: 'Splatter', type: 'canvas' }, // Replaced Circuit with Splatter
  { id: 'hurricane', name: 'Hurricane', type: 'canvas' }, // Added Hurricane
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
  const [enableGlow, setEnableGlow] = useState(false); 
  const [glowOpacity, setGlowOpacity] = useState(100);
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
    const bio = await generatePlayerBio(details);
    setDetails(prev => ({ ...prev, bio }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Prototype: Order submitted! In a real app, this would process payment and upload to storage.");
  };

  // --- OPTION 2: PROCEDURAL GENERATION LOGIC ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 480 * dpr;
    ctx.scale(dpr, dpr); 
    
    // Clear
    ctx.clearRect(0, 0, 320, 480);

    // Helper: Hex to RGBA
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const rng = (min: number, max: number) => Math.random() * (max - min) + min;

    // --- GENERATORS ---

    if (backgroundStyle === 'shatter') {
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

      // 2. Background Shards (Darker/Distant) - Increased Density
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        const x = rng(0, 320);
        const y = rng(0, 480);
        const s = rng(15, 50);
        ctx.moveTo(x, y);
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.fillStyle = i % 2 === 0 ? hexToRgba(colors.primary, 0.03) : hexToRgba(colors.secondary, 0.03);
        ctx.fill();
      }

      // 3. Foreground High-Energy Shards - Increased Density & Sharpness
      ctx.shadowBlur = 10;
      for (let i = 0; i < 90; i++) {
        ctx.beginPath();
        const x = rng(-50, 370);
        const y = rng(-50, 530);
        
        ctx.moveTo(x, y);
        const s = rng(5, 70);
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.closePath();

        const isPrimary = Math.random() > 0.4;
        ctx.fillStyle = hexToRgba(isPrimary ? colors.primary : colors.secondary, rng(0.1, 0.35));
        ctx.shadowColor = isPrimary ? colors.primary : colors.secondary;
        ctx.fill();
        
        // Highlight edges
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();
      }

      // 4. Dust/Debris
      for(let i=0; i<150; i++) {
          ctx.beginPath();
          ctx.arc(rng(0,320), rng(0,480), rng(0.5, 1.5), 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
      }
    } 
    else if (backgroundStyle === 'energy') {
      // Deep space background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 320, 480);

      // Glowing Center
      const centerGlow = ctx.createRadialGradient(160, 240, 0, 160, 240, 300);
      centerGlow.addColorStop(0, hexToRgba(colors.primary, 0.2));
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0,0, 320, 480);

      // Fractal Lightning
      const drawBolt = (x1: number, y1: number, x2: number, y2: number, width: number, color: string, depth: number = 0) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (depth > 6 || dist < 10) {
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

        drawBolt(x1, y1, jX, jY, width, color, depth + 1);
        drawBolt(jX, jY, x2, y2, width, color, depth + 1);

        if (Math.random() > 0.7 && depth < 4) {
            const bx = jX + (Math.random() - 0.5) * dist * 0.7;
            const by = jY + (Math.random() - 0.5) * dist * 0.7;
            drawBolt(jX, jY, bx, by, width * 0.5, hexToRgba(color, 0.7), depth + 1);
        }
      };

      // Main Bolts
      drawBolt(160, 0, 160, 480, 3, colors.primary);
      drawBolt(50, 0, 100, 480, 2, colors.secondary);
      drawBolt(270, 0, 220, 480, 2, colors.secondary);

      // Static Particles
      for(let i=0; i<60; i++) {
          ctx.beginPath();
          ctx.arc(rng(0, 320), rng(0, 480), rng(0.5, 2), 0, Math.PI*2);
          ctx.fillStyle = Math.random() > 0.5 ? colors.primary : '#fff';
          ctx.shadowBlur = 5;
          ctx.shadowColor = colors.primary;
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
        const drawPaintball = (cx: number, cy: number, radius: number, color: string) => {
            ctx.fillStyle = color;
            
            // Core Impact (Irregular Blob)
            ctx.beginPath();
            for(let i=0; i<Math.PI*2; i+=0.1) {
                const r = radius * (0.7 + Math.random() * 0.6); 
                ctx.lineTo(cx + Math.cos(i)*r, cy + Math.sin(i)*r);
            }
            ctx.fill();

            // High velocity spray rays
            const rays = 15 + Math.random() * 20;
            for(let i=0; i<rays; i++) {
                const angle = Math.random() * Math.PI * 2;
                const len = radius * (3 + Math.random() * 6); // Very long streaks
                
                ctx.beginPath();
                // Start near center
                ctx.moveTo(cx + Math.cos(angle)*radius*0.5, cy + Math.sin(angle)*radius*0.5);
                const endx = cx + Math.cos(angle) * len;
                const endy = cy + Math.sin(angle) * len;
                
                // Tapered line
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
                
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle)*dist, cy + Math.sin(angle)*dist, size, 0, Math.PI*2);
                ctx.fill();
            }
        };

        // Helper: Aggressive Brush Stroke
        const drawPowerStroke = (x1: number, y1: number, x2: number, y2: number, color: string, thickness: number) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            ctx.save();
            ctx.translate(x1, y1);
            ctx.rotate(angle);
            
            // Draw many "bristles" lines
            const bristles = thickness * 3;
            for(let i=0; i<bristles; i++) {
                const offset = (Math.random() - 0.5) * thickness;
                const lengthFactor = 0.5 + Math.random() * 0.7; 
                const currentLen = dist * lengthFactor;
                
                ctx.globalAlpha = 0.4 + Math.random() * 0.6;
                ctx.lineWidth = 0.5 + Math.random() * 2.5;
                ctx.strokeStyle = color;

                ctx.beginPath();
                ctx.moveTo(0, offset);
                // Slight curve to simulate wrist motion and bristle drag
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
        drawPowerStroke(-80, 80, 380, 450, hexToRgba(colors.secondary, 0.35), 140);
        drawPowerStroke(380, -80, -80, 520, hexToRgba(colors.primary, 0.25), 160);

        // 2. Main Paintball Impacts (Cluster around player area)
        for(let i=0; i<7; i++) {
            const x = rng(40, 280);
            const y = rng(80, 400);
            const color = Math.random() > 0.4 ? colors.primary : colors.secondary;
            drawPaintball(x, y, rng(10, 30), color);
        }
        
        // 3. White contrast splatters (Highlights)
        drawPaintball(rng(20,300), rng(20,460), rng(4, 12), '#ffffff');
        drawPaintball(rng(20,300), rng(20,460), rng(4, 12), '#ffffff');
        drawPaintball(rng(20,300), rng(20,460), rng(4, 12), '#ffffff');

        // 4. Foreground Swipe (Across the bottom/middle)
        drawPowerStroke(-40, 320, 360, 240, hexToRgba(colors.primary, 0.85), 50);
        
        // 5. Drips (Gravity)
        for(let i=0; i<15; i++) {
            const x = rng(0, 320);
            const y = rng(0, 400);
            const w = rng(1.5, 4);
            const h = rng(60, 180);
            
            ctx.fillStyle = Math.random()>0.5 ? colors.primary : colors.secondary;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.arc(x + w/2, y + h, w, 0, Math.PI*2); // Drop at end
            ctx.fill();
        }
    }
    else if (backgroundStyle === 'velocity') {
      // Speed base
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 320, 480);

      for (let i = 0; i < 150; i++) {
        const x = rng(-150, 470);
        const y = rng(-150, 630);
        const length = rng(50, 300);
        const angle = 60 * (Math.PI / 180);

        const grad = ctx.createLinearGradient(x, y, x + Math.cos(angle)*length, y + Math.sin(angle)*length);
        const color = i % 4 === 0 ? colors.secondary : colors.primary;
        
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, hexToRgba(color, rng(0.1, 0.8)));
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = rng(1, 3);
        ctx.stroke();
      }
      
      for(let i=0; i<50; i++){
          ctx.beginPath();
          ctx.arc(rng(0,320), rng(0,480), rng(0.5, 1.5), 0, Math.PI*2);
          ctx.fillStyle = '#fff';
          ctx.fill();
      }
    }
    else if (backgroundStyle === 'cyber') {
      // Perspective Grid
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 320, 480);

      const horizonY = 280;
      const grad = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 80);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, hexToRgba(colors.secondary, 0.8));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizonY - 50, 320, 130);

      ctx.strokeStyle = hexToRgba(colors.primary, 0.6);
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.primary;

      const centerX = 160;
      for (let x = -400; x <= 720; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 480);
          ctx.lineTo(centerX + (x - centerX) * 0.15, horizonY);
          ctx.stroke();
      }

      let y = 480;
      while (y > horizonY + 5) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(320, y);
          ctx.stroke();
          const dist = y - horizonY;
          const step = Math.max(2, dist * 0.2); 
          y -= step;
      }
      
      const sunGrad = ctx.createLinearGradient(0, horizonY - 80, 0, horizonY + 20);
      sunGrad.addColorStop(0, colors.secondary);
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(160, horizonY - 30, 50, 0, Math.PI, true);
      ctx.fill();
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
      eye.addColorStop(0, hexToRgba(colors.primary, 0.3));
      eye.addColorStop(1, 'transparent');
      ctx.fillStyle = eye;
      ctx.fillRect(0, 0, 320, 480);

      const cx = 160;
      const cy = 240;
      const maxR = 400;

      // 1. Draw Cloud Wall Particles (Dense)
      for(let i=0; i<500; i++) {
          const r = rng(20, maxR); // Start closer to eye
          const theta = rng(0, Math.PI*2);
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          
          ctx.beginPath();
          ctx.arc(x, y, rng(5, 25), 0, Math.PI*2);
          // Vary opacity based on distance to create depth
          const alpha = 0.02 + (1 - r/maxR) * 0.06;
          ctx.fillStyle = hexToRgba(i%2===0 ? colors.primary : colors.secondary, alpha);
          ctx.fill();
      }

      // 2. Draw Swirling Arms (More defined)
      for (let i = 0; i < 700; i++) {
        const r = Math.pow(Math.random(), 0.7) * maxR;
        const armIndex = i % 3;
        const spiralOffset = r * 0.025; // Tighter spiral
        const theta = (armIndex * (Math.PI * 2 / 3)) + spiralOffset + (Math.random() - 0.5) * 0.6;

        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;

        const trailTheta = theta - 0.2;
        const tx = cx + Math.cos(trailTheta) * (r + 5); 
        const ty = cy + Math.sin(trailTheta) * (r + 5);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (tx-x)/2, y + (ty-y)/2, tx, ty);
        
        ctx.strokeStyle = Math.random() > 0.6 
            ? hexToRgba(colors.primary, rng(0.2, 0.6)) 
            : hexToRgba(colors.secondary, rng(0.2, 0.6));
        
        ctx.lineWidth = rng(0.5, 3);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 3. Storm Lightning (Crackles inside the arms)
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
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = colors.primary;
          ctx.stroke();
      }
    }

  }, [backgroundStyle, colors]);


  // Helper for CSS styles (Option 3)
  const getCssBackground = () => {
    switch (backgroundStyle) {
      case 'classic':
        return { background: `linear-gradient(135deg, ${colors.primary} 0%, #0f172a 60%, ${colors.secondary} 100%)` };
      case 'hex':
        return {
          backgroundColor: '#111',
          backgroundImage: `
            radial-gradient(circle at 50% 0%, ${colors.primary}60, transparent 60%),
            repeating-linear-gradient(60deg, ${colors.secondary}10 0px, ${colors.secondary}10 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-60deg, ${colors.secondary}10 0px, ${colors.secondary}10 1px, transparent 1px, transparent 20px)
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
          background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${glowOpacity}%, #334155 ${glowOpacity}%, #334155 100%)`
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
        <div className="lg:sticky lg:top-24">
          <div className="text-center mb-6">
             <span className="bg-slate-800 text-gray-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider border border-slate-700">LIVE PREVIEW</span>
          </div>
          
          <div className="relative w-[320px] h-[480px] mx-auto perspective-1000 group">
            <div className="relative w-full h-full bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl transition-transform duration-500 transform group-hover:rotate-y-6 group-hover:rotate-x-6">
              
              {/* OPTION 3: CSS BACKGROUND */}
              <div className="absolute inset-0 transition-all duration-500" style={getCssBackground()}></div>

              {/* OPTION 2: CANVAS PROCEDURAL BACKGROUND */}
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full z-0"
              />

              {/* User Uploaded Image (Layered on top) */}
              {/* User Uploaded Image (Layered on top) */}
{imagePreview ? (
  <img 
    src={imagePreview} 
    alt="Preview" 
    className="absolute inset-0 w-full h-full object-cover z-10 mix-blend-normal" 
    style={enableGlow ? {
      filter: `drop-shadow(0 0 ${20 * (glowOpacity / 100)}px ${colors.primary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')}) drop-shadow(0 0 ${40 * (glowOpacity / 100)}px ${colors.primary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')})`
    } : undefined}
  />
) : (
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <p className="text-white/20 text-4xl font-black font-['Teko'] uppercase -rotate-12 select-none">
      {backgroundStyle}
    </p>
  </div>
)}
              
              {/* Effects Overlays (On top of image) */}
              <div 
                  className="absolute inset-0 z-20 opacity-60 pointer-events-none"
                  style={{ background: `linear-gradient(to top, #0f172a 0%, transparent 40%, ${colors.secondary}10 100%)` }}
              ></div>
              
              {/* Dynamic Colored Border Overlay */}
              <div 
                  className="absolute inset-0 z-30 border-[12px] rounded-xl pointer-events-none mix-blend-overlay opacity-50"
                  style={{ borderColor: colors.primary }}
              ></div>
              
              {/* Shine */}
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

            </div>
            
            {/* Reflection underneath */}
            <div className="absolute -bottom-8 left-4 right-4 h-4 bg-black/50 blur-xl rounded-[100%]"></div>
          </div>

          <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
             <div>
                <h4 className="text-yellow-400 font-bold text-sm">Pro Tip</h4>
                <p className="text-yellow-200/60 text-xs">Upload a photo with a transparent background (PNG) for the best "cutout" effect, or let our designers handle the masking manually.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderForm;