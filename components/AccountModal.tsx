
import React, { useState, useEffect } from 'react';
import { ChartOfAccount, Classification, DREAssociation } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: ChartOfAccount) => void;
  editingAccount?: ChartOfAccount | null;
}

const associations: DREAssociation[] = [
  'Receita Operacional', 'Custo', 'Despesa', 'Estorno', 'Imposto', 
  'Receita financeira', 'Despesa financeira', 'Receita/Despesa não operacional'
];

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, editingAccount }) => {
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({
    code: '',
    name: '',
    classification: 'RECEITA',
    dreAssociation: 'Receita Operacional',
    active: true
  });

  useEffect(() => {
    if (editingAccount) setFormData(editingAccount);
    else setFormData({ code: '', name: '', classification: 'RECEITA', dreAssociation: 'Receita Operacional', active: true });
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingAccount ? 'Editar Conta' : 'Nova Conta Contábil'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...formData, id: editingAccount?.id || Math.random().toString(36).substr(2, 9) } as ChartOfAccount);
          onClose();
        }}>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
              <input required className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm dark:text-white" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="1.1" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
              <input required className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Venda de Software" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Classificação</label>
            <div className="flex gap-2">
              {['RECEITA', 'DESPESA'].map(c => (
                <button key={c} type="button" onClick={() => setFormData({...formData, classification: c as Classification})} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${formData.classification === c ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Associação DRE</label>
            <select className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm dark:text-white" value={formData.dreAssociation} onChange={e => setFormData({...formData, dreAssociation: e.target.value as DREAssociation})}>
              {associations.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors">Salvar Conta</button>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
