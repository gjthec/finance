
import React, { useState, useMemo, useEffect } from 'react';
import { 
  mockAccounts, 
  mockTransactions, 
  mockDREConfig, 
  mockGoals 
} from './data/mockData';
import { 
  calculateMonthlySummary, 
  calculateDRE, 
  calculateGoalsPerformance, 
  calculateFullYearGoals 
} from './services/financeService';
import { firebaseService } from './services/firebaseService';
import { FIREBASE_ON } from './firebaseConfig';

import Dashboard from './components/Dashboard';
import TransactionsTable from './components/TransactionsTable';
import DREView from './components/DREView';
import TransactionModal from './components/TransactionModal';
import AccountModal from './components/AccountModal';
import AccountsView from './components/AccountsView';
import GoalsView from './components/GoalsView';
import { MONTHS } from './constants';
import { Transaction, ChartOfAccount, DREConfig, Goal } from './types';

type ViewMode = 'DASHBOARD' | 'TRANSACTIONS' | 'ACCOUNTS' | 'DRE' | 'GOALS';

const App: React.FC = () => {
  const now = new Date();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<ViewMode>('DASHBOARD');
  
  // Inicia sempre no ano e mês atual
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(FIREBASE_ON);

  const [transactions, setTransactions] = useState<Transaction[]>(FIREBASE_ON ? [] : mockTransactions);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(FIREBASE_ON ? [] : mockAccounts);
  const [goals, setGoals] = useState<Goal[]>(FIREBASE_ON ? [] : mockGoals);
  const [dreConfig, setDreConfig] = useState<DREConfig>(FIREBASE_ON ? { year: now.getFullYear(), irTax: 0, csllTax: 0, initialBalance: 0 } : mockDREConfig);
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingAcc, setEditingAcc] = useState<ChartOfAccount | null>(null);

  useEffect(() => {
    if (FIREBASE_ON) {
      const loadData = async () => {
        try {
          const [fbTxs, fbAccs, fbGoals, fbDRE] = await Promise.all([
            firebaseService.getTransactions(),
            firebaseService.getAccounts(),
            firebaseService.getGoals(),
            firebaseService.getDREConfig()
          ]);

          setTransactions(fbTxs);
          setAccounts(fbAccs);
          setGoals(fbGoals);
          if (fbDRE) setDreConfig(fbDRE);
        } catch (error) {
          console.error("Firebase Load Error:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Lista de anos baseada nos lançamentos + ano atual
  const availableYears = useMemo(() => {
    const years = new Set([now.getFullYear()]);
    transactions.forEach(t => {
      const d = new Date(t.paymentDate || t.dueDate);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const monthlySummary = useMemo(() => 
    calculateMonthlySummary(transactions, year === 0 ? now.getFullYear() : year, month === 0 ? 1 : month, dreConfig.initialBalance), 
  [transactions, year, month, dreConfig.initialBalance]);

  const dreData = useMemo(() => 
    calculateDRE(transactions, accounts, year === 0 ? now.getFullYear() : year, month === 0 ? undefined : month, dreConfig.irTax, dreConfig.csllTax), 
  [transactions, year, month, accounts, dreConfig]);

  const goalsPerformance = useMemo(() => 
    calculateGoalsPerformance(transactions, goals, accounts, year === 0 ? now.getFullYear() : year, month === 0 ? 1 : month), 
  [transactions, goals, accounts, year, month]);

  const fullYearGoals = useMemo(() => 
    calculateFullYearGoals(transactions, goals, accounts, year === 0 ? now.getFullYear() : year), 
  [transactions, goals, accounts, year]);

  const handleSaveTx = async (tx: Transaction) => {
    const tempId = tx.id;
    setTransactions(prev => {
      const exists = prev.some(t => t.id === tempId);
      if (exists) return prev.map(t => t.id === tempId ? tx : t);
      return [tx, ...prev];
    });

    if (FIREBASE_ON) {
      try {
        const realId = await firebaseService.saveTransaction(tx);
        if (realId && realId !== tempId) {
          setTransactions(prev => prev.map(t => t.id === tempId ? { ...tx, id: realId } : t));
        }
      } catch (err) {
        console.error("Error saving to Firebase", err);
      }
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (confirm('Deseja excluir este lançamento permanentemente?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (FIREBASE_ON) await firebaseService.deleteTransaction(id);
    }
  };

  const handleDeleteAcc = async (id: string) => {
    if (confirm('Deseja excluir esta conta? Isso pode afetar lançamentos existentes.')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      if (FIREBASE_ON) await firebaseService.deleteAccount(id);
    }
  };

  const handleToggleTxStatus = async (tx: Transaction) => {
    const updated = { ...tx, paymentDate: tx.paymentDate ? null : new Date().toISOString().split('T')[0] };
    await handleSaveTx(updated);
  };

  const handleSaveAcc = async (acc: ChartOfAccount) => {
    setAccounts(prev => editingAcc ? prev.map(a => a.id === acc.id ? acc : a) : [...prev, acc]);
    if (FIREBASE_ON) await firebaseService.saveAccount(acc);
  };

  const handleUpdateMeta = async (accountId: string, m: number, value: number) => {
    const targetYear = year === 0 ? now.getFullYear() : year;
    const existing = goals.find(g => g.chartAccountId === accountId && g.year === targetYear && g.month === m);
    let updatedGoal: Goal;
    if (existing) {
      updatedGoal = { ...existing, targetValue: value };
      setGoals(prev => prev.map(g => g.id === existing.id ? updatedGoal : g));
    } else {
      updatedGoal = { id: Math.random().toString(36).substr(2, 9), chartAccountId: accountId, year: targetYear, month: m, targetValue: value };
      setGoals(prev => [...prev, updatedGoal]);
    }
    if (FIREBASE_ON) await firebaseService.saveGoal(updatedGoal);
  };

  const handleUpdateDREConfig = async (newConfig: DREConfig) => {
    setDreConfig(newConfig);
    if (FIREBASE_ON) await firebaseService.saveDREConfig(newConfig);
  };

  const handleSeedFirebase = async () => {
    if (!FIREBASE_ON) return alert("Ative FIREBASE_ON primeiro.");
    if (confirm("Isso irá popular seu Firebase com dados de exemplo. Continuar?")) {
      setLoading(true);
      await firebaseService.seedData(mockTransactions, mockAccounts, mockGoals, mockDREConfig);
      window.location.reload();
    }
  };

  const NavItem = ({ mode, label, icon }: { mode: ViewMode, label: string, icon: React.ReactNode }) => (
    <button onClick={() => setView(mode)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      {icon} {label}
    </button>
  );

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-slate-500 animate-pulse">Sincronizando dados financeiros...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 space-y-8 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">F</div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-none text-lg">Finanza</h1>
            <div className="flex items-center gap-1 mt-1">
               <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">SaaS Core</p>
               {FIREBASE_ON && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Firebase Ativo" />}
            </div>
          </div>
        </div>
        <nav className="flex-grow space-y-1">
          <NavItem mode="DASHBOARD" label="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" /></svg>} />
          <NavItem mode="TRANSACTIONS" label="Lançamentos" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <NavItem mode="GOALS" label="Metas" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0l-3 3m3-3l-3-3M8 17H0m0 0l3 3m-3-3l3-3" /></svg>} />
          <NavItem mode="ACCOUNTS" label="Plano de Contas" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zM9 12h6M9 16h6M9 8h6" /></svg>} />
          <NavItem mode="DRE" label="Relatório DRE" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        </nav>
        
        {FIREBASE_ON && (
          <button 
            onClick={handleSeedFirebase}
            className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            POPULAR BANCO (SEED)
          </button>
        )}

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
           <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase mb-2">Interface</p>
           <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700">
             <button onClick={() => setTheme('light')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>CLARO</button>
             <button onClick={() => setTheme('dark')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>ESCURO</button>
           </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="h-10 px-4 flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Finanza LTDA</div>
             <div className="flex items-center gap-2">
                <select className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none font-bold" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  <option value={0}>Todos os Meses</option>
                  {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                </select>
                <select className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none font-bold" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  <option value={0}>Todos os Anos</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right"><p className="text-sm font-bold dark:text-white">Gerente Financeiro</p><p className="text-[10px] text-slate-400 font-bold uppercase">Cloud Access</p></div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20">GF</div>
          </div>
        </header>

        <div className="p-8 overflow-auto flex-grow custom-scrollbar">
          {view === 'DASHBOARD' && <Dashboard summary={monthlySummary} currentMonth={month === 0 ? 1 : month} performance={goalsPerformance} />}
          {view === 'TRANSACTIONS' && (
            <TransactionsTable transactions={transactions.filter(t => {
                const d = new Date(t.paymentDate || t.dueDate);
                const matchYear = year === 0 || d.getFullYear() === year;
                const matchMonth = month === 0 || d.getMonth() === month - 1;
                return matchYear && matchMonth;
              })} accounts={accounts} onAdd={() => { setEditingTx(null); setIsTxModalOpen(true); }} onEdit={(t) => { setEditingTx(t); setIsTxModalOpen(true); }} onDelete={handleDeleteTx} onToggleStatus={handleToggleTxStatus} />
          )}
          {view === 'GOALS' && (
            <GoalsView 
              fullYearPerformance={fullYearGoals} 
              year={year === 0 ? now.getFullYear() : year} 
              onUpdateMeta={handleUpdateMeta} 
            />
          )}
          {view === 'ACCOUNTS' && (
            <AccountsView accounts={accounts} onAdd={() => { setEditingAcc(null); setIsAccModalOpen(true); }} onEdit={(a) => { setEditingAcc(a); setIsAccModalOpen(true); }} onDelete={handleDeleteAcc} />
          )}
          {view === 'DRE' && <DREView dreData={dreData} year={year === 0 ? now.getFullYear() : year} config={dreConfig} onUpdateConfig={handleUpdateDREConfig} />}
        </div>
      </main>

      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onSave={handleSaveTx} accounts={accounts} editingTransaction={editingTx} />
      <AccountModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} onSave={handleSaveAcc} editingAccount={editingAcc} />
    </div>
  );
};

export default App;
