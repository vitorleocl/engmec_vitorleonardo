import React, { useState, useRef } from "react";
import { 
  Shield, 
  FileText, 
  Wand2, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileDown, 
  Plus, 
  Trash2, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Info, 
  X, 
  Upload, 
  Copy, 
  Layers, 
  Building, 
  Users, 
  Cpu, 
  Wrench,
  Activity
} from "lucide-react";
import { 
  DEFAULT_PMOC_CHECKLIST, 
  PREFILLED_PMOC_PARAMS, 
  PREFILLED_PMOC_ENVIRONMENTS, 
  PREFILLED_PMOC_APPLIANCES, 
  PREFILLED_PMOC_NAO_CONFORMIDADES,
  DEFAULT_PMOC_SECOES,
  PMOCChecklistItem,
  PMOCNaoConformidade,
  UploadedImage
} from "./pmocData";
import PMOCReportPreview from "./PMOCReportPreview";
import { exportToWord, copyRichText, preprocessStylesheets, restoreStylesheets } from "../../lib/pdfUtils";

interface LaudoPMOCIndepProps {
  onBack?: () => void;
}

export default function LaudoPMOCIndep({ onBack }: LaudoPMOCIndepProps) {
  // Tabs management
  const [activeTab, setActiveTab] = useState<"params" | "environments" | "appliances" | "checklist" | "nonconformities" | "preview">("params");

  // State Management
  const [laudoParams, setLaudoParams] = useState(PREFILLED_PMOC_PARAMS);
  const [environments, setEnvironments] = useState(PREFILLED_PMOC_ENVIRONMENTS);
  const [appliances, setAppliances] = useState(PREFILLED_PMOC_APPLIANCES);
  const [checklist, setChecklist] = useState<PMOCChecklistItem[]>(DEFAULT_PMOC_CHECKLIST);
  const [naoConformidades, setNaoConformidades] = useState<PMOCNaoConformidade[]>(PREFILLED_PMOC_NAO_CONFORMIDADES);
  const [secoes, setSecoes] = useState<Record<string, string>>(DEFAULT_PMOC_SECOES);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // UI state
  const [loadingAI, setLoadingAI] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const reportRef = useRef<HTMLDivElement | null>(null);

  // Helper to show notifications
  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // State update handlers for params
  const handleParamChange = (field: keyof typeof PREFILLED_PMOC_PARAMS, value: string) => {
    setLaudoParams(prev => ({ ...prev, [field]: value }));
  };

  // Image Upload Handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [
          ...prev,
          {
            name: file.name,
            data: reader.result as string,
            description: `Identificação visual das condições técnicas do sistema de climatização em ${laudoParams.clientName}.`
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, val: string) => {
    setUploadedImages(prev => prev.map((img, i) => i === index ? { ...img, description: val } : img));
  };

  // Environments CRUD
  const addEnvironment = () => {
    const nextId = "env_" + (environments.length + 1);
    setEnvironments(prev => [
      ...prev,
      {
        id: nextId,
        identificacao: "Nova Área Climatizada",
        numOcupantesFixo: "5",
        numOcupantesFlutuante: "20",
        areaM2: "35",
        cargaTermica: "18.000 BTU/h",
        tagEquipamento: "SP-XX"
      }
    ]);
  };

  const updateEnvironment = (id: string, field: string, val: string) => {
    setEnvironments(prev => prev.map(env => env.id === id ? { ...env, [field]: val } : env));
  };

  const removeEnvironment = (id: string) => {
    setEnvironments(prev => prev.filter(env => env.id !== id));
  };

  // Appliances CRUD
  const addAppliance = () => {
    const nextId = "ap_" + (appliances.length + 1);
    setAppliances(prev => [
      ...prev,
      {
        id: nextId,
        tag: `SP-${String(appliances.length + 4).padStart(2, '0')}`,
        marca: "Nova Marca",
        modelo: "Inverter",
        capacidade: "12.000 BTU/h",
        localizacao: "Nova Sala de Reunião",
        tipo: "Split Hi-Wall",
        atividades: [
          { id: `${nextId}_act1`, descricao: "Limpar e higienizar filtros de ar", periodicidade: "Mensal", statusJan: "P", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "P", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
          { id: `${nextId}_act2`, descricao: "Limpar dreno e bandeja de condensado", periodicidade: "Mensal", statusJan: "P", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "P", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
          { id: `${nextId}_act3`, descricao: "Higienizar serpentina evaporadora", periodicidade: "Semestral", statusJan: "P", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "P", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" }
        ]
      }
    ]);
  };

  const updateAppliance = (id: string, field: string, val: string) => {
    setAppliances(prev => prev.map(ap => ap.id === id ? { ...ap, [field]: val } : ap));
  };

  const removeAppliance = (id: string) => {
    setAppliances(prev => prev.filter(ap => ap.id !== id));
  };

  // Cycle Monthly Status (P -> E -> X -> -)
  const cycleActivityStatus = (appId: string, actId: string, monthField: string) => {
    setAppliances(prev => prev.map(ap => {
      if (ap.id !== appId) return ap;
      return {
        ...ap,
        atividades: ap.atividades.map(act => {
          if (act.id !== actId) return act;
          const current = (act as any)[monthField] || "P";
          let next = "P";
          if (current === "P") next = "E";
          else if (current === "E") next = "X";
          else if (current === "X") next = "-";
          else next = "P";
          return { ...act, [monthField]: next };
        })
      };
    }));
  };

  // Checklist updates
  const updateChecklistItem = (id: string, field: keyof PMOCChecklistItem, val: string) => {
    setChecklist(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  // Non-conformities CRUD
  const addNaoConformidade = () => {
    const nextId = "NC-" + String(naoConformidades.length + 1).padStart(2, "0");
    setNaoConformidades(prev => [
      ...prev,
      {
        id: nextId,
        equipamento: "Geral",
        problema: "Descrição da não conformidade...",
        norma: "Portaria MS 3.523/1998 Requisito...",
        recomendacao: "Substituir, ajustar ou adequar...",
        prioridade: "IMEDIATO",
        responsavel: "Técnico Climatização",
        prazo: "10 dias"
      }
    ]);
  };

  const updateNaoConformidade = (id: string, field: keyof PMOCNaoConformidade, val: string) => {
    setNaoConformidades(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  const removeNaoConformidade = (id: string) => {
    setNaoConformidades(prev => prev.filter(it => it.id !== id));
  };

  // AI-Powered PMOC Technical Auditor Call
  const handleAIAudit = async () => {
    setLoadingAI(true);
    setSecoes({
      introducao: "Analisando sistemas e gerando introdução de conformidade técnica sanitária...",
      metodologia: "Gerando metodologia com base na NBR 16401 e RE 09 da ANVISA...",
      sistemas_climatizacao: "Processando as especificações térmicas e inventário...",
      conclusao_text: "Processando parecer conclusivo final do Engenheiro Vitor Leonardo..."
    });

    try {
      const response = await fetch("/api/gemini/pmoc-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          laudoNumber: laudoParams.laudoNumber,
          clientName: laudoParams.clientName,
          cnpj: laudoParams.cnpj,
          address: laudoParams.address,
          buildingType: laudoParams.buildingType,
          climatizedArea: laudoParams.climatizedArea,
          estimatedUsers: laudoParams.estimatedUsers,
          refrigerantType: laudoParams.refrigerantType,
          rtName: laudoParams.rtName,
          rtCrea: laudoParams.rtCrea,
          rtArt: laudoParams.rtArt,
          notes: laudoParams.notes,
          environments,
          appliances,
          checklist,
          images: uploadedImages.slice(0, 3)
        })
      });

      if (!response.ok) {
        throw new Error("API call failed.");
      }

      const data = await response.json();
      
      // Update states from Gemini response
      if (data.checklist) {
        // Map keys if needed or replace
        const updatedChecklist = checklist.map((item, idx) => {
          const key = `item_${idx + 1}`;
          if (data.checklist[key]) {
            return {
              ...item,
              status: data.checklist[key].resposta || item.status,
              nota: data.checklist[key].nota || item.nota
            };
          }
          return item;
        });
        setChecklist(updatedChecklist);
      }

      if (data.nao_conformidades) {
        setNaoConformidades(data.nao_conformidades);
      }

      if (data.secoes) {
        setSecoes(data.secoes);
      }

      showNotification("success", "Vistoria e PMOC gerados com absoluto sucesso pelo Auditor de Inteligência Artificial!");
    } catch (err) {
      console.error(err);
      // Fallback to simulated data already in state
      showNotification("info", "GEMINI_API_KEY ausente ou inativa. Executando simulação pericial mestre da VL Engenharia com dados de alta fidelidade.");
      setSecoes(DEFAULT_PMOC_SECOES);
      setChecklist(DEFAULT_PMOC_CHECKLIST);
      setNaoConformidades(PREFILLED_PMOC_NAO_CONFORMIDADES);
    } finally {
      setLoadingAI(false);
    }
  };

  // Export Actions
  const handlePrintPDF = () => {
    // Inject print classes to clean headers and footers from browser
    preprocessStylesheets();
    window.print();
    restoreStylesheets();
  };

  const handleExportWord = () => {
    exportToWord("pmoc-report-container", `PMOC_${laudoParams.clientName.replace(/\s+/g, '_')}`);
    showNotification("success", "Memorial do PMOC exportado em formato Word (.doc) com sucesso!");
  };

  const handleCopyRichText = () => {
    copyRichText("pmoc-report-container");
    showNotification("success", "Conteúdo formatado copiado! Ideal para colar direto no Google Docs ou Microsoft Word.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#134074]/10 rounded-2xl text-[#134074]">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <span className="font-sans font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase">SISTEMA PMOC</span>
            <p className="text-xs text-slate-500 font-mono">Gerador Automático de Plano de Manutenção, Operação e Controle • VL Engenharia</p>
          </div>
        </div>

        <div className="flex gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-650 text-xs font-bold transition-all"
            >
              Voltar ao Painel
            </button>
          )}

          <button
            onClick={handleAIAudit}
            disabled={loadingAI}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 transition-all hover:-translate-y-0.5"
          >
            <Wand2 className="w-4.5 h-4.5" />
            {loadingAI ? "Processando Auditoria AI..." : "Gerar PMOC com AI"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border shadow-sm animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200/50 text-emerald-800" 
            : notification.type === "error"
            ? "bg-rose-50 border-rose-200/50 text-rose-800"
            : "bg-blue-50 border-blue-200/50 text-blue-800"
        }`}>
          <div className="p-1 rounded-lg bg-white shadow-sm mt-0.5">
            {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Info className="w-4 h-4 text-blue-600" />}
          </div>
          <p className="text-xs font-medium leading-relaxed">{notification.text}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("params")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
            activeTab === "params" 
              ? "border-[#134074] text-[#134074]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building className="w-4 h-4" />
          1. Estabelecimento & RT
        </button>
        <button
          onClick={() => setActiveTab("environments")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
            activeTab === "environments" 
              ? "border-[#134074] text-[#134074]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          2. Ambientes Climatizados
        </button>
        <button
          onClick={() => setActiveTab("appliances")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
            activeTab === "appliances" 
              ? "border-[#134074] text-[#134074]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Cpu className="w-4 h-4" />
          3. Aparelhos & Cronograma
        </button>
        <button
          onClick={() => setActiveTab("checklist")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
            activeTab === "checklist" 
              ? "border-[#134074] text-[#134074]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          4. Checklist Vistoria
        </button>
        <button
          onClick={() => setActiveTab("nonconformities")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
            activeTab === "nonconformities" 
              ? "border-[#134074] text-[#134074]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          5. Não Conformidades
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
            activeTab === "preview" 
              ? "border-[#134074] text-[#134074]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          6. Relatório Final (Preview)
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        
        {/* TAB 1: PARAMS */}
        {activeTab === "params" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 border-b pb-2 uppercase flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Identificação do Estabelecimento
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Nome / Razão Social</label>
                    <input 
                      type="text" 
                      value={laudoParams.clientName}
                      onChange={(e) => handleParamChange("clientName", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">CNPJ</label>
                    <input 
                      type="text" 
                      value={laudoParams.cnpj}
                      onChange={(e) => handleParamChange("cnpj", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Endereço Completo</label>
                    <input 
                      type="text" 
                      value={laudoParams.address}
                      onChange={(e) => handleParamChange("address", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Bairro</label>
                    <input 
                      type="text" 
                      value={laudoParams.bairro}
                      onChange={(e) => handleParamChange("bairro", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Cidade / UF</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={laudoParams.city}
                        onChange={(e) => handleParamChange("city", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                      />
                      <input 
                        type="text" 
                        value={laudoParams.uf}
                        onChange={(e) => handleParamChange("uf", e.target.value)}
                        className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white text-center font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Telefone</label>
                    <input 
                      type="text" 
                      value={laudoParams.telefone}
                      onChange={(e) => handleParamChange("telefone", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">E-mail</label>
                    <input 
                      type="text" 
                      value={laudoParams.email}
                      onChange={(e) => handleParamChange("email", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-sans font-black text-sm tracking-tight text-emerald-600 dark:text-emerald-400 border-b pb-2 uppercase flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Responsabilidade Técnica (RT)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Responsável Técnico (Engenheiro)</label>
                    <input 
                      type="text" 
                      value={laudoParams.rtName}
                      onChange={(e) => handleParamChange("rtName", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Registro CREA / UF</label>
                    <input 
                      type="text" 
                      value={laudoParams.rtCrea}
                      onChange={(e) => handleParamChange("rtCrea", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Número ART Vinculada</label>
                    <input 
                      type="text" 
                      value={laudoParams.rtArt}
                      onChange={(e) => handleParamChange("rtArt", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Fluido Refrigerante Padrão</label>
                    <input 
                      type="text" 
                      value={laudoParams.refrigerantType}
                      onChange={(e) => handleParamChange("refrigerantType", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Data de Emissão</label>
                    <input 
                      type="text" 
                      value={laudoParams.issueDate}
                      onChange={(e) => handleParamChange("issueDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Validade Técnica</label>
                    <input 
                      type="text" 
                      value={laudoParams.validityDate}
                      onChange={(e) => handleParamChange("validityDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Image Upload Area */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 border-b pb-2 uppercase flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Fotos de Campo (Anexos)
                </h3>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Arraste ou clique para enviar</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-1">PNG, JPG ou JPEG até 10MB</p>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-950/60 relative space-y-2">
                      <div className="flex gap-2 items-start">
                        <img src={img.data} alt={img.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate font-mono">{img.name}</p>
                          <p className="text-[8px] text-slate-400 font-mono">FOTO {String(idx + 1).padStart(2, '0')}</p>
                        </div>
                        <button 
                          onClick={() => removeImage(idx)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Escreva a legenda técnica da evidência..." 
                        value={img.description}
                        onChange={(e) => updateImageDescription(idx, e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-[10px] text-slate-700 dark:text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENVIRONMENTS */}
        {activeTab === "environments" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Relação dos Ambientes Climatizados
              </h3>
              <button 
                onClick={addEnvironment}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#134074]/10 hover:bg-[#134074]/20 text-[#134074] rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Área
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-450 uppercase bg-slate-50 dark:bg-slate-950/40">
                    <th className="p-3">Identificação / Setor</th>
                    <th className="p-3 w-28 text-center">Ocupantes Fixos</th>
                    <th className="p-3 w-28 text-center">Flutuantes</th>
                    <th className="p-3 w-24 text-center">Área (m²)</th>
                    <th className="p-3 w-36">Carga Térmica</th>
                    <th className="p-3 w-36">Equipamento (TAG)</th>
                    <th className="p-3 w-16 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 font-sans">
                  {environments.map(env => (
                    <tr key={env.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={env.identificacao} 
                          onChange={(e) => updateEnvironment(env.id, "identificacao", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-bold"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="number" 
                          value={env.numOcupantesFixo} 
                          onChange={(e) => updateEnvironment(env.id, "numOcupantesFixo", e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white text-center font-mono"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="number" 
                          value={env.numOcupantesFlutuante} 
                          onChange={(e) => updateEnvironment(env.id, "numOcupantesFlutuante", e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white text-center font-mono"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="number" 
                          value={env.areaM2} 
                          onChange={(e) => updateEnvironment(env.id, "areaM2", e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white text-center font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={env.cargaTermica} 
                          onChange={(e) => updateEnvironment(env.id, "cargaTermica", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={env.tagEquipamento} 
                          onChange={(e) => updateEnvironment(env.id, "tagEquipamento", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono font-bold"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => removeEnvironment(env.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: APPLIANCES & CRONOGRAMA */}
        {activeTab === "appliances" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Relação de Condicionadores (Aparelhos)
                </h3>
                <button 
                  onClick={addAppliance}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#134074]/10 hover:bg-[#134074]/20 text-[#134074] rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Aparelho
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-450 uppercase bg-slate-50 dark:bg-slate-950/40">
                      <th className="p-3 w-28">TAG</th>
                      <th className="p-3 w-40">Tipo</th>
                      <th className="p-3 w-44">Fabricante</th>
                      <th className="p-3 w-36">Capacidade</th>
                      <th className="p-3">Localização Física</th>
                      <th className="p-3 w-16 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 font-sans">
                    {appliances.map(ap => (
                      <tr key={ap.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={ap.tag} 
                            onChange={(e) => updateAppliance(ap.id, "tag", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-bold font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={ap.tipo} 
                            onChange={(e) => updateAppliance(ap.id, "tipo", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={ap.marca} 
                            onChange={(e) => updateAppliance(ap.id, "marca", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={ap.capacidade} 
                            onChange={(e) => updateAppliance(ap.id, "capacidade", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={ap.localizacao} 
                            onChange={(e) => updateAppliance(ap.id, "localizacao", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button 
                            onClick={() => removeAppliance(ap.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CRONOGRAMA ANUAL CONTROLS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 border-b pb-2 uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Matriz de Planejamento & Cronograma Mensal
              </h3>
              
              <div className="p-4 bg-[#134074]/5 border border-[#134074]/15 rounded-xl text-slate-600 dark:text-slate-300 text-xs flex gap-2 items-start font-sans">
                <Info className="w-5 h-5 text-[#134074] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Como funciona a matriz de planejamento mensal?</p>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    Clique nas células dos meses para alternar o status das atividades preventivas programadas para cada evaporadora ou fancoil.
                    Os estados possíveis são: <strong className="text-blue-600 font-mono">P</strong> (Programado), <strong className="text-emerald-600 font-mono">E</strong> (Executado), <strong className="text-red-600 font-mono">X</strong> (Não Executado/Bloqueado) e <strong className="text-slate-400 font-mono">-</strong> (Não Aplicável).
                  </p>
                </div>
              </div>

              {appliances.map(ap => (
                <div key={ap.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
                    <span className="font-bold font-mono text-xs text-[#134074] dark:text-blue-400">APARELHO: {ap.tag} • {ap.localizacao}</span>
                    <span className="text-[9px] bg-[#134074]/10 text-[#134074] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">{ap.tipo} ({ap.capacidade})</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse text-[10.5px] font-mono">
                      <thead>
                        <tr className="bg-slate-100/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[9px]">
                          <th className="p-2 text-left font-sans text-slate-700 dark:text-slate-350 w-80">Rotina de Manutenção Preventiva</th>
                          <th className="p-2 border-r border-slate-200 dark:border-slate-800 w-16">Per.</th>
                          <th className="p-1 w-8">JAN</th>
                          <th className="p-1 w-8">FEV</th>
                          <th className="p-1 w-8">MAR</th>
                          <th className="p-1 w-8">ABR</th>
                          <th className="p-1 w-8">MAI</th>
                          <th className="p-1 w-8">JUN</th>
                          <th className="p-1 w-8">JUL</th>
                          <th className="p-1 w-8">AGO</th>
                          <th className="p-1 w-8">SET</th>
                          <th className="p-1 w-8">OUT</th>
                          <th className="p-1 w-8">NOV</th>
                          <th className="p-1 w-8">DEZ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40">
                        {ap.atividades?.map(act => (
                          <tr key={act.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10">
                            <td className="p-2 text-left font-sans text-slate-800 dark:text-slate-200 leading-snug">{act.descricao}</td>
                            <td className="p-2 text-center font-bold text-slate-550 border-r border-slate-200 dark:border-slate-800">{act.periodicidade}</td>
                            
                            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(month => {
                              const f = `status${month}`;
                              const val = (act as any)[f] || "P";
                              return (
                                <td 
                                  key={month} 
                                  onClick={() => cycleActivityStatus(ap.id, act.id, f)}
                                  className={`p-1.5 font-bold cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-r border-slate-100 dark:border-slate-900 ${
                                    val === "E" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                                    val === "P" ? "text-blue-500 bg-blue-50/30 dark:bg-blue-950/10" :
                                    val === "X" ? "text-rose-600 bg-rose-50 dark:bg-rose-950/20" :
                                    "text-slate-400 bg-slate-50 dark:bg-slate-900"
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 border-b pb-2 uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Checklist Pericial de Auditoria de Campo
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-450 uppercase bg-slate-50 dark:bg-slate-950/40">
                    <th className="p-3 w-40">Subsistema</th>
                    <th className="p-3">Item de Auditoria Sanitária / Técnica</th>
                    <th className="p-3 w-44 text-center">Status Vistoria</th>
                    <th className="p-3 w-80">Notas & Evidências Adicionais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 font-sans">
                  {checklist.map(it => (
                    <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="p-3 font-bold text-[#134074] dark:text-blue-400 font-mono text-[10px]">{it.category}</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 leading-snug">{it.text}</td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          {["OK", "NOK", "N/A"].map((st) => (
                            <button
                              key={st}
                              onClick={() => updateChecklistItem(it.id, "status", st as any)}
                              className={`px-2.5 py-1 text-[10px] font-black font-mono border rounded-lg transition-all ${
                                it.status === st 
                                  ? st === 'OK' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' :
                                    st === 'NOK' ? 'bg-rose-500 text-white border-rose-600 shadow-sm' :
                                    'bg-slate-400 text-white border-slate-500 shadow-sm'
                                  : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={it.nota}
                          onChange={(e) => updateChecklistItem(it.id, "nota", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-350"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: NONCONFORMITIES */}
        {activeTab === "nonconformities" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-sans font-black text-sm tracking-tight text-[#134074] dark:text-blue-400 uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Não Conformidades Identificadas & Ações Corretivas
              </h3>
              <button 
                onClick={addNaoConformidade}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#134074]/10 hover:bg-[#134074]/20 text-[#134074] rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Desvio
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-450 uppercase bg-slate-50 dark:bg-slate-950/40">
                    <th className="p-3 w-16">Ref</th>
                    <th className="p-3 w-40">Equipamento / TAG</th>
                    <th className="p-3">Descrição da Irregularidade</th>
                    <th className="p-3 w-44">Enquadramento Legal</th>
                    <th className="p-3">Recomendação de Correção</th>
                    <th className="p-3 w-40">Responsável / Prazo</th>
                    <th className="p-3 w-16 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 font-sans">
                  {naoConformidades.map(nc => (
                    <tr key={nc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="p-2 font-bold font-mono text-slate-900 dark:text-white text-[11px]">{nc.id}</td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={nc.equipamento} 
                          onChange={(e) => updateNaoConformidade(nc.id, "equipamento", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <textarea 
                          value={nc.problema} 
                          onChange={(e) => updateNaoConformidade(nc.id, "problema", e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={nc.norma} 
                          onChange={(e) => updateNaoConformidade(nc.id, "norma", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <textarea 
                          value={nc.recomendacao} 
                          onChange={(e) => updateNaoConformidade(nc.id, "recomendacao", e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="p-2 space-y-1">
                        <input 
                          type="text" 
                          value={nc.responsavel} 
                          placeholder="Responsável"
                          onChange={(e) => updateNaoConformidade(nc.id, "responsavel", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-[10px] text-slate-850 dark:text-white"
                        />
                        <input 
                          type="text" 
                          value={nc.prazo} 
                          placeholder="Prazo"
                          onChange={(e) => updateNaoConformidade(nc.id, "prazo", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-[10px] text-slate-850 dark:text-white font-mono"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => removeNaoConformidade(nc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PREVIEW & ACTIONS */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            {/* Action Bar for Exports */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap gap-2 justify-between items-center shadow-sm">
              <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-[#134074]" />
                Visualização do documento com formatação A4 oficial da VL Engenharia.
              </span>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyRichText}
                  className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 transition-all"
                >
                  <Copy className="w-4 h-4" /> Copiar Texto
                </button>
                <button
                  onClick={handleExportWord}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-[#134074]/10 hover:bg-[#134074]/20 text-[#134074] rounded-xl text-xs font-bold transition-all"
                >
                  <FileDown className="w-4 h-4" /> Baixar Word
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-1 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
              </div>
            </div>

            {/* PMOC Report Preview Container */}
            <PMOCReportPreview
              laudoParams={laudoParams}
              checklist={checklist}
              environments={environments}
              appliances={appliances}
              naoConformidades={naoConformidades}
              secoes={secoes}
              uploadedImages={uploadedImages}
              reportRef={reportRef}
            />
          </div>
        )}

      </div>
    </div>
  );
}
