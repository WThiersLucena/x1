import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { CartService } from '../../core/cart/cart.service';

export type CarouselItem = {
  id: string | number;
  title: string;
  imageUrl: string;
  price?: string;
  previousPrice?: string;
  produtoCompleto?: any; // Produto completo para o modal
};

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements AfterViewInit, OnChanges {
  @Input() title = '';
  @Input() items: CarouselItem[] = [];
  @Input() visible = 4; // itens visíveis por slide
  @Input() step = 2; // quantos itens avançar por vez
  @Input() interval = 3000; // autoplay em ms
  @Input() showDetailsButton = false; // Se true, mostra "Ver Detalhes" ao invés de "Adicionar à cesta"
  @Input() cardModel: 'default' | 'modelo1' | 'modelo2' = 'default'; // Modelo de card a ser usado
  @Output() viewDetails = new EventEmitter<CarouselItem>(); // Emite evento quando clicar em "Ver Detalhes"

  static nextId = 0;
  readonly id = `carousel-${CarouselComponent.nextId++}`;

  slides: CarouselItem[][] = [];
  private readonly likedIds = new Set<string | number>();
  private readonly cart = inject(CartService);
  private selectedSizes = new Map<string | number, string>();

  // Mantido para compatibilidade do template (trackBy interno)
  trackById(_index: number, item: CarouselItem) {
    return item.id;
  }
  trackBySlide(index: number) {
    return index;
  }

  @ViewChild('track', { static: false }) trackRef?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    // Garantir que os slides sejam construídos na inicialização
    if (this.items && this.items.length > 0) {
      this.slides = this.buildSlides(this.items, this.visible, this.step);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['visible'] || changes['step']) {
      this.slides = this.buildSlides(this.items ?? [], this.visible, this.step);
    }
  }

  private buildSlides(
    items: CarouselItem[],
    visible: number,
    step: number
  ): CarouselItem[][] {
    const result: CarouselItem[][] = [];
    if (!items || items.length === 0 || visible <= 0 || step <= 0)
      return result;

    const total = items.length;

    // Se temos menos itens que o visível, criar apenas um slide
    if (total <= visible) {
      result.push([...items]);
      return result;
    }

    // Calcular número de slides baseado no step
    const numSlides = Math.ceil((total - visible) / step) + 1;

    for (let s = 0; s < numSlides; s++) {
      const start = s * step;
      const slide: CarouselItem[] = [];

      // Garantir que não ultrapasse o total de itens
      for (let k = 0; k < visible; k++) {
        const idx = start + k;
        if (idx < total) {
          slide.push(items[idx]);
        } else {
          // Se ultrapassar, voltar ao início (wrap around)
          slide.push(items[idx % total]);
        }
      }

      // Só adicionar slide se tiver itens
      if (slide.length > 0) {
        result.push(slide);
      }
    }

    return result;
  }

  isLiked(item: CarouselItem): boolean {
    return this.likedIds.has(item.id);
  }

  toggleLike(event: MouseEvent, item: CarouselItem): void {
    event.stopPropagation();
    if (this.isLiked(item)) {
      this.likedIds.delete(item.id);
    } else {
      this.likedIds.add(item.id);
    }
  }

  selectSize(item: CarouselItem, size: string): void {
    this.selectedSizes.set(item.id, size);
  }

  getSelectedSize(item: CarouselItem): string | undefined {
    return this.selectedSizes.get(item.id);
  }

  addToCart(item: CarouselItem): void {
    const size = this.getSelectedSize(item);
    if (!size) return;

    // Valida se o item já está no carrinho
    if (this.isItemInCart(item, size)) {
      console.warn('Item já está no carrinho');
      return;
    }

    this.cart.add(
      {
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        price: item.price,
        size,
      },
      1
    );
  }

  quickAddToCart(event: MouseEvent, item: CarouselItem): void {
    event.stopPropagation();
    this.addToCart(item);
  }

  /**
   * Adiciona item ao carrinho sem necessidade de selecionar tamanho
   * Usado para cards com showDetailsButton (como "Mais Vendidos")
   */
  addToCartWithoutSize(event: MouseEvent, item: CarouselItem): void {
    event.stopPropagation();

    // Valida se o item já está no carrinho
    if (this.isItemInCart(item)) {
      console.warn('Item já está no carrinho');
      return;
    }

    this.cart.add(
      {
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        price: item.price,
      },
      1
    );
  }

  /**
   * Verifica se o item já está no carrinho
   */
  isItemInCart(item: CarouselItem, size?: string): boolean {
    const cartItems = this.cart.getItems();
    return cartItems.some(
      (cartItem) => cartItem.id === item.id && (!size || cartItem.size === size)
    );
  }

  verDetalhes(item: CarouselItem): void {
    this.viewDetails.emit(item);
  }

  /**
   * Calcula o percentual de desconto baseado no preço anterior e atual
   */
  calcularDesconto(item: CarouselItem): number | null {
    if (!item.previousPrice || !item.price) {
      return null;
    }

    try {
      // Remove formatação de moeda brasileira (R$, espaços, pontos de milhar)
      // Exemplo: "R$ 169,90" -> "169.90"
      const precoAnteriorStr = item.previousPrice
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      const precoAtualStr = item.price
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

      const precoAnterior = parseFloat(precoAnteriorStr);
      const precoAtual = parseFloat(precoAtualStr);

      if (
        isNaN(precoAnterior) ||
        isNaN(precoAtual) ||
        precoAnterior <= 0 ||
        precoAtual <= 0 ||
        precoAnterior <= precoAtual
      ) {
        return null;
      }

      const desconto = ((precoAnterior - precoAtual) / precoAnterior) * 100;
      return Math.round(desconto);
    } catch (error) {
      console.error('Erro ao calcular desconto:', error);
      return null;
    }
  }

  /**
   * Formata URL da imagem para exibição (apenas URLs locais - assets)
   */
  formatarUrlImagem(url: string): string {
    if (!url) return '/assets/logo/Logo-Thiers.png';
    // Se já é uma URL completa (http/https), mantém
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Se começa com /assets, retorna como está (URL local)
    if (url.startsWith('/assets')) return url;
    // Se começa com /, assume que é relativo ao assets
    if (url.startsWith('/')) return url;
    // Caso contrário, assume que é um caminho de assets
    return `/assets/${url}`;
  }

  /**
   * Trata erro ao carregar imagem
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/logo/Logo-Thiers.png';
  }
}
