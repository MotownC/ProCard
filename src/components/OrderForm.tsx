import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Layers, Maximize2, X } from 'lucide-react';

// Player Details Interface
export interface PlayerDetails {
  name: string;
  team: string;
  position: string;
  number: string;
  sport: string;
}

// Generate color variants for richer designs
const getColorVariants = (hexColor: string) => {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
    return {
      lighter2: '#ffffff',
      lighter1: '#cccccc',
      base: '#888888',
      darker1: '#444444',
      darker2: '#000000'
    };
  }

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
  // 1. UPDATED TECH FRAME (Full Height + Overlap)
  if (style === 'tech-frame') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <pattern id="techCarbon" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#111" />
            <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#222" strokeWidth="1.5" />
          </pattern>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="silverBevel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#777', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#fff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#777', stopOpacity: 1 }} />
          </linearGradient>
          <radialGradient id="hexGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#444', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
          </radialGradient>
        </defs>
        
        {/* MAIN BODY - Extended slightly outside 0-480 to prevent gaps */}
        <path 
          d="M -2,-2 H 322 V 482 H -2 Z M 20,20 L 300,20 L 305,150 L 265,240 L 305,330 L 300,460 L 20,460 L 15,330 L 55,240 L 15,150 Z" 
          fill="url(#techCarbon)" 
          fillRule="evenodd"
          stroke="none"
        />

        {/* SILVER BEVEL */}
        <path 
          d="M 20,20 L 300,20 L 305,150 L 265,240 L 305,330 L 300,460 L 20,460 L 15,330 L 55,240 L 15,150 Z"
          fill="none" stroke="url(#silverBevel)" strokeWidth="3"
        />

        {/* GLOW BARS */}
        <path d="M -2,130 L 35,240 L -2,350" fill="none" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)"/>
        <path d="M 322,130 L 285,240 L 322,350" fill="none" stroke={secondaryColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)"/>

        {/* HEXAGONS */}
        <g transform="translate(35, 240)">
          <polygon points="-9,-15 9,-15 17,0 9,15 -9,15 -17,0" fill="url(#hexGrad)" stroke={primaryColor} strokeWidth="2"/>
          <circle cx="0" cy="0" r="4" fill={primaryColor} filter="url(#lineGlow)" />
        </g>
        <g transform="translate(285, 240)">
          <polygon points="-9,-15 9,-15 17,0 9,15 -9,15 -17,0" fill="url(#hexGrad)" stroke={secondaryColor} strokeWidth="2"/>
          <circle cx="0" cy="0" r="4" fill={secondaryColor} filter="url(#lineGlow)" />
        </g>
      </svg>
    );
  }
  
 // 4. UPDATED CHROME-METAL (Squared/90° Top Corners)
  if (style === 'chrome-metal') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          {/* Armor Plate Gradient */}
          <linearGradient id="brushedWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e6e6e6', stopOpacity: 1 }} />
            <stop offset="20%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#d4d4d4', stopOpacity: 1 }} />
            <stop offset="45%" style={{ stopColor: '#a0a0a0', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="80%" style={{ stopColor: '#dcdcdc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#b0b0b0', stopOpacity: 1 }} />
          </linearGradient>

          {/* Micro-Grid for White Armor */}
          <pattern id="microGrid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="none" />
            <circle cx="2" cy="2" r="0.5" fill="#000" opacity="0.4" />
          </pattern>

          {/* Dark Gunmetal Base */}
          <pattern id="darkTech" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#111" />
            <path d="M0,6 L6,0" stroke="#222" strokeWidth="1" />
          </pattern>

          {/* Honeycomb Pattern */}
          <pattern id="hexOverlay" x="0" y="0" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(1.6)">
             <path d="M5 0L10 2.89V8.66L5 11.55L0 8.66V2.89L5 0Z" fill="none" stroke="#333" strokeWidth="1" />
          </pattern>

          {/* Filters */}
          <filter id="pipingGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="plateShadow">
             <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
          </filter>

          {/* Path Definitions */}
          
          {/* Side Armor Plates (Unchanged) */}
          <path id="leftArmorPath" d="M -10,75 L 25,105 L 25,280 L 45,295 L 45,345 L 25,360 L 25,445 L -10,475 Z" />
          <path id="rightArmorPath" d="M 330,5 L 295,35 L 295,90 L 275,105 L 275,155 L 295,170 L 295,375 L 330,405 Z" />
          
          {/* Base Shapes - UPDATED TO 90 DEGREE CORNERS */}
          
          {/* Top Left: Square Step Down */}
          <path id="topLeftBase" d="M -5,-5 H 80 V 25 H 20 V 90 H -5 Z" />
          
          {/* Top Right: Square Step Down */}
          <path id="topRightBase" d="M 325,-5 H 240 V 25 H 300 V 90 H 325 Z" />
          
          {/* Top Center: Solid Rectangle */}
          <path id="topCenterBase" d="M 75,-5 H 245 V 20 H 75 Z" />
          
          {/* Bottom Shape (Existing) */}
          <path id="bottomBase" d="M -5,485 H 325 V 465 L 290,455 H 30 L -5,465 Z" />
          
          {/* Side Fillers */}
          <rect id="leftSideFill" x="-5" y="0" width="20" height="480" />
          <rect id="rightSideFill" x="305" y="0" width="20" height="480" />
        </defs>

        {/* LAYER 1: CHASSIS BASE */}
        <g>
            <use href="#leftSideFill" fill="url(#darkTech)" />
            <use href="#rightSideFill" fill="url(#darkTech)" />
            <use href="#topLeftBase" fill="url(#darkTech)" />
            <use href="#topRightBase" fill="url(#darkTech)" />
            <use href="#topCenterBase" fill="url(#darkTech)" />
            <use href="#bottomBase" fill="url(#darkTech)" />
            
            <use href="#leftSideFill" fill="url(#hexOverlay)" />
            <use href="#rightSideFill" fill="url(#hexOverlay)" />
            <use href="#topLeftBase" fill="url(#hexOverlay)" />
            <use href="#topRightBase" fill="url(#hexOverlay)" />
            <use href="#topCenterBase" fill="url(#hexOverlay)" />
            <use href="#bottomBase" fill="url(#hexOverlay)" />
        </g>

        {/* LAYER 2: LEFT ARMOR PLATE */}
        <g filter="url(#plateShadow)">
            <use href="#leftArmorPath" fill="url(#brushedWhite)" stroke="#000" strokeWidth="1" />
            <use href="#leftArmorPath" fill="url(#microGrid)" opacity="0.3" pointerEvents="none" />
            <path d="M 15,115 L 15,275 L 35,290 L 35,350 L 15,365 L 15,420" fill="none" stroke={primaryColor} strokeWidth="2" filter="url(#pipingGlow)" />
            <g fill="#222">
                <rect x="5" y="135" width="10" height="4" />
                <rect x="5" y="145" width="10" height="4" />
                <rect x="5" y="155" width="10" height="4" />
            </g>
        </g>

        {/* LAYER 3: RIGHT ARMOR PLATE */}
        <g filter="url(#plateShadow)">
            <use href="#rightArmorPath" fill="url(#brushedWhite)" stroke="#000" strokeWidth="1" />
            <use href="#rightArmorPath" fill="url(#microGrid)" opacity="0.3" pointerEvents="none" />
            <path d="M 305,45 L 305,85 L 285,100 L 285,160 L 305,175 L 305,360" fill="none" stroke={secondaryColor} strokeWidth="2" filter="url(#pipingGlow)" />
            <g fill="#222">
                <rect x="305" y="330" width="10" height="4" />
                <rect x="305" y="340" width="10" height="4" />
                <rect x="305" y="350" width="10" height="4" />
            </g>
        </g>

        {/* LAYER 4: ACCENTS */}
        <rect x="70" y="16" width="180" height="2" fill={primaryColor} filter="url(#pipingGlow)" />
        <rect x="40" y="468" width="240" height="4" fill="#111" stroke="#333" />
        <rect x="120" y="470" width="80" height="2" fill={secondaryColor} filter="url(#pipingGlow)" />

        <line x1="50" y1="295" x2="50" y2="345" stroke={primaryColor} strokeWidth="3" opacity="0.8" filter="url(#pipingGlow)" />
        <line x1="270" y1="105" x2="270" y2="155" stroke={secondaryColor} strokeWidth="3" opacity="0.8" filter="url(#pipingGlow)" />

      </svg>
    );
  }
  
  // 3. CARBON FIBER (Notched & Armored)
  if (style === 'carbon-fiber') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <pattern id="carbonWeave" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#181818" />
            <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#2a2a2a" strokeWidth="1.5" />
          </pattern>
          <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#222', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#555', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#111', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="neonTube">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        
        <path d="M -10,-10 H 330 V 490 H -10 Z M 15,25 L 80,25 L 95,10 L 225,10 L 240,25 L 305,25 L 305,100 L 295,130 L 295,350 L 305,380 L 305,455 L 240,455 L 225,470 L 95,470 L 80,455 L 15,455 L 15,380 L 25,350 L 25,130 L 15,100 Z" fill="url(#carbonWeave)" fillRule="evenodd" stroke="#000" strokeWidth="2"/>

        <path d="M 305,25 L 240,25 L 225,10 L 95,10 L 80,25 L 15,25 L 15,100 L 25,130 L 25,350 L 15,380 L 15,455" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" filter="url(#neonTube)"/>
        <path d="M 15,455 L 80,455 L 95,470 L 225,470 L 240,455 L 305,455 L 305,380 L 295,350 L 295,130 L 305,100 L 305,25" fill="none" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" filter="url(#neonTube)"/>

        <path d="M -5,90 L 35,120 L 35,360 L -5,390 Z" fill="url(#plateGrad)" stroke="#444" strokeWidth="1"/>
        <path d="M 0,130 L 20,145 L 20,335 L 0,350" fill="#111" opacity="0.6" />
        <rect x="22" y="220" width="4" height="40" fill={primaryColor} filter="url(#neonTube)" />

        <path d="M 325,90 L 285,120 L 285,360 L 325,390 Z" fill="url(#plateGrad)" stroke="#444" strokeWidth="1"/>
        <path d="M 320,130 L 300,145 L 300,335 L 320,350" fill="#111" opacity="0.6" />
        <rect x="294" y="220" width="4" height="40" fill={secondaryColor} filter="url(#neonTube)" />

        <path d="M 15,25 L 45,25 L 35,35 L 15,35 Z" fill="#333" stroke="none" />
        <path d="M 305,25 L 275,25 L 285,35 L 305,35 Z" fill="#333" stroke="none" />
        <path d="M 15,455 L 45,455 L 35,445 L 15,445 Z" fill="#333" stroke="none" />
        <path d="M 305,455 L 275,455 L 285,445 L 305,445 Z" fill="#333" stroke="none" />
      </svg>
    );
  }
  
  if (style === 'neon-glow') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="10" y="10" width="300" height="460" fill="none" stroke={primaryColor} strokeWidth="3" filter="url(#neonGlow)" opacity="0.9"/>
        <rect x="15" y="15" width="290" height="450" fill="none" stroke={secondaryColor} strokeWidth="1.5" filter="url(#neonGlow)" opacity="0.7"/>
        <circle cx="30" cy="30" r="4" fill={primaryColor} filter="url(#neonGlow)"/>
        <circle cx="290" cy="30" r="4" fill={secondaryColor} filter="url(#neonGlow)"/>
        <circle cx="30" cy="450" r="4" fill={secondaryColor} filter="url(#neonGlow)"/>
        <circle cx="290" cy="450" r="4" fill={primaryColor} filter="url(#neonGlow)"/>
        <line x1="50" y1="12" x2="270" y2="12" stroke={primaryColor} strokeWidth="1" opacity="0.5"/>
        <line x1="50" y1="468" x2="270" y2="468" stroke={secondaryColor} strokeWidth="1" opacity="0.5"/>
      </svg>
    );
  }
  
  // 4. TITANIUM (REVERTED + ENHANCED CLAMPS)
  if (style === 'geometric') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <pattern id="titaniumMesh" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#151515" />
            <path d="M0,4 L4,0" stroke="#252525" strokeWidth="1" />
          </pattern>
          <pattern id="gunmetal" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#1a1a1a" />
            <rect width="3" height="6" fill="#262626" />
          </pattern>
          
          {/* Silver Frame Gradient */}
          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 1 }} />
            <stop offset="30%" style={{ stopColor: '#999', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#fff', stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: '#999', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#fff', stopOpacity: 1 }} />
          </linearGradient>

          {/* NEW: Gloss Sheen for Clamps */}
          <linearGradient id="glossSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
            <stop offset="40%" style={{ stopColor: 'rgba(255,255,255,0.1)' }} />
            <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.4)' }} />
            <stop offset="60%" style={{ stopColor: 'rgba(255,255,255,0.1)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </linearGradient>

          <filter id="dropShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.8"/>
          </filter>
          
          <filter id="ventGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* LAYER 0: BASE CHASSIS */}
        <path 
          d="
            M -2,-2 H 322 V 482 H -2 Z 
            M 20,20 
            L 100,20 L 115,35 L 205,35 L 220,20 
            L 300,20 
            L 300,100 L 270,130 L 270,350 L 300,380 
            L 300,460 
            L 220,460 L 205,445 L 115,445 L 100,460 
            L 20,460 
            L 20,380 L 50,350 L 50,130 L 20,100 
            Z
          " 
          fill="url(#gunmetal)" 
          fillRule="evenodd" 
          stroke="#000" 
          strokeWidth="1"
        />

        {/* LAYER 1: COLOR CORE */}
        <path d="M 15,15 L 100,15 L 115,30 L 205,30 L 220,15 L 305,15 L 305,100 L 275,130 L 275,350 L 305,380 L 305,465 L 220,465 L 205,450 L 115,450 L 100,465 L 15,465 L 15,380 L 45,350 L 45,130 L 15,100 Z" fill="none" stroke={primaryColor} strokeWidth="8" strokeLinejoin="round" filter="url(#dropShadow)"/>
        
        {/* LAYER 2: SILVER SKELETON */}
        <path d="M 10,10 L 105,10 L 120,25 L 200,25 L 215,10 L 310,10 L 310,105 L 280,135 L 280,345 L 310,375 L 310,470 L 215,470 L 200,455 L 120,455 L 105,470 L 10,470 L 10,375 L 40,345 L 40,135 L 10,105 Z" fill="none" stroke="url(#silverGrad)" strokeWidth="3" strokeLinecap="square"/>

        {/* LAYER 3: CORNER PLATES */}
        <path d="M 5,-2 L 80,-2 L 90,15 L 15,15 L 15,90 L 5,80 Z" fill="url(#titaniumMesh)" stroke="#555" strokeWidth="1" />
        <path d="M 315,-2 L 240,-2 L 230,15 L 305,15 L 305,90 L 315,80 Z" fill="url(#titaniumMesh)" stroke="#555" strokeWidth="1" />
        <path d="M 5,482 L 80,482 L 90,465 L 15,465 L 15,390 L 5,400 Z" fill="url(#titaniumMesh)" stroke="#555" strokeWidth="1" />
        <path d="M 315,482 L 240,482 L 230,465 L 305,465 L 305,390 L 315,400 Z" fill="url(#titaniumMesh)" stroke="#555" strokeWidth="1" />

        {/* LAYER 4: SIDE CLAMPS (Enhanced with Vents & Gloss) */}
        
        {/* Left Clamp Group */}
        <g>
            {/* Base Shape */}
            <polygon points="0,120 40,160 40,320 0,360" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
            
            {/* Glowing Vents */}
            <g fill={secondaryColor} filter="url(#ventGlow)">
                <rect x="5" y="200" width="10" height="4" transform="skewY(-10)" />
                <rect x="5" y="210" width="10" height="4" transform="skewY(-10)" />
                <rect x="5" y="220" width="10" height="4" transform="skewY(-10)" />
                
                <rect x="5" y="260" width="10" height="4" transform="skewY(10)" />
                <rect x="5" y="270" width="10" height="4" transform="skewY(10)" />
                <rect x="5" y="280" width="10" height="4" transform="skewY(10)" />
            </g>

            {/* Gloss Overlay */}
            <polygon points="0,120 40,160 40,320 0,360" fill="url(#glossSheen)" style={{ mixBlendMode: 'overlay' }} pointerEvents="none" />
        </g>

        {/* Right Clamp Group */}
        <g>
            {/* Base Shape */}
            <polygon points="320,120 280,160 280,320 320,360" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
            
            {/* Glowing Vents */}
            <g fill={secondaryColor} filter="url(#ventGlow)">
                <rect x="305" y="200" width="10" height="4" transform="skewY(10)" />
                <rect x="305" y="210" width="10" height="4" transform="skewY(10)" />
                <rect x="305" y="220" width="10" height="4" transform="skewY(10)" />
                
                <rect x="305" y="260" width="10" height="4" transform="skewY(-10)" />
                <rect x="305" y="270" width="10" height="4" transform="skewY(-10)" />
                <rect x="305" y="280" width="10" height="4" transform="skewY(-10)" />
            </g>

            {/* Gloss Overlay */}
            <polygon points="320,120 280,160 280,320 320,360" fill="url(#glossSheen)" style={{ mixBlendMode: 'overlay' }} pointerEvents="none" />
        </g>

        {/* LAYER 5: ACCENTS */}
        <line x1="35" y1="165" x2="35" y2="315" stroke={secondaryColor} strokeWidth="2" />
        <line x1="285" y1="165" x2="285" y2="315" stroke={secondaryColor} strokeWidth="2" />
        
        <path d="M 20,20 L 100,20 L 115,35 L 205,35 L 220,20 L 300,20 L 300,100 L 270,130 L 270,350 L 300,380 L 300,460 L 220,460 L 205,445 L 115,445 L 100,460 L 20,460 L 20,380 L 50,350 L 50,130 L 20,100 Z" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5"/>
      </svg>
    );
  }
  
  if (style === 'classic') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60 }} viewBox="0 0 320 480">
        <defs>
          <linearGradient id="classicBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ddd', stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: '#888', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#444', stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
        
        <rect x="8" y="8" width="304" height="464" fill="none" stroke="url(#classicBevel)" strokeWidth="10"/>
        <rect x="15" y="15" width="290" height="450" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.6"/>
        <rect x="18" y="18" width="284" height="444" fill="none" stroke={secondaryColor} strokeWidth="1" opacity="0.4"/>
        
        <line x1="25" y1="50" x2="25" y2="25" stroke={primaryColor} strokeWidth="3" opacity="0.8"/>
        <line x1="25" y1="25" x2="50" y2="25" stroke={primaryColor} strokeWidth="3" opacity="0.8"/>
        
        <line x1="295" y1="50" x2="295" y2="25" stroke={secondaryColor} strokeWidth="3" opacity="0.8"/>
        <line x1="295" y1="25" x2="270" y2="25" stroke={secondaryColor} strokeWidth="3" opacity="0.8"/>
        
        <line x1="25" y1="430" x2="25" y2="455" stroke={secondaryColor} strokeWidth="3" opacity="0.8"/>
        <line x1="25" y1="455" x2="50" y2="455" stroke={secondaryColor} strokeWidth="3" opacity="0.8"/>
        
        <line x1="295" y1="430" x2="295" y2="455" stroke={primaryColor} strokeWidth="3" opacity="0.8"/>
        <line x1="295" y1="455" x2="270" y2="455" stroke={primaryColor} strokeWidth="3" opacity="0.8"/>
      </svg>
    );
  }
  
  return null;
};

// Define the available background styles
const BACKGROUND_STYLES = [
  { id: 'classic', name: 'Classic Fade', type: 'css' },
  { id: 'classic-enhanced', name: 'Classic Enhanced', type: 'canvas' },
  { id: 'radar', name: 'Tech Radar', type: 'canvas' }, // Added Tech Radar
  { id: 'cyber', name: 'Cyber Grid', type: 'canvas' },
  { id: 'velocity', name: 'Velocity', type: 'canvas' },
  { id: 'hex', name: 'Hex Tech', type: 'css' },
  { id: 'shatter', name: 'Shatter', type: 'canvas' },
  { id: 'energy', name: 'Energy', type: 'canvas' },
  { id: 'splatter', name: 'Splatter', type: 'canvas' }, 
  { id: 'impact', name: 'Impact', type: 'canvas' },
  { id: 'hurricane', name: 'Hurricane', type: 'canvas' },
];

// Define available Border Styles
const BORDER_STYLES = [
  { id: 'tech-frame', name: 'Tech Frame' },
  { id: 'chrome-metal', name: 'Mecha Sport' }, // Renamed
  { id: 'carbon-fiber', name: 'Carbon Fiber' },
  { id: 'neon-glow', name: 'Neon Glow' },
  { id: 'geometric', name: 'Titanium' }, // Renamed
  { id: 'classic', name: 'Classic' },
];

const OrderForm: React.FC = () => {
  const [details, setDetails] = useState<PlayerDetails>({
    name: '',
    team: '',
    position: '',
    number: '',
    sport: 'Athlete'
  });
  
  const [colors, setColors] = useState({
    primary: '#22d3ee', // Cyan-400 default
    secondary: '#a855f7' // Purple-500 default
  });

  const [backgroundStyle, setBackgroundStyle] = useState('shatter');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [enableGlow, setEnableGlow] = useState(false); 
  const [glowOpacity, setGlowOpacity] = useState(100);
  const [glowColor, setGlowColor] = useState<'primary' | 'secondary'>('primary');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [enableBorder, setEnableBorder] = useState(false);
  const [borderStyle, setBorderStyle] = useState('tech-frame');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // 1. Calculate Font Size Helper
  const getNameFontSize = (name: string, baseRem = 2.25) => {
    if (!name) return `${baseRem}rem`;
    if (name.length <= 10) return `${baseRem}rem`;
    const scaleFactor = 10 / name.length;
    return `${Math.max(1, baseRem * scaleFactor)}rem`;
  };

  // 2. Define Chrome Gradient Style
  const chromeTextStyle = {
    background: 'linear-gradient(180deg, #FFFFFF 20%, #E0E0E0 45%, #888888 50%, #D0D0D0 55%, #F0F0F0 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 0px rgba(0,0,0,0.1))' // Subtle inner depth
  };

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
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Order submitted! In a real app, this would process payment and upload to storage.");
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
      const cx = 160;
      const cy = 240;

      // 1. BACKGROUND LAYER (Behind Player - ctx) -----------------------
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 350);
      grad.addColorStop(0, '#1a1a1a');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 480);

      // B. MASSIVE BACKGROUND PLATES (Updated for Darker/More Solid Look)
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        const x = rng(-50, 370);
        const y = rng(-50, 530);
        const s = rng(80, 250); 
        
        ctx.moveTo(x, y);
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
        
        // CHANGE: Increased opacity from 0.15 to 0.5 and 0.4 to make them darker/solid
        ctx.fillStyle = i % 2 === 0 
          ? pickVariant(primaryPalette, 0.5) 
          : pickVariant(secondaryPalette, 0.4);
        ctx.fill();
        
        // Made the outline slightly more visible to define the edges
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
      }
      // C. BACKGROUND SMOKE (Softened)
      // We use lower opacity (0.08) and larger radius to remove the "hard edge"
      ctx.globalCompositeOperation = 'screen'; 
      for(let i=0; i<80; i++) {
          const x = rng(20, 300); 
          const y = rng(100, 400); 
          const r = rng(40, 100); // Larger radius for softer blend
          
          const dustGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
          dustGrad.addColorStop(0, 'rgba(220, 220, 220, 0.08)'); // Very faint center
          dustGrad.addColorStop(0.4, pickVariant(primaryPalette, 0.03)); 
          dustGrad.addColorStop(1, 'rgba(0,0,0,0)'); // Fade to zero
          
          ctx.fillStyle = dustGrad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI*2);
          ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // D. Spiderweb Cracks
      ctx.beginPath();
      for(let i=0; i<12; i++) {
          const angle = (i / 12) * Math.PI * 2 + rng(-0.2, 0.2);
          ctx.moveTo(cx, cy);
          let currX = cx, currY = cy, dist = 0;
          while(dist < 300) {
            dist += rng(20, 60);
            currX += Math.cos(angle) * dist * 0.5 + rng(-5, 5);
            currY += Math.sin(angle) * dist * 0.5 + rng(-5, 5);
            ctx.lineTo(currX, currY);
          }
      }
      ctx.strokeStyle = pickVariant(primaryPalette, 0.4);
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. FOREGROUND LAYER (Overlays Player - fgCtx) ----------------------
      
      // A. FOREGROUND MIST (The "Running Through" Effect)
      // This draws subtle smoke ON TOP of the player (fgCtx)
      fgCtx.globalCompositeOperation = 'screen';
      for(let i=0; i<40; i++) {
          const x = rng(20, 300);
          const y = rng(250, 480); // Concentrated on lower body
          const r = rng(30, 80);
          
          const mistGrad = fgCtx.createRadialGradient(x, y, 0, x, y, r);
          mistGrad.addColorStop(0, 'rgba(220, 220, 220, 0.06)'); // Extremely subtle
          mistGrad.addColorStop(0.5, pickVariant(primaryPalette, 0.02));
          mistGrad.addColorStop(1, 'transparent');
          
          fgCtx.fillStyle = mistGrad;
          fgCtx.beginPath();
          fgCtx.arc(x, y, r, 0, Math.PI*2);
          fgCtx.fill();
      }
      fgCtx.globalCompositeOperation = 'source-over';

      // B. Center Overlay Shards (Transparent Glass)
      fgCtx.shadowBlur = 10;
      for (let i = 0; i < 8; i++) {
        const x = rng(50, 270);
        const y = rng(100, 400);
        const dist = Math.sqrt(Math.pow(x-160,2) + Math.pow(y-160,2));
        if(dist < 120) continue; 

        fgCtx.beginPath();
        fgCtx.moveTo(x, y);
        const s = rng(20, 60);
        fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
        fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
        
        const isPrimary = Math.random() > 0.5;
        fgCtx.fillStyle = isPrimary ? pickVariant(primaryPalette, 0.25) : pickVariant(secondaryPalette, 0.25);
        fgCtx.fill();
        
        fgCtx.strokeStyle = 'rgba(255,255,255,0.4)';
        fgCtx.lineWidth = 0.5;
        fgCtx.stroke();
      }

      // C. Perimeter Shards (Sides & Top)
      for (let i = 0; i < 60; i++) {
        let x, y;
        const zone = Math.random();
        if (zone < 0.33) { x = rng(-20, 50); y = rng(0, 480); } 
        else if (zone < 0.66) { x = rng(270, 340); y = rng(0, 480); } 
        else { x = rng(0, 320); y = rng(-20, 80); } 

        fgCtx.beginPath();
        fgCtx.moveTo(x, y);
        const s = rng(10, 40);
        fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
        fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
        
        const style = Math.random();
        if (style > 0.6) fgCtx.fillStyle = pickVariant(primaryPalette, 0.7);
        else if (style > 0.3) fgCtx.fillStyle = pickVariant(secondaryPalette, 0.7);
        else fgCtx.fillStyle = 'rgba(255,255,255,0.6)';
        
        fgCtx.fill();
        fgCtx.strokeStyle = 'rgba(0,0,0,0.2)'; 
        fgCtx.lineWidth = 0.5;
        fgCtx.stroke();
      }
      fgCtx.shadowBlur = 0;

      // D. Large Glass Lens
      for(let i=0; i<8; i++) {
          const x = rng(0, 320);
          const y = rng(0, 480);
          if (Math.abs(x - 160) < 100 && Math.abs(y - 200) < 100) continue;

          const s = rng(50, 100);
          fgCtx.beginPath();
          fgCtx.moveTo(x, y);
          fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
          fgCtx.lineTo(x + rng(-s, s), y + rng(-s, s));
          
          fgCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          fgCtx.fill();
          fgCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          fgCtx.lineWidth = 0.5;
          fgCtx.stroke();
      }
      
      // E. Texture Specks
      for(let i=0; i<250; i++) {
          const x = rng(0, 320);
          const y = rng(0, 480);
          fgCtx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
          fgCtx.globalAlpha = rng(0.3, 0.7);
          fgCtx.fillRect(x, y, rng(1,2), rng(1,2));
      }
      fgCtx.globalAlpha = 1;
    }
    else if (backgroundStyle === 'radar') {
      const cx = 160;
      const cy = 200;

      // 1. Deep Mixed Background
      // Blend both colors for the deep base so it doesn't look flat
      const baseGrad = ctx.createLinearGradient(0, 0, 320, 480);
      baseGrad.addColorStop(0, pickVariant(primaryPalette, 0.15));
      baseGrad.addColorStop(1, pickVariant(secondaryPalette, 0.1)); // Hint of secondary
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 320, 480);

      // 2. The "Energy Core" Gradient
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 350);
      coreGrad.addColorStop(0, pickVariant(primaryPalette, 0.3)); 
      coreGrad.addColorStop(0.5, pickVariant(secondaryPalette, 0.1)); // Secondary glow
      coreGrad.addColorStop(1, '#020202');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, 320, 480);

      // 3. Tech Grid (Subtle Background)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for(let i=-200; i<600; i+=40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i-100, 480);
          ctx.stroke();
      }

      // 4. DENSE TECH RINGS (50/50 Split for Contrast)
      // Loop creates layers of background texture
      for(let r=20; r < 500; r+=rng(8, 20)) {
          ctx.beginPath();
          const startAngle = rng(0, Math.PI * 2);
          const endAngle = startAngle + rng(2, 5); 
          ctx.arc(cx, cy, r, startAngle, endAngle);
          
          // STRICT ALTERNATING COLORS for maximum contrast
          const isSecondary = Math.random() > 0.5;
          const palette = isSecondary ? secondaryPalette : primaryPalette;

          if (Math.random() > 0.6) {
              // Thick Translucent Bands
              ctx.strokeStyle = pickVariant(palette, 0.2);
              ctx.lineWidth = rng(15, 40);
          } else {
              // Thin Bright Lines
              ctx.strokeStyle = pickVariant(palette, 0.6);
              ctx.lineWidth = rng(1, 3);
              if(Math.random() > 0.5) ctx.setLineDash([rng(5, 20), rng(5, 10)]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
      }

      // 5. HIGH CONTRAST ARCS (The "Pop" Layer)
      // These are purely SECONDARY color to cut through the primary background
      ctx.shadowBlur = 15;
      ctx.shadowColor = colors.secondary;
      for(let i=0; i<12; i++) {
          const r = rng(80, 420);
          const width = rng(2, 6);
          const start = rng(0, Math.PI * 2);
          const end = start + rng(0.5, 1.5);
          
          ctx.beginPath();
          ctx.arc(cx, cy, r, start, end);
          ctx.strokeStyle = pickVariant(secondaryPalette, 1); // Full Opacity
          ctx.lineWidth = width;
          ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // 6. SOLID TECH WEDGES
      for(let i=0; i<6; i++) {
          const r = rng(150, 450);
          const width = rng(30, 80);
          const start = rng(0, Math.PI * 2);
          const end = start + rng(0.1, 0.3);
          
          ctx.beginPath();
          ctx.arc(cx, cy, r, start, end);
          // 70% chance of Secondary color here
          const palette = Math.random() > 0.3 ? secondaryPalette : primaryPalette;
          ctx.strokeStyle = pickVariant(palette, 0.2); 
          ctx.lineWidth = width;
          ctx.stroke();
          
          // Edge Highlight
          ctx.beginPath();
          ctx.arc(cx, cy, r + width/2, start, end);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
      }

      // 7. FLOATING DATA BLOCKS
      for(let i=0; i<25; i++) {
          const r = rng(60, 400);
          const theta = rng(0, Math.PI * 2);
          const w = rng(15, 50);
          const h = rng(6, 15);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(theta);
          
          // Force Secondary color on outer edges for contrast
          const palette = r > 250 ? secondaryPalette : primaryPalette;
          ctx.fillStyle = pickVariant(palette, 0.8);
          ctx.fillRect(r, -h/2, w, h);
          
          // Connector Line
          ctx.beginPath();
          ctx.moveTo(r+w, 0);
          ctx.lineTo(r+w+rng(20,60), 0);
          ctx.strokeStyle = pickVariant(palette, 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
      }

      // 8. ENERGY NODES (Bright dots at intersections)
      for(let i=0; i<15; i++) {
          const r = rng(50, 350);
          const theta = rng(0, Math.PI * 2);
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;

          ctx.beginPath();
          ctx.arc(x, y, rng(2, 5), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = colors.secondary;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // 9. NAMEPLATE BOX (Standard)
      const nameY = 355; 
      const nameHeight = 70;
      
      fgCtx.beginPath();
      fgCtx.moveTo(20, nameY); 
      fgCtx.lineTo(300, nameY); 
      fgCtx.lineTo(310, nameY + nameHeight); 
      fgCtx.lineTo(10, nameY + nameHeight); 
      fgCtx.closePath();
      
      fgCtx.fillStyle = '#ffffff';
      fgCtx.fill();
      fgCtx.strokeStyle = colors.secondary;
      fgCtx.lineWidth = 2;
      fgCtx.stroke();
      
      fgCtx.beginPath();
      fgCtx.moveTo(10, nameY + nameHeight);
      fgCtx.lineTo(310, nameY + nameHeight);
      fgCtx.lineTo(300, nameY + nameHeight + 25);
      fgCtx.lineTo(20, nameY + nameHeight + 25);
      fgCtx.fillStyle = '#1a1a1a';
      fgCtx.fill();
    }
    else if (backgroundStyle === 'classic-enhanced') {
      // ... existing classic-enhanced logic ...
      const baseGrad = ctx.createLinearGradient(0, 0, 320, 480);
      baseGrad.addColorStop(0, primaryPalette.base);
      baseGrad.addColorStop(0.4, primaryPalette.darker1);
      baseGrad.addColorStop(0.6, secondaryPalette.darker1);
      baseGrad.addColorStop(1, secondaryPalette.base);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 320, 480);

      const radialGrad = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
      radialGrad.addColorStop(0, pickVariant(primaryPalette, 0.2));
      radialGrad.addColorStop(0.5, 'transparent');
      radialGrad.addColorStop(1, pickVariant(secondaryPalette, 0.3));
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, 320, 480);

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

      ctx.globalAlpha = 0.05;
      for(let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(Math.random() * 320, Math.random() * 480, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    // ... rest of the styles ...
    else if (backgroundStyle === 'energy') {
      // ... existing energy logic ...
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 320, 480);

      const centerGlow = ctx.createRadialGradient(160, 240, 0, 160, 240, 300);
      centerGlow.addColorStop(0, pickVariant(primaryPalette, 0.3));
      centerGlow.addColorStop(0.5, pickVariant(primaryPalette, 0.15));
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0,0, 320, 480);

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

      drawBolt(-50, 0, 220, 480, 3, primaryPalette);           
      drawBolt(370, 0, 100, 480, 3, primaryPalette);           
      drawBolt(50, -50, 160, 300, 2.5, secondaryPalette);      
      drawBolt(270, -50, 160, 300, 2.5, secondaryPalette);     
      drawBolt(160, 180, 20, 480, 2, primaryPalette);          
      drawBolt(160, 180, 300, 480, 2, primaryPalette);         
      
      drawBolt(0, 240, 320, 240, 2, secondaryPalette);         
      drawBolt(160, 0, 80, 480, 2.5, primaryPalette);          
      drawBolt(160, 0, 240, 480, 2.5, secondaryPalette);       

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
      const cx = 160;
      const cy = 220;

      // 1. STADIUM ATMOSPHERE
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
      bgGrad.addColorStop(0, '#050505');
      bgGrad.addColorStop(0.6, '#1a1a1a'); 
      bgGrad.addColorStop(1, '#050505');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 320, 480);

      // A. Crowd
      for(let i=0; i<3000; i++) {
          const x = rng(0, 320);
          const y = rng(0, 300); 
          const s = rng(0.5, 1.5);
          const alpha = rng(0.05, 0.2);
          ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI*2);
          ctx.fill();
      }

      // B. Lights
      ctx.globalCompositeOperation = 'screen';
      for(let i=0; i<6; i++) {
          const x = i * (320/5) + rng(-20, 20);
          const y = rng(20, 80);
          const r = rng(30, 60);
          const lightGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
          lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          lightGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = lightGrad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI*2);
          ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // 2. ORGANIC EXPLOSION
      for(let i=0; i<25; i++) {
          const angle = rng(0, Math.PI * 2);
          const dist = rng(50, 250);
          const size = rng(10, 40);
          
          // REMOVED UNUSED X/Y CALCULATIONS HERE
          
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(dist/2, size, dist, 0); 
          ctx.quadraticCurveTo(dist/2, -size, 0, 0); 
          ctx.fillStyle = i % 2 === 0 ? pickVariant(primaryPalette, 0.8) : pickVariant(secondaryPalette, 0.8);
          ctx.shadowBlur = 20;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.restore();
      }
      ctx.shadowBlur = 0;

      // Sharp Shards
      for(let i=0; i<30; i++) {
          const angle = rng(0, Math.PI * 2);
          const len = rng(80, 300);
          const w = rng(2, 8);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(len, -w);
          ctx.lineTo(len * 0.9, 0);
          ctx.lineTo(len, w);
          ctx.fillStyle = i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? colors.primary : colors.secondary);
          ctx.fill();
          ctx.restore();
      }

      // 3. INNER FRAME LINES
      const pad = 20;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, pad + 40, 320 - (pad*2), 480 - (pad*2) - 110);
      
      // Accents
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pad - 2, 100, 4, 40);
      ctx.fillRect(320 - pad - 2, 100, 4, 40);

      // 4. FOREGROUND PARTICLES
      fgCtx.globalCompositeOperation = 'screen';
      for(let i=0; i<150; i++) {
          const x = rng(0, 320);
          const y = rng(0, 480);
          const s = rng(1, 3);
          const d = Math.sqrt(Math.pow(x-160,2) + Math.pow(y-180,2));
          if(d < 80) continue;
          fgCtx.fillStyle = Math.random() > 0.5 ? pickVariant(primaryPalette, 1) : '#ffffff';
          fgCtx.beginPath();
          fgCtx.arc(x, y, s, 0, Math.PI*2);
          fgCtx.fill();
      }
      fgCtx.globalCompositeOperation = 'source-over';
    }

    else if (backgroundStyle === 'velocity') {
      // 1. Dynamic Gradient Background (Diagonal)
      // Creates a sense of movement right from the base
      const bgGrad = ctx.createLinearGradient(0, 480, 320, 0);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.4, pickVariant(primaryPalette, 0.2));
      bgGrad.addColorStop(1, pickVariant(secondaryPalette, 0.15));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 320, 480);

      // Motion Settings
      const angle = 60 * (Math.PI / 180); // Diagonal Up-Right
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // 2. Background "Warp Grid"
      // Faint lines to give structure to the speed
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for(let i=-200; i<600; i+=40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 300 * cos, 480);
          ctx.stroke();
      }

      // 3. Dense Speed Lines (Layered for Depth)
      // We draw 300 lines of varying thickness and speed
      for (let i = 0; i < 300; i++) {
        const x = rng(-200, 500);
        const y = rng(-200, 680);
        const length = rng(50, 400);
        const speed = rng(0.5, 1.5); // Multiplier for thickness/opacity

        // Determine color based on "speed" (layer)
        let strokeColor;
        if (speed > 1.2) {
            strokeColor = '#ffffff'; // Top layer = White hot
        } else if (Math.random() > 0.5) {
            strokeColor = pickVariant(primaryPalette, 0.6 * speed);
        } else {
            strokeColor = pickVariant(secondaryPalette, 0.6 * speed);
        }

        // Gradient line for motion blur effect (fade out at tail)
        const lineGrad = ctx.createLinearGradient(x, y, x + cos*length, y + sin*length);
        lineGrad.addColorStop(0, 'transparent');
        lineGrad.addColorStop(0.5, strokeColor);
        lineGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cos * length, y + sin * length);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = speed * 2; // Thicker lines for faster layers
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      // 4. Floating Chevrons (The "Boost" Arrows)
      // Adds geometric interest and direction
      for(let i=0; i<15; i++) {
          const x = rng(0, 300);
          const y = rng(0, 450);
          const size = rng(10, 30);
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle); // Rotate to match flow
          
          ctx.beginPath();
          // Draw ">>" shape
          ctx.moveTo(0, 0);
          ctx.lineTo(size/2, size/2);
          ctx.lineTo(0, size);
          ctx.moveTo(size/2, 0);
          ctx.lineTo(size, size/2);
          ctx.lineTo(size/2, size);
          
          ctx.strokeStyle = i % 2 === 0 ? pickVariant(primaryPalette, 0.8) : pickVariant(secondaryPalette, 0.8);
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
          ctx.restore();
      }
      ctx.shadowBlur = 0;
      
      // 5. High Velocity Particles (Stretched Dashes)
      for(let i=0; i<80; i++){
          const x = rng(0,320);
          const y = rng(0,480);
          const len = rng(5, 20);
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cos*len, y + sin*len);
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = rng(0.5, 1.5);
          ctx.globalAlpha = rng(0.3, 0.8);
          ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 6. Corner Vignette (Focus attention)
      const vig = ctx.createRadialGradient(160, 240, 150, 160, 240, 400);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vig;
      ctx.fillRect(0,0,320,480);
    }
    else if (backgroundStyle === 'cyber') {
      const horizonY = 180; // Horizon line for perspective

      // 1. Deep Digital Void Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
      bgGrad.addColorStop(0, '#020205'); // Deepest black-blue
      bgGrad.addColorStop(0.6, '#0a0f1e'); 
      bgGrad.addColorStop(1, pickVariant(primaryPalette, 0.15)); // Glow at bottom
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 320, 480);

      // 2. Perspective Grid (The Floor)
      ctx.lineWidth = 1;
      
      // Vertical converging lines
      for (let i = -300; i <= 620; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 480);
        const perspectiveFactor = (i - 160) * 0.15; 
        ctx.lineTo(160 + perspectiveFactor, horizonY);
        
        const lineGrad = ctx.createLinearGradient(0, 480, 0, horizonY);
        lineGrad.addColorStop(0, pickVariant(primaryPalette, 0.4));
        lineGrad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = lineGrad;
        ctx.stroke();
      }

      // Horizontal scan lines
      for (let i = 1; i <= 20; i++) {
        const t = i / 20;
        const y = horizonY + (480 - horizonY) * (t * t);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(320, y);
        
        const hGrad = ctx.createLinearGradient(0, 0, 320, 0);
        hGrad.addColorStop(0, 'transparent');
        hGrad.addColorStop(0.5, pickVariant(primaryPalette, 0.3));
        hGrad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = hGrad;
        ctx.stroke();
      }

      // 3. EXTENDED DIGITAL SKYSCRAPERS (Background)
      for(let i=0; i<35; i++) {
         const w = rng(15, 50);
         const h = rng(200, 500);
         const x = rng(-20, 340);
         
         if(Math.abs(x - 160) < 50) continue; 

         const topY = rng(-50, 100); 
         const bottomY = horizonY + rng(20, 100);
         
         const blockGrad = ctx.createLinearGradient(x, topY, x, bottomY);
         blockGrad.addColorStop(0, 'transparent');
         blockGrad.addColorStop(0.3, pickVariant(primaryPalette, 0.15));
         blockGrad.addColorStop(0.9, pickVariant(primaryPalette, 0.05));
         blockGrad.addColorStop(1, 'transparent');
         
         ctx.fillStyle = blockGrad;
         ctx.fillRect(x, topY, w, bottomY - topY);
         
         ctx.strokeStyle = pickVariant(primaryPalette, 0.2);
         ctx.lineWidth = 0.5;
         ctx.strokeRect(x, topY, w, bottomY - topY);
         
         if(Math.random() > 0.6) {
             const lightY = rng(topY + 50, bottomY - 50);
             ctx.fillStyle = pickVariant(secondaryPalette, 0.9);
             ctx.fillRect(x + rng(2, w-4), lightY, 2, rng(2, 10));
         }
      }

      // 4. Sky Data Streams
      ctx.lineWidth = 1;
      for(let i=0; i<15; i++) {
          const x = rng(0, 320);
          if(Math.abs(x - 160) < 40) continue;

          const top = rng(0, 100);
          const height = rng(50, 150);
          
          const streamGrad = ctx.createLinearGradient(0, top, 0, top+height);
          streamGrad.addColorStop(0, 'transparent');
          streamGrad.addColorStop(0.5, pickVariant(secondaryPalette, 0.3));
          streamGrad.addColorStop(1, 'transparent');
          
          ctx.strokeStyle = streamGrad;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, top+height);
          ctx.stroke();
      }

      // 5. Circuit Traces (UPDATED: Varied Colors)
      const drawCircuit = (startX: number, startY: number, color: string, width: number) => {
         ctx.beginPath();
         ctx.moveTo(startX, startY);
         
         let currX = startX;
         let currY = startY;
         const segments = Math.floor(rng(5, 10)); 
         
         for(let i=0; i<segments; i++) {
             // Move Up/Down
             const lenY = rng(30, 90);
             currY -= lenY; 
             ctx.lineTo(currX, currY);
             
             if (currY < horizonY + 20) break;

             // Move Left/Right
             const lenX = rng(-40, 40);
             ctx.lineTo(currX + lenX, currY);
             currX += lenX;
         }
         
         ctx.strokeStyle = color;
         ctx.lineWidth = width;
         ctx.lineCap = 'square';
         ctx.lineJoin = 'round';
         ctx.shadowColor = color;
         ctx.shadowBlur = 10; 
         ctx.stroke();
         ctx.shadowBlur = 0;
         
         // Circuit Head Spark
         ctx.fillStyle = '#ffffff';
         ctx.beginPath();
         ctx.arc(currX, currY, width + 1, 0, Math.PI*2);
         ctx.fill();
      };

      // Primary Circuits (Varied Shades)
      for(let i=0; i<20; i++) {
          const x = rng(0, 320);
          // Pick a random shade from the Primary Palette + Random Opacity
          const variantColor = pickVariant(primaryPalette, rng(0.7, 1.0));
          drawCircuit(x, 490, variantColor, rng(1, 2.5));
      }
      
      // Secondary Circuits (Varied Shades)
      for(let i=0; i<12; i++) {
          const x = rng(0, 320);
          // Pick a random shade from the Secondary Palette + Random Opacity
          const variantColor = pickVariant(secondaryPalette, rng(0.7, 1.0));
          drawCircuit(x, 490, variantColor, rng(1, 2));
      }

      // 6. Binary Dust Particles
      for(let i=0; i<60; i++) {
         const x = rng(0, 320);
         const y = rng(0, 480);
         const s = rng(1, 2.5);
         
         ctx.fillStyle = Math.random() > 0.7 ? '#ffffff' : pickVariant(primaryPalette, 0.5);
         ctx.globalAlpha = rng(0.3, 0.8);
         ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
      
      // 7. Central Horizon Flare
      const flare = ctx.createRadialGradient(160, horizonY, 0, 160, horizonY, 200);
      flare.addColorStop(0, pickVariant(primaryPalette, 0.4));
      flare.addColorStop(0.5, 'transparent');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, 320, 480);
    }
    
    else if (backgroundStyle === 'impact') {
      // 1. Comic Background Base (Darker Halftone)
      ctx.fillStyle = '#e0e0e0'; // Slightly darker base
      ctx.fillRect(0, 0, 320, 480);
      
      // Halftone dots
      ctx.fillStyle = '#cccccc';
      for(let x=0; x<320; x+=8) {
          for(let y=0; y<480; y+=8) {
              if ((x+y)%16 === 0) {
                  ctx.beginPath();
                  ctx.arc(x, y, 3, 0, Math.PI*2); // Larger dots
                  ctx.fill();
              }
          }
      }

      const cx = 160;
      const cy = 200;

      const drawSpikeBurst = (count: number, minLen: number, maxLen: number, widthMin: number, widthMax: number, colorPalette: any) => {
          for(let i=0; i<count; i++) {
              const angle = rng(0, Math.PI * 2);
              const length = rng(minLen, maxLen);
              const width = rng(widthMin, widthMax);
              
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(angle);
              
              ctx.beginPath();
              ctx.moveTo(0, -width/2);
              ctx.lineTo(length, 0); 
              ctx.lineTo(0, width/2);
              
              // High opacity for dense color look
              ctx.fillStyle = pickVariant(colorPalette, 0.9);
              ctx.fill();
              
              // Heavy Ink Outline
              ctx.strokeStyle = '#000'; 
              ctx.lineWidth = 1;
              ctx.stroke();
              
              ctx.restore();
          }
      };

      // Layer 0: Background Filler (Wide, low opacity shards to kill white space)
      drawSpikeBurst(20, 200, 400, 40, 100, primaryPalette);

      // Layer 1: Primary Explosions (Dense)
      drawSpikeBurst(50, 100, 380, 10, 50, primaryPalette);
      
      // Layer 2: Secondary Sharp Cuts (Dense)
      drawSpikeBurst(40, 80, 300, 5, 30, secondaryPalette);
      
      // Layer 3: Black "Impact" Ink Shards
      for(let i=0; i<30; i++) {
          const angle = rng(0, Math.PI * 2);
          const length = rng(50, 250);
          const width = rng(2, 12);
          
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(length, -width);
          ctx.lineTo(length * 0.9, 0);
          ctx.lineTo(length, width);
          ctx.fill();
          ctx.restore();
      }

      // 3. Foreground Grunge
      fgCtx.fillStyle = '#111';
      for(let i=0; i<500; i++) {
          const x = rng(0, 320);
          const y = rng(0, 480);
          const s = rng(0.5, 3);
          const dist = Math.sqrt(Math.pow(x-160,2) + Math.pow(y-200,2));
          if(dist < 80 && Math.random() > 0.2) continue; // Keep face clean

          if (Math.random() > 0.5) fgCtx.fillRect(x, y, s, s); 
          else { fgCtx.beginPath(); fgCtx.arc(x, y, s/2, 0, Math.PI*2); fgCtx.fill(); }
      }
    }
    else if (backgroundStyle === 'hurricane') {
      // ... existing hurricane logic ...
      const grad = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 480);

      const eye = ctx.createRadialGradient(160, 240, 5, 160, 240, 50);
      eye.addColorStop(0, pickVariant(primaryPalette, 0.4));
      eye.addColorStop(0.5, pickVariant(primaryPalette, 0.2));
      eye.addColorStop(1, 'transparent');
      ctx.fillStyle = eye;
      ctx.fillRect(0, 0, 320, 480);

      const cx = 160;
      const cy = 240;
      const maxR = 400;

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
      <>
      <svg width="0" height="0" className="absolute">
        <filter id="sticker-effect" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="thick" />
          <feFlood floodColor="white" result="white" />
          <feComposite in="white" in2="thick" operator="in" result="outline" />
          <feMorphology in="outline" operator="dilate" radius="1" result="outline_thick" />
          <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="black" floodOpacity="1" in="outline_thick" result="shadow"/>
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="outline_thick" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>  

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

           {/* Team Logo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Team Logo (Optional)</label>
              
              <div className="flex items-center gap-4">
                {/* Logo Preview Circle */}
                <div 
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-slate-900/80 backdrop-blur shadow-lg flex-shrink-0"
                  style={{ borderColor: colors.primary }}
                >
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Team Logo" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div 
                      className="font-bold text-[10px] text-center leading-none"
                      style={{ color: colors.primary }}
                    >
                      PRO<br/>CARD
                    </div>
                  )}
                </div>

                {/* Upload/Clear Buttons */}
                <div className="flex-1 space-y-2">
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    onChange={handleLogoChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-gray-300 hover:border-slate-500 hover:text-white transition-colors"
                  >
                    {logoPreview ? 'Change Logo' : 'Upload Custom Logo'}
                  </button>
                  
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-red-400 hover:border-red-500 hover:text-red-300 transition-colors"
                    >
                      Clear Logo
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 pl-20">Square logos (PNG with transparent background) work best</p>

              {/* Add Team Logo Checkbox - Moved to bottom */}
              <label className="flex items-center gap-2 cursor-pointer group mt-2 pt-2">
                <input 
                  type="checkbox" 
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Add team logo
                </span>
              </label>
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
                    {/* Sparkles icon removed */}
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
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {BORDER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setBorderStyle(style.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide text-left transition-all border flex items-center justify-between ${
                        borderStyle === style.id 
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                        : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-slate-500'
                      }`}
                    >
                      <span>{style.name}</span>
                      {/* Frame icon removed */}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
                type="submit" 
                className="w-full text-white font-bold py-3 rounded-lg transition-all shadow-lg flex justify-center items-center gap-2"
                style={{ 
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 4px 14px 0 ${colors.primary}40`
                }}
            >
              Order My Card
            </button>
          </form>
        </div>

        {/* Right Column: Live Preview */}
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
          
          {/* Card Container Wrapper */}
          <div className={`
             relative transition-all duration-500
             ${isFullScreen ? 'scale-110 md:scale-125 lg:scale-[1.4]' : 'w-[320px] h-[480px] mx-auto perspective-1000 group'}
          `}>
            
            <div 
              className={`
                relative w-[320px] h-[480px] bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl transition-transform duration-500 transform
                ${!isFullScreen && 'group-hover:rotate-y-6 group-hover:rotate-x-6'}
              `}
              onClick={() => !isFullScreen && setIsFullScreen(true)}
            >
              
              {/* --- CARD CONTENT STARTS HERE --- */}

              {/* CSS BACKGROUND */}
              <div className="absolute inset-0 transition-all duration-500" style={getCssBackground()}></div>

              {/* CANVAS PROCEDURAL BACKGROUND */}
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full z-0"
              />
              {/* Foreground debris layer (shatter only) */}
              <canvas 
                ref={foregroundCanvasRef} 
                className="absolute inset-0 w-full h-full z-40 pointer-events-none"
              />
              
              {/* User Uploaded Image */}
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  // Z-INDEX UPDATE: Changed z-10 to z-30 so the player pops OVER the text banner
                  className="absolute inset-0 w-full h-full object-cover z-30 mix-blend-normal" 
                  style={{
                    filter: backgroundStyle === 'impact' 
                      // Apply the SVG filter we added in Step 1
                      ? 'url(#sticker-effect)' 
                      : enableGlow 
                        ? `drop-shadow(0 0 ${20 * (glowOpacity / 100)}px ${glowColor === 'primary' ? colors.primary : colors.secondary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')}) drop-shadow(0 0 ${40 * (glowOpacity / 100)}px ${glowColor === 'primary' ? colors.primary : colors.secondary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')})`
                        : undefined
                  }}
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

{/* Text Content Logic */}
              {backgroundStyle === 'impact' || backgroundStyle === 'splatter' ? (
                // --- COMIC IMPACT & SPLATTER LAYOUTS ---
                <>
                  {/* TOP HEADER (Z-20: Sits BEHIND player head) */}
                  <div className="absolute top-6 left-0 w-full z-20 pointer-events-none overflow-visible flex justify-center">
                    
                    {/* SPLATTER HEADER */}
                    {backgroundStyle === 'splatter' ? (
                       <div className="w-[92%] bg-[#1a1a1a] border-y-2 border-white/20 py-2 relative shadow-lg">
                          <div className="absolute top-0 left-0 w-full h-[2px]" style={{background: colors.primary}}></div>
                          <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{background: colors.primary}}></div>
                          
                          <h1 
                            className="font-['Teko'] font-bold text-center uppercase tracking-widest leading-none relative z-10 whitespace-nowrap"
                            style={{ 
                                fontSize: getNameFontSize(details.name, 2.8),
                                color: colors.primary,
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                            }} 
                          >
                            {details.name || 'PLAYER NAME'}
                          </h1>
                       </div>
                    ) : (
                      // IMPACT HEADER
                      <div className="relative transform -rotate-2 translate-x-[-10px] scale-110 w-full">
                        <div className="bg-[#1a1a1a] border-y-4 border-white py-2 px-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative z-20">
                          <div className="relative">
                            {/* Layer 1: Outline */}
                            <h1 
                              className="font-['Teko'] font-bold uppercase leading-[0.85] italic tracking-tighter whitespace-nowrap absolute top-0 left-0 w-full"
                              style={{
                                fontSize: getNameFontSize(details.name, 3.5),
                                color: colors.primary,           
                                WebkitTextStroke: `5px ${colors.primary}`, 
                                zIndex: 10,
                                filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.5))'
                              }} 
                            >
                              {details.name || 'PLAYER NAME'}
                            </h1>
                            {/* Layer 2: Fill */}
                            <h1 
                              className="font-['Teko'] font-bold uppercase leading-[0.85] italic tracking-tighter whitespace-nowrap relative"
                              style={{
                                fontSize: getNameFontSize(details.name, 3.5),
                                ...chromeTextStyle,
                                zIndex: 20
                              }} 
                            >
                              {details.name || 'PLAYER NAME'}
                            </h1>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM FOOTER (Z-40: Sits ON TOP of player legs) */}
                  <div className="absolute bottom-8 left-0 w-full z-40 pointer-events-none overflow-visible flex flex-col items-center">
                     
                     {backgroundStyle === 'splatter' ? (
                        // SPLATTER FOOTER (Updated)
                        <div className="w-full text-center">
                            {/* Position Bar + Number */}
                            <div className="bg-[#111] border-y border-white/30 py-1 mb-1 relative inline-block px-10 shadow-md">
                                <div className="absolute left-0 top-0 h-full w-1" style={{background: colors.secondary}}></div>
                                <div className="absolute right-0 top-0 h-full w-1" style={{background: colors.secondary}}></div>
                                <span className="text-white font-['Teko'] text-xl tracking-[0.15em] uppercase font-bold relative z-10">
                                    {details.position || 'POSITION'} <span className="text-gray-500 mx-2">|</span> #{details.number || '00'}
                                </span>
                            </div>
                            {/* Team Name - Cleaned up rendering */}
                            <div className="relative">
                                <h2 
                                    className="text-6xl font-['Teko'] font-bold uppercase italic leading-none" 
                                    style={{
                                        color: colors.primary,
                                        // Replaced WebkitTextStroke with text-shadow for cleaner edges
                                        textShadow: '2px 2px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
                                    }}
                                >
                                    {details.team || 'TEAM'}
                                </h2>
                            </div>
                        </div>
                     ) : (
                        // IMPACT FOOTER
                        <div 
                            className="inline-block px-8 py-2 border-y-4 border-r-4 border-black relative z-10 transform -rotate-2 translate-x-[-5px] self-start"
                            style={{ backgroundColor: colors.primary, boxShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                        >
                            <div className="flex gap-3 text-black font-['Teko'] font-bold text-2xl uppercase tracking-widest leading-none">
                            <span>{details.team || 'TEAM'}</span>
                            <span className="opacity-50">•</span>
                            <span>{details.position || 'POS'}</span>
                            </div>
                        </div>
                     )}
                  </div>

                  {/* JERSEY NUMBER (Only Impact) */}
                  {backgroundStyle === 'impact' && (
                    <div className="absolute bottom-6 right-4 transform -rotate-6 z-40 pointer-events-none">
                        <span 
                        className="text-8xl font-['Teko'] font-bold text-transparent"
                        style={{ 
                            WebkitTextStroke: '3px white',
                            textShadow: `4px 4px 0 ${colors.secondary}`
                        }}
                        >
                            {details.number || '00'}
                        </span>
                    </div>
                  )}
                </>
              ) : (
                // --- 2. STANDARD / RADAR LAYOUT (Bottom) ---
                <div className="absolute bottom-8 left-8 right-8 z-50 pointer-events-none">
                  <div className={`flex justify-between items-end border-b pb-2 mb-1 ${backgroundStyle === 'radar' ? 'border-black/20' : 'border-white/30'}`}>
                    <div className="flex-1 mr-2">
                        <p 
                          className="font-bold tracking-widest text-sm font-['Teko'] uppercase drop-shadow-md"
                          style={{ color: backgroundStyle === 'radar' ? '#000000' : colors.primary }}
                        >
                          {details.team || 'TEAM NAME'}
                        </p>
                        
                        {/* Chrome Name Standard */}
                        <div className="relative">
                          <h1 
                            className="font-['Teko'] font-bold leading-none italic uppercase absolute top-0 left-0 w-full whitespace-nowrap"
                            style={{
                              fontSize: getNameFontSize(details.name),
                              color: colors.primary, 
                              WebkitTextStroke: `4px ${colors.primary}`,
                              zIndex: 10,
                              filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))'
                            }}
                          >
                            {details.name || 'PLAYER NAME'}
                          </h1>

                          <h1 
                            className="font-['Teko'] font-bold leading-none italic uppercase relative whitespace-nowrap"
                            style={{
                              fontSize: getNameFontSize(details.name),
                              ...chromeTextStyle,
                              zIndex: 20
                            }}
                          >
                            {details.name || 'PLAYER NAME'}
                          </h1>
                        </div>
                    </div>
                    <div 
                      className={`text-5xl font-['Teko'] font-bold outline-text drop-shadow-lg ${backgroundStyle === 'radar' ? 'text-black opacity-100' : 'text-white opacity-40'}`}
                    >
                        {details.number || '00'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold text-gray-300">
                    <span>{details.position || 'POS'}</span>
                  </div>
                </div>
              )}

             {/* Top Badge - Only render if showLogo is true */}
              {showLogo && (
                <div className="absolute top-8 right-8 z-50 pointer-events-none">
                  <div 
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center bg-slate-900/80 backdrop-blur shadow-lg overflow-hidden"
                      style={{ borderColor: colors.primary }}
                  >
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Team Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                            className="font-bold text-xs text-center leading-none"
                            style={{ color: colors.primary }}
                        >
                          PRO<br/>CARD
                        </div>
                      )}
                  </div>
                </div>
              )}

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
    </>
  );
};

export default OrderForm;