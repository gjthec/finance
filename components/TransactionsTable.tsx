
import React, { useState } from 'react';
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

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'N/A';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar lançamentos..."
            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
          Novo Lançamento
        </button>
      </div>

      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0 border-b dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 group transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{t.description}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getAccountName(t.chartAccountId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${t.paymentDate ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {t.paymentDate ? 'REALIZADO' : 'PENDENTE'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.classification === 'RECEITA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(t)} className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 transition-colors" title="Editar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => onDelete(t.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg text-rose-600 transition-colors" title="Excluir"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      <button onClick={() => onToggleStatus(t)} className={`p-1.5 rounded-lg transition-colors ${t.paymentDate ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40' : 'text-slate-400 hover:text-emerald-600'}`} title="Alternar Pagamento"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
