export interface EnderecoFornecedor {
  id?: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'MATRIZ' | 'FILIAL' | 'DEPOSITO';
  ativo?: boolean;
}

export interface Fornecedor {
  id?: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  observacoes?: string;
  ativo?: boolean;
  enderecos?: EnderecoFornecedor[];
  dataCriacao?: string;
  dataAtualizacao?: string;
}

