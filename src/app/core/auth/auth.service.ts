// ============================================================================
// IMPORTS DE BIBLIOTECAS NECESSÁRIAS
// ============================================================================

// Imports do Angular Core
import { Injectable, signal, inject } from '@angular/core';

// Imports do RxJS (Reactive Extensions for JavaScript) - removido, usando dados mockados

// Imports dos modelos e serviços de autenticação
import { User, STORAGE_KEYS } from '../models/auth.models';
import { ApiAuthService } from './api-auth.service';
import {
  buscarUsuarioMockado,
  gerarTokenFake,
} from '../data/mock-data';

/**
 * ============================================================================
 * SERVIÇO: AUTH SERVICE - GERENCIAMENTO DE ESTADO DE AUTENTICAÇÃO
 * ============================================================================
 *
 * Serviço responsável por gerenciar o estado de autenticação do usuário:
 * - Armazenar token JWT
 * - Armazenar dados do usuário logado
 * - Fazer login (chama ApiAuthService)
 * - Fazer cadastro (chama ApiAuthService)
 * - Fazer logout
 * - Verificar se usuário está autenticado
 * - Restaurar sessão do localStorage
 *
 * RESPONSABILIDADES:
 *
 * 1. GERENCIAMENTO DE ESTADO:
 *    Mantém o estado global do usuário autenticado usando signals
 *
 * 2. PERSISTÊNCIA:
 *    Salva/carrega token e dados do usuário no localStorage
 *
 * 3. LÓGICA DE NEGÓCIO:
 *    Processa login/cadastro, armazena token, atualiza estado
 *
 * 4. INTEGRAÇÃO COM API:
 *    Usa ApiAuthService para fazer requisições HTTP
 *
 * SEPARAÇÃO DE RESPONSABILIDADES:
 *
 * - AuthService (ESTE ARQUIVO):
 *   Gerencia estado, persistência, lógica de negócio
 *
 * - ApiAuthService:
 *   Faz apenas requisições HTTP (não gerencia estado)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // ==========================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ==========================================================================

  /**
   * Serviço para fazer requisições HTTP de autenticação
   * Injetado automaticamente pelo Angular usando inject()
   */
  private readonly apiAuthService = inject(ApiAuthService);

  // ==========================================================================
  // ESTADO GLOBAL DO USUÁRIO (SIGNAL)
  // ==========================================================================

  /**
   * Signal contendo os dados do usuário autenticado
   *
   * SIGNALS NO ANGULAR (Novidade da versão 16+):
   * Signals são uma nova forma de gerenciar estado reativo no Angular.
   * São mais simples e performáticos que Observables para estado local.
   *
   * USO:
   * - Ler valor: const currentUser = this.authService.user();
   * - No template: @if (user()) { <p>Olá, {{ user()!.name }}</p> }
   */
  readonly user = signal<User | null>(null);

  // ==========================================================================
  // CONSTRUTOR - INICIALIZAÇÃO
  // ==========================================================================

  /**
   * Construtor executado quando o serviço é criado
   * Restaura a sessão do localStorage se existir
   */
  constructor() {
    this.restoreSession();
  }

  // ==========================================================================
  // MÉTODO: LOGIN (AUTENTICAÇÃO)
  // ==========================================================================

  /**
   * Autentica usuário no sistema
   *
   * FLUXO COMPLETO:
   * 1. Recebe email e senha do componente
   * 2. Chama apiAuthService.login() que faz POST /api/auth/login
   * 3. Backend valida credenciais
   * 4. Se válido, backend retorna token JWT + dados do usuário
   * 5. Salva token no localStorage
   * 6. Salva dados do usuário no localStorage
   * 7. Atualiza signal user() com os dados do usuário
   * 8. Retorna Promise<boolean> (true = sucesso, false = erro)
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      // PASSO 1: BUSCAR USUÁRIO MOCKADO
      // Verifica se existe usuário com email e senha nos dados mockados
      const usuarioMockado = buscarUsuarioMockado(email, password);

      if (!usuarioMockado) {
        // Credenciais inválidas
        console.warn('Credenciais inválidas:', email);
        return false;
      }

      // PASSO 2: GERAR TOKEN FAKE
      // Gera um token fake para desenvolvimento local
      const token = gerarTokenFake(usuarioMockado.email, usuarioMockado.role);

      // PASSO 3: SALVAR TOKEN NO LOCALSTORAGE
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);

      // PASSO 4: SALVAR DADOS DO USUÁRIO NO LOCALSTORAGE
      // Cria objeto User com email, nome e role
      const user: User = {
        email: usuarioMockado.email,
        name: usuarioMockado.name,
        role: usuarioMockado.role,
      };

      // Salva como JSON no localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // PASSO 5: ATUALIZAR SIGNAL USER
      // Atualiza o signal com os dados do usuário
      // Todos os componentes que usam user() serão notificados automaticamente
      this.user.set(user);

      // PASSO 6: RETORNAR SUCESSO
      console.log('✅ Login mockado realizado com sucesso:', user);
      return true;
    } catch (error) {
      // TRATAMENTO DE ERRO
      console.error('Erro no login:', error);
      return false;
    }
  }

  // ==========================================================================
  // MÉTODO: REGISTER (CADASTRO)
  // ==========================================================================

  /**
   * Registra novo usuário no sistema
   *
   * FLUXO COMPLETO:
   * 1. Recebe dados do novo usuário do componente
   * 2. Chama apiAuthService.register() que faz POST /api/auth/register
   * 3. Backend valida dados e cria usuário
   * 4. Backend retorna token JWT + dados do usuário (login automático)
   * 5. Salva token no localStorage
   * 6. Salva dados do usuário no localStorage
   * 7. Atualiza signal user() com os dados do usuário
   * 8. Retorna Promise<boolean> (true = sucesso, false = erro)
   *
   * OBSERVAÇÃO:
   * Após cadastro bem-sucedido, o usuário é automaticamente autenticado
   * (recebe token JWT), não precisando fazer login separadamente.
   */
  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<boolean> {
    try {
      console.log('🔐 AuthService.register() chamado');
      console.log('📋 Parâmetros:', {
        name,
        email,
        password: '***',
        confirmPassword: '***',
      });

      // Validações básicas
      if (password !== confirmPassword) {
        console.warn('❌ Senhas não coincidem');
        return false;
      }

      // Verifica se email já existe (simulação)
      const usuarioExistente = buscarUsuarioMockado(email, password);
      if (usuarioExistente) {
        console.warn('❌ Email já cadastrado');
        return false;
      }

      // Gera token fake
      const token = gerarTokenFake(email, 'CLIENTE');

      // Salva token no localStorage
      console.log('💾 Salvando token no localStorage...');
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);

      // Cria objeto User e salva no localStorage
      const user: User = {
        email: email,
        name: name,
        role: 'CLIENTE', // Novos usuários sempre começam como CLIENTE
      };
      console.log('💾 Salvando dados do usuário no localStorage...');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Atualiza signal user
      console.log('🔄 Atualizando signal user()...');
      this.user.set(user);

      console.log('✅ AuthService.register() concluído com sucesso!');
      // Retorna sucesso
      return true;
    } catch (error) {
      // Log detalhado do erro
      console.error('❌ Erro no AuthService.register():', error);
      console.error('📦 Detalhes do erro:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        status: (error as any)?.status,
        error: (error as any)?.error,
      });
      // Retorna falha
      return false;
    }
  }

  // ==========================================================================
  // MÉTODO: LOGOUT (ENCERRAR SESSÃO)
  // ==========================================================================

  /**
   * Faz logout do usuário
   *
   * AÇÕES REALIZADAS:
   * 1. Remove token do localStorage
   * 2. Remove dados do usuário do localStorage
   * 3. Atualiza signal user() para null
   * 4. Componentes são notificados automaticamente
   *
   * OBSERVAÇÃO:
   * Este logout é local (apenas frontend).
   * O token continua válido no backend até expirar.
   */
  logout(): void {
    // Remove dados do localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    // Atualiza signal user para null
    this.user.set(null);
  }

  // ==========================================================================
  // MÉTODO: GET TOKEN (OBTER TOKEN JWT)
  // ==========================================================================

  /**
   * Retorna o token JWT armazenado no localStorage
   *
   * Usado por:
   * - Interceptors HTTP (adicionar token no header Authorization)
   * - Guards de rota (verificar se usuário está autenticado)
   * - Serviços que precisam fazer requisições autenticadas
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // ==========================================================================
  // MÉTODO: IS AUTHENTICATED (VERIFICAR SE ESTÁ AUTENTICADO)
  // ==========================================================================

  /**
   * Verifica se o usuário está autenticado
   *
   * LÓGICA:
   * - Verifica se existe token no localStorage
   * - Verifica se signal user() não é null
   *
   * NOTA:
   * Esta verificação é básica (apenas checa se existe token).
   * Não valida se o token está expirado ou é válido.
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.user() !== null;
  }

  // ==========================================================================
  // MÉTODOS: CONTROLE DE ACESSO
  // ==========================================================================

  /**
   * Verifica se o usuário tem acesso ao Painel Administrativo
   * 
   * Acesso permitido para:
   * - GESTOR: acesso completo (visualização e edição)
   * - ADMINISTRATIVO: acesso somente leitura
   * 
   * Acesso negado para:
   * - CLIENTE: sem acesso
   * 
   * @returns true se usuário tem acesso, false caso contrário
   */
  canAccessAdminPanel(): boolean {
    const currentUser = this.user();
    if (!currentUser || !currentUser.role) {
      return false;
    }
    return currentUser.role === 'GESTOR' || currentUser.role === 'ADMINISTRATIVO';
  }

  /**
   * Verifica se o usuário pode editar no Painel Administrativo
   * 
   * Apenas GESTOR pode editar.
   * ADMINISTRATIVO tem acesso somente leitura.
   * 
   * @returns true se usuário pode editar, false caso contrário
   */
  canEditAdminPanel(): boolean {
    const currentUser = this.user();
    if (!currentUser || !currentUser.role) {
      return false;
    }
    return currentUser.role === 'GESTOR';
  }

  /**
   * Verifica se o usuário é GESTOR
   * 
   * @returns true se usuário é GESTOR, false caso contrário
   */
  isGestor(): boolean {
    const currentUser = this.user();
    return currentUser?.role === 'GESTOR';
  }

  /**
   * Verifica se o usuário é ADMINISTRATIVO
   * 
   * @returns true se usuário é ADMINISTRATIVO, false caso contrário
   */
  isAdministrativo(): boolean {
    const currentUser = this.user();
    return currentUser?.role === 'ADMINISTRATIVO';
  }

  /**
   * Verifica se o usuário é CLIENTE
   * 
   * @returns true se usuário é CLIENTE, false caso contrário
   */
  isCliente(): boolean {
    const currentUser = this.user();
    return !currentUser?.role || currentUser.role === 'CLIENTE';
  }

  // ==========================================================================
  // MÉTODO: RESTORE SESSION (RESTAURAR SESSÃO)
  // ==========================================================================

  /**
   * Restaura a sessão do usuário a partir do localStorage
   *
   * QUANDO É CHAMADO:
   * - Construtor do serviço (quando aplicação carrega)
   * - Garante que usuário permaneça logado após refresh da página
   *
   * FLUXO:
   * 1. Tenta buscar token do localStorage
   * 2. Tenta buscar dados do usuário do localStorage
   * 3. Se ambos existirem, atualiza signal user()
   * 4. Se qualquer um não existir ou houver erro, ignora (usuário não logado)
   */
  private restoreSession(): void {
    try {
      // Busca token do localStorage
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

      // Busca dados do usuário do localStorage
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);

      // Se ambos existirem
      if (token && userJson) {
        // Parseia JSON para objeto User
        const user = JSON.parse(userJson) as User;

        // Valida se objeto tem estrutura correta
        if (user && typeof user === 'object' && user.email && user.name) {
          // Garante que role existe (compatibilidade com dados antigos)
          if (!user.role) {
            user.role = 'CLIENTE';
          }
          // Atualiza signal user
          this.user.set(user);
        }
      }
    } catch (error) {
      // Erro ao restaurar sessão (dados corrompidos, etc)
      // Ignora silenciosamente
      // Usuário terá que fazer login novamente
      console.error('Erro ao restaurar sessão:', error);
    }
  }
}
