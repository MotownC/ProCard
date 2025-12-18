import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Layers, Maximize2, X, Loader2, RotateCcw, ArrowLeftRight, User, Trophy, Scale } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { toPng } from 'html-to-image';

// --- INTERFACES ---
export interface PlayerDetails {
  name: string;
  team: string;
  position: string;
  number: string;
  sport: string;
}

export interface BackDetails {
  bio: string;
  height: string;
  weight: string;
  hometown: string;
  year: string;
  stat5: string;
  powerRating: number;
  heightLabel: string;
  weightLabel: string;
  hometownLabel: string;
  yearLabel: string;
  stat5Label: string;
}

// --- HELPER FUNCTIONS ---
const getColorVariants = (hexColor: string) => {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
    return { lighter2: '#ffffff', lighter1: '#cccccc', base: '#888888', darker1: '#444444', darker2: '#000000' };
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
  
  return { lighter2: lighten(80), lighter1: lighten(40), base: hexColor, darker1: darken(40), darker2: darken(80) };
};

const getNameFontSize = (name: string, baseRem = 2.25) => {
  if (!name) return `${baseRem}rem`;
  if (name.length <= 8) return `${baseRem}rem`;
  const scaleFactor = 8 / name.length;
  return `${Math.max(1, baseRem * scaleFactor)}rem`;
};

const getRibbonFontSize = (team: string, pos: string) => {
    const totalLength = (team?.length || 0) + (pos?.length || 0);
    const baseRem = 1.4; 
    if (totalLength <= 14) return `${baseRem}rem`;
    return `${Math.max(0.6, baseRem * (14 / totalLength))}rem`;
};

const chromeTextStyle = {
    background: 'linear-gradient(180deg, #FFFFFF 20%, #E0E0E0 45%, #888888 50%, #D0D0D0 55%, #F0F0F0 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 0px rgba(0,0,0,0.1))'
};

// --- BORDER FRAME COMPONENT ---
interface BorderFrameProps {
  style: string;
  primaryColor: string;
  secondaryColor: string;
  flipped?: boolean;
}

const BorderFrame: React.FC<BorderFrameProps> = ({ style, primaryColor, secondaryColor, flipped = false }) => {
  const transformStyle = flipped ? { transform: 'scaleX(-1)' } : {};

  if (style === 'tech-frame') {
    const pVars = getColorVariants(primaryColor);
    const sVars = getColorVariants(secondaryColor);
    
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60, ...transformStyle }} viewBox="0 0 320 480">
        <defs>
          <pattern id="techCarbon" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#111" />
            <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#222" strokeWidth="1.5" />
          </pattern>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="silverBevel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#888', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#fff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#888', stopOpacity: 1 }} />
          </linearGradient>
          <radialGradient id="hexGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#444', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
          </radialGradient>
          
          {/* Left side diagonal gradient */}
          <linearGradient id="leftDiagonalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: pVars.darker2, stopOpacity: 0.6 }} />
            <stop offset="25%" style={{ stopColor: pVars.darker1, stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: pVars.base, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: pVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: pVars.darker1, stopOpacity: 0.7 }} />
          </linearGradient>
          
          {/* Right side diagonal gradient */}
          <linearGradient id="rightDiagonalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sVars.darker1, stopOpacity: 0.7 }} />
            <stop offset="25%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: sVars.base, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: sVars.darker1, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker2, stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        <path d="M -2,-2 H 322 V 482 H -2 Z M 20,20 L 300,20 L 305,150 L 265,240 L 305,330 L 300,460 L 20,460 L 15,330 L 55,240 L 15,150 Z" fill="url(#techCarbon)" fillRule="evenodd" stroke="none"/>
        <path d="M 20,20 L 300,20 L 305,150 L 265,240 L 305,330 L 300,460 L 20,460 L 15,330 L 55,240 L 15,150 Z" fill="none" stroke="url(#silverBevel)" strokeWidth="3"/>
        <path d="M -2,145 L 35,240 L -2,335" fill="none" stroke="url(#leftDiagonalGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)"/>
        <path d="M 322,145 L 285,240 L 322,335" fill="none" stroke="url(#rightDiagonalGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)"/>
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
  
  if (style === 'chrome-metal') {
    const pVars = getColorVariants(primaryColor);
    const sVars = getColorVariants(secondaryColor);
    
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60, ...transformStyle }} viewBox="0 0 320 480">
        <defs>
          <linearGradient id="brushedWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e6e6e6', stopOpacity: 1 }} />
            <stop offset="20%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#d4d4d4', stopOpacity: 1 }} />
            <stop offset="45%" style={{ stopColor: '#a0a0a0', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="80%" style={{ stopColor: '#dcdcdc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#b0b0b0', stopOpacity: 1 }} />
          </linearGradient>
          <pattern id="microGrid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="none" />
            <circle cx="2" cy="2" r="0.5" fill="#000" opacity="0.4" />
          </pattern>
          <radialGradient id="tileGrad" cx="50%" cy="50%" r="50%">
            <stop offset="40%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <pattern id="hex3D" x="0" y="0" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(0.6)">
            <rect width="28" height="48" fill="#000" />
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="url(#tileGrad)" stroke="none" transform="translate(14, 16) scale(0.95) translate(-14, -16)" />
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="url(#tileGrad)" stroke="none" transform="translate(14, 24) translate(14, 16) scale(0.95) translate(-14, -16)" />
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="url(#tileGrad)" stroke="none" transform="translate(14, -24) translate(14, 16) scale(0.95) translate(-14, -16)" />
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="url(#tileGrad)" stroke="none" transform="translate(-14, 24) translate(14, 16) scale(0.95) translate(-14, -16)" />
          </pattern>
          <filter id="pipingGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="plateShadow">
             <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
          </filter>
          
          {/* Gradient for left armor piping - more variation */}
          <linearGradient id="leftPipingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: pVars.darker2, stopOpacity: 0.4 }} />
            <stop offset="15%" style={{ stopColor: pVars.base, stopOpacity: 0.7 }} />
            <stop offset="30%" style={{ stopColor: pVars.lighter1, stopOpacity: 1 }} />
            <stop offset="45%" style={{ stopColor: pVars.darker1, stopOpacity: 0.6 }} />
            <stop offset="60%" style={{ stopColor: pVars.lighter2, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: pVars.base, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: pVars.darker2, stopOpacity: 0.5 }} />
          </linearGradient>
          
          {/* Gradient for right armor piping - more variation */}
          <linearGradient id="rightPipingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sVars.darker2, stopOpacity: 0.5 }} />
            <stop offset="15%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="30%" style={{ stopColor: sVars.darker1, stopOpacity: 0.6 }} />
            <stop offset="50%" style={{ stopColor: sVars.lighter2, stopOpacity: 1 }} />
            <stop offset="65%" style={{ stopColor: sVars.base, stopOpacity: 0.7 }} />
            <stop offset="85%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.95 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker2, stopOpacity: 0.4 }} />
          </linearGradient>
          
          {/* Gradient for top horizontal line */}
          <linearGradient id="topHorizontalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: pVars.darker2, stopOpacity: 0.6 }} />
            <stop offset="25%" style={{ stopColor: pVars.darker1, stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: pVars.base, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: pVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: pVars.darker1, stopOpacity: 0.7 }} />
          </linearGradient>
          
          {/* Gradient for bottom horizontal line */}
          <linearGradient id="bottomHorizontalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: sVars.darker1, stopOpacity: 0.7 }} />
            <stop offset="25%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: sVars.base, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: sVars.darker1, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker2, stopOpacity: 0.6 }} />
          </linearGradient>
          
          <path id="leftArmorPath" d="M -10,75 L 25,105 L 25,280 L 45,295 L 45,345 L 25,360 L 25,445 L -10,475 Z" />
          <path id="rightArmorPath" d="M 330,5 L 295,35 L 295,90 L 275,105 L 275,155 L 295,170 L 295,375 L 330,405 Z" />
          <path id="topLeftBase" d="M -5,-5 H 80 V 25 H 20 V 90 H -5 Z" />
          <path id="topRightBase" d="M 325,-5 H 240 V 25 H 300 V 90 H 325 Z" />
          <path id="topCenterBase" d="M 75,-5 H 245 V 20 H 75 Z" />
          <path id="bottomBase" d="M -5,485 H 325 V 465 L 290,455 H 30 L -5,465 Z" />
          <rect id="leftSideFill" x="-5" y="0" width="20" height="480" />
          <rect id="rightSideFill" x="305" y="0" width="20" height="480" />
        </defs>
        <g>
            <use href="#leftSideFill" fill="url(#hex3D)" />
            <use href="#rightSideFill" fill="url(#hex3D)" />
            <use href="#topLeftBase" fill="url(#hex3D)" />
            <use href="#topRightBase" fill="url(#hex3D)" />
            <use href="#topCenterBase" fill="url(#hex3D)" />
            <use href="#bottomBase" fill="url(#hex3D)" />
        </g>
        <g filter="url(#plateShadow)">
            <use href="#leftArmorPath" fill="url(#brushedWhite)" stroke="#000" strokeWidth="1" />
            <use href="#leftArmorPath" fill="url(#microGrid)" opacity="0.3" pointerEvents="none" />
            <path d="M 15,115 L 15,275 L 35,290 L 35,350 L 15,365 L 15,420" fill="none" stroke="url(#leftPipingGrad)" strokeWidth="2" filter="url(#pipingGlow)" />
            <g fill="#222">
                <rect x="5" y="135" width="10" height="4" />
                <rect x="5" y="145" width="10" height="4" />
                <rect x="5" y="155" width="10" height="4" />
            </g>
        </g>
        <g filter="url(#plateShadow)">
            <use href="#rightArmorPath" fill="url(#brushedWhite)" stroke="#000" strokeWidth="1" />
            <use href="#rightArmorPath" fill="url(#microGrid)" opacity="0.3" pointerEvents="none" />
            <path d="M 305,45 L 305,85 L 285,100 L 285,160 L 305,175 L 305,360" fill="none" stroke="url(#rightPipingGrad)" strokeWidth="2" filter="url(#pipingGlow)" />
            <g fill="#222">
                <rect x="305" y="330" width="10" height="4" />
                <rect x="305" y="340" width="10" height="4" />
                <rect x="305" y="350" width="10" height="4" />
            </g>
        </g>
        <rect x="70" y="16" width="180" height="2" fill="url(#topHorizontalGrad)" filter="url(#pipingGlow)" />
        <rect x="40" y="468" width="240" height="4" fill="#111" stroke="#333" />
        <rect x="120" y="470" width="80" height="2" fill="url(#bottomHorizontalGrad)" filter="url(#pipingGlow)" />
        <line x1="50" y1="295" x2="50" y2="345" stroke={primaryColor} strokeWidth="3" opacity="0.8" filter="url(#pipingGlow)" />
        <line x1="270" y1="105" x2="270" y2="155" stroke={secondaryColor} strokeWidth="3" opacity="0.8" filter="url(#pipingGlow)" />
      </svg>
    );
  }
  
  if (style === 'carbon-fiber') {
    const pVars = getColorVariants(primaryColor);
    const sVars = getColorVariants(secondaryColor);
    
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60, ...transformStyle }} viewBox="0 0 320 480">
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
          
          {/* Gradient for top/left piping path */}
          <linearGradient id="topLeftPipingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: pVars.darker2, stopOpacity: 0.5 }} />
            <stop offset="10%" style={{ stopColor: pVars.base, stopOpacity: 0.7 }} />
            <stop offset="25%" style={{ stopColor: pVars.lighter1, stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: pVars.darker1, stopOpacity: 0.6 }} />
            <stop offset="55%" style={{ stopColor: pVars.lighter2, stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: pVars.base, stopOpacity: 0.8 }} />
            <stop offset="85%" style={{ stopColor: pVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: pVars.darker2, stopOpacity: 0.5 }} />
          </linearGradient>
          
          {/* Gradient for bottom/right piping path */}
          <linearGradient id="bottomRightPipingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: sVars.darker2, stopOpacity: 0.5 }} />
            <stop offset="15%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.9 }} />
            <stop offset="30%" style={{ stopColor: sVars.base, stopOpacity: 0.7 }} />
            <stop offset="45%" style={{ stopColor: sVars.lighter2, stopOpacity: 1 }} />
            <stop offset="60%" style={{ stopColor: sVars.darker1, stopOpacity: 0.6 }} />
            <stop offset="75%" style={{ stopColor: sVars.lighter1, stopOpacity: 1 }} />
            <stop offset="90%" style={{ stopColor: sVars.base, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker2, stopOpacity: 0.5 }} />
          </linearGradient>
          
          {/* Gradient for left vertical bar */}
          <linearGradient id="leftVerticalBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: pVars.darker2, stopOpacity: 0.5 }} />
            <stop offset="30%" style={{ stopColor: pVars.lighter1, stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: pVars.lighter2, stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: pVars.lighter1, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: pVars.darker2, stopOpacity: 0.5 }} />
          </linearGradient>
          
          {/* Gradient for right vertical bar */}
          <linearGradient id="rightVerticalBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sVars.darker2, stopOpacity: 0.5 }} />
            <stop offset="30%" style={{ stopColor: sVars.lighter1, stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: sVars.lighter2, stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: sVars.lighter1, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker2, stopOpacity: 0.5 }} />
          </linearGradient>
        </defs>
        <path d="M -10,-10 H 330 V 490 H -10 Z M 15,25 L 80,25 L 95,10 L 225,10 L 240,25 L 305,25 L 305,100 L 295,130 L 295,350 L 305,380 L 305,455 L 240,455 L 225,470 L 95,470 L 80,455 L 15,455 L 15,380 L 25,350 L 25,130 L 15,100 Z" fill="url(#carbonWeave)" fillRule="evenodd" stroke="#000" strokeWidth="2"/>
        <path d="M 305,25 L 240,25 L 225,10 L 95,10 L 80,25 L 15,25 L 15,100 L 25,130 L 25,350 L 15,380 L 15,455" fill="none" stroke="url(#topLeftPipingGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#neonTube)"/>
        <path d="M 15,455 L 80,455 L 95,470 L 225,470 L 240,455 L 305,455 L 305,380 L 295,350 L 295,130 L 305,100 L 305,25" fill="none" stroke="url(#bottomRightPipingGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#neonTube)"/>
        <path d="M -5,90 L 35,120 L 35,360 L -5,390 Z" fill="url(#plateGrad)" stroke="#444" strokeWidth="1"/>
        <path d="M 0,130 L 20,145 L 20,335 L 0,350" fill="#111" opacity="0.6" />
        <rect x="22" y="220" width="4" height="40" fill="url(#leftVerticalBarGrad)" filter="url(#neonTube)" />
        <path d="M 325,90 L 285,120 L 285,360 L 325,390 Z" fill="url(#plateGrad)" stroke="#444" strokeWidth="1"/>
        <path d="M 320,130 L 300,145 L 300,335 L 320,350" fill="#111" opacity="0.6" />
        <rect x="294" y="220" width="4" height="40" fill="url(#rightVerticalBarGrad)" filter="url(#neonTube)" />
       <path d="M 16,26 L 48,28 L 38,38 L 18,38 Z" fill="#333" stroke="none" />
<path d="M 306,26 L 272,28 L 282,38 L 302,38 Z" fill="#333" stroke="none" />
<path d="M 16,454 L 48,452 L 38,442 L 18,442 Z" fill="#333" stroke="none" />
<path d="M 306,454 L 272,452 L 282,442 L 302,442 Z" fill="#333" stroke="none" />
      </svg>
    );
  }

  if (style === 'geometric') {
    const pVars = getColorVariants(primaryColor);
    const sVars = getColorVariants(secondaryColor);
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60, ...transformStyle }} viewBox="0 0 320 480">
        <defs>
          <pattern id="titaniumMesh" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#151515" />
            <path d="M0,6 L6,0" stroke="#222" strokeWidth="1" />
          </pattern>
          <pattern id="gunmetal" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#1a1a1a" />
          </pattern>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: pVars.lighter2, stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: pVars.base, stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: pVars.darker1, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: pVars.base, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: pVars.lighter1, stopOpacity: 1 }} />
          </linearGradient>
          
          {/* Gradient for left vent horizontal lines */}
          <linearGradient id="leftVentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sVars.darker2, stopOpacity: 0.3 }} />
            <stop offset="25%" style={{ stopColor: sVars.darker1, stopOpacity: 0.6 }} />
            <stop offset="50%" style={{ stopColor: sVars.base, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker1, stopOpacity: 0.4 }} />
          </linearGradient>
          
          {/* Gradient for left vertical connector */}
          <linearGradient id="leftVerticalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: sVars.darker1, stopOpacity: 0.4 }} />
            <stop offset="30%" style={{ stopColor: sVars.base, stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: sVars.lighter1, stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: sVars.base, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker1, stopOpacity: 0.4 }} />
          </linearGradient>
          
          {/* Gradient for right vent horizontal lines */}
          <linearGradient id="rightVentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sVars.darker1, stopOpacity: 0.4 }} />
            <stop offset="25%" style={{ stopColor: sVars.lighter1, stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: sVars.base, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: sVars.darker1, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker2, stopOpacity: 0.3 }} />
          </linearGradient>
          
          {/* Gradient for right vertical connector */}
          <linearGradient id="rightVerticalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: sVars.darker1, stopOpacity: 0.4 }} />
            <stop offset="30%" style={{ stopColor: sVars.base, stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: sVars.lighter1, stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: sVars.base, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker1, stopOpacity: 0.4 }} />
          </linearGradient>
          
          <filter id="neonTrace">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="armorShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.8"/>
          </filter>
          <mask id="titaniumMask">
            <rect x="-10" y="-10" width="340" height="500" fill="white" />
            <path d="M 30,20 L 290,20 L 305,35 L 305,120 L 270,150 L 270,330 L 305,360 L 305,445 L 290,460 L 30,460 L 15,445 L 15,360 L 50,330 L 50,150 L 15,120 L 15,35 Z" fill="black" />
          </mask>
        </defs>
        <rect x="-5" y="-5" width="330" height="490" fill="url(#gunmetal)" mask="url(#titaniumMask)" />
        <path d="M 30,20 L 290,20 L 305,35 L 305,120 L 270,150 L 270,330 L 305,360 L 305,445 L 290,460 L 30,460 L 15,445 L 15,360 L 50,330 L 50,150 L 15,120 L 15,35 Z" fill="none" stroke="url(#neonGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonTrace)" />
        <g filter="url(#armorShadow)">
            <path d="M -5,100 L 40,140 L 40,340 L -5,380 Z" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
            <path d="M 0,160 L 25,180 L 25,300 L 0,320 Z" fill="#000" opacity="0.6" />
            <g strokeLinecap="round" filter="url(#neonTrace)">
               {/* Top horizontal lines */}
               <line x1="8" y1="165" x2="28" y2="175" stroke="url(#leftVentGrad)" strokeWidth="2.5" />
               <line x1="8" y1="175" x2="28" y2="185" stroke="url(#leftVentGrad)" strokeWidth="2.5" />
               <line x1="8" y1="185" x2="28" y2="195" stroke="url(#leftVentGrad)" strokeWidth="2.5" />
               {/* Bottom horizontal lines */}
               <line x1="8" y1="315" x2="28" y2="305" stroke="url(#leftVentGrad)" strokeWidth="2.5" />
               <line x1="8" y1="305" x2="28" y2="295" stroke="url(#leftVentGrad)" strokeWidth="2.5" />
               <line x1="8" y1="295" x2="28" y2="285" stroke="url(#leftVentGrad)" strokeWidth="2.5" />
               {/* Vertical connector with its own gradient */}
               <line x1="28" y1="285" x2="28" y2="195" stroke={sVars.base} strokeWidth="1.5" />
            </g>
        </g>
        <g filter="url(#armorShadow)">
            <path d="M 325,100 L 280,140 L 280,340 L 325,380 Z" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
            <path d="M 320,160 L 295,180 L 295,300 L 320,320 Z" fill="#000" opacity="0.6" />
            <g strokeLinecap="round" filter="url(#neonTrace)">
               {/* Top horizontal lines */}
               <line x1="312" y1="165" x2="292" y2="175" stroke="url(#rightVentGrad)" strokeWidth="2.5" />
               <line x1="312" y1="175" x2="292" y2="185" stroke="url(#rightVentGrad)" strokeWidth="2.5" />
               <line x1="312" y1="185" x2="292" y2="195" stroke="url(#rightVentGrad)" strokeWidth="2.5" />
               {/* Bottom horizontal lines */}
               <line x1="312" y1="315" x2="292" y2="305" stroke="url(#rightVentGrad)" strokeWidth="2.5" />
               <line x1="312" y1="305" x2="292" y2="295" stroke="url(#rightVentGrad)" strokeWidth="2.5" />
               <line x1="312" y1="295" x2="292" y2="285" stroke="url(#rightVentGrad)" strokeWidth="2.5" />
               {/* Vertical connector with its own gradient */}
               <line x1="292" y1="285" x2="292" y2="195" stroke={sVars.base} strokeWidth="1.5" />
            </g>
        </g>
        <path d="M -5,-5 H 70 L 60,10 L 30,10 L 10,25 L 10,60 L -5,75 Z" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
        <path d="M 325,-5 H 250 L 260,10 L 290,10 L 310,25 L 310,60 L 325,75 Z" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
        <path d="M -5,485 H 70 L 60,470 L 30,470 L 10,455 L 10,420 L -5,405 Z" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
        <path d="M 325,485 H 250 L 260,470 L 290,470 L 310,455 L 310,420 L 325,405 Z" fill="url(#titaniumMesh)" stroke="#333" strokeWidth="1" />
      </svg>
    );
  }


  if (style === 'classic') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60, ...transformStyle }} viewBox="0 0 320 480">
        <defs>
          <linearGradient id="classicSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
            <stop offset="20%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d4d4d4', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="cardShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M -2,-2 H 322 V 482 H -2 Z M 20,20 V 460 H 300 V 20 Z" fill="url(#classicSilver)" fillRule="evenodd" filter="url(#cardShadow)" stroke="#999" strokeWidth="1"/>
        <rect x="22" y="22" width="276" height="436" fill="none" stroke={primaryColor} strokeWidth="3" />
        <rect x="27" y="27" width="266" height="426" fill="none" stroke={secondaryColor} strokeWidth="1.5" />
      </svg>
    );
  }

  if (style === 'neon-glow') {
    const pVars = getColorVariants(primaryColor);
    const sVars = getColorVariants(secondaryColor);
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 60, ...transformStyle }} viewBox="0 0 320 480">
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="neonPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: pVars.lighter2, stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: pVars.base, stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: pVars.darker1, stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: pVars.base, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: pVars.lighter1, stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="neonSecondaryGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sVars.lighter2, stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: sVars.base, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: sVars.darker1, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="300" height="460" fill="none" stroke="url(#neonPrimaryGrad)" strokeWidth="3" filter="url(#neonGlow)" opacity="0.9"/>
        <rect x="15" y="15" width="290" height="450" fill="none" stroke="url(#neonSecondaryGrad)" strokeWidth="1.5" filter="url(#neonGlow)" opacity="0.8"/>
        <circle cx="30" cy="30" r="4" fill={pVars.lighter1} filter="url(#neonGlow)"/>
        <circle cx="290" cy="30" r="4" fill={sVars.lighter1} filter="url(#neonGlow)"/>
        <circle cx="30" cy="450" r="4" fill={sVars.lighter1} filter="url(#neonGlow)"/>
        <circle cx="290" cy="450" r="4" fill={pVars.lighter1} filter="url(#neonGlow)"/>
        <line x1="50" y1="12" x2="270" y2="12" stroke={pVars.lighter2} strokeWidth="1" opacity="0.6"/>
        <line x1="50" y1="468" x2="270" y2="468" stroke={sVars.lighter2} strokeWidth="1" opacity="0.6"/>
      </svg>
    );
  }
  return null;
};

// --- DATA LISTS ---
const BACKGROUND_STYLES = [
  { id: 'classic', name: 'Classic Fade', type: 'css' },
  { id: 'classic-enhanced', name: 'Classic Enhanced', type: 'canvas' },
  { id: 'radar', name: 'Tech Radar', type: 'canvas' },
  { id: 'cyber', name: 'Cyber Grid', type: 'canvas' },
  { id: 'velocity', name: 'Velocity', type: 'canvas' },
  { id: 'hex', name: 'Hex Tech', type: 'css' },
  { id: 'shatter', name: 'Shatter', type: 'canvas' },
  { id: 'energy', name: 'Energy', type: 'canvas' },
  { id: 'splatter', name: 'Splatter', type: 'canvas' }, 
  { id: 'impact', name: 'Impact', type: 'canvas' },
  { id: 'hurricane', name: 'Hurricane', type: 'canvas' },
];

const BORDER_STYLES = [
  { id: 'tech-frame', name: 'Tech Frame' },
  { id: 'chrome-metal', name: 'Mecha Sport' },
  { id: 'carbon-fiber', name: 'Carbon Fiber' },
  { id: 'neon-glow', name: 'Neon Glow' },
  { id: 'geometric', name: 'Titanium' },
  { id: 'classic', name: 'Classic' },
];

interface OrderFormProps {
  setPage?: (p: string) => void;
  setPendingOrder?: (o: any) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ setPage, setPendingOrder }) => {
  // 1. BASIC FORM STATE
  const [details, setDetails] = useState<PlayerDetails>({
    name: '', team: '', position: '', number: '', sport: 'Athlete'
  });
  
  // NEW: Back of Card Details
  const [backDetails, setBackDetails] = useState<BackDetails>({
    bio: '', height: '', weight: '', hometown: '', year: '', stat5: '', powerRating: 88,
    heightLabel: 'HT', weightLabel: 'WT', hometownLabel: 'FROM', yearLabel: 'YEAR', stat5Label: 'AGE'
  });
  
  const [colors, setColors] = useState({ primary: '#22d3ee', secondary: '#a855f7' });
  const [backgroundStyle, setBackgroundStyle] = useState('shatter');
  
  // Images
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Toggles & Scales
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackImageProcessing, setIsBackImageProcessing] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [backImageScale, setBackImageScale] = useState(1);
  const [backImageCropMode, setBackImageCropMode] = useState(false);
  const [backImageCropData, setBackImageCropData] = useState({ offsetX: 0, offsetY: 0, scale: 1 });
  const [tempCropImage, setTempCropImage] = useState<string | null>(null);
  const [enableGlow, setEnableGlow] = useState(false); 
  const [glowOpacity, setGlowOpacity] = useState(100);
  const [glowColor, setGlowColor] = useState<'primary' | 'secondary'>('primary');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [enableBorder, setEnableBorder] = useState(true);
  const [borderStyle, setBorderStyle] = useState('tech-frame');
  const [showLogo, setShowLogo] = useState(true);
  const [logoCropCircle, setLogoCropCircle] = useState(true);
  const [logoScale, setLogoScale] = useState(1);
  const [teamTextOpts, setTeamTextOpts] = useState({ italic: false, shadow: true });
  const [posTextOpts, setPosTextOpts] = useState({ stroke: false, shadow: false });
  const [numberStrokeOpts, setNumberStrokeOpts] = useState({ stroke: false });
  const [numberGradient, setNumberGradient] = useState(false);
  const [showPowerRating, setShowPowerRating] = useState(true);
  
  // NEW: Split State for Back Card
  const [createBackMode, setCreateBackMode] = useState(false); // Checkbox state
  const [showBack, setShowBack] = useState(false); // Visual flip state

  // iOS Workaround: Always run double-capture on every "Create Card" click
  const [isProcessingWorkaround, setIsProcessingWorkaround] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // 2. POSITIONS
  const [positions, setPositions] = useState({
    logo: { x: 230, y: 35 },
    image: { x: 0, y: 0 },
    groupHeader: { x: 0, y: 30 },     
    groupFooter: { x: 0, y: 400 },    
    impactNumber: { x: 200, y: 325 },
    splatterName: { x: 0, y: 30 },
    splatterPosNum: { x: 0, y: 375 },
    splatterTeam: { x: 0, y: 400 },
    stdTeam: { x: 32, y: 360 },
    stdName: { x: 29, y: 380 },
    stdNumber: { x: 230, y: 345 },
    stdPos: { x: 32, y: 425 }
  });

  const [backPositions, setBackPositions] = useState({
    backImage: { x: 0, y: 0 },
    bio: { x: 30, y: 330 },
    stats: { x: 60, y: 170 },
    rating: { x: 200, y: 50 }
  });

  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // --- DRAG LOGIC (Standard Math for Both Sides) ---
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!dragTarget || !cardRef.current) return;
      isDraggingRef.current = true;
      
      const cardRect = cardRef.current.getBoundingClientRect();
      const mouseRelX = clientX - cardRect.left;
      const mouseRelY = clientY - cardRect.top;

      // Standard Math (no inversion needed because the container + backface double-rotate cancels out)
      const newX = mouseRelX - dragOffset.x;
      const newY = mouseRelY - dragOffset.y;
      
      const isBackItem = ['backImage', 'bio', 'stats', 'rating'].includes(dragTarget);

      if (isBackItem) {
        setBackPositions(prev => ({ ...prev, [dragTarget]: { x: newX, y: newY } }));
      } else {
        setPositions(prev => ({ ...prev, [dragTarget]: { x: newX, y: newY } }));
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => setDragTarget(null);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault(); 
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => setDragTarget(null);

    if (dragTarget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragTarget, dragOffset]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, target: string) => {
    if (e.cancelable && e.type === 'touchstart') e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;
    
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const isBackItem = ['backImage', 'bio', 'stats', 'rating'].includes(target);
    const currentItemX = isBackItem 
      ? backPositions[target as keyof typeof backPositions].x 
      : positions[target as keyof typeof positions].x;
    
    const currentItemY = isBackItem 
      ? backPositions[target as keyof typeof backPositions].y 
      : positions[target as keyof typeof positions].y;

    const mouseRelX = clientX - cardRect.left;
    const mouseRelY = clientY - cardRect.top;

    setDragOffset({ 
        x: mouseRelX - currentItemX, 
        y: mouseRelY - currentItemY 
    });
    setDragTarget(target);
  };

  const handleResetLayout = () => {
    setPositions({
      logo: { x: 230, y: 35 },
      image: { x: 0, y: 0 },
      groupHeader: { x: 0, y: 30 },     
      groupFooter: { x: 0, y: 400 },    
      impactNumber: { x: 200, y: 325 },
      splatterName: { x: 0, y: 30 },
      splatterPosNum: { x: 0, y: 375 },
      splatterTeam: { x: 0, y: 400 },
      stdTeam: { x: 32, y: 360 },
      stdName: { x: 29, y: 380 },
      stdNumber: { x: 230, y: 345 },
      stdPos: { x: 32, y: 425 }
    });
    setBackPositions({
      backImage: { x: 0, y: 0 },
      bio: { x: 30, y: 330 },
      stats: { x: 60, y: 170 },
      rating: { x: 200, y: 50 }
    });
    setShowPowerRating(true);
    setImageScale(1);
    setBackImageScale(1);
    setLogoScale(1);
  };

  const processImage = async (file: File, isBack = false) => {
    if (isBack) {
      setIsBackImageProcessing(true);
      setBackImagePreview(null);
    } else {
      setIsProcessing(true);
      setImagePreview(null);
    }

    try {
      const blob = await removeBackground(file);

      // Convert blob to data URL immediately (iOS-friendly)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        console.log('Background removed, converted to data URL for', isBack ? 'back' : 'front');
        if (isBack) setBackImagePreview(dataUrl);
        else setImagePreview(dataUrl);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Background removal failed:", error);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isBack) setBackImagePreview(reader.result as string);
        else setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      if (isBack) {
        setIsBackImageProcessing(false);
        setBackImageCropMode(false);
      } else {
        setIsProcessing(false);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processImage(e.target.files[0], false);
  };
  
  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Instead of processing immediately, store for crop editor
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempCropImage(reader.result as string);
        setBackImageCropMode(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleClearLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!cardRef.current) {
    alert('Preview not available');
    return;
  }

  // iOS Workaround: Always do double-capture to prime iOS rendering
  console.log('iOS Workaround: Starting double-capture process...');
  setIsProcessingWorkaround(true);

  try {
    const cardContainer = cardRef.current;
    const wasShowingBack = showBack;

    // FIRST CAPTURE (primes the iOS cache, might be blank)
    console.log('iOS Workaround: First capture (priming cache)...');
        // Helper to force canvas redraw
    const forceCanvasRedraw = () => {
      return new Promise<void>((resolve) => {
        // Trigger a state change that will cause useEffect to run
        const currentBg = backgroundStyle;
        setBackgroundStyle(''); // Clear it
        
        requestAnimationFrame(() => {
          setBackgroundStyle(currentBg); // Restore it
          
          // Wait for the useEffect to complete
          setTimeout(() => {
            resolve();
          }, 300);
        });
      });
    };
    // Helper to convert blob URL to data URL
    const blobToDataURL = async (blobUrl: string): Promise<string> => {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    
    // Convert all blob images to data URLs before capture
    const convertBlobImages = async (element: HTMLElement) => {
      const images = element.querySelectorAll('img');
      for (const img of Array.from(images)) {
        if (img.src.startsWith('blob:')) {
          try {
            const dataUrl = await blobToDataURL(img.src);
            img.src = dataUrl;
          } catch (err) {
            console.warn('Failed to convert blob image:', err);
          }
        }
      }
    };
    
// Helper to wait for all images in an element to load
const waitForImages = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
  console.log(`Found ${images.length} images to wait for`);

  const imagePromises = images.map(img => {
    if (img.complete && img.naturalWidth > 0) {
      console.log('Image already loaded:', img.src.substring(0, 50));
      return Promise.resolve();
    }
    console.log('Waiting for image to load:', img.src.substring(0, 50));
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        console.log('Image loaded:', img.src.substring(0, 50));
        resolve();
      };
      img.onerror = () => {
        console.warn('Image failed to load, continuing anyway:', img.src.substring(0, 50));
        resolve(); // Resolve anyway to not block
      };
      // Force reload if src is set but not loaded
      if (img.src) {
        const currentSrc = img.src;
        img.src = '';
        img.src = currentSrc;
      }
    });
  });

  await Promise.all(imagePromises);
  console.log('All images loaded');
};

// Helper to ensure canvas has rendered
const waitForCanvasRender = async (element: HTMLElement): Promise<void> => {
  const canvases = Array.from(element.querySelectorAll('canvas')) as HTMLCanvasElement[];
  console.log(`Found ${canvases.length} canvases to check`);

  // Force a reflow to ensure canvas is painted
  void element.offsetHeight;

  // Wait for next animation frame (ensures paint cycle completes)
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))));

  // Wait for browser to complete painting - iOS needs more time
  await new Promise(resolve => setTimeout(resolve, 500));

  // Double-check canvases have content - retry up to 3 times if empty
  for (const canvas of canvases) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let hasContent = false;
      let retries = 0;
      const maxRetries = 3;

      while (!hasContent && retries < maxRetries) {
        try {
          const imageData = ctx.getImageData(0, 0, Math.min(10, canvas.width), Math.min(10, canvas.height));
          hasContent = imageData.data.some(value => value !== 0);
          console.log(`Canvas has content (attempt ${retries + 1}): ${hasContent}`);

          if (!hasContent && retries < maxRetries - 1) {
            console.warn(`Canvas appears empty, retry ${retries + 1}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 700));
          }
          retries++;
        } catch (err) {
          console.warn('Could not read canvas data (may be tainted):', err);
          // Canvas may be tainted by cross-origin image, assume it's okay
          hasContent = true;
        }
      }

      if (!hasContent) {
        console.error('Canvas still empty after retries, proceeding anyway...');
      }
    }
  }
};

// Helper to capture a face
const captureFace = async (faceSelector: string, faceName: string) => {
  console.log(`Capturing ${faceName}...`);
  const face = cardContainer.querySelector(faceSelector) as HTMLElement;
  if (!face) {
    throw new Error(`${faceName} face not found`);
  }
  // Store original transform
  const originalTransform = face.style.transform;

  // Add capturing class to disable animations
  face.classList.add('capturing');

  // Remove the rotateY transform for back face
  if (faceSelector.includes('back')) {
    face.style.transform = 'rotateY(0deg)';
    await new Promise(resolve => setTimeout(resolve, 100));
   } else {
        // Still wait a bit for front face
        await new Promise(resolve => setTimeout(resolve, 100));
      }

  // CRITICAL: Wait for all images to load completely
  await waitForImages(face);

  // CRITICAL: Wait for canvas rendering to complete
  await waitForCanvasRender(face);

  // Convert blob images to data URLs
  await convertBlobImages(face);

  // Final wait for any remaining paint operations (iOS needs this)
  await new Promise(resolve => setTimeout(resolve, 200));

  // Capture
  console.log(`Starting toPng for ${faceName}...`);
  const dataUrl = await toPng(face, {
    width: 320,
    height: 480,
    pixelRatio: 2.34375,
    backgroundColor: '#1e293b',
    cacheBust: true,
    skipFonts: false,
  });
  console.log(`${faceName} captured successfully, data length:`, dataUrl.length);
  // Restore original transform and remove capturing class
  face.style.transform = originalTransform;
  face.classList.remove('capturing');
  return dataUrl;
};
    // --- CAPTURE FRONT ---
    console.log('Setting to front view...');
    setShowBack(false);

    // iOS-specific: Wait for multiple browser paint cycles
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 1000);
          });
        });
      });
    });

    const firstFrontDataUrl = await captureFace('[data-card-face="front"]', 'Front (first)');

    let firstBackDataUrl = '';
    if (createBackMode) {
      console.log('Setting to back view...');
      setShowBack(true);
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 1000);
            });
          });
        });
      });
      firstBackDataUrl = await captureFace('[data-card-face="back"]', 'Back (first)');
    }

    console.log('iOS Workaround: First capture complete (might be blank). Waiting then doing second capture...');

    // Wait a bit for iOS to settle
    await new Promise(resolve => setTimeout(resolve, 800));

    // SECOND CAPTURE (this should be perfect!)
    console.log('iOS Workaround: Second capture (final)...');
    setShowBack(false);
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 1000);
          });
        });
      });
    });

    const frontDataUrl = await captureFace('[data-card-face="front"]', 'Front (final)');

    let backDataUrl = '';
    if (createBackMode) {
      console.log('Setting to back view for final capture...');
      setShowBack(true);
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 1000);
            });
          });
        });
      });
      backDataUrl = await captureFace('[data-card-face="back"]', 'Back (final)');
    }

    console.log('iOS Workaround: Both captures complete, navigating to checkout...');
    // Restore original view
    setShowBack(wasShowingBack);

    // Send to checkout with FINAL (second) capture
    if (setPendingOrder) {
      setPendingOrder({
        frontDataUrl,
        backDataUrl,
        details,
        backDetails,
        colors,
        backgroundStyle,
        borderStyle,
        showLogo,
        enableBorder
      });
    }

    // Hide overlay and navigate to checkout
    setIsProcessingWorkaround(false);

    if (setPage) {
      setPage('checkout');
    }
  } catch (err) {
    console.error('Full error object:', err);

    // Hide processing overlay on error
    setIsProcessingWorkaround(false);

    let errorMessage = 'Unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
      console.error('Error stack:', err.stack);
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else {
      errorMessage = 'Capture failed - check console for details';
    }
    alert(`Failed to create order preview: ${errorMessage}`);
  }
};
  // --- PROCEDURAL GENERATION: FRONT AND BACK ---
  useEffect(() => {
    const drawPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, isForeground = false) => {
        const dpr = 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.scale(dpr, dpr);

        const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const rng = (min: number, max: number) => Math.random() * (max - min) + min;
        const primaryPalette = getColorVariants(colors.primary);
        const secondaryPalette = getColorVariants(colors.secondary);

        const pickVariant = (palette: ReturnType<typeof getColorVariants>, alpha: number = 1) => {
            const variants = [palette.lighter2, palette.lighter1, palette.base, palette.darker1, palette.darker2];
            const chosen = variants[Math.floor(Math.random() * variants.length)];
            return alpha < 1 ? hexToRgba(chosen, alpha) : chosen;
        };

        if (backgroundStyle === 'shatter') {
            const cx = 160;
            const cy = 240;
            if (!isForeground) {
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 350);
                grad.addColorStop(0, '#1a1a1a');
                grad.addColorStop(1, '#000000');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 320, 480);
                for (let i = 0; i < 30; i++) {
                    ctx.beginPath();
                    const x = rng(-50, 370);
                    const y = rng(-50, 530);
                    const s = rng(80, 250); 
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
                    ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
                    ctx.fillStyle = i % 2 === 0 ? pickVariant(primaryPalette, 0.5) : pickVariant(secondaryPalette, 0.4);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.stroke();
                }
                ctx.globalCompositeOperation = 'screen'; 
                for(let i=0; i<80; i++) {
                    const x = rng(20, 300); const y = rng(100, 400); const r = rng(40, 100); 
                    const dustGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
                    dustGrad.addColorStop(0, 'rgba(220, 220, 220, 0.08)'); dustGrad.addColorStop(0.4, pickVariant(primaryPalette, 0.03)); dustGrad.addColorStop(1, 'rgba(0,0,0,0)'); 
                    ctx.fillStyle = dustGrad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
                }
                ctx.globalCompositeOperation = 'source-over';
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
                ctx.strokeStyle = pickVariant(primaryPalette, 0.4); ctx.lineWidth = 1; ctx.stroke();
            } else {
                ctx.globalCompositeOperation = 'screen';
                for(let i=0; i<40; i++) {
                    const x = rng(20, 300); const y = rng(250, 480); const r = rng(30, 80);
                    const mistGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
                    mistGrad.addColorStop(0, 'rgba(220, 220, 220, 0.06)'); mistGrad.addColorStop(0.5, pickVariant(primaryPalette, 0.02)); mistGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = mistGrad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
                }
                ctx.globalCompositeOperation = 'source-over';
                ctx.shadowBlur = 10;
                for (let i = 0; i < 8; i++) {
                    const x = rng(50, 270); const y = rng(100, 400); const dist = Math.sqrt(Math.pow(x-160,2) + Math.pow(y-160,2));
                    if(dist < 120) continue; 
                    ctx.beginPath(); ctx.moveTo(x, y); const s = rng(20, 60);
                    ctx.lineTo(x + rng(-s, s), y + rng(-s, s)); ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
                    const isPrimary = Math.random() > 0.5;
                    ctx.fillStyle = isPrimary ? pickVariant(primaryPalette, 0.25) : pickVariant(secondaryPalette, 0.25);
                    ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.5; ctx.stroke();
                }
                for (let i = 0; i < 60; i++) {
                    let x, y; const zone = Math.random();
                    if (zone < 0.33) { x = rng(-20, 50); y = rng(0, 480); } else if (zone < 0.66) { x = rng(270, 340); y = rng(0, 480); } else { x = rng(0, 320); y = rng(-20, 80); } 
                    ctx.beginPath(); ctx.moveTo(x, y); const s = rng(10, 40);
                    ctx.lineTo(x + rng(-s, s), y + rng(-s, s)); ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
                    const style = Math.random();
                    if (style > 0.6) ctx.fillStyle = pickVariant(primaryPalette, 0.7);
                    else if (style > 0.3) ctx.fillStyle = pickVariant(secondaryPalette, 0.7);
                    else ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5; ctx.stroke();
                }
                ctx.shadowBlur = 0;
                for(let i=0; i<8; i++) {
                    const x = rng(0, 320); const y = rng(0, 480);
                    if (Math.abs(x - 160) < 100 && Math.abs(y - 200) < 100) continue;
                    const s = rng(50, 100);
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rng(-s, s), y + rng(-s, s)); ctx.lineTo(x + rng(-s, s), y + rng(-s, s));
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 0.5; ctx.stroke();
                }
                for(let i=0; i<250; i++) {
                    const x = rng(0, 320); const y = rng(0, 480);
                    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
                    ctx.globalAlpha = rng(0.3, 0.7);
                    ctx.fillRect(x, y, rng(1,2), rng(1,2));
                }
                ctx.globalAlpha = 1;
            }
        }
        else if (backgroundStyle === 'radar' && !isForeground) {
            const cx = 160; const cy = 200;
            const baseGrad = ctx.createLinearGradient(0, 0, 320, 480);
            baseGrad.addColorStop(0, pickVariant(primaryPalette, 0.15));
            baseGrad.addColorStop(1, pickVariant(secondaryPalette, 0.1));
            ctx.fillStyle = baseGrad;
            ctx.fillRect(0, 0, 320, 480);

            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 350);
            coreGrad.addColorStop(0, pickVariant(primaryPalette, 0.3)); 
            coreGrad.addColorStop(0.5, pickVariant(secondaryPalette, 0.1));
            coreGrad.addColorStop(1, '#020202');
            ctx.fillStyle = coreGrad;
            ctx.fillRect(0, 0, 320, 480);

            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            for(let i=-200; i<600; i+=40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i-100, 480); ctx.stroke();
            }

            for(let r=20; r < 500; r+=rng(8, 20)) {
                ctx.beginPath();
                const startAngle = rng(0, Math.PI * 2);
                const endAngle = startAngle + rng(2, 5); 
                ctx.arc(cx, cy, r, startAngle, endAngle);
                const isSecondary = Math.random() > 0.5;
                const palette = isSecondary ? secondaryPalette : primaryPalette;
                if (Math.random() > 0.6) {
                    ctx.strokeStyle = pickVariant(palette, 0.2);
                    ctx.lineWidth = rng(15, 40);
                } else {
                    ctx.strokeStyle = pickVariant(palette, 0.6);
                    ctx.lineWidth = rng(1, 3);
                    if(Math.random() > 0.5) ctx.setLineDash([rng(5, 20), rng(5, 10)]);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.shadowBlur = 15;
            ctx.shadowColor = colors.secondary;
            for(let i=0; i<12; i++) {
                const r = rng(80, 420);
                const width = rng(2, 6);
                const start = rng(0, Math.PI * 2);
                const end = start + rng(0.5, 1.5);
                ctx.beginPath();
                ctx.arc(cx, cy, r, start, end);
                ctx.strokeStyle = pickVariant(secondaryPalette, 1);
                ctx.lineWidth = width;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            
            for(let i=0; i<25; i++) {
                const r = rng(60, 400);
                const theta = rng(0, Math.PI * 2);
                const w = rng(15, 50);
                const h = rng(6, 15);
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(theta);
                const palette = r > 250 ? secondaryPalette : primaryPalette;
                ctx.fillStyle = pickVariant(palette, 0.8);
                ctx.fillRect(r, -h/2, w, h);
                ctx.beginPath();
                ctx.moveTo(r+w, 0);
                ctx.lineTo(r+w+rng(20,60), 0);
                ctx.strokeStyle = pickVariant(palette, 0.5);
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
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
        }
        else if (backgroundStyle === 'radar' && isForeground) {
            const nameY = 360; 
            const nameHeight = 70;
            ctx.beginPath();
            ctx.moveTo(20, nameY); 
            ctx.lineTo(300, nameY); 
            ctx.lineTo(310, nameY + nameHeight); 
            ctx.lineTo(10, nameY + nameHeight); 
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = colors.secondary;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(10, nameY + nameHeight);
            ctx.lineTo(310, nameY + nameHeight);
            ctx.lineTo(300, nameY + nameHeight + 25);
            ctx.lineTo(20, nameY + nameHeight + 25);
            ctx.fillStyle = '#1a1a1a';
            ctx.fill();
        }
        else if (backgroundStyle === 'classic-enhanced' && !isForeground) {
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
                const strokeGrad = ctx.createLinearGradient(x, y, x + Math.cos(angle) * length, y + Math.sin(angle) * length);
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
                ctx.fillStyle = pickVariant(palette, 0.12);
                ctx.fill();
            }

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
        else if (backgroundStyle === 'energy' && !isForeground) {
             ctx.fillStyle = '#020617';
             ctx.fillRect(0, 0, 320, 480);
             const centerGlow = ctx.createRadialGradient(160, 240, 0, 160, 240, 300);
             centerGlow.addColorStop(0, pickVariant(primaryPalette, 0.3));
             centerGlow.addColorStop(0.5, pickVariant(primaryPalette, 0.15));
             centerGlow.addColorStop(1, 'transparent');
             ctx.fillStyle = centerGlow;
             ctx.fillRect(0,0, 320, 480);

             const drawBolt = (x1: number, y1: number, x2: number, y2: number, width: number, colorPalette: any, depth: number = 0) => {
                 const dx = x2 - x1; const dy = y2 - y1;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 if (depth > 6 || dist < 10) {
                     const color = pickVariant(colorPalette, 1);
                     ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width;
                     ctx.lineCap = 'round'; ctx.shadowBlur = width * 3; ctx.shadowColor = color;
                     ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                     return;
                 }
                 const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
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
             ctx.shadowBlur = 0;
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
        else if (backgroundStyle === 'splatter' && !isForeground) {
             const gradient = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
             gradient.addColorStop(0, '#2a2a2a');
             gradient.addColorStop(1, '#050505'); 
             ctx.fillStyle = gradient;
             ctx.fillRect(0, 0, 320, 480);
             for(let i=0; i<8000; i++) {
                 ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)';
                 ctx.fillRect(Math.random() * 320, Math.random() * 480, 1.5, 1.5);
             }
             const drawPaintball = (cx: number, cy: number, radius: number, palette: ReturnType<typeof getColorVariants>) => {
                const color = pickVariant(palette, 1);
                ctx.fillStyle = color;
                
                ctx.beginPath();
                for(let i=0; i<Math.PI*2; i+=0.1) {
                    const r = radius * (0.7 + Math.random() * 0.6); 
                    ctx.lineTo(cx + Math.cos(i)*r, cy + Math.sin(i)*r);
                }
                ctx.fill();
      
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
             const drawPowerStroke = (x1: number, y1: number, x2: number, y2: number, palette: any, thickness: number) => {
                 const dx = x2 - x1; const dy = y2 - y1; const dist = Math.sqrt(dx*dx + dy*dy); const angle = Math.atan2(dy, dx);
                 ctx.save(); ctx.translate(x1, y1); ctx.rotate(angle);
                 const bristles = thickness * 3;
                 for(let i=0; i<bristles; i++) {
                     const offset = (Math.random() - 0.5) * thickness;
                     const lengthFactor = 0.5 + Math.random() * 0.7; const currentLen = dist * lengthFactor;
                     ctx.globalAlpha = 0.4 + Math.random() * 0.6; ctx.lineWidth = 0.5 + Math.random() * 2.5;
                     ctx.strokeStyle = pickVariant(palette, 1);
                     ctx.beginPath(); ctx.moveTo(0, offset);
                     ctx.bezierCurveTo(currentLen * 0.3, offset + rng(-15, 15), currentLen * 0.7, offset + rng(-30, 30), currentLen, offset + rng(-10, 10));
                     ctx.stroke();
                 }
                 ctx.restore();
             };
             drawPowerStroke(-80, 80, 380, 450, secondaryPalette, 140);
             drawPowerStroke(380, -80, -80, 520, primaryPalette, 160);
             for(let i=0; i<7; i++) {
                const x = rng(40, 280);
                const y = rng(80, 400);
                const palette = Math.random() > 0.4 ? primaryPalette : secondaryPalette;
                drawPaintball(x, y, rng(10, 30), palette);
            }
             for(let i=0; i<15; i++) {
                 const x = rng(0, 320); const y = rng(0, 400);
                 const w = rng(1.5, 4); const h = rng(60, 180);
                 const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
                 ctx.fillStyle = pickVariant(palette, rng(0.7, 1));
                 ctx.globalAlpha = 0.9;
                 ctx.beginPath(); ctx.rect(x, y, w, h); ctx.arc(x + w/2, y + h, w, 0, Math.PI*2); ctx.fill();
                 ctx.globalAlpha = 1;
             }
             for(let i=0; i<5; i++) {
                const x = rng(20, 300);
                const y = rng(20, 460);
                const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
                drawPaintball(x, y, rng(5, 15), palette);
            }
        }
        else if (backgroundStyle === 'velocity' && !isForeground) {
             const bgGrad = ctx.createLinearGradient(0, 480, 320, 0);
             bgGrad.addColorStop(0, '#020617');
             bgGrad.addColorStop(0.4, pickVariant(primaryPalette, 0.2));
             bgGrad.addColorStop(1, pickVariant(secondaryPalette, 0.15));
             ctx.fillStyle = bgGrad;
             ctx.fillRect(0, 0, 320, 480);
             const angle = 60 * (Math.PI / 180); const cos = Math.cos(angle); const sin = Math.sin(angle);
             ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.03)';
             for(let i=-200; i<600; i+=40) {
                 ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 300 * cos, 480); ctx.stroke();
             }
             for (let i = 0; i < 300; i++) {
                 const x = rng(-200, 500); const y = rng(-200, 680);
                 const length = rng(50, 400); const speed = rng(0.5, 1.5);
                 let strokeColor;
                 if (speed > 1.2) strokeColor = '#ffffff';
                 else if (Math.random() > 0.5) strokeColor = pickVariant(primaryPalette, 0.6 * speed);
                 else strokeColor = pickVariant(secondaryPalette, 0.6 * speed);
                 const lineGrad = ctx.createLinearGradient(x, y, x + cos*length, y + sin*length);
                 lineGrad.addColorStop(0, 'transparent'); lineGrad.addColorStop(0.5, strokeColor); lineGrad.addColorStop(1, 'transparent');
                 ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cos * length, y + sin * length);
                 ctx.strokeStyle = lineGrad; ctx.lineWidth = speed * 2; ctx.lineCap = 'round'; ctx.stroke();
             }
             for(let i=0; i<15; i++) {
                 const x = rng(0, 300); const y = rng(0, 450); const size = rng(10, 30);
                 ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
                 ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size/2, size/2); ctx.lineTo(0, size);
                 ctx.moveTo(size/2, 0); ctx.lineTo(size, size/2); ctx.lineTo(size/2, size);
                 ctx.strokeStyle = i % 2 === 0 ? pickVariant(primaryPalette, 0.8) : pickVariant(secondaryPalette, 0.8);
                 ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle;
                 ctx.stroke(); ctx.restore();
             }
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
        else if (backgroundStyle === 'cyber' && !isForeground) {
             const horizonY = 180;
             const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
             bgGrad.addColorStop(0, '#020205'); bgGrad.addColorStop(0.6, '#0a0f1e'); bgGrad.addColorStop(1, pickVariant(primaryPalette, 0.15));
             ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, 320, 480);
             ctx.lineWidth = 1;
             for (let i = -300; i <= 620; i += 40) {
                 ctx.beginPath(); ctx.moveTo(i, 480);
                 const perspectiveFactor = (i - 160) * 0.15; ctx.lineTo(160 + perspectiveFactor, horizonY);
                 const lineGrad = ctx.createLinearGradient(0, 480, 0, horizonY);
                 lineGrad.addColorStop(0, pickVariant(primaryPalette, 0.4)); lineGrad.addColorStop(1, 'transparent');
                 ctx.strokeStyle = lineGrad; ctx.stroke();
             }
             for (let i = 1; i <= 20; i++) {
                 const t = i / 20; const y = horizonY + (480 - horizonY) * (t * t);
                 ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(320, y);
                 const hGrad = ctx.createLinearGradient(0, 0, 320, 0);
                 hGrad.addColorStop(0, 'transparent'); hGrad.addColorStop(0.5, pickVariant(primaryPalette, 0.3)); hGrad.addColorStop(1, 'transparent');
                 ctx.strokeStyle = hGrad; ctx.stroke();
             }
             for(let i=0; i<35; i++) {
                 const w = rng(15, 50); const x = rng(-20, 340);
                 if(Math.abs(x - 160) < 50) continue; 
                 const topY = rng(-50, 100); const bottomY = horizonY + rng(20, 100);
                 const blockGrad = ctx.createLinearGradient(x, topY, x, bottomY);
                 blockGrad.addColorStop(0, 'transparent'); blockGrad.addColorStop(0.3, pickVariant(primaryPalette, 0.15)); blockGrad.addColorStop(0.9, pickVariant(primaryPalette, 0.05)); blockGrad.addColorStop(1, 'transparent');
                 ctx.fillStyle = blockGrad; ctx.fillRect(x, topY, w, bottomY - topY);
                 ctx.strokeStyle = pickVariant(primaryPalette, 0.2); ctx.lineWidth = 0.5; ctx.strokeRect(x, topY, w, bottomY - topY);
                 if(Math.random() > 0.6) {
                    const lightY = rng(topY + 50, bottomY - 50);
                    ctx.fillStyle = pickVariant(secondaryPalette, 0.9);
                    ctx.fillRect(x + rng(2, w-4), lightY, 2, rng(2, 10));
                }
             }
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
             const drawCircuit = (startX: number, startY: number, color: string, width: number) => {
                 ctx.beginPath(); ctx.moveTo(startX, startY);
                 let currX = startX; let currY = startY; const segments = Math.floor(rng(5, 10)); 
                 for(let i=0; i<segments; i++) {
                     const lenY = rng(30, 90); currY -= lenY; ctx.lineTo(currX, currY);
                     if (currY < horizonY + 20) break;
                     const lenX = rng(-40, 40); ctx.lineTo(currX + lenX, currY); currX += lenX;
                 }
                 ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'square'; ctx.lineJoin = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
                 ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(currX, currY, width + 1, 0, Math.PI*2); ctx.fill();
             };
             for(let i=0; i<20; i++) drawCircuit(rng(0, 320), 490, pickVariant(primaryPalette, rng(0.7, 1.0)), rng(1, 2.5));
             for(let i=0; i<12; i++) drawCircuit(rng(0, 320), 490, pickVariant(secondaryPalette, rng(0.7, 1.0)), rng(1, 2));
             
             for(let i=0; i<60; i++) {
                const x = rng(0, 320);
                const y = rng(0, 480);
                const s = rng(1, 2.5);
                
                ctx.fillStyle = Math.random() > 0.7 ? '#ffffff' : pickVariant(primaryPalette, 0.5);
                ctx.globalAlpha = rng(0.3, 0.8);
                ctx.fillRect(x, y, s, s);
             }
             ctx.globalAlpha = 1;
             const flare = ctx.createRadialGradient(160, horizonY, 0, 160, horizonY, 200);
             flare.addColorStop(0, pickVariant(primaryPalette, 0.4)); flare.addColorStop(0.5, 'transparent');
             ctx.fillStyle = flare; ctx.fillRect(0, 0, 320, 480);
        }
        else if (backgroundStyle === 'impact' && !isForeground) {
             ctx.fillStyle = '#e0e0e0'; ctx.fillRect(0, 0, 320, 480);
             ctx.fillStyle = '#cccccc';
             for(let x=0; x<320; x+=8) { for(let y=0; y<480; y+=8) { if ((x+y)%16 === 0) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill(); }}}
             const cx = 160; const cy = 200;
             const drawSpikeBurst = (count: number, minLen: number, maxLen: number, widthMin: number, widthMax: number, colorPalette: any) => {
                 for(let i=0; i<count; i++) {
                     const angle = rng(0, Math.PI * 2); const length = rng(minLen, maxLen); const width = rng(widthMin, widthMax);
                     ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
                     ctx.beginPath(); ctx.moveTo(0, -width/2); ctx.lineTo(length, 0); ctx.lineTo(0, width/2);
                     ctx.fillStyle = pickVariant(colorPalette, 0.9); ctx.fill();
                     ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
                     ctx.restore();
                 }
             };
             drawSpikeBurst(20, 200, 400, 40, 100, primaryPalette);
             drawSpikeBurst(50, 100, 380, 10, 50, primaryPalette);
             drawSpikeBurst(40, 80, 300, 5, 30, secondaryPalette);
             for(let i=0; i<30; i++) {
                 const angle = rng(0, Math.PI * 2); const length = rng(50, 250); const width = rng(2, 12);
                 ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); ctx.fillStyle = '#000000';
                 ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(length, -width); ctx.lineTo(length * 0.9, 0); ctx.lineTo(length, width); ctx.fill(); ctx.restore();
             }
        }
        else if (backgroundStyle === 'impact' && isForeground) {
     ctx.fillStyle = 'rgba(17, 17, 17, 0.3)'; // Much more transparent
     for(let i=0; i<150; i++) { // Reduced from 500 to 150
         const x = rng(0, 320); const y = rng(0, 480); const s = rng(0.3, 1.5); // Smaller particles
         const dist = Math.sqrt(Math.pow(x-160,2) + Math.pow(y-200,2));
         if(dist < 120 && Math.random() > 0.3) continue; // Larger clear area around center
         
         ctx.globalAlpha = rng(0.2, 0.5); // Variable transparency
         if (Math.random() > 0.5) ctx.fillRect(x, y, s, s); 
         else { ctx.beginPath(); ctx.arc(x, y, s/2, 0, Math.PI*2); ctx.fill(); }
     }
     ctx.globalAlpha = 1; // Reset alpha
}
        else if (backgroundStyle === 'hurricane' && !isForeground) {
             const grad = ctx.createRadialGradient(160, 240, 0, 160, 240, 400);
             grad.addColorStop(0, '#0f172a'); grad.addColorStop(1, '#020617');
             ctx.fillStyle = grad; ctx.fillRect(0, 0, 320, 480);
             const eye = ctx.createRadialGradient(160, 240, 5, 160, 240, 50);
             eye.addColorStop(0, pickVariant(primaryPalette, 0.4)); eye.addColorStop(0.5, pickVariant(primaryPalette, 0.2)); eye.addColorStop(1, 'transparent');
             ctx.fillStyle = eye; ctx.fillRect(0, 0, 320, 480);
             const cx = 160; const cy = 240; const maxR = 400;
             for(let i=0; i<500; i++) {
                 const r = rng(20, maxR); const theta = rng(0, Math.PI*2);
                 const x = cx + Math.cos(theta) * r; const y = cy + Math.sin(theta) * r;
                 ctx.beginPath(); ctx.arc(x, y, rng(5, 25), 0, Math.PI*2);
                 const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
                 const alpha = 0.02 + (1 - r/maxR) * 0.06;
                 ctx.fillStyle = pickVariant(palette, alpha); ctx.fill();
             }
             for (let i = 0; i < 700; i++) {
                 const r = Math.pow(Math.random(), 0.7) * maxR; const armIndex = i % 3; const spiralOffset = r * 0.025;
                 const theta = (armIndex * (Math.PI * 2 / 3)) + spiralOffset + (Math.random() - 0.5) * 0.6;
                 const x = cx + Math.cos(theta) * r; const y = cy + Math.sin(theta) * r;
                 const trailTheta = theta - 0.2; const tx = cx + Math.cos(trailTheta) * (r + 5); const ty = cy + Math.sin(trailTheta) * (r + 5);
                 ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (tx-x)/2, y + (ty-y)/2, tx, ty);
                 const palette = Math.random() > 0.5 ? primaryPalette : secondaryPalette;
                 ctx.strokeStyle = pickVariant(palette, rng(0.2, 0.6)); ctx.lineWidth = rng(0.5, 3); ctx.lineCap = 'round'; ctx.stroke();
             }
             for(let i=0; i<12; i++) {
                 const r = rng(40, 250); const armIndex = i % 3; const spiralOffset = r * 0.025;
                 const theta = (armIndex * (Math.PI * 2 / 3)) + spiralOffset + rng(-0.2, 0.2);
                 const x = cx + Math.cos(theta) * r; const y = cy + Math.sin(theta) * r;
                 ctx.beginPath(); ctx.moveTo(x,y);
                 let currX = x, currY = y;
                 for(let j=0; j<6; j++) { currX += rng(-15, 15); currY += rng(-15, 15); ctx.lineTo(currX, currY); }
                 const palette = i % 2 === 0 ? primaryPalette : secondaryPalette;
                 ctx.strokeStyle = pickVariant(palette, 1); ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = pickVariant(palette, 1); ctx.stroke();
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
    };

    // 2. Draw Front Canvas (Using Shared Logic)
    if (canvasRef.current) {
      const dpr = 1;
      canvasRef.current.width = 320 * dpr;
      canvasRef.current.height = 480 * dpr;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) drawPattern(ctx, 320, 480, false);
    }
    // 3. Draw Front Foreground (Using Shared Logic)
    if (foregroundCanvasRef.current) {
      const dpr = 1;
      foregroundCanvasRef.current.width = 320 * dpr;
      foregroundCanvasRef.current.height = 480 * dpr;
      const ctx = foregroundCanvasRef.current.getContext('2d');
      if (ctx) drawPattern(ctx, 320, 480, true);
    }
    // 4. Draw Back Canvas (Using Shared Logic - Reusing "false" for background pattern)
    if (backCanvasRef.current) {
      const dpr = 1;
      backCanvasRef.current.width = 320 * dpr;
      backCanvasRef.current.height = 480 * dpr;
      const ctx = backCanvasRef.current.getContext('2d');
      if (ctx) drawPattern(ctx, 320, 480, false);
    }

  }, [backgroundStyle, colors]); // REMOVED isFullScreen to fix "blank" glitch

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
      {/* CROP EDITOR MODAL */}
      {(backImageCropMode || isBackImageProcessing) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-white font-['Teko']">{isBackImageProcessing ? 'PROCESSING' : 'POSITION HEADSHOT'}</h3>
            
            {isBackImageProcessing ? (
              // Processing state
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <span className="text-cyan-400 font-bold">Processing Headshot...</span>
                <span className="text-xs text-gray-500">Removing background with AI...</span>
              </div>
            ) : (
              <>
                {/* Circular Preview with Draggable Image - SAME SIZE as card (w-32 = 128px) */}
                {tempCropImage && (
                <div className="relative w-32 h-32 mx-auto">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-cyan-500 overflow-hidden bg-black shadow-lg"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <img
                      src={tempCropImage}
                      alt="Crop preview"
                      className="w-full h-full cursor-move select-none"
                      style={{
                        transform: `translate(${backImageCropData.offsetX}px, ${backImageCropData.offsetY}px) scale(${backImageCropData.scale})`,
                        transformOrigin: 'center',
                        transition: 'none',
                        userSelect: 'none',
                        touchAction: 'none',
                        WebkitUserSelect: 'none'
                      }}
                      onMouseDown={(e) => {
                        const startX = e.clientX - backImageCropData.offsetX;
                        const startY = e.clientY - backImageCropData.offsetY;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const newOffsetX = moveEvent.clientX - startX;
                          const newOffsetY = moveEvent.clientY - startY;
                          setBackImageCropData({
                            ...backImageCropData,
                            offsetX: Math.max(-64, Math.min(64, newOffsetX)),
                            offsetY: Math.max(-64, Math.min(64, newOffsetY))
                          });
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault(); // Prevent scrolling
                        const touch = e.touches[0];
                        const startX = touch.clientX - backImageCropData.offsetX;
                        const startY = touch.clientY - backImageCropData.offsetY;

                        const handleTouchMove = (moveEvent: TouchEvent) => {
                          const moveTouch = moveEvent.touches[0];
                          const newOffsetX = moveTouch.clientX - startX;
                          const newOffsetY = moveTouch.clientY - startY;
                          setBackImageCropData({
                            ...backImageCropData,
                            offsetX: Math.max(-64, Math.min(64, newOffsetX)),
                            offsetY: Math.max(-64, Math.min(64, newOffsetY))
                          });
                        };

                        const handleTouchEnd = () => {
                          document.removeEventListener('touchmove', handleTouchMove as any);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };

                        document.addEventListener('touchmove', handleTouchMove as any, { passive: false });
                        document.addEventListener('touchend', handleTouchEnd);
                      }}
                    />
                  </div>
                </div>
                )}

                {/* Zoom Slider */}
                {tempCropImage && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Zoom</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.05" 
                    value={backImageCropData.scale}
                    onChange={(e) => setBackImageCropData({
                      ...backImageCropData,
                      scale: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="text-xs text-gray-500 text-right">{Math.round(backImageCropData.scale * 100)}%</div>
                </div>
                )}

                {/* Controls */}
                {tempCropImage && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBackImageCropMode(false);
                      setTempCropImage(null);
                      setBackImageCropData({ offsetX: 0, offsetY: 0, scale: 1 });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Apply background removal to the temp image
                      setIsBackImageProcessing(true);
                      // Process the image through background removal
                      processImage(backFileInputRef.current?.files?.[0] || new File([], ''), true);
                    }}
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors text-sm font-medium"
                  >
                    Done
                  </button>
                </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

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

    {/* iOS Workaround Processing Overlay */}
    {isProcessingWorkaround && (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <div className="bg-slate-800 rounded-2xl p-8 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 max-w-md mx-4">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
            <h3 className="text-2xl font-bold text-white font-['Teko'] tracking-wide">PROCESSING CARD</h3>
            <p className="text-gray-400 text-center text-sm">
              Preparing your card for export...
            </p>
            <div className="flex gap-2 mt-4">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Form */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white font-['Teko']">
                {showBack ? "BACK OF CARD" : "DESIGN YOUR LEGEND"}
            </h2>
            <p className="text-gray-400 mt-2">
                {showBack ? "Add stats, bio, and a second photo." : "Upload your photo and let us craft the perfect card."}
            </p>
          </div>

           <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            
            {/* CONDITIONAL FORM INPUTS */}
            {!showBack ? (
              // --- FRONT FORM (Restored Original) ---
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* File Upload & Player Size */}
                <div className="space-y-4">
                <div 
                    className={`border-2 border-dashed border-slate-600 rounded-xl p-6 text-center transition-all relative ${isProcessing ? 'bg-slate-800 cursor-wait' : 'hover:border-cyan-500 cursor-pointer bg-slate-900/50'}`}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                >
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*" 
                    />
                    
                    {isProcessing ? (
                    <div className="flex flex-col items-center animate-pulse py-2">
                        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-2" />
                        <span className="text-cyan-400 font-bold">Removing Background...</span>
                        <span className="text-xs text-gray-500 mt-1">AI processing in browser...</span>
                    </div>
                    ) : imagePreview ? (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-4 mb-2">
                        <CheckCircle className="text-green-500 w-6 h-6" />
                        <span className="text-white font-medium">Photo Processed</span>
                        </div>
                        <span className="text-xs text-gray-500">(Click box to change photo)</span>
                    </div>
                    ) : (
                    <div className="flex flex-col items-center py-2">
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-gray-300 font-medium">Click to upload action shot</span>
                        <span className="text-xs text-gray-500 mt-1">High resolution works best</span>
                    </div>
                    )}
                </div>

                {/* PLAYER SIZE SLIDER (Only shows if image exists) */}
                {imagePreview && !isProcessing && (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wider">
                        <span>Player Scale</span>
                        <span>{Math.round(imageScale * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.05" 
                        value={imageScale}
                        onChange={(e) => setImageScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    </div>
                )}
                </div>

                {/* Team Logo Upload */}
                <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Team Logo (Optional)</label>
                
                <div className="flex items-center gap-4">
                    {/* Logo Preview Circle */}
                    <div 
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-slate-900/80 backdrop-blur shadow-lg flex-shrink-0 overflow-hidden"
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
                        className="font-bold text-[10px] text-center leading-none"
                        style={{ color: colors.primary }}
                        >
                        PRO<br/>CARD
                        </div>
                    )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-2">
                    <input 
                        type="file" 
                        ref={logoInputRef} 
                        onChange={handleLogoChange} 
                        className="hidden" 
                        accept="image/*" 
                    />
                    
                    <div className="flex gap-2">
                        <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-gray-300 hover:border-slate-500 hover:text-white transition-colors"
                        >
                        {logoPreview ? 'Change' : 'Upload'}
                        </button>
                        {logoPreview && (
                        <button
                            type="button"
                            onClick={handleClearLogo}
                            className="bg-red-900/30 border border-red-900/50 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-900/50 transition-colors"
                        >
                            Clear
                        </button>
                        )}
                    </div>

                    {/* LOGO SIZE SLIDER */}
                    {showLogo && (
                        <div className="pt-1">
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                            <span>Size</span>
                            <span>{Math.round(logoScale * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2.5" 
                            step="0.1" 
                            value={logoScale}
                            onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        </div>
                    )}
                    </div>
                </div>

                {/* Checkboxes Row */}
                <div className="flex items-center gap-6 mt-1">
                    {/* Toggle Show/Hide */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={showLogo}
                        onChange={(e) => setShowLogo(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        Show logo
                    </span>
                    </label>

                    {/* Toggle Crop Circle (Only visible if logo shown) */}
                    {showLogo && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                        type="checkbox" 
                        checked={logoCropCircle}
                        onChange={(e) => setLogoCropCircle(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        Crop to circle
                        </span>
                    </label>
                    )}
                </div>
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
                    {/* Number Stroke and Gradient Options */}
                    <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                        type="checkbox"
                        checked={numberStrokeOpts.stroke}
                        onChange={(e) => setNumberStrokeOpts({...numberStrokeOpts, stroke: e.target.checked})}
                        className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-cyan-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Add Stroke</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                        type="checkbox"
                        checked={numberGradient}
                        onChange={(e) => setNumberGradient(e.target.checked)}
                        className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-cyan-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Gradient Text</span>
                    </label>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                {/* TEAM NAME INPUT */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Team Name</label>
                    <input 
                    type="text" 
                    value={details.team}
                    onChange={(e) => setDetails({...details, team: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g. Tigers"
                    />
                    {/* Team Text Options */}
                    <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                        type="checkbox"
                        checked={teamTextOpts.italic}
                        onChange={(e) => setTeamTextOpts({...teamTextOpts, italic: e.target.checked})}
                        className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-cyan-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Italics</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                        type="checkbox"
                        checked={teamTextOpts.shadow}
                        onChange={(e) => setTeamTextOpts({...teamTextOpts, shadow: e.target.checked})}
                        className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-cyan-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Shadow</span>
                    </label>
                    </div>
                </div>

                {/* POSITION INPUT */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Position</label>
                    <input 
                    type="text" 
                    value={details.position}
                    onChange={(e) => setDetails({...details, position: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g. Point Guard"
                    />
                    {/* Position Text Options */}
                    <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                        type="checkbox"
                        checked={posTextOpts.stroke}
                        onChange={(e) => setPosTextOpts({...posTextOpts, stroke: e.target.checked})}
                        className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-cyan-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Add Stroke</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                        type="checkbox"
                        checked={posTextOpts.shadow}
                        onChange={(e) => setPosTextOpts({...posTextOpts, shadow: e.target.checked})}
                        className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-cyan-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Shadow</span>
                    </label>
                    </div>
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
                        </button>
                    ))}
                    </div>
                )}
                </div>
              </div>
            ) : (
              // --- BACK FORM (New Inputs) ---
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* 1. Back Image Upload */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center border border-slate-600">
                            {backImagePreview ? <img src={backImagePreview} className="w-full h-full object-cover" /> : <User className="text-gray-500"/>}
                        </div>
                        <div className="flex-1 space-y-1">
                            <button type="button" onClick={() => backFileInputRef.current?.click()} className="text-sm bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded transition-colors">
                                {backImagePreview ? 'Change' : 'Upload'} Headshot
                            </button>
                            <input type="file" ref={backFileInputRef} onChange={handleBackImageChange} className="hidden" accept="image/*" />
                            {backImagePreview && (
                              <button type="button" onClick={() => { setBackImagePreview(null); setBackImageCropData({ offsetX: 0, offsetY: 0, scale: 1 }); }} className="text-xs bg-red-600/50 hover:bg-red-600 text-white px-2 py-0.5 rounded transition-colors ml-2">
                                Clear
                              </button>
                            )}
                            <p className="text-[10px] text-gray-500">This appears on the back.</p>
                        </div>
                    </div>
                    {backImagePreview && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Headshot Size</label>
                                <input type="range" min="0.5" max="2.0" step="0.05" value={backImageScale} onChange={(e) => setBackImageScale(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                <div className="text-xs text-gray-500 text-right">{Math.round(backImageScale * 100)}%</div>
                            </div>
                            <button type="button" onClick={() => { setTempCropImage(backImagePreview); setBackImageCropMode(true); }} className="text-xs w-full bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors">
                                Edit Position & Zoom
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Stats Grid */}
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><Scale className="w-4 h-4"/> Player Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <input type="text" value={backDetails.heightLabel} onChange={(e) => setBackDetails({...backDetails, heightLabel: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-gray-400 mb-1" placeholder="HT" />
                            <input type="text" value={backDetails.height} onChange={(e) => setBackDetails({...backDetails, height: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" placeholder="e.g. 6'2" />
                        </div>
                        <div className="relative">
                            <input type="text" value={backDetails.weightLabel} onChange={(e) => setBackDetails({...backDetails, weightLabel: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-gray-400 mb-1" placeholder="WT" />
                            <input type="text" value={backDetails.weight} onChange={(e) => setBackDetails({...backDetails, weight: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" placeholder="e.g. 210 lbs" />
                        </div>
                        <div className="relative">
                            <input type="text" value={backDetails.hometownLabel} onChange={(e) => setBackDetails({...backDetails, hometownLabel: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-gray-400 mb-1" placeholder="FROM" />
                            <input type="text" value={backDetails.hometown} onChange={(e) => setBackDetails({...backDetails, hometown: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" placeholder="e.g. Hometown" />
                        </div>
                        <div className="relative">
                            <input type="text" value={backDetails.yearLabel} onChange={(e) => setBackDetails({...backDetails, yearLabel: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-gray-400 mb-1" placeholder="YEAR" />
                            <input type="text" value={backDetails.year} onChange={(e) => setBackDetails({...backDetails, year: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" placeholder="e.g. Senior" />
                        </div>
                        <div className="relative">
                            <input type="text" value={backDetails.stat5Label} onChange={(e) => setBackDetails({...backDetails, stat5Label: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-gray-400 mb-1" placeholder="AGE" />
                            <input type="text" value={backDetails.stat5} onChange={(e) => setBackDetails({...backDetails, stat5: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" placeholder="e.g. 17" />
                        </div>
                    </div>
                </div>

                {/* 3. Power Rating */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={showPowerRating} 
                                onChange={(e) => setShowPowerRating(e.target.checked)} 
                                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-300 flex items-center gap-2 group-hover:text-white transition-colors">
                                <Trophy className={`w-4 h-4 ${showPowerRating ? 'text-yellow-500' : 'text-gray-500'}`}/> 
                                Show Power Rating
                            </span>
                        </label>
                        {showPowerRating && <span className="text-xl font-bold text-yellow-500">{backDetails.powerRating}</span>}
                    </div>
                    
                    {showPowerRating && (
                        <input 
                            type="range" min="0" max="99" value={backDetails.powerRating} 
                            onChange={(e) => setBackDetails({...backDetails, powerRating: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 animate-in fade-in zoom-in duration-300"
                        />
                    )}
                </div>

                {/* 4. Bio */}
                <div>
                     <label className="text-sm font-medium text-gray-300 mb-2 block">Player Bio</label>
                     <textarea 
                        value={backDetails.bio} 
                        onChange={(e) => setBackDetails({...backDetails, bio: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none h-24 resize-none"
                        placeholder="Write a short description..."
                     />
                </div>
              </div>
            )}

            {/* TOGGLE FLIP BUTTON */}
            <div className="pt-2 border-t border-slate-700">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-600 bg-slate-900/50 cursor-pointer hover:border-cyan-500 transition-colors group">
                    <input 
                        type="checkbox" 
                        checked={createBackMode} // Controls availability
                        onChange={(e) => {
                            setCreateBackMode(e.target.checked);
                            setShowBack(e.target.checked); // Auto-flip when enabled
                        }}
                        className="w-5 h-5 rounded border-slate-500 bg-slate-800 text-cyan-500 focus:ring-offset-0 focus:ring-0"
                    />
                    <div className="flex-1">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4"/> Create Back of Card
                        </span>
                        <span className="text-xs text-gray-500 block">Enables double-sided printing options</span>
                    </div>
                </label>
            </div>

            <button 
                type="submit" 
                className="w-full text-white font-bold py-3 rounded-lg transition-all shadow-lg flex justify-center items-center gap-2"
                style={{ 
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 4px 14px 0 ${colors.primary}40`
                }}
            >
              {createBackMode ? "Order Double-Sided Card" : "Order My Card"}
            </button>
          </form>
        </div>

        {/* Right Column: Live Preview */}
        <div 
          className={`
            transition-all duration-300 ease-in-out
            ${isFullScreen 
              ? 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md' 
              : 'lg:sticky lg:top-24' 
            }
          `}
        >
          {/* Controls Overlay */}
          {!isFullScreen && (
            <div className="flex items-center justify-center gap-3 mb-6">
               <span className="bg-slate-800 text-gray-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider border border-slate-700">
                 LIVE PREVIEW
               </span>
               
               {/* NEW: Toggle View Button (Only visible if Back Mode is enabled) */}
               {createBackMode && (
                 <button 
                   type="button"
                   onClick={() => setShowBack(!showBack)}
                   className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-700 text-xs text-cyan-400 hover:bg-cyan-900/50 transition-all font-bold"
                 >
                   <ArrowLeftRight className="w-3 h-3" />
                   {/* If showBack is true (viewing rear), button says "View Front". If false (viewing front), says "View Rear" */}
                   {showBack ? "View Front" : "View Rear"} 
                 </button>
               )}

               <button
                 type="button"
                 onClick={handleResetLayout}
                 className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs text-gray-500 hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all"
                 title="Reset all positions"
               >
                 <RotateCcw className="w-3 h-3" />
                 <span>Reset</span>
               </button>
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
          
          {/* Card Container Wrapper with 3D Perspective */}
          <div className={`
             relative transition-all duration-500 w-[320px] h-[480px] perspective-1000
             ${isFullScreen ? 'scale-110 md:scale-125 lg:scale-[1.4]' : 'mx-auto'}
          `}>
            
            {/* --- STATIC OVERLAY ICONS (These stay fixed and do not rotate) --- */}
            <div className="absolute inset-0 z-[60] pointer-events-none">
                
                {/* 1. Expand Icon (Top Left) */}
                {!isFullScreen && (
                    <div 
                        className="absolute top-3 left-3 p-1.5 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 pointer-events-auto backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            setIsFullScreen(true);
                        }}
                    >
                        <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                )}

                {/* 2. Flip Icon (Top Right) - Visible if Back Card is enabled */}
                {createBackMode && (
                    <div 
                        className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 pointer-events-auto backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowBack(!showBack);
                        }}
                    >
                        <RotateCcw className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>
            {/* THE FLIPPING CARD CONTAINER */}
            <div 
  ref={cardRef}
  data-card-container="true"
  data-card-wrapper
  className="relative w-full h-full transition-transform duration-700 transform-style-3d"
  style={{ transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* --- FRONT FACE --- */}
              <div data-card-face="front" className={`absolute inset-0 backface-hidden bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl ${showBack ? 'pointer-events-none z-0' : 'pointer-events-auto z-10'}`}>
                  {/* CSS BACKGROUND */}
                  <div className="absolute inset-0 transition-all duration-500" style={getCssBackground()}></div>

                  {/* CANVAS PROCEDURAL BACKGROUND */}
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0"/>
                  {/* Foreground debris layer */}
                  <canvas ref={foregroundCanvasRef} className="absolute inset-0 w-full h-full z-40 pointer-events-none"/>
                  
                  {/* User Uploaded Image (Draggable) */}
                  {imagePreview && (
                    <div
                      className="absolute w-full h-full z-30 cursor-move"
                      style={{
                        left: positions.image.x,
                        top: positions.image.y,
                        transform: `scale(${imageScale})`,
                        transformOrigin: 'center center',
                      }}
                      onMouseDown={(e) => startDrag(e, 'image')}
                      onTouchStart={(e) => startDrag(e, 'image')}
                    >
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover pointer-events-none select-none" 
                        style={{
                          filter: backgroundStyle === 'impact' 
                            ? 'url(#sticker-effect)' 
                            : enableGlow 
                              ? `drop-shadow(0 0 ${20 * (glowOpacity / 100)}px ${glowColor === 'primary' ? colors.primary : colors.secondary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')}) drop-shadow(0 0 ${40 * (glowOpacity / 100)}px ${glowColor === 'primary' ? colors.primary : colors.secondary}${Math.round(glowOpacity * 2.55).toString(16).padStart(2, '0')})`
                              : undefined
                        }}
                      />
                    </div>
                  )}

                  {!imagePreview && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <p className="text-white/20 text-4xl font-black font-['Teko'] uppercase -rotate-12 select-none">
                        {backgroundStyle}
                      </p>
                    </div>
                  )}
                  
                  {/* Effects Overlays */}
                  <div className="absolute inset-0 z-20 opacity-60 pointer-events-none" style={{ background: `linear-gradient(to top, #0f172a 0%, transparent 40%, ${colors.secondary}10 100%)` }}></div>
                  <div className="absolute inset-0 z-30 border-[12px] rounded-xl pointer-events-none mix-blend-overlay opacity-50" style={{ borderColor: colors.primary }}></div>
                  <div className="absolute inset-0 z-40 card-shine opacity-30 pointer-events-none"></div>

                  {/* RESTORED FRONT TEXT LAYOUT LOGIC */}
                  {backgroundStyle === 'impact' || backgroundStyle === 'splatter' ? (
                    <>
                      {backgroundStyle === 'impact' && (
                        <>
                          <div className="absolute z-20 cursor-move select-none w-full flex justify-center hover:scale-[1.02] transition-transform pointer-events-auto"
                            style={{ top: positions.groupHeader.y, left: positions.groupHeader.x }} 
                            onMouseDown={(e) => startDrag(e, 'groupHeader')}
                            onTouchStart={(e) => startDrag(e, 'groupHeader')}
                          >
                            <div className="relative transform -rotate-2 translate-x-[-10px] scale-110 w-full flex justify-center">
                              <div className="bg-[#1a1a1a] border-y-4 border-white pt-3 pb-2 px-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative z-20 w-[88%] mx-auto flex items-center justify-center">
                                <div className="relative w-full text-center">
                                  <h1 className="font-['Teko'] font-bold uppercase leading-[0.85] italic tracking-tighter whitespace-nowrap absolute top-0 left-0 w-full flex items-center justify-center"
                                    style={{ fontSize: getNameFontSize(details.name, 3.1), color: colors.primary, WebkitTextStroke: `5px ${colors.primary}`, zIndex: 10, filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.5))', paddingRight: '0.2em' }}>
                                    {details.name || 'PLAYER NAME'}
                                  </h1>
                                  <h1 className="font-['Teko'] font-bold uppercase leading-[0.85] italic tracking-tighter whitespace-nowrap relative flex items-center justify-center"
                                    style={{ fontSize: getNameFontSize(details.name, 3.1), ...chromeTextStyle, zIndex: 20, paddingRight: '0.2em' }}>
                                    {details.name || 'PLAYER NAME'}
                                  </h1>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="absolute z-50 cursor-move select-none w-full flex flex-col items-center hover:scale-[1.02] transition-transform pointer-events-auto"
                            style={{ top: positions.groupFooter.y, left: positions.groupFooter.x }}
                            onMouseDown={(e) => startDrag(e, 'groupFooter')}
                            onTouchStart={(e) => startDrag(e, 'groupFooter')}
                          >
                              <div className="inline-block px-5 py-2 border-y-4 border-r-4 border-black relative z-10 transform -rotate-2 translate-x-[-5px]" style={{ backgroundColor: colors.primary, boxShadow: '6px 6px 0px rgba(0,0,0,1)' }}>
                                  <div className="flex gap-3 text-black font-['Teko'] font-bold uppercase tracking-widest leading-none items-center justify-center whitespace-nowrap" style={{ fontSize: getRibbonFontSize(details.team, details.position) }}>
                                    <span className={teamTextOpts.italic ? 'italic' : ''} style={{ textShadow: teamTextOpts.shadow ? '2px 2px 2px rgba(0,0,0,0.5)' : 'none', color: 'black' }}>{details.team || 'TEAM'}</span>
                                    <span className="opacity-50">•</span>
                                    <span style={{ WebkitTextStroke: posTextOpts.stroke ? `0.5px ${colors.secondary}` : '0px', textShadow: posTextOpts.shadow ? '2px 2px 2px rgba(0,0,0,0.5)' : 'none', color: posTextOpts.stroke ? 'transparent' : 'black' }}>{details.position || 'POS'}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="absolute z-50 cursor-move select-none hover:scale-110 transition-transform pointer-events-auto"
                              style={{ top: positions.impactNumber.y, left: positions.impactNumber.x }}
                              onMouseDown={(e) => startDrag(e, 'impactNumber')}
                              onTouchStart={(e) => startDrag(e, 'impactNumber')}
                          >
                              <span className="text-8xl font-['Teko'] font-bold text-transparent transform -rotate-6 block" style={{ WebkitTextStroke: '3px white', textShadow: `4px 4px 0 ${colors.secondary}` }}>{details.number || '00'}</span>
                          </div>
                        </>
                      )}

                      {backgroundStyle === 'splatter' && (
                        <>
                          <div className="absolute z-50 cursor-move select-none w-full flex justify-center hover:scale-[1.02] transition-transform pointer-events-auto"
                            style={{ top: positions.splatterName.y, left: positions.splatterName.x }} 
                            onMouseDown={(e) => startDrag(e, 'splatterName')}
                            onTouchStart={(e) => startDrag(e, 'splatterName')}
                          >
                            <div className="w-[92%] bg-[#1a1a1a] border-y-2 border-white/20 pt-2 pb-1 relative shadow-lg px-2 flex items-center justify-center">
                                <div className="absolute top-0 left-0 w-full h-[2px]" style={{background: colors.primary}}></div>
                                <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{background: colors.primary}}></div>
                                <h1 className="font-['Teko'] font-bold text-center uppercase tracking-widest leading-none relative z-10 whitespace-nowrap" style={{ fontSize: getNameFontSize(details.name, 2.3), color: colors.primary, textShadow: '0 2px 10px rgba(0,0,0,0.8)', paddingRight: '0.1em' }}>
                                  {details.name || 'PLAYER NAME'}
                                </h1>
                            </div>
                          </div>

                          <div className="absolute z-50 cursor-move select-none w-full flex justify-center hover:scale-[1.02] transition-transform pointer-events-auto"
                            style={{ top: positions.splatterPosNum.y, left: positions.splatterPosNum.x }}
                            onMouseDown={(e) => startDrag(e, 'splatterPosNum')}
                            onTouchStart={(e) => startDrag(e, 'splatterPosNum')}
                          >
                              <div className="bg-[#111] border-y border-white/30 h-8 relative inline-flex items-center pt-1 px-10 shadow-md">
                                  <div className="absolute left-0 top-0 h-full w-1" style={{background: colors.secondary}}></div>
                                  <div className="absolute right-0 top-0 h-full w-1" style={{background: colors.secondary}}></div>
                                  <span className="text-white font-['Teko'] text-xl tracking-[0.15em] uppercase font-bold relative z-10">
                                      {details.position || 'POSITION'} <span className="text-gray-500 mx-2">|</span> #{details.number || '00'}
                                  </span>
                              </div>
                          </div>
                          <div className="absolute z-50 cursor-move select-none w-full flex justify-center hover:scale-[1.02] transition-transform pointer-events-auto"
                            style={{ top: positions.splatterTeam.y, left: positions.splatterTeam.x }}
                            onMouseDown={(e) => startDrag(e, 'splatterTeam')}
                            onTouchStart={(e) => startDrag(e, 'splatterTeam')}
                          >
                              <h2 className="text-6xl font-['Teko'] font-bold uppercase italic leading-none" style={{ color: colors.primary, textShadow: '2px 2px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                                  {details.team || 'TEAM'}
                              </h2>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    // STANDARD / RADAR / TECH / CYBER (Fully Separated)
                    <>
                        <div className="absolute z-50 cursor-move select-none pointer-events-auto"
                            style={{ top: positions.stdTeam.y, left: positions.stdTeam.x }} 
                            onMouseDown={(e) => startDrag(e, 'stdTeam')}
                            onTouchStart={(e) => startDrag(e, 'stdTeam')}
                        >
                            <p className={`font-bold tracking-widest text-sm font-['Teko'] uppercase drop-shadow-md whitespace-nowrap ${teamTextOpts.italic ? 'italic' : ''}`}
                              style={{ color: backgroundStyle === 'radar' ? '#000000' : colors.primary, filter: teamTextOpts.shadow ? 'drop-shadow(2px 2px 2px rgba(0,0,0,0.8))' : (backgroundStyle !== 'radar' ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' : 'none') }}>
                              {details.team || 'TEAM NAME'}
                            </p>
                        </div>
                        <div 
    className="absolute z-50 cursor-move select-none pointer-events-auto"
    style={{ top: positions.stdName.y, left: positions.stdName.x, width: '260px' }} 
    onMouseDown={(e) => startDrag(e, 'stdName')}
    onTouchStart={(e) => startDrag(e, 'stdName')}
>
     <div className={`border-b pb-2 mb-1 ${backgroundStyle === 'radar' ? 'border-black/20' : 'border-white/30'}`} style={{ width: '260px' }}>
        <div className="relative" style={{ width: '260px', overflow: 'visible' }}>
            <h1 className="font-['Teko'] font-bold leading-none italic uppercase absolute top-0 left-0 whitespace-nowrap"
                style={{ 
                    fontSize: getNameFontSize(details.name, 3.1), 
                    color: colors.primary, 
                    WebkitTextStroke: `2px ${colors.primary}`, 
                    zIndex: 10, 
                    filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))', 
                    paddingRight: '10px',
                    width: '260px',
                    textAlign: 'center'
                }}>
                {details.name || 'PLAYER NAME'}
            </h1>
            <h1 className="font-['Teko'] font-bold leading-none italic uppercase relative whitespace-nowrap"
                style={{ 
                    fontSize: getNameFontSize(details.name, 3.1), 
                    background: 'linear-gradient(180deg, #FFFFFF 20%, #E0E0E0 45%, #888888 50%, #D0D0D0 55%, #F0F0F0 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 0px rgba(0,0,0,0.1))',
                    zIndex: 20, 
                    paddingRight: '10px',
                    width: '260px',
                    textAlign: 'center',
                    display: 'block'
                }}>
                {details.name || 'PLAYER NAME'}
            </h1>
        </div>
    </div>
</div>

                        <div className="absolute z-50 cursor-move select-none pointer-events-auto"
                            style={{ top: positions.stdNumber.y, left: positions.stdNumber.x }} 
                            onMouseDown={(e) => startDrag(e, 'stdNumber')}
                            onTouchStart={(e) => startDrag(e, 'stdNumber')}
                        >
                            <div 
                              className={`text-5xl font-['Teko'] font-bold outline-text drop-shadow-lg ${backgroundStyle === 'radar' ? 'text-black opacity-100' : 'text-white opacity-40'}`}
                              style={{
                                ...(numberGradient ? {
                                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text'
                                } : {}),
                                ...(numberStrokeOpts.stroke ? { WebkitTextStroke: `2px ${colors.primary}` } : {})
                              }}
                            >
                                {details.number || '00'}
                            </div>
                        </div>
                        
                        <div className="absolute z-50 cursor-move select-none pointer-events-auto"
                            style={{ top: positions.stdPos.y, left: positions.stdPos.x }}
                            onMouseDown={(e) => startDrag(e, 'stdPos')}
                            onTouchStart={(e) => startDrag(e, 'stdPos')}
                        >
                            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider"
                              style={{ WebkitTextStroke: posTextOpts.stroke ? `1px ${colors.secondary}` : '0px', textShadow: posTextOpts.shadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none' }}>
                                {details.position || 'POS'}
                            </div>
                        </div>
                    </>
                  )}

                 {/* DRAGGABLE TEAM LOGO */}
                  {showLogo && (
                    <div className="absolute z-50 cursor-move active:cursor-grabbing hover:brightness-110 transition-all pointer-events-auto"
                      style={{ left: positions.logo.x, top: positions.logo.y, touchAction: 'none' }}
                      onMouseDown={(e) => startDrag(e, 'logo')}
                      onTouchStart={(e) => startDrag(e, 'logo')}
                    >
                      {logoPreview ? (
                        logoCropCircle ? (
                          <div className="rounded-full border-2 flex items-center justify-center bg-slate-900/80 backdrop-blur shadow-lg overflow-hidden select-none"
                            style={{ width: `${48 * logoScale}px`, height: `${48 * logoScale}px`, borderColor: colors.primary }}>
                            <img src={logoPreview} alt="Team Logo" className="w-full h-full object-cover pointer-events-none" />
                          </div>
                        ) : (
                          <div style={{ width: `${50 * logoScale}px` }}>
                              <img src={logoPreview} alt="Team Logo" className="w-full h-auto drop-shadow-lg pointer-events-none select-none" />
                          </div>
                        )
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center bg-slate-900/80 backdrop-blur shadow-lg overflow-hidden select-none"
                            style={{ borderColor: colors.primary, transform: `scale(${logoScale})` }}>
                            <div className="font-bold text-xs text-center leading-none pointer-events-none" style={{ color: colors.primary }}>PRO<br/>CARD</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Border Frame Overlay */}
                  {enableBorder && <BorderFrame style={borderStyle} primaryColor={colors.primary} secondaryColor={colors.secondary} />}
              </div>

              {/* --- BACK FACE --- */}
              <div 
  data-card-face="back"
  className={`absolute inset-0 backface-hidden bg-slate-900 rounded-xl overflow-hidden border-4 border-slate-600 shadow-xl ${!showBack ? 'pointer-events-none z-0' : 'pointer-events-auto z-10'}`}
  style={{ transform: 'rotateY(180deg)' }}
>
                    {/* Reuse Background but Darkened */}
                    <div className="absolute inset-0" style={getCssBackground()}></div>
                    <canvas ref={backCanvasRef} className="absolute inset-0 w-full h-full z-0"/>
                    
                    {/* Privacy Glass Overlay */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] z-10"></div>
                    
                    {/* BACK CONTENT */}
                    {backImagePreview && (
                        <div 
                          className="absolute z-20 cursor-move"
                          style={{ left: backPositions.backImage.x, top: backPositions.backImage.y, transform: `scale(${backImageScale})` }}
                          onMouseDown={(e) => startDrag(e, 'backImage')}
                          onTouchStart={(e) => startDrag(e, 'backImage')}
                        >
                            <div className="w-32 h-32 rounded-full border-4 overflow-hidden shadow-lg" style={{ borderColor: colors.primary }}>
                              <img
                                src={backImagePreview}
                                className="w-full h-full pointer-events-none select-none"
                                style={{
                                  // No scaling needed - modal and card are same size now
                                  transform: `translate(${backImageCropData.offsetX}px, ${backImageCropData.offsetY}px) scale(${backImageCropData.scale})`,
                                  transformOrigin: 'center'
                                }}
                              />
                            </div>
                        </div>
                    )}

                    <div 
                      className="absolute z-30 cursor-move w-[200px] pointer-events-auto"
                      style={{ left: backPositions.stats.x, top: backPositions.stats.y }}
                      onMouseDown={(e) => startDrag(e, 'stats')}
                      onTouchStart={(e) => startDrag(e, 'stats')}
                    >
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm font-['Teko'] tracking-wide">
                          <div className="border-b border-gray-700 pb-1">
                              <span className="text-gray-500 mr-2">{backDetails.heightLabel}:</span> 
                              <span className="text-white text-lg">{backDetails.height || '--'}</span>
                          </div>
                          <div className="border-b border-gray-700 pb-1">
                              <span className="text-gray-500 mr-2">{backDetails.weightLabel}:</span> 
                              <span className="text-white text-lg">{backDetails.weight || '--'}</span>
                          </div>
                          <div className="border-b border-gray-700 pb-1 col-span-2">
                              <span className="text-gray-500 mr-2">{backDetails.hometownLabel}:</span> 
                              <span className="text-white text-lg uppercase">{backDetails.hometown || '--'}</span>
                          </div>
                          <div className="border-b border-gray-700 pb-1">
                              <span className="text-gray-500 mr-2">{backDetails.yearLabel}:</span> 
                              <span className="text-white text-lg uppercase">{backDetails.year || '--'}</span>
                          </div>
                          <div className="border-b border-gray-700 pb-1">
                              <span className="text-gray-500 mr-2">{backDetails.stat5Label}:</span> 
                              <span className="text-white text-lg uppercase">{backDetails.stat5 || '--'}</span>
                          </div>
                      </div>
                    </div>

                    <div 
                      className="absolute z-30 cursor-move w-[250px] px-2 pointer-events-auto"
                      style={{ left: backPositions.bio.x, top: backPositions.bio.y }}
                      onMouseDown={(e) => startDrag(e, 'bio')}
                      onTouchStart={(e) => startDrag(e, 'bio')}
                    >
                      <p className="text-gray-300 text-xs leading-relaxed text-justify opacity-90 font-sans">
                          {backDetails.bio || "Enter player bio details to see them appear here. This area is perfect for season highlights or stats summary."}
                      </p>
                    </div>

                    {showPowerRating && (
                        <div 
                          className="absolute z-30 cursor-move pointer-events-auto"
                          style={{ left: backPositions.rating.x, top: backPositions.rating.y }}
                          onMouseDown={(e) => startDrag(e, 'rating')}
                          onTouchStart={(e) => startDrag(e, 'rating')}
                        >
                          <div className="relative w-20 h-20 flex items-center justify-center">
                              {/* SVG Hexagon */}
                              <svg viewBox="0 0 100 100" className="absolute w-full h-full drop-shadow-lg">
                                  <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" fill="#1a1a1a" stroke={colors.primary} strokeWidth="3" />
                                  <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.5" />
                              </svg>
                              <div className="relative z-10 text-center mt-[-5px]">
                                  <span className="block text-[10px] text-gray-400 uppercase tracking-widest leading-none">OVR</span>
                                  <span className="block text-4xl font-black text-white font-['Teko'] leading-none">{backDetails.powerRating}</span>
                              </div>
                          </div>
                        </div>
                    )}
                    
                    {logoPreview && (
                      <div className="absolute bottom-6 right-6 w-16 h-16 opacity-20 pointer-events-none grayscale">
                          <img src={logoPreview} className="w-full h-full object-contain" />
                      </div>
                    )}

                    {enableBorder && <BorderFrame style={borderStyle} primaryColor={colors.primary} secondaryColor={colors.secondary} flipped={true} />}
              </div>

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
    
{/* Global Styles for 3D Transforms */}
    <style>{`
  .perspective-1000 { perspective: 1000px; }
  .transform-style-3d { 
      transform-style: preserve-3d; 
      -webkit-transform-style: preserve-3d;
  }
  .backface-hidden { 
      backface-visibility: hidden; 
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0,0,0);
  }
  .rotate-y-180 { transform: rotateY(180deg); }
  
  /* Card shine effect - matches Gallery */
  .card-shine::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -100%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.05) 75%,
      transparent 100%
    );
    transform: rotate(25deg);
    animation: shine-sweep 8s ease-in-out infinite;
    pointer-events: none;
  }
  
  /* Disable shine during capture */
  .capturing .card-shine::before {
    display: none !important;
  }
  
  @keyframes shine-sweep {
    0% { 
      transform: translateX(-100%) rotate(25deg); 
    }
    100% { 
      transform: translateX(200%) rotate(25deg); 
    }
  }
`}</style>
    </>
  );
};

export default OrderForm;