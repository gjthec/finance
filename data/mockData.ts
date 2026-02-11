
import { ChartOfAccount, Transaction, Goal, DREConfig } from '../types';

export const mockAccounts: ChartOfAccount[] = [
  { id: '1', code: '1.1', classification: 'RECEITA', name: 'Venda de Produtos', dreAssociation: 'Receita Operacional', active: true },
  { id: '2', code: '1.2', classification: 'RECEITA', name: 'Prestação de Serviços', dreAssociation: 'Receita Operacional', active: true },
  { id: '3', code: '2.1', classification: 'DESPESA', name: 'Compra de Mercadoria', dreAssociation: 'Custo', active: true },
  { id: '4', code: '3.1', classification: 'DESPESA', name: 'Aluguel', dreAssociation: 'Despesa', active: true },
  { id: '5', code: '3.2', classification: 'DESPESA', name: 'Salários', dreAssociation: 'Despesa', active: true },
  { id: '6', code: '3.3', classification: 'DESPESA', name: 'Marketing', dreAssociation: 'Despesa', active: true },
  { id: '7', code: '4.1', classification: 'RECEITA', name: 'Rendimentos CDB', dreAssociation: 'Receita financeira', active: true },
  { id: '8', code: '5.1', classification: 'DESPESA', name: 'Impostos (Simples Nacional)', dreAssociation: 'Imposto', active: true },
];

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const years = [2024, 2025];
  
  years.forEach(year => {
    for (let month = 1; month <= 12; month++) {
      // Receitas
      for (let i = 0; i < 5; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const amount = Math.floor(Math.random() * 5000) + 1000;
        transactions.push({
          id: `t-${year}-${month}-r-${i}`,
          dueDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          paymentDate: Math.random() > 0.2 ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null,
          classification: 'RECEITA',
          chartAccountId: Math.random() > 0.5 ? '1' : '2',
          description: `Venda cliente ${i + 1}`,
          amount
        });
      }
      // Despesas
      for (let i = 0; i < 8; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const amount = Math.floor(Math.random() * 2000) + 200;
        const catId = ['3', '4', '5', '6', '8'][Math.floor(Math.random() * 5)];
        transactions.push({
          id: `t-${year}-${month}-d-${i}`,
          dueDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          paymentDate: Math.random() > 0.1 ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null,
          classification: 'DESPESA',
          chartAccountId: catId,
          description: `Pagamento fornecedor ${i + 1}`,
          amount
        });
      }
    }
  });
  
  return transactions;
};

export const mockTransactions = generateMockTransactions();

export const mockGoals: Goal[] = mockAccounts.map(acc => ({
  id: `g-${acc.id}`,
  chartAccountId: acc.id,
  year: 2024,
  month: 1,
  targetValue: acc.classification === 'RECEITA' ? 25000 : 5000
}));

export const mockDREConfig: DREConfig = {
  year: 2024,
  irTax: 0.15,
  csllTax: 0.09
};
