
import { Transaction, ChartOfAccount, MonthlyCashFlow, CashFlowDay, DREAssociation, Goal } from '../types';

export const calculateMonthlySummary = (
  transactions: Transaction[],
  year: number,
  month: number,
  initialYearBalance: number = 50000
) => {
  let currentBalance = initialYearBalance;
  const monthlyFlows: MonthlyCashFlow[] = [];

  for (let m = 0; m < 12; m++) {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.paymentDate || t.dueDate);
      return d.getFullYear() === year && d.getMonth() === m;
    });

    const income = monthTransactions
      .filter(t => t.classification === 'RECEITA' && t.paymentDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.classification === 'DESPESA' && t.paymentDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const payable = monthTransactions
      .filter(t => t.classification === 'DESPESA' && !t.paymentDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const receivable = monthTransactions
      .filter(t => t.classification === 'RECEITA' && !t.paymentDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const result = income - expense;
    const initialBalance = m === 0 ? initialYearBalance : monthlyFlows[m - 1].accumulated;
    const accumulated = initialBalance + result;

    monthlyFlows.push({
      month: m + 1,
      initialBalance,
      income,
      expense,
      result,
      accumulated,
      payable,
      receivable
    });
  }

  return monthlyFlows;
};

export const calculateDRE = (
  transactions: Transaction[],
  accounts: ChartOfAccount[],
  year: number,
  month?: number,
  irRate: number = 0.15,
  csllRate: number = 0.09
) => {
  const data = transactions.filter(t => {
    const d = new Date(t.paymentDate || t.dueDate);
    const yearMatch = d.getFullYear() === year;
    const monthMatch = month !== undefined ? d.getMonth() === month - 1 : true;
    return yearMatch && monthMatch && t.paymentDate;
  });

  const getSumByAssociation = (assoc: DREAssociation) => {
    return data.reduce((sum, t) => {
      const acc = accounts.find(a => a.id === t.chartAccountId);
      if (acc?.dreAssociation === assoc) return sum + t.amount;
      return sum;
    }, 0);
  };

  const values: Record<string, number> = {
    'Receita Operacional': getSumByAssociation('Receita Operacional'),
    'Estorno': getSumByAssociation('Estorno'),
    'Imposto': getSumByAssociation('Imposto'),
    'Custo': getSumByAssociation('Custo'),
    'Despesa': getSumByAssociation('Despesa'),
    'Receita financeira': getSumByAssociation('Receita financeira'),
    'Despesa financeira': getSumByAssociation('Despesa financeira'),
    'Receita/Despesa não operacional': getSumByAssociation('Receita/Despesa não operacional'),
  };

  const rol = values['Receita Operacional'] - values['Estorno'] - values['Imposto'];
  const lucroBruto = rol - values['Custo'];
  const ebitda = lucroBruto - values['Despesa'];
  const lair = ebitda - values['Despesa financeira'] + values['Receita financeira'] + values['Receita/Despesa não operacional'];
  
  const provIR = lair > 0 ? lair * irRate : 0;
  const provCSLL = lair > 0 ? lair * csllRate : 0;
  const netResult = lair - provIR - provCSLL;

  return { ...values, rol, lucroBruto, ebitda, lair, provIR, provCSLL, netResult };
};

export const calculateGoalsPerformance = (
  transactions: Transaction[],
  goals: Goal[],
  accounts: ChartOfAccount[],
  year: number,
  month: number
) => {
  return accounts.map(acc => {
    const goal = goals.find(g => g.chartAccountId === acc.id && g.year === year && g.month === month);
    const target = goal ? goal.targetValue : 0;
    
    const actual = transactions
      .filter(t => t.chartAccountId === acc.id && t.paymentDate)
      .filter(t => {
        const d = new Date(t.paymentDate!);
        return d.getFullYear() === year && d.getMonth() === month - 1;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const diff = target > 0 ? (actual / target) - 1 : 0;

    return {
      accountId: acc.id,
      accountName: acc.name,
      classification: acc.classification,
      target,
      actual,
      diff: diff * 100
    };
  });
};

export const calculateFullYearGoals = (
  transactions: Transaction[],
  goals: Goal[],
  accounts: ChartOfAccount[],
  year: number
) => {
  return accounts.map(acc => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const goal = goals.find(g => g.chartAccountId === acc.id && g.year === year && g.month === m);
      const target = goal ? goal.targetValue : 0;
      
      const actual = transactions
        .filter(t => t.chartAccountId === acc.id && t.paymentDate)
        .filter(t => {
          const d = new Date(t.paymentDate!);
          return d.getFullYear() === year && d.getMonth() === i;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const diff = target > 0 ? (actual / target) - 1 : 0;

      return { target, actual, diff: diff * 100 };
    });

    return {
      accountId: acc.id,
      accountName: acc.name,
      accountCode: acc.code,
      classification: acc.classification,
      months: monthlyData,
      totalTarget: monthlyData.reduce((s, m) => s + m.target, 0),
      totalActual: monthlyData.reduce((s, m) => s + m.actual, 0)
    };
  });
};
