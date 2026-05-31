/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GraduationCap, Trophy, Award, Landmark } from 'lucide-react';

export default function About() {
  return (
    <section id="sobre" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 Scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Decorative Badge Column */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#07575B]/10 dark:bg-[#07575B]/20 rounded-3xl -rotate-3 scale-102 blur-lg pointer-events-none" />
            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-1.5 bg-[#003B46]" />
              
              <span className="text-sm font-mono text-[#07575B] dark:text-[#41B3A3] font-bold block mb-2">IDENTIFICAÇÃO</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
                Vitor Leonardo Cordeiro Linhares
              </h3>
              <p className="text-xs font-semibold uppercase font-mono text-slate-500 mb-6 tracking-wider">
                Conselho Regional de Engenharia - PE
              </p>

              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <GraduationCap className="w-5 h-5 text-[#07575B] dark:text-[#41B3A3]" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-slate-400">Qualificação</h4>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Engenhamento Mecânico Pleno</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <Award className="w-5 h-5 text-[#07575B] dark:text-[#41B3A3]" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-slate-400">Registro Fiscalizado</h4>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">CREA-PE: 1822299490</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <Landmark className="w-5 h-5 text-[#07575B] dark:text-[#41B3A3]" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-slate-400">Território PE</h4>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Recife, RMR e outras regiões</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-center font-mono text-slate-400 mt-8 border-t border-slate-200/50 dark:border-slate-800 pt-4">
                Regularidade profissional ativa perante a Lei Federal Nº 5.194/1966
              </div>
            </div>
          </div>

          {/* Right Narrative Copy Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-sm font-semibold tracking-widest text-[#003B46] dark:text-[#07575B] uppercase block font-mono">
                Quem Somos
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-950 dark:text-white tracking-tight leading-none">
                Confiabilidade Humana, Rigor Tecnológico e Respaldo Legal
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
              Liderada pelo engenheiro mecânico <strong>Vitor Leonardo Cordeiro Linhares</strong>, nossa consultoria técnica foi concebida para atender à crescente demanda por laudos de conformidade, planos de manutenção corporativa (PMOC) e segurança física e operacional de ativos industriais no estado de Pernambuco.
            </p>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
              Trabalhamos em estreita parceria com locadoras de equipamentos, indústrias de manufatura, condomínios residenciais e administradoras comerciais, oferecendo soluções que neutralizam riscos trabalhistas (NR-12, NR-11), asseguram responsabilidade técnica em manutenção de frotas pesadas e atenuam perigos à saúde de ocupantes de espaços refrigerados de forma ágil e descomplicada.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#07575B] rounded-full inline-block" />
                  Experiência Ampla
                </h4>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Experiência profunda em Planejamento e Controle de Manutenção (PCM), gestão ágil de paradas planejadas industriais e modelagem de confiabilidade mecânica.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#07575B] rounded-full inline-block" />
                  Emissão Ágil de ART
                </h4>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sem burocracia. Nossos processos digitais otimizados permitem a emissão imediata da correspondente ART profissional junto ao CREA-PE após vistoria conclusiva.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
