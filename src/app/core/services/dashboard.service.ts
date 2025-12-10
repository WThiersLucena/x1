import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    });
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
    });
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
    });
  }
}

