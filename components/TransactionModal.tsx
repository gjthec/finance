
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

  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
    } else {
      setFormData({
        description: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        paymentDate: null,
        classification: 'RECEITA',
        chartAccountId: accounts[0]?.id || '',
      });
    }
  }, [editingTransaction, isOpen]);

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
    if ((formData.amount || 0) < 0) {
      alert("Valores negativos não são permitidos. Use a classificação de Despesa para saídas.");
      return;
    }
    onSave({
      ...formData,
      id: editingTransaction?.id || Math.random().toString(36).substr(2, 9),
    } as Transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Descrição</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Aluguel Escritório"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Valor (R$)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold dark:text-white"
                value={formData.amount || ''}
                onChange={e => setFormData({ ...formData, amount: Math.abs(parseFloat(e.target.value)) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Vencimento</label>
              <input
                required
                type="date"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Categoria</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
              value={formData.chartAccountId}
              onChange={e => handleAccountChange(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Data de Pagamento</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
              value={formData.paymentDate || ''}
              onChange={e => setFormData({ ...formData, paymentDate: e.target.value || null })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-shadow shadow-md">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
