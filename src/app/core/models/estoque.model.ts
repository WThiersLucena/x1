export interface EstoqueMovimento {
  id?: number;
  produtoId: number;
  produtoNome?: string;
  tipoMovimento: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO' | 'PERDA';
  quantidade: number;
  dataMovimento?: string;
  observacao?: string;
  responsavel?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

