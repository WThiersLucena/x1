import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="estoque-component">
      <h6 class="mb-3">Gerenciar Estoque</h6>
      <div class="alert alert-info">
        <p class="mb-0">
          ℹ️ Funcionalidade de Estoque em desenvolvimento. Em breve você poderá
          gerenciar movimentações de estoque aqui.
        </p>
      </div>
    </div>
  `,
  styleUrl: './estoque.component.scss',
})
export class EstoqueComponent implements OnInit {
  ngOnInit(): void {
    // TODO: Implementar funcionalidades de estoque
  }
}

