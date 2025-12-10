import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartService, CartItem } from '../../core/cart/cart.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Produto } from '../../core/models/produto.model';
import { ProductDetailModalComponent } from '../../shared/product-detail-modal/product-detail-modal.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, ProductDetailModalComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartPageComponent {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly produtoService = inject(ProdutoService);
  private readonly cdr = inject(ChangeDetectorRef);

  produtoSelecionado: Produto | null = null;
  mostrarModal = false;

  get items(): CartItem[] {
    return this.cart.getItems();
  }

  get total(): number {
    return this.items.reduce(
      (sum, it) => sum + this.parsePrice(it.price) * it.quantity,
      0
    );
  }

  get itemCount(): number {
    return this.cart.getCount();
  }

  async increment(it: CartItem) {
    await this.cart.add(
      {
        id: it.id,
        title: it.title,
        imageUrl: it.imageUrl,
        price: it.price,
        size: it.size,
      },
      1
    );
  }

  async decrement(it: CartItem) {
    await this.cart.decrement(it.id, 1, it.size);
  }

  async remove(it: CartItem) {
    await this.cart.remove(it.id, it.size);
  }

  async clear() {
    await this.cart.clear();
  }

  checkout() {
    this.router.navigateByUrl('/checkout');
  }

  back() {
    this.router.navigateByUrl('/home');
  }

  // Deixa público para uso no template
  parsePrice(price?: string): number {
    if (!price) return 0;
    // trata formatos "R$ 1.234,56" ou "1234.56"
    const normalized = price
      .replace(/\s/g, '')
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = Number(normalized);
    return isNaN(n) ? 0 : n;
  }

  subtotal(it: CartItem): number {
    return this.parsePrice(it.price) * it.quantity;
  }

  /**
   * Abre modal de detalhes do produto ao clicar na imagem
   */
  async abrirModalDetalhes(item: CartItem, event?: Event): Promise<void> {
    // Previne propagação do evento para evitar conflitos
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('🖼️ Abrindo modal para produto:', item.id, item.title);

    try {
      const produtoId = Number(item.id);
      if (isNaN(produtoId) || produtoId <= 0) {
        console.error('❌ ID do produto inválido:', item.id);
        return;
      }

      console.log('🔍 Buscando produto ID:', produtoId);

      // Busca produto completo do backend
      const produto = await firstValueFrom(this.produtoService.buscarPorId(produtoId));
      
      console.log('✅ Produto encontrado:', produto?.nome);

      if (produto) {
        this.produtoSelecionado = produto;
        this.mostrarModal = true;
        console.log('📦 Modal aberto. mostrarModal:', this.mostrarModal);
        console.log('📦 Produto selecionado:', this.produtoSelecionado?.nome);
        
        // Força detecção de mudanças para garantir que o modal seja renderizado
        this.cdr.detectChanges();
        
        // Pequeno delay para garantir que o DOM foi atualizado
        setTimeout(() => {
          console.log('📦 Modal após timeout. mostrarModal:', this.mostrarModal);
        }, 100);
      } else {
        console.error('❌ Produto não encontrado:', produtoId);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar produto:', error);
    }
  }

  /**
   * Fecha o modal de detalhes
   */
  fecharModal(): void {
    this.mostrarModal = false;
    this.produtoSelecionado = null;
  }

  /**
   * Trata erro ao carregar imagem do produto
   */
  tratarErroImagem(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/logo/Logo-Thiers.png';
    }
  }
}
