import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarrosselNovidadesComponent } from './carrossel-novidades/carrossel-novidades.component';
import { CarrosselMaisVendidosComponent } from './carrossel-mais-vendidos/carrossel-mais-vendidos.component';

@Component({
  selector: 'app-gerenciar-carrossel',
  standalone: true,
  imports: [CommonModule, CarrosselNovidadesComponent, CarrosselMaisVendidosComponent],
  templateUrl: './gerenciar-carrossel.component.html',
  styleUrl: './gerenciar-carrossel.component.scss',
})
export class GerenciarCarrosselComponent implements OnInit {
  readonly accordionAberto = signal<string | null>(null);

  ngOnInit(): void {
    // Pode inicializar com algum acordeon aberto se necessário
  }

  toggleAccordion(tipo: string): void {
    if (this.accordionAberto() === tipo) {
      this.accordionAberto.set(null);
    } else {
      this.accordionAberto.set(tipo);
    }
  }

  isAccordionAberto(tipo: string): boolean {
    return this.accordionAberto() === tipo;
  }
}

