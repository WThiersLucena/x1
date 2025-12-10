import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Subcategoria } from '../models/subcategoria.model';
import { AuthService } from '../auth/auth.service';
import { MOCK_SUBCATEGORIAS } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class SubcategoriaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/subcategorias';

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
   * Lista todas as subcategorias (sem paginação) (MOCKADO)
   */
  listar(): Observable<Subcategoria[]> {
    const ativas = MOCK_SUBCATEGORIAS.filter(s => s.ativa !== false);
    return of(ativas).pipe(delay(200));
  }

  /**
   * Lista subcategorias por categoria pai (MOCKADO)
   */
  listarPorCategoria(categoriaId: number): Observable<Subcategoria[]> {
    const subcategorias = MOCK_SUBCATEGORIAS.filter(
      s => s.categoriaId === categoriaId && s.ativa !== false
    );
    return of(subcategorias).pipe(delay(200));
  }

  /**
   * Busca subcategoria por ID (MOCKADO)
   */
  buscarPorId(id: number): Observable<Subcategoria> {
    const subcategoria = MOCK_SUBCATEGORIAS.find(s => s.id === id);
    if (!subcategoria) {
      throw new Error('Subcategoria não encontrada');
    }
    return of(subcategoria).pipe(delay(200));
  }

  /**
   * Busca subcategorias por nome (com paginação)
   */
  buscarPorNome(
    nome: string,
    page = 0,
    size = 20
  ): Observable<{
    content: Subcategoria[];
    totalElements: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('nome', nome)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<{
      content: Subcategoria[];
      totalElements: number;
      totalPages: number;
    }>(`${this.baseUrl}/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  /**
   * Cria uma nova subcategoria
   */
  criar(subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(this.baseUrl, subcategoria, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Atualiza uma subcategoria existente
   */
  atualizar(id: number, subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.baseUrl}/${id}`, subcategoria, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Ativa uma subcategoria
   */
  ativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/ativar`, null, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Desativa uma subcategoria (soft delete)
   */
  desativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desativar`, null, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Deleta permanentemente uma subcategoria
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
