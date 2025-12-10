import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { AuthService } from '../auth/auth.service';
import { MOCK_CATEGORIAS } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/categorias';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  listar(): Observable<Categoria[]> {
    // Retorna apenas categorias ativas
    const ativas = MOCK_CATEGORIAS.filter(c => c.ativa !== false);
    return of(ativas).pipe(delay(200));
  }

  buscarPorId(id: number): Observable<Categoria> {
    const categoria = MOCK_CATEGORIAS.find(c => c.id === id);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }
    return of(categoria).pipe(delay(200));
  }

  listarPrincipais(): Observable<Categoria[]> {
    // Retorna categorias principais (sem categoria pai)
    const principais = MOCK_CATEGORIAS.filter(c => !c.categoriaPaiId && c.ativa !== false);
    return of(principais).pipe(delay(200));
  }

  listarSubcategorias(categoriaId: number): Observable<Categoria[]> {
    // Retorna subcategorias de uma categoria (categorias com categoriaPaiId)
    const subcategorias = MOCK_CATEGORIAS.filter(
      c => c.categoriaPaiId === categoriaId && c.ativa !== false
    );
    return of(subcategorias).pipe(delay(200));
  }

  criar(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, categoria, {
      headers: this.getHeaders(),
    });
  }

  atualizar(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, categoria, {
      headers: this.getHeaders(),
    });
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  excluir(id: number): Observable<void> {
    return this.deletar(id);
  }

  ativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/ativar`, null, {
      headers: this.getHeaders(),
    });
  }

  desativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desativar`, null, {
      headers: this.getHeaders(),
    });
  }
}

