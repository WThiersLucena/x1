import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, IndicadoresProdutos } from '../../../../../core/services/dashboard.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-indicadores-produtos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicadores-produtos.component.html',
  styleUrl: './indicadores-produtos.component.scss',
})
export class IndicadoresProdutosComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly indicadores = signal<IndicadoresProdutos | null>(null);
  readonly isLoading = signal(false);
  readonly periodo = signal<'hoje' | 'semana' | 'mes' | 'ano' | 'personalizado'>('mes');

  ngOnInit(): void {
    this.carregarIndicadores();
  }

  async carregarIndicadores(): Promise<void> {
    this.isLoading.set(true);
    try {
      const dataInicio = this.obterDataInicio();
      const dataFim = this.obterDataFim();
      
      const dados = await firstValueFrom(
        this.dashboardService.obterIndicadoresProdutos(dataInicio, dataFim)
      );
      this.indicadores.set(dados);
    } catch (error) {
      console.error('Erro ao carregar indicadores de produtos:', error);
      this.indicadores.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  private obterDataInicio(): string | undefined {
    const hoje = new Date();
    switch (this.periodo()) {
      case 'hoje':
        return hoje.toISOString().split('T')[0];
      case 'semana':
        const semanaAtras = new Date(hoje);
        semanaAtras.setDate(hoje.getDate() - 7);
        return semanaAtras.toISOString().split('T')[0];
      case 'mes':
        const mesAtras = new Date(hoje);
        mesAtras.setMonth(hoje.getMonth() - 1);
        return mesAtras.toISOString().split('T')[0];
      case 'ano':
        const anoAtras = new Date(hoje);
        anoAtras.setFullYear(hoje.getFullYear() - 1);
        return anoAtras.toISOString().split('T')[0];
      default:
        return undefined;
    }
  }

  private obterDataFim(): string | undefined {
    return new Date().toISOString().split('T')[0];
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  formatarPercentual(valor: number): string {
    return `${valor.toFixed(2)}%`;
  }

  alterarPeriodo(periodo: 'hoje' | 'semana' | 'mes' | 'ano' | 'personalizado'): void {
    this.periodo.set(periodo);
    this.carregarIndicadores();
  }
}

