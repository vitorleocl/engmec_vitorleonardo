/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, ArrowRight, NotebookTabs, MessageSquareCode } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-slate-50 dark:bg-slate-900 overflow-hidden pt-20 transition-colors duration-300">
      
      {/* Abstract Design Elements */}
      <div className="absolute top-[20%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-700/5 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-slate-400/10 dark:bg-slate-700/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 py-16">
        
        {/* Left copy column */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B2545]/10 text-[#0B2545] dark:bg-[#134074]/30 dark:text-[#4895EF] text-xs font-mono font-medium max-w-fit align-middle">
            <ShieldCheck className="w-4 h-4 text-[#134074] dark:text-[#4895EF]" />
            <span>Engenheiro Mecânico Certificado • CREA-PE 1822299490</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-sans font-black text-slate-950 dark:text-white tracking-tight leading-tighter">
            Pareceres Técnicos, <span className="bg-gradient-to-r from-[#0B2545] to-[#134074] dark:from-[#3A86C8] dark:to-[#4895EF] bg-clip-text text-transparent">Laudos e ART</span> com Rigor e Segurança.
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Soluções completas para Adequação à NR-12, PMOC, Laudos de Playground, Máquinas e Equipamentos Pesados, Inspeções Veiculares em Recife, Região Metropolitana e todo o estado de Pernambuco. Proteja seus ativos e garanta conformidade legal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="#contato"
              className="px-8 py-4 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-white font-semibold transition-all shadow-lg hover:shadow-blue-900/15 text-center flex items-center justify-center gap-2 group"
            >
              <span>Solicitar Orçamento</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </a>
            
            <a
              href="#servicos"
              className="px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 font-semibold transition-all text-center flex items-center justify-center gap-2"
            >
              <NotebookTabs className="w-4 h-4" />
              <span>Conhecer Serviços</span>
            </a>
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/60 dark:border-slate-800 max-w-lg">
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-[#0B2545] dark:text-[#4895EF] font-mono">100%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold font-sans">Conformidade Legal</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-[#0B2545] dark:text-[#4895EF] font-mono">PE</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold font-sans">Recife & RMR</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="block text-2xl md:text-3xl font-bold text-[#0B2545] dark:text-[#4895EF] font-mono">ART</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold font-sans">Anotação CREA</span>
            </div>
          </div>

        </div>

        {/* Right column with prominent engineer portrait */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative group w-full max-w-sm mx-auto lg:max-w-none">
            
            {/* Background design glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#4895EF] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 pointer-events-none" />
            
            {/* Main Premium Portrait Frame */}
            <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden p-3.5 transition-colors duration-300">
              
              {/* Fine drafting blueprint markings */}
              <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-slate-100 dark:border-slate-800/80 pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 border-t border-r border-slate-100 dark:border-slate-800/80 pointer-events-none z-10" />
              
              {/* High-impact profile photo */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-inner group-hover:border-[#134074]/30 dark:group-hover:border-[#4895EF]/30 transition-colors duration-500">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://vitorleonardo-engmec.netlify.app/assets/vitor-leonardo-Ca17hHDt.png" 
                  alt="Vitor Leonardo Cordeiro Linhares" 
                  className="w-full h-full object-cover object-top scale-101 hover:scale-105 transition-transform duration-700 bg-slate-100 dark:bg-slate-900"
                />
                
                {/* Visual Technical Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent p-6 pt-24 flex flex-col justify-end text-left pointer-events-none">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#4895EF] uppercase block mb-1">
                    Responsável Técnico Certificado
                  </span>
                  <h3 className="text-xl md:text-2xl font-sans font-black text-white tracking-tight leading-none mb-1.5">
                    Vitor Leonardo Cordeiro Linhares
                  </h3>
                  <p className="text-xs text-[#8DA9C4] font-mono font-semibold">
                    CREA-PE 1822299490
                  </p>
                </div>

                {/* Availability indicator badge */}
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B2545]/95 backdrop-blur-md text-white rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 shadow-lg select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Disponível</span>
                </div>
              </div>

              {/* Support Details & Call to Action below portrait */}
              <div className="p-4 space-y-4 text-left">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Pareceres técnicos, regularizações estruturais de média monta, laudos operacionais de carga e segurança NR-12 chancelados com ART imediata no CREA-PE.
                </p>

                {/* Operational Quick Stats list */}
                <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-100 dark:border-slate-800/80 pt-3.5 pb-1 font-mono">
                  <div className="flex flex-col">
                    <span className="text-slate-400 dark:text-slate-500">SEDE OPERACIONAL</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Recife - PE</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 dark:text-slate-500">SUPORTE TÉCNICO</span>
                    <span className="font-semibold text-[#134074] dark:text-[#4895EF]">24h Exclusivo</span>
                  </div>
                </div>

                {/* Portal Link */}
                <a
                  href="#acervo"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-[#0B2545] hover:text-white dark:hover:bg-[#134074] dark:hover:text-white border border-slate-200 dark:border-slate-800 text-[#0B2545] dark:text-slate-350 text-xs font-bold transition-all uppercase tracking-widest font-mono cursor-pointer text-center"
                >
                  <NotebookTabs className="w-3.5 h-3.5" />
                  <span>Acessar Portal do Cliente</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
