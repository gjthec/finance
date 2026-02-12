
import React, { useState, useMemo } from 'react';
import { Transaction, ChartOfAccount } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  accounts: ChartOfAccount[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (transaction: Transaction) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, accounts, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return transactions
      .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [transactions, searchTerm]);

  const stats = useMemo(() => {
    const income = filtered.filter(t => t.classification === 'RECEITA').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.classification === 'DESPESA').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Sem Categoria';

  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Mini Dashboard de Contexto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receitas Filtradas</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(stats.income)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Despesas Filtradas</p>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatBRL(stats.expense)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/10">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Saldo do Período</p>
          <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>{formatBRL(stats.balance)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-grow transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar por descrição..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Novo Lançamento
          </button>
        </div>

        <div className="overflow-auto custom-scrollbar flex-grow">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Lançamento</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">
                    Nenhum lançamento encontrado para este período ou filtro.
                  </td>
                </tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-indigo-900/10 group transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-100 font-medium">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Vencimento</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${t.classification === 'RECEITA' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                      {getAccountName(t.chartAccountId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onToggleStatus(t)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all ${
                        t.paymentDate 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {t.paymentDate ? '✓ REALIZADO' : '○ PENDENTE'}
                    </button>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-base ${t.classification === 'RECEITA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {t.classification === 'RECEITA' ? '+ ' : '- '}{formatBRL(t.amount)}
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(t)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 transition-colors" title="Editar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => onDelete(t.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg text-rose-600 transition-colors" title="Excluir"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
