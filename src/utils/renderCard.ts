// renderCard.ts
// Utilities to render your card front/back to a data URL (PNG/JPEG).
// Usage: const png = await renderCardToDataUrl(cardData, 'front');

type Side = 'front' | 'back';

interface CardData {
  // minimal example fields — expand to match your pendingOrder structure
  width?: number;        // pixels, default 750 (2.5" @ 300 DPI)
  height?: number;       // pixels, default 1050 (3.5" @ 300 DPI)
  bleed?: number;        // pixels, optional (e.g. 0 or 18)
  backgroundDrawFn?: (ctx: CanvasRenderingContext2D, w: number, h: number, side: Side) => Promise<void> | void;
  photoUrl?: string;
  photoRect?: { x: number; y: number; w: number; h: number };
  overlays?: Array<{ src: string; x: number; y: number; w: number; h: number }>;
  svgFrameElement?: SVGElement | null; // pass a reference to the DOM SVG for the frame (front/back)
  texts?: Array<{ text: string; x: number; y: number; font: string; align?: CanvasTextAlign; fillStyle?: string; stroke?: boolean }>;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed loading image ${src}: ${(e as any).message || e}`));
    img.src = src;
  });
}

// Inline computed styles into the SVG clone so it renders identical when serialized.
// This is best-effort: it walks elements and copies computed style properties as inline style.
function cloneSvgWithInlineStyles(svg: SVGElement): SVGElement {
  const clone = svg.cloneNode(true) as SVGElement;
  const allNodes = Array.from(clone.querySelectorAll('*')) as Element[];
  const originalNodes = Array.from(svg.querySelectorAll('*')) as Element[];

  const computedProps = [
    'font-size','font-family','font-weight','fill','stroke','stroke-width','letter-spacing',
    'text-anchor','opacity','transform','filter','fill-opacity','stroke-opacity','visibility'
  ];

  originalNodes.forEach((orig, i) => {
    const cloned = allNodes[i];
    if (!cloned) return;
    const cs = window.getComputedStyle(orig);
    const styleParts: string[] = [];
    for (const prop of computedProps) {
      const val = cs.getPropertyValue(prop);
      if (val && val !== 'initial' && val !== 'none' && val !== '') {
        styleParts.push(`${prop}:${val};`);
      }
    }
    if (styleParts.length) {
      const existing = cloned.getAttribute('style') || '';
      cloned.setAttribute('style', existing + styleParts.join(''));
    }
  });

  // Ensure width/height/viewBox are preserved
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  return clone;
}

function svgElementToDataUrl(svgEl: SVGElement, width: number, height: number): string {
  const clone = cloneSvgWithInlineStyles(svgEl);
  // set explicit width/height to the serialized svg so the image draws properly
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  // serialize
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clone);

  // fix for older browsers: ensure xmlns attribute exists
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  // add xml declaration
  source = `<?xml version="1.0" standalone="no"?>\n` + source;
  const encoded = encodeURIComponent(source);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

async function drawSvgToCanvas(ctx: CanvasRenderingContext2D, svgEl: SVGElement, x: number, y: number, w: number, h: number) {
  const dataUrl = svgElementToDataUrl(svgEl, w, h);
  const img = await loadImage(dataUrl);
  ctx.drawImage(img, x, y, w, h);
}

async function ensureFontsReady() {
  // Wait for CSS/webfonts to be loaded so Canvas text measurements/painting match DOM.
  if ((document as any).fonts && (document as any).fonts.ready) {
    await (document as any).fonts.ready;
    // small timeout to be extra-safe
    await new Promise((r) => setTimeout(r, 10));
  }
}

// Main function to render card to PNG/JPG data URL (300 DPI default size)
export async function renderCardToDataUrl(cardData: CardData, side: Side): Promise<{ pngDataUrl: string; jpgDataUrl: string; canvas: HTMLCanvasElement }> {
  await ensureFontsReady();

  const width = cardData.width || 750;   // 2.5" @ 300 DPI
  const height = cardData.height || 1050; // 3.5" @ 300 DPI
  const bleed = cardData.bleed || 0;

  const canvas = document.createElement('canvas');
  canvas.width = width + bleed * 2;
  canvas.height = height + bleed * 2;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Unable to get 2D context');

  // Optional: fill with white for JPEG/PDF backgrounds
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1) draw background using provided drawing function (this is where your existing canvas logic fits)
  if (cardData.backgroundDrawFn) {
    // The function should draw to the ctx at coordinates (bleed, bleed) with w/ h
    await cardData.backgroundDrawFn(ctx, width, height, side);
  }

  // 2) draw SVG frame (if provided) — we expect it to visually match the DOM frame
  if (cardData.svgFrameElement) {
    // draw over full card area (including bleed)
    try {
      await drawSvgToCanvas(ctx, cardData.svgFrameElement, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.warn('Failed to draw SVG frame to canvas:', e);
    }
  }

  // 3) draw photo (if exists)
  if (cardData.photoUrl && cardData.photoRect) {
    try {
      const img = await loadImage(cardData.photoUrl);
      ctx.drawImage(img, bleed + cardData.photoRect.x, bleed + cardData.photoRect.y, cardData.photoRect.w, cardData.photoRect.h);
    } catch (e) {
      console.warn('Failed loading photo:', e);
    }
  }

  // 4) draw overlays
  if (Array.isArray(cardData.overlays)) {
    for (const ov of cardData.overlays) {
      try {
        const img = await loadImage(ov.src);
        ctx.drawImage(img, bleed + ov.x, bleed + ov.y, ov.w, ov.h);
      } catch (e) {
        console.warn('Overlay load failed', ov.src, e);
      }
    }
  }

  // 5) draw text entries
  if (Array.isArray(cardData.texts)) {
    for (const t of cardData.texts) {
      ctx.textAlign = t.align || 'left';
      ctx.font = t.font || 'bold 48px Teko, sans-serif';
      if (t.fillStyle) ctx.fillStyle = t.fillStyle;
      else ctx.fillStyle = '#fff';
      if (t.stroke) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.strokeText(t.text, bleed + t.x, bleed + t.y);
      }
      ctx.fillText(t.text, bleed + t.x, bleed + t.y);
    }
  }

  // final exports
  const pngDataUrl = canvas.toDataURL('image/png');
  const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);

  return { pngDataUrl, jpgDataUrl, canvas };
}
