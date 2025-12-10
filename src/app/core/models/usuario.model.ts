/**
 * Interface que representa um Usuário
 */
export interface Usuario {
  id?: number;
  name: string;
  email: string;
}

/**
 * Interface para alteração de senha
 */
export interface AlterarSenha {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoSenha: string;
}

