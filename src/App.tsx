/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Shield, Sun, Moon, KeyRound, ArrowUp, Menu, X } from 'lucide-react';

import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import AreaAtuacao from './components/AreaAtuacao';
import ExecutedServicesCarousel from './components/ExecutedServicesCarousel';
import Contact from './components/Contact';
import DashboardMain from './components/Dashboard/DashboardMain';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme changes with DOM node
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle header background on scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 antialiased font-sans">
      
      {/* Premium Header / Navigation Bar */}
      <header 
        id="navbar"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 dark:bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-800 py-3.5' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Brand Logo Identity */}
          <div 
            onClick={() => scrollToSection('inicio')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="p-2.5 bg-[#003B46] text-white rounded-xl shadow-md group-hover:bg-[#07575B] transition-colors">
              <Shield className="w-5 h-5 flex-shrink-0" />
            </span>
            <div className="text-left">
              <h1 className="text-sm font-black tracking-wider uppercase font-sans text-slate-950 dark:text-white leading-none">
                Vitor Leonardo
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-[#07575B] dark:text-[#41B3A3] font-bold block pt-1">
                ENGENHEIRO MECÂNICO • CREA-PE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">
            <button onClick={() => scrollToSection('inicio')} className="hover:text-[#003B46] dark:hover:text-[#41B3A3] transition-colors cursor-pointer text-left">Início</button>
            <button onClick={() => scrollToSection('servicos')} className="hover:text-[#003B46] dark:hover:text-[#41B3A3] transition-colors cursor-pointer text-left">Serviços</button>
            <button onClick={() => scrollToSection('sobre')} className="hover:text-[#003B46] dark:hover:text-[#41B3A3] transition-colors cursor-pointer text-left">Sobre</button>
            <button onClick={() => scrollToSection('atuacao')} className="hover:text-[#003B46] dark:hover:text-[#41B3A3] transition-colors cursor-pointer text-left">Atuação</button>
            <button onClick={() => scrollToSection('servicos-executados')} className="hover:text-[#003B46] dark:hover:text-[#41B3A3] transition-colors cursor-pointer text-left">Casos de Sucesso</button>
            <button onClick={() => scrollToSection('contato')} className="hover:text-[#003B46] dark:hover:text-[#41B3A3] transition-colors cursor-pointer text-left">Contato</button>
          </nav>

          {/* Action Utility Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-amber-400 transition-colors cursor-pointer"
              title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Restricted Area shortcut button */}
            <button
              onClick={() => scrollToSection('restricted-area')}
              className="flex items-center gap-1.5 bg-[#003B46] hover:bg-[#07575B] text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider font-mono uppercase transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Área Restrita</span>
            </button>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-amber-400 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 space-y-3 shadow-xl absolute top-full inset-x-0">
            <nav className="flex flex-col gap-2.5 text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
              <button onClick={() => scrollToSection('inicio')} className="py-2 hover:text-[#003B46] dark:hover:text-[#41B3A3] text-left">Início</button>
              <button onClick={() => scrollToSection('servicos')} className="py-2 hover:text-[#003B46] dark:hover:text-[#41B3A3] text-left">Serviços</button>
              <button onClick={() => scrollToSection('sobre')} className="py-2 hover:text-[#003B46] dark:hover:text-[#41B3A3] text-left">Sobre</button>
              <button onClick={() => scrollToSection('atuacao')} className="py-2 hover:text-[#003B46] dark:hover:text-[#41B3A3] text-left">Atuação</button>
              <button onClick={() => scrollToSection('servicos-executados')} className="py-2 hover:text-[#003B46] dark:hover:text-[#41B3A3] text-left">Casos de Sucesso</button>
              <button onClick={() => scrollToSection('contato')} className="py-2 hover:text-[#003B46] dark:hover:text-[#41B3A3] text-left">Contato</button>
            </nav>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => scrollToSection('restricted-area')}
                className="w-full text-center flex items-center justify-center gap-2 bg-[#003B46] hover:bg-[#07575B] text-white py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Área Restrita (Login)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Full Core sections stack */}
      <main className="pt-20">
        <Hero />
        <Services />
        <About />
        <AreaAtuacao />
        <ExecutedServicesCarousel />
        <Contact />
        <DashboardMain />
      </main>

      {/* Professional Footer conforming with NR standards and LGPD disclosures */}
      <footer className="bg-[#002B30] text-slate-300 py-16 border-t-4 border-[#07575B]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 text-sm">
          
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-sans font-black tracking-widest text-[#66A5AD] uppercase text-md">
              Vitor Leonardo
            </h3>
            <p className="text-slate-400 leading-relaxed font-light text-xs">
              Engenharia mecânica focada em conformidade, segurança de ativos térmicos PMOC, laudos NR-12 e responsabilidade jurídica em Pernambuco.
            </p>
            <p className="text-[10px] font-mono text-[#41B3A3] font-semibold">
              Rigor de Engenharia e Agilidade Operacional.
            </p>
          </div>

          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Informação Legal</h4>
            <div className="space-y-1.5 text-slate-400">
              <p><strong>Engenheiro Responsável:</strong> Vitor Leonardo Cordeiro Linhares</p>
              <p><strong>Registro Profissional:</strong> CREA-PE 1822299490</p>
              <p><strong>Art. Associado:</strong> Resolução CONFEA Nº 218/1973</p>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Conformidade LGPD</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Seus dados recolhidos pelo formulário de propostas encontram-se protegidos segundo a Lei Geral de Proteção de Dados (Lei 13.709/2018). Somente são utilizados para contato comercial preliminar e prospecção técnica. Sem spam.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Vitor Leonardo Engenharia Mecânica. Todos os direitos reservados.
          </div>
          <div>
            CREA-PE Ativo • Recife, Região Metropolitana e Interior de PE
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <WhatsAppButton />

      {/* Scroll-to-Top trigger button */}
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-6 left-6 z-40 p-3 bg-[#07575B] hover:bg-[#003B46] text-white rounded-full shadow-lg hover:scale-110 transition-all cursor-pointer"
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

    </div>
  );
}
