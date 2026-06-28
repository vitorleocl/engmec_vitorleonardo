import { useState } from 'react';
import { Shield, Cpu, Sparkles, Wand2 } from 'lucide-react';
import LaudoNR12Indep from './LaudoNR12Indep';
import LaudoMaquinasPesadasIndep from './LaudoMaquinasPesadasIndep';

export default function LaudoGenerators() {
  const [selected, setSelected] = useState<'none' | 'nr12' | 'heavy'>('none');

  if (selected === 'nr12') {
    return <LaudoNR12Indep onBack={() => setSelected('none')} />;
  }

  if (selected === 'heavy') {
    return <LaudoMaquinasPesadasIndep onBack={() => setSelected('none')} />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title block */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#134074]/10 dark:bg-[#4895EF]/10 border border-[#134074]/20 dark:border-[#4895EF]/20 rounded-full text-[#134074] dark:text-[#4895EF] text-xs font-black font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
          <span>Sistemas Autónomos IA</span>
        </div>
        <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900 dark:text-white">Central de Geradores de Laudo</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Gere laudos técnicos robustos, relatórios fotográficos de campo e apreciação de risco regulamentar através de nossos motores de Inteligência Artificial especializados.
        </p>
      </div>

      {/* Grid of generators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* NR-12 Card */}
        <div 
          onClick={() => setSelected('nr12')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-36 h-36 text-[#0B2545]" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-[#0B2545]/5 dark:bg-white/5 border border-[#0B2545]/10 dark:border-white/10 rounded-2xl w-fit text-[#0B2545] dark:text-[#4895EF]">
              <Shield className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#0B2545] dark:group-hover:text-[#4895EF] transition-colors font-sans">
                  Gerador de Laudo NR-12
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Geração automatizada de laudos de adequação da Norma Regulamentadora Nº 12. Inclui análise de sistemas de segurança física, apreciação quantitativa de riscos (HRN), categorização NBR 14153, catalogação de não conformidades e plano de ação estruturado.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria NR-12 →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              12 Requisitos
            </span>
          </div>
        </div>

        {/* Máquinas Pesadas Card */}
        <div 
          onClick={() => setSelected('heavy')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu className="w-36 h-36 text-[#A00000]" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-red-600/5 dark:bg-red-500/5 border border-red-500/15 rounded-2xl w-fit text-red-600 dark:text-red-400">
              <Cpu className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-sans">
                  Gerador Máquinas Pesadas
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos e auditorias de segurança para equipamentos móveis de grande porte (Escavadeiras, Retroescavadeiras, Carregadeiras, Rolo Compressor, etc) sob as diretrizes das NR-12, NR-11 e NR-18. Inclui análise de 10 subsistemas, ROPS/FOPS e cálculo HRN especializado.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria de Frota →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              18 Requisitos
            </span>
          </div>
        </div>

      </div>

      {/* Info panel */}
      <div className="bg-[#134074]/5 dark:bg-[#4895EF]/5 border border-[#134074]/10 dark:border-[#4895EF]/10 p-5 rounded-2xl flex items-start gap-4 max-w-full">
        <Wand2 className="w-5 h-5 text-[#134074] dark:text-[#4895EF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white font-sans uppercase">Acelerador de Engenharia com Inteligência Artificial</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Ambos os geradores utilizam a API Gemini integrada para analisar dados de entrada, sugerir enquadramentos normativos, preencher checklists automáticos e redigir conclusões técnicas periciais em segundos. Faça upload de fotos em campo para que a IA realize o diagnóstico técnico visual!
          </p>
        </div>
      </div>
    </div>
  );
}
