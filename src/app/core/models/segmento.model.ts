export interface Segmento {
  id?: number;
  nome: string;
  descricao?: string;
  subcategoriaId: number;
  subcategoriaNome?: string;
  categoriaId?: number;  // Categoria pai (via subcategoria)
  categoriaNome?: string;  // Nome da categoria pai (via subcategoria)
  ativa?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
}

