
import React from 'react';
import { DRE_STRUCTURE } from '../constants';

interface DREViewProps {
  dreData: any;
  year: number;
  config: { irTax: number; csllTax: number };
  onUpdateConfig: (newConfig: { irTax: number; csllTax: number }) => void;
}

const DREView: React.FC<DREViewProps> = ({ dreData, year, config, onUpdateConfig }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getRowValue = (item: typeof DRE_STRUCTURE[0]) => {
    switch (item.label) {
      case 'Receita Operacional Bruta': return dreData['Receita Operacional'];
      case '(-) Estorno': return dreData['Estorno'];
      case '(-) Impostos sobre venda': return dreData['Imposto'];
      case 'Receita Operacional Líquida': return dreData.rol;
      case '(-) Custo (CMV/CPV/CSP)': return dreData['Custo'];
      case 'Lucro Bruto': return dreData.lucroBruto;
      case '(-) Despesas Administrativas/Vendas': return dreData['Despesa'];
      case 'Resultado Operacional (EBITDA)': return dreData.ebitda;
      case '(-) Desp. Financeiras': return dreData['Despesa financeira'];
      case '(+) Rec. Financeiras': return dreData['Receita financeira'];
      case 'Outras Rec/Desp Não Operacionais': return dreData['Receita/Despesa não operacional'];
      case 'Resultado antes do IR/CSLL (LAIR)': return dreData.lair;
      case 'Provisão IR': return dreData.provIR;
      case 'Provisão CSLL': return dreData.provCSLL;
      case 'Resultado Líquido do Exercício': return dreData.netResult;
      default: return 0;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-6 border-b dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-xl font-bold dark:text-white">DRE - Demonstrativo ({year})</h2>
          <p className="text-xs text-slate-500">Regime de Caixa / Pagamentos Realizados</p>
        </div>
        <div className="flex gap-4 items-center bg-white dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700">
           <div className="text-center">
             <label className="block text-[10px] uppercase font-bold text-slate-400">IR (%)</label>
             <input type="number" min="0" step="0.5" className="w-16 bg-transparent text-sm font-bold text-indigo-600 outline-none" value={config.irTax * 100} onChange={e => onUpdateConfig({...config, irTax: parseFloat(e.target.value) / 100})} />
           </div>
           <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
           <div className="text-center">
             <label className="block text-[10px] uppercase font-bold text-slate-400">CSLL (%)</label>
             <input type="number" min="0" step="0.5" className="w-16 bg-transparent text-sm font-bold text-indigo-600 outline-none" value={config.csllTax * 100} onChange={e => onUpdateConfig({...config, csllTax: parseFloat(e.target.value) / 100})} />
           </div>
        </div>
      </div>
      
      <div className="overflow-auto custom-scrollbar flex-grow p-6">
        <table className="w-full">
          <tbody className="divide-y dark:divide-slate-800">
            {DRE_STRUCTURE.map((item, idx) => {
              const value = getRowValue(item);
              const isCalc = item.type === 'calc';
              return (
                <tr key={idx} className={`${isCalc ? 'bg-indigo-50/50 dark:bg-indigo-900/10 font-bold border-y border-indigo-100 dark:border-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <td className={`py-3 px-4 text-sm ${isCalc ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>{item.label}</td>
                  <td className={`py-3 px-4 text-sm text-right ${isCalc ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>{formatCurrency(value)}</td>
                  <td className="py-3 px-4 text-xs text-right text-slate-400">{dreData.rol > 0 ? ((value / dreData.rol) * 100).toFixed(1) + '%' : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DREView;
