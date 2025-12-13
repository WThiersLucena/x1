import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { PedidoService } from '../../core/services/pedido.service';
import { EnderecoService } from '../../core/services/endereco.service';
import { CartService } from '../../core/cart/cart.service';
import { Carrinho, ItemCarrinho } from '../../core/models/carrinho.model';
import { Endereco, TipoEndereco } from '../../core/models/endereco.model';
import { FormaPagamento, Pedido } from '../../core/models/pedido.model';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly enderecoService = inject(EnderecoService);
  private readonly cart = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Signals
  readonly carrinho = signal<Carrinho | null>(null);
  readonly enderecos = signal<Endereco[]>([]);
  readonly isLoading = signal(false);
  readonly isFinalizando = signal(false);
  readonly error = signal<string | null>(null);

  // Formulário
  readonly checkoutForm: FormGroup = this.fb.group({
    enderecoId: ['', [Validators.required]],
    formaPagamento: ['', [Validators.required]],
    observacoes: [''],
  });

  // Opções de forma de pagamento (ordem solicitada)
  readonly formasPagamento: {
    value: FormaPagamento;
    label: string;
    icon?: string;
  }[] = [
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'PIX', label: 'PIX' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: 'whatsapp' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'BOLETO', label: 'Boleto' },
  ];

  // Signals para controle de accordions e estados
  readonly bandeiraCartao = signal<string>('');
  readonly qrCodePix = signal<string | null>(null);
  readonly mostrarQrCodePix = signal(false);

  // Formulário de cartão de crédito
  readonly cartaoForm: FormGroup = this.fb.group({
    numeroCartao: [
      '',
      [Validators.required, Validators.minLength(13), Validators.maxLength(19)],
    ],
    nomeTitular: ['', [Validators.required, Validators.minLength(3)]],
    validade: [
      '',
      [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
    ],
    cvv: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(4)],
    ],
    parcelas: ['1', [Validators.required]],
  });

  async ngOnInit() {
    // Verifica se usuário está autenticado
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    await this.carregarDados();

    // Observa mudanças no número do cartão para detectar bandeira
    this.cartaoForm.get('numeroCartao')?.valueChanges.subscribe((numero) => {
      this.detectarBandeira(numero);
    });

    // Observa mudanças na forma de pagamento para atualizar accordions
    this.checkoutForm.get('formaPagamento')?.valueChanges.subscribe(() => {
      // Força detecção de mudanças para atualizar os accordions
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    });
  }

  /**
   * Carrega carrinho e endereços
   */
  async carregarDados() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Tenta carregar carrinho do backend primeiro
      let carrinhoBackend: Carrinho | null = null;
      try {
        carrinhoBackend = await firstValueFrom(
          this.carrinhoService.obterCarrinho()
        );
        this.carrinho.set(carrinhoBackend);
      } catch (error: any) {
        // Se backend não estiver disponível, usa CartService (que tem fallback)
        const isConnectionError =
          error?.status === 0 ||
          error?.status === undefined ||
          error?.message?.includes('ERR_CONNECTION_REFUSED') ||
          error?.message?.includes('Unknown Error');

        if (isConnectionError) {
          console.warn(
            '⚠️ Backend não disponível, usando dados do CartService'
          );
          carrinhoBackend = this.criarCarrinhoMockadoDoCartService();
          this.carrinho.set(carrinhoBackend);
        } else {
          throw error; // Propaga outros erros
        }
      }

      // Garante que sempre há um carrinho (mesmo que vazio)
      if (!carrinhoBackend) {
        carrinhoBackend = {
          itens: [],
          subtotal: 0,
          quantidadeTotal: 0,
        };
        this.carrinho.set(carrinhoBackend);
      }

      // Se o carrinho estiver vazio, apenas mostra um aviso (não bloqueia o carregamento)
      if (!carrinhoBackend.itens || carrinhoBackend.itens.length === 0) {
        console.warn('⚠️ Carrinho vazio ao carregar checkout');
        // Não define erro aqui para não bloquear a visualização da página
        // A validação será feita no método finalizarPedido()
      }

      // Carrega endereços
      try {
        const enderecos = await firstValueFrom(this.enderecoService.listar());
        this.enderecos.set(enderecos);

        if (enderecos.length === 0) {
          this.error.set(
            'Você precisa cadastrar um endereço antes de finalizar o pedido.'
          );
        }
      } catch (error: any) {
        // Se backend não estiver disponível, usa endereços mockados
        const isConnectionError =
          error?.status === 0 ||
          error?.status === undefined ||
          error?.message?.includes('ERR_CONNECTION_REFUSED');

        if (isConnectionError) {
          console.warn('⚠️ Backend não disponível, usando endereços mockados');
          this.enderecos.set(this.criarEnderecosMockados());
        } else {
          console.error('Erro ao carregar endereços:', error);
          this.error.set('Erro ao carregar endereços. Tente novamente.');
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      this.error.set(
        error?.error?.message || 'Erro ao carregar dados do checkout.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cria carrinho mockado a partir dos itens do CartService
   */
  private criarCarrinhoMockadoDoCartService(): Carrinho {
    const cartItems = this.cart.getItems();

    if (cartItems.length === 0) {
      return {
        itens: [],
        subtotal: 0,
        quantidadeTotal: 0,
      };
    }

    // Converte CartItem[] para ItemCarrinho[]
    const itens: ItemCarrinho[] = cartItems.map((item, index) => {
      // Extrai preço numérico do formato "R$ X,XX" ou "R$ X.XXX,XX"
      let precoNumero = 0;
      if (item.price) {
        // Remove tudo exceto números, vírgulas e pontos
        const precoLimpo = item.price.replace(/[^\d,.]/g, '');
        // Se tem vírgula, assume formato brasileiro (R$ 1.234,56)
        if (precoLimpo.includes(',')) {
          // Remove pontos (milhares) e substitui vírgula por ponto
          precoNumero = parseFloat(
            precoLimpo.replace(/\./g, '').replace(',', '.')
          );
        } else {
          // Formato americano ou número simples
          precoNumero = parseFloat(precoLimpo) || 0;
        }
      }

      // Se não conseguiu extrair preço, usa um valor padrão baseado no título
      if (precoNumero === 0 || isNaN(precoNumero)) {
        precoNumero = 99.9; // Valor padrão para desenvolvimento
      }

      return {
        id: index + 1,
        produtoId: Number(item.id),
        produtoNome: item.title,
        produtoImagemUrl: item.imageUrl,
        produtoPrimeiroAtributo: item.size,
        quantidade: item.quantity,
        precoUnitario: precoNumero,
        subtotal: precoNumero * item.quantity,
      };
    });

    const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
    const quantidadeTotal = itens.reduce(
      (sum, item) => sum + item.quantidade,
      0
    );

    return {
      itens,
      subtotal,
      quantidadeTotal,
    };
  }

  /**
   * Cria endereços mockados quando o backend não está disponível
   */
  private criarEnderecosMockados(): Endereco[] {
    const user = this.auth.user();
    if (!user) return [];

    // Retorna um endereço mockado padrão
    return [
      {
        id: 1,
        usuarioId: 1,
        logradouro: 'Rua Exemplo',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000',
        tipo: TipoEndereco.ENTREGA,
      },
    ];
  }

  /**
   * Cria pedido mockado quando o backend não está disponível
   */
  private criarPedidoMockado(formValue: any): Pedido {
    const carrinho = this.carrinho();
    const endereco = this.enderecos().find(
      (e) => e.id === Number(formValue.enderecoId)
    );
    const user = this.auth.user();

    // Converte ItemCarrinho[] para ItemPedido[]
    const itensPedido = (carrinho?.itens || []).map((item) => ({
      produtoId: item.produtoId,
      produtoNome: item.produtoNome,
      produtoImagemUrl: item.produtoImagemUrl,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.subtotal,
    }));

    return {
      id: Date.now(), // ID baseado em timestamp
      numeroPedido: `PED-${Date.now()}`,
      usuarioId: user ? 1 : undefined,
      usuarioNome: user?.name,
      enderecoId: Number(formValue.enderecoId),
      enderecoCompleto: endereco
        ? this.formatarEndereco(endereco)
        : 'Endereço não informado',
      status: 'PENDENTE' as const,
      statusDescricao: 'Pedido pendente de confirmação',
      formaPagamento: formValue.formaPagamento,
      formaPagamentoDescricao:
        this.formasPagamento.find((f) => f.value === formValue.formaPagamento)
          ?.label || formValue.formaPagamento,
      subtotal: carrinho?.subtotal || 0,
      valorFrete: 0,
      valorDesconto: 0,
      valorTotal: carrinho?.subtotal || 0,
      observacoes: formValue.observacoes || undefined,
      dataPedido: new Date().toISOString(),
      itens: itensPedido,
    };
  }

  /**
   * Formata endereço completo para exibição
   */
  formatarEndereco(endereco: Endereco): string {
    const parts = [
      endereco.logradouro,
      endereco.numero,
      endereco.complemento,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
    ].filter(Boolean);
    return parts.join(', ');
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
   * Calcula subtotal de um item
   */
  calcularSubtotalItem(item: ItemCarrinho): number {
    return item.precoUnitario * item.quantidade;
  }

  /**
   * Finaliza o pedido
   */
  async finalizarPedido() {
    if (!this.checkoutForm.valid) {
      this.checkoutForm.markAllAsTouched();
      this.error.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Valida se há itens no carrinho
    const carrinho = this.carrinho();
    if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
      this.error.set(
        'Seu carrinho está vazio. Adicione produtos antes de finalizar o pedido.'
      );
      return;
    }

    // Valida se há endereço
    if (this.enderecos().length === 0) {
      this.error.set(
        'Você precisa cadastrar um endereço antes de finalizar o pedido.'
      );
      return;
    }

    const formaPagamento = this.checkoutForm.get('formaPagamento')?.value;

    // Valida se forma de pagamento foi selecionada
    if (!formaPagamento) {
      this.error.set('Selecione uma forma de pagamento.');
      return;
    }

    this.isFinalizando.set(true);
    this.error.set(null);

    try {
      // Limpa o carrinho antes de redirecionar
      try {
        await this.cart.clear();
        console.log('✅ Carrinho limpo antes de redirecionar para WhatsApp');
      } catch (error) {
        console.error('⚠️ Erro ao limpar carrinho:', error);
        // Não bloqueia o fluxo se houver erro ao limpar carrinho
      }

      // Redireciona para WhatsApp com mensagem pré-formatada
      this.redirecionarParaWhatsApp();
    } catch (error: any) {
      console.error('❌ Erro ao finalizar pedido:', error);
      console.error('❌ Status:', error?.status);
      console.error('❌ Error object:', error?.error);

      // Extrai mensagem de erro mais detalhada
      let mensagemErro = 'Erro ao finalizar pedido. Tente novamente.';

      if (error?.error) {
        // Erro da API
        if (error.error.message) {
          mensagemErro = error.error.message;
        } else if (typeof error.error === 'string') {
          mensagemErro = error.error;
        } else if (error.error.error) {
          mensagemErro = error.error.error;
        }
      } else if (error?.message) {
        // Erro de rede ou outro
        mensagemErro = error.message;
      }

      // Mensagens específicas para erros comuns
      if (error?.status === 400) {
        if (
          mensagemErro.includes('Carrinho') ||
          mensagemErro.includes('carrinho')
        ) {
          mensagemErro =
            'Seu carrinho está vazio ou inválido. Por favor, adicione produtos novamente.';
        } else if (
          mensagemErro.includes('Endereço') ||
          mensagemErro.includes('endereço')
        ) {
          mensagemErro =
            'Endereço inválido. Por favor, selecione um endereço válido.';
        } else if (
          mensagemErro.includes('Estoque') ||
          mensagemErro.includes('estoque')
        ) {
          mensagemErro =
            'Alguns produtos não têm estoque suficiente. Por favor, verifique seu carrinho.';
        }
      } else if (error?.status === 401) {
        mensagemErro = 'Sua sessão expirou. Por favor, faça login novamente.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else if (error?.status === 0 || error?.status === undefined) {
        mensagemErro =
          'Erro de conexão. Verifique sua internet e tente novamente.';
      }

      this.error.set(mensagemErro);
    } finally {
      this.isFinalizando.set(false);
    }
  }

  /**
   * Redireciona para WhatsApp com mensagem pré-formatada
   */
  private redirecionarParaWhatsApp(): void {
    const numeroWhatsApp = '5511982539200';
    const mensagem =
      'Olá estou navegando em sua Versão Demo, finalizando um pedido.';

    // Formata a mensagem para URL (encodeURIComponent)
    const mensagemEncoded = encodeURIComponent(mensagem);

    // Cria URL do WhatsApp Web/App
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemEncoded}`;

    // Abre em nova aba
    window.open(urlWhatsApp, '_blank');

    // Redireciona para página de confirmação após um pequeno delay
    setTimeout(() => {
      this.router.navigate(['/order-confirmation'], {
        queryParams: {
          pedidoId: Date.now(), // ID mockado baseado em timestamp
        },
      });
    }, 500);
  }

  /**
   * Navega para página de endereços
   */
  adicionarEndereco() {
    this.router.navigate(['/account'], { queryParams: { section: 'profile' } });
  }

  /**
   * Volta para o carrinho
   */
  voltarParaCarrinho() {
    this.router.navigate(['/cart']);
  }

  /**
   * Detecta a bandeira do cartão baseado no número
   */
  detectarBandeira(numero: string): void {
    if (!numero) {
      this.bandeiraCartao.set('');
      return;
    }

    // Remove espaços e caracteres não numéricos
    const numeroLimpo = numero.replace(/\D/g, '');

    // Visa: começa com 4
    if (/^4/.test(numeroLimpo)) {
      this.bandeiraCartao.set('visa');
      return;
    }

    // Mastercard: começa com 5 ou 2
    if (/^5[1-5]|^2[2-7]/.test(numeroLimpo)) {
      this.bandeiraCartao.set('mastercard');
      return;
    }

    // American Express: começa com 34 ou 37
    if (/^3[47]/.test(numeroLimpo)) {
      this.bandeiraCartao.set('amex');
      return;
    }

    // Elo: começa com 401178, 401179, 431274, 438935, 451416, 457393, 457631, 457632, 504175, 627780, 636297, 636368, 636369
    if (
      /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|636369)/.test(
        numeroLimpo
      )
    ) {
      this.bandeiraCartao.set('elo');
      return;
    }

    // Hipercard: começa com 38, 60
    if (/^(38|60)/.test(numeroLimpo)) {
      this.bandeiraCartao.set('hipercard');
      return;
    }

    // Diners: começa com 30, 36, 38
    if (/^3[068]/.test(numeroLimpo)) {
      this.bandeiraCartao.set('diners');
      return;
    }

    // Bandeira não identificada
    this.bandeiraCartao.set('');
  }

  /**
   * Formata número do cartão com espaços
   */
  formatarNumeroCartao(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Limita a 19 caracteres (16 dígitos + 3 espaços)
    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    // Adiciona espaços a cada 4 dígitos
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    this.cartaoForm.patchValue({ numeroCartao: value }, { emitEvent: false });
    this.detectarBandeira(value);
  }

  /**
   * Formata validade do cartão (MM/AA)
   */
  formatarValidade(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      const mes = value.substring(0, 2);
      const ano = value.substring(2, 4);

      // Valida mês (01-12)
      const mesNum = parseInt(mes, 10);
      if (mesNum < 1 || mesNum > 12) {
        value = value.substring(0, 1);
      } else {
        value = mes + (ano ? '/' + ano : '');
      }
    }

    this.cartaoForm.patchValue({ validade: value }, { emitEvent: false });
  }

  /**
   * Gera QR Code fake para PIX
   */
  gerarQrCodePix(): void {
    // Gera um QR Code fake usando uma API pública ou código base64 mockado
    // Para simulação, vamos usar um QR Code base64 fake
    const qrCodeFake = this.gerarQrCodeFake();
    this.qrCodePix.set(qrCodeFake);
    this.mostrarQrCodePix.set(true);
  }

  /**
   * Gera um QR Code fake usando API pública
   */
  private gerarQrCodeFake(): string {
    // Gera um QR Code fake usando uma API pública de QR Code
    // Em produção, usar uma biblioteca como qrcode ou gerar no backend
    const carrinho = this.carrinho();
    const valor = carrinho?.subtotal || 0;

    // Cria um texto PIX simulado (formato EMV)
    const textoQrCode = `00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000${valor.toFixed(
      2
    )}5204000053039865802BR5913CASA SANCHES6009SAO PAULO62070503***6304`;

    // Usa uma API pública para gerar QR Code (QR Server)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      textoQrCode
    )}`;

    return qrCodeUrl;
  }

  /**
   * Verifica se uma forma de pagamento está selecionada
   */
  isFormaPagamentoSelecionada(forma: FormaPagamento): boolean {
    return this.checkoutForm.get('formaPagamento')?.value === forma;
  }

  /**
   * Verifica se o formulário de cartão é válido
   */
  isCartaoFormValido(): boolean {
    return this.cartaoForm.valid;
  }
}
