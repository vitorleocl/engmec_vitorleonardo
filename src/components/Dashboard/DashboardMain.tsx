/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  Cog, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  User as UserIcon, 
  Shield, 
  KeyRound, 
  AlertCircle 
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ClientManager from './ClientManager';
import EquipmentManager from './EquipmentManager';
import LaudoManager from './LaudoManager';
import ChecklistManager from './ChecklistManager';
import ClientPortal from './ClientPortal';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  isRealFirebase
} from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type SystemRole = 'admin' | 'client';

export default function DashboardMain() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bypassAuth, setBypassAuth] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [role, setRole] = useState<SystemRole>('admin');
  const [activeTab, setActiveTab] = useState<'indicators' | 'clients' | 'equipments' | 'laudos' | 'checklists' | 'portal'>('indicators');

  // Monitor Auth state changes
  useEffect(() => {
    // If Firebase isn't set up yet, bypass auth automatically
    if (!isRealFirebase) {
      setBypassAuth(true);
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        setBypassAuth(false);
        
        // Vitor Leonardo gets assigned admin; other addresses map to clients
        if (user.email === 'vitorleonardocl@gmail.com') {
          setRole('admin');
          setActiveTab('indicators');
        } else {
          setRole('client');
          setActiveTab('portal');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Authentication trigger
  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao realizar autenticação com o Google.');
    }
  };

  // Sign out trigger
  const handleSignOut = async () => {
    try {
      if (isRealFirebase) {
        await logoutUser();
      }
      setCurrentUser(null);
      setBypassAuth(false);
      setRole('admin');
      setActiveTab('indicators');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Authing spinner loader
  if (authLoading) {
    return (
      <section id="restricted-area" className="py-24 bg-slate-100 dark:bg-slate-950 min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#134074] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-black">Conectando ao sistema seguro...</p>
        </div>
      </section>
    );
  }

  // Not logged in or bypassed: show premium custom authentication page
  if (!currentUser && !bypassAuth && isRealFirebase) {
    return (
      <section id="restricted-area" className="py-16 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors duration-300 scroll-mt-16 flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-8 text-center">
            
            {/* Custom security badge header */}
            <div className="inline-flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-950 rounded-2xl mx-auto shadow-inner">
              <span className="p-2 bg-[#0B2545] text-white rounded-xl shadow-md">
                <KeyRound className="w-5 h-5" />
              </span>
              <div className="text-left px-2 leading-none">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#134074] dark:text-[#4895EF] font-bold">Autenticação</span>
                <p className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider font-sans leading-none pt-0.5">Área Restrita</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">Acesso ao Acervo Técnico</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans px-2">
                Área de acesso restrito para o Engenheiro Responsável Vitor Leonardo e empresas conveniadas sob as normas e diretrizes do CREA-PE e LGPD.
              </p>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-left text-xs leading-relaxed font-mono">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              {/* Google Sign-in primary action */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#0B2545] hover:bg-[#134074] text-white p-3.5 rounded-xl text-xs font-black font-mono uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Entrar com o Google</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
              <Shield className="w-3.5 h-3.5 text-[#134074]" />
              <span>Painel Audidado em Conformidade com a LGPD</span>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="restricted-area" className="py-16 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors duration-300 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Master layout block */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Dashboard Lateral Navigation Rail */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
            
            <div className="space-y-8">
              {/* Authenticated identity card */}
              <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div className="max-w-[70%]">
                    <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">LOGADO COM SUCESSO</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={currentUser?.displayName || currentUser?.email || 'Vitor Leonardo C.'}>
                      {currentUser?.displayName || currentUser?.email || (role === 'admin' ? 'Vitor Leonardo C.' : 'Metalúrgica PE S.A.')}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded">
                  <UserIcon className="w-3 h-3 text-[#134074]" />
                  <span>Cargo: {role === 'admin' ? 'ENGENHEIRO (ADMIN)' : 'CLIENTE'}</span>
                </div>
              </div>

              {/* Navigation Tabs groups according to roles permissioning */}
              <div className="space-y-1">
                {role === 'admin' ? (
                  <>
                    <button
                      onClick={() => setActiveTab('indicators')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'indicators' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 shrink-0" />
                      <span>Painel Indicadores</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'clients' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Clientes</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('equipments')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'equipments' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <Cog className="w-4 h-4 shrink-0" />
                      <span>Ativos / Equipamentos</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('laudos')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'laudos' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Laudos Técnicos</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('checklists')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'checklists' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 shrink-0" />
                      <span>Checklists Vistorias</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveTab('portal')}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'portal' 
                        ? 'bg-[#0B2545] text-white' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Portal do Cliente</span>
                  </button>
                )}
              </div>
            </div>

            {/* Logout control action */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer font-mono"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar Conta</span>
              </button>
            </div>

          </div>

          {/* Core Content Area */}
          <div className="lg:col-span-9 p-8 md:p-10 text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-900 scrollbar-thin">
            <div className="animate-fade-in max-w-full">
              {activeTab === 'indicators' && role === 'admin' && <AdminDashboard />}
              {activeTab === 'clients' && role === 'admin' && <ClientManager />}
              {activeTab === 'equipments' && role === 'admin' && <EquipmentManager />}
              {activeTab === 'laudos' && role === 'admin' && <LaudoManager />}
              {activeTab === 'checklists' && role === 'admin' && <ChecklistManager />}
              {activeTab === 'portal' && <ClientPortal />}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
