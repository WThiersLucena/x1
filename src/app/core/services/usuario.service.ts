import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AlterarSenha, Usuario } from '../models/usuario.model';

/**
 * Service para gerenciamento de dados do Usuário
 * Consome a API REST do backend
 */
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/usuario';

  /**
   * Cria os headers com o token JWT
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('casasanches_auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Busca os dados do usuário autenticado
   */
  buscarDados(): Observable<Usuario> {
    return this.http.get<Usuario>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Atualiza os dados do usuário (nome e email)
   */
  atualizarDados(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.apiUrl, usuario, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Altera a senha do usuário
   */
  alterarSenha(dados: AlterarSenha): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/senha`, dados, {
      headers: this.getHeaders(),
    });
  }
}
