import { Injectable, inject, signal, effect } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarrinhoService } from '../services/carrinho.service';
import { Carrinho, ItemCarrinho } from '../models/carrinho.model';

export type CartItem = {
  id: string | number;
  title: string;
  imageUrl: string;
  price?: string;
  size?: string; // variação de tamanho selecionada
  quantity: number;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'app.cart.items.v1';
  private readonly auth = inject(AuthService);
  private readonly carrinhoService = inject(CarrinhoService);

  // Items do localStorage (para usuários não autenticados)
  private items: CartItem[] = this.loadFromStorage();

  // Carrinho do backend (para usuários autenticados)
  private readonly carrinhoBackend = signal<Carrinho | null>(null);
  private isSincronizando = false;
  // Flag para indicar se o backend está disponível
  private backendDisponivel = true;

  constructor() {
    // Observa mudanças no estado de autenticação usando effect()
    // Quando usuário faz login, sincroniza carrinho
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.sincronizarCarrinho();
      } else {
        this.carrinhoBackend.set(null);
      }
    });
  }

  /**
   * Obtém itens do carrinho
   * Se autenticado e backend disponível, usa backend; senão, usa localStorage
   */
  getItems(): CartItem[] {
    if (this.auth.isAuthenticated() && this.backendDisponivel && this.carrinhoBackend()) {
      const itensBackend = this.carrinhoBackend()!.itens;
      return this.converterItensBackendParaCartItem(itensBackend);
    }
    return this.items.slice();
  }

  /**
   * Obtém quantidade total de itens
   */
  getCount(): number {
    if (this.auth.isAuthenticated() && this.backendDisponivel && this.carrinhoBackend()) {
      return this.carrinhoBackend()!.quantidadeTotal;
    }
    return this.items.reduce((sum, it) => sum + it.quantity, 0);
  }

  /**
   * Adiciona item ao carrinho
   */
  async add(
    item: {
      id: string | number;
      title: string;
      imageUrl: string;
      price?: string;
      size?: string;
    },
    quantity = 1
  ): Promise<void> {
    // Validações antes de enviar
    if (!item.id) {
      throw new Error('ID do produto é obrigatório');
    }

    const produtoId = Number(item.id);
    if (isNaN(produtoId) || produtoId <= 0) {
      throw new Error('ID do produto inválido');
    }

    if (!quantity || quantity < 1) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    if (this.auth.isAuthenticated() && this.backendDisponivel) {
      // Usa backend
      try {
        const payload = {
          produtoId: produtoId,
          quantidade: quantity,
        };

        await firstValueFrom(this.carrinhoService.adicionarItem(payload));
        await this.carregarCarrinhoBackend();
      } catch (error: any) {
        // Verifica se é erro de conexão (backend não disponível)
        const isConnectionError = 
          error?.status === 0 || 
          error?.status === undefined ||
          error?.message?.includes('ERR_CONNECTION_REFUSED') ||
          error?.message?.includes('Unknown Error');

        if (isConnectionError) {
          console.warn('⚠️ Backend não disponível, usando localStorage como fallback');
          this.backendDisponivel = false;
          // Fallback para localStorage
          const idx = this.items.findIndex(
            (x) => x.id === item.id && x.size === item.size
          );
          if (idx >= 0) {
            this.items[idx] = {
              ...this.items[idx],
              quantity: this.items[idx].quantity + quantity,
            };
          } else {
            this.items.push({ ...item, quantity });
          }
          this.saveToStorage();
          return; // Sucesso com fallback
        }

        console.error('❌ Erro ao adicionar item ao carrinho:', error);
        console.error('📋 Detalhes do erro:', {
          status: error?.status,
          statusText: error?.statusText,
          error: error?.error,
          message: error?.message,
        });

        // Propaga erro com mensagem do backend se disponível
        if (error?.error) {
          if (error.error.errors) {
            const errors = error.error.errors;
            const mensagens = Object.values(errors).join(', ');
            throw new Error(mensagens || 'Erro de validação');
          } else if (error.error.message) {
            throw new Error(error.error.message);
          } else if (typeof error.error === 'string') {
            throw new Error(error.error);
          } else if (error.error.error) {
            throw new Error(error.error.error);
          }
        }

        if (error?.message) {
          throw new Error(error.message);
        }

        throw new Error(
          'Erro ao adicionar produto ao carrinho. Tente novamente.'
        );
      }
    } else {
      // Usa localStorage
      const idx = this.items.findIndex(
        (x) => x.id === item.id && x.size === item.size
      );
      if (idx >= 0) {
        this.items[idx] = {
          ...this.items[idx],
          quantity: this.items[idx].quantity + quantity,
        };
      } else {
        this.items.push({ ...item, quantity });
      }
      this.saveToStorage();
    }
  }

  /**
   * Decrementa quantidade de item
   */
  async decrement(
    id: string | number,
    quantity = 1,
    size?: string
  ): Promise<void> {
    if (this.auth.isAuthenticated() && this.backendDisponivel) {
      // Busca item no backend
      const carrinho = this.carrinhoBackend();
      if (!carrinho) return;

      const itemBackend = carrinho.itens.find(
        (i) => i.produtoId === Number(id)
      );
      if (!itemBackend) return;

      const novaQuantidade = itemBackend.quantidade - quantity;
      if (novaQuantidade > 0) {
        try {
          await firstValueFrom(
            this.carrinhoService.atualizarItem(itemBackend.id!, {
              quantidade: novaQuantidade,
            })
          );
          await this.carregarCarrinhoBackend();
        } catch (error: any) {
          const isConnectionError = 
            error?.status === 0 || 
            error?.status === undefined ||
            error?.message?.includes('ERR_CONNECTION_REFUSED');
          
          if (isConnectionError) {
            this.backendDisponivel = false;
            // Fallback para localStorage
            const idx = this.items.findIndex((x) => x.id === id && x.size === size);
            if (idx === -1) return;
            const newQty = this.items[idx].quantity - quantity;
            if (newQty > 0) {
              this.items[idx] = { ...this.items[idx], quantity: newQty };
            } else {
              this.items.splice(idx, 1);
            }
            this.saveToStorage();
            return;
          }
          console.error('Erro ao atualizar item:', error);
        }
      } else {
        await this.remove(id, size);
      }
    } else {
      // Usa localStorage
      const idx = this.items.findIndex((x) => x.id === id && x.size === size);
      if (idx === -1) return;
      const newQty = this.items[idx].quantity - quantity;
      if (newQty > 0) {
        this.items[idx] = { ...this.items[idx], quantity: newQty };
      } else {
        this.items.splice(idx, 1);
      }
      this.saveToStorage();
    }
  }

  /**
   * Remove item do carrinho
   */
  async remove(id: string | number, size?: string): Promise<void> {
    if (this.auth.isAuthenticated() && this.backendDisponivel) {
      // Busca item no backend
      const carrinho = this.carrinhoBackend();
      if (!carrinho) return;

      const itemBackend = carrinho.itens.find(
        (i) => i.produtoId === Number(id)
      );
      if (!itemBackend) return;

      try {
        await firstValueFrom(this.carrinhoService.removerItem(itemBackend.id!));
        await this.carregarCarrinhoBackend();
      } catch (error: any) {
        const isConnectionError = 
          error?.status === 0 || 
          error?.status === undefined ||
          error?.message?.includes('ERR_CONNECTION_REFUSED');
        
        if (isConnectionError) {
          this.backendDisponivel = false;
          // Fallback para localStorage
          this.items = this.items.filter((x) => !(x.id === id && x.size === size));
          this.saveToStorage();
          return;
        }
        console.error('Erro ao remover item:', error);
      }
    } else {
      // Usa localStorage
      this.items = this.items.filter((x) => !(x.id === id && x.size === size));
      this.saveToStorage();
    }
  }

  /**
   * Limpa o carrinho
   */
  async clear(): Promise<void> {
    if (this.auth.isAuthenticated() && this.backendDisponivel) {
      try {
        await firstValueFrom(this.carrinhoService.limparCarrinho());
        await this.carregarCarrinhoBackend();
        this.carrinhoBackend.set(null);
      } catch (error: any) {
        const isConnectionError = 
          error?.status === 0 || 
          error?.status === undefined ||
          error?.message?.includes('ERR_CONNECTION_REFUSED');
        
        if (isConnectionError) {
          this.backendDisponivel = false;
        } else {
          console.error('Erro ao limpar carrinho:', error);
        }
      }
    }
    // Sempre limpa localStorage também (para garantir)
    this.items = [];
    this.saveToStorage();
  }

  /**
   * Carrega carrinho do backend
   */
  private async carregarCarrinhoBackend(): Promise<void> {
    if (!this.auth.isAuthenticated() || !this.backendDisponivel) return;

    try {
      const carrinho = await firstValueFrom(
        this.carrinhoService.obterCarrinho()
      );
      if (carrinho.itens && carrinho.itens.length > 0) {
        // Carrinho carregado com sucesso
      }
      this.carrinhoBackend.set(carrinho);
      this.backendDisponivel = true; // Backend está funcionando
    } catch (error: any) {
      const isConnectionError = 
        error?.status === 0 || 
        error?.status === undefined ||
        error?.message?.includes('ERR_CONNECTION_REFUSED');
      
      if (isConnectionError) {
        console.warn('⚠️ Backend não disponível, usando localStorage');
        this.backendDisponivel = false;
      } else {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }

  /**
   * Sincroniza carrinho do localStorage com o backend após login
   */
  private async sincronizarCarrinho(): Promise<void> {
    if (this.isSincronizando) return;
    this.isSincronizando = true;

    try {
      // Tenta carregar carrinho do backend
      await this.carregarCarrinhoBackend();

      // Se backend não está disponível, mantém localStorage
      if (!this.backendDisponivel) {
        console.warn('⚠️ Backend não disponível, mantendo carrinho no localStorage');
        this.isSincronizando = false;
        return;
      }

      // Se há itens no localStorage, migra para o backend
      if (this.items.length > 0) {
        for (const item of this.items) {
          try {
            await firstValueFrom(
              this.carrinhoService.adicionarItem({
                produtoId: Number(item.id),
                quantidade: item.quantity,
              })
            );
          } catch (error: any) {
            const isConnectionError = 
              error?.status === 0 || 
              error?.status === undefined ||
              error?.message?.includes('ERR_CONNECTION_REFUSED');
            
            if (isConnectionError) {
              this.backendDisponivel = false;
              console.warn('⚠️ Backend não disponível durante sincronização, mantendo localStorage');
              this.isSincronizando = false;
              return;
            }
            console.error(`Erro ao migrar item ${item.id}:`, error);
          }
        }

        // Limpa localStorage após migração bem-sucedida
        this.items = [];
        this.saveToStorage();

        // Recarrega carrinho do backend
        await this.carregarCarrinhoBackend();
      }
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error);
    } finally {
      this.isSincronizando = false;
    }
  }

  /**
   * Converte itens do backend para formato CartItem
   */
  private converterItensBackendParaCartItem(itens: ItemCarrinho[]): CartItem[] {
    return itens.map((item) => {
      const cartItem: CartItem = {
        id: item.produtoId,
        title: item.produtoNome || 'Produto',
        imageUrl: this.formatarUrlImagem(item.produtoImagemUrl),
        price: this.formatarPreco(item.precoUnitario),
        quantity: item.quantidade,
        size: item.produtoPrimeiroAtributo || undefined, // Usa o primeiro atributo como "size"
      };

      // Debug: log para verificar se o atributo está sendo recebido
      if (item.produtoPrimeiroAtributo) {
        console.log(
          '📦 Atributo recebido para produto',
          item.produtoId,
          ':',
          item.produtoPrimeiroAtributo
        );
      } else {
        console.log(
          '⚠️ Nenhum atributo encontrado para produto',
          item.produtoId
        );
      }

      return cartItem;
    });
  }

  /**
   * Formata URL da imagem para garantir URL completa
   */
  private formatarUrlImagem(url?: string): string {
    if (!url) {
      return '/assets/logo/Logo-Thiers.png'; // Imagem padrão
    }

    // Se já é uma URL completa (http/https), retorna como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Se começa com /assets, retorna como está (URL local)
    if (url.startsWith('/assets')) {
      return url;
    }
    // Se começa com /, assume que é relativo ao assets
    if (url.startsWith('/')) {
      return url;
    }
    // Caso contrário, assume que é um caminho de assets
    return `/assets/${url}`;
  }

  /**
   * Formata preço para string
   */
  private formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  /**
   * Salva no localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Carrega do localStorage
   */
  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((p) => ({
        ...p,
        quantity: Math.max(1, Number(p.quantity) || 1),
      }));
    } catch {
      return [];
    }
  }
}
