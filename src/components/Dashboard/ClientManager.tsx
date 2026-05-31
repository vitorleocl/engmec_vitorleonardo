/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClientData } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Search, X, CheckSquare, Save } from 'lucide-react';

export default function ClientManager() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<ClientData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        const querySnapshot = await getDocs(collection(db, 'clients'));
        const clientsArray: ClientData[] = [];
        querySnapshot.forEach((docSnap) => {
          clientsArray.push(docSnap.data() as ClientData);
        });
        setClients(clientsArray);
      } else {
        setClients(mockDb.getClients());
      }
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient?.name || !currentClient?.email || !currentClient?.cnpj_cpf) return;

    setLoading(true);
    const clientId = currentClient.id || 'cli_' + Math.random().toString(36).substr(2, 9);
    const saveObj: ClientData = {
      id: clientId,
      name: currentClient.name,
      email: currentClient.email,
      phone: currentClient.phone || '',
      company: currentClient.company || '',
      cnpj_cpf: currentClient.cnpj_cpf,
      address: currentClient.address || '',
      createdAt: currentClient.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (isRealFirebase) {
        await setDoc(doc(db, 'clients', clientId), saveObj);
      } else {
        mockDb.saveClient(saveObj);
      }
      setModalOpen(false);
      loadClients();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `clients/${clientId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;
    setLoading(true);
    try {
      if (isRealFirebase) {
        await deleteDoc(doc(db, 'clients', id));
      } else {
        mockDb.deleteClient(id);
      }
      loadClients();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cnpj_cpf.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Header operations */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">Cadastro de Clientes</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Registo de corporações habilitadas no fluxo operacional e de laudos</p>
        </div>
        
        <button
          onClick={() => {
            setCurrentClient({});
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#07575B] hover:bg-[#003B46] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrar por nome, empresa ou CPF/CNPJ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none"
        />
      </div>

      {/* Content table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
            <span className="w-5 h-5 border-2 border-[#07575B] border-t-transparent rounded-full animate-spin" />
            <span>Processando dados...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Nenhum registro de cliente foi localizado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Empresa / Razão Social</th>
                  <th className="p-4">CPF / CNPJ</th>
                  <th className="p-4">Contato / E-mail</th>
                  <th className="p-4">Endereço</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{client.company}</div>
                      <div className="text-xs text-slate-500 font-sans">{client.name}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">{client.cnpj_cpf}</td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{client.phone}</div>
                      <div className="text-xs text-slate-500 font-mono">{client.email}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-xs" title={client.address}>
                      {client.address}
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setCurrentClient(client);
                          setModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-red-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Excluir cliente"
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

      {/* Editor Modal */}
      {modalOpen && currentClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-y-auto relative">
            
            <div className="bg-[#003B46] text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {currentClient.id ? 'Editar Cadastro de Cliente' : 'Registrar Novo Cliente'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Nome do Contato Principal *</label>
                  <input
                    type="text"
                    required
                    value={currentClient.name || ''}
                    onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: Vitor Cordeiro"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Razão Social / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={currentClient.company || ''}
                    onChange={(e) => setCurrentClient({ ...currentClient, company: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: Metalúrgica PE S.A."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">E-mail para Notificações *</label>
                  <input
                    type="email"
                    required
                    value={currentClient.email || ''}
                    onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="vitor@empresa.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Telefone / Comercial</label>
                  <input
                    type="text"
                    value={currentClient.phone || ''}
                    onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="(81) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono">CPF / CNPJ Jurídico *</label>
                <input
                  type="text"
                  required
                  value={currentClient.cnpj_cpf || ''}
                  onChange={(e) => setCurrentClient({ ...currentClient, cnpj_cpf: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono">Endereço Operacional / Comercial</label>
                <textarea
                  value={currentClient.address || ''}
                  onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white resize-none h-20"
                  placeholder="Av. Mascarenhas, Imbiribeira, Recife - PE"
                />
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
                  <span>Salvar Dados</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
