export interface ItemCarrinho {
  id?: number;
  produtoId: number;
  produtoNome?: string;
  produtoImagemUrl?: string;
  produtoPrimeiroAtributo?: string; // Formato: "Nome - Valor" (ex: "Tamanho - P", "Marca - Strong Tech")
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  estoqueDisponivel?: number;
}

export interface Carrinho {
  id?: number;
  usuarioId?: number;
  dataAtualizacao?: string;
  itens: ItemCarrinho[];
  subtotal: number;
  quantidadeTotal: number;
}

export interface AdicionarItemCarrinho {
  produtoId: number;
  quantidade: number;
}

export interface AtualizarItemCarrinho {
  quantidade: number;
}

