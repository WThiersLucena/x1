import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Telefone } from '../models/telefone.model';

/**
 * Service para gerenciamento de Telefones
 * Consome a API REST do backend
 */
@Injectable({
  providedIn: 'root'
})
export class TelefoneService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/telefones';

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
   * Lista todos os telefones do usuário autenticado
   */
  listar(): Observable<Telefone[]> {
    return this.http.get<Telefone[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Busca um telefone por ID
   */
  buscarPorId(id: number): Observable<Telefone> {
    return this.http.get<Telefone>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Cria um novo telefone
   */
  criar(telefone: Telefone): Observable<Telefone> {
    return this.http.post<Telefone>(this.apiUrl, telefone, {
      headers: this.getHeaders()
    });
  }

  /**
   * Atualiza um telefone existente
   */
  atualizar(id: number, telefone: Telefone): Observable<Telefone> {
    return this.http.put<Telefone>(`${this.apiUrl}/${id}`, telefone, {
      headers: this.getHeaders()
    });
  }

  /**
   * Exclui um telefone
   */
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}

