import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/cart/cart.service';
import { HttpClient } from '@angular/common/http';
import { Categoria } from '../../core/models/categoria.model';
import { Subcategoria } from '../../core/models/subcategoria.model';
import { MOCK_CATEGORIAS } from '../../core/data/mock-data';
import { MOCK_SUBCATEGORIAS } from '../../core/data/mock-data';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cart = inject(CartService);
  private readonly http = inject(HttpClient);

  readonly user = this.auth.user;
  readonly greeting = computed(() =>
    this.user() ? `Olá ${this.user()!.name}` : 'Login'
  );

  get cartCount(): number {
    return this.cart.getCount();
  }

  get cartIconUrl(): string {
    return this.cartCount > 0
      ? '/assets/icons/bolsa-de-compras-cheia.png'
      : '/assets/icons/bolsa-de-compras-vazia.png';
  }

  readonly isLoading = signal(false);
  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  // Formulário de pesquisa
  readonly searchForm = this.formBuilder.group({
    query: [''],
  });

  // Categorias mockadas diretamente
  readonly categorias = signal<Categoria[]>([]);
  
  // Estrutura hierárquica para o menu de navegação
  readonly categoriasComSubcategorias = signal<Array<{
    categoria: Categoria;
    subcategorias: Subcategoria[];
  }>>([]);

  // Controle de exibição do dropdown
  dropdownAberto: number | null = null; // ID da categoria com dropdown aberto
  fecharDropdownTimeout: any = null; // Timeout para fechar o dropdown (permite transição suave)

  // Controle do menu de conta do usuário
  menuContaAberto: boolean = false;
  fecharMenuContaTimeout: any = null;

  ngOnInit(): void {
    this.carregarMenuNavegacao();
  }

  /**
   * Carrega as categorias e subcategorias diretamente dos dados mockados
   */
  private carregarMenuNavegacao(): void {
    // Carrega categorias diretamente dos dados mockados
    const categorias = MOCK_CATEGORIAS.filter(c => c.ativa !== false);
    this.categorias.set(categorias);
    
    // Monta a estrutura hierárquica com subcategorias
    const categoriasComSubcategorias = categorias.map(categoria => {
      const subcategorias = MOCK_SUBCATEGORIAS.filter(
        sub => sub.categoriaId === categoria.id && sub.ativa !== false
      );
      
      return {
        categoria,
        subcategorias
      };
    });
    
    this.categoriasComSubcategorias.set(categoriasComSubcategorias);
    console.log('✅ Menu de navegação carregado com dados mockados:', {
      totalCategorias: categorias.length,
      totalSubcategorias: categoriasComSubcategorias.reduce((acc, cat) => acc + cat.subcategorias.length, 0)
    });
  }

  /**
   * Navega para a página de produtos filtrados por categoria
   */
  navegarParaCategoria(categoriaId: number): void {
    this.router.navigate(['/produtos'], {
      queryParams: { categoriaId },
    });
  }

  /**
   * Navega para a página de produtos filtrados por subcategoria
   */
  navegarParaSubcategoria(subcategoriaId: number): void {
    this.router.navigate(['/produtos'], {
      queryParams: { subcategoriaId },
    });
  }

  /**
   * Navega para a página de produtos filtrados por segmento
   */
  navegarParaSegmento(segmentoId: number): void {
    this.router.navigate(['/produtos'], {
      queryParams: { segmentoId },
    });
  }

  /**
   * Abre o dropdown imediatamente ao passar o mouse
   */
  abrirDropdown(categoriaIndex: number, categoriaId: number): void {
    // Cancelar qualquer timeout de fechamento pendente
    if (this.fecharDropdownTimeout) {
      clearTimeout(this.fecharDropdownTimeout);
      this.fecharDropdownTimeout = null;
    }

    this.dropdownAberto = categoriaId;
  }

  /**
   * Fecha o dropdown com um pequeno delay para permitir transição suave
   */
  fecharDropdown(): void {
    // Adicionar um pequeno delay antes de fechar (200ms) para permitir que o usuário
    // mova o mouse do link para o menu sem que ele feche
    if (this.fecharDropdownTimeout) {
      clearTimeout(this.fecharDropdownTimeout);
    }

    this.fecharDropdownTimeout = setTimeout(() => {
      this.dropdownAberto = null;
      this.fecharDropdownTimeout = null;
    }, 200);
  }

  /**
   * Verifica se o dropdown de uma categoria está aberto
   */
  isDropdownAberto(categoriaId: number): boolean {
    return this.dropdownAberto === categoriaId;
  }

  /**
   * Abre o menu de conta do usuário
   */
  abrirMenuConta(): void {
    if (this.fecharMenuContaTimeout) {
      clearTimeout(this.fecharMenuContaTimeout);
      this.fecharMenuContaTimeout = null;
    }
    this.menuContaAberto = true;
  }

  /**
   * Fecha o menu de conta do usuário com delay
   */
  fecharMenuConta(): void {
    if (this.fecharMenuContaTimeout) {
      clearTimeout(this.fecharMenuContaTimeout);
    }

    this.fecharMenuContaTimeout = setTimeout(() => {
      this.menuContaAberto = false;
      this.fecharMenuContaTimeout = null;
    }, 200);
  }

  /**
   * Navega para a página de conta com a seção específica
   */
  navegarParaConta(secao: string): void {
    this.menuContaAberto = false;
    this.router.navigate(['/account'], {
      queryParams: { secao },
      fragment: secao,
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }

  goToCart() {
    this.router.navigateByUrl('/cart');
  }

  /**
   * Realiza a pesquisa de produtos
   */
  realizarPesquisa(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (query) {
      this.router.navigate(['/produtos'], {
        queryParams: { nome: query },
      });
    }
  }

  /**
   * Submete o formulário de pesquisa ao pressionar Enter
   */
  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.realizarPesquisa();
  }

  /**
   * Busca o IP e localização do usuário e exibe no console ao tentar fazer login
   */
  private async getUserIP(): Promise<void> {
    try {
      console.log('🔍 Buscando informações do usuário ao fazer login...');

      // Busca dados de IP + Geolocalização usando a API ipapi.co (gratuita)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      console.log('\n');
      console.log(
        '╔═══════════════════════════════════════════════════════════╗'
      );
      console.log(
        '║          🔐 TENTATIVA DE LOGIN                            ║'
      );
      console.log(
        '╚═══════════════════════════════════════════════════════════╝'
      );
      console.log('');
      console.log('🌐 CONEXÃO:');
      console.log(`   • IP Público: ${data.ip}`);
      console.log(`   • Provedor: ${data.org || 'Não identificado'}`);
      console.log('');
      console.log('📍 LOCALIZAÇÃO:');
      console.log(`   • País: ${data.country_name} (${data.country})`);
      console.log(`   • Estado/Região: ${data.region}`);
      console.log(`   • Cidade: ${data.city}`);
      console.log(`   • Fuso Horário: ${data.timezone}`);
      console.log('');
      console.log('⏰ TENTATIVA EM:');
      console.log(`   • Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
      console.log('');
      console.log(
        '═══════════════════════════════════════════════════════════'
      );
      console.log('\n');
    } catch (error) {
      console.error('❌ Erro ao buscar informações de geolocalização:', error);
    }
  }

  async submitLoginFromOffcanvas() {
    // Busca e exibe o IP do usuário no console
    await this.getUserIP();

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.isLoading.set(true);
    this.auth
      .login(String(email), String(password))
      .then((ok) => {
        this.isLoading.set(false);
        if (ok) {
          // fecha offcanvas
          const closeBtn = document.getElementById('offcanvasLoginClose');
          closeBtn?.dispatchEvent(new Event('click'));
          this.router.navigateByUrl('/home');
        } else {
          alert('Credenciais inválidas');
        }
      })
      .catch(() => {
        this.isLoading.set(false);
        alert('Erro ao autenticar');
      });
  }
}
