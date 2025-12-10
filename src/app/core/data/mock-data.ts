/**
 * Dados mockados para desenvolvimento local
 * Substitui chamadas ao backend por dados estáticos
 */

import { User } from '../models/auth.models';
import { LoginResponse, RegisterResponse } from '../models/auth.models';
import { Fornecedor, EnderecoFornecedor } from '../models/fornecedor.model';
import { Categoria } from '../models/categoria.model';
import { Subcategoria } from '../models/subcategoria.model';
import { Segmento } from '../models/segmento.model';
import { Produto, ImagemProduto } from '../models/produto.model';
import { ProdutoAtributo } from '../models/produto-atributo.model';
import { Endereco, TipoEndereco } from '../models/endereco.model';
import { Telefone, TipoTelefone } from '../models/telefone.model';

// ============================================================================
// USUÁRIOS MOCKADOS
// ============================================================================

export interface MockUsuario {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'GESTOR' | 'ADMINISTRATIVO' | 'CLIENTE';
  enderecos: Endereco[];
  telefones: Telefone[];
}

/**
 * Usuários fake para login
 */
export const MOCK_USUARIOS: MockUsuario[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'admin@casasanches.com',
    password: 'admin123',
    role: 'GESTOR',
    enderecos: [
      {
        id: 1,
        usuarioId: 1,
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        numero: '1578',
        complemento: 'Sala 101',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        tipo: TipoEndereco.RESIDENCIAL,
      },
      {
        id: 2,
        usuarioId: 1,
        cep: '01310-200',
        logradouro: 'Rua Augusta',
        numero: '500',
        complemento: 'Loja 2',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        tipo: TipoEndereco.COMERCIAL,
      },
    ],
    telefones: [
      {
        id: 1,
        usuarioId: 1,
        ddd: '11',
        numero: '98765-4321',
        tipo: TipoTelefone.CELULAR,
      },
      {
        id: 2,
        usuarioId: 1,
        ddd: '11',
        numero: '3256-7890',
        tipo: TipoTelefone.COMERCIAL,
      },
    ],
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'cliente@email.com',
    password: 'cliente123',
    role: 'CLIENTE',
    enderecos: [
      {
        id: 3,
        usuarioId: 2,
        cep: '20040-020',
        logradouro: 'Rua do Ouvidor',
        numero: '50',
        complemento: 'Apto 201',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        tipo: TipoEndereco.RESIDENCIAL,
      },
      {
        id: 4,
        usuarioId: 2,
        cep: '20040-030',
        logradouro: 'Avenida Rio Branco',
        numero: '185',
        complemento: '',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        tipo: TipoEndereco.ENTREGA,
      },
    ],
    telefones: [
      {
        id: 3,
        usuarioId: 2,
        ddd: '21',
        numero: '99876-5432',
        tipo: TipoTelefone.CELULAR,
      },
      {
        id: 4,
        usuarioId: 2,
        ddd: '21',
        numero: '2234-5678',
        tipo: TipoTelefone.RESIDENCIAL,
      },
    ],
  },
];

// ============================================================================
// FORNECEDORES MOCKADOS
// ============================================================================

export const MOCK_FORNECEDORES: Fornecedor[] = [
  {
    id: 1,
    nome: 'Fornecedor Premium Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@premium.com.br',
    telefone: '(11) 3456-7890',
    observacoes: 'Fornecedor principal de roupas e acessórios',
    ativo: true,
    enderecos: [
      {
        id: 1,
        logradouro: 'Rua das Flores',
        numero: '100',
        complemento: 'Galpão 1',
        bairro: 'Industrial',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '08000-000',
        tipo: 'MATRIZ',
        ativo: true,
      },
    ],
    dataCriacao: '2024-01-15T10:00:00',
    dataAtualizacao: '2024-01-15T10:00:00',
  },
  {
    id: 2,
    nome: 'Moda Fashion S.A.',
    cnpj: '23.456.789/0001-01',
    email: 'vendas@modafashion.com.br',
    telefone: '(21) 2345-6789',
    observacoes: 'Especializado em roupas femininas',
    ativo: true,
    enderecos: [
      {
        id: 2,
        logradouro: 'Avenida Atlântica',
        numero: '500',
        complemento: '',
        bairro: 'Copacabana',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22010-000',
        tipo: 'MATRIZ',
        ativo: true,
      },
    ],
    dataCriacao: '2024-02-10T14:30:00',
    dataAtualizacao: '2024-02-10T14:30:00',
  },
  {
    id: 3,
    nome: 'Têxtil Nacional',
    cnpj: '34.567.890/0001-12',
    email: 'comercial@textilnacional.com.br',
    telefone: '(31) 3456-7890',
    observacoes: 'Fabricante de tecidos e aviamentos',
    ativo: true,
    enderecos: [
      {
        id: 3,
        logradouro: 'Rua da Indústria',
        numero: '200',
        complemento: 'Setor A',
        bairro: 'Industrial',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30000-000',
        tipo: 'MATRIZ',
        ativo: true,
      },
    ],
    dataCriacao: '2024-03-05T09:15:00',
    dataAtualizacao: '2024-03-05T09:15:00',
  },
  {
    id: 4,
    nome: 'Acessórios Elegantes',
    cnpj: '45.678.901/0001-23',
    email: 'contato@acessorios.com.br',
    telefone: '(41) 4567-8901',
    observacoes: 'Bolsas, cintos e acessórios de couro',
    ativo: true,
    enderecos: [
      {
        id: 4,
        logradouro: 'Rua Comercial',
        numero: '300',
        complemento: 'Loja 5',
        bairro: 'Centro',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '80000-000',
        tipo: 'MATRIZ',
        ativo: true,
      },
    ],
    dataCriacao: '2024-04-20T11:00:00',
    dataAtualizacao: '2024-04-20T11:00:00',
  },
  {
    id: 5,
    nome: 'Papelaria Moderna',
    cnpj: '56.789.012/0001-34',
    email: 'vendas@papelariamoderna.com.br',
    telefone: '(51) 5678-9012',
    observacoes: 'Material escolar e de escritório',
    ativo: true,
    enderecos: [
      {
        id: 5,
        logradouro: 'Avenida dos Estados',
        numero: '400',
        complemento: '',
        bairro: 'Centro',
        cidade: 'Porto Alegre',
        estado: 'RS',
        cep: '90000-000',
        tipo: 'MATRIZ',
        ativo: true,
      },
    ],
    dataCriacao: '2024-05-12T16:45:00',
    dataAtualizacao: '2024-05-12T16:45:00',
  },
  {
    id: 6,
    nome: 'Calçados Conforto',
    cnpj: '67.890.123/0001-45',
    email: 'pedidos@calcados.com.br',
    telefone: '(85) 6789-0123',
    observacoes: 'Calçados masculinos e femininos',
    ativo: true,
    enderecos: [
      {
        id: 6,
        logradouro: 'Rua do Comércio',
        numero: '500',
        complemento: 'Andar 2',
        bairro: 'Aldeota',
        cidade: 'Fortaleza',
        estado: 'CE',
        cep: '60000-000',
        tipo: 'MATRIZ',
        ativo: true,
      },
    ],
    dataCriacao: '2024-06-18T13:20:00',
    dataAtualizacao: '2024-06-18T13:20:00',
  },
];

// ============================================================================
// CATEGORIAS MOCKADAS
// ============================================================================

export const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nome: 'Vestuário',
    descricao: 'Roupas e acessórios de vestuário',
    categoriaPaiId: null,
    ativa: true,
    dataCriacao: '2024-01-10T10:00:00',
    dataAtualizacao: '2024-01-10T10:00:00',
  },
  {
    id: 2,
    nome: 'Calçados',
    descricao: 'Calçados masculinos, femininos e infantis',
    categoriaPaiId: null,
    ativa: true,
    dataCriacao: '2024-01-10T10:00:00',
    dataAtualizacao: '2024-01-10T10:00:00',
  },
  {
    id: 3,
    nome: 'Acessórios',
    descricao: 'Bolsas, cintos, relógios e outros acessórios',
    categoriaPaiId: null,
    ativa: true,
    dataCriacao: '2024-01-10T10:00:00',
    dataAtualizacao: '2024-01-10T10:00:00',
  },
  {
    id: 4,
    nome: 'Papelaria',
    descricao: 'Material escolar e de escritório',
    categoriaPaiId: null,
    ativa: true,
    dataCriacao: '2024-01-10T10:00:00',
    dataAtualizacao: '2024-01-10T10:00:00',
  },
  {
    id: 5,
    nome: 'Casa e Decoração',
    descricao: 'Itens para casa e decoração',
    categoriaPaiId: null,
    ativa: true,
    dataCriacao: '2024-01-10T10:00:00',
    dataAtualizacao: '2024-01-10T10:00:00',
  },
  {
    id: 6,
    nome: 'Eletrônicos',
    descricao: 'Aparelhos eletrônicos e gadgets',
    categoriaPaiId: null,
    ativa: true,
    dataCriacao: '2024-01-10T10:00:00',
    dataAtualizacao: '2024-01-10T10:00:00',
  },
];

// ============================================================================
// SUBCATEGORIAS MOCKADAS
// ============================================================================

export const MOCK_SUBCATEGORIAS: Subcategoria[] = [
  {
    id: 1,
    nome: 'Roupas Masculinas',
    descricao: 'Camisas, calças, bermudas masculinas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 2,
    nome: 'Roupas Femininas',
    descricao: 'Vestidos, blusas, saias femininas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 3,
    nome: 'Calçados Masculinos',
    descricao: 'Sapatos, tênis, sandálias masculinos',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 4,
    nome: 'Calçados Femininos',
    descricao: 'Sapatos, sandálias, botas femininas',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 5,
    nome: 'Bolsas',
    descricao: 'Bolsas femininas e masculinas',
    categoriaId: 3,
    categoriaNome: 'Acessórios',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 6,
    nome: 'Material Escolar',
    descricao: 'Cadernos, canetas, lápis e material escolar',
    categoriaId: 4,
    categoriaNome: 'Papelaria',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 7,
    nome: 'Material de Escritório',
    descricao: 'Papel, pastas, organizadores',
    categoriaId: 4,
    categoriaNome: 'Papelaria',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 8,
    nome: 'Decoração',
    descricao: 'Quadros, vasos, objetos decorativos',
    categoriaId: 5,
    categoriaNome: 'Casa e Decoração',
    ativa: true,
    dataCriacao: new Date('2024-01-15T10:00:00'),
    dataAtualizacao: new Date('2024-01-15T10:00:00'),
  },
];

// ============================================================================
// SEGMENTOS MOCKADOS
// ============================================================================

export const MOCK_SEGMENTOS: Segmento[] = [
  {
    id: 1,
    nome: 'Camisetas',
    descricao: 'Camisetas masculinas',
    subcategoriaId: 1,
    subcategoriaNome: 'Roupas Masculinas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 2,
    nome: 'Calças',
    descricao: 'Calças masculinas',
    subcategoriaId: 1,
    subcategoriaNome: 'Roupas Masculinas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 3,
    nome: 'Blusas',
    descricao: 'Blusas femininas',
    subcategoriaId: 2,
    subcategoriaNome: 'Roupas Femininas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 4,
    nome: 'Vestidos',
    descricao: 'Vestidos femininos',
    subcategoriaId: 2,
    subcategoriaNome: 'Roupas Femininas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 5,
    nome: 'Tênis',
    descricao: 'Tênis esportivos masculinos',
    subcategoriaId: 3,
    subcategoriaNome: 'Calçados Masculinos',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 6,
    nome: 'Sapatos Sociais',
    descricao: 'Sapatos sociais masculinos',
    subcategoriaId: 3,
    subcategoriaNome: 'Calçados Masculinos',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 7,
    nome: 'Sandálias',
    descricao: 'Sandálias femininas',
    subcategoriaId: 4,
    subcategoriaNome: 'Calçados Femininos',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 8,
    nome: 'Bolsas Femininas',
    descricao: 'Bolsas de mão e bolsas femininas',
    subcategoriaId: 5,
    subcategoriaNome: 'Bolsas',
    categoriaId: 3,
    categoriaNome: 'Acessórios',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 9,
    nome: 'Cadernos',
    descricao: 'Cadernos escolares e universitários',
    subcategoriaId: 6,
    subcategoriaNome: 'Material Escolar',
    categoriaId: 4,
    categoriaNome: 'Papelaria',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
  {
    id: 10,
    nome: 'Canetas',
    descricao: 'Canetas esferográficas e canetas',
    subcategoriaId: 6,
    subcategoriaNome: 'Material Escolar',
    categoriaId: 4,
    categoriaNome: 'Papelaria',
    ativa: true,
    dataCriacao: '2024-01-20T10:00:00',
    dataAtualizacao: '2024-01-20T10:00:00',
  },
];

// ============================================================================
// PRODUTOS MOCKADOS
// ============================================================================

export const MOCK_PRODUTOS: Produto[] = [
  {
    id: 1,
    nome: 'Camiseta Básica Masculina',
    descricao: 'Camiseta básica de algodão, confortável e versátil',
    segmentoId: 1,
    segmentoNome: 'Camisetas',
    subcategoriaId: 1,
    subcategoriaNome: 'Roupas Masculinas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    fornecedorId: 1,
    fornecedorNome: 'Fornecedor Premium Ltda',
    custoUnitario: 25.00,
    precoDe: 59.90,
    precoVenda: 49.90,
    estoqueAtual: 50,
    unidadeMedida: 'UNIDADE',
    maisVendido: true,
    ativo: true,
    imagens: [
      {
        url: '/assets/destaque/Blusa_Masc.png',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tamanho', valor: 'G' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Azul' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Algodão' } as ProdutoAtributo,
    ],
  },
  {
    id: 2,
    nome: 'Blusa Feminina Elegante',
    descricao: 'Blusa feminina com design moderno e elegante',
    segmentoId: 3,
    segmentoNome: 'Blusas',
    subcategoriaId: 2,
    subcategoriaNome: 'Roupas Femininas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    fornecedorId: 2,
    fornecedorNome: 'Moda Fashion S.A.',
    custoUnitario: 35.00,
    precoDe: 89.90,
    precoVenda: 69.90,
    estoqueAtual: 30,
    unidadeMedida: 'UNIDADE',
    maisVendido: true,
    ativo: true,
    imagens: [
      {
        url: '/assets/destaque/Blusa_fen.png',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tamanho', valor: 'M' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Rosa' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Viscose' } as ProdutoAtributo,
    ],
  },
  {
    id: 3,
    nome: 'Bolsa Gucci Original',
    descricao: 'Bolsa de luxo da marca Gucci, autêntica e de alta qualidade',
    segmentoId: 8,
    segmentoNome: 'Bolsas Femininas',
    subcategoriaId: 5,
    subcategoriaNome: 'Bolsas',
    categoriaId: 3,
    categoriaNome: 'Acessórios',
    fornecedorId: 4,
    fornecedorNome: 'Acessórios Elegantes',
    custoUnitario: 800.00,
    precoDe: 1999.90,
    precoVenda: 1599.90,
    estoqueAtual: 5,
    unidadeMedida: 'UNIDADE',
    maisVendido: true,
    ativo: true,
    imagens: [
      {
        url: '/assets/destaque/Bolsa_Gucci.png',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Marca', valor: 'Gucci' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Marrom' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Couro Legítimo' } as ProdutoAtributo,
    ],
  },
  {
    id: 4,
    nome: 'Caderno Premium',
    descricao: 'Caderno de alta qualidade, ideal para estudos e trabalho',
    segmentoId: 9,
    segmentoNome: 'Cadernos',
    subcategoriaId: 6,
    subcategoriaNome: 'Material Escolar',
    categoriaId: 4,
    categoriaNome: 'Papelaria',
    fornecedorId: 5,
    fornecedorNome: 'Papelaria Moderna',
    custoUnitario: 8.00,
    precoDe: 29.90,
    precoVenda: 19.90,
    estoqueAtual: 100,
    unidadeMedida: 'UNIDADE',
    ativo: true,
    imagens: [
      {
        url: '/assets/outlet/Caderno-Papelaria.png',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tipo', valor: 'Capa Dura' } as ProdutoAtributo,
      { nome: 'Folhas', valor: '96 páginas' } as ProdutoAtributo,
      { nome: 'Tamanho', valor: 'A5' } as ProdutoAtributo,
    ],
  },
  {
    id: 5,
    nome: 'Tênis Esportivo Masculino',
    descricao: 'Tênis esportivo confortável para corrida e caminhada',
    segmentoId: 5,
    segmentoNome: 'Tênis',
    subcategoriaId: 3,
    subcategoriaNome: 'Calçados Masculinos',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    fornecedorId: 6,
    fornecedorNome: 'Calçados Conforto',
    custoUnitario: 80.00,
    precoDe: 199.90,
    precoVenda: 149.90,
    estoqueAtual: 25,
    unidadeMedida: 'UNIDADE',
    ativo: true,
    imagens: [
      {
        url: '/assets/outlet/mas-1.png',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tamanho', valor: '42' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Preto' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Sintético' } as ProdutoAtributo,
    ],
  },
  {
    id: 6,
    nome: 'Moletom Masculino Premium',
    descricao: 'Moletom masculino de alta qualidade, confortável e quentinho',
    segmentoId: 1,
    segmentoNome: 'Camisetas',
    subcategoriaId: 1,
    subcategoriaNome: 'Roupas Masculinas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    fornecedorId: 1,
    fornecedorNome: 'Fornecedor Premium Ltda',
    custoUnitario: 55.00,
    precoDe: 169.90,
    precoVenda: 119.90,
    estoqueAtual: 18,
    unidadeMedida: 'UNIDADE',
    promocao: true,
    ativo: true,
    imagens: [
      {
        url: '/assets/outlet/mas-2.png',
        principal: true,
        ativa: true,
      },
      {
        url: '/assets/outlet/mas-1.png',
        principal: false,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tamanho', valor: 'G' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Preto' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Algodão' } as ProdutoAtributo,
    ],
  },
  {
    id: 7,
    nome: 'Moletom Feminino Elegante',
    descricao: 'Moletom feminino com design moderno e confortável',
    segmentoId: 3,
    segmentoNome: 'Blusas',
    subcategoriaId: 2,
    subcategoriaNome: 'Roupas Femininas',
    categoriaId: 1,
    categoriaNome: 'Vestuário',
    fornecedorId: 2,
    fornecedorNome: 'Moda Fashion S.A.',
    custoUnitario: 50.00,
    precoDe: 159.90,
    precoVenda: 109.90,
    estoqueAtual: 15,
    unidadeMedida: 'UNIDADE',
    promocao: true,
    ativo: true,
    imagens: [
      {
        url: '/assets/outlet/femi-1.jpg',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tamanho', valor: 'M' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Rosa' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Algodão' } as ProdutoAtributo,
    ],
  },
  {
    id: 8,
    nome: 'Sapato Social Masculino',
    descricao: 'Sapato social clássico, elegante e confortável',
    segmentoId: 6,
    segmentoNome: 'Sapatos Sociais',
    subcategoriaId: 3,
    subcategoriaNome: 'Calçados Masculinos',
    categoriaId: 2,
    categoriaNome: 'Calçados',
    fornecedorId: 6,
    fornecedorNome: 'Calçados Conforto',
    custoUnitario: 120.00,
    precoDe: 299.90,
    precoVenda: 229.90,
    estoqueAtual: 12,
    unidadeMedida: 'UNIDADE',
    ativo: true,
    imagens: [
      {
        url: '/assets/destaque/Inverno.png',
        principal: true,
        ativa: true,
      },
    ],
    atributos: [
      { nome: 'Tamanho', valor: '41' } as ProdutoAtributo,
      { nome: 'Cor', valor: 'Preto' } as ProdutoAtributo,
      { nome: 'Material', valor: 'Couro' } as ProdutoAtributo,
    ],
  },
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Gera um token JWT fake (apenas para desenvolvimento)
 */
export function gerarTokenFake(email: string, role: string): string {
  // Token fake - apenas para desenvolvimento local
  const payload = {
    email,
    role,
    exp: Date.now() + 86400000, // Expira em 24 horas
  };
  return `fake_token_${btoa(JSON.stringify(payload))}`;
}

/**
 * Busca usuário mockado por email e senha
 */
export function buscarUsuarioMockado(
  email: string,
  password: string
): MockUsuario | null {
  return (
    MOCK_USUARIOS.find(
      (u) => u.email === email && u.password === password
    ) || null
  );
}

/**
 * Busca usuário mockado por ID
 */
export function buscarUsuarioPorId(id: number): MockUsuario | null {
  return MOCK_USUARIOS.find((u) => u.id === id) || null;
}

