import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Endereco } from '../models/endereco.model';

/**
 * Service para gerenciamento de Endereços
 * Consome a API REST do backend
 */
@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/enderecos';

  /**
   * Cria os headers com o token JWT
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('casasanches_auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todos os endereços do usuário autenticado
   */
  listar(): Observable<Endereco[]> {
    return this.http.get<Endereco[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Busca um endereço por ID
   */
  buscarPorId(id: number): Observable<Endereco> {
    return this.http.get<Endereco>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Cria um novo endereço
   */
  criar(endereco: Endereco): Observable<Endereco> {
    return this.http.post<Endereco>(this.apiUrl, endereco, {
      headers: this.getHeaders()
    });
  }

  /**
   * Atualiza um endereço existente
   */
  atualizar(id: number, endereco: Endereco): Observable<Endereco> {
    return this.http.put<Endereco>(`${this.apiUrl}/${id}`, endereco, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exclui um endereço
   */
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}

