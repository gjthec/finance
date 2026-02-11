
import React from 'react';
import { ChartOfAccount } from '../types';

interface AccountsViewProps {
  accounts: ChartOfAccount[];
  onAdd: () => void;
  onEdit: (account: ChartOfAccount) => void;
  onDelete: (id: string) => void;
}

const AccountsView: React.FC<AccountsViewProps> = ({ accounts, onAdd, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <h2 className="text-lg font-bold dark:text-white">Plano de Contas</h2>
        <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
           Nova Categoria
        </button>
      </div>
      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0 border-b dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Classificação</th>
              <th className="px-6 py-4">Associação DRE</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {accounts.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{acc.code}</td>
                <td className="px-6 py-4 font-medium dark:text-slate-200">{acc.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${acc.classification === 'RECEITA' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {acc.classification}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{acc.dreAssociation}</td>
                <td className="px-6 py-4 text-center">
                   <div className="flex justify-center gap-2">
                     <button onClick={() => onEdit(acc)} className="p-1 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                     <button onClick={() => onDelete(acc.id)} className="p-1 hover:text-rose-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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

export default AccountsView;
