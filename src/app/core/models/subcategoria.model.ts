/**
 * Model para Subcategoria
 * Representa uma subcategoria de produtos (ex: Camisetas, Calças dentro de Roupas)
 */
export interface Subcategoria {
  id?: number;
  nome: string;
  descricao?: string;
  categoriaId: number;
  categoriaNome?: string;
  ativa?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
}

