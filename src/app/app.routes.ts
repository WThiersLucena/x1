// ============================================================================
// CONFIGURAÇÃO DE ROTAS DA APLICAÇÃO
// ============================================================================

/**
 * Este arquivo define todas as rotas (URLs) da aplicação e seus componentes.
 *
 * ROTAS PÚBLICAS (sem guard):
 * - home, shop, product, cart, login
 * - Acessíveis sem autenticação
 *
 * ROTAS PROTEGIDAS (com authGuard):
 * - wishlist, account, checkout
 * - Exigem autenticação (usuário deve estar logado)
 * - Se não autenticado, redireciona para /login
 */

import { Routes } from '@angular/router';

// Import do guard de autenticação
import { authGuard } from './core/auth/auth.guard';

/**
 * Configuração das rotas
 *
 * ESTRUTURA DE UMA ROTA:
 * {
 *   path: 'caminho-na-url',
 *   loadComponent: () => import('...').then((m) => m.ComponentName),
 *   canActivate: [authGuard]  // Opcional: protege a rota
 * }
 *
 * LAZY LOADING:
 * Todas as rotas usam loadComponent() ao invés de component
 * Isso significa que o código do componente só é carregado quando necessário
 *
 * BENEFÍCIOS:
 * - Bundle inicial menor (aplicação carrega mais rápido)
 * - Código dividido em chunks menores
 * - Melhor performance
 */
export const routes: Routes = [
  // ==========================================================================
  // ROTA RAIZ - REDIRECIONAMENTO
  // ==========================================================================

  /**
   * Rota raiz (/)
   * Redireciona automaticamente para /home
   * pathMatch: 'full' = só redireciona se a URL for exatamente '/'
   */
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ==========================================================================
  // ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
  // ==========================================================================

  /**
   * Página inicial (home)
   * Acessível sem login
   */
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomePageComponent),
  },

  /**
   * Página de loja/catálogo (shop)
   * Acessível sem login
   * Usuários podem visualizar produtos sem estar autenticados
   */
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop/shop.component').then((m) => m.ShopPageComponent),
  },

  /**
   * Página de detalhes do produto (product/:id)
   * Acessível sem login
   * :id é um parâmetro dinâmico (ex: /product/123)
   */
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product.component').then(
        (m) => m.ProductPageComponent
      ),
  },

  /**
   * Página de carrinho de compras (cart)
   * Acessível sem login
   * Usuários podem adicionar produtos ao carrinho antes de fazer login
   * Login será exigido apenas no checkout
   */
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartPageComponent),
  },

  /**
   * Página de login
   * Rota pública
   * Usuários não autenticados fazem login aqui
   */
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginPageComponent),
  },

  /**
   * Página de cadastro/registro
   * Rota pública
   * Novos usuários se cadastram aqui
   */
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginPageComponent),
  },

  // ==========================================================================
  // ROTAS PROTEGIDAS (REQUEREM AUTENTICAÇÃO)
  // ==========================================================================

  /**
   * Página de lista de desejos (wishlist)
   * PROTEGIDA: canActivate: [authGuard]
   *
   * Se usuário não está autenticado:
   * - authGuard bloqueia acesso
   * - Redireciona para /login
   *
   * Se usuário está autenticado:
   * - authGuard permite acesso
   * - Página é carregada normalmente
   */
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./pages/wishlist/wishlist.component').then(
        (m) => m.WishlistPageComponent
      ),
    canActivate: [authGuard], // ← Protege esta rota
  },

  /**
   * Página de conta do usuário (account)
   * PROTEGIDA: canActivate: [authGuard]
   *
   * Permite visualizar/editar dados da conta:
   * - Informações pessoais
   * - Endereços
   * - Histórico de pedidos
   * - Alterar senha
   */
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account.component').then(
        (m) => m.AccountPageComponent
      ),
    canActivate: [authGuard], // ← Protege esta rota
  },

  /**
   * Página de finalização de compra (checkout)
   * PROTEGIDA: canActivate: [authGuard]
   *
   * Exige autenticação para:
   * - Processar pagamento
   * - Salvar endereço de entrega
   * - Criar pedido no sistema
   * - Enviar confirmação por e-mail
   */
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutPageComponent
      ),
    canActivate: [authGuard], // ← Protege esta rota
  },

  /**
   * Página de confirmação de pedido (order-confirmation)
   * PROTEGIDA: canActivate: [authGuard]
   *
   * Exibe o resumo do pedido criado e permite finalizar via WhatsApp
   */
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./pages/order-confirmation/order-confirmation.component').then(
        (m) => m.OrderConfirmationComponent
      ),
    canActivate: [authGuard], // ← Protege esta rota
  },

  // ==========================================================================
  // ROTA CURINGA (WILDCARD) - 404
  // ==========================================================================

  /**
   * Rota curinga (**)
   * Captura qualquer rota não mapeada acima
   * Redireciona para home
   *
   * Exemplos de URLs que cairão aqui:
   * - /rota-inexistente
   * - /pagina-que-nao-existe
   * - /qualquer-coisa
   *
   * IMPORTANTE:
   * Deve sempre ser a ÚLTIMA rota do array!
   * Rotas são avaliadas de cima para baixo
   */
  { path: '**', redirectTo: 'home' },
];

// ============================================================================
// EXEMPLOS DE OUTRAS CONFIGURAÇÕES DE ROTAS
// ============================================================================

/**
 * ROTAS COM PARÂMETROS:
 * {
 *   path: 'user/:id',                // :id é parâmetro dinâmico
 *   component: UserDetailComponent
 * }
 *
 * Acessar no componente:
 * const id = this.route.snapshot.params['id'];
 * ou
 * this.route.params.subscribe(params => {
 *   const id = params['id'];
 * });
 *
 * ROTAS COM QUERY PARAMS:
 * URL: /products?category=shoes&color=red
 *
 * Acessar no componente:
 * const category = this.route.snapshot.queryParams['category'];
 * const color = this.route.snapshot.queryParams['color'];
 *
 * ROTAS COM DADOS ESTÁTICOS:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   data: { title: 'Admin Panel', requiresAdmin: true }
 * }
 *
 * Acessar no componente:
 * const title = this.route.snapshot.data['title'];
 *
 * ROTAS ANINHADAS (CHILDREN):
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   children: [
 *     { path: '', redirectTo: 'overview', pathMatch: 'full' },
 *     { path: 'overview', component: OverviewComponent },
 *     { path: 'analytics', component: AnalyticsComponent }
 *   ]
 * }
 *
 * URLs resultantes:
 * - /dashboard → redireciona para /dashboard/overview
 * - /dashboard/overview → OverviewComponent
 * - /dashboard/analytics → AnalyticsComponent
 *
 * MÚLTIPLOS GUARDS:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, adminGuard]  // Executa em ordem
 * }
 *
 * RESOLVER (PRÉ-CARREGAR DADOS):
 * {
 *   path: 'user/:id',
 *   component: UserComponent,
 *   resolve: { user: userResolver }  // Carrega dados antes de mostrar rota
 * }
 */
