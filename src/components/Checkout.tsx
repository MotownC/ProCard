import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface CheckoutProps {
  pendingOrder: any;
  setPage?: (p: string) => void;
}

const CLOUDINARY_CLOUD = 'dd2zdrc2z'; 
const UPLOAD_PRESET = 'procard_pdf'; 

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

async function createPrintReadyPdf(frontDataUrl: string, backDataUrl: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // Convert data URLs to image bytes
  const frontBlob = await dataUrlToBlob(frontDataUrl);
  const backBlob = await dataUrlToBlob(backDataUrl);
  
  const frontBytes = await frontBlob.arrayBuffer(); // Don't wrap in Uint8Array yet
  const backBytes = await backBlob.arrayBuffer();
  
  // Embed images (try PNG first, fallback to JPEG)
  let frontImg, backImg;
  try {
    frontImg = await pdfDoc.embedPng(new Uint8Array(frontBytes)); // Wrap here
  } catch {
    frontImg = await pdfDoc.embedJpg(new Uint8Array(frontBytes));
  }
  
  try {
    backImg = await pdfDoc.embedPng(new Uint8Array(backBytes)); // Wrap here
  } catch {
    backImg = await pdfDoc.embedJpg(new Uint8Array(backBytes));
  }
  
  // Standard poker card size: 2.5" x 3.5" at 300 DPI = 750 x 1050 pixels
  // In PDF points (72 per inch): 180 x 252 points
  const cardWidth = 2.5 * 72;
  const cardHeight = 3.5 * 72;
  
  // Add bleed (0.125" = 9 points on each side)
  const bleed = 0.125 * 72;
  const pageWidth = cardWidth + (bleed * 2);
  const pageHeight = cardHeight + (bleed * 2);
  
  // Front page with bleed
  const frontPage = pdfDoc.addPage([pageWidth, pageHeight]);
  frontPage.drawImage(frontImg, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });
  
  // Back page with bleed (only if backDataUrl exists)
  if (backDataUrl) {
    const backPage = pdfDoc.addPage([pageWidth, pageHeight]);
    backPage.drawImage(backImg, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }
  
  return await pdfDoc.save();
}

async function uploadToCloudinary(file: Blob | Uint8Array, fileName: string, resourceType = 'raw') {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`;
  const fd = new FormData();
  
  let payload: Blob;
  if (file instanceof Uint8Array) {
    // Create a proper ArrayBuffer from Uint8Array
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    payload = new Blob([buffer as ArrayBuffer], { type: 'application/pdf' });
  } else {
    payload = file;
  }

  fd.append('file', payload, fileName);
  fd.append('upload_preset', UPLOAD_PRESET);
  
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed: ' + await res.text());
  return res.json();
}

const Checkout: React.FC<CheckoutProps> = ({ pendingOrder, setPage }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [printPdfUrl, setPrintPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAndUpload = async () => {
  if (!pendingOrder?.frontDataUrl) {
    alert('Missing front card image. Please go back and create your card.');
    return;
  }
  
  setIsProcessing(true);
  setError(null);
  
  try {
    // Get current count from Cloudinary by listing existing files
    // This searches for all files matching the pattern F-*-*.pdf
    const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/resources/search`;
    const searchParams = new URLSearchParams({
      expression: 'resource_type:raw AND folder:""',
      max_results: '1',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    
    let nextNumber = 1;
    try {
      const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
      const searchData = await searchResponse.json();
      
      if (searchData.resources && searchData.resources.length > 0) {
        // Extract number from most recent file (e.g., "F-00042-13DEC25" -> 42)
        const lastFile = searchData.resources[0].public_id;
        const match = lastFile.match(/[FB]-(\d+)-/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
    } catch (err) {
      console.warn('Could not fetch file count, starting at 00001:', err);
    }
    
    // Format number with leading zeros (00001, 00002, etc.)
    const fileNumber = String(nextNumber).padStart(5, '0');
    
    // Generate date string
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    }).replace(/ /g, '').toUpperCase(); // 13DEC25
    
    const frontFileName = `F-${fileNumber}-${dateStr}.pdf`;
    const backFileName = `B-${fileNumber}-${dateStr}.pdf`;
    
    console.log('Generated filenames:', { frontFileName, backFileName });
    
    // Create FRONT PDF
    const frontPdfDoc = await PDFDocument.create();
    const frontBlob = await dataUrlToBlob(pendingOrder.frontDataUrl);
    const frontBytes = await frontBlob.arrayBuffer();
    
    let frontImg;
    try {
      frontImg = await frontPdfDoc.embedPng(new Uint8Array(frontBytes));
    } catch {
      frontImg = await frontPdfDoc.embedJpg(new Uint8Array(frontBytes));
    }
    
    // Standard poker card: 2.5" x 3.5" at 72 DPI
    const cardWidth = 2.5 * 72;
    const cardHeight = 3.5 * 72;
    const bleed = 0.125 * 72;
    const pageWidth = cardWidth + (bleed * 2);
    const pageHeight = cardHeight + (bleed * 2);
    
    const frontPage = frontPdfDoc.addPage([pageWidth, pageHeight]);
    frontPage.drawImage(frontImg, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
    
    const frontPdfBytes = await frontPdfDoc.save();
    
    // Upload front PDF
    const frontResult = await uploadToCloudinary(frontPdfBytes, frontFileName, 'raw');
    console.log('Front PDF uploaded:', frontResult.secure_url);
    
    let backResult = null;
    
    // Create BACK PDF if exists
    if (pendingOrder.backDataUrl) {
      const backPdfDoc = await PDFDocument.create();
      const backBlob = await dataUrlToBlob(pendingOrder.backDataUrl);
      const backBytes = await backBlob.arrayBuffer();
      
      let backImg;
      try {
        backImg = await backPdfDoc.embedPng(new Uint8Array(backBytes));
      } catch {
        backImg = await backPdfDoc.embedJpg(new Uint8Array(backBytes));
      }
      
      const backPage = backPdfDoc.addPage([pageWidth, pageHeight]);
      backPage.drawImage(backImg, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
      
      const backPdfBytes = await backPdfDoc.save();
      
      // Upload back PDF
      backResult = await uploadToCloudinary(backPdfBytes, backFileName, 'raw');
      console.log('Back PDF uploaded:', backResult.secure_url);
    }
    
    // Store URLs for display
    setPrintPdfUrl(JSON.stringify({ 
      front: frontResult.secure_url, 
      back: backResult?.secure_url || null,
      fileNumber,
      dateStr
    }));
    
    alert(`Print-ready PDFs generated successfully!\nOrder #${fileNumber}`);
    
  } catch (err: any) {
    console.error('PDF generation error:', err);
    setError(err.message || 'Failed to generate PDF');
    alert('Failed to generate PDF. Check console for details.');
  } finally {
    setIsProcessing(false);
  }
};

  const handleDownloadImages = () => {
  if (!pendingOrder) return;
  
  // Download front
  const frontLink = document.createElement('a');
  frontLink.href = pendingOrder.frontDataUrl;
  frontLink.download = 'card-front.png';
  frontLink.click();
  
  // Download back if exists
  if (pendingOrder.backDataUrl) {
    setTimeout(() => {
      const backLink = document.createElement('a');
      backLink.href = pendingOrder.backDataUrl;
      backLink.download = 'card-back.png';
      backLink.click();
    }, 100);
  }
};

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-white mb-4 font-['Teko']">CHECKOUT</h2>
      <p className="text-gray-400 mb-6">
        Review your card before ordering. Price: <span className="text-cyan-400 font-semibold">$10.99</span> + shipping
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
    <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Front Preview</h4>
    {pendingOrder?.frontDataUrl ? (
      <div className="flex justify-center items-start min-h-[600px]">
        <img 
          src={pendingOrder.frontDataUrl} 
          alt="Front" 
          className="max-w-full h-auto max-h-[700px] border-2 border-slate-600 rounded-lg shadow-2xl hover:scale-105 transition-transform cursor-pointer"
          onClick={() => window.open(pendingOrder.frontDataUrl, '_blank')}
        />
      </div>
    ) : (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-slate-900 rounded">
        No preview available
      </div>
    )}
  </div>
  
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
    <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Back Preview</h4>
    {pendingOrder?.backDataUrl ? (
      <div className="flex justify-center items-start min-h-[600px]">
        <img 
          src={pendingOrder.backDataUrl} 
          alt="Back" 
          className="max-w-full h-auto max-h-[700px] border-2 border-slate-600 rounded-lg shadow-2xl hover:scale-105 transition-transform cursor-pointer"
          onClick={() => window.open(pendingOrder.backDataUrl, '_blank')}
        />
      </div>
    ) : (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-slate-900 rounded">
        No preview available
      </div>
    )}
  </div>
</div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Card Price:</span>
            <span className="text-white font-medium">$10.99</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Production Time:</span>
            <span className="text-white font-medium">2-3 business days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Shipping:</span>
            <span className="text-white font-medium">$5.99 (Standard)</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
            <span className="text-gray-400 font-semibold">Total:</span>
            <span className="text-cyan-400 font-bold text-lg">$16.98</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => setPage && setPage('create')} 
          className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
        >
          ← Edit Design
        </button>
        
        <button 
          onClick={handleDownloadImages}
          className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
        >
          Download Images
        </button>
        
        <button 
          onClick={handleGenerateAndUpload} 
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors shadow-lg shadow-cyan-500/20"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </span>
          ) : (
            'Generate Print PDF'
          )}
        </button>
      </div>

      {printPdfUrl && (() => {
  const urls = JSON.parse(printPdfUrl);
  return (
    <div className="mt-6 p-4 bg-green-900/20 border border-green-600 rounded-lg space-y-3">
      <h4 className="text-green-400 font-semibold mb-2">✓ Print-Ready PDFs Generated</h4>
      
      <div className="bg-slate-800 p-3 rounded border border-slate-700">
        <p className="text-xs text-gray-400 mb-1">Order Number:</p>
        <p className="text-white font-mono text-2xl font-bold">#{urls.fileNumber}</p>
        <p className="text-gray-500 text-xs mt-1">{urls.dateStr}</p>
      </div>
      
      <div className="space-y-2 pt-2">
        <a 
          href={urls.front} 
          target="_blank" 
          rel="noreferrer"
          className="block text-cyan-400 hover:text-cyan-300 underline font-medium"
        >
          📄 Download Front PDF (F-{urls.fileNumber}-{urls.dateStr}.pdf)
        </a>
        
        {urls.back && (
          <a 
            href={urls.back} 
            target="_blank" 
            rel="noreferrer"
            className="block text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            📄 Download Back PDF (B-{urls.fileNumber}-{urls.dateStr}.pdf)
          </a>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mt-3 pt-3 border-t border-slate-700">
        <strong>Printing Instructions:</strong><br/>
        1. Print all front PDFs on one side of the sheet<br/>
        2. Flip sheet and print back PDFs on reverse<br/>
        3. Cut to size - fronts and backs will align perfectly
      </p>
    </div>
  );
})()}

      <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h4 className="text-white font-semibold mb-2 text-sm">Print Specifications:</h4>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• Card Size: 2.5" x 3.5" (standard poker card)</li>
          <li>• Bleed: 0.125" on all sides</li>
          <li>• Resolution: 300 DPI recommended</li>
          <li>• Format: PDF with embedded images</li>
        </ul>
      </div>
    </div>
  );
};

export default Checkout;