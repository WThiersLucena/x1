import { ProdutoAtributo } from './produto-atributo.model';

export interface ImagemProduto {
  id?: number;
  produtoId?: number;
  url: string;
  descricao?: string;
  principal?: boolean;
  ordem?: number;
  ativa?: boolean;
}

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  // REMOVIDO: tamanho (substituído por atributos dinâmicos)
  segmentoId: number;
  segmentoNome?: string;
  subcategoriaId?: number;  // Via segmento (apenas para exibição)
  subcategoriaNome?: string;  // Via segmento (apenas para exibição)
  categoriaId?: number;  // Via segmento > subcategoria (apenas para exibição)
  categoriaNome?: string;  // Via segmento > subcategoria (apenas para exibição)
  fornecedorId: number;
  fornecedorNome?: string;
  custoUnitario: number;
  precoDe?: number;
  precoVenda?: number;
  margemLucro?: number;
  estoqueAtual?: number;
  unidadeMedida: 'UNIDADE' | 'PACOTE' | 'CAIXA' | 'METRO' | 'KILO';
  destaque?: boolean;
  maisVendido?: boolean;
  promocao?: boolean;
  ativo?: boolean;
  atributos?: ProdutoAtributo[];  // NOVO: Atributos dinâmicos
  imagens?: ImagemProduto[];
  dataCriacao?: string;
  dataAtualizacao?: string;
}

