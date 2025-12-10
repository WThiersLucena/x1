import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Produto } from '../models/produto.model';
import { AuthService } from '../auth/auth.service';
import { MOCK_PRODUTOS } from '../data/mock-data';

// Interface para resposta paginada
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/produtos';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Lista todos os produtos sem paginação (mantido para compatibilidade) (MOCKADO)
  listar(): Observable<Produto[]> {
    return of([...MOCK_PRODUTOS]).pipe(delay(200));
  }

  // Lista todos os produtos com paginação (MOCKADO)
  listarPaginado(page: number = 0, size: number = 10): Observable<PageResponse<Produto>> {
    const start = page * size;
    const end = start + size;
    const produtos = [...MOCK_PRODUTOS].slice(start, end);
    
    return of({
      content: produtos,
      totalElements: MOCK_PRODUTOS.length,
      totalPages: Math.ceil(MOCK_PRODUTOS.length / size),
      size: size,
      number: page,
    }).pipe(delay(300));
  }

  buscarPorId(id: number): Observable<Produto> {
    const produto = MOCK_PRODUTOS.find(p => p.id === id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    return of(produto).pipe(delay(200));
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, produto, {
      headers: this.getHeaders(),
    });
  }

  criarComImagens(formData: FormData): Observable<Produto> {
    const token = this.auth.getToken() || '';
    // Não incluir Content-Type, o browser define automaticamente com boundary
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<Produto>(`${this.baseUrl}/com-imagens`, formData, {
      headers,
    });
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, produto, {
      headers: this.getHeaders(),
    });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
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

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Busca produtos mais vendidos (endpoint público) (MOCKADO)
  buscarMaisVendidos(page: number = 0, size: number = 20): Observable<PageResponse<Produto>> {
    const maisVendidos = MOCK_PRODUTOS.filter(p => p.maisVendido === true);
    const start = page * size;
    const end = start + size;
    const produtos = [...maisVendidos].slice(start, end);
    
    return of({
      content: produtos,
      totalElements: maisVendidos.length,
      totalPages: Math.ceil(maisVendidos.length / size),
      size: size,
      number: page,
    }).pipe(delay(300));
  }

  // Busca produtos por nome com paginação (MOCKADO)
  buscarPorNome(nome: string, page: number = 0, size: number = 10): Observable<PageResponse<Produto>> {
    const filtrados = MOCK_PRODUTOS.filter(p => 
      p.nome.toLowerCase().includes(nome.toLowerCase())
    );
    const start = page * size;
    const end = start + size;
    const produtos = [...filtrados].slice(start, end);
    
    return of({
      content: produtos,
      totalElements: filtrados.length,
      totalPages: Math.ceil(filtrados.length / size),
      size: size,
      number: page,
    }).pipe(delay(300));
  }

  // Lista produtos ativos com paginação (MOCKADO)
  listarAtivos(page: number = 0, size: number = 10): Observable<PageResponse<Produto>> {
    const ativos = MOCK_PRODUTOS.filter(p => p.ativo !== false);
    const start = page * size;
    const end = start + size;
    const produtos = [...ativos].slice(start, end);
    
    return of({
      content: produtos,
      totalElements: ativos.length,
      totalPages: Math.ceil(ativos.length / size),
      size: size,
      number: page,
    }).pipe(delay(300));
  }
}
