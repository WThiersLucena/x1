export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
  categoriaPaiId?: number | null;
  categoriaPaiNome?: string;
  ativa?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

