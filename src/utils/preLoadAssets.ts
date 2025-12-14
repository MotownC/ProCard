// --- preloadAssets.ts ---
const borderSvgs: Record<string, HTMLImageElement> = {};
const backgroundPatterns: Record<string, HTMLCanvasElement> = {}; // for repeating patterns

export const preloadBorders = async () => {
  const borderNames = [
    'chrome-metal',
    'geometric',
    'futuristic',
    'classic',
    'neon',
    'holo'
  ];

  await Promise.all(
    borderNames.map((name) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = `/borders/${name}.svg`;
        img.onload = () => {
          borderSvgs[name] = img;
          resolve();
        };
      });
    })
  );
};

export const preloadBackgrounds = async () => {
  const bgNames = [
    'red-gradient',
    'carbon-fiber',
    'blue-metal',
    'gold-foil',
    'purple-neon',
    'holo-grid',
    'hex-pattern',
    'circuit',
    'smoke',
    'wood',
    'marble'
  ];

  bgNames.forEach((name) => {
    // for simple gradients, we can just store name; for patterns, pre-render to a canvas
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 64;
    patternCanvas.height = 64;
    const ctx = patternCanvas.getContext('2d');
    if (!ctx) return;

    switch (name) {
      case 'carbon-fiber':
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillRect(32, 32, 32, 32);
        break;
      case 'hex-pattern':
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, 64, 64);
        ctx.strokeStyle = '#555';
        ctx.beginPath();
        for (let y = 0; y < 64; y += 16) {
          for (let x = 0; x < 64; x += 16) {
            ctx.moveTo(x + 8, y);
            ctx.lineTo(x + 16, y + 8);
            ctx.lineTo(x + 8, y + 16);
            ctx.lineTo(x, y + 8);
            ctx.closePath();
          }
        }
        ctx.stroke();
        break;
      // ...repeat for other patterned backgrounds
    }

    backgroundPatterns[name] = patternCanvas;
  });
};

// --- export for use in RenderCard ---
export { borderSvgs, backgroundPatterns };
