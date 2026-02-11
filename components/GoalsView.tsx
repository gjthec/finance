
import React from 'react';
import { MONTHS } from '../constants';

interface GoalsViewProps {
  fullYearPerformance: any[];
  year: number;
  onUpdateMeta: (accountId: string, month: number, value: number) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ fullYearPerformance, year, onUpdateMeta }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <span className="text-indigo-600">🎯</span> Metas Anuais ({year})
          </h2>
          <p className="text-xs text-slate-500 mt-1">Selecione o plano de contas para definir metas e acompanhar resultados.</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
             <div className="w-3 h-3 bg-indigo-100 dark:bg-slate-800 border dark:border-slate-700 rounded" /> Meta (Editável)
          </span>
          <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
             <div className="w-3 h-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded" /> Realizado
          </span>
        </div>
      </div>

      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 min-w-[200px] border-r dark:border-slate-700"># Metas planos de contas</th>
              {MONTHS.map(m => (
                <th key={m} className="px-3 py-3 text-center min-w-[100px] font-bold text-slate-600 dark:text-slate-300">
                  {m}
                </th>
              ))}
              <th className="px-4 py-3 text-right bg-slate-200 dark:bg-slate-700 min-w-[120px]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {fullYearPerformance.map(cat => (
              <React.Fragment key={cat.accountId}>
                {/* Account Header Row */}
                <tr className="bg-indigo-50/30 dark:bg-indigo-900/10">
                  <td className="px-4 py-2 font-black text-indigo-700 dark:text-indigo-400 border-r dark:border-slate-700">
                    {cat.accountCode} - {cat.accountName}
                  </td>
                  {Array.from({ length: 12 }).map((_, i) => <td key={i} className="px-3 py-2" />)}
                  <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-700/50">
                    {formatCurrency(cat.totalTarget)}
                  </td>
                </tr>
                
                {/* Meta Row (Editable) */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-2 pl-8 text-slate-500 font-medium italic border-r dark:border-slate-700">Meta</td>
                  {cat.months.map((m: any, idx: number) => (
                    <td key={idx} className="p-0 border-r dark:border-slate-800">
                      <input 
                        type="number" 
                        min="0"
                        className="w-full h-full px-3 py-2 bg-indigo-50/20 dark:bg-indigo-900/5 text-center font-bold text-indigo-600 dark:text-indigo-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-colors"
                        value={m.target || ''}
                        onChange={(e) => onUpdateMeta(cat.accountId, idx + 1, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-bold text-slate-400 bg-slate-100/50 dark:bg-slate-800/50">
                    {formatCurrency(cat.totalTarget)}
                  </td>
                </tr>

                {/* Actual Row */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-2 pl-8 text-slate-500 font-medium italic border-r dark:border-slate-700">Realizada</td>
                  {cat.months.map((m: any, idx: number) => (
                    <td key={idx} className="px-3 py-2 text-center text-slate-900 dark:text-slate-100 border-r dark:border-slate-800">
                      {m.actual > 0 ? formatCurrency(m.actual) : 'R$ 0'}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-bold text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50">
                    {formatCurrency(cat.totalActual)}
                  </td>
                </tr>

                {/* Diff Row */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b-2 dark:border-slate-800">
                  <td className="px-4 py-2 pl-8 text-slate-500 font-medium italic border-r dark:border-slate-700">Diferença %</td>
                  {cat.months.map((m: any, idx: number) => {
                    const isRevenue = cat.classification === 'RECEITA';
                    const onTrack = isRevenue ? m.actual >= m.target : m.actual <= m.target;
                    return (
                      <td key={idx} className={`px-3 py-2 text-center font-bold border-r dark:border-slate-800 ${onTrack ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {m.target > 0 ? m.diff.toFixed(2) + '%' : '0,00%'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right" />
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoalsView;
