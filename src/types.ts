/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
  clientId?: string; // Links auth profile to a specific client record
  createdAt: string;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj_cpf: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentData {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  year: string;
  createdAt: string;
  updatedAt: string;
  potenciaInstalada?: string;
}

export enum LaudoStatus {
  EM_ELABORACAO = 'em_elaboracao',
  EMITIDO = 'emitido',
  VENCIDO = 'vencido',
}

export interface PMOCActivity {
  id: string;
  descricao: string;
  periodicidade: string;
  statusJan?: string;
  statusFev?: string;
  statusMar?: string;
  statusAbr?: string;
  statusMai?: string;
  statusJun?: string;
  statusJul?: string;
  statusAgo?: string;
  statusSet?: string;
  statusOut?: string;
  statusNov?: string;
  statusDez?: string;
}

export interface PMOCAppliance {
  id: string;
  tag: string;
  marca: string;
  modelo: string;
  capacidade: string;
  localizacao: string;
  tipo: string;
  atividades: PMOCActivity[];
}

export interface PMAirEnvironment {
  id: string;
  identificacao: string;
  numOcupantesFixo: string;
  numOcupantesFlutuante: string;
  areaM2: string;
  cargaTermica: string;
  tagEquipamento: string;
}

export interface PMOCData {
  empreendimento: {
    nome: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    telefone: string;
    email: string;
  };
  proprietario: {
    nomeRazao: string;
    cnpj: string;
  };
  responsavelTecnico: {
    nomeRazao: string;
    cpfCnpj: string;
    enderecoCompleto: string;
    responsavelTecnico: string;
    profissao: string;
    crea: string;
    cpf: string;
    art: string;
  };
  ambientesClimatizados: PMAirEnvironment[];
  aparelhos: PMOCAppliance[];
  finalDocumento: {
    anotacoesGerais: string;
    recomendacoesRt: string;
    respManutencaoNome: string;
    respManutencaoAssinatura: string;
    respPhNome: string;
    respPhAssinatura: string;
  };
}

export interface LaudoData {
  id: string;
  numero: string;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentModel: string;
  dateInspection: string;
  rt: string; // Responsável Técnico: Vitor Leonardo C. Linhars
  art: string; // ART vinculada
  status: LaudoStatus;
  pdfUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  categoria?: string; // Type of Report / Category (e.g., "Adequação à NR-12", "Reclassificação de Monta")
  apreciacaoRisco?: {
    hrnScore: number;
    classificacao: string;
    loValue: number;
    feValue: number;
    doValue: number;
    npValue: number;
    acoesRecomendadas?: string;
    zonaPerigo?: string;
  };
  pmocData?: PMOCData;
  linkedChecklistId?: string;
  linkedChecklistData?: ChecklistData;
}

export type ChecklistType = 'nr12' | 'munck' | 'guindaste' | 'maquinas_pesadas' | 'playground' | 'pmoc' | 'reclassificacao_monta' | 'integridade_fisica' | 'frota_escolar';

export type QuestionResponseType = 'default' | 'ok_nok' | 'ok_nok_na' | 'bom_reg_ruim' | 'bom_reg_ruim_na' | 'text' | 'number' | 'date' | 'photo' | 'sim_nao' | 'aprovado_reprovado' | 'c_nc' | 'c_nc_na' | 'tipo_ar_condicionado' | 'tipo_veiculo_reclassificacao' | 'tipo_veiculo_integridade' | 'classificacao_monta' | 'condicao_fisica_geral' | 'text_long' | 'ambiente_playground';

export interface ChecklistQuestion {
  id: string;
  type?: ChecklistType;
  category: string;
  text: string;
  responseType?: QuestionResponseType;
}

export interface ChecklistData {
  id: string;
  type: ChecklistType;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentModel: string;
  questions: Record<string, string | boolean>; // Answers to form checklists
  signatureUrl?: string; // base64 string or storage url
  digitalSignature?: string; // technical verification hash
  inspectorName: string;
  createdAt: string;
  updatedAt: string;
  nr12Metadata?: {
    empresa?: string;
    maquina?: string;
    fabricante?: string;
    tag?: string;
    qtd?: string;
    qtdOperador?: string;
    setor?: string;
    responsavelServico?: string;
    contato?: string;
    dataChecklist?: string;
  };
  pmocMetadata?: {
    obs01?: string;
    obs02?: string;
    obs03?: string;
    obs04?: string;
    anotacoes?: string;
  };
  questionPhotos?: Record<string, string[]>;
  questionNotes?: Record<string, string>;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
  category: string;
  date: string;
  imageUrl?: string;
}
