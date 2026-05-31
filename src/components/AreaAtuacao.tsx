/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPin, Shield, Building2, Workflow } from 'lucide-react';

export default function AreaAtuacao() {
  const regions = [
    {
      name: 'Recife (Capital)',
      cities: 'Boa Viagem, Imbiribeira, Jaqueira, Centro, Santo Amaro, Madalena, Casa Forte',
      focus: 'PMOC, Playgrounds, Elevadores de Carga, Perícias Técnicas Judiciais'
    },
    {
      name: 'Região Metropolitana (RMR)',
      cities: 'Jaboatão dos Guararapes, Olinda, Cabo de Santo Agostinho, Ipojuca (Suape), Camaragibe, Paulista',
      focus: 'Laudos NR-12 industriais, Caminhão Munck, Frota de Máquinas Pesadas, Guindastes'
    },
    {
      name: 'Intermediário e Interior de PE',
      cities: 'Caruaru, Petrolina, Garanhuns, Goiana (Setor Automobilístico/Farmacêutico)',
      focus: 'Máquinas Pesadas, NR-12, PMOC, Linhas Hidráulicas e Confiabilidade de Ativos'
    }
  ];

  return (
    <section id="atuacao" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 Scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Territory Details Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="text-sm font-semibold tracking-widest text-[#003B46] dark:text-[#07575B] uppercase block font-mono">
                Logística Operacional
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-950 dark:text-white tracking-tight leading-none animate-fade-in">
                Cobertura Geográfica e Setorial
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Oferecemos suporte técnico presencial rápido para indústrias, canteiros de obras, condomínios e estabelecimentos comerciais por toda Pernambuco.
              </p>
            </div>

            <div className="space-y-4">
              {regions.map((reg, idx) => (
                <div 
                  key={idx} 
                  id={`regiao-${idx}`}
                  className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#07575B]/10 text-[#07575B] dark:bg-[#07575B]/25 dark:text-[#a8e6cf] rounded-lg group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 animate-bounce" />
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white font-sans">
                      {reg.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                    <strong className="text-slate-700 dark:text-slate-300">Cidades/Bairros:</strong> {reg.cities}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    <strong className="text-slate-700 dark:text-slate-300">Serviços Frequentes:</strong> {reg.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Map Display & Partnership Notice Column */}
          <div className="lg:col-span-6 space-y-8">
            {/* Visual geographic representation of active region */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <h3 className="font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#07575B]" />
                Área de Cobertura Técnico-Operacional
              </h3>
              
              {/* Responsive Styled Map representation/Iframe */}
              <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200/55 dark:border-slate-700 relative flex items-center justify-center">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126438.28359560447!2d-34.95450849318712!3d-8.04215837943033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab18a3a0d5b4cb%3A0xb3eb7fc48b0a996f!2sRecife%2C%20PE!5e0!3m2!1spt-BR!2sbr!4v1717178000000!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale contrast-125 dark:invert dark:opacity-85 pointer-events-auto"
                />
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-3 text-right">
                Geolocalização central: Recife, Pernambuco, Brasil
              </div>
            </div>

            {/* Partnership Call */}
            <div className="bg-gradient-to-br from-[#003B46] to-[#07575B] text-white rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-white/5 pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <span className="p-3 bg-white/10 rounded-xl">
                  <Workflow className="w-6 h-6 text-[#66A5AD]" />
                </span>
                <span className="text-xs font-mono tracking-widest text-[#66A5AD] uppercase font-bold">Modelos Comerciais</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-2xl tracking-tight text-white font-sans">
                  Parcerias Técnicas e Comerciais
                </h3>
                <p className="text-sm text-cyan-50/80 leading-relaxed">
                  Disponível para firmar contratos recorrentes ou parcerias integradas de Engenharia Mecânica com administradoras de condomínios, construtoras de médio/grande porte, locadoras de caminhões de carga e gerentes de manutenção fabril.
                </p>
              </div>

              <div className="flex gap-4 items-center bg-white/5 border border-white/10 p-4 rounded-xl">
                <Building2 className="w-5 h-5 text-[#66A5AD]" />
                <span className="text-xs text-white/95 font-medium">
                  Atendimento corporativo diferenciado e suporte completo para vistorias do CREA, MTE, Apevisa, bombeiros e órgãos judiciais.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
