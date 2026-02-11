
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { MonthlyCashFlow } from '../types';
import { MONTHS } from '../constants';

interface DashboardProps {
  summary: MonthlyCashFlow[];
  currentMonth: number;
  performance: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ summary, currentMonth, performance }) => {
  const currentData = summary[currentMonth - 1] || summary[0];

  const chartData = summary.map(s => ({
    name: MONTHS[s.month - 1].substring(0, 3),
    Receitas: s.income,
    Despesas: s.expense,
  }));

  const goalData = performance
    .filter(p => p.target > 0)
    .map(p => ({
      name: p.accountName,
      Meta: p.target,
      Realizado: p.actual
    }));

  const pieData = [
    { name: 'Receitas', value: currentData.income, color: '#10b981' },
    { name: 'Despesas', value: currentData.expense, color: '#ef4444' },
  ];

  const StatCard = ({ title, value, color, subtitle }: { title: string, value: number, color: string, subtitle?: string }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </p>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receitas no Mês" value={currentData.income} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Despesas no Mês" value={currentData.expense} color="text-rose-600 dark:text-rose-400" />
        <StatCard title="Resultado Líquido" value={currentData.result} color={currentData.result >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
        <StatCard title="Saldo Acumulado" value={currentData.accumulated} color="text-slate-900 dark:text-white" subtitle="Final do mês" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">Evolução Anual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">Meta vs Realizado (Mês)</h3>
          <div className="h-80">
            {goalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#33415520" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="Meta" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={10} />
                  <Bar dataKey="Realizado" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Nenhuma meta definida para este mês.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
