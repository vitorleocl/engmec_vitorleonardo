import { useState } from 'react';
import { Shield, Cpu, Sparkles, Wand2, Truck, FileText, ArrowRight, Car } from 'lucide-react';
import LaudoNR12Indep from './LaudoNR12Indep';
import LaudoMaquinasPesadasIndep from './LaudoMaquinasPesadasIndep';
import LaudoCaminhaoMunckGuindasteIndep from './LaudoCaminhaoMunckGuindasteIndep';
import LaudoInspecaoVeicularIndep from './LaudoInspecaoVeicularIndep';

export default function LaudoGenerators() {
  const [selected, setSelected] = useState<'none' | 'nr12' | 'heavy' | 'crane' | 'vehicle'>('none');
  const [prefilled, setPrefilled] = useState(false);

  const selectPrefilled = (type: 'heavy' | 'crane' | 'vehicle') => {
    setPrefilled(true);
    setSelected(type);
  };

  if (selected === 'nr12') {
    return <LaudoNR12Indep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} />;
  }

  if (selected === 'heavy') {
    return <LaudoMaquinasPesadasIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} />;
  }

  if (selected === 'crane') {
    return <LaudoCaminhaoMunckGuindasteIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} />;
  }

  if (selected === 'vehicle') {
    return <LaudoInspecaoVeicularIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} />;
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

      {/* SEPARATE BUTTONS SECTION: MODELO DE LAUDO EXEMPLO */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-48 h-48 text-[#4895EF]" />
        </div>
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4895EF]/20 border border-[#4895EF]/30 rounded-full text-[#4895EF] text-[10px] font-bold font-mono tracking-wider uppercase">
              NOVO RECURSO DE DEMONSTRAÇÃO
            </span>
            <h3 className="text-2xl font-black tracking-tight font-sans">Visualizar Laudo Técnico de Exemplo</h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-sans">
              Explore o modelo de laudo preenchido com dados fictícios técnicos e imagens reais para testar a qualidade visual do formato final antes de iniciar o seu laudo real. O documento foi aperfeiçoado para **Tamanho A4 padrão de impressão**, com **controle inteligente de quebra de páginas por seção**, assinatura centralizada oficial da **VL Engenharia** e uma **página final dedicada para os Anexos da ART**.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => selectPrefilled('crane')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-white hover:bg-slate-50 text-slate-950 font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#134074]" />
                <span className="font-sans text-left">Exemplo: Caminhão Munck & Guindastes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button 
              onClick={() => selectPrefilled('heavy')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-white/10"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span className="font-sans text-left">Exemplo: Ativos e Máquinas Pesadas</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>

            <button 
              onClick={() => selectPrefilled('vehicle')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-[#134074]/20"
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-emerald-400" />
                <span className="font-sans text-left">Exemplo: Inspeção Veicular</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of generators */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
        
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
                  Laudo NR-12
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Geração de laudos da NR-12. Inclui segurança física, apreciação de riscos (HRN), categorização NBR 14153, não conformidades e plano de ação estruturado.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
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
                  Máquinas Pesadas
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Equipamentos móveis de grande porte (Escavadeiras, Retroescavadeiras, Carregadeiras, etc) sob as diretrizes das NR-12, NR-11 e NR-18. Inclui ROPS/FOPS e HRN.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              18 Requisitos
            </span>
          </div>
        </div>

        {/* Munck e Guindastes Card */}
        <div 
          onClick={() => setSelected('crane')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="w-36 h-36 text-[#134074]" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-[#134074]/5 dark:bg-white/5 border border-[#134074]/10 dark:border-white/10 rounded-2xl w-fit text-[#134074] dark:text-[#4895EF]">
              <Truck className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#134074] dark:group-hover:text-[#4895EF] transition-colors font-sans">
                  Munck e Guindaste
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos e integridade operacional para Caminhões Munck, Guindastes Telescópicos e acessórios de içamento (cintas/manilhas). Possui tabela de carga.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-[#134074] dark:group-hover:text-[#4895EF] transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              20 Requisitos
            </span>
          </div>
        </div>

        {/* Inspeção Veicular Card */}
        <div 
          onClick={() => setSelected('vehicle')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car className="w-36 h-36 text-emerald-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-emerald-600/5 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-2xl w-fit text-emerald-600 dark:text-emerald-400">
              <Car className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-sans">
                  Inspeção Veicular
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos para carros, utilitários, frotas leves e pesadas em integridade física. Avaliação de 20 itens obrigatórios do CONTRAN, cálculo HRN e plano corretivo.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Inspeção →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              20 Requisitos
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
