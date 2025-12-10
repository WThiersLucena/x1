// ============================================================================
// GUARD DE AUTENTICAÇÃO PARA PROTEÇÃO DE ROTAS
// ============================================================================

/**
 * Este arquivo contém um guard que protege rotas que exigem autenticação.
 *
 * O QUE É UM GUARD?
 *
 * Guard é uma função que o Angular executa antes de ativar uma rota.
 * Ele decide se permite ou bloqueia o acesso à rota.
 *
 * USOS COMUNS DE GUARDS:
 * 1. Verificar se usuário está autenticado (este arquivo)
 * 2. Verificar se usuário tem permissão (role-based)
 * 3. Verificar se dados foram salvos antes de sair da página
 * 4. Redirecionar baseado em condições
 *
 * TIPOS DE GUARDS:
 * - CanActivate: pode ativar rota?
 * - CanActivateChild: pode ativar rotas filhas?
 * - CanDeactivate: pode sair da rota? (ex: mudanças não salvas)
 * - CanLoad: pode carregar módulo lazy-loaded?
 * - CanMatch: qual rota usar quando há múltiplas possíveis?
 *
 * Este arquivo usa CanActivateFn (functional guard - nova abordagem do Angular)
 */

// Imports do Angular Router
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';

// Import do serviço de autenticação
import { AuthService } from './auth.service';

/**
 * Guard funcional que verifica se usuário está autenticado
 *
 * FUNCTIONAL GUARDS (Angular 14+):
 *
 * Antes (Class-based guards):
 * @Injectable()
 * export class AuthGuard implements CanActivate {
 *   canActivate() { ... }
 * }
 *
 * Agora (Functional guards):
 * export const authGuard: CanActivateFn = () => { ... }
 *
 * VANTAGENS:
 * - Mais simples e conciso
 * - Não precisa criar classe
 * - Mais fácil de testar
 * - Padrão recomendado no Angular moderno
 *
 * COMO FUNCIONA:
 *
 * 1. Usuário tenta acessar uma rota protegida
 * 2. Angular chama este guard
 * 3. Guard verifica se usuário está autenticado
 * 4. Se autenticado, retorna true (permite acesso)
 * 5. Se não autenticado, redireciona para login e retorna false (bloqueia)
 *
 * PARÂMETROS:
 *
 * @param route ActivatedRouteSnapshot
 *   Contém informações sobre a rota que está sendo ativada
 *   Pode acessar: params, queryParams, data, etc
 *   Útil para guards que precisam de informações da rota
 *
 * @param state RouterStateSnapshot
 *   Contém informações sobre o estado atual do router
 *   Pode acessar: url, root, etc
 *   Útil para salvar URL e redirecionar após login
 *
 * @returns boolean | UrlTree
 *   true: permite acesso à rota
 *   false: bloqueia acesso à rota
 *   UrlTree: redireciona para outra rota (retornado por createUrlTree)
 *
 * USO NAS ROTAS (app.routes.ts):
 *
 * {
 *   path: 'account',
 *   loadComponent: () => import('./pages/account/account.component'),
 *   canActivate: [authGuard]  // ← Aplica o guard
 * }
 *
 * FLUXO COMPLETO:
 *
 * 1. Usuário clica em link ou navega para /account
 * 2. Angular inicia processo de ativação da rota
 * 3. Angular verifica guards da rota (canActivate: [authGuard])
 * 4. Angular chama authGuard()
 * 5. authGuard injeta AuthService e Router
 * 6. authGuard chama authService.isAuthenticated()
 *
 * CASO AUTENTICADO:
 * 7a. authService.isAuthenticated() retorna true
 * 8a. authGuard retorna true
 * 9a. Angular ativa a rota /account
 * 10a. Usuário vê a página account
 *
 * CASO NÃO AUTENTICADO:
 * 7b. authService.isAuthenticated() retorna false
 * 8b. authGuard cria UrlTree para /login
 * 9b. authGuard retorna UrlTree
 * 10b. Angular redireciona para /login
 * 11b. Usuário vê a página de login
 */
export const authGuard: CanActivateFn = (route, state) => {
  // ==========================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ==========================================================================

  /**
   * Injeta AuthService para verificar autenticação
   *
   * inject() é uma função do Angular que permite injetar
   * dependências dentro de funções (não apenas em classes)
   *
   * Só funciona dentro do contexto de injeção do Angular:
   * - Construtores de classes
   * - Funções passadas para providers
   * - Guards funcionais
   * - Inicializadores
   */
  const authService = inject(AuthService);

  /**
   * Injeta Router para fazer redirecionamento
   *
   * Usado para redirecionar para /login quando usuário não está autenticado
   */
  const router = inject(Router);

  // ==========================================================================
  // VERIFICAÇÃO DE AUTENTICAÇÃO
  // ==========================================================================

  /**
   * Verifica se usuário está autenticado
   *
   * authService.isAuthenticated() verifica:
   * 1. Se existe token no localStorage
   * 2. Se existe usuário no signal (user() !== null)
   *
   * NOTA:
   * Esta é uma verificação básica (presença de token).
   * Não valida se o token está expirado ou é válido.
   *
   * MELHORIAS FUTURAS:
   * 1. Decodificar JWT e verificar data de expiração
   * 2. Fazer requisição ao backend para validar token
   * 3. Implementar refresh token se expirado
   */
  if (authService.isAuthenticated()) {
    // ========================================================================
    // USUÁRIO AUTENTICADO - PERMITIR ACESSO
    // ========================================================================

    // Retorna true para permitir navegação para a rota
    return true;
  }

  // ==========================================================================
  // USUÁRIO NÃO AUTENTICADO - REDIRECIONAR PARA LOGIN
  // ==========================================================================

  /**
   * Cria UrlTree para redirecionar para /login
   *
   * UrlTree é uma representação da URL de destino.
   * Quando um guard retorna UrlTree, o Angular redireciona automaticamente.
   *
   * router.createUrlTree(['/login']):
   * - Cria UrlTree para a rota /login
   * - Equivalente a router.navigate(['/login'])
   * - Mas retorna UrlTree ao invés de navegar imediatamente
   *
   * MELHORIA FUTURA:
   * Salvar URL original para redirecionar após login
   *
   * router.createUrlTree(['/login'], {
   *   queryParams: { returnUrl: state.url }
   * })
   *
   * Depois do login, ler returnUrl e redirecionar:
   * const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
   * this.router.navigateByUrl(returnUrl);
   */
  return router.createUrlTree(['/login']);
};

// ============================================================================
// EXEMPLO DE USO EM ROTAS
// ============================================================================

/**
 * APLICAR GUARD EM ROTAS INDIVIDUAIS:
 *
 * {
 *   path: 'account',
 *   loadComponent: () => import('./pages/account/account.component'),
 *   canActivate: [authGuard]  // ← Protege esta rota
 * }
 *
 * APLICAR GUARD EM GRUPO DE ROTAS (ROTAS FILHAS):
 *
 * {
 *   path: '',
 *   canActivateChild: [authGuard],  // ← Protege todas as rotas filhas
 *   children: [
 *     { path: 'account', loadComponent: ... },
 *     { path: 'orders', loadComponent: ... },
 *     { path: 'wishlist', loadComponent: ... }
 *   ]
 * }
 *
 * APLICAR MÚLTIPLOS GUARDS:
 *
 * {
 *   path: 'admin',
 *   loadComponent: () => import('./pages/admin/admin.component'),
 *   canActivate: [authGuard, adminGuard]  // ← Executa em ordem
 * }
 *
 * EXPLICAÇÃO DE canActivate vs canActivateChild:
 *
 * canActivate:
 * - Protege a rota específica
 * - Executado ao ativar a rota
 *
 * canActivateChild:
 * - Protege todas as rotas filhas
 * - Executado ao ativar qualquer rota filha
 * - Não protege a rota pai (apenas filhas)
 *
 * EXEMPLO COMPLETO:
 *
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,      // Não protegido
 *   canActivateChild: [authGuard],      // Protege apenas filhas
 *   children: [
 *     { path: 'profile', ... },         // Protegido pelo canActivateChild
 *     { path: 'settings', ... }         // Protegido pelo canActivateChild
 *   ]
 * }
 *
 * vs
 *
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard],           // Protege a rota pai também
 *   canActivateChild: [authGuard],      // Protege as filhas
 *   children: [
 *     { path: 'profile', ... },
 *     { path: 'settings', ... }
 *   ]
 * }
 */

// ============================================================================
// OUTROS TIPOS DE GUARDS ÚTEIS
// ============================================================================

/**
 * EXEMPLO: GUARD DE ROLE (VERIFICAR PERMISSÃO):
 *
 * export const adminGuard: CanActivateFn = () => {
 *   const authService = inject(AuthService);
 *   const router = inject(Router);
 *
 *   const user = authService.user();
 *
 *   if (user && user.role === 'ADMIN') {
 *     return true;
 *   }
 *
 *   // Redireciona para página de "Sem permissão"
 *   return router.createUrlTree(['/unauthorized']);
 * };
 *
 * EXEMPLO: GUARD DE MUDANÇAS NÃO SALVAS:
 *
 * export const unsavedChangesGuard: CanDeactivateFn<ComponentWithForm> = (component) => {
 *   if (component.form.dirty) {
 *     return confirm('Você tem mudanças não salvas. Deseja realmente sair?');
 *   }
 *   return true;
 * };
 *
 * USO:
 * {
 *   path: 'edit-profile',
 *   component: EditProfileComponent,
 *   canDeactivate: [unsavedChangesGuard]
 * }
 *
 * EXEMPLO: GUARD DE DADOS OBRIGATÓRIOS:
 *
 * export const dataRequiredGuard: CanActivateFn = (route) => {
 *   const dataService = inject(DataService);
 *   const router = inject(Router);
 *
 *   if (dataService.hasRequiredData()) {
 *     return true;
 *   }
 *
 *   return router.createUrlTree(['/setup']);
 * };
 *
 * EXEMPLO: GUARD COM OBSERVABLE (REQUISIÇÃO ASYNC):
 *
 * export const permissionGuard: CanActivateFn = () => {
 *   const authService = inject(AuthService);
 *   const router = inject(Router);
 *
 *   return authService.checkPermission().pipe(
 *     map(hasPermission => {
 *       if (hasPermission) {
 *         return true;
 *       }
 *       return router.createUrlTree(['/unauthorized']);
 *     }),
 *     catchError(() => {
 *       return of(router.createUrlTree(['/error']));
 *     })
 *   );
 * };
 */
