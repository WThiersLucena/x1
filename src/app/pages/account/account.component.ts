import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/cart/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { EnderecoService } from '../../core/services/endereco.service';
import { TelefoneService } from '../../core/services/telefone.service';
import { ViaCepService } from '../../core/services/viacep.service';
import { PedidoService } from '../../core/services/pedido.service';
import { Endereco, TipoEndereco } from '../../core/models/endereco.model';
import { Telefone, TipoTelefone } from '../../core/models/telefone.model';
import { Usuario } from '../../core/models/usuario.model';
import { Pedido } from '../../core/models/pedido.model';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FornecedoresComponent } from './admin-panel2/fornecedores/fornecedores.component';
import { CategoriasComponent } from './admin-panel2/categorias/categorias.component';
import { SubcategoriasComponent } from './admin-panel2/subcategorias/subcategorias.component';
import { SegmentosComponent } from './admin-panel2/segmentos/segmentos.component';
import { ProdutosComponent } from './admin-panel2/produtos/produtos.component';
import { GerenciarCarrosselComponent } from './admin-panel2/carrossel/gerenciar-carrossel.component';
import { EstoqueComponent } from './admin-panel2/estoque/estoque.component';
import { DashboardComponent } from './admin-panel2/dashboard/dashboard.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FornecedoresComponent,
    CategoriasComponent,
    SubcategoriasComponent,
    SegmentosComponent,
    ProdutosComponent,
    GerenciarCarrosselComponent,
    EstoqueComponent,
    DashboardComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountPageComponent implements OnInit {
  readonly section = signal<
    'orders' | 'cart' | 'profile' | 'admin'
  >('orders');
  readonly menuAberto = signal<boolean>(true); // Menu aberto por padrão
  readonly subsection = signal<string | null>(null); // Subseção ativa (para acordeons)
  readonly adminExpandido = signal<boolean>(false); // Controla se o Painel Administrativo está expandido
  private readonly accordionsAbertos = new Set<string>(); // Controla quais acordeons estão abertos

  private readonly cart = inject(CartService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly usuarioService = inject(UsuarioService);
  private readonly enderecoService = inject(EnderecoService);
  private readonly telefoneService = inject(TelefoneService);
  private readonly viaCepService = inject(ViaCepService);
  private readonly pedidoService = inject(PedidoService);

  // Signals
  readonly user = this.auth.user;
  readonly userName = computed(() => this.user()?.name ?? '-');
  readonly userEmail = computed(() => this.user()?.email ?? '-');
  
  // Controle de acesso
  readonly canAccessAdmin = computed(() => this.auth.canAccessAdminPanel());
  readonly canEditAdmin = computed(() => this.auth.canEditAdminPanel());

  readonly enderecos = signal<Endereco[]>([]);
  readonly telefones = signal<Telefone[]>([]);
  readonly pedidos = signal<Pedido[]>([]);
  readonly isLoadingEnderecos = signal(false);
  readonly isLoadingTelefones = signal(false);
  readonly isLoadingCep = signal(false);
  readonly isLoadingPedidos = signal(false);

  readonly editEnderecoId = signal<number | null>(null);
  readonly editTelefoneId = signal<number | null>(null);

  // Signals para controlar modais
  readonly showModalUsuario = signal(false);
  readonly showModalEndereco = signal(false);
  readonly showModalTelefone = signal(false);

  // Enums para os selects
  readonly tiposEndereco = Object.values(TipoEndereco);
  readonly tiposTelefone = Object.values(TipoTelefone);

  // Formulários
  readonly usuarioForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly enderecoForm = this.fb.group({
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    complemento: [''],
    bairro: ['', [Validators.required]],
    cidade: ['', [Validators.required]],
    estado: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
    tipo: [TipoEndereco.RESIDENCIAL as TipoEndereco, [Validators.required]],
  });

  readonly telefoneForm = this.fb.group({
    ddd: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
    numero: ['', [Validators.required, Validators.pattern(/^\d{8,9}$/)]],
    tipo: [TipoTelefone.CELULAR as TipoTelefone, [Validators.required]],
  });

  ngOnInit() {
    // Verifica se há query param para definir seção
    const sectionParam = this.route.snapshot.queryParams['section'];
    if (sectionParam) {
      this.setSection(
        sectionParam as 'orders' | 'cart' | 'profile' | 'admin'
      );
    }

    this.carregarEnderecos();
    this.carregarTelefones();
    this.configurarBuscaCep();
    
    // Carrega pedidos se estiver na seção de pedidos
    if (this.section() === 'orders') {
      this.carregarPedidos();
    }
  }

  /**
   * Configura o listener para busca automática de CEP
   * Busca o CEP automaticamente quando o usuário digita 8 números
   */
  private configurarBuscaCep() {
    this.enderecoForm
      .get('cep')
      ?.valueChanges.pipe(
        debounceTime(500), // Aguarda 500ms após parar de digitar
        distinctUntilChanged() // Só busca se o valor mudou
      )
      .subscribe((cep) => {
        if (cep) {
          this.buscarCep(cep);
        }
      });
  }

  setSection(
    value: 'orders' | 'cart' | 'profile' | 'admin'
  ) {
    this.section.set(value);

    // Limpa a subseção quando mudar de seção ou quando clicar em "Painel Administrativo" sem subseção
    if (value !== 'admin' || !this.subsection()) {
      this.subsection.set(null);
    }
    
    // Carrega pedidos quando mudar para a seção de pedidos
    if (value === 'orders') {
      this.carregarPedidos();
    }
  }

  toggleAdmin(): void {
    if (this.section() === 'admin') {
      // Se já está na seção admin, apenas expande/recolhe
      this.adminExpandido.set(!this.adminExpandido());
    } else {
      // Se não está na seção admin, muda para ela e expande
      this.setSection('admin');
      this.adminExpandido.set(true);
    }
  }

  toggleMenu() {
    this.menuAberto.set(!this.menuAberto());
  }

  toggleAccordion(accordionId: string) {
    if (this.accordionsAbertos.has(accordionId)) {
      this.accordionsAbertos.delete(accordionId);
    } else {
      this.accordionsAbertos.add(accordionId);
    }
  }

  accordionAberto(accordionId: string): boolean {
    return this.accordionsAbertos.has(accordionId);
  }

  setSubsection(subsection: string | null) {
    this.subsection.set(subsection);
  }

  getSubsectionTitle(): string {
    const subsection = this.subsection();
    if (!subsection) return '';

    const titles: { [key: string]: string } = {
      // Dashboard
      'dashboard-vendas': 'Vendas',
      'dashboard-produtos': 'Produtos',
      'dashboard-clientes': 'Clientes',
      // Estoque
      'estoque-gerenciar': 'Gerenciar Estoque',
      'estoque-entrada': 'Entrada de Produtos',
      'estoque-saida': 'Saída de Produtos',
      // Fornecedores
      'fornecedores-listar': 'Listar Fornecedores',
      'fornecedores-novo': 'Novo Fornecedor',
      // Categorias
      'categorias-listar': 'Listar Categorias',
      'categorias-nova': 'Nova Categoria',
      // Subcategorias
      'subcategorias-listar': 'Listar Subcategorias',
      'subcategorias-nova': 'Nova Subcategoria',
      // Segmentos
      'segmentos-listar': 'Listar Segmentos',
      'segmentos-novo': 'Novo Segmento',
      // Produtos
      'produtos-listar': 'Listar Produtos',
      'produtos-novo': 'Novo Produto',
    };

    return titles[subsection] || subsection;
  }

  /**
   * Carrega a lista de pedidos do usuário
   */
  async carregarPedidos() {
    this.isLoadingPedidos.set(true);
    try {
      const pedidos = await firstValueFrom(this.pedidoService.listarPedidos());
      // Ordena por data mais recente primeiro
      pedidos.sort((a, b) => {
        const dataA = a.dataPedido ? new Date(a.dataPedido).getTime() : 0;
        const dataB = b.dataPedido ? new Date(b.dataPedido).getTime() : 0;
        return dataB - dataA;
      });
      this.pedidos.set(pedidos);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      this.pedidos.set([]);
    } finally {
      this.isLoadingPedidos.set(false);
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
   * Traduz status do pedido
   */
  traduzirStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDENTE: 'Pendente',
      CONFIRMADO: 'Confirmado',
      EM_PREPARACAO: 'Em Preparação',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
    };
    return statusMap[status] || status;
  }

  /**
   * Traduz forma de pagamento
   */
  traduzirFormaPagamento(forma: string): string {
    const formasMap: { [key: string]: string } = {
      CARTAO_CREDITO: 'Cartão de Crédito',
      CARTAO_DEBITO: 'Cartão de Débito',
      PIX: 'PIX',
      BOLETO: 'Boleto',
      WHATSAPP: 'WhatsApp',
    };
    return formasMap[forma] || forma;
  }

  /**
   * Retorna classe CSS para badge de status
   */
  getStatusBadgeClass(status: string): string {
    const classMap: { [key: string]: string } = {
      PENDENTE: 'bg-warning',
      CONFIRMADO: 'bg-info',
      EM_PREPARACAO: 'bg-primary',
      ENVIADO: 'bg-success',
      ENTREGUE: 'bg-success',
      CANCELADO: 'bg-danger',
    };
    return classMap[status] || 'bg-secondary';
  }

  /**
   * Formata URL da imagem para garantir URL completa
   */
  formatarUrlImagem(url?: string): string {
    if (!url) {
      return '/assets/logo/Logo-Thiers.png';
    }
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
   * Trata erro ao carregar imagem
   */
  tratarErroImagem(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/logo/Logo-Thiers.png';
    }
  }

  // ========================================================================
  // MÉTODOS DO CARRINHO (mantidos do código original)
  // ========================================================================

  get items(): CartItem[] {
    return this.cart.getItems();
  }

  get itemCount(): number {
    return this.cart.getCount();
  }

  get total(): number {
    return this.items.reduce(
      (sum, it) => sum + this.parsePrice(it.price) * it.quantity,
      0
    );
  }

  increment(it: CartItem) {
    this.cart.add(
      {
        id: it.id,
        title: it.title,
        imageUrl: it.imageUrl,
        price: it.price,
        size: it.size,
      },
      1
    );
  }

  decrement(it: CartItem) {
    this.cart.decrement(it.id, 1, it.size);
  }

  remove(it: CartItem) {
    this.cart.remove(it.id, it.size);
  }

  parsePrice(price?: string): number {
    if (!price) return 0;
    const normalized = price
      .replace(/\s/g, '')
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = Number(normalized);
    return isNaN(n) ? 0 : n;
  }

  subtotal(it: CartItem): number {
    return this.parsePrice(it.price) * it.quantity;
  }

  // ========================================================================
  // MÉTODOS DO USUÁRIO
  // ========================================================================

  abrirModalUsuario() {
    const user = this.user();
    if (user) {
      this.usuarioForm.patchValue({
        name: user.name,
        email: user.email,
      });
      this.showModalUsuario.set(true);
    }
  }

  fecharModalUsuario() {
    this.usuarioForm.reset();
    this.showModalUsuario.set(false);
  }

  async salvarUsuario() {
    if (!this.usuarioForm.valid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    try {
      const dados: Usuario = {
        name: this.usuarioForm.value.name!,
        email: this.usuarioForm.value.email!,
      };

      await firstValueFrom(this.usuarioService.atualizarDados(dados));

      // Atualizar o signal do usuário
      this.auth.user.set(dados);

      alert('✅ Dados atualizados com sucesso!');
      this.fecharModalUsuario();
    } catch (error: any) {
      console.error('Erro ao atualizar dados:', error);
      alert('❌ ' + (error?.error?.message || 'Erro ao atualizar dados'));
    }
  }

  // ========================================================================
  // MÉTODOS DE CEP (VIACEP)
  // ========================================================================

  /**
   * Busca dados do CEP na API ViaCEP e preenche o formulário automaticamente
   * @param cep - CEP a ser buscado
   */
  async buscarCep(cep: string) {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    // Formata o CEP no campo
    this.enderecoForm.patchValue(
      {
        cep: this.formatarCep(cepLimpo),
      },
      { emitEvent: false }
    ); // emitEvent: false para não entrar em loop

    this.isLoadingCep.set(true);

    try {
      const dados = await firstValueFrom(
        this.viaCepService.buscarCep(cepLimpo)
      );

      if (dados) {
        // Preenche automaticamente os campos do formulário
        this.enderecoForm.patchValue({
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
        });

        console.log('✅ CEP encontrado e campos preenchidos automaticamente');
      } else {
        console.warn('⚠️ CEP não encontrado. Preencha manualmente.');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error);
    } finally {
      this.isLoadingCep.set(false);
    }
  }

  /**
   * Formata CEP para o padrão 00000-000
   */
  private formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
    }

    return cep;
  }

  /**
   * Permite apenas números no campo CEP
   * @param event - Evento do teclado
   */
  onCepKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;
    // Permite apenas números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // ========================================================================
  // MÉTODOS DE ENDEREÇOS
  // ========================================================================

  async carregarEnderecos() {
    this.isLoadingEnderecos.set(true);
    try {
      const enderecos = await firstValueFrom(this.enderecoService.listar());
      this.enderecos.set(enderecos);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      this.isLoadingEnderecos.set(false);
    }
  }

  abrirModalNovoEndereco() {
    this.enderecoForm.reset({
      tipo: TipoEndereco.RESIDENCIAL,
    });
    this.editEnderecoId.set(null);
    this.showModalEndereco.set(true);
  }

  abrirModalEditarEndereco(endereco: Endereco) {
    this.enderecoForm.patchValue(endereco);
    this.editEnderecoId.set(endereco.id!);
    this.showModalEndereco.set(true);
  }

  fecharModalEndereco() {
    this.enderecoForm.reset();
    this.editEnderecoId.set(null);
    this.showModalEndereco.set(false);
  }

  async salvarEndereco() {
    if (!this.enderecoForm.valid) {
      this.enderecoForm.markAllAsTouched();
      return;
    }

    try {
      const endereco: Endereco = {
        ...this.enderecoForm.value,
      } as Endereco;

      const editId = this.editEnderecoId();

      if (editId !== null) {
        await firstValueFrom(this.enderecoService.atualizar(editId, endereco));
        alert('✅ Endereço atualizado com sucesso!');
      } else {
        await firstValueFrom(this.enderecoService.criar(endereco));
        alert('✅ Endereço criado com sucesso!');
      }

      this.carregarEnderecos();
      this.fecharModalEndereco();
    } catch (error: any) {
      console.error('Erro ao salvar endereço:', error);
      alert('❌ ' + (error?.error?.message || 'Erro ao salvar endereço'));
    }
  }

  async excluirEndereco(id: number) {
    if (!confirm('🗑️ Deseja realmente excluir este endereço?')) {
      return;
    }

    try {
      await firstValueFrom(this.enderecoService.excluir(id));
      alert('✅ Endereço excluído com sucesso!');
      this.carregarEnderecos();
    } catch (error: any) {
      console.error('Erro ao excluir endereço:', error);
      alert('❌ ' + (error?.error?.message || 'Erro ao excluir endereço'));
    }
  }

  // ========================================================================
  // MÉTODOS DE TELEFONES
  // ========================================================================

  async carregarTelefones() {
    this.isLoadingTelefones.set(true);
    try {
      const telefones = await firstValueFrom(this.telefoneService.listar());
      this.telefones.set(telefones);
    } catch (error) {
      console.error('Erro ao carregar telefones:', error);
    } finally {
      this.isLoadingTelefones.set(false);
    }
  }

  abrirModalNovoTelefone() {
    this.telefoneForm.reset({
      tipo: TipoTelefone.CELULAR,
    });
    this.editTelefoneId.set(null);
    this.showModalTelefone.set(true);
  }

  abrirModalEditarTelefone(telefone: Telefone) {
    this.telefoneForm.patchValue(telefone);
    this.editTelefoneId.set(telefone.id!);
    this.showModalTelefone.set(true);
  }

  fecharModalTelefone() {
    this.telefoneForm.reset();
    this.editTelefoneId.set(null);
    this.showModalTelefone.set(false);
  }

  async salvarTelefone() {
    if (!this.telefoneForm.valid) {
      this.telefoneForm.markAllAsTouched();
      return;
    }

    try {
      const telefone: Telefone = {
        ...this.telefoneForm.value,
      } as Telefone;

      const editId = this.editTelefoneId();

      if (editId !== null) {
        await firstValueFrom(this.telefoneService.atualizar(editId, telefone));
        alert('✅ Telefone atualizado com sucesso!');
      } else {
        await firstValueFrom(this.telefoneService.criar(telefone));
        alert('✅ Telefone criado com sucesso!');
      }

      this.carregarTelefones();
      this.fecharModalTelefone();
    } catch (error: any) {
      console.error('Erro ao salvar telefone:', error);
      alert('❌ ' + (error?.error?.message || 'Erro ao salvar telefone'));
    }
  }

  async excluirTelefone(id: number) {
    if (!confirm('🗑️ Deseja realmente excluir este telefone?')) {
      return;
    }

    try {
      await firstValueFrom(this.telefoneService.excluir(id));
      alert('✅ Telefone excluído com sucesso!');
      this.carregarTelefones();
    } catch (error: any) {
      console.error('Erro ao excluir telefone:', error);
      alert('❌ ' + (error?.error?.message || 'Erro ao excluir telefone'));
    }
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  formatarTelefone(telefone: Telefone): string {
    return `(${telefone.ddd}) ${telefone.numero}`;
  }

  traduzirTipoEndereco(tipo: TipoEndereco): string {
    const traducoes = {
      [TipoEndereco.ENTREGA]: 'Entrega',
      [TipoEndereco.COBRANCA]: 'Cobrança',
      [TipoEndereco.RESIDENCIAL]: 'Residencial',
      [TipoEndereco.COMERCIAL]: 'Comercial',
    };
    return traducoes[tipo] || tipo;
  }

  traduzirTipoTelefone(tipo: TipoTelefone): string {
    const traducoes = {
      [TipoTelefone.CELULAR]: 'Celular',
      [TipoTelefone.RESIDENCIAL]: 'Residencial',
      [TipoTelefone.COMERCIAL]: 'Comercial',
    };
    return traducoes[tipo] || tipo;
  }
}
