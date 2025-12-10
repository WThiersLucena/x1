import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Segmento } from '../models/segmento.model';
import { AuthService } from '../auth/auth.service';
import { MOCK_SEGMENTOS } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class SegmentoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/segmentos';

  /**
   * Retorna headers HTTP com Authorization
   */
  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Lista todos os segmentos (sem paginação) (MOCKADO)
   */
  listar(): Observable<Segmento[]> {
    const ativos = MOCK_SEGMENTOS.filter(s => s.ativa !== false);
    return of(ativos).pipe(delay(200));
  }

  /**
   * Lista segmentos por subcategoria pai (MOCKADO)
   */
  listarPorSubcategoria(subcategoriaId: number): Observable<Segmento[]> {
    const segmentos = MOCK_SEGMENTOS.filter(
      s => s.subcategoriaId === subcategoriaId && s.ativa !== false
    );
    return of(segmentos).pipe(delay(200));
  }

  /**
   * Busca segmento por ID (MOCKADO)
   */
  buscarPorId(id: number): Observable<Segmento> {
    const segmento = MOCK_SEGMENTOS.find(s => s.id === id);
    if (!segmento) {
      throw new Error('Segmento não encontrado');
    }
    return of(segmento).pipe(delay(200));
  }

  /**
   * Busca segmentos por nome (com paginação)
   */
  buscarPorNome(
    nome: string,
    page = 0,
    size = 20
  ): Observable<{
    content: Segmento[];
    totalElements: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('nome', nome)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<{
      content: Segmento[];
      totalElements: number;
      totalPages: number;
    }>(`${this.baseUrl}/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  /**
   * Cria um novo segmento
   */
  criar(segmento: Segmento): Observable<Segmento> {
    return this.http.post<Segmento>(this.baseUrl, segmento, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Atualiza um segmento existente
   */
  atualizar(id: number, segmento: Segmento): Observable<Segmento> {
    return this.http.put<Segmento>(`${this.baseUrl}/${id}`, segmento, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Ativa um segmento
   */
  ativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/ativar`, null, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Desativa um segmento (soft delete)
   */
  desativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desativar`, null, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Deleta permanentemente um segmento
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

