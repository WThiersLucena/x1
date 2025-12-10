import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * ============================================================================
 * INTERFACE: RESPOSTA DA API VIACEP
 * ============================================================================
 */
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean; // Retornado quando CEP não existe
}

/**
 * ============================================================================
 * SERVIÇO: VIACEP SERVICE - CONSULTA DE ENDEREÇO POR CEP
 * ============================================================================
 *
 * Serviço responsável por buscar dados de endereço através do CEP
 * utilizando a API pública ViaCEP (https://viacep.com.br/)
 *
 * FUNCIONALIDADES:
 * - Buscar endereço completo por CEP
 * - Validar formato do CEP
 * - Tratar erros de CEP inválido ou não encontrado
 *
 * API VIACEP:
 * - Endpoint: https://viacep.com.br/ws/{cep}/json/
 * - Formato do CEP: 8 dígitos (com ou sem hífen)
 * - Gratuita e sem necessidade de autenticação
 *
 * EXEMPLO DE USO:
 * ```typescript
 * this.viaCepService.buscarCep('01310-100').subscribe({
 *   next: (dados) => {
 *     if (dados) {
 *       this.form.patchValue({
 *         logradouro: dados.logradouro,
 *         bairro: dados.bairro,
 *         cidade: dados.localidade,
 *         estado: dados.uf
 *       });
 *     }
 *   },
 *   error: (err) => console.error('Erro ao buscar CEP:', err)
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ViaCepService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://viacep.com.br/ws';

  /**
   * Busca dados de endereço por CEP
   *
   * @param cep - CEP a ser consultado (com ou sem hífen)
   * @returns Observable com dados do endereço ou null se não encontrado
   *
   * VALIDAÇÕES:
   * - Remove caracteres não numéricos
   * - Verifica se tem 8 dígitos
   * - Retorna null se CEP inválido
   *
   * TRATAMENTO DE ERROS:
   * - Retorna null em caso de erro de rede
   * - Retorna null se CEP não encontrado (erro: true)
   */
  buscarCep(cep: string): Observable<ViaCepResponse | null> {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      console.warn('❌ CEP inválido: deve ter 8 dígitos');
      return of(null);
    }

    console.log(`🔍 Buscando CEP: ${cepLimpo}...`);

    // Faz a requisição para a API ViaCEP
    return this.http
      .get<ViaCepResponse>(`${this.apiUrl}/${cepLimpo}/json/`)
      .pipe(
        map((response) => {
          // Verifica se a API retornou erro (CEP não encontrado)
          if (response.erro) {
            console.warn('⚠️ CEP não encontrado na base do ViaCEP');
            return null;
          }

          console.log('✅ CEP encontrado:', response);
          return response;
        }),
        catchError((error) => {
          console.error('❌ Erro ao buscar CEP:', error);
          return of(null);
        })
      );
  }

  /**
   * Valida formato do CEP
   *
   * @param cep - CEP a ser validado
   * @returns true se o CEP está no formato válido (00000-000 ou 00000000)
   */
  validarFormatoCep(cep: string): boolean {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  }

  /**
   * Formata CEP para o padrão 00000-000
   *
   * @param cep - CEP a ser formatado
   * @returns CEP formatado ou string vazia se inválido
   */
  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return '';
    }

    return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
  }
}

