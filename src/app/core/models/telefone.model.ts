/**
 * Enum para tipos de telefone
 */
export enum TipoTelefone {
  CELULAR = 'CELULAR',
  RESIDENCIAL = 'RESIDENCIAL',
  COMERCIAL = 'COMERCIAL'
}

/**
 * Interface que representa um Telefone
 */
export interface Telefone {
  id?: number;
  usuarioId?: number;
  ddd: string;
  numero: string;
  tipo: TipoTelefone;
}

