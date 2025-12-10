/**
 * Enum para tipos de endereço
 */
export enum TipoEndereco {
  ENTREGA = 'ENTREGA',
  COBRANCA = 'COBRANCA',
  RESIDENCIAL = 'RESIDENCIAL',
  COMERCIAL = 'COMERCIAL'
}

/**
 * Interface que representa um Endereço
 */
export interface Endereco {
  id?: number;
  usuarioId?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipo: TipoEndereco;
}

