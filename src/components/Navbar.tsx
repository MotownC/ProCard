import React from 'react';
import { Zap, Layers, Lock, Upload, DollarSign } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Zap className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery', icon: <Layers className="w-4 h-4" /> },
    // DIY Card Creator - Temporarily Hidden
    // { id: 'create', label: 'Create Card', icon: <PenTool className="w-4 h-4" /> },
    { id: 'custom', label: 'Custom Design', icon: <Upload className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
            <div className="bg-cyan-500 p-1.5 rounded-lg transform -skew-x-12">
              <Zap className="text-white w-6 h-6 transform skew-x-12" />
            </div>
            <span className="text-2xl font-bold tracking-wider text-white font-['Teko']">
              PROCARD <span className="text-cyan-400">LEGENDS</span>
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${currentPage === item.id 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }
                    ${item.id === 'admin' ? 'ml-4 opacity-50 hover:opacity-100' : ''}
                  `}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;