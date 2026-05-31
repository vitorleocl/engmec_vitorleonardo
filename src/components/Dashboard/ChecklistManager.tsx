/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChecklistData, ClientData, EquipmentData, ChecklistType } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2, Clipboard, Save, HelpCircle, Printer, Check, X, Shield, Lock } from 'lucide-react';

interface ChecklistQuestion {
  id: string;
  category: string;
  text: string;
}

const QUESTIONS_BY_TYPE: Record<ChecklistType, ChecklistQuestion[]> = {
  nr12: [
    { id: 'q1_bimanual', category: 'Sistemas Elétricos e Comando', text: 'Dispositivo de acionamento bimanual está funcionando corretamente impedindo bicos de prensa?' },
    { id: 'q2_clausuras', category: 'Proteções Mecânicas', text: 'Zonas de perigo por transmissão de torque encontram-se enclausuradas por proteções fixas?' },
    { id: 'q3_sensor_porta', category: 'Intertravamento', text: 'Os sensores magnéticos de segurança nas portas móveis param a máquina instantaneamente ao abrir?' },
    { id: 'q4_parada_emergente', category: 'Emergência', text: 'Os botões de parada de emergência tipo cogumelo estão desimpedidos, visíveis e funcionais?' },
    { id: 'q5_painel_eletrico', category: 'Painel Elétrico', text: 'O painel elétrico de comando possui sinalização de alta tensão, aterramento e dispositivo contra surtos?' }
  ],
  munck: [
    { id: 'q1_lancas', category: 'Sistemas Hidráulicos', text: 'Mangueiras hidráulicas isentas de bolhas, escoriações longitudinais ou indícios de vazamento de fluidos?' },
    { id: 'q2_valvulas', category: 'Válvulas de Segurança', text: 'As válvulas de retenção piloto (Holding valves) estão sustentando a carga nominal sem quedas repentinas?' },
    { id: 'q3_estabilidade', category: 'Estabilizadores', text: 'As sapatas estabilizadoras abrem em seu curso completo sem ruídos anormais e apoiam perfeitamente?' },
    { id: 'q4_torque_giro', category: 'Coroa de Giro', text: 'Coroa e rolamentos de giro devidamente lubrificados, sem folgas excessivas ou estalos em operação?' },
    { id: 'q5_ganchos_travas', category: 'Ganchos', text: 'O gancho principal possui trava de segurança operacional contra liberação de cabo em perfeitas condições?' }
  ],
  guindaste: [
    { id: 'q1_cabos_aco', category: 'Elementos de Içamento', text: 'Cabos de aço isentos de fios rompidos, deformações em saca-rolhas ou amassamentos em polias?' },
    { id: 'q2_limites', category: 'Finais de Curso', text: 'Dispositivos eletrônicos limitadores de fim de curso e anemômetro calibrados e operantes?' },
    { id: 'q3_estrutura', category: 'Estruturas Metálicas', text: 'Soldas de união mecânica em colunas e lança telescópica sem deformações, trincas ou pontos de oxidação?' },
    { id: 'q4_sinalizacao', category: 'Cabine de Comando', text: 'Cabine operacional possui tabelas visuais de cargas versus raio de operação física legíveis?' },
    { id: 'q5_hidraulicos_bombas', category: 'Hidráulica Principal', text: 'Bomba hidráulica de pressão com ruído operacional normal, sem quedas no manômetro de controle?' }
  ],
  maquinas_pesadas: [
    { id: 'q1_freios', category: 'Segurança de Direção', text: 'Servofreio de serviço e freio de estacionamento mecânico segurando o torque nominal de rampa?' },
    { id: 'q2_estruturas_rops', category: 'Protetores', text: 'Cabina equipada com cabina de segurança protetora contra tombamento (ROPS) e queda de objetos (FOPS)?' },
    { id: 'q3_vazamentos', category: 'Fluidos e Motor', text: 'Compartimento do motor limpo, sem gotejamentos de óleo lubrificante ou vazamento de aditivo térmico?' },
    { id: 'q4_pneus_esteiras', category: 'Tração', text: 'Pneus com sulcos ideais / sapatas das esteiras metálicas apertadas e com tensionamento correto?' },
    { id: 'q5_cintos_bancos', category: 'Ergonomia', text: 'Cinto de segurança retrátil disponível com ancoragem intacta, assento com amortecedor íntegro?' }
  ],
  playground: [
    { id: 'q1_cantos_vivos', category: 'Segurança Física', text: 'Brinquedos isentos de lascas pontiagudas de madeira, cantos vivos em chapas de aço ou parafusos expostos?' },
    { id: 'q2_aprisionamentos', category: 'Geometria de Riscos', text: 'Espaçamento entre degraus e vãos em conformidade prevenindo aprisionamento de cabeça, pescoço ou dedos?' },
    { id: 'q3_piso_impacto', category: 'Piso de Absorção', text: 'Área de queda equipada com piso emborrachado ou areia sanitária com profundidade mínima regulamentada?' },
    { id: 'q4_correntes_balancos', category: 'Suspensão', text: 'Fechos, correntes e ganchos em balanços sem sinais de desgaste por atrito ou alongamento excessivo de elos?' },
    { id: 'q5_estabilidade_solo', category: 'Fincamento', text: 'As fundações civis de fixação dos brinquedos estão encobertas e travadas firmemente sob a grama/terra?' }
  ],
  pmoc: [
    { id: 'q1_filtros_g2', category: 'Higienização Química', text: 'Filtros de ar (G2/G4) limpos mensalmente e trocados segundo diretrizes microbiológicas oficiais?' },
    { id: 'q2_serpentinas_limpas', category: 'Troca Térmica', text: 'Serpentina de evaporação e bandeja de condensado higienizadas contra biofilme fúngico legionela?' },
    { id: 'q3_renovacao_pmoc', category: 'Exaustão', text: 'O ventilador de insuflamento e captação do ar externo operando livremente proporcionando renovações ideais?' },
    { id: 'q4_dutos_isolamento', category: 'Dutos Climatizadores', text: 'Dutos de fornecimento em perfeitas condições, sem furos ou isolamento térmico rasgado gotejando?' },
    { id: 'q5_documento_semestre', category: 'Legalidade', text: 'Anotações mensais em dia e análise laboratorial semestral da qualidade físico-química do ar arquivada?' }
  ]
};

export default function ChecklistManager() {
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printingChecklist, setPrintingChecklist] = useState<ChecklistData | null>(null);

  // New Checklist Form fields
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEq, setSelectedEq] = useState('');
  const [checklistType, setChecklistType] = useState<ChecklistType>('nr12');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inspectorName, setInspectorName] = useState('Eng. Vitor Leonardo C. Linhares');

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        const querySnapshot = await getDocs(collection(db, 'checklists'));
        const arr: ChecklistData[] = [];
        querySnapshot.forEach(docSnap => arr.push(docSnap.data() as ChecklistData));
        setChecklists(arr);

        const clientsSnap = await getDocs(collection(db, 'clients'));
        const cliArray: ClientData[] = [];
        clientsSnap.forEach(docSnap => cliArray.push(docSnap.data() as ClientData));
        setClients(cliArray);
        if (cliArray.length > 0) setSelectedClient(cliArray[0].id);

        const eqSnap = await getDocs(collection(db, 'equipments'));
        const eqArray: EquipmentData[] = [];
        eqSnap.forEach(docSnap => eqArray.push(docSnap.data() as EquipmentData));
        setEquipments(eqArray);
      } else {
        setChecklists(mockDb.getChecklists());
        const mockClis = mockDb.getClients();
        setClients(mockClis);
        if (mockClis.length > 0) setSelectedClient(mockClis[0].id);
        setEquipments(mockDb.getEquipments());
      }
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'checklists');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      const activeEqs = equipments.filter(e => e.clientId === selectedClient);
      if (activeEqs.length > 0) {
        setSelectedEq(activeEqs[0].id);
      } else {
        setSelectedEq('');
      }
    }
  }, [selectedClient, equipments]);

  // Handle drawing on signature canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#07575B';
    ctx.lineWidth = 2;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setSignatureSaved(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
  };

  // Build Answers model
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedEq) return;

    setLoading(true);
    const matchedClient = clients.find(c => c.id === selectedClient);
    const matchedEq = equipments.find(eq => eq.id === selectedEq);
    const chkId = 'chk_' + Math.random().toString(36).substr(2, 9);

    // Grab canvas drawing representation
    let signatureUrl = '';
    const canvas = canvasRef.current;
    if (canvas && signatureSaved) {
      signatureUrl = canvas.toDataURL('image/png');
    }

    const compiledAnswers: Record<string, string | boolean> = {};
    QUESTIONS_BY_TYPE[checklistType].forEach(q => {
      compiledAnswers[q.id] = answers[q.id] === 'C'; // True if Conforme
    });

    const saveObj: ChecklistData = {
      id: chkId,
      type: checklistType,
      clientId: selectedClient,
      clientName: matchedClient ? matchedClient.company : 'Cliente',
      equipmentId: selectedEq,
      equipmentModel: matchedEq ? `${matchedEq.type} (${matchedEq.model})` : 'Equipamento',
      questions: compiledAnswers,
      signatureUrl: signatureUrl,
      digitalSignature: 'MD5:' + Math.random().toString(36).substr(2, 5) + Date.now().toString(36),
      inspectorName: inspectorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (isRealFirebase) {
        await setDoc(doc(db, 'checklists', chkId), saveObj);
      } else {
        mockDb.saveChecklist(saveObj);
      }
      setModalOpen(false);
      clearForm();
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `checklists/${chkId}`);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setAnswers({});
    setSignatureSaved(false);
    setChecklistType('nr12');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este checklist permanentemente?')) return;
    setLoading(true);
    try {
      if (isRealFirebase) {
        await deleteDoc(doc(db, 'checklists', id));
      } else {
        mockDb.deleteChecklist(id);
      }
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `checklists/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerPrint = (chk: ChecklistData) => {
    setPrintingChecklist(chk);
    setTimeout(() => {
      window.print();
    }, 450);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-100 md:text-slate-900 dark:text-white">Módulo de Checklists Operacionais</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Instaurar vistorias táticas para NR12, PMOC ou Muncks, recolher assinaturas digitais e autogerar pareceres em PDF para impressão</p>
        </div>

        <button
          onClick={() => {
            clearForm();
            setModalOpen(true);
          }}
          disabled={clients.length === 0 || equipments.length === 0}
          className="flex items-center gap-2 bg-[#07575B] hover:bg-[#003B46] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors cursor-pointer self-start disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Realizar Vistoria</span>
        </button>
      </div>

      {/* History table list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
            <span className="w-5 h-5 border-2 border-[#07575B] border-t-transparent rounded-full animate-spin" />
            <span>Processando auditorias...</span>
          </div>
        ) : checklists.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Nenhuma vistoria ou checklist cadastrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Tipo checklist</th>
                  <th className="p-4">Cliente / Dispositivo</th>
                  <th className="p-4">Inspetor de Atividade</th>
                  <th className="p-4 font-mono">Assinatura Digital</th>
                  <th className="p-4 text-right">Laudo PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {checklists.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 text-[10px] font-black font-mono uppercase border border-slate-200/50">
                        {chk.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{chk.clientName}</div>
                      <div className="text-xs text-slate-500 font-sans">{chk.equipmentModel}</div>
                    </td>
                    <td className="p-4 space-y-0.5 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{chk.inspectorName}</div>
                      <div className="text-slate-400 font-mono text-[10px]">{new Date(chk.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {chk.signatureUrl ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                            <Lock className="w-3.5 h-3.5" />
                            <span>ASSINADO</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sem assinatura</span>
                        )}
                        <span className="text-[9px] text-slate-400/80 font-mono italic select-all block truncate max-w-[120px]" title={chk.digitalSignature}>
                          {chk.digitalSignature}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => triggerPrint(chk)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-[#07575B] hover:text-[#003B46] hover:scale-105 transition-all inline-block cursor-pointer border border-[#07575B]/20"
                        title="Imprimir Checklist"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(chk.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-red-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checklist generation Drawer / Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
            
            <div className="bg-[#003B46] text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Nova Vistoria de Conformidade Mecânica</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer"
                aria-label="Close checklist setup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChecklist} className="p-6 space-y-6">
              
              {/* Client & Device select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Cliente Real *</label>
                  <select
                    required
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Equipamento Ativo *</label>
                  <select
                    required
                    value={selectedEq}
                    onChange={(e) => setSelectedEq(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                  >
                    {equipments.filter(eq => eq.clientId === selectedClient).map(e => (
                      <option key={e.id} value={e.id}>{e.type}</option>
                    ))}
                    {equipments.filter(eq => eq.clientId === selectedClient).length === 0 && (
                      <option value="">Sem ativos cadastrados para este cliente</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Checklist regulatory selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono">Categoria de Regulamentação *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(['nr12', 'pmoc', 'munck', 'guindaste', 'maquinas_pesadas', 'playground'] as ChecklistType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setChecklistType(type);
                        setAnswers({});
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        checklistType === type 
                          ? 'bg-[#07575B] text-white border-[#07575B] shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{type.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspection Matrix Answers */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">Itens de Inspeção Regulamentar</h4>
                
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {QUESTIONS_BY_TYPE[checklistType].map((q) => (
                    <div key={q.id} className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1 pr-4">
                        <span className="text-[10px] font-mono tracking-wider font-bold text-[#07575B] dark:text-[#41B3A3] uppercase">{q.category}</span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-normal">{q.text}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {['C', 'NC', 'NA'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, option)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                              answers[q.id] === option
                                ? option === 'C' ? 'bg-emerald-500 text-white border-emerald-500' : option === 'NC' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-500 text-white border-slate-500'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Digital Signature Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono block">Assinatura Digital do Engenheiro Inspetor *</label>
                <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="aspect-video max-h-32 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={128}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-full cursor-crosshair block"
                    />
                    <div className="absolute right-3 bottom-2 flex gap-2">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[9px] font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 px-2 py-1 rounded cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                    {!signatureSaved && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-350 pointer-events-none text-xs font-mono font-light select-none">
                        Assine eletronicamente com o Mouse ou Toque para validar
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Nome do Inspetor Responsável</label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!signatureSaved || Object.keys(answers).length < QUESTIONS_BY_TYPE[checklistType].length}
                  className="px-5 py-2 rounded-lg bg-[#07575B] hover:bg-[#003B46] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Registrar Vistoria</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Embedded hidden print display specifically styled for A4 formatting prints! */}
      {printingChecklist && (
        <div 
          id="print-container-checklist" 
          className="fixed inset-0 z-[99999] bg-white text-slate-950 p-12 overflow-y-auto hidden print:block space-y-8"
        >
          {/* Header */}
          <div className="border-b-4 border-slate-900 pb-6 flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-3xl font-black uppercase tracking-tight font-sans">Vitor Leonardo – Engenharia Mecânica</h1>
              <p className="text-xs font-mono font-medium tracking-wide">Laudos Técnicos, Inspeções, Adequação à NR-12 e PMOC</p>
              <p className="text-sm font-semibold">CREA-PE: 1822299490 • Recife, Pernambuco</p>
            </div>
            <div className="text-right space-y-1 text-xs font-mono">
              <div className="font-bold">DOCUMENTO: CHECKLIST TÉCNICO</div>
              <div>ID: {printingChecklist.id}</div>
              <div>EMITIDO EM: {new Date(printingChecklist.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Core Info table details */}
          <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-lg border border-slate-300">
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold font-mono uppercase text-slate-400">Cliente / Organização</h3>
              <p className="text-base font-bold text-slate-900">{printingChecklist.clientName}</p>
            </div>
            <div className="space-y-1 border-l border-slate-200 pl-6">
              <h3 className="text-[10px] font-bold font-mono uppercase text-slate-400">Ativo / Equipamento</h3>
              <p className="text-base font-bold text-slate-900">{printingChecklist.equipmentModel}</p>
            </div>
          </div>

          {/* Form items results */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b-2 border-slate-850 pb-2">Diagnóstico de Itens Regulamentares ({printingChecklist.type.toUpperCase()})</h2>
            
            <table className="w-full text-left font-sans text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-300 font-bold bg-slate-100 text-xs font-mono">
                  <th className="p-3">Categoria / Item Conforme Regulamento</th>
                  <th className="p-3 text-center w-32">Status Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {QUESTIONS_BY_TYPE[printingChecklist.type].map((q) => (
                  <tr key={q.id}>
                    <td className="p-3 font-medium">
                      <div className="text-xs font-mono text-slate-400">{q.category}</div>
                      <div>{q.text}</div>
                    </td>
                    <td className="p-3 text-center">
                      {printingChecklist.questions[q.id] === true ? (
                        <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded">CONFORME</span>
                      ) : (
                        <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded">NÃO CONFORME</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature and Digital footprint footer */}
          <div className="pt-20 grid grid-cols-2 gap-16 items-start">
            <div className="space-y-2 border-t border-slate-400 pt-3 text-center">
              {printingChecklist.signatureUrl && (
                <img 
                  src={printingChecklist.signatureUrl} 
                  alt="Assinatura técnica" 
                  className="mx-auto max-h-16 border border-slate-200 bg-white rounded"
                  referrerPolicy="no-referrer"
                />
              )}
              <h4 className="font-bold text-md text-slate-900">{printingChecklist.inspectorName}</h4>
              <p className="text-xs text-slate-500 font-mono">Engenheiro Mecânico • CREA-PE 1822299490</p>
            </div>

            <div className="space-y-2 pt-12">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 text-[10px] font-mono space-y-1.5 leading-normal">
                <div className="font-bold text-slate-700">INTEGRIDADE DE CERTIFICADO ELETRÔNICO:</div>
                <div className="break-all">Assinado com certificado redundante sob hash único: <strong className="text-slate-900">{printingChecklist.digitalSignature}</strong></div>
                <div>Os pareceres técnicos expressos neste documento cumprem com os regulamentos vigentes do CREA-PE.</div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 text-[10px] font-mono text-slate-400 print:block hidden">
            Parâmetros impressos via Plataforma Integrada de Laudos Eng. Vitor Leonardo
          </div>
          
          <button 
            type="button" 
            onClick={() => setPrintingChecklist(null)}
            className="fixed bottom-6 left-6 px-4 py-2 bg-slate-900 text-white rounded font-bold text-xs font-mono uppercase tracking-wider print:hidden cursor-pointer"
          >
            Voltar ao painel
          </button>
        </div>
      )}

    </div>
  );
}
