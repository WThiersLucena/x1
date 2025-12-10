import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PedidoService } from '../../core/services/pedido.service';
import { AuthService } from '../../core/auth/auth.service';
import { Pedido } from '../../core/models/pedido.model';
import { CartService } from '../../core/cart/cart.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pedidoService = inject(PedidoService);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);

  readonly pedido = signal<Pedido | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly WHATSAPP_NUMBER = '5511982539200';

  ngOnInit() {
    // Verifica se usuário está autenticado
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarPedido();
  }

  /**
   * Carrega os dados do pedido
   */
  async carregarPedido() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const pedidoId = this.route.snapshot.queryParams['pedidoId'];
      
      if (!pedidoId) {
        this.error.set('Pedido não encontrado.');
        this.isLoading.set(false);
        return;
      }

      const pedido = await firstValueFrom(
        this.pedidoService.buscarPorId(Number(pedidoId))
      );

      this.pedido.set(pedido);
    } catch (error: any) {
      console.error('Erro ao carregar pedido:', error);
      this.error.set(
        error?.error?.message || 'Erro ao carregar dados do pedido.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formata valor monetário
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  /**
   * Gera a mensagem do WhatsApp com o resumo do pedido
   */
  gerarMensagemWhatsApp(): string {
    const pedido = this.pedido();
    const usuario = this.auth.user();

    if (!pedido || !usuario) {
      return '';
    }

    let mensagem = `Olá! Meu nome é *${usuario.name || 'Cliente'}* e gostaria de finalizar meu pedido.\n\n`;
    mensagem += `*Resumo do Pedido nº ${pedido.numeroPedido || pedido.id}*\n\n`;
    mensagem += `*Detalhe dos Itens:*\n\n`;

    pedido.itens.forEach((item, index) => {
      mensagem += `${index + 1}. *${item.produtoNome || 'Produto'}*\n`;
      mensagem += `   • Quantidade: ${item.quantidade}\n`;
      mensagem += `   • Valor unitário: ${this.formatarValor(item.precoUnitario)}\n`;
      mensagem += `   • Subtotal: ${this.formatarValor(item.subtotal)}\n\n`;
    });

    mensagem += `*Subtotal:* ${this.formatarValor(pedido.subtotal)}\n`;
    
    if (pedido.valorFrete > 0) {
      mensagem += `*Frete:* ${this.formatarValor(pedido.valorFrete)}\n`;
    }
    
    if (pedido.valorDesconto > 0) {
      mensagem += `*Desconto:* ${this.formatarValor(pedido.valorDesconto)}\n`;
    }
    
    mensagem += `*Total:* ${this.formatarValor(pedido.valorTotal)}\n\n`;
    mensagem += `*Canal de Venda:* WhatsApp`;

    return mensagem;
  }

  /**
   * Gera link do PDF e abre WhatsApp com link na mensagem
   */
  async abrirWhatsApp() {
    const pedido = this.pedido();
    if (!pedido || !pedido.id) {
      console.error('Pedido não encontrado');
      return;
    }

    try {
      console.log('🔄 Gerando link do PDF para pedido:', pedido.id);
      
      // Gera o link público temporário para o PDF
      const response = await firstValueFrom(
        this.pedidoService.gerarLinkPdfPedido(pedido.id)
      );
      
      console.log('✅ Resposta do backend:', response);
      
      if (!response || !response.link) {
        throw new Error('Link do PDF não foi retornado pelo servidor');
      }
      
      const pdfUrl = response.link;
      console.log('📄 Link do PDF gerado:', pdfUrl);
      
      // Gera mensagem breve e simples com link do PDF
      const numeroPedido = pedido.numeroPedido || `Nº ${pedido.id}`;
      // Mensagem formatada: número do pedido com link do PDF
      const mensagem = `Olá! Meu nome é *${this.auth.user()?.name || 'Cliente'}*, e gostaria de finalizar o pagamento do meu pedido de número *${numeroPedido}*.\n\n📄 *Resumo do Pedido:*\n${pdfUrl}`;
      
      console.log('💬 Mensagem formatada:', mensagem);
      
      // Abre WhatsApp com mensagem e link do PDF
      const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
      console.log('🔗 URL do WhatsApp:', url);
      window.open(url, '_blank');
      
      // Limpa o carrinho após abrir WhatsApp
      try {
        await this.cart.clear();
        console.log('✅ Carrinho limpo após abrir WhatsApp');
      } catch (error) {
        console.error('⚠️ Erro ao limpar carrinho:', error);
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar link do PDF:', error);
      console.error('📋 Detalhes do erro:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        error: error?.error
      });
      
      // Fallback: usa mensagem de texto se houver erro
      const mensagem = this.gerarMensagemWhatsApp();
      const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    }
  }

  /**
   * Volta para a página inicial
   */
  voltarParaHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Vai para a página de pedidos
   */
  verMeusPedidos() {
    this.router.navigate(['/account'], { queryParams: { section: 'orders' } });
  }
}

