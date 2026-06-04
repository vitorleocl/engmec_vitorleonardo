/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChecklistData, ClientData, EquipmentData, ChecklistType, ChecklistQuestion, QuestionResponseType } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2, Clipboard, Save, HelpCircle, Printer, Check, X, Shield, Lock, Edit2, RotateCcw, AlertTriangle } from 'lucide-react';

const QUESTIONS_BY_TYPE: Record<ChecklistType, ChecklistQuestion[]> = {
  nr12: [
    { id: 'm1_partes_moveis_expostas', category: 'Riscos da parte mecânica', text: 'Possui alguma parte móvel que está exposta (correntes, correia, engrenagem, polias, etc.)?' },
    { id: 'm2_quinas_afiadas', category: 'Riscos da parte mecânica', text: 'Possui alguma parte mecânica exposta que tenha alguma quina afiada, ponta cortante ou que de alguma forma constituam algum risco para o trabalhador?' },
    { id: 'm3_fixacao_piso', category: 'Riscos da parte mecânica', text: 'A máquina ou equipamento foi devidamente fixada ao piso ou algum tipo de estrutura?' },
    { id: 'm4_protecao_operacao', category: 'Riscos da parte mecânica', text: 'Possui proteções na área de operação?' },
    { id: 'm5_limitador_operacao', category: 'Riscos da parte mecânica', text: 'A máquina ou equipamento possui algum limitador para interromper a operação caso algum limite seja ultrapassado?' },
    { id: 'm6_controle_velocidade', category: 'Riscos da parte mecânica', text: 'Possui algum controle de velocidade (aceleração, desaceleração)?' },
    { id: 'm7_atividade_inadequada', category: 'Riscos da parte mecânica', text: 'O operador precisa realizar alguma atividade inadequada (forçar a fazer algo no qual está além do permitido ou alcance)?' },
    { id: 'm8_manutencao_periodica', category: 'Riscos da parte mecânica', text: 'A máquina possui manutenção periódica?' },

    { id: 'e1_aterramento', category: 'Riscos da parte elétrica', text: 'A máquina ou equipamento possui aterramento?' },
    { id: 'e2_fio_exposto', category: 'Riscos da parte elétrica', text: 'Possui algum fio exposto que possa trazer risco ao trabalhado?' },
    { id: 'e3_eletrica_proxima_agua', category: 'Riscos da parte elétrica', text: 'A parte elétrica/eletrônica está próxima a partes molhadas ou úmidas?' },
    { id: 'e4_fonte_protegida', category: 'Riscos da parte elétrica', text: 'La fonte de energia está totalmente protegida?' },
    { id: 'e5_conexoes_boas', category: 'Riscos da parte elétrica', text: 'As conexões elétricas estão bem-feitas?' },
    { id: 'e6_risco_choque', category: 'Riscos da parte elétrica', text: 'Há risco de choque elétrico devido a conexões ou fio exposto?' },
    { id: 'e7_fio_linha_passagem', category: 'Riscos da parte elétrica', text: 'Possui fio ou alguma parte elétrica no caminho de passagem do operador?' },
    { id: 'e8_protecao_circuitos', category: 'Riscos da parte elétrica', text: 'Possui proteção e identificação dos circuitos?' },
    { id: 'e9_grau_protecao_ambiente', category: 'Riscos da parte elétrica', text: 'A instalação atende ao grau de proteção adequado em função do ambiente de trabalho/uso?' },
    { id: 'e10_sinalizacao_perigo', category: 'Riscos da parte elétrica', text: 'Possui sinalização quanto ao perigo de choque elétrico ou restrição de acesso?' },

    { id: 'p1_uso_epis', category: 'Equipamento de Proteção', text: 'O trabalhador está usando EPI\'s (Equipamento de proteção individual)?' },
    { id: 'p2_conformidade_nr6', category: 'Equipamento de Proteção', text: 'O uso do EPI\'s está em conformidade com a NR 6?' },
    { id: 'p3_treinamento_epi', category: 'Equipamento de Proteção', text: 'Os trabalhadores receberam treinamentos para o uso de determinado EPI?' },
    { id: 'p4_vestimentas_proprias', category: 'Equipamento de Proteção', text: 'Os trabalhadores usam uniformes e roupas apropriadas para operar as máquinas e equipamentos (sem ter roupas muito largas, calçados não apropriados, cabelo solto etc)?' },
    { id: 'p5_estado_epis', category: 'Equipamento de Proteção', text: 'Os EPI\'S se encontram em estado ótimo de utilização?' }
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
    { id: 'p1_empresa_manutencao', category: 'COLETA DE DADOS', text: 'Existe empresa para realizar manutenção?', responseType: 'default' },
    { id: 'p2_projeto_tecnico', category: 'COLETA DE DADOS', text: 'Existe projeto técnico do sistema de climatização?', responseType: 'default' },
    { id: 'p3_quantidade_aparelhos', category: 'COLETA DE DADOS', text: 'Quantos aparelhos no empreendimento?', responseType: 'text' },
    { id: 'p4_mesmo_modelo', category: 'COLETA DE DADOS', text: 'Os aparelhos são de mesmo modelo?', responseType: 'default' },
    { id: 'p5_estado_geral', category: 'COLETA DE DADOS', text: 'As condições dos aparelhos estão em ótimo estado?', responseType: 'default' },
    { id: 'p6_sintomas_funcionarios', category: 'COLETA DE DADOS', text: 'Os funcionários apresentam sintomas do estado de saúde? (Dor de cabeça, irritação nos olhos, rinite, alergia respiratória etc.)', responseType: 'default' }
  ]
};

export default function ChecklistManager() {
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printingChecklist, setPrintingChecklist] = useState<ChecklistData | null>(null);

  // Custom questions map state
  const [questionsMap, setQuestionsMap] = useState<Record<ChecklistType, ChecklistQuestion[]>>(QUESTIONS_BY_TYPE);
  const [activeTab, setActiveTab] = useState<'history' | 'setup'>('history');

  // Editor states
  const [selectedSetupType, setSelectedSetupType] = useState<ChecklistType>('nr12');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState('');
  const [editingText, setEditingText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionResponseType, setNewQuestionResponseType] = useState<QuestionResponseType>('default');
  const [editingResponseType, setEditingResponseType] = useState<QuestionResponseType>('default');

  // New Checklist Form fields
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEq, setSelectedEq] = useState('');
  const [checklistType, setChecklistType] = useState<ChecklistType>('nr12');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inspectorName, setInspectorName] = useState('Eng. Vitor Leonardo C. Linhares');

  // NR-12 metadata fields
  const [nr12Empresa, setNr12Empresa] = useState('');
  const [nr12Maquina, setNr12Maquina] = useState('');
  const [nr12Fabricante, setNr12Fabricante] = useState('');
  const [nr12Tag, setNr12Tag] = useState('');
  const [nr12Qtd, setNr12Qtd] = useState('');
  const [nr12QtdOperador, setNr12QtdOperador] = useState('');
  const [nr12Setor, setNr12Setor] = useState('');
  const [nr12ResponsavelServico, setNr12ResponsavelServico] = useState('');
  const [nr12Contato, setNr12Contato] = useState('');
  const [nr12DataChecklist, setNr12DataChecklist] = useState('');

  // PMOC metadata fields
  const [pmocObs01, setPmocObs01] = useState('Existe apenas o projeto arquitetonico do salão de festas');
  const [pmocObs02, setPmocObs02] = useState('');
  const [pmocObs03, setPmocObs03] = useState('');
  const [pmocObs04, setPmocObs04] = useState('');
  const [pmocAnotacoes, setPmocAnotacoes] = useState('');

  // Per-item photos and notes
  const [questionPhotos, setQuestionPhotos] = useState<Record<string, string[]>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  const loadCustomQuestions = async () => {
    try {
      if (isRealFirebase) {
        const querySnapshot = await getDocs(collection(db, 'checklist_questions'));
        const dbQuestions: any[] = [];
        querySnapshot.forEach(docSnap => dbQuestions.push(docSnap.data()));
        
        if (dbQuestions.length > 0) {
          const newMap: Record<ChecklistType, ChecklistQuestion[]> = {
            nr12: [],
            pmoc: [],
            munck: [],
            guindaste: [],
            maquinas_pesadas: [],
            playground: []
          };
          
          dbQuestions.forEach(q => {
            const type = q.type as ChecklistType;
            if (newMap[type]) {
              newMap[type].push({
                id: q.id,
                category: q.category || 'Geral',
                text: q.text || '',
                responseType: (q.responseType as QuestionResponseType) || 'default'
              });
            }
          });
          
          const mergedMap = { ...QUESTIONS_BY_TYPE };
          (Object.keys(newMap) as ChecklistType[]).forEach(type => {
            if (newMap[type].length > 0) {
              mergedMap[type] = newMap[type];
            }
          });
          setQuestionsMap(mergedMap);
        } else {
          setQuestionsMap(QUESTIONS_BY_TYPE);
        }
      } else {
        const saved = localStorage.getItem('vitor_engmec_custom_questions');
        if (saved) {
          setQuestionsMap(JSON.parse(saved));
        } else {
          setQuestionsMap(QUESTIONS_BY_TYPE);
        }
      }
    } catch (e) {
      console.warn("Could not load custom questions, using defaults:", e);
      setQuestionsMap(QUESTIONS_BY_TYPE);
    }
  };

  useEffect(() => {
    loadData();
    loadCustomQuestions();
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
      const matchedClient = clients.find(c => c.id === selectedClient);
      if (matchedClient) {
        setNr12Empresa(matchedClient.company);
      }
      if (activeEqs.length > 0) {
        const firstEq = activeEqs[0];
        setSelectedEq(firstEq.id);
        setNr12Maquina(`${firstEq.type} (${firstEq.model})`);
        setNr12Fabricante(firstEq.brand);
      } else {
        setSelectedEq('');
        setNr12Maquina('');
        setNr12Fabricante('');
      }
      setNr12DataChecklist(new Date().toISOString().split('T')[0]);
      setNr12ResponsavelServico(inspectorName);
    }
  }, [selectedClient, equipments, clients, inspectorName]);

  useEffect(() => {
    if (selectedEq) {
      const matchedEq = equipments.find(e => e.id === selectedEq);
      if (matchedEq) {
        setNr12Maquina(`${matchedEq.type} (${matchedEq.model})`);
        setNr12Fabricante(matchedEq.brand);
      }
    }
  }, [selectedEq, equipments]);

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
    ctx.strokeStyle = '#134074';
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
    questionsMap[checklistType].forEach(q => {
      compiledAnswers[q.id] = answers[q.id] || 'NA'; // Stores 'C', 'NC', or 'NA'
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
      updatedAt: new Date().toISOString(),
      nr12Metadata: checklistType === 'nr12' ? {
        empresa: nr12Empresa,
        maquina: nr12Maquina,
        fabricante: nr12Fabricante,
        tag: nr12Tag,
        qtd: nr12Qtd,
        qtdOperador: nr12QtdOperador,
        setor: nr12Setor,
        responsavelServico: nr12ResponsavelServico,
        contato: nr12Contato,
        dataChecklist: nr12DataChecklist || new Date().toISOString().split('T')[0]
      } : undefined,
      pmocMetadata: checklistType === 'pmoc' ? {
        obs01: pmocObs01,
        obs02: pmocObs02,
        obs03: pmocObs03,
        obs04: pmocObs04,
        anotacoes: pmocAnotacoes
      } : undefined,
      questionPhotos: questionPhotos,
      questionNotes: questionNotes
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

  const handlePhotoUpload = (questionId: string, files: FileList | null) => {
    if (!files) return;
    const currentPhotos = questionPhotos[questionId] || [];
    if (currentPhotos.length >= 3) {
      alert("Você pode adicionar no máximo 3 fotos por item de inspeção.");
      return;
    }

    const loaders = Array.from(files).slice(0, 3 - currentPhotos.length).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then(base64s => {
      setQuestionPhotos(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), ...base64s]
      }));
    });
  };

  const handleRemovePhoto = (questionId: string, index: number) => {
    setQuestionPhotos(prev => {
      const updated = [...(prev[questionId] || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        [questionId]: updated
      };
    });
  };

  const handleNoteChange = (questionId: string, val: string) => {
    setQuestionNotes(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  const clearForm = () => {
    setAnswers({});
    setSignatureSaved(false);
    setChecklistType('nr12');
    setPmocObs01('Existe apenas o projeto arquitetonico do salão de festas');
    setPmocObs02('');
    setPmocObs03('');
    setPmocObs04('');
    setPmocAnotacoes('');
    setQuestionPhotos({});
    setQuestionNotes({});
  };

  const handleSaveQuestion = async (type: ChecklistType, questionId: string, updatedCategory: string, updatedText: string, responseType: QuestionResponseType = 'default') => {
    if (!updatedCategory.trim() || !updatedText.trim()) return;
    
    const updatedList = questionsMap[type].map(q => {
      if (q.id === questionId) {
        return { ...q, category: updatedCategory, text: updatedText, responseType };
      }
      return q;
    });
    
    const newQuestionsMap = {
      ...questionsMap,
      [type]: updatedList
    };
    
    setQuestionsMap(newQuestionsMap);
    setEditingQuestionId(null);
    
    try {
      if (isRealFirebase) {
        const qDocId = `${type}_${questionId}`;
        await setDoc(doc(db, 'checklist_questions', qDocId), {
          id: questionId,
          type,
          category: updatedCategory,
          text: updatedText,
          responseType,
          createdAt: new Date().toISOString()
        });
      } else {
        localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
      }
    } catch (err) {
      if (isRealFirebase) {
        handleFirestoreError(err, OperationType.WRITE, `checklist_questions/${type}_${questionId}`);
      }
    }
  };

  const handleAddQuestion = async (type: ChecklistType, category: string, text: string, responseType: QuestionResponseType = 'default') => {
    if (!category.trim() || !text.trim()) return;
    const newId = 'q_' + Math.random().toString(36).substr(2, 9);
    const newQuestion: ChecklistQuestion = {
      id: newId,
      category,
      text,
      responseType
    };
    
    const updatedList = [...questionsMap[type], newQuestion];
    const newQuestionsMap = {
      ...questionsMap,
      [type]: updatedList
    };
    
    setQuestionsMap(newQuestionsMap);
    setNewQuestionCategory('');
    setNewQuestionText('');
    setNewQuestionResponseType('default');
    
    try {
      if (isRealFirebase) {
        const qDocId = `${type}_${newId}`;
        await setDoc(doc(db, 'checklist_questions', qDocId), {
          id: newId,
          type,
          category,
          text,
          responseType,
          createdAt: new Date().toISOString()
        });
      } else {
        localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
      }
    } catch (err) {
      if (isRealFirebase) {
        handleFirestoreError(err, OperationType.WRITE, `checklist_questions/${type}_${newId}`);
      }
    }
  };

  const handleDeleteQuestion = async (type: ChecklistType, questionId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este item de inspeção deste checklist?')) return;
    
    const updatedList = questionsMap[type].filter(q => q.id !== questionId);
    const newQuestionsMap = {
      ...questionsMap,
      [type]: updatedList
    };
    
    setQuestionsMap(newQuestionsMap);
    
    try {
      if (isRealFirebase) {
        const qDocId = `${type}_${questionId}`;
        await deleteDoc(doc(db, 'checklist_questions', qDocId));
      } else {
        localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
      }
    } catch (err) {
      if (isRealFirebase) {
        handleFirestoreError(err, OperationType.DELETE, `checklist_questions/${type}_${questionId}`);
      }
    }
  };

  const handleResetToDefault = async (type: ChecklistType) => {
    if (!window.confirm(`Tem certeza que deseja restaurar as questões padrão para ${type.toUpperCase()}? Isso apagará todas as suas edições e acréscimos nesta categoria.`)) return;
    
    const newQuestionsMap = {
      ...questionsMap,
      [type]: QUESTIONS_BY_TYPE[type]
    };
    setQuestionsMap(newQuestionsMap);
    
    try {
      if (isRealFirebase) {
        const querySnapshot = await getDocs(collection(db, 'checklist_questions'));
        querySnapshot.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (data.type === type) {
            await deleteDoc(doc(db, 'checklist_questions', docSnap.id));
          }
        });
      } else {
        localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
      }
    } catch (err) {
      console.error("Erro ao resetar padrão:", err);
    }
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
          className="flex items-center gap-2 bg-[#134074] hover:bg-[#0B2545] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors cursor-pointer self-start disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Realizar Vistoria</span>
        </button>
      </div>

      {/* Tabs Switcher for History & Checklists Setup Editor */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 pb-px gap-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'history'
              ? 'border-[#134074] text-[#134074] dark:text-[#4895EF]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          Histórico de Vistorias
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-[#4895EF]" />}
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`py-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'setup'
              ? 'border-[#134074] text-[#134074] dark:text-[#4895EF]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span>Configuração dos Itens dos Checklists</span>
          {activeTab === 'setup' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-[#4895EF]" />}
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
              <span className="w-5 h-5 border-2 border-[#134074] border-t-transparent rounded-full animate-spin" />
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
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-[#134074] hover:text-[#0B2545] hover:scale-105 transition-all inline-block cursor-pointer border border-[#134074]/20"
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
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciador de Itens de Inspeção</h3>
              <p className="text-xs text-slate-400">Adicione, edite ou exclua itens das planilhas de vistoria por tipo de laudo.</p>
            </div>
            <button
              type="button"
              onClick={() => handleResetToDefault(selectedSetupType)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-rose-500 border border-slate-200 dark:border-slate-700 hover:border-rose-200 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Perguntas Padrão</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['nr12', 'pmoc', 'munck', 'guindaste', 'maquinas_pesadas', 'playground'] as ChecklistType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedSetupType(type);
                  setEditingQuestionId(null);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                  selectedSetupType === type
                    ? 'bg-[#134074] text-white border-[#134074] shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* New Item addition helper card */}
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase font-mono flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Adicionar Novo Item para Checklist {selectedSetupType.toUpperCase()}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Categoria</label>
                <input
                  type="text"
                  placeholder="EX: Riscos Mecânicos"
                  value={newQuestionCategory}
                  onChange={(e) => setNewQuestionCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-[#334255] rounded-lg px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Tipo de Resposta</label>
                <select
                  value={newQuestionResponseType}
                  onChange={(e) => setNewQuestionResponseType(e.target.value as QuestionResponseType)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-[#334255] rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="default">C / NC / NA (Padrão)</option>
                  <option value="ok_nok_na">OK / NOK / N/A</option>
                  <option value="bom_reg_ruim">Bom / Regular / Ruim</option>
                  <option value="text">Campo de Texto</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Texto do Item da Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="EX: Existem proteções físicas fixas nas áreas de esmagamento?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-[#334255] rounded-lg px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(selectedSetupType, newQuestionCategory || 'Geral', newQuestionText, newQuestionResponseType)}
                    className="shrink-0 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List items block */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Lista de Itens Atuais</h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {questionsMap[selectedSetupType].length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum item cadastrado nesta categoria. Adicione no formulário acima.
                </div>
              ) : (
                questionsMap[selectedSetupType].map((q) => (
                  <div key={q.id} className="pt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {editingQuestionId === q.id ? (
                      <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-350 font-mono uppercase">Categoria</label>
                          <input
                            type="text"
                            value={editingCategory}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-705 rounded p-1.5 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-455 dark:text-slate-345 font-mono uppercase">Resposta</label>
                          <select
                            value={editingResponseType}
                            onChange={(e) => setEditingResponseType(e.target.value as QuestionResponseType)}
                            className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-[#334255] rounded p-1.5 text-xs text-slate-900 dark:text-white h-[32px] cursor-pointer outline-none"
                          >
                            <option value="default">C / NC / NA</option>
                            <option value="ok_nok_na">OK / NOK / N/A</option>
                            <option value="bom_reg_ruim">Bom / Regular / Ruim</option>
                            <option value="text">Campo de Texto</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-455 dark:text-slate-345 font-mono uppercase">Texto do Item</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-705 rounded p-1.5 text-xs text-slate-900 dark:text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuestion(selectedSetupType, q.id, editingCategory, editingText, editingResponseType)}
                              className="bg-[#134074] hover:bg-[#0B2545] text-white px-3 py-1.5 rounded font-bold text-xs cursor-pointer"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              className="bg-slate-200 dark:bg-slate-705 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-semibold text-xs cursor-pointer hover:bg-slate-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="inline-block text-[9px] font-mono font-bold text-[#134074] dark:text-[#4895EF] uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200/40">
                              {q.category}
                            </span>
                            <span className="inline-block text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-805 px-2 py-0.5 rounded border border-slate-250/50">
                              Tipo: {
                                q.responseType === 'text' ? 'Campo de Texto' :
                                q.responseType === 'ok_nok_na' ? 'OK / NOK / N/A' :
                                q.responseType === 'bom_reg_ruim' ? 'Bom / Regular / Ruim' :
                                'C / NC / NA (Padrão)'
                              }
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 leading-normal">{q.text}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setEditingCategory(q.category);
                              setEditingText(q.text);
                              setEditingResponseType(q.responseType || 'default');
                            }}
                            className="p-1.5 text-slate-450 hover:text-sky-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(selectedSetupType, q.id)}
                            className="p-1.5 text-slate-455 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checklist generation Drawer / Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
            
            <div className="bg-[#0B2545] text-white p-6 flex justify-between items-center">
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

              {/* NR-12 Specific Metadata fields */}
              {checklistType === 'nr12' && (
                <div className="bg-[#134074]/5 border border-[#134074]/15 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#134074]/10 pb-2 mb-2">
                    <Clipboard className="w-4 h-4 text-[#134074]" />
                    <span className="text-xs font-bold uppercase font-mono text-[#134074] tracking-wider">Identificação dos Dados do Equipamento (NR-12)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="font-bold text-slate-500 font-mono">EMPRESA *</label>
                      <input type="text" required value={nr12Empresa} onChange={e => setNr12Empresa(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="font-bold text-slate-500 font-mono">MÁQUINA *</label>
                      <input type="text" required value={nr12Maquina} onChange={e => setNr12Maquina(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">FABRICANTE *</label>
                      <input type="text" required value={nr12Fabricante} onChange={e => setNr12Fabricante(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">TAG / ID</label>
                      <input type="text" value={nr12Tag} onChange={e => setNr12Tag(e.target.value)} placeholder="Ex: TAG-102" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">QUANTIDADE</label>
                      <input type="text" value={nr12Qtd} onChange={e => setNr12Qtd(e.target.value)} placeholder="Ex: 1" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">QTD OPERADORES</label>
                      <input type="text" value={nr12QtdOperador} onChange={e => setNr12QtdOperador(e.target.value)} placeholder="Ex: 1 por turno" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">DATA INSPEÇÃO *</label>
                      <input type="date" required value={nr12DataChecklist} onChange={e => setNr12DataChecklist(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">SETOR / ÁREA</label>
                      <input type="text" value={nr12Setor} onChange={e => setNr12Setor(e.target.value)} placeholder="Ex: Galpão A" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">CONTATO RESPONSÁVEL</label>
                      <input type="text" value={nr12Contato} onChange={e => setNr12Contato(e.target.value)} placeholder="Ex: (81) 99999-9999" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">RESPONSÁVEL PELO SERVIÇO *</label>
                      <input type="text" required value={nr12ResponsavelServico} onChange={e => setNr12ResponsavelServico(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* PMOC Specific Metadata fields */}
              {checklistType === 'pmoc' && (
                <div className="bg-[#134074]/5 border border-[#134074]/15 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex items-center gap-2 border-b border-[#134074]/10 pb-2 mb-2">
                    <Clipboard className="w-4 h-4 text-[#134074]" />
                    <span className="text-xs font-bold uppercase font-mono text-[#134074] tracking-wider">Observações do Checklist Preliminar (PMOC)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 01</label>
                      <textarea
                        rows={2}
                        value={pmocObs01}
                        onChange={e => setPmocObs01(e.target.value)}
                        placeholder="Ex: Existe apenas o projeto arquitetonico do salão de festas"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 02</label>
                      <textarea
                        rows={2}
                        value={pmocObs02}
                        onChange={e => setPmocObs02(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 03</label>
                      <textarea
                        rows={2}
                        value={pmocObs03}
                        onChange={e => setPmocObs03(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 04</label>
                      <textarea
                        rows={2}
                        value={pmocObs04}
                        onChange={e => setPmocObs04(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 font-mono uppercase">Anotações</label>
                    <textarea
                      rows={3}
                      value={pmocAnotacoes}
                      onChange={e => setPmocAnotacoes(e.target.value)}
                      placeholder="Descreva quaisquer outras observações..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

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
                          ? 'bg-[#134074] text-white border-[#134074] shadow-md' 
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
                  {questionsMap[checklistType].map((q) => {
                    const photos = questionPhotos[q.id] || [];
                    return (
                      <div key={q.id} className="pt-4 pb-2 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1 pr-4">
                            <span className="text-[10px] font-mono tracking-wider font-bold text-[#134074] dark:text-[#4895EF] uppercase">{q.category}</span>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-normal">{q.text}</p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {(!q.responseType || q.responseType === 'default') && (
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
                                    {option === 'C' ? 'C / SIM' : option === 'NC' ? 'N.C / NÃO' : 'N.A.'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'ok_nok_na' && (
                              <div className="flex gap-2 shrink-0">
                                {['OK', 'NOK', 'NA'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                                      answers[q.id] === option
                                        ? option === 'OK' ? 'bg-emerald-500 text-white border-emerald-500' : option === 'NOK' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-500 text-white border-slate-500'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'bom_reg_ruim' && (
                              <div className="flex gap-2 shrink-0">
                                {['BOM', 'REGULAR', 'RUIM'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                                      answers[q.id] === option
                                        ? option === 'BOM' ? 'bg-emerald-500 text-white border-emerald-500' : option === 'REGULAR' ? 'bg-amber-500 text-white border-amber-500' : 'bg-rose-500 text-white border-rose-500'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    {option === 'BOM' ? 'BOM' : option === 'REGULAR' ? 'REGULAR' : 'RUIM'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'text' && (
                              <div className="flex gap-2 shrink-0 w-full md:w-64">
                                <input
                                  type="text"
                                  placeholder="Digite a resposta principal..."
                                  value={answers[q.id] === undefined ? '' : String(answers[q.id])}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Note & Photos Block */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                          {/* Note text field */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Anotação / Valor (Ex: QTD: 5)</label>
                            <input
                              type="text"
                              value={questionNotes[q.id] || ''}
                              onChange={(e) => handleNoteChange(q.id, e.target.value)}
                              placeholder="Adicione observações ou valores adicionais..."
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Photos container */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 flex justify-between items-center">
                              <span>Fotos de Evidência ({photos.length}/3)</span>
                            </label>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {photos.map((ph, idx) => (
                                <div key={idx} className="relative w-12 h-12 rounded border border-slate-250 dark:border-slate-700 overflow-hidden group">
                                  <img src={ph} alt="Evidência" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(q.id, idx)}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-[10px]"
                                    aria-label="Remover foto"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              ))}

                              {photos.length < 3 && (
                                <label className="w-12 h-12 flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-sky-500 rounded cursor-pointer bg-white dark:bg-slate-900 text-slate-450 hover:text-sky-500 transition-all">
                                  <span className="text-xl font-bold font-mono">+</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(q.id, e.target.files)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  disabled={!signatureSaved || Object.keys(answers).length < questionsMap[checklistType].length}
                  className="px-5 py-2 rounded-lg bg-[#134074] hover:bg-[#0B2545] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
              <h1 className="text-3xl font-black uppercase tracking-tight font-sans">VL Engenharia</h1>
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
          {printingChecklist.type === 'nr12' && printingChecklist.nr12Metadata ? (
            <div className="border border-slate-400 text-xs font-sans rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 font-bold uppercase tracking-wider text-center p-2.5 border-b border-slate-400 text-xs">
                Dados do Equipamento (NR-12)
              </div>
              <div className="grid grid-cols-4 border-b border-slate-350">
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">EMPRESA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.empresa || printingChecklist.clientName}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">MÁQUINA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.maquina || printingChecklist.equipmentModel}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">FABRICANTE:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.fabricante || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">TAG:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.tag || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-slate-350">
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">QTD:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.qtd || '1'}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">QTD OPERADOR:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.qtdOperador || '1'}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">DATA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.dataChecklist || new Date(printingChecklist.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="p-2.5">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">SETOR/ÁREA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.setor || 'Geral'}</span>
                </div>
              </div>
              <div className="grid grid-cols-4">
                <div className="p-2.5 border-r border-slate-300 col-span-3">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">RESPONSÁVEL PELO SERVIÇO:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.responsavelServico || printingChecklist.inspectorName}</span>
                  {printingChecklist.nr12Metadata.contato && (
                    <span className="text-[10px] text-slate-500 block font-mono">Contato: {printingChecklist.nr12Metadata.contato}</span>
                  )}
                </div>
                <div className="p-2.5 bg-slate-50 flex flex-col justify-center items-center text-center">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">LEGENDA</span>
                  <span className="font-bold text-[10px] text-slate-800">N.A - Não se aplica</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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

              {/* PMOC Specific Metadata fields on print */}
              {printingChecklist.type === 'pmoc' && printingChecklist.pmocMetadata && (
                <div className="border border-slate-400 text-xs font-sans rounded-xl overflow-hidden shadow-sm p-4 bg-slate-50 space-y-3">
                  <div className="font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 text-xs">
                    Observações do Checklist Preliminar (PMOC)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-white/70 p-2.5 rounded border border-slate-250">
                      <p className="mb-1"><strong>OBS 01:</strong> {printingChecklist.pmocMetadata.obs01 || 'N/A'}</p>
                      <p><strong>OBS 02:</strong> {printingChecklist.pmocMetadata.obs02 || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 bg-white/70 p-2.5 rounded border border-slate-250">
                      <p className="mb-1"><strong>OBS 03:</strong> {printingChecklist.pmocMetadata.obs03 || 'N/A'}</p>
                      <p><strong>OBS 04:</strong> {printingChecklist.pmocMetadata.obs04 || 'N/A'}</p>
                    </div>
                  </div>
                  {printingChecklist.pmocMetadata.anotacoes && (
                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                      <strong>Anotações Adicionais:</strong><br />
                      {printingChecklist.pmocMetadata.anotacoes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                {questionsMap[printingChecklist.type].map((q) => (
                  <tr key={q.id}>
                    <td className="p-3 font-medium">
                      <div className="text-xs font-mono text-slate-400">{q.category}</div>
                      <div>{q.text}</div>
                      
                      {/* Show per-item notes in print */}
                      {printingChecklist.questionNotes?.[q.id] && (
                        <div className="text-xs mt-1.5 font-sans text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                          <strong>Anotação/Observações:</strong> {printingChecklist.questionNotes[q.id]}
                        </div>
                      )}

                      {/* Show per-item photos in print */}
                      {printingChecklist.questionPhotos?.[q.id] && printingChecklist.questionPhotos[q.id].length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {printingChecklist.questionPhotos[q.id].map((photo, pIdx) => (
                            <img
                              key={pIdx}
                              src={photo}
                              alt={`Item ${q.id} foto ${pIdx + 1}`}
                              className="w-24 h-24 object-cover rounded-md border border-slate-300 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {(() => {
                        const ans = printingChecklist.questions[q.id];
                        if (ans === undefined || ans === null || ans === '') {
                          return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-400 text-xs border border-dashed border-slate-200 rounded">NÃO RESPONDIDO</span>;
                        }

                        if (q.responseType === 'text') {
                          return <span className="inline-block px-3 py-1 font-bold text-slate-800 text-xs bg-slate-100 rounded max-w-full break-words">{String(ans)}</span>;
                        }

                        if (q.responseType === 'ok_nok_na') {
                          if (ans === 'OK') {
                            return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded">OK</span>;
                          } else if (ans === 'NOK') {
                            return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded">NÃO OK</span>;
                          } else {
                            return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded">N.A</span>;
                          }
                        }

                        if (q.responseType === 'bom_reg_ruim') {
                          if (ans === 'BOM') {
                            return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded">BOM</span>;
                          } else if (ans === 'REGULAR') {
                            return <span className="inline-block px-3 py-1 font-bold font-mono text-amber-800 text-xs bg-amber-100 rounded">REGULAR</span>;
                          } else {
                            return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded">RUIM</span>;
                          }
                        }

                        // Default C / NC / NA
                        if (ans === 'C' || ans === true) {
                          return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded">CONFORME</span>;
                        } else if (ans === 'NC' || ans === false) {
                          return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded">NÃO CONFORME</span>;
                        } else {
                          return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded">N.A (NÃO SE APLICA)</span>;
                        }
                      })()}
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
            Parâmetros impressos via Plataforma Integrada de Laudos VL Engenharia
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
