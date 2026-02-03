import React, { useState } from 'react';
import { Layers, Lock, Upload, DollarSign, Home, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery', icon: <Layers className="w-4 h-4" /> },
    // DIY Card Creator - Temporarily Hidden
    // { id: 'create', label: 'Create Card', icon: <PenTool className="w-4 h-4" /> },
    { id: 'custom', label: 'Custom Design', icon: <Upload className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <Lock className="w-4 h-4" /> },
  ];

  const handleNav = (id: string) => {
    setPage(id);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('home')}>
            <img
              src="/appicon.png"
              alt="ProCard Legends"
              className="w-10 h-10 rounded-lg"
            />
            <span className="text-2xl font-bold tracking-wider text-white font-['Teko']">
              PROCARD <span className="text-cyan-400">LEGENDS</span>
            </span>
          </div>

          {/* Desktop Nav */}
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

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700 bg-slate-900/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors
                  ${currentPage === item.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }
                  ${item.id === 'admin' ? 'opacity-50' : ''}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
