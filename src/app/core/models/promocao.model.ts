export interface Promocao {
  id?: number;
  produtoId: number;
  produtoNome?: string;
  precoPromocional: number;
  precoOriginal?: number; // Preço de venda original do produto
  dataInicio: string; // formato: YYYY-MM-DD
  dataFim: string; // formato: YYYY-MM-DD
  ativa?: boolean;
  percentualDesconto?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}
