import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type HeroSlide = {
  imageUrl: string;
  title: string;
  description?: string;
};

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss'],
})
export class HeroCarouselComponent {
  @Input() id = 'heroCarousel';
  @Input() interval = 4000;
  @Input() slides: HeroSlide[] = [];

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
    // Usar logo como fallback se placeholder não existir
    img.src = '/assets/logo/Logo-Thiers.png';
  }
}


