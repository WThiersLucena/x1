import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Fornecedor } from '../models/fornecedor.model';
import { AuthService } from '../auth/auth.service';
import { MOCK_FORNECEDORES } from '../data/mock-data';

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
export class FornecedorService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/fornecedores';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Lista todos os fornecedores com paginação (MOCKADO)
   */
  listar(page: number = 0, size: number = 10, sort: string = 'nome'): Observable<PageResponse<Fornecedor>> {
    // Simula delay de rede
    const start = page * size;
    const end = start + size;
    const fornecedores = [...MOCK_FORNECEDORES].slice(start, end);
    
    return of({
      content: fornecedores,
      totalElements: MOCK_FORNECEDORES.length,
      totalPages: Math.ceil(MOCK_FORNECEDORES.length / size),
      size: size,
      number: page,
    }).pipe(delay(300)); // Simula delay de rede
  }

  /**
   * Busca fornecedor por ID (MOCKADO)
   */
  buscarPorId(id: number): Observable<Fornecedor> {
    const fornecedor = MOCK_FORNECEDORES.find(f => f.id === id);
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado');
    }
    return of(fornecedor).pipe(delay(200));
  }

  /**
   * Lista fornecedores ativos com paginação (MOCKADO)
   */
  listarAtivos(page: number = 0, size: number = 10, sort: string = 'nome'): Observable<PageResponse<Fornecedor>> {
    const ativos = MOCK_FORNECEDORES.filter(f => f.ativo !== false);
    const start = page * size;
    const end = start + size;
    const fornecedores = [...ativos].slice(start, end);
    
    return of({
      content: fornecedores,
      totalElements: ativos.length,
      totalPages: Math.ceil(ativos.length / size),
      size: size,
      number: page,
    }).pipe(delay(300));
  }

  /**
   * Lista fornecedores ativos sem paginação (para selects) (MOCKADO)
   */
  listarAtivosSemPaginacao(): Observable<Fornecedor[]> {
    const ativos = MOCK_FORNECEDORES.filter(f => f.ativo !== false);
    return of(ativos).pipe(delay(200));
  }

  /**
   * Busca fornecedores por nome (MOCKADO)
   */
  buscarPorNome(nome: string, page: number = 0, size: number = 10, sort: string = 'nome'): Observable<PageResponse<Fornecedor>> {
    const filtrados = MOCK_FORNECEDORES.filter(f => 
      f.nome.toLowerCase().includes(nome.toLowerCase())
    );
    const start = page * size;
    const end = start + size;
    const fornecedores = [...filtrados].slice(start, end);
    
    return of({
      content: fornecedores,
      totalElements: filtrados.length,
      totalPages: Math.ceil(filtrados.length / size),
      size: size,
      number: page,
    }).pipe(delay(300));
  }

  /**
   * Cria um novo fornecedor
   */
  criar(fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, fornecedor, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Atualiza um fornecedor existente
   */
  atualizar(id: number, fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}`, fornecedor, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Deleta um fornecedor permanentemente
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Alias para deletar
   */
  excluir(id: number): Observable<void> {
    return this.deletar(id);
  }

  /**
   * Ativa um fornecedor
   */
  ativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/ativar`, null, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Desativa um fornecedor
   */
  desativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desativar`, null, {
      headers: this.getHeaders(),
    });
  }
}
