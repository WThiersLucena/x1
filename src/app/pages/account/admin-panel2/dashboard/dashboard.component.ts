import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicadoresVendasComponent } from './indicadores-vendas/indicadores-vendas.component';
import { IndicadoresProdutosComponent } from './indicadores-produtos/indicadores-produtos.component';
import { IndicadoresClientesComponent } from './indicadores-clientes/indicadores-clientes.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IndicadoresVendasComponent,
    IndicadoresProdutosComponent,
    IndicadoresClientesComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
    // Componente principal do dashboard - apenas orquestra os sub-componentes
  }
}


