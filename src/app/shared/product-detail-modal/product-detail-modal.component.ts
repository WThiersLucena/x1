import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Produto } from '../../core/models/produto.model';
import { CartService } from '../../core/cart/cart.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.scss'],
})
export class ProductDetailModalComponent implements OnChanges {
  @Input() produto: Produto | null = null;
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  currentImageIndex = 0;
  quantidade = 1;
  readonly isAdicionando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue) {
      console.log('🔄 Modal show mudou para true');
      console.log('📦 Produto:', this.produto?.nome);
    }
    if (changes['produto'] && changes['produto'].currentValue) {
      console.log('🔄 Produto mudou:', this.produto?.nome);
      this.currentImageIndex = 0;
      this.quantidade = 1;
    }
  }

  get imagens(): string[] {
    if (!this.produto?.imagens || this.produto.imagens.length === 0) {
      return ['/assets/logo/Logo-Thiers.png'];
    }

    // Retorna apenas URLs locais (assets) - sem buscar do backend
    return this.produto.imagens
      .filter(img => img.ativa !== false)
      .map(img => {
        // Se já é uma URL completa (http/https), mantém
        if (img.url.startsWith('http://') || img.url.startsWith('https://')) {
          return img.url;
        }
        // Se começa com /assets, retorna como está (URL local)
        if (img.url.startsWith('/assets')) {
          return img.url;
        }
        // Se começa com /, assume que é relativo ao assets
        if (img.url.startsWith('/')) {
          return img.url;
        }
        // Caso contrário, assume que é um caminho de assets
        return `/assets/${img.url}`;
      });
  }

  get imagemAtual(): string {
    return this.imagens[this.currentImageIndex] || '/assets/logo/Logo-Thiers.png';
  }

  get temMultiplasImagens(): boolean {
    return this.imagens.length > 1;
  }

  formatarPreco(valor: number | undefined): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  imagemAnterior(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.imagens.length - 1;
    }
  }

  proximaImagem(): void {
    if (this.currentImageIndex < this.imagens.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  selecionarImagem(index: number): void {
    this.currentImageIndex = index;
  }

  fecharModal(): void {
    this.quantidade = 1;
    this.mensagemSucesso.set(null);
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop') || target.classList.contains('modal')) {
      this.fecharModal();
    }
  }

  /**
   * Incrementa a quantidade
   */
  incrementarQuantidade(): void {
    if (!this.produto) return;
    const estoqueDisponivel = this.produto.estoqueAtual || 0;
    if (this.quantidade < estoqueDisponivel) {
      this.quantidade++;
    }
  }

  /**
   * Decrementa a quantidade
   */
  decrementarQuantidade(): void {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  /**
   * Valida se a quantidade é válida
   */
  get quantidadeValida(): boolean {
    if (!this.produto) return false;
    const estoqueDisponivel = this.produto.estoqueAtual || 0;
    return this.quantidade >= 1 && this.quantidade <= estoqueDisponivel;
  }

  /**
   * Valida e ajusta a quantidade quando o usuário digita
   */
  validarQuantidade(): void {
    if (!this.produto) {
      this.quantidade = 1;
      return;
    }
    
    const estoqueDisponivel = this.produto.estoqueAtual || 0;
    
    // Garante que a quantidade está entre 1 e o estoque disponível
    if (this.quantidade < 1) {
      this.quantidade = 1;
    } else if (this.quantidade > estoqueDisponivel) {
      this.quantidade = estoqueDisponivel;
    }
  }

  /**
   * Obtém a URL da primeira imagem do produto
   */
  get primeiraImagemUrl(): string {
    if (!this.produto?.imagens || this.produto.imagens.length === 0) {
      return '/assets/logo/Logo-Thiers.png';
    }
    const imagem = this.produto.imagens[0];
    // Se já é uma URL completa (http/https), mantém
    if (imagem.url.startsWith('http://') || imagem.url.startsWith('https://')) {
      return imagem.url;
    }
    // Se começa com /assets, retorna como está (URL local)
    if (imagem.url.startsWith('/assets')) {
      return imagem.url;
    }
    // Se começa com /, assume que é relativo ao assets
    if (imagem.url.startsWith('/')) {
      return imagem.url;
    }
    // Caso contrário, assume que é um caminho de assets
    return `/assets/${imagem.url}`;
  }

  /**
   * Adiciona produto ao carrinho
   */
  async adicionarAoCarrinho(): Promise<void> {
    // Verifica se usuário está autenticado
    if (!this.auth.isAuthenticated()) {
      if (confirm('Você precisa estar logado para adicionar produtos ao carrinho. Deseja fazer login?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    if (!this.produto) {
      alert('Produto não encontrado');
      return;
    }

    if (!this.produto.id) {
      alert('ID do produto inválido');
      return;
    }

    // Valida quantidade
    this.validarQuantidade();
    
    if (!this.quantidadeValida) {
      alert('Quantidade inválida. Verifique o estoque disponível.');
      return;
    }

    if (this.quantidade < 1) {
      alert('A quantidade deve ser maior que zero');
      return;
    }

    const estoqueDisponivel = this.produto.estoqueAtual || 0;
    if (this.quantidade > estoqueDisponivel) {
      alert(`Estoque insuficiente. Disponível: ${estoqueDisponivel} unidades`);
      return;
    }

    this.isAdicionando.set(true);
    this.mensagemSucesso.set(null);

    // Log para debug
    console.log('🛒 Adicionando produto ao carrinho:', {
      produtoId: this.produto.id,
      produtoNome: this.produto.nome,
      quantidade: this.quantidade,
      estoque: this.produto.estoqueAtual,
    });

    try {
      await this.cartService.add(
        {
          id: this.produto.id,
          title: this.produto.nome,
          imageUrl: this.primeiraImagemUrl,
          price: this.formatarPreco(this.produto.precoVenda),
        },
        this.quantidade
      );

      this.mensagemSucesso.set(`✅ ${this.quantidade} item(ns) adicionado(s) ao carrinho!`);
      
      // Limpa mensagem após 3 segundos
      setTimeout(() => {
        this.mensagemSucesso.set(null);
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao adicionar ao carrinho:', error);
      
      // Tenta extrair mensagem do erro do backend
      let mensagemErro = 'Erro ao adicionar produto ao carrinho';
      
      if (error?.error?.message) {
        mensagemErro = error.error.message;
      } else if (error?.message) {
        mensagemErro = error.message;
      } else if (typeof error === 'string') {
        mensagemErro = error;
      }
      
      alert(mensagemErro);
    } finally {
      this.isAdicionando.set(false);
    }
  }
}


