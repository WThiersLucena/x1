// ============================================================================
// MODELOS TYPESCRIPT PARA AUTENTICAÇÃO
// ============================================================================

/**
 * Este arquivo contém todas as interfaces TypeScript relacionadas à autenticação.
 * Estas interfaces definem a estrutura dos dados que trafegam entre frontend e backend.
 * 
 * POR QUE USAR INTERFACES?
 * 
 * 1. TYPE SAFETY: TypeScript valida os tipos em tempo de compilação
 *    Evita erros de digitação e tipos incompatíveis
 * 
 * 2. AUTOCOMPLETE: IDEs fornecem autocomplete baseado nas interfaces
 *    Aumenta produtividade e reduz erros
 * 
 * 3. DOCUMENTAÇÃO: Interfaces servem como documentação viva
 *    Deixa claro quais dados são esperados/retornados
 * 
 * 4. REFATORAÇÃO: Facilita encontrar e atualizar uso dos dados
 *    IDE pode rastrear todos os usos da interface
 * 
 * 5. CONTRATOS: Define contratos entre frontend e backend
 *    Mudanças na API causam erros de compilação (detectados cedo)
 */

// ============================================================================
// INTERFACE: LOGIN REQUEST - DADOS DE REQUISIÇÃO DE LOGIN
// ============================================================================

/**
 * Interface que define a estrutura dos dados enviados ao backend
 * na requisição de login (POST /api/auth/login)
 * 
 * ESTRUTURA JSON ESPERADA PELO BACKEND:
 * {
 *   "email": "usuario@email.com",
 *   "password": "senha123"
 * }
 * 
 * USO:
 * const loginData: LoginRequest = {
 *   email: 'usuario@email.com',
 *   password: 'senha123'
 * };
 * this.http.post<LoginResponse>('/api/auth/login', loginData);
 */
export interface LoginRequest {
  /**
   * Endereço de e-mail do usuário
   * 
   * VALIDAÇÕES (Frontend):
   * - Obrigatório (required)
   * - Formato de e-mail válido (email validator)
   * 
   * VALIDAÇÕES (Backend):
   * - @NotBlank: não pode ser vazio
   * - @Email: deve ser e-mail válido
   */
  email: string;

  /**
   * Senha do usuário
   * 
   * VALIDAÇÕES (Frontend):
   * - Obrigatório (required)
   * 
   * VALIDAÇÕES (Backend):
   * - @NotBlank: não pode ser vazio
   * 
   * SEGURANÇA:
   * - Enviada via HTTPS em produção
   * - Nunca armazenada em logs ou variáveis expostas
   * - Comparada com hash BCrypt no backend
   */
  password: string;
}

// ============================================================================
// INTERFACE: REGISTER REQUEST - DADOS DE REQUISIÇÃO DE CADASTRO
// ============================================================================

/**
 * Interface que define a estrutura dos dados enviados ao backend
 * na requisição de cadastro (POST /api/auth/register)
 * 
 * ESTRUTURA JSON ESPERADA PELO BACKEND:
 * {
 *   "name": "João Silva",
 *   "email": "joao@email.com",
 *   "password": "senha123",
 *   "confirmPassword": "senha123"
 * }
 * 
 * USO:
 * const registerData: RegisterRequest = {
 *   name: 'João Silva',
 *   email: 'joao@email.com',
 *   password: 'senha123',
 *   confirmPassword: 'senha123'
 * };
 * this.http.post<RegisterResponse>('/api/auth/register', registerData);
 */
export interface RegisterRequest {
  /**
   * Nome completo do usuário
   * 
   * VALIDAÇÕES (Frontend):
   * - Obrigatório (required)
   * - Tamanho mínimo: 2 caracteres (minLength)
   * - Tamanho máximo: 100 caracteres (maxLength)
   * 
   * VALIDAÇÕES (Backend):
   * - @NotBlank: não pode ser vazio
   * - @Size(min=2, max=100): deve ter entre 2 e 100 caracteres
   */
  name: string;

  /**
   * Endereço de e-mail do usuário
   * 
   * VALIDAÇÕES (Frontend):
   * - Obrigatório (required)
   * - Formato de e-mail válido (email validator)
   * 
   * VALIDAÇÕES (Backend):
   * - @NotBlank: não pode ser vazio
   * - @Email: deve ser e-mail válido
   * - Único no sistema (verificado no service)
   */
  email: string;

  /**
   * Senha escolhida pelo usuário
   * 
   * VALIDAÇÕES (Frontend):
   * - Obrigatório (required)
   * - Tamanho mínimo: 6 caracteres (minLength)
   * 
   * VALIDAÇÕES (Backend):
   * - @NotBlank: não pode ser vazio
   * - @Size(min=6, max=255): deve ter no mínimo 6 caracteres
   * 
   * SEGURANÇA:
   * - Criptografada com BCrypt antes de salvar no banco
   * - Nunca retornada ao frontend após cadastro
   */
  password: string;

  /**
   * Confirmação da senha (deve ser igual a password)
   * 
   * VALIDAÇÕES (Frontend):
   * - Obrigatório (required)
   * - Deve ser igual ao campo password (custom validator)
   * 
   * VALIDAÇÕES (Backend):
   * - @NotBlank: não pode ser vazio
   * - Deve ser igual ao campo password (verificado no service)
   * 
   * OBSERVAÇÃO:
   * Este campo não é salvo no banco de dados.
   * É usado apenas para validação durante o cadastro.
   */
  confirmPassword: string;
}

// ============================================================================
// INTERFACE: LOGIN RESPONSE - DADOS DE RESPOSTA DE LOGIN
// ============================================================================

/**
 * Interface que define a estrutura dos dados retornados pelo backend
 * após login bem-sucedido (POST /api/auth/login)
 * 
 * ESTRUTURA JSON RETORNADA PELO BACKEND:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "type": "Bearer",
 *   "email": "usuario@email.com",
 *   "name": "João Silva"
 * }
 * 
 * USO:
 * this.http.post<LoginResponse>('/api/auth/login', loginData)
 *   .subscribe(response => {
 *     // Armazenar token
 *     localStorage.setItem('token', response.token);
 *     // Armazenar dados do usuário
 *     this.user.set({ email: response.email, name: response.name });
 *   });
 */
export interface LoginResponse {
  /**
   * Token JWT de autenticação
   * 
   * ESTRUTURA DO JWT:
   * - Header: algoritmo e tipo
   * - Payload: email, nome, data de emissão, data de expiração
   * - Signature: assinatura criptográfica
   * 
   * COMO USAR:
   * 1. Armazenar em localStorage ou sessionStorage
   * 2. Enviar em todas as requisições autenticadas
   *    Header: Authorization: Bearer {token}
   * 3. Verificar expiração periodicamente
   * 
   * SEGURANÇA:
   * - Armazenar apenas em localStorage/sessionStorage (não em cookies)
   * - Limpar ao fazer logout
   * - Verificar validade antes de usar
   */
  token: string;

  /**
   * Tipo do token (sempre "Bearer")
   * 
   * Indica que este é um Bearer Token (RFC 6750).
   * Usado para formar o header Authorization:
   * Authorization: Bearer {token}
   * 
   * Este campo sempre terá o valor "Bearer" nesta aplicação.
   */
  type: string;

  /**
   * E-mail do usuário autenticado
   * 
   * Retornado para:
   * - Confirmar que login foi com a conta correta
   * - Exibir na interface (ex: "Bem-vindo, usuario@email.com")
   * - Armazenar no estado global da aplicação
   */
  email: string;

  /**
   * Nome do usuário autenticado
   * 
   * Retornado para:
   * - Personalização da interface (ex: "Olá, João Silva")
   * - Exibir no menu/header do usuário
   * - Armazenar no estado global da aplicação
   */
  name: string;

  /**
   * Perfil/Role do usuário no sistema
   * 
   * Valores possíveis:
   * - "CLIENTE": Usuário comum, sem acesso administrativo
   * - "GESTOR": Gerente com acesso completo ao Painel Administrativo
   * - "ADMINISTRATIVO": Administrador com acesso somente leitura
   */
  role?: string;
}

// ============================================================================
// INTERFACE: REGISTER RESPONSE - DADOS DE RESPOSTA DE CADASTRO
// ============================================================================

/**
 * Interface que define a estrutura dos dados retornados pelo backend
 * após cadastro bem-sucedido (POST /api/auth/register)
 * 
 * ESTRUTURA JSON RETORNADA PELO BACKEND:
 * {
 *   "message": "Cadastro realizado com sucesso!",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "type": "Bearer",
 *   "email": "novousuario@email.com",
 *   "name": "Novo Usuário"
 * }
 * 
 * USO:
 * this.http.post<RegisterResponse>('/api/auth/register', registerData)
 *   .subscribe(response => {
 *     // Exibir mensagem de sucesso
 *     this.showToast(response.message);
 *     // Armazenar token (login automático)
 *     localStorage.setItem('token', response.token);
 *     // Armazenar dados do usuário
 *     this.user.set({ email: response.email, name: response.name });
 *     // Redirecionar para área autenticada
 *     this.router.navigate(['/home']);
 *   });
 */
export interface RegisterResponse {
  /**
   * Mensagem de confirmação do cadastro
   * 
   * Mensagens possíveis:
   * - "Cadastro realizado com sucesso!"
   * - "Bem-vindo! Sua conta foi criada."
   * 
   * Usado para:
   * - Exibir toast/snackbar de sucesso
   * - Confirmar ao usuário que cadastro funcionou
   * - Logs de auditoria
   */
  message: string;

  /**
   * Token JWT de autenticação (login automático)
   * 
   * Após cadastro bem-sucedido, o backend gera um token
   * automaticamente para que o usuário seja autenticado
   * imediatamente, sem precisar fazer login.
   * 
   * FLUXO:
   * 1. Usuário preenche formulário de cadastro
   * 2. Backend cria a conta
   * 3. Backend gera token JWT
   * 4. Frontend recebe o token
   * 5. Frontend armazena o token
   * 6. Usuário é redirecionado para área autenticada
   * 
   * Para mais detalhes sobre o token, veja LoginResponse.token
   */
  token: string;

  /**
   * Tipo do token (sempre "Bearer")
   * 
   * Para mais detalhes, veja LoginResponse.type
   */
  type: string;

  /**
   * E-mail do novo usuário cadastrado
   * 
   * Para mais detalhes, veja LoginResponse.email
   */
  email: string;

  /**
   * Nome do novo usuário cadastrado
   * 
   * Para mais detalhes, veja LoginResponse.name
   */
  name: string;

  /**
   * Perfil/Role do novo usuário cadastrado
   * 
   * Por padrão, novos usuários são criados com perfil "CLIENTE"
   * 
   * Para mais detalhes, veja LoginResponse.role
   */
  role?: string;
}

// ============================================================================
// INTERFACE: ERROR RESPONSE - DADOS DE RESPOSTA DE ERRO
// ============================================================================

/**
 * Interface que define a estrutura dos dados retornados pelo backend
 * quando ocorre um erro (status 4xx ou 5xx)
 * 
 * ESTRUTURA JSON RETORNADA PELO BACKEND:
 * ```json
 * {
 *   "timestamp": "2024-10-07T14:30:00",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "O e-mail informado já está cadastrado",
 *   "path": "/api/auth/register"
 * }
 * ```
 * 
 * EXEMPLO DE USO:
 * ```typescript
 * this.http.post<RegisterResponse>('/api/auth/register', registerData)
 *   .subscribe({
 *     next: (response) => { ... },
 *     error: (error: HttpErrorResponse) => {
 *       const errorResponse = error.error as ErrorResponse;
 *       this.showToast(errorResponse.message, 'error');
 *       console.error('Erro:', errorResponse.status, errorResponse.message);
 *     }
 *   });
 * ```
 */
export interface ErrorResponse {
  /**
   * Data e hora em que o erro ocorreu
   * 
   * Formato ISO 8601: "2024-10-07T14:30:00"
   * 
   * Útil para:
   * - Correlacionar com logs do backend
   * - Debugging de problemas intermitentes
   * - Análise de incidentes
   */
  timestamp: string;

  /**
   * Código HTTP de status do erro
   * 
   * Códigos comuns:
   * - 400: Bad Request (dados inválidos)
   * - 401: Unauthorized (não autenticado)
   * - 403: Forbidden (sem permissão)
   * - 404: Not Found (recurso não encontrado)
   * - 409: Conflict (conflito de dados)
   * - 500: Internal Server Error (erro no servidor)
   * 
   * Usado para:
   * - Decidir ação a tomar (ex: 401 → redirecionar para login)
   * - Classificar tipo de erro em logs
   * - Métricas de erro por tipo
   */
  status: number;

  /**
   * Nome/título do tipo de erro
   * 
   * Exemplos:
   * - "Bad Request"
   * - "Unauthorized"
   * - "Internal Server Error"
   * 
   * Este é o nome técnico do erro.
   * Para mensagem amigável, use o campo 'message'.
   */
  error: string;

  /**
   * Mensagem descritiva e amigável do erro
   * 
   * Mensagens possíveis:
   * - "O e-mail informado já está cadastrado"
   * - "As senhas não coincidem"
   * - "Credenciais inválidas"
   * - "Sua sessão expirou. Por favor, faça login novamente"
   * 
   * Esta mensagem pode ser exibida diretamente ao usuário.
   * É escrita de forma clara e acionável.
   * 
   * USO:
   * // Exibir em toast/snackbar
   * this.toastService.error(errorResponse.message);
   * 
   * // Exibir em alert
   * alert(errorResponse.message);
   * 
   * // Exibir no formulário
   * this.errorMessage = errorResponse.message;
   */
  message: string;

  /**
   * Caminho/endpoint da requisição que gerou o erro
   * 
   * Exemplos:
   * - "/api/auth/login"
   * - "/api/auth/register"
   * - "/api/users/123"
   * 
   * Útil para:
   * - Debugging (saber qual endpoint falhou)
   * - Logs e monitoramento
   * - Rastreamento de erros por endpoint
   */
  path: string;
}

// ============================================================================
// INTERFACE: USER - DADOS DO USUÁRIO AUTENTICADO
// ============================================================================

/**
 * Interface que define a estrutura dos dados do usuário
 * armazenados no estado global da aplicação
 * 
 * QUANDO USAR:
 * - Estado global (service, store, signal)
 * - SessionStorage/LocalStorage
 * - Context do usuário logado
 * 
 * QUANDO NÃO USAR:
 * - Não é retornado diretamente pela API
 * - Extraído de LoginResponse ou RegisterResponse
 * 
 * USO:
 * // Em um service
 * readonly user = signal<User | null>(null);
 * 
 * // Após login
 * this.user.set({ email: response.email, name: response.name });
 * 
 * // No template
 * @if (user()) {
 *   <p>Olá, {{ user()!.name }}</p>
 * }
 */
export interface User {
  /**
   * E-mail do usuário autenticado
   */
  email: string;

  /**
   * Nome do usuário autenticado
   */
  name: string;

  /**
   * Perfil/Role do usuário no sistema
   * 
   * Valores possíveis:
   * - "CLIENTE": Usuário comum, sem acesso administrativo
   * - "GESTOR": Gerente com acesso completo ao Painel Administrativo
   * - "ADMINISTRATIVO": Administrador com acesso somente leitura
   */
  role?: string;
}

// ============================================================================
// TYPE GUARDS (VALIDADORES DE TIPO)
// ============================================================================

/**
 * Valida se um objeto é um ErrorResponse válido
 * 
 * Type guard que verifica se um objeto tem a estrutura de ErrorResponse.
 * Útil quando o tipo do erro não é conhecido (ex: erro de rede vs erro da API).
 * 
 * @param error Objeto a ser validado
 * @returns true se for um ErrorResponse, false caso contrário
 * 
 * USO:
 * error: (err: any) => {
 *   if (isErrorResponse(err.error)) {
 *     // É um erro da API, tem estrutura padronizada
 *     this.showToast(err.error.message);
 *   } else {
 *     // É outro tipo de erro (rede, timeout, etc)
 *     this.showToast('Erro de conexão. Tente novamente.');
 *   }
 * }
 */
export function isErrorResponse(error: any): error is ErrorResponse {
  return (
    error &&
    typeof error === 'object' &&
    typeof error.timestamp === 'string' &&
    typeof error.status === 'number' &&
    typeof error.error === 'string' &&
    typeof error.message === 'string' &&
    typeof error.path === 'string'
  );
}

// ============================================================================
// CONSTANTES ÚTEIS
// ============================================================================

/**
 * Chaves para armazenamento local (localStorage/sessionStorage)
 * 
 * Centraliza as chaves usadas para armazenar dados no navegador.
 * Evita duplicação de strings e facilita manutenção.
 * 
 * USO:
 * // Salvar token
 * localStorage.setItem(STORAGE_KEYS.TOKEN, token);
 * 
 * // Recuperar token
 * const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
 * 
 * // Remover token
 * localStorage.removeItem(STORAGE_KEYS.TOKEN);
 */
export const STORAGE_KEYS = {
  /**
   * Chave para armazenar o token JWT
   */
  TOKEN: 'casasanches_auth_token',

  /**
   * Chave para armazenar dados do usuário
   */
  USER: 'casasanches_auth_user',
} as const;

