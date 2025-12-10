import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Carrinho, ItemCarrinho, AdicionarItemCarrinho, AtualizarItemCarrinho } from '../models/carrinho.model';

@Injectable({
  providedIn: 'root',
})
export class CarrinhoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/carrinho';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Obtém o carrinho do usuário autenticado
   */
  obterCarrinho(): Observable<Carrinho> {
    return this.http.get<Carrinho>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Adiciona um item ao carrinho
   */
  adicionarItem(item: AdicionarItemCarrinho): Observable<Carrinho> {
    return this.http.post<Carrinho>(`${this.baseUrl}/itens`, item, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   */
  atualizarItem(itemId: number, item: AtualizarItemCarrinho): Observable<Carrinho> {
    return this.http.put<Carrinho>(`${this.baseUrl}/itens/${itemId}`, item, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Remove um item do carrinho
   */
  removerItem(itemId: number): Observable<Carrinho> {
    return this.http.delete<Carrinho>(`${this.baseUrl}/itens/${itemId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Limpa todos os itens do carrinho
   */
  limparCarrinho(): Observable<void> {
    return this.http.delete<void>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }
}



