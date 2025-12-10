import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstoqueMovimento } from '../models/estoque.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class EstoqueService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/estoque';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  listar(): Observable<EstoqueMovimento[]> {
    return this.http.get<EstoqueMovimento[]>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }

  buscarPorId(id: number): Observable<EstoqueMovimento> {
    return this.http.get<EstoqueMovimento>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  buscarPorProduto(produtoId: number): Observable<EstoqueMovimento[]> {
    return this.http.get<EstoqueMovimento[]>(
      `${this.baseUrl}/produto/${produtoId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  registrarMovimento(
    movimento: EstoqueMovimento
  ): Observable<EstoqueMovimento> {
    return this.http.post<EstoqueMovimento>(this.baseUrl, movimento, {
      headers: this.getHeaders(),
    });
  }
}

