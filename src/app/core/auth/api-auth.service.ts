// ============================================================================
// IMPORTS DE BIBLIOTECAS NECESSÁRIAS
// ============================================================================

// Imports do Angular Core
import { Injectable, inject } from '@angular/core';

// Imports do Angular HTTP Client
import { HttpClient } from '@angular/common/http';

// Imports do RxJS (Reactive Extensions for JavaScript)
import { Observable } from 'rxjs';

// Imports dos modelos de autenticação
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.models';

/**
 * ============================================================================
 * SERVIÇO: API AUTH SERVICE - REQUISIÇÕES HTTP DE AUTENTICAÇÃO
 * ============================================================================
 *
 * Serviço responsável por fazer requisições HTTP para os endpoints
 * de autenticação do backend.
 *
 * RESPONSABILIDADES:
 * - Fazer requisição POST para login
 * - Fazer requisição POST para cadastro/registro
 * - Centralizar configuração da URL base da API
 * - Tipar corretamente as requisições e respostas
 *
 * SEPARAÇÃO DE RESPONSABILIDADES:
 *
 * - ApiAuthService (ESTE ARQUIVO):
 *   Responsável APENAS pelas requisições HTTP
 *   Não gerencia estado, não armazena tokens, não faz lógica de negócio
 *
 * - AuthService (auth.service.ts):
 *   Responsável pelo estado da autenticação
 *   Armazena token, gerencia usuário logado, faz lógica de negócio
 *   USA ApiAuthService para fazer requisições
 *
 * PADRÃO DE ARQUITETURA:
 *
 * Component → AuthService → ApiAuthService → Backend
 *     ↑            ↑              ↓               ↓
 *     └─ UI  ─────┴─ Estado ─────┴─ HTTP ────────┴─ Database
 *
 * POR QUE SEPARAR EM DOIS SERVIÇOS?
 *
 * 1. SINGLE RESPONSIBILITY PRINCIPLE (SOLID):
 *    Cada serviço tem uma única responsabilidade
 *
 * 2. FACILITA TESTES:
 *    Podemos mockar ApiAuthService nos testes de AuthService
 *
 * 3. REUTILIZAÇÃO:
 *    ApiAuthService pode ser usado por outros serviços se necessário
 *
 * 4. MANUTENÇÃO:
 *    Mudanças na API afetam apenas ApiAuthService
 *    Mudanças no gerenciamento de estado afetam apenas AuthService
 *
 * @Injectable({ providedIn: 'root' })
 * Marca esta classe como um serviço injetável
 * providedIn: 'root' significa que é um singleton (instância única)
 * disponível em toda a aplicação
 */
@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  // ==========================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ==========================================================================

  /**
   * Cliente HTTP do Angular para fazer requisições
   *
   * HttpClient é injetado automaticamente pelo Angular.
   * É usado para fazer requisições GET, POST, PUT, DELETE, etc.
   *
   * IMPORTANTE: Para usar HttpClient, é necessário importar
   * provideHttpClient() no app.config.ts
   *
   * USO:
   * this.http.post<LoginResponse>(url, body)
   * this.http.get<User>(url)
   */
  private readonly http = inject(HttpClient);

  // ==========================================================================
  // CONFIGURAÇÃO DA URL BASE DA API
  // ==========================================================================

  /**
   * URL base da API do backend
   *
   * DESENVOLVIMENTO:
   * Aponta para o servidor local do Spring Boot na porta 8080
   *
   * PRODUÇÃO:
   * Deve ser configurado via environment ou variável de ambiente
   *
   * ESTRUTURA:
   * - Protocol: http (desenvolvimento) ou https (produção)
   * - Host: localhost (desenvolvimento) ou domínio (produção)
   * - Port: 8080 (porta padrão do Spring Boot)
   * - Path: /api/auth (prefixo dos endpoints de autenticação)
   *
   * ENDPOINTS DISPONÍVEIS:
   * - POST http://localhost:8080/api/auth/login
   * - POST http://localhost:8080/api/auth/register
   *
   * MELHORIA FUTURA:
   * Mover para arquivo de environment:
   * private readonly apiUrl = environment.apiUrl + '/api/auth';
   */
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  // ==========================================================================
  // MÉTODO: LOGIN (AUTENTICAÇÃO)
  // ==========================================================================

  /**
   * Faz requisição HTTP POST para endpoint de login
   *
   * ENDPOINT: POST /api/auth/login
   *
   * FLUXO:
   * 1. Recebe email e senha do componente
   * 2. Monta objeto LoginRequest
   * 3. Faz requisição POST para o backend
   * 4. Backend valida credenciais
   * 5. Se válido, backend retorna LoginResponse com token JWT
   * 6. Observable emite LoginResponse
   * 7. Componente/service se inscreve e processa resposta
   *
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Observable<LoginResponse> Stream que emitirá a resposta do backend
   *
   * SOBRE OBSERVABLE:
   *
   * Observable é um stream de dados assíncrono (conceito do RxJS).
   * É como uma Promise, mas mais poderoso:
   *
   * - Promise: emite 1 valor e completa
   * - Observable: pode emitir 0, 1 ou N valores ao longo do tempo
   *
   * DIFERENÇA ENTRE Observable E Promise:
   *
   * Promise (Eager):
   * - Executa imediatamente ao ser criada
   * - Não pode ser cancelada
   * - Emite 1 único valor
   *
   * Observable (Lazy):
   * - Só executa quando alguém se inscreve (.subscribe())
   * - Pode ser cancelado (unsubscribe)
   * - Pode emitir múltiplos valores
   * - Suporta operadores poderosos (map, filter, retry, etc)
   *
   * USO:
   * // No componente ou AuthService
   * this.apiAuthService.login(email, password).subscribe({
   *   next: (response) => {
   *     // Sucesso! Recebemos o token
   *     console.log('Token:', response.token);
   *     console.log('Usuário:', response.name);
   *   },
   *   error: (error) => {
   *     // Erro! Credenciais inválidas ou problema na rede
   *     console.error('Erro no login:', error);
   *   },
   *   complete: () => {
   *     // Opcional: executado quando o Observable completa
   *     console.log('Requisição finalizada');
   *   }
   * });
   *
   * ESTRUTURA DA REQUISIÇÃO:
   * POST http://localhost:8080/api/auth/login
   * Content-Type: application/json
   *
   * {
   *   "email": "usuario@email.com",
   *   "password": "senha123"
   * }
   *
   * ESTRUTURA DA RESPOSTA (SUCESSO - 200 OK):
   * {
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "type": "Bearer",
   *   "email": "usuario@email.com",
   *   "name": "João Silva"
   * }
   *
   * ESTRUTURA DA RESPOSTA (ERRO - 400 BAD REQUEST):
   * {
   *   "timestamp": "2024-10-07T14:30:00",
   *   "status": 400,
   *   "error": "Bad Request",
   *   "message": "Credenciais inválidas",
   *   "path": "/api/auth/login"
   * }
   */
  login(email: string, password: string): Observable<LoginResponse> {
    // Monta o objeto LoginRequest com os dados fornecidos
    // Este objeto será serializado para JSON automaticamente pelo HttpClient
    const request: LoginRequest = {
      email, // Equivalente a: email: email
      password, // Equivalente a: password: password
    };

    // Faz requisição HTTP POST
    //
    // this.http.post<LoginResponse>():
    // - <LoginResponse> é o tipo genérico que define o tipo da resposta
    // - TypeScript sabe que o Observable emitirá LoginResponse
    // - IDE fornece autocomplete para response.token, response.name, etc
    //
    // `${this.apiUrl}/login`:
    // - Template string que concatena a URL base com o endpoint
    // - Resultado: "http://localhost:8080/api/auth/login"
    //
    // request:
    // - Corpo da requisição (body)
    // - Será serializado para JSON automaticamente
    // - Header Content-Type: application/json é adicionado automaticamente
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
  }

  // ==========================================================================
  // MÉTODO: REGISTER (CADASTRO)
  // ==========================================================================

  /**
   * Faz requisição HTTP POST para endpoint de cadastro
   *
   * ENDPOINT: POST /api/auth/register
   *
   * FLUXO:
   * 1. Recebe dados do novo usuário do componente
   * 2. Monta objeto RegisterRequest
   * 3. Faz requisição POST para o backend
   * 4. Backend valida dados e cria usuário
   * 5. Backend gera token JWT automaticamente (login automático)
   * 6. Observable emite RegisterResponse com token
   * 7. Componente/service se inscreve e processa resposta
   *
   * @param name Nome completo do usuário
   * @param email Email do usuário
   * @param password Senha escolhida
   * @param confirmPassword Confirmação da senha
   * @returns Observable<RegisterResponse> Stream que emitirá a resposta do backend
   *
   * USO:
   * // No componente ou AuthService
   * this.apiAuthService.register(name, email, password, confirmPassword)
   *   .subscribe({
   *     next: (response) => {
   *       // Sucesso! Conta criada e token recebido
   *       console.log('Mensagem:', response.message);
   *       console.log('Token:', response.token);
   *       console.log('Usuário:', response.name);
   *     },
   *     error: (error) => {
   *       // Erro! Email duplicado, senhas diferentes, ou problema na rede
   *       console.error('Erro no cadastro:', error);
   *     }
   *   });
   *
   * ESTRUTURA DA REQUISIÇÃO:
   * POST http://localhost:8080/api/auth/register
   * Content-Type: application/json
   *
   * {
   *   "name": "João Silva",
   *   "email": "joao@email.com",
   *   "password": "senha123",
   *   "confirmPassword": "senha123"
   * }
   *
   * ESTRUTURA DA RESPOSTA (SUCESSO - 201 CREATED):
   * {
   *   "message": "Cadastro realizado com sucesso!",
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "type": "Bearer",
   *   "email": "joao@email.com",
   *   "name": "João Silva"
   * }
   *
   * ESTRUTURA DA RESPOSTA (ERRO - 400 BAD REQUEST):
   * Exemplo 1 - Email duplicado:
   * {
   *   "timestamp": "2024-10-07T14:30:00",
   *   "status": 400,
   *   "error": "Bad Request",
   *   "message": "Este e-mail já está cadastrado",
   *   "path": "/api/auth/register"
   * }
   *
   * Exemplo 2 - Senhas não coincidem:
   * {
   *   "timestamp": "2024-10-07T14:30:00",
   *   "status": 400,
   *   "error": "Bad Request",
   *   "message": "As senhas não coincidem",
   *   "path": "/api/auth/register"
   * }
   */
  register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<RegisterResponse> {
    // Monta o objeto RegisterRequest com os dados fornecidos
    const request: RegisterRequest = {
      name,
      email,
      password,
      confirmPassword,
    };

    // Log para debug
    console.log('🌐 ApiAuthService.register() chamado');
    console.log('🔗 URL:', `${this.apiUrl}/register`);
    console.log('📤 Request:', {
      name: request.name,
      email: request.email,
      password: '***',
      confirmPassword: '***',
    });

    // Faz requisição HTTP POST
    // Similar ao método login(), mas retorna RegisterResponse
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }

  // ==========================================================================
  // MÉTODOS ADICIONAIS ÚTEIS (PODEM SER IMPLEMENTADOS NO FUTURO)
  // ==========================================================================

  /**
   * EXEMPLOS DE OUTROS MÉTODOS ÚTEIS PARA AUTENTICAÇÃO:
   *
   * // Obter informações do usuário autenticado
   * getCurrentUser(token: string): Observable<User> {
   *   const headers = { Authorization: `Bearer ${token}` };
   *   return this.http.get<User>(`${this.apiUrl}/me`, { headers });
   * }
   *
   * // Renovar token (refresh)
   * refreshToken(refreshToken: string): Observable<LoginResponse> {
   *   const request = { refreshToken };
   *   return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, request);
   * }
   *
   * // Logout (se backend tiver endpoint de logout)
   * logout(token: string): Observable<void> {
   *   const headers = { Authorization: `Bearer ${token}` };
   *   return this.http.post<void>(`${this.apiUrl}/logout`, {}, { headers });
   * }
   *
   * // Solicitar recuperação de senha
   * forgotPassword(email: string): Observable<{ message: string }> {
   *   return this.http.post<{ message: string }>(
   *     `${this.apiUrl}/forgot-password`,
   *     { email }
   *   );
   * }
   *
   * // Redefinir senha com token
   * resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
   *   return this.http.post<{ message: string }>(
   *     `${this.apiUrl}/reset-password`,
   *     { token, newPassword }
   *   );
   * }
   *
   * // Alterar senha (usuário logado)
   * changePassword(
   *   oldPassword: string,
   *   newPassword: string,
   *   authToken: string
   * ): Observable<{ message: string }> {
   *   const headers = { Authorization: `Bearer ${authToken}` };
   *   return this.http.post<{ message: string }>(
   *     `${this.apiUrl}/change-password`,
   *     { oldPassword, newPassword },
   *     { headers }
   *   );
   * }
   *
   * // Validar token (verificar se ainda é válido)
   * validateToken(token: string): Observable<{ valid: boolean }> {
   *   const headers = { Authorization: `Bearer ${token}` };
   *   return this.http.get<{ valid: boolean }>(
   *     `${this.apiUrl}/validate-token`,
   *     { headers }
   *   );
   * }
   */
}
