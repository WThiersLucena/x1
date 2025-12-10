import { Component, OnInit } from '@angular/core';
import {
  CarouselComponent,
  CarouselItem,
} from '../../shared/carousel/carousel.component';
import { HeroCarouselComponent } from '../../shared/hero-carousel/hero-carousel.component';
import { ProductDetailModalComponent } from '../../shared/product-detail-modal/product-detail-modal.component';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CarouselComponent,
    HeroCarouselComponent,
    ProductDetailModalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePageComponent implements OnInit {
  maisVendidos: CarouselItem[] = [];
  produtosCompletos: Produto[] = []; // Armazenar produtos completos
  produtoSelecionado: Produto | null = null;
  mostrarModal = false;
  heroSlides: { imageUrl: string; title: string; description?: string }[] = [];
  stationery: CarouselItem[] = [];

  outlet: CarouselItem[] = [];
  outletModelo2: CarouselItem[] = [];

  ngOnInit(): void {
    this.carregarDadosMockados();
  }

  /**
   * Carrega todos os dados mockados estáticos
   */
  private carregarDadosMockados(): void {
    // Carregar hero slides (carrossel de destaques)
    this.heroSlides = [
      {
        imageUrl: '/assets/novidades/Destaque-1.webp',
        title: 'Coleção de Inverno',
        description: 'Novidades quentinhas para você',
      },
      {
        imageUrl: '/assets/destaque/Blusa_Masc.png',
        title: 'Blusa Masculina',
        description: 'Estilo e conforto',
      },
      {
        imageUrl: '/assets/destaque/Blusa_fen.png',
        title: 'Blusa Feminina',
        description: 'Elegância e sofisticação',
      },
      {
        imageUrl: '/assets/destaque/Bolsa_Gucci.png',
        title: 'Bolsa Gucci',
        description: 'Luxo e qualidade',
      },
    ];

    // Carregar Mais Vendidos (assets/destaque)
    this.carregarMaisVendidos();

    // Carregar Outlet - Modelo 1 (assets/destaque)
    this.carregarOutletModelo1();

    // Carregar Outlet - Modelo 2 (assets/outlet)
    this.carregarOutletModelo2();

    // Carregar Papelaria (assets/outlet)
    this.carregarPapelaria();
  }

  /**
   * Carrega dados mockados para Mais Vendidos usando assets/destaque
   */
  private carregarMaisVendidos(): void {
    const produtosMockados: Produto[] = [
      {
        id: 1,
        nome: 'Blusa Masculina Premium',
        descricao:
          'Blusa masculina de alta qualidade, confortável e estilosa. Perfeita para o dia a dia.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 50,
        precoDe: 149.9,
        precoVenda: 119.9,
        estoqueAtual: 15,
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
          { nome: 'Tamanho', valor: 'G' },
          { nome: 'Cor', valor: 'Azul' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 2,
        nome: 'Blusa Feminina Elegante',
        descricao:
          'Blusa feminina com design elegante e moderno. Ideal para ocasiões especiais.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 45,
        precoDe: 139.9,
        precoVenda: 109.9,
        estoqueAtual: 20,
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
          { nome: 'Tamanho', valor: 'M' },
          { nome: 'Cor', valor: 'Rosa' },
          { nome: 'Material', valor: 'Viscose' },
        ],
      },
      {
        id: 3,
        nome: 'Bolsa Gucci Original',
        descricao:
          'Bolsa de luxo da marca Gucci, autêntica e de alta qualidade. Um acessório indispensável.',
        segmentoId: 2,
        segmentoNome: 'Acessórios',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 800,
        precoDe: 1999.9,
        precoVenda: 1599.9,
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
          { nome: 'Marca', valor: 'Gucci' },
          { nome: 'Cor', valor: 'Marrom' },
          { nome: 'Material', valor: 'Couro Legítimo' },
        ],
      },
      {
        id: 4,
        nome: 'Coleção de Inverno',
        descricao:
          'Peças especiais da coleção de inverno. Conforto e estilo para os dias mais frios.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 60,
        precoDe: 179.9,
        precoVenda: 139.9,
        estoqueAtual: 12,
        unidadeMedida: 'UNIDADE',
        maisVendido: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Inverno.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Coleção', valor: 'Inverno 2024' },
          { nome: 'Material', valor: 'Lã' },
        ],
      },
      {
        id: 5,
        nome: 'Blusa Masculina Clássica',
        descricao:
          'Blusa masculina clássica, versátil e confortável. Perfeita para qualquer ocasião.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 48,
        precoDe: 144.9,
        precoVenda: 114.9,
        estoqueAtual: 18,
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
          { nome: 'Tamanho', valor: 'M' },
          { nome: 'Cor', valor: 'Branco' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 6,
        nome: 'Blusa Feminina Moderna',
        descricao:
          'Blusa feminina com design moderno e contemporâneo. Estilo e elegância.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 47,
        precoDe: 134.9,
        precoVenda: 104.9,
        estoqueAtual: 22,
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
          { nome: 'Tamanho', valor: 'P' },
          { nome: 'Cor', valor: 'Preto' },
          { nome: 'Material', valor: 'Viscose' },
        ],
      },
      {
        id: 7,
        nome: 'Bolsa Gucci Premium',
        descricao:
          'Bolsa Gucci premium, autêntica e exclusiva. Um acessório de luxo para quem busca qualidade.',
        segmentoId: 2,
        segmentoNome: 'Acessórios',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 850,
        precoDe: 2099.9,
        precoVenda: 1699.9,
        estoqueAtual: 4,
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
          { nome: 'Marca', valor: 'Gucci' },
          { nome: 'Cor', valor: 'Preto' },
          { nome: 'Material', valor: 'Couro Legítimo' },
        ],
      },
    ];

    // Armazenar produtos completos
    this.produtosCompletos = [...this.produtosCompletos, ...produtosMockados];

    // Converter para CarouselItem
    this.maisVendidos = produtosMockados.map((produto) =>
      this.converterProdutoParaCarouselItem(produto)
    );
  }

  /**
   * Carrega dados mockados para Outlet - Modelo 1 usando assets/destaque
   */
  private carregarOutletModelo1(): void {
    const produtosOutlet1: Produto[] = [
      {
        id: 5,
        nome: 'Blusa Masculina - Outlet',
        descricao: 'Blusa masculina em promoção. Aproveite!',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 40,
        precoDe: 149.9,
        precoVenda: 89.9,
        estoqueAtual: 8,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Blusa_Masc.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'P' },
          { nome: 'Cor', valor: 'Azul' },
        ],
      },
      {
        id: 6,
        nome: 'Blusa Feminina - Outlet',
        descricao: 'Blusa feminina em promoção. Estoque limitado!',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 35,
        precoDe: 139.9,
        precoVenda: 79.9,
        estoqueAtual: 10,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Blusa_fen.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'M' },
          { nome: 'Cor', valor: 'Rosa' },
        ],
      },
      {
        id: 7,
        nome: 'Bolsa Gucci - Outlet',
        descricao: 'Bolsa Gucci em promoção especial. Não perca!',
        segmentoId: 2,
        segmentoNome: 'Acessórios',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 700,
        precoDe: 1999.9,
        precoVenda: 1299.9,
        estoqueAtual: 3,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Bolsa_Gucci.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Marca', valor: 'Gucci' },
          { nome: 'Cor', valor: 'Marrom' },
        ],
      },
      {
        id: 8,
        nome: 'Coleção Inverno - Outlet',
        descricao: 'Peças da coleção de inverno em promoção.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 50,
        precoDe: 179.9,
        precoVenda: 99.9,
        estoqueAtual: 6,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Inverno.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [{ nome: 'Coleção', valor: 'Inverno 2024' }],
      },
      {
        id: 9,
        nome: 'Blusa Masculina - Outlet Especial',
        descricao: 'Blusa masculina em promoção especial. Aproveite!',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 38,
        precoDe: 144.9,
        precoVenda: 84.9,
        estoqueAtual: 7,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Blusa_Masc.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'GG' },
          { nome: 'Cor', valor: 'Azul' },
        ],
      },
      {
        id: 10,
        nome: 'Blusa Feminina - Outlet Especial',
        descricao: 'Blusa feminina em promoção especial. Estoque limitado!',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 33,
        precoDe: 134.9,
        precoVenda: 74.9,
        estoqueAtual: 9,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Blusa_fen.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'G' },
          { nome: 'Cor', valor: 'Rosa' },
        ],
      },
      {
        id: 11,
        nome: 'Bolsa Gucci - Outlet Premium',
        descricao: 'Bolsa Gucci em promoção premium. Não perca!',
        segmentoId: 2,
        segmentoNome: 'Acessórios',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 680,
        precoDe: 1899.9,
        precoVenda: 1199.9,
        estoqueAtual: 2,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/destaque/Bolsa_Gucci.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Marca', valor: 'Gucci' },
          { nome: 'Cor', valor: 'Preto' },
        ],
      },
    ];

    // Armazenar produtos completos
    this.produtosCompletos = [...this.produtosCompletos, ...produtosOutlet1];

    // Converter para CarouselItem
    this.outlet = produtosOutlet1.map((produto) =>
      this.converterProdutoParaCarouselItem(produto)
    );
  }

  /**
   * Carrega dados mockados para Outlet - Modelo 2 usando assets/outlet
   */
  private carregarOutletModelo2(): void {
    const produtosOutlet2: Produto[] = [
      {
        id: 9,
        nome: 'Moletom Masculino Premium',
        descricao:
          'Moletom masculino de alta qualidade, confortável e quentinho.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 55,
        precoDe: 169.9,
        precoVenda: 119.9,
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
          { nome: 'Tamanho', valor: 'G' },
          { nome: 'Cor', valor: 'Preto' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 10,
        nome: 'Moletom Feminino Elegante',
        descricao: 'Moletom feminino com design moderno e confortável.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 50,
        precoDe: 159.9,
        precoVenda: 109.9,
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
          { nome: 'Tamanho', valor: 'M' },
          { nome: 'Cor', valor: 'Rosa' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 17,
        nome: 'Moletom Masculino Clássico',
        descricao: 'Moletom masculino clássico, versátil e confortável.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 52,
        precoDe: 165.9,
        precoVenda: 115.9,
        estoqueAtual: 12,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/outlet/mas-1.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'GG' },
          { nome: 'Cor', valor: 'Cinza' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 18,
        nome: 'Moletom Masculino Esportivo',
        descricao:
          'Moletom masculino esportivo, ideal para atividades físicas.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 54,
        precoDe: 169.9,
        precoVenda: 119.9,
        estoqueAtual: 14,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/outlet/mas-2.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'M' },
          { nome: 'Cor', valor: 'Azul' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 19,
        nome: 'Moletom Feminino Casual',
        descricao: 'Moletom feminino casual, confortável para o dia a dia.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 48,
        precoDe: 154.9,
        precoVenda: 104.9,
        estoqueAtual: 16,
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
          { nome: 'Tamanho', valor: 'P' },
          { nome: 'Cor', valor: 'Rosa' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 20,
        nome: 'Moletom Masculino Premium Plus',
        descricao: 'Moletom masculino premium, máxima qualidade e conforto.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 58,
        precoDe: 174.9,
        precoVenda: 124.9,
        estoqueAtual: 10,
        unidadeMedida: 'UNIDADE',
        promocao: true,
        ativo: true,
        imagens: [
          {
            url: '/assets/outlet/mas-1.png',
            principal: true,
            ativa: true,
          },
        ],
        atributos: [
          { nome: 'Tamanho', valor: 'XL' },
          { nome: 'Cor', valor: 'Preto' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
      {
        id: 28,
        nome: 'Moletom Feminino Premium',
        descricao: 'Moletom feminino premium, elegante e confortável.',
        segmentoId: 1,
        segmentoNome: 'Vestuário',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 53,
        precoDe: 164.9,
        precoVenda: 114.9,
        estoqueAtual: 13,
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
          { nome: 'Tamanho', valor: 'G' },
          { nome: 'Cor', valor: 'Branco' },
          { nome: 'Material', valor: 'Algodão' },
        ],
      },
    ];

    // Armazenar produtos completos
    this.produtosCompletos = [...this.produtosCompletos, ...produtosOutlet2];

    // Converter para CarouselItem
    this.outletModelo2 = produtosOutlet2.map((produto) =>
      this.converterProdutoParaCarouselItem(produto)
    );
  }

  /**
   * Carrega dados mockados para Papelaria usando assets/outlet
   */
  private carregarPapelaria(): void {
    const produtosPapelaria: Produto[] = [
      {
        id: 21,
        nome: 'Caderno Premium',
        descricao:
          'Caderno de alta qualidade, ideal para estudos e trabalho. Capa dura e folhas pautadas.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 8,
        precoDe: 29.9,
        precoVenda: 19.9,
        estoqueAtual: 50,
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
          { nome: 'Tipo', valor: 'Capa Dura' },
          { nome: 'Folhas', valor: '96 páginas' },
          { nome: 'Tamanho', valor: 'A5' },
        ],
      },
      {
        id: 22,
        nome: 'Caderno Escolar',
        descricao:
          'Caderno escolar com capa colorida, perfeito para estudantes.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 7,
        precoDe: 24.9,
        precoVenda: 16.9,
        estoqueAtual: 45,
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
          { nome: 'Tipo', valor: 'Capa Mole' },
          { nome: 'Folhas', valor: '80 páginas' },
          { nome: 'Tamanho', valor: 'A4' },
        ],
      },
      {
        id: 23,
        nome: 'Caderno Executivo',
        descricao:
          'Caderno executivo para profissionais, com acabamento premium.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 12,
        precoDe: 39.9,
        precoVenda: 24.9,
        estoqueAtual: 30,
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
          { nome: 'Tipo', valor: 'Capa Dura Executiva' },
          { nome: 'Folhas', valor: '120 páginas' },
          { nome: 'Tamanho', valor: 'A4' },
        ],
      },
      {
        id: 24,
        nome: 'Caderno Universitário',
        descricao:
          'Caderno universitário com divisórias, ideal para organizar matérias.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 10,
        precoDe: 34.9,
        precoVenda: 21.9,
        estoqueAtual: 35,
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
          { nome: 'Tipo', valor: 'Com Divisórias' },
          { nome: 'Folhas', valor: '100 páginas' },
          { nome: 'Tamanho', valor: 'A4' },
        ],
      },
      {
        id: 25,
        nome: 'Caderno Espiral',
        descricao:
          'Caderno espiral com capa personalizada, prático e funcional.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 9,
        precoDe: 27.9,
        precoVenda: 18.9,
        estoqueAtual: 40,
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
          { nome: 'Tipo', valor: 'Espiral' },
          { nome: 'Folhas', valor: '90 páginas' },
          { nome: 'Tamanho', valor: 'A5' },
        ],
      },
      {
        id: 26,
        nome: 'Caderno de Desenho',
        descricao:
          'Caderno de desenho com folhas especiais para arte e criação.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 15,
        precoDe: 44.9,
        precoVenda: 29.9,
        estoqueAtual: 25,
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
          { nome: 'Tipo', valor: 'Papel Especial' },
          { nome: 'Folhas', valor: '50 páginas' },
          { nome: 'Tamanho', valor: 'A4' },
        ],
      },
      {
        id: 27,
        nome: 'Caderno Personalizado',
        descricao:
          'Caderno personalizado com capa exclusiva, ideal para presentes.',
        segmentoId: 3,
        segmentoNome: 'Papelaria',
        fornecedorId: 1,
        fornecedorNome: 'Casa Sanches',
        custoUnitario: 11,
        precoDe: 37.9,
        precoVenda: 23.9,
        estoqueAtual: 28,
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
          { nome: 'Tipo', valor: 'Capa Personalizada' },
          { nome: 'Folhas', valor: '110 páginas' },
          { nome: 'Tamanho', valor: 'A5' },
        ],
      },
    ];

    // Armazenar produtos completos
    this.produtosCompletos = [...this.produtosCompletos, ...produtosPapelaria];

    // Converter para CarouselItem
    this.stationery = produtosPapelaria.map((produto) =>
      this.converterProdutoParaCarouselItem(produto)
    );
  }

  /**
   * Converte um Produto para CarouselItem
   */
  private converterProdutoParaCarouselItem(produto: Produto): CarouselItem {
    // Obter URL da imagem principal ou primeira imagem disponível
    let imageUrl = '/assets/logo/Logo-Thiers.png'; // Imagem padrão
    if (produto.imagens && produto.imagens.length > 0) {
      const imagemPrincipal =
        produto.imagens.find((img) => img.principal === true) ||
        produto.imagens[0];
      if (imagemPrincipal && imagemPrincipal.url) {
        imageUrl = imagemPrincipal.url;
      }
    }

    // Formatar preço
    const precoVenda = produto.precoVenda || 0;
    const precoDe = produto.precoDe;

    const formatarPreco = (valor: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    };

    return {
      id: produto.id || 0,
      title: produto.nome,
      imageUrl: imageUrl,
      price: formatarPreco(precoVenda),
      previousPrice:
        precoDe && precoDe > precoVenda ? formatarPreco(precoDe) : undefined,
      produtoCompleto: produto, // Incluir produto completo
    };
  }

  abrirModalDetalhes(item: CarouselItem): void {
    // Buscar produto completo pelo ID
    const produto = this.produtosCompletos.find((p) => p.id === item.id);
    if (produto) {
      this.produtoSelecionado = produto;
      this.mostrarModal = true;
    } else if (item.produtoCompleto) {
      // Se o produto completo já estiver no item
      this.produtoSelecionado = item.produtoCompleto;
      this.mostrarModal = true;
    }
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.produtoSelecionado = null;
  }
}
