import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface IndicadoresVendas {
  receitaTotal: number;
  receitaAnterior: number;
  variacaoReceita: number;
  totalPedidos: number;
  pedidosAnterior: number;
  variacaoPedidos: number;
  ticketMedio: number;
  ticketMedioAnterior: number;
  variacaoTicketMedio: number;
  pedidosPendentes: number;
  taxaConversao: number;
  taxaConversaoAnterior: number;
  variacaoConversao: number;
  pedidosPorStatus: {
    status: string;
    quantidade: number;
    percentual: number;
  }[];
  pedidosPorFormaPagamento: {
    formaPagamento: string;
    quantidade: number;
    valorTotal: number;
    percentual: number;
  }[];
  evolucaoVendas: {
    data: string;
    receita: number;
    pedidos: number;
  }[];
  maiorPedido: {
    id: number;
    numeroPedido: string;
    valorTotal: number;
    clienteNome: string;
    dataPedido: string;
  } | null;
  menorPedido: {
    id: number;
    numeroPedido: string;
    valorTotal: number;
    clienteNome: string;
    dataPedido: string;
  } | null;
  vendasPorDiaSemana: {
    diaSemana: string;
    quantidade: number;
    receita: number;
  }[];
  taxaCancelamento: number;
  valorPerdidoCancelamentos: number;
}

export interface IndicadoresProdutos {
  totalProdutos: number;
  produtosAtivos: number;
  produtosInativos: number;
  produtosSemEstoque: number;
  produtosEstoqueBaixo: number;
  topProdutosQuantidade: {
    id: number;
    nome: string;
    quantidadeVendida: number;
    receitaGerada: number;
  }[];
  topProdutosReceita: {
    id: number;
    nome: string;
    receitaTotal: number;
    quantidadeVendida: number;
  }[];
  vendasPorCategoria: {
    categoriaId: number;
    categoriaNome: string;
    quantidadeVendida: number;
    receitaGerada: number;
    percentual: number;
  }[];
  produtosDestaque: {
    quantidade: number;
    receitaGerada: number;
    taxaConversao: number;
  };
  produtosMaisVendidos: {
    quantidade: number;
    receitaGerada: number;
    taxaConversao: number;
  };
  produtosMaiorMargem: {
    id: number;
    nome: string;
    margemLucro: number;
    lucroAbsoluto: number;
  }[];
  produtosMenorMargem: {
    id: number;
    nome: string;
    margemLucro: number;
    lucroAbsoluto: number;
  }[];
  faixaPrecoMaisVendida: {
    faixa: string;
    quantidade: number;
    receita: number;
  }[];
}

export interface IndicadoresClientes {
  totalClientes: number;
  novosClientes: number;
  clientesAtivos: number;
  clientesInativos: number;
  taxaNovosClientes: number;
  clientesVIP: {
    id: number;
    nome: string;
    email: string;
    totalCompras: number;
    valorTotalGasto: number;
    ticketMedio: number;
  }[];
  frequenciaCompraMedia: number;
  ticketMedioCliente: number;
  ltvMedio: number;
  vendasPorEstado: {
    estado: string;
    quantidade: number;
    receita: number;
  }[];
  topCidades: {
    cidade: string;
    estado: string;
    quantidade: number;
    receita: number;
  }[];
  taxaAbandonoCarrinho: number;
  valorCarrinhosAbandonados: number;
  tempoMedioCarrinho: number;
  produtosMaisAbandonados: {
    produtoId: number;
    produtoNome: string;
    quantidadeAbandonada: number;
  }[];
}

export interface IndicadoresEstoque {
  valorTotalEstoque: number;
  quantidadeTotalItens: number;
  produtosSemEstoque: number;
  produtosEstoqueBaixo: number;
  produtosEstoqueAlto: number;
  rotatividadeMedia: number;
  giroEstoque: number;
  tempoMedioEstoque: number;
  produtosMaisEstocados: {
    id: number;
    nome: string;
    quantidadeEstoque: number;
    valorEstoque: number;
  }[];
  produtosMenosEstocados: {
    id: number;
    nome: string;
    quantidadeEstoque: number;
    valorEstoque: number;
  }[];
  estoquePorCategoria: {
    categoriaId: number;
    categoriaNome: string;
    quantidadeTotal: number;
    valorTotal: number;
    percentual: number;
  }[];
  movimentacaoEstoque: {
    data: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }[];
  produtosCriticos: {
    id: number;
    nome: string;
    quantidadeAtual: number;
    quantidadeMinima: number;
    diasRestantes: number;
  }[];
  previsaoReposicao: {
    produtoId: number;
    produtoNome: string;
    diasParaReposicao: number;
    quantidadeNecessaria: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/dashboard';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Busca indicadores de vendas
   * @param dataInicio Data de início do período (opcional)
   * @param dataFim Data de fim do período (opcional)
   */
  obterIndicadoresVendas(
    dataInicio?: string,
    dataFim?: string
  ): Observable<IndicadoresVendas> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http.get<IndicadoresVendas>(`${this.baseUrl}/vendas`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(() => {
        console.warn('⚠️ Backend não disponível, usando dados mockados de vendas');
        return of(this.obterIndicadoresVendasMockados()).pipe(delay(300));
      })
    );
  }

  /**
   * Dados mockados de indicadores de vendas
   */
  private obterIndicadoresVendasMockados(): IndicadoresVendas {
    const hoje = new Date();
    const diasAtras = Array.from({ length: 30 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (29 - i));
      return data.toISOString().split('T')[0];
    });

    return {
      receitaTotal: 125450.75,
      receitaAnterior: 98750.50,
      variacaoReceita: 27.02,
      totalPedidos: 342,
      pedidosAnterior: 298,
      variacaoPedidos: 14.77,
      ticketMedio: 366.52,
      ticketMedioAnterior: 331.38,
      variacaoTicketMedio: 10.60,
      pedidosPendentes: 23,
      taxaConversao: 3.45,
      taxaConversaoAnterior: 3.12,
      variacaoConversao: 10.58,
      pedidosPorStatus: [
        { status: 'CONFIRMADO', quantidade: 145, percentual: 42.40 },
        { status: 'EM_PREPARACAO', quantidade: 67, percentual: 19.59 },
        { status: 'ENVIADO', quantidade: 89, percentual: 26.02 },
        { status: 'ENTREGUE', quantidade: 38, percentual: 11.11 },
        { status: 'PENDENTE', quantidade: 3, percentual: 0.88 },
      ],
      pedidosPorFormaPagamento: [
        { formaPagamento: 'PIX', quantidade: 156, valorTotal: 48950.00, percentual: 45.61 },
        { formaPagamento: 'CARTAO_CREDITO', quantidade: 98, valorTotal: 41230.50, percentual: 28.65 },
        { formaPagamento: 'WHATSAPP', quantidade: 67, valorTotal: 25180.25, percentual: 19.59 },
        { formaPagamento: 'CARTAO_DEBITO', quantidade: 18, valorTotal: 8950.00, percentual: 5.26 },
        { formaPagamento: 'BOLETO', quantidade: 3, valorTotal: 1140.00, percentual: 0.88 },
      ],
      evolucaoVendas: diasAtras.map((data, index) => ({
        data,
        receita: Math.floor(Math.random() * 8000) + 2000,
        pedidos: Math.floor(Math.random() * 15) + 5,
      })),
      maiorPedido: {
        id: 1001,
        numeroPedido: 'PED-2024-1001',
        valorTotal: 2450.00,
        clienteNome: 'Maria Silva',
        dataPedido: hoje.toISOString().split('T')[0],
      },
      menorPedido: {
        id: 1002,
        numeroPedido: 'PED-2024-1002',
        valorTotal: 45.90,
        clienteNome: 'João Santos',
        dataPedido: hoje.toISOString().split('T')[0],
      },
      vendasPorDiaSemana: [
        { diaSemana: 'Segunda', quantidade: 42, receita: 15230.50 },
        { diaSemana: 'Terça', quantidade: 51, receita: 18750.25 },
        { diaSemana: 'Quarta', quantidade: 48, receita: 17680.00 },
        { diaSemana: 'Quinta', quantidade: 55, receita: 20150.75 },
        { diaSemana: 'Sexta', quantidade: 62, receita: 22890.00 },
        { diaSemana: 'Sábado', quantidade: 58, receita: 21340.25 },
        { diaSemana: 'Domingo', quantidade: 26, receita: 9509.00 },
      ],
      taxaCancelamento: 2.34,
      valorPerdidoCancelamentos: 2935.50,
    };
  }

  /**
   * Busca indicadores de produtos
   * @param dataInicio Data de início do período (opcional)
   * @param dataFim Data de fim do período (opcional)
   */
  obterIndicadoresProdutos(
    dataInicio?: string,
    dataFim?: string
  ): Observable<IndicadoresProdutos> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http.get<IndicadoresProdutos>(`${this.baseUrl}/produtos`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(() => {
        console.warn('⚠️ Backend não disponível, usando dados mockados de produtos');
        return of(this.obterIndicadoresProdutosMockados()).pipe(delay(300));
      })
    );
  }

  /**
   * Dados mockados de indicadores de produtos
   */
  private obterIndicadoresProdutosMockados(): IndicadoresProdutos {
    return {
      totalProdutos: 487,
      produtosAtivos: 412,
      produtosInativos: 75,
      produtosSemEstoque: 23,
      produtosEstoqueBaixo: 45,
      topProdutosQuantidade: [
        { id: 1, nome: 'Notebook Gamer X1', quantidadeVendida: 234, receitaGerada: 234000.00 },
        { id: 2, nome: 'Mouse Sem Fio Pro', quantidadeVendida: 189, receitaGerada: 28350.00 },
        { id: 3, nome: 'Teclado Mecânico RGB', quantidadeVendida: 156, receitaGerada: 46800.00 },
        { id: 4, nome: 'Monitor 27" 4K', quantidadeVendida: 142, receitaGerada: 142000.00 },
        { id: 5, nome: 'Headset Gamer 7.1', quantidadeVendida: 128, receitaGerada: 25600.00 },
      ],
      topProdutosReceita: [
        { id: 1, nome: 'Notebook Gamer X1', receitaTotal: 234000.00, quantidadeVendida: 234 },
        { id: 4, nome: 'Monitor 27" 4K', receitaTotal: 142000.00, quantidadeVendida: 142 },
        { id: 6, nome: 'Placa de Vídeo RTX 4080', receitaTotal: 89500.00, quantidadeVendida: 45 },
        { id: 7, nome: 'SSD 1TB NVMe', receitaTotal: 67800.00, quantidadeVendida: 113 },
        { id: 8, nome: 'Memória RAM 32GB DDR5', receitaTotal: 56200.00, quantidadeVendida: 94 },
      ],
      vendasPorCategoria: [
        { categoriaId: 1, categoriaNome: 'Notebooks', quantidadeVendida: 234, receitaGerada: 234000.00, percentual: 35.2 },
        { categoriaId: 2, categoriaNome: 'Periféricos', quantidadeVendida: 473, receitaGerada: 100750.00, percentual: 15.1 },
        { categoriaId: 3, categoriaNome: 'Monitores', quantidadeVendida: 142, receitaGerada: 142000.00, percentual: 21.3 },
        { categoriaId: 4, categoriaNome: 'Componentes', quantidadeVendida: 252, receitaGerada: 213500.00, percentual: 32.0 },
        { categoriaId: 5, categoriaNome: 'Acessórios', quantidadeVendida: 89, receitaGerada: 17800.00, percentual: 2.7 },
      ],
      produtosDestaque: {
        quantidade: 12,
        receitaGerada: 125450.75,
        taxaConversao: 8.45,
      },
      produtosMaisVendidos: {
        quantidade: 234,
        receitaGerada: 234000.00,
        taxaConversao: 12.34,
      },
      produtosMaiorMargem: [
        { id: 1, nome: 'Notebook Gamer X1', margemLucro: 45.5, lucroAbsoluto: 106530.00 },
        { id: 6, nome: 'Placa de Vídeo RTX 4080', margemLucro: 42.3, lucroAbsoluto: 37858.50 },
        { id: 4, nome: 'Monitor 27" 4K', margemLucro: 38.7, lucroAbsoluto: 54954.00 },
        { id: 8, nome: 'Memória RAM 32GB DDR5', margemLucro: 35.2, lucroAbsoluto: 19782.40 },
        { id: 7, nome: 'SSD 1TB NVMe', margemLucro: 32.8, lucroAbsoluto: 22238.40 },
      ],
      produtosMenorMargem: [
        { id: 15, nome: 'Cabo USB-C', margemLucro: 8.5, lucroAbsoluto: 425.00 },
        { id: 16, nome: 'Adaptador HDMI', margemLucro: 9.2, lucroAbsoluto: 552.00 },
        { id: 17, nome: 'Protetor de Tela', margemLucro: 10.1, lucroAbsoluto: 303.00 },
        { id: 18, nome: 'Cabo de Rede', margemLucro: 11.3, lucroAbsoluto: 565.00 },
        { id: 19, nome: 'Hub USB', margemLucro: 12.5, lucroAbsoluto: 1250.00 },
      ],
      faixaPrecoMaisVendida: [
        { faixa: 'R$ 0 - R$ 100', quantidade: 156, receita: 12480.00 },
        { faixa: 'R$ 100 - R$ 500', quantidade: 234, receita: 58500.00 },
        { faixa: 'R$ 500 - R$ 1.000', quantidade: 189, receita: 141750.00 },
        { faixa: 'R$ 1.000 - R$ 2.000', quantidade: 142, receita: 213000.00 },
        { faixa: 'R$ 2.000+', quantidade: 67, receita: 201000.00 },
      ],
    };
  }

  /**
   * Busca indicadores de clientes
   * @param dataInicio Data de início do período (opcional)
   * @param dataFim Data de fim do período (opcional)
   */
  obterIndicadoresClientes(
    dataInicio?: string,
    dataFim?: string
  ): Observable<IndicadoresClientes> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http.get<IndicadoresClientes>(`${this.baseUrl}/clientes`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(() => {
        console.warn('⚠️ Backend não disponível, usando dados mockados de clientes');
        return of(this.obterIndicadoresClientesMockados()).pipe(delay(300));
      })
    );
  }

  /**
   * Dados mockados de indicadores de clientes
   */
  private obterIndicadoresClientesMockados(): IndicadoresClientes {
    return {
      totalClientes: 1247,
      novosClientes: 89,
      clientesAtivos: 856,
      clientesInativos: 391,
      taxaNovosClientes: 7.14,
      clientesVIP: [
        { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', totalCompras: 45, valorTotalGasto: 125450.75, ticketMedio: 2787.79 },
        { id: 2, nome: 'João Santos', email: 'joao.santos@email.com', totalCompras: 38, valorTotalGasto: 98750.50, ticketMedio: 2598.70 },
        { id: 3, nome: 'Ana Costa', email: 'ana.costa@email.com', totalCompras: 32, valorTotalGasto: 87650.25, ticketMedio: 2739.07 },
        { id: 4, nome: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', totalCompras: 28, valorTotalGasto: 76540.00, ticketMedio: 2733.57 },
        { id: 5, nome: 'Carla Mendes', email: 'carla.mendes@email.com', totalCompras: 25, valorTotalGasto: 65430.75, ticketMedio: 2617.23 },
      ],
      frequenciaCompraMedia: 2.34,
      ticketMedioCliente: 366.52,
      ltvMedio: 1254.50,
      vendasPorEstado: [
        { estado: 'SP', quantidade: 456, receita: 167890.50 },
        { estado: 'RJ', quantidade: 234, receita: 85670.25 },
        { estado: 'MG', quantidade: 189, receita: 69340.00 },
        { estado: 'RS', quantidade: 156, receita: 57230.75 },
        { estado: 'PR', quantidade: 142, receita: 52150.00 },
        { estado: 'SC', quantidade: 98, receita: 35980.25 },
        { estado: 'BA', quantidade: 87, receita: 31950.00 },
        { estado: 'GO', quantidade: 65, receita: 23870.50 },
      ],
      topCidades: [
        { cidade: 'São Paulo', estado: 'SP', quantidade: 234, receita: 85980.25 },
        { cidade: 'Rio de Janeiro', estado: 'RJ', quantidade: 156, receita: 57230.50 },
        { cidade: 'Belo Horizonte', estado: 'MG', quantidade: 98, receita: 35980.00 },
        { cidade: 'Curitiba', estado: 'PR', quantidade: 87, receita: 31950.75 },
        { cidade: 'Porto Alegre', estado: 'RS', quantidade: 76, receita: 27920.50 },
        { cidade: 'Florianópolis', estado: 'SC', quantidade: 65, receita: 23870.25 },
        { cidade: 'Brasília', estado: 'DF', quantidade: 54, receita: 19830.00 },
        { cidade: 'Salvador', estado: 'BA', quantidade: 43, receita: 15790.75 },
      ],
      taxaAbandonoCarrinho: 68.45,
      valorCarrinhosAbandonados: 125450.75,
      tempoMedioCarrinho: 12.5,
      produtosMaisAbandonados: [
        { produtoId: 1, produtoNome: 'Notebook Gamer X1', quantidadeAbandonada: 45 },
        { produtoId: 4, produtoNome: 'Monitor 27" 4K', quantidadeAbandonada: 32 },
        { produtoId: 6, produtoNome: 'Placa de Vídeo RTX 4080', quantidadeAbandonada: 28 },
        { produtoId: 2, produtoNome: 'Mouse Sem Fio Pro', quantidadeAbandonada: 23 },
        { produtoId: 3, produtoNome: 'Teclado Mecânico RGB', quantidadeAbandonada: 19 },
      ],
    };
  }

  /**
   * Busca indicadores de estoque
   * @param dataInicio Data de início do período (opcional)
   * @param dataFim Data de fim do período (opcional)
   */
  obterIndicadoresEstoque(
    dataInicio?: string,
    dataFim?: string
  ): Observable<IndicadoresEstoque> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http.get<IndicadoresEstoque>(`${this.baseUrl}/estoque`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(() => {
        console.warn('⚠️ Backend não disponível, usando dados mockados de estoque');
        return of(this.obterIndicadoresEstoqueMockados()).pipe(delay(300));
      })
    );
  }

  /**
   * Dados mockados de indicadores de estoque
   */
  private obterIndicadoresEstoqueMockados(): IndicadoresEstoque {
    const hoje = new Date();
    const diasAtras = Array.from({ length: 30 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (29 - i));
      return data.toISOString().split('T')[0];
    });

    return {
      valorTotalEstoque: 2456780.50,
      quantidadeTotalItens: 12450,
      produtosSemEstoque: 23,
      produtosEstoqueBaixo: 45,
      produtosEstoqueAlto: 156,
      rotatividadeMedia: 3.45,
      giroEstoque: 2.8,
      tempoMedioEstoque: 45.5,
      produtosMaisEstocados: [
        { id: 1, nome: 'Notebook Gamer X1', quantidadeEstoque: 234, valorEstoque: 234000.00 },
        { id: 2, nome: 'Mouse Sem Fio Pro', quantidadeEstoque: 456, valorEstoque: 68400.00 },
        { id: 3, nome: 'Teclado Mecânico RGB', quantidadeEstoque: 189, valorEstoque: 56700.00 },
        { id: 4, nome: 'Monitor 27" 4K', quantidadeEstoque: 142, valorEstoque: 142000.00 },
        { id: 5, nome: 'Headset Gamer 7.1', quantidadeEstoque: 234, valorEstoque: 46800.00 },
      ],
      produtosMenosEstocados: [
        { id: 15, nome: 'Cabo USB-C', quantidadeEstoque: 5, valorEstoque: 250.00 },
        { id: 16, nome: 'Adaptador HDMI', quantidadeEstoque: 8, valorEstoque: 480.00 },
        { id: 17, nome: 'Protetor de Tela', quantidadeEstoque: 12, valorEstoque: 360.00 },
        { id: 18, nome: 'Cabo de Rede', quantidadeEstoque: 15, valorEstoque: 750.00 },
        { id: 19, nome: 'Hub USB', quantidadeEstoque: 18, valorEstoque: 1800.00 },
      ],
      estoquePorCategoria: [
        { categoriaId: 1, categoriaNome: 'Notebooks', quantidadeTotal: 234, valorTotal: 234000.00, percentual: 9.5 },
        { categoriaId: 2, categoriaNome: 'Periféricos', quantidadeTotal: 879, valorTotal: 175800.00, percentual: 7.2 },
        { categoriaId: 3, categoriaNome: 'Monitores', quantidadeTotal: 142, valorTotal: 142000.00, percentual: 5.8 },
        { categoriaId: 4, categoriaNome: 'Componentes', quantidadeTotal: 456, valorTotal: 182400.00, percentual: 7.4 },
        { categoriaId: 5, categoriaNome: 'Acessórios', quantidadeTotal: 10239, valorTotal: 1701580.50, percentual: 69.3 },
      ],
      movimentacaoEstoque: diasAtras.map((data, index) => ({
        data,
        entradas: Math.floor(Math.random() * 50) + 10,
        saidas: Math.floor(Math.random() * 40) + 5,
        saldo: Math.floor(Math.random() * 100) + 50,
      })),
      produtosCriticos: [
        { id: 15, nome: 'Cabo USB-C', quantidadeAtual: 5, quantidadeMinima: 20, diasRestantes: 3 },
        { id: 16, nome: 'Adaptador HDMI', quantidadeAtual: 8, quantidadeMinima: 25, diasRestantes: 5 },
        { id: 17, nome: 'Protetor de Tela', quantidadeAtual: 12, quantidadeMinima: 30, diasRestantes: 7 },
        { id: 20, nome: 'Fonte Notebook', quantidadeAtual: 15, quantidadeMinima: 35, diasRestantes: 8 },
        { id: 21, nome: 'Carregador USB-C', quantidadeAtual: 18, quantidadeMinima: 40, diasRestantes: 10 },
      ],
      previsaoReposicao: [
        { produtoId: 15, produtoNome: 'Cabo USB-C', diasParaReposicao: 3, quantidadeNecessaria: 50 },
        { produtoId: 16, produtoNome: 'Adaptador HDMI', diasParaReposicao: 5, quantidadeNecessaria: 60 },
        { produtoId: 17, produtoNome: 'Protetor de Tela', diasParaReposicao: 7, quantidadeNecessaria: 80 },
        { produtoId: 20, produtoNome: 'Fonte Notebook', diasParaReposicao: 8, quantidadeNecessaria: 70 },
        { produtoId: 21, produtoNome: 'Carregador USB-C', diasParaReposicao: 10, quantidadeNecessaria: 90 },
      ],
    };
  }
}

