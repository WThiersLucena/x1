export type StatusPedido =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'EM_PREPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type FormaPagamento =
  | 'CARTAO_CREDITO'
  | 'PIX'
  | 'WHATSAPP'
  | 'CARTAO_DEBITO'
  | 'BOLETO';
export interface ItemPedido {
  id?: number;
  produtoId: number;
  produtoNome?: string;
  produtoImagemUrl?: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id?: number;
  numeroPedido?: string;
  usuarioId?: number;
  usuarioNome?: string;
  enderecoId?: number;
  enderecoCompleto?: string;
  status: StatusPedido;
  statusDescricao?: string;
  formaPagamento: FormaPagamento;
  formaPagamentoDescricao?: string;
  subtotal: number;
  valorFrete: number;
  valorDesconto: number;
  valorTotal: number;
  observacoes?: string;
  dataPedido?: string;
  itens: ItemPedido[];
}

export interface CriarPedido {
  enderecoId: number;
  formaPagamento: FormaPagamento;
  observacoes?: string;
}
