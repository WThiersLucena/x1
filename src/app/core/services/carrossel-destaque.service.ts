import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarrosselDestaque } from '../models/carrossel-destaque.model';

@Injectable({
  providedIn: 'root',
})
export class CarrosselDestaqueService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/carrossel-destaque';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Lista todos os itens ativos do carrossel
   */
  listarAtivos(): Observable<CarrosselDestaque[]> {
    return this.http.get<CarrosselDestaque[]>(`${this.baseUrl}/ativos`);
  }

  /**
   * Lista todos os itens do carrossel (incluindo inativos)
   */
  listarTodos(): Observable<CarrosselDestaque[]> {
    return this.http.get<CarrosselDestaque[]>(this.baseUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Busca um item por ID
   */
  buscarPorId(id: number): Observable<CarrosselDestaque> {
    return this.http.get<CarrosselDestaque>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Cria um novo item do carrossel
   */
  criar(item: CarrosselDestaque): Observable<CarrosselDestaque> {
    return this.http.post<CarrosselDestaque>(this.baseUrl, item, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Atualiza um item do carrossel
   */
  atualizar(id: number, item: CarrosselDestaque): Observable<CarrosselDestaque> {
    return this.http.put<CarrosselDestaque>(`${this.baseUrl}/${id}`, item, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Remove um item do carrossel
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Ativa um item do carrossel
   */
  ativar(id: number): Observable<CarrosselDestaque> {
    return this.http.patch<CarrosselDestaque>(`${this.baseUrl}/${id}/ativar`, {}, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Desativa um item do carrossel
   */
  desativar(id: number): Observable<CarrosselDestaque> {
    return this.http.patch<CarrosselDestaque>(`${this.baseUrl}/${id}/desativar`, {}, {
      headers: this.getHeaders(),
    });
  }
}



