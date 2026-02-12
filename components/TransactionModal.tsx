
import React, { useState, useEffect } from 'react';
import { Transaction, ChartOfAccount } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  accounts: ChartOfAccount[];
  editingTransaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, accounts, editingTransaction }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    paymentDate: null,
    classification: 'RECEITA',
    chartAccountId: accounts[0]?.id || '',
  });

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
      setIsPaid(!!editingTransaction.paymentDate);
    } else {
      setFormData({
        description: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        paymentDate: null,
        classification: 'RECEITA',
        chartAccountId: accounts[0]?.id || '',
      });
      setIsPaid(false);
    }
  }, [editingTransaction, isOpen, accounts]);

  if (!isOpen) return null;

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setFormData({
        ...formData,
        chartAccountId: accountId,
        classification: account.classification
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      id: editingTransaction?.id || Math.random().toString(36).substr(2, 9),
      paymentDate: isPaid ? (formData.paymentDate || formData.dueDate) : null
    } as Transaction;
    
    onSave(finalData);
    onClose();
  };

  const currentAccount = accounts.find(a => a.id === formData.chartAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header com indicador de tipo */}
        <div className={`p-6 flex justify-between items-center ${formData.classification === 'RECEITA' ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-rose-50 dark:bg-rose-900/10'}`}>
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${formData.classification === 'RECEITA' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                {formData.classification === 'RECEITA' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0l-3 3m3-3l-3-3M8 17H0m0 0l3 3m-3-3l3-3" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                )}
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                 {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
               </h3>
               <p className={`text-[10px] font-black uppercase tracking-widest ${formData.classification === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {formData.classification}
               </p>
             </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição do Lançamento</label>
              <input
                required autoFocus
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none text-base font-medium dark:text-white transition-all"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Pagamento Fornecedor de Café"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor Total</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                  <input
                    required
                    type="number" min="0.01" step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none text-base font-bold dark:text-white transition-all"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Vencimento</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none text-sm dark:text-white transition-all"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria Financeira</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none text-sm font-semibold dark:text-white transition-all appearance-none"
                value={formData.chartAccountId}
                onChange={e => handleAccountChange(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name} ({acc.classification})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção de Status */}
          <div className="pt-4 border-t dark:border-slate-800">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Marcar como Realizado?</p>
                  <p className="text-[10px] text-slate-500">Define se o dinheiro já saiu/entrou na conta.</p>
               </div>
               <button 
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`w-14 h-7 rounded-full transition-colors relative ${isPaid ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isPaid ? 'left-8' : 'left-1'}`} />
               </button>
            </div>

            {isPaid && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data do Pagamento/Recebimento</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl outline-none text-sm dark:text-white"
                  value={formData.paymentDate || formData.dueDate}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button type="submit" className={`flex-1 px-6 py-3 text-white rounded-2xl text-sm font-bold shadow-xl transition-all active:scale-95 ${formData.classification === 'RECEITA' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none'}`}>
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
