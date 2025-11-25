import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clock, Target } from 'lucide-react';
import { analyzeRoadmap } from '../services/geminiService';

const Roadmap: React.FC = () => {
  const [aiAdvice, setAiAdvice] = useState<string>("Loading market analysis...");

  useEffect(() => {
     const fetchAdvice = async () => {
         const advice = await analyzeRoadmap();
         if (advice) setAiAdvice(advice);
         else setAiAdvice("Unable to load AI analysis. Check API Key.");
     }
     fetchAdvice();
  }, []);

  const steps = [
      { title: "Phase 1: The Portal (Current)", status: "complete", desc: "Web interface for uploads, basic mockups, and AI text generation." },
      { title: "Phase 2: Automated Cutouts", status: "pending", desc: "Integrating masking AI to automatically remove messy backgrounds from uploaded photos." },
      { title: "Phase 3: Print Integration", status: "pending", desc: "API connection to print-on-demand services for thick card stock + foil overlay." },
      { title: "Phase 4: NFT/Digital Twins", status: "future", desc: "Every physical card gets a blockchain digital twin." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-['Teko'] text-white mb-8 border-b border-slate-700 pb-4">PROJECT ROADMAP</h2>
        
        <div className="space-y-8 mb-16">
            {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                            ${step.status === 'complete' ? 'bg-green-500 border-green-500' : 
                              step.status === 'pending' ? 'bg-slate-800 border-cyan-500' : 'bg-slate-900 border-slate-700'}`}>
                            {step.status === 'complete' && <Check className="w-4 h-4 text-slate-900" />}
                            {step.status === 'pending' && <Clock className="w-4 h-4 text-cyan-500" />}
                            {step.status === 'future' && <Target className="w-4 h-4 text-slate-600" />}
                        </div>
                        {idx !== steps.length - 1 && <div className="w-0.5 h-full bg-slate-800 my-2"></div>}
                    </div>
                    <div className="pb-8">
                        <h3 className={`text-xl font-bold ${step.status === 'complete' ? 'text-green-400' : 'text-white'}`}>{step.title}</h3>
                        <p className="text-gray-400 mt-1">{step.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Developer Analysis (Next Steps & Risks)</h3>
            </div>
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 mb-4">
                    Based on your request to build this business, here are the critical considerations generated for you:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg text-sm text-gray-300 font-mono whitespace-pre-wrap border border-slate-700">
                    {aiAdvice}
                </div>
                <p className="text-gray-400 text-sm mt-4 italic">
                    * This analysis is generated live by Gemini based on the "Sports Card Business" prompt context.
                </p>
            </div>
        </div>
    </div>
  );
};

export default Roadmap;