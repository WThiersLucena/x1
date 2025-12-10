import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Pedido, CriarPedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/pedidos';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Cria um novo pedido a partir do carrinho
   */
  criarPedido(dto: CriarPedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, dto, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Lista todos os pedidos do usuário autenticado
   */
  listarPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Busca um pedido específico por ID
   */
  buscarPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Cancela um pedido
   */
  cancelarPedido(id: number): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/${id}/cancelar`, {}, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Gera PDF do pedido
   */
  gerarPdfPedido(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  /**
   * Gera link público temporário para PDF do pedido
   */
  gerarLinkPdfPedido(id: number): Observable<{ link: string }> {
    return this.http.get<{ link: string }>(`${this.baseUrl}/${id}/pdf-link`, {
      headers: this.getHeaders(),
    });
  }
}

