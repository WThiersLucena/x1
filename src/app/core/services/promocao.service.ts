import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promocao } from '../models/promocao.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PromocaoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/promocoes';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  listar(): Observable<Promocao[]> {
    return this.http.get<Promocao[]>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }

  buscarPorId(id: number): Observable<Promocao> {
    return this.http.get<Promocao>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  buscarPorProduto(produtoId: number): Observable<Promocao[]> {
    return this.http.get<Promocao[]>(`${this.baseUrl}/produto/${produtoId}`, {
      headers: this.getHeaders(),
    });
  }

  criar(promocao: Promocao): Observable<Promocao> {
    return this.http.post<Promocao>(this.baseUrl, promocao, {
      headers: this.getHeaders(),
    });
  }

  atualizar(id: number, promocao: Promocao): Observable<Promocao> {
    return this.http.put<Promocao>(`${this.baseUrl}/${id}`, promocao, {
      headers: this.getHeaders(),
    });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  ativar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/ativar`, null, {
      headers: this.getHeaders(),
    });
  }

  desativar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/desativar`, null, {
      headers: this.getHeaders(),
    });
  }
}

