import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutoService } from '../../../../../core/services/produto.service';
import { Produto } from '../../../../../core/models/produto.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrossel-mais-vendidos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carrossel-mais-vendidos.component.html',
  styleUrl: './carrossel-mais-vendidos.component.scss',
})
export class CarrosselMaisVendidosComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly fb = inject(FormBuilder);

  readonly produtos = signal<Produto[]>([]);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.carregarProdutosMaisVendidos();
  }

  async carregarProdutosMaisVendidos(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.produtoService.buscarMaisVendidos(0, 20)
      );
      this.produtos.set(response.content || []);
    } catch (error) {
      console.error('Erro ao carregar produtos mais vendidos:', error);
      alert('Erro ao carregar produtos mais vendidos');
      this.produtos.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  getImagemPrincipal(produto: Produto): string {
    if (produto.imagens && produto.imagens.length > 0) {
      const imagemPrincipal = produto.imagens.find(img => img.principal) || produto.imagens[0];
      const url = imagemPrincipal?.url;
      if (!url) return '/assets/logo/Logo-Thiers.png';
      return this.formatarUrlImagem(url);
    }
      return '/assets/logo/Logo-Thiers.png';
  }

  /**
   * Formata URL da imagem para exibição
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
