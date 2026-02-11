
import React from 'react';

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DRE_STRUCTURE: { label: string; type: 'group' | 'row' | 'calc'; association?: string; operation?: 'add' | 'sub' }[] = [
  { label: 'Receita Operacional Bruta', type: 'row', association: 'Receita Operacional' },
  { label: '(-) Estorno', type: 'row', association: 'Estorno', operation: 'sub' },
  { label: '(-) Impostos sobre venda', type: 'row', association: 'Imposto', operation: 'sub' },
  { label: 'Receita Operacional Líquida', type: 'calc' },
  { label: '(-) Custo (CMV/CPV/CSP)', type: 'row', association: 'Custo', operation: 'sub' },
  { label: 'Lucro Bruto', type: 'calc' },
  { label: '(-) Despesas Administrativas/Vendas', type: 'row', association: 'Despesa', operation: 'sub' },
  { label: 'Resultado Operacional (EBITDA)', type: 'calc' },
  { label: '(-) Desp. Financeiras', type: 'row', association: 'Despesa financeira', operation: 'sub' },
  { label: '(+) Rec. Financeiras', type: 'row', association: 'Receita financeira', operation: 'add' },
  { label: 'Outras Rec/Desp Não Operacionais', type: 'row', association: 'Receita/Despesa não operacional', operation: 'add' },
  { label: 'Resultado antes do IR/CSLL (LAIR)', type: 'calc' },
  { label: 'Provisão IR', type: 'calc' },
  { label: 'Provisão CSLL', type: 'calc' },
  { label: 'Resultado Líquido do Exercício', type: 'calc' },
];
