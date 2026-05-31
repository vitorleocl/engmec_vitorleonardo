/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LaudoData, ClientData, EquipmentData, LaudoStatus } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Search, X, ClipboardCopy, Send, Save, FileText, Upload, HelpCircle, Eye } from 'lucide-react';

export default function LaudoManager() {
  const [laudos, setLaudos] = useState<LaudoData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLaudo, setCurrentLaudo] = useState<Partial<LaudoData> | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // 'pdf' | 'image' | 'video' | null
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        const querySnapshot = await getDocs(collection(db, 'laudos'));
        const lArray: LaudoData[] = [];
        querySnapshot.forEach((docSnap) => lArray.push(docSnap.data() as LaudoData));
        setLaudos(lArray);

        const clientsSnap = await getDocs(collection(db, 'clients'));
        const cliArray: ClientData[] = [];
        clientsSnap.forEach((docSnap) => cliArray.push(docSnap.data() as ClientData));
        setClients(cliArray);

        const eqSnap = await getDocs(collection(db, 'equipments'));
        const eqArray: EquipmentData[] = [];
        eqSnap.forEach((docSnap) => eqArray.push(docSnap.data() as EquipmentData));
        setEquipments(eqArray);
      } else {
        setLaudos(mockDb.getLaudos());
        setClients(mockDb.getClients());
        setEquipments(mockDb.getEquipments());
      }
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'laudos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLaudo?.numero || !currentLaudo?.clientId || !currentLaudo?.equipmentId) return;

    setLoading(true);
    const laudoId = currentLaudo.id || 'laudo_' + Math.random().toString(36).substr(2, 9);
    const matchedClient = clients.find(c => c.id === currentLaudo.clientId);
    const matchedEq = equipments.find(eq => eq.id === currentLaudo.equipmentId);

    const saveObj: LaudoData = {
      id: laudoId,
      numero: currentLaudo.numero,
      clientId: currentLaudo.clientId,
      clientName: matchedClient ? matchedClient.company : 'Cliente Desconhecido',
      equipmentId: currentLaudo.equipmentId,
      equipmentModel: matchedEq ? `${matchedEq.type} (${matchedEq.model})` : 'Equipamento Desconhecido',
      dateInspection: currentLaudo.dateInspection || new Date().toISOString().split('T')[0],
      rt: 'Vitor Leonardo Cordeiro Linhares',
      art: currentLaudo.art || '',
      status: currentLaudo.status || LaudoStatus.EM_ELABORACAO,
      pdfUrl: currentLaudo.pdfUrl || '',
      imageUrl: currentLaudo.imageUrl || '',
      videoUrl: currentLaudo.videoUrl || '',
      createdAt: currentLaudo.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (isRealFirebase) {
        await setDoc(doc(db, 'laudos', laudoId), saveObj);
      } else {
        mockDb.saveLaudo(saveObj);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `laudos/${laudoId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este laudo perpétuo?')) return;
    setLoading(true);
    try {
      if (isRealFirebase) {
        await deleteDoc(doc(db, 'laudos', id));
      } else {
        mockDb.deleteLaudo(id);
      }
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `laudos/${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulate file upload with visual feedback
  const handleUploadSimulate = (type: 'pdf' | 'image' | 'video') => {
    setUploading(type);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const docName = type === 'pdf' ? `/inspecoes/laudo_${Date.now()}.pdf` : type === 'image' ? `/fotos/diag_${Date.now()}.png` : `/videos/diag_${Date.now()}.mp4`;
            setCurrentLaudo(current => ({
              ...current,
              [`${type}Url`]: docName
            }));
            setUploading(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const filtered = laudos.filter(l =>
    l.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.equipmentModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.art.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-100 md:text-slate-900 dark:text-white">Módulo de Gestão de Laudos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Emita laudos periciais de engenharia mecânica, anexe documentos e asocie as fardas ARTs</p>
        </div>

        <button
          onClick={() => {
            setCurrentLaudo({
              numero: `LT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              clientId: clients[0]?.id || '',
              equipmentId: equipments[0]?.id || '',
              status: LaudoStatus.EM_ELABORACAO,
              dateInspection: new Date().toISOString().split('T')[0],
              art: `PE-18222994-${Math.floor(10 + Math.random() * 89)}`
            });
            setModalOpen(true);
          }}
          disabled={clients.length === 0 || equipments.length === 0}
          className="flex items-center gap-2 bg-[#07575B] hover:bg-[#003B46] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors cursor-pointer self-start disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Laudo</span>
        </button>
      </div>

      {/* Constraints check and warning notices */}
      {(clients.length === 0 || equipments.length === 0) && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-xs font-mono">
          Alerta: Para emitir um laudo, você precisa possuir pelo menos um Cliente e um Equipamento associado cadastrados em seus respectivos módulos.
        </div>
      )}

      {/* Search Input bar */}
      <div className="relative max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrar por nº laudo, cliente, equipamento ou ART..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Table container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
            <span className="w-5 h-5 border-2 border-[#07575B] border-t-transparent rounded-full animate-spin" />
            <span>Processando dados...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Nenhum laudo mecânico localizado em sua base.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Nº Laudo / ART</th>
                  <th className="p-4">Cliente / Máquina</th>
                  <th className="p-4">Vistoria</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Arquivos</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {filtered.map((laudo) => (
                  <tr key={laudo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="p-4">
                      <div className="font-bold font-mono text-slate-900 dark:text-white">{laudo.numero}</div>
                      <div className="text-xs text-slate-500 font-medium">ART: {laudo.art || 'Não declarada'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{laudo.clientName}</div>
                      <div className="text-xs text-slate-500 font-sans">{laudo.equipmentModel}</div>
                    </td>
                    <td className="p-4 space-y-0.5 text-slate-600 dark:text-slate-350 text-xs">
                      <div className="font-medium font-mono">{laudo.dateInspection}</div>
                      <div className="text-[10px] text-slate-400 select-all truncate max-w-xs">{laudo.rt}</div>
                    </td>
                    <td className="p-4">
                      {laudo.status === LaudoStatus.EMITIDO ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black font-mono uppercase">
                          EMITIDO / ATIVO
                        </span>
                      ) : laudo.status === LaudoStatus.VENCIDO ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black font-mono uppercase animate-pulse">
                          VENCIDO
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black font-mono uppercase">
                          EM ELABORAÇÃO
                        </span>
                      )}
                    </td>
                    <td className="p-4 space-y-1">
                      {laudo.pdfUrl ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#07575B] dark:text-[#41B3A3] hover:underline cursor-pointer">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>Pristine.pdf</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Sem PDF anexado</span>
                      )}
                      {(laudo.imageUrl || laudo.videoUrl) && (
                        <div className="flex gap-2">
                          {laudo.imageUrl && <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1 py-0.5 rounded font-mono border border-slate-200/40">Foto</span>}
                          {laudo.videoUrl && <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1 py-0.5 rounded font-mono border border-slate-200/40">Vídeo</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setCurrentLaudo(laudo);
                          setModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Modificar laudo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(laudo.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-red-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Deletar laudo"
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

      {/* Editor Modal Container */}
      {modalOpen && currentLaudo && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto relative">
            
            <div className="bg-[#003B46] text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {currentLaudo.id ? 'Modificar Parâmetros de Laudo' : 'Formular Novo Laudo de Vistoria'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Número Identificador *</label>
                  <input
                    type="text"
                    required
                    value={currentLaudo.numero || ''}
                    onChange={(e) => setCurrentLaudo({ ...currentLaudo, numero: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                    placeholder="Ex: LT-2026-X"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Registro ART Vinculada</label>
                  <input
                    type="text"
                    value={currentLaudo.art || ''}
                    onChange={(e) => setCurrentLaudo({ ...currentLaudo, art: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                    placeholder="Ex: PE-18222994-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Selecionar Cliente Proprietário *</label>
                  <select
                    required
                    value={currentLaudo.clientId || ''}
                    onChange={(e) => setCurrentLaudo({ ...currentLaudo, clientId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Vincular Ativo / Equipamento *</label>
                  <select
                    required
                    value={currentLaudo.equipmentId || ''}
                    onChange={(e) => setCurrentLaudo({ ...currentLaudo, equipmentId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                  >
                    {equipments.filter(eq => eq.clientId === currentLaudo.clientId).map(e => (
                      <option key={e.id} value={e.id}>{e.type} ({e.model})</option>
                    ))}
                    {equipments.filter(eq => eq.clientId === currentLaudo.clientId).length === 0 && (
                      <option value="">Nenhum ativo associado a este cliente</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Data Oficial da Vistoria *</label>
                  <input
                    type="date"
                    required
                    value={currentLaudo.dateInspection || ''}
                    onChange={(e) => setCurrentLaudo({ ...currentLaudo, dateInspection: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Status do Processamento *</label>
                  <select
                    value={currentLaudo.status || LaudoStatus.EM_ELABORACAO}
                    onChange={(e) => setCurrentLaudo({ ...currentLaudo, status: e.target.value as LaudoStatus })}
                    className="w-[#100%] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-[#003B46] dark:text-white cursor-pointer"
                  >
                    <option value={LaudoStatus.EM_ELABORACAO}>Em Elaboração / Vistoriado</option>
                    <option value={LaudoStatus.EMITIDO}>Emitido / Liberado</option>
                    <option value={LaudoStatus.VENCIDO}>Vencido / Expirado</option>
                  </select>
                </div>
              </div>

              {/* Uploads Panel Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono block">Enexar Arquivos de Laudo</label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* PDF Upload */}
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">Laudo PDF</span>
                    <button
                      type="button"
                      onClick={() => handleUploadSimulate('pdf')}
                      disabled={!!uploading}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentLaudo.pdfUrl ? 'Anexo pronto' : 'Drag or click'}</span>
                    </button>
                    {uploading === 'pdf' && (
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-[#07575B] h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">Foto Vistoria</span>
                    <button
                      type="button"
                      onClick={() => handleUploadSimulate('image')}
                      disabled={!!uploading}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentLaudo.imageUrl ? 'Imagem pronta' : 'Upload Foto'}</span>
                    </button>
                    {uploading === 'image' && (
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-[#07575B] h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">Vídeo Ensaio</span>
                    <button
                      type="button"
                      onClick={() => handleUploadSimulate('video')}
                      disabled={!!uploading}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentLaudo.videoUrl ? 'Vídeo pronto' : 'Upload Vídeo'}</span>
                    </button>
                    {uploading === 'video' && (
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-[#07575B] h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">
                  Todos os arquivos são armazenados no Firebase Cloud Storage em pastas isoladas e seguras.
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
                  className="px-5 py-2 rounded-lg bg-[#07575B] hover:bg-[#003B46] text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar laudo</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
