
export type Classification = 'RECEITA' | 'DESPESA';

export type DREAssociation = 
  | 'Receita Operacional' 
  | 'Custo' 
  | 'Despesa' 
  | 'Estorno' 
  | 'Imposto' 
  | 'Receita financeira' 
  | 'Despesa financeira' 
  | 'Receita/Despesa não operacional';

export interface ChartOfAccount {
  id: string;
  code: string;
  classification: Classification;
  name: string;
  dreAssociation: DREAssociation;
  active: boolean;
}

export interface Transaction {
  id: string;
  dueDate: string; // data_lancamento
  paymentDate: string | null; // data_pagamento
  classification: Classification;
  chartAccountId: string;
  description: string;
  amount: number;
}

export interface Goal {
  id: string;
  chartAccountId: string;
  year: number;
  month: number;
  targetValue: number;
}

export interface DREConfig {
  year: number;
  irTax: number;
  csllTax: number;
  initialBalance: number; // Saldo que inicia o ano
}

export interface CashFlowDay {
  date: string;
  income: number;
  expense: number;
  result: number;
  accumulated: number;
}

export interface MonthlyCashFlow {
  month: number;
  initialBalance: number;
  income: number;
  expense: number;
  result: number;
  accumulated: number;
  payable: number;
  receivable: number;
}
