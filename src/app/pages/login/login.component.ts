import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isRegisterPage = signal(false);
  readonly isLoading = signal(false);

  ngOnInit() {
    // Detecta se está na rota /register
    this.isRegisterPage.set(this.router.url === '/register');
  }

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly registerForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Método chamado quando o usuário submete o formulário de login
   *
   * FLUXO:
   * 1. Valida se o formulário está válido
   * 2. Se inválido, marca todos os campos como tocados para mostrar erros
   * 3. Se válido, extrai email e senha do formulário
   * 4. Ativa estado de carregamento (spinner/loading)
   * 5. Chama authService.login() que faz requisição ao backend
   * 6. Se sucesso, redireciona para home
   * 7. Se erro, exibe mensagem de erro
   * 8. Em qualquer caso, desativa estado de carregamento
   */
  async submitLogin() {
    // ======================================================================
    // PASSO 1: VALIDAR FORMULÁRIO
    // ======================================================================

    // Verifica se o formulário está válido
    // Validações: email obrigatório e formato válido, senha obrigatória
    if (!this.loginForm.valid) {
      // Se inválido, marca todos os campos como tocados
      // Isso faz com que os erros sejam exibidos no template
      this.loginForm.markAllAsTouched();
      return;
    }

    // ======================================================================
    // PASSO 2: EXTRAIR DADOS DO FORMULÁRIO
    // ======================================================================

    // Extrai email e senha dos valores do formulário
    // this.loginForm.value retorna um objeto com os valores
    const { email, password } = this.loginForm.value;

    // ======================================================================
    // PASSO 3: ATIVAR ESTADO DE CARREGAMENTO
    // ======================================================================

    // Ativa spinner/loading no botão
    // Template usa isLoading() para desabilitar botão e mostrar "Carregando..."
    this.isLoading.set(true);

    try {
      // ====================================================================
      // PASSO 4: FAZER LOGIN
      // ====================================================================

      // Chama authService.login() que:
      // 1. Faz POST /api/auth/login no backend
      // 2. Se sucesso, salva token e dados do usuário
      // 3. Retorna true se sucesso, false se erro
      //
      // String(email) e String(password) garantem que são strings
      // (TypeScript sabe que podem ser string | undefined | null)
      const success = await this.auth.login(String(email), String(password));

      // ====================================================================
      // PASSO 5: PROCESSAR RESULTADO
      // ====================================================================

      if (success) {
        // Login bem-sucedido!
        // Redireciona para a página home
        this.router.navigateByUrl('/home');
      } else {
        // Login falhou (credenciais inválidas)
        // Exibe mensagem de erro ao usuário
        //
        // MELHORIA FUTURA: Usar toast/snackbar ao invés de alert
        alert('Credenciais inválidas');
      }
    } catch (error) {
      // ====================================================================
      // TRATAMENTO DE ERRO
      // ====================================================================

      // Captura qualquer erro inesperado
      // (erro de rede, timeout, erro do backend, etc)
      console.error('Erro ao autenticar:', error);

      // Exibe mensagem genérica de erro
      // MELHORIA FUTURA: Tratar diferentes tipos de erro
      alert('Erro ao autenticar. Por favor, tente novamente.');
    } finally {
      // ====================================================================
      // FINALIZAÇÃO (SEMPRE EXECUTADO)
      // ====================================================================

      // Desativa spinner/loading
      // finally garante que isso sempre seja executado,
      // independente de sucesso ou erro
      this.isLoading.set(false);
    }
  }

  /**
   * Método chamado quando o usuário submete o formulário de cadastro
   *
   * FLUXO:
   * 1. Valida se o formulário está válido (incluindo senhas iguais)
   * 2. Se inválido, marca todos os campos como tocados para mostrar erros
   * 3. Se válido, extrai dados do formulário
   * 4. Ativa estado de carregamento
   * 5. Chama authService.register() que faz requisição ao backend
   * 6. Se sucesso, redireciona para home (login automático)
   * 7. Se erro, exibe mensagem de erro
   * 8. Em qualquer caso, desativa estado de carregamento
   */
  async submitRegister() {
    console.log('🎯 ========== BOTÃO CADASTRAR-SE CLICADO! ==========');
    console.log('📅 Timestamp:', new Date().toISOString());

    // ======================================================================
    // PASSO 1: VALIDAR FORMULÁRIO
    // ======================================================================

    console.log('🔍 Verificando validade do formulário...');
    console.log('📋 registerForm.valid:', this.registerForm.valid);
    console.log('📋 registerForm.value:', this.registerForm.value);

    // Marca todos os campos como tocados para mostrar erros
    this.registerForm.markAllAsTouched();

    // Valida se o formulário está válido
    if (!this.registerForm.valid) {
      console.warn('❌ Formulário inválido!');
      alert('⚠️ Por favor, preencha todos os campos corretamente!');
      return;
    }

    // ======================================================================
    // PASSO 2: EXTRAIR DADOS DO FORMULÁRIO
    // ======================================================================

    // Extrai todos os dados do formulário de cadastro
    const { name, email, password, confirmPassword } = this.registerForm.value;

    // Valida se as senhas coincidem
    if (password !== confirmPassword) {
      console.warn('❌ Senhas não coincidem!');
      alert('⚠️ As senhas não coincidem!');
      return;
    }

    console.log('✅ Formulário válido! Prosseguindo com o cadastro...');

    // ======================================================================
    // DEBUG: EXIBIR DADOS NO CONSOLE
    // ======================================================================

    console.log('📝 Dados do formulário de cadastro:', {
      name,
      email,
      password: '***', // Oculta senha por segurança
      confirmPassword: '***', // Oculta senha por segurança
      passwordsMatch: password === confirmPassword,
    });

    console.log(
      '🚀 Iniciando requisição para: POST http://localhost:8080/api/auth/register'
    );
    console.log('📦 Payload que será enviado:', {
      name,
      email,
      password: '***',
      confirmPassword: '***',
    });

    // ======================================================================
    // PASSO 3: ATIVAR ESTADO DE CARREGAMENTO
    // ======================================================================

    this.isLoading.set(true);

    try {
      // ====================================================================
      // PASSO 4: FAZER CADASTRO
      // ====================================================================

      console.log('⏳ Aguardando resposta do backend...');

      // Chama authService.register() que:
      // 1. Faz POST /api/auth/register no backend
      // 2. Backend cria usuário e gera token JWT
      // 3. Se sucesso, salva token e dados do usuário (login automático)
      // 4. Retorna true se sucesso, false se erro
      const success = await this.auth.register(
        String(name),
        String(email),
        String(password),
        String(confirmPassword)
      );

      // ====================================================================
      // PASSO 5: PROCESSAR RESULTADO
      // ====================================================================

      if (success) {
        // Cadastro bem-sucedido!
        console.log('✅ Cadastro realizado com sucesso!');
        console.log('🔐 Token JWT salvo no localStorage');
        console.log('👤 Usuário autenticado automaticamente');

        // Usuário foi automaticamente autenticado
        // Redireciona para a página home
        console.log('🔄 Redirecionando para /home...');
        this.router.navigateByUrl('/home');
      } else {
        // Cadastro falhou (email duplicado, senhas não coincidem, etc)
        console.error('❌ Cadastro falhou - Resposta do backend: false');

        // Exibe mensagem de erro ao usuário
        alert('Erro no cadastro. Por favor, verifique os dados.');
      }
    } catch (error: any) {
      // ====================================================================
      // TRATAMENTO DE ERRO
      // ====================================================================

      console.error('❌ Erro ao cadastrar:', error);

      // Tenta extrair mensagem do erro
      let errorMessage = 'Erro ao cadastrar. Por favor, tente novamente.';

      if (error?.error?.message) {
        errorMessage = error.error.message;
        console.error('📝 Mensagem do backend:', error.error.message);
      }

      if (error?.status) {
        console.error('🔢 Status HTTP:', error.status);
      }

      if (error?.error) {
        console.error('📦 Corpo da resposta de erro:', error.error);
      }

      // Exibe mensagem de erro ao usuário
      alert(errorMessage);
    } finally {
      // ====================================================================
      // FINALIZAÇÃO
      // ====================================================================

      console.log('🏁 Finalizando requisição de cadastro');

      // Desativa spinner/loading
      this.isLoading.set(false);
    }
  }
}
