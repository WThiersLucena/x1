import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FornecedorService } from '../../../core/services/fornecedor.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { SubcategoriaService } from '../../../core/services/subcategoria.service';
import { SegmentoService } from '../../../core/services/segmento.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { ViaCepService } from '../../../core/services/viacep.service';
import { Fornecedor } from '../../../core/models/fornecedor.model';
import { Categoria } from '../../../core/models/categoria.model';
import { Subcategoria } from '../../../core/models/subcategoria.model';
import { Segmento } from '../../../core/models/segmento.model';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoAtributo } from '../../../core/models/produto-atributo.model';
import { CarrosselDestaque } from '../../../core/models/carrossel-destaque.model';
import { CarrosselDestaqueService } from '../../../core/services/carrossel-destaque.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  @Input() activeSubsection: string | null = null; // Subseção ativa para exibir apenas o conteúdo correspondente

  // Expor Math para uso no template
  readonly Math = Math;

  // ========================================================================
  // SIGNALS - Estado dos dados
  // ========================================================================
  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly fornecedoresPage = signal<any>(null);
  readonly buscaFornecedor = signal<string>('');
  readonly filtroAtivos = signal<boolean | null>(null); // null = todos, true = ativos, false = inativos
  readonly paginaAtualFornecedores = signal<number>(0);
  readonly tamanhoPaginaFornecedores = signal<number>(10);
  readonly categorias = signal<Categoria[]>([]);
  readonly subcategorias = signal<Subcategoria[]>([]);
  readonly segmentos = signal<Segmento[]>([]);
  readonly produtos = signal<Produto[]>([]);

  // ========================================================================
  // SIGNALS - Estado de carregamento
  // ========================================================================
  readonly isLoadingFornecedores = signal(false);
  readonly isLoadingCategorias = signal(false);
  readonly isLoadingSubcategorias = signal(false);
  readonly isLoadingSegmentos = signal(false);
  readonly isLoadingProdutos = signal(false);
  readonly isLoadingCep = signal(false);

  // ========================================================================
  // SIGNALS - Mensagens de erro
  // ========================================================================
  readonly erroCarregarProdutos = signal<string | null>(null);

  // ========================================================================
  // SIGNALS - Controle de modais
  // ========================================================================
  readonly showModalFornecedor = signal(false);
  readonly showModalCategoria = signal(false);
  readonly showModalSubcategoria = signal(false);
  readonly showModalSegmento = signal(false);
  readonly showModalProduto = signal(false);

  // ========================================================================
  // SIGNALS - IDs para edição
  // ========================================================================
  readonly editFornecedorId = signal<number | null>(null);
  readonly editCategoriaId = signal<number | null>(null);
  readonly editSubcategoriaId = signal<number | null>(null);
  readonly editSegmentoId = signal<number | null>(null);
  readonly editProdutoId = signal<number | null>(null);

  // ========================================================================
  // SIGNALS - Upload de Imagens
  // ========================================================================
  readonly imagensSelecionadas = signal<File[]>([]);
  readonly previewImagens = signal<string[]>([]);

  // ========================================================================
  // SIGNALS - Carrossel de Destaques
  // ========================================================================
  readonly carrosselDestaques = signal<CarrosselDestaque[]>([]);
  readonly isLoadingCarrosselDestaques = signal(false);
  readonly showModalCarrosselDestaque = signal(false);
  readonly editCarrosselDestaqueId = signal<number | null>(null);
  readonly imagemCarrosselSelecionada = signal<File | null>(null);
  readonly previewImagemCarrossel = signal<string | null>(null);

  // ========================================================================
  // FORMULÁRIOS
  // ========================================================================
  fornecedorForm: FormGroup;
  categoriaForm: FormGroup;
  subcategoriaForm: FormGroup;
  segmentoForm: FormGroup;
  produtoForm: FormGroup;
  carrosselDestaqueForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private segmentoService: SegmentoService,
    private produtoService: ProdutoService,
    private viaCepService: ViaCepService,
    private carrosselDestaqueService: CarrosselDestaqueService,
    private auth: AuthService
  ) {
    // Inicializar formulário de fornecedor
    this.fornecedorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      observacoes: [''],
      cep: ['', [Validators.required]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
      tipoEndereco: ['MATRIZ', [Validators.required]],
    });

    // Inicializar formulário de categoria
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: [''],
    });

    // Inicializar formulário de subcategoria
    this.subcategoriaForm = this.fb.group({
      categoriaId: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: [''],
    });

    // Inicializar formulário de segmento
    this.segmentoForm = this.fb.group({
      subcategoriaId: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: [''],
    });

    // Inicializar formulário de produto
    this.produtoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: [''],
      segmentoId: ['', [Validators.required]],
      fornecedorId: ['', [Validators.required]],
      custoUnitario: ['', [Validators.required, Validators.min(0.01)]],
      margemLucro: ['', [Validators.required, Validators.min(0)]],
      precoVenda: ['', [Validators.required, Validators.min(0.01)]],
      precoDe: ['', [Validators.min(0)]],
      estoqueInicial: [0, [Validators.required, Validators.min(0)]],
      unidadeMedida: ['UNIDADE', [Validators.required]],
      destaque: [false],
      maisVendido: [false],
      atributos: this.fb.array([]), // FormArray para atributos dinâmicos
    });

    // Inicializar formulário de carrossel de destaques
    // imageUrl não é obrigatório se houver imagem selecionada para upload
    this.carrosselDestaqueForm = this.fb.group({
      imageUrl: [''], // Removido required - será validado manualmente
      title: [''],
      description: [''],
      ordem: [0, [Validators.required, Validators.min(0)]],
      ativo: [true, [Validators.required]],
    });

    // Observar mudanças no CEP
    this.fornecedorForm.get('cep')?.valueChanges.subscribe((cep) => {
      if (cep && cep.replace(/\D/g, '').length === 8) {
        this.buscarCep(cep);
      }
    });

    // Observar mudanças no Custo Unitário e Margem de Lucro para calcular Preço de Venda
    this.produtoForm.get('custoUnitario')?.valueChanges.subscribe(() => {
      this.calcularPrecoVenda();
    });

    this.produtoForm.get('margemLucro')?.valueChanges.subscribe(() => {
      this.calcularPrecoVenda();
    });

    // Observar mudanças no Preço de Venda para recalcular Margem de Lucro
    this.produtoForm.get('precoVenda')?.valueChanges.subscribe(() => {
      this.calcularMargemLucro();
    });
  }

  ngOnInit(): void {
    this.carregarFornecedores();
    this.carregarCategorias();
    this.carregarSubcategorias();
    this.carregarSegmentos();
    this.carregarProdutos();
    this.carregarCarrosselDestaques();
  }

  // ========================================================================
  // FORNECEDORES - CRUD
  // ========================================================================

  async carregarFornecedores(): Promise<void> {
    this.isLoadingFornecedores.set(true);
    try {
      const busca = this.buscaFornecedor().trim();
      const filtroAtivos = this.filtroAtivos();
      const page = this.paginaAtualFornecedores();
      const size = this.tamanhoPaginaFornecedores();

      let response;
      if (busca) {
        // Busca por nome
        response = await this.fornecedorService.buscarPorNome(busca, page, size).toPromise();
      } else if (filtroAtivos === true) {
        // Apenas ativos
        response = await this.fornecedorService.listarAtivos(page, size).toPromise();
      } else {
        // Todos
        response = await this.fornecedorService.listar(page, size).toPromise();
      }

      this.fornecedoresPage.set(response);
      this.fornecedores.set(response?.content || []);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      alert('Erro ao carregar fornecedores');
      this.fornecedores.set([]);
      this.fornecedoresPage.set(null);
    } finally {
      this.isLoadingFornecedores.set(false);
    }
  }

  /**
   * Busca fornecedores por nome
   */
  onBuscarFornecedor(): void {
    this.paginaAtualFornecedores.set(0);
    this.carregarFornecedores();
  }

  /**
   * Limpa a busca
   */
  limparBuscaFornecedor(): void {
    this.buscaFornecedor.set('');
    this.paginaAtualFornecedores.set(0);
    this.carregarFornecedores();
  }

  /**
   * Filtra por status (ativos/inativos/todos)
   */
  filtrarPorStatus(status: boolean | null): void {
    this.filtroAtivos.set(status);
    this.paginaAtualFornecedores.set(0);
    this.carregarFornecedores();
  }

  /**
   * Navega para página anterior
   */
  paginaAnteriorFornecedores(): void {
    const page = this.paginaAtualFornecedores();
    if (page > 0) {
      this.paginaAtualFornecedores.set(page - 1);
      this.carregarFornecedores();
    }
  }

  /**
   * Navega para próxima página
   */
  proximaPaginaFornecedores(): void {
    const page = this.paginaAtualFornecedores();
    const totalPages = this.fornecedoresPage()?.totalPages || 0;
    if (page < totalPages - 1) {
      this.paginaAtualFornecedores.set(page + 1);
      this.carregarFornecedores();
    }
  }

  /**
   * Vai para uma página específica
   */
  irParaPaginaFornecedores(page: number): void {
    const totalPages = this.fornecedoresPage()?.totalPages || 0;
    if (page >= 0 && page < totalPages) {
      this.paginaAtualFornecedores.set(page);
      this.carregarFornecedores();
    }
  }

  /**
   * Retorna array de páginas para paginação
   */
  getPaginasFornecedores(): number[] {
    const totalPages = this.fornecedoresPage()?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  abrirModalNovoFornecedor(): void {
    this.fornecedorForm.reset({ tipoEndereco: 'MATRIZ' });
    this.editFornecedorId.set(null);
    this.showModalFornecedor.set(true);
  }

  abrirModalEditarFornecedor(fornecedor: Fornecedor): void {
    const endereco = fornecedor.enderecos?.[0];

    this.fornecedorForm.patchValue({
      nome: fornecedor.nome,
      cnpj: fornecedor.cnpj,
      email: fornecedor.email,
      telefone: fornecedor.telefone,
      observacoes: fornecedor.observacoes || '',
      cep: endereco?.cep || '',
      logradouro: endereco?.logradouro || '',
      numero: endereco?.numero || '',
      complemento: endereco?.complemento || '',
      bairro: endereco?.bairro || '',
      cidade: endereco?.cidade || '',
      estado: endereco?.estado || '',
      tipoEndereco: endereco?.tipo || 'MATRIZ',
    });

    this.editFornecedorId.set(fornecedor.id || null);
    this.showModalFornecedor.set(true);
  }

  visualizarFornecedor(fornecedor: Fornecedor): void {
    // Abre o modal de edição em modo visualização (implementação futura com readonly)
    this.abrirModalEditarFornecedor(fornecedor);
  }

  fecharModalFornecedor(): void {
    this.fornecedorForm.reset();
    this.editFornecedorId.set(null);
    this.showModalFornecedor.set(false);
  }

  async salvarFornecedor(): Promise<void> {
    if (!this.fornecedorForm.valid) {
      this.fornecedorForm.markAllAsTouched();
      return;
    }

    const formValue = this.fornecedorForm.value;
    const fornecedorData: Fornecedor = {
      nome: formValue.nome,
      cnpj: formValue.cnpj,
      email: formValue.email,
      telefone: formValue.telefone,
      observacoes: formValue.observacoes,
      enderecos: [
        {
          logradouro: formValue.logradouro,
          numero: formValue.numero,
          complemento: formValue.complemento,
          bairro: formValue.bairro,
          cidade: formValue.cidade,
          estado: formValue.estado,
          cep: formValue.cep,
          tipo: formValue.tipoEndereco,
        },
      ],
    };

    try {
      const id = this.editFornecedorId();
      if (id) {
        await this.fornecedorService.atualizar(id, fornecedorData).toPromise();
        alert('Fornecedor atualizado com sucesso!');
      } else {
        await this.fornecedorService.criar(fornecedorData).toPromise();
        alert('Fornecedor criado com sucesso!');
      }
      this.fecharModalFornecedor();
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor');
    }
  }

  async excluirFornecedor(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este fornecedor?')) {
      return;
    }

    try {
      await this.fornecedorService.deletar(id).toPromise();
      alert('Fornecedor removido com sucesso!');
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro ao excluir fornecedor');
    }
  }

  async ativarFornecedor(id: number): Promise<void> {
    if (!confirm('Deseja ativar este fornecedor?')) {
      return;
    }

    try {
      await this.fornecedorService.ativar(id).toPromise();
      alert('Fornecedor ativado com sucesso!');
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao ativar fornecedor:', error);
      alert('Erro ao ativar fornecedor');
    }
  }

  async desativarFornecedor(id: number): Promise<void> {
    if (!confirm('Deseja desativar este fornecedor?')) {
      return;
    }

    try {
      await this.fornecedorService.desativar(id).toPromise();
      alert('Fornecedor desativado com sucesso!');
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao desativar fornecedor:', error);
      alert('Erro ao desativar fornecedor');
    }
  }

  async buscarCep(cep: string): Promise<void> {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    this.isLoadingCep.set(true);
    try {
      const endereco = await this.viaCepService.buscarCep(cepLimpo).toPromise();
      if (endereco && !endereco.erro) {
        this.fornecedorForm.patchValue({
          logradouro: endereco.logradouro || '',
          bairro: endereco.bairro || '',
          cidade: endereco.localidade || '',
          estado: endereco.uf || '',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      this.isLoadingCep.set(false);
    }
  }

  // ========================================================================
  // CATEGORIAS - CRUD
  // ========================================================================

  async carregarCategorias(): Promise<void> {
    this.isLoadingCategorias.set(true);
    try {
      const categorias = await this.categoriaService.listar().toPromise();
      this.categorias.set(categorias || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias');
    } finally {
      this.isLoadingCategorias.set(false);
    }
  }

  abrirModalNovaCategoria(): void {
    this.categoriaForm.reset();
    this.editCategoriaId.set(null);
    this.showModalCategoria.set(true);
  }

  abrirModalEditarCategoria(categoria: Categoria): void {
    this.categoriaForm.patchValue({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
    });
    this.editCategoriaId.set(categoria.id || null);
    this.showModalCategoria.set(true);
  }

  visualizarCategoria(categoria: Categoria): void {
    // Abre o modal de edição em modo visualização (implementação futura com readonly)
    this.abrirModalEditarCategoria(categoria);
  }

  fecharModalCategoria(): void {
    this.categoriaForm.reset();
    this.editCategoriaId.set(null);
    this.showModalCategoria.set(false);
  }

  async salvarCategoria(): Promise<void> {
    if (!this.categoriaForm.valid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    const categoriaData: Categoria = {
      nome: this.categoriaForm.value.nome,
      descricao: this.categoriaForm.value.descricao,
    };

    try {
      const id = this.editCategoriaId();
      if (id) {
        await this.categoriaService.atualizar(id, categoriaData).toPromise();
        alert('Categoria atualizada com sucesso!');
      } else {
        await this.categoriaService.criar(categoriaData).toPromise();
        alert('Categoria criada com sucesso!');
      }
      this.fecharModalCategoria();
      this.carregarCategorias();
      this.carregarSubcategorias(); // Recarregar subcategorias também
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  }

  async excluirCategoria(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) {
      return;
    }

    try {
      await this.categoriaService.deletar(id).toPromise();
      alert('Categoria removida com sucesso!');
      this.carregarCategorias();
      this.carregarSubcategorias(); // Recarregar subcategorias também
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert(
        'Erro ao excluir categoria. Verifique se não há subcategorias vinculadas.'
      );
    }
  }

  // ========================================================================
  // SUBCATEGORIAS - CRUD
  // ========================================================================

  async carregarSubcategorias(): Promise<void> {
    this.isLoadingSubcategorias.set(true);
    try {
      const subcategorias = await this.subcategoriaService.listar().toPromise();
      this.subcategorias.set(subcategorias || []);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      alert('Erro ao carregar subcategorias');
    } finally {
      this.isLoadingSubcategorias.set(false);
    }
  }

  async abrirModalNovaSubcategoria(): Promise<void> {
    // Garantir que as categorias estejam carregadas
    if (this.categorias().length === 0) {
      await this.carregarCategorias();
    }
    this.subcategoriaForm.reset();
    this.editSubcategoriaId.set(null);
    this.showModalSubcategoria.set(true);
  }

  async abrirModalEditarSubcategoria(
    subcategoria: Subcategoria
  ): Promise<void> {
    // Garantir que as categorias estejam carregadas
    if (this.categorias().length === 0) {
      await this.carregarCategorias();
    }
    this.subcategoriaForm.patchValue({
      categoriaId: subcategoria.categoriaId,
      nome: subcategoria.nome,
      descricao: subcategoria.descricao || '',
    });
    this.editSubcategoriaId.set(subcategoria.id || null);
    this.showModalSubcategoria.set(true);
  }

  fecharModalSubcategoria(): void {
    this.subcategoriaForm.reset();
    this.editSubcategoriaId.set(null);
    this.showModalSubcategoria.set(false);
  }

  async salvarSubcategoria(): Promise<void> {
    if (!this.subcategoriaForm.valid) {
      this.subcategoriaForm.markAllAsTouched();
      return;
    }

    const subcategoriaData: Subcategoria = {
      categoriaId: Number(this.subcategoriaForm.value.categoriaId),
      nome: this.subcategoriaForm.value.nome,
      descricao: this.subcategoriaForm.value.descricao,
    };

    try {
      const id = this.editSubcategoriaId();
      if (id) {
        await this.subcategoriaService
          .atualizar(id, subcategoriaData)
          .toPromise();
        alert('Subcategoria atualizada com sucesso!');
      } else {
        await this.subcategoriaService.criar(subcategoriaData).toPromise();
        alert('Subcategoria criada com sucesso!');
      }
      this.fecharModalSubcategoria();
      this.carregarSubcategorias();
    } catch (error) {
      console.error('Erro ao salvar subcategoria:', error);
      alert('Erro ao salvar subcategoria');
    }
  }

  async excluirSubcategoria(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover esta subcategoria?')) {
      return;
    }

    try {
      await this.subcategoriaService.deletar(id).toPromise();
      alert('Subcategoria removida com sucesso!');
      this.carregarSubcategorias();
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
      alert(
        'Erro ao excluir subcategoria. Verifique se não há produtos vinculados.'
      );
    }
  }

  // ========================================================================
  // SEGMENTOS - CRUD
  // ========================================================================

  async carregarSegmentos(): Promise<void> {
    this.isLoadingSegmentos.set(true);
    try {
      const segmentos = await this.segmentoService.listar().toPromise();
      this.segmentos.set(segmentos || []);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      alert('Erro ao carregar segmentos');
    } finally {
      this.isLoadingSegmentos.set(false);
    }
  }

  async carregarSegmentosPorSubcategoria(
    subcategoriaId: number
  ): Promise<void> {
    this.isLoadingSegmentos.set(true);
    try {
      const segmentos = await this.segmentoService
        .listarPorSubcategoria(subcategoriaId)
        .toPromise();
      this.segmentos.set(segmentos || []);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      alert('Erro ao carregar segmentos');
    } finally {
      this.isLoadingSegmentos.set(false);
    }
  }

  async abrirModalNovoSegmento(): Promise<void> {
    // Garantir que as subcategorias estejam carregadas
    if (this.subcategorias().length === 0) {
      await this.carregarSubcategorias();
    }
    this.segmentoForm.reset();
    this.editSegmentoId.set(null);
    this.showModalSegmento.set(true);
  }

  async abrirModalEditarSegmento(segmento: Segmento): Promise<void> {
    // Garantir que as subcategorias estejam carregadas
    if (this.subcategorias().length === 0) {
      await this.carregarSubcategorias();
    }
    this.segmentoForm.patchValue({
      subcategoriaId: segmento.subcategoriaId,
      nome: segmento.nome,
      descricao: segmento.descricao || '',
    });
    this.editSegmentoId.set(segmento.id || null);
    this.showModalSegmento.set(true);
  }

  fecharModalSegmento(): void {
    this.segmentoForm.reset();
    this.editSegmentoId.set(null);
    this.showModalSegmento.set(false);
  }

  async salvarSegmento(): Promise<void> {
    if (!this.segmentoForm.valid) {
      this.segmentoForm.markAllAsTouched();
      return;
    }

    const segmentoData: Segmento = {
      subcategoriaId: Number(this.segmentoForm.value.subcategoriaId),
      nome: this.segmentoForm.value.nome,
      descricao: this.segmentoForm.value.descricao,
    };

    try {
      const id = this.editSegmentoId();
      if (id) {
        await this.segmentoService.atualizar(id, segmentoData).toPromise();
        alert('Segmento atualizado com sucesso!');
      } else {
        await this.segmentoService.criar(segmentoData).toPromise();
        alert('Segmento criado com sucesso!');
      }
      this.fecharModalSegmento();
      this.carregarSegmentos();
    } catch (error) {
      console.error('Erro ao salvar segmento:', error);
      alert('Erro ao salvar segmento');
    }
  }

  async excluirSegmento(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este segmento?')) {
      return;
    }

    try {
      await this.segmentoService.deletar(id).toPromise();
      alert('Segmento removido com sucesso!');
      this.carregarSegmentos();
    } catch (error) {
      console.error('Erro ao excluir segmento:', error);
      alert(
        'Erro ao excluir segmento. Verifique se não há produtos vinculados.'
      );
    }
  }

  // ========================================================================
  // ATRIBUTOS DINÂMICOS DE PRODUTO
  // ========================================================================

  get atributosFormArray(): FormArray {
    return this.produtoForm.get('atributos') as FormArray;
  }

  adicionarAtributo(): void {
    const atributoGroup = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      valor: ['', [Validators.required]],
      ordem: [this.atributosFormArray.length],
    });
    this.atributosFormArray.push(atributoGroup);
  }

  removerAtributo(index: number): void {
    this.atributosFormArray.removeAt(index);
    // Reordenar atributos restantes
    this.atributosFormArray.controls.forEach((control, i) => {
      control.patchValue({ ordem: i });
    });
  }

  limparAtributos(): void {
    while (this.atributosFormArray.length !== 0) {
      this.atributosFormArray.removeAt(0);
    }
  }

  // ========================================================================
  // CÁLCULOS AUTOMÁTICOS DE PRODUTO
  // ========================================================================

  private isCalculating = false; // Flag para evitar loop infinito

  /**
   * Calcula o Preço de Venda com base no Custo Unitário e Margem de Lucro
   * Fórmula: Preço de Venda = Custo Unitário * (1 + Margem/100)
   */
  calcularPrecoVenda(): void {
    if (this.isCalculating) return;
    this.isCalculating = true;

    const custo = this.produtoForm.get('custoUnitario')?.value;
    const margem = this.produtoForm.get('margemLucro')?.value;

    if (custo && margem !== null && margem !== '') {
      const custoNum = Number(custo);
      const margemNum = Number(margem);

      if (!isNaN(custoNum) && !isNaN(margemNum) && custoNum > 0) {
        const precoVenda = custoNum * (1 + margemNum / 100);
        this.produtoForm
          .get('precoVenda')
          ?.setValue(precoVenda.toFixed(2), { emitEvent: false });

        // Calcular automaticamente o Preço De (20% a mais na margem)
        this.calcularPrecoDe();
      }
    }

    this.isCalculating = false;
  }

  /**
   * Calcula a Margem de Lucro com base no Custo Unitário e Preço de Venda
   * Fórmula: Margem = ((Preço de Venda / Custo Unitário) - 1) * 100
   */
  calcularMargemLucro(): void {
    if (this.isCalculating) return;
    this.isCalculating = true;

    const custo = this.produtoForm.get('custoUnitario')?.value;
    const precoVenda = this.produtoForm.get('precoVenda')?.value;

    if (custo && precoVenda) {
      const custoNum = Number(custo);
      const precoVendaNum = Number(precoVenda);

      if (
        !isNaN(custoNum) &&
        !isNaN(precoVendaNum) &&
        custoNum > 0 &&
        precoVendaNum > 0
      ) {
        const margem = (precoVendaNum / custoNum - 1) * 100;
        this.produtoForm
          .get('margemLucro')
          ?.setValue(margem.toFixed(2), { emitEvent: false });

        // Calcular automaticamente o Preço De (20% a mais na margem)
        this.calcularPrecoDe();
      }
    }

    this.isCalculating = false;
  }

  /**
   * Calcula o Preço De com base no Custo Unitário e Margem de Lucro + 20%
   * Fórmula: Preço De = Custo Unitário * (1 + (Margem + 20)/100)
   */
  calcularPrecoDe(): void {
    const custo = this.produtoForm.get('custoUnitario')?.value;
    const margem = this.produtoForm.get('margemLucro')?.value;

    if (custo && margem !== null && margem !== '') {
      const custoNum = Number(custo);
      const margemNum = Number(margem);

      if (!isNaN(custoNum) && !isNaN(margemNum) && custoNum > 0) {
        const precoDe = custoNum * (1 + (margemNum + 20) / 100);
        this.produtoForm
          .get('precoDe')
          ?.setValue(precoDe.toFixed(2), { emitEvent: false });
      }
    }
  }

  // ========================================================================
  // PRODUTOS - CRUD
  // ========================================================================

  /**
   * Retorna apenas o primeiro nome do fornecedor
   */
  getPrimeiroNomeFornecedor(nomeCompleto: string | undefined): string {
    if (!nomeCompleto) return '-';
    return nomeCompleto.split(' ')[0];
  }

  /**
   * Retorna a URL da primeira imagem do produto ou placeholder
   */
  getImagemProduto(produto: Produto): string {
    try {
      if (!produto) {
        console.warn('getImagemProduto: Produto é null ou undefined');
        return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
      }

      // Log detalhado do produto completo
      console.log(`🔍 getImagemProduto chamado para produto ${produto.id} (${produto.nome})`, {
        produtoCompleto: produto,
        temImagens: !!produto.imagens,
        tipoImagens: typeof produto.imagens,
        isArray: Array.isArray(produto.imagens),
        length: produto.imagens?.length
      });

      if (!produto.imagens) {
        console.log(`⚠️ getImagemProduto: Produto ${produto.id} não tem propriedade imagens`);
        return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
      }

      if (!Array.isArray(produto.imagens)) {
        console.warn(`⚠️ getImagemProduto: Produto ${produto.id} tem imagens mas não é array:`, typeof produto.imagens, produto.imagens);
        return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
      }

      if (produto.imagens.length === 0) {
        console.log(`⚠️ getImagemProduto: Produto ${produto.id} tem array de imagens vazio`);
        return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
      }

      console.log(`✅ getImagemProduto: Produto ${produto.id} tem ${produto.imagens.length} imagem(ns)`, produto.imagens);

      // Filtrar apenas imagens ativas (ativa !== false significa que aceita true ou undefined)
      const imagensAtivas = produto.imagens.filter((img) => {
        const isAtiva = img.ativa !== false;
        console.log(`  📸 Imagem ${img.id}: URL=${img.url}, Principal=${img.principal}, Ativa=${img.ativa} (isAtiva=${isAtiva})`);
        return isAtiva;
      });
      
      if (imagensAtivas.length === 0) {
        console.log(`⚠️ getImagemProduto: Produto ${produto.id} não tem imagens ativas`);
        return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
      }

      // Procura pela imagem principal primeiro
      const imagemPrincipal = imagensAtivas.find((img) => img.principal === true);
      if (imagemPrincipal && imagemPrincipal.url) {
        const urlFinal = this.construirUrlImagem(imagemPrincipal.url);
        console.log(`✅ getImagemProduto: Usando imagem principal - URL original: "${imagemPrincipal.url}", URL final: "${urlFinal}"`);
        return urlFinal;
      }
      
      // Se não houver principal, pega a primeira imagem com URL válida
      const primeiraImagem = imagensAtivas.find((img) => img.url && img.url.trim() !== '');
      if (primeiraImagem && primeiraImagem.url) {
        const urlFinal = this.construirUrlImagem(primeiraImagem.url);
        console.log(`✅ getImagemProduto: Usando primeira imagem - URL original: "${primeiraImagem.url}", URL final: "${urlFinal}"`);
        return urlFinal;
      }

      console.warn(`⚠️ getImagemProduto: Produto ${produto.id} tem imagens mas nenhuma com URL válida`, imagensAtivas);
    } catch (error) {
      console.error('❌ Erro ao carregar imagem do produto:', error, produto);
    }
    
    // Placeholder padrão se não houver imagem ou erro
    return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
  }

  /**
   * Constrói a URL completa da imagem
   */
  private construirUrlImagem(url: string): string {
    if (!url || url.trim() === '') {
      console.warn('construirUrlImagem: URL vazia ou null');
      return 'https://via.placeholder.com/50/e9ecef/6c757d?text=Sem+Foto';
    }

    // Se já tem protocolo, retorna como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Se começa com /, adiciona apenas o domínio
    if (url.startsWith('/')) {
      // Se começa com /assets, retorna como está (URL local)
      const urlFinal = url.startsWith('/assets') ? url : url.startsWith('/') ? url : `/assets/${url}`;
      console.log(`construirUrlImagem: URL relativa "${url}" -> "${urlFinal}"`);
      return urlFinal;
    }

    // Caso contrário, adiciona /uploads/ se não tiver
    if (!url.startsWith('/uploads/')) {
      // Se começa com /assets, retorna como está (URL local)
      const urlFinal = url.startsWith('/assets') ? url : url.startsWith('/') ? url : `/assets/${url}`;
      console.log(`construirUrlImagem: URL sem barra "${url}" -> "${urlFinal}"`);
      return urlFinal;
    }

    // Se começa com /assets, retorna como está (URL local)
    const urlFinal = url.startsWith('/assets') ? url : url.startsWith('/') ? url : `/assets/${url}`;
    console.log(`construirUrlImagem: URL final "${urlFinal}"`);
    return urlFinal;
  }

  /**
   * Handler para erro ao carregar imagem
   */
  onImagemError(event: Event, produto: Produto): void {
    const img = event.target as HTMLImageElement;
    console.error(`❌ Erro ao carregar imagem do produto ${produto.id}:`, {
      src: img.src,
      produto: produto.nome,
      imagens: produto.imagens
    });
    
    // Substituir por placeholder
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div style="width:50px;height:50px;background:#e9ecef;border:1px solid #dee2e6;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#6c757d;font-size:10px;">
          Sem Foto
        </div>
      `;
    }
  }

  /**
   * Handler para sucesso ao carregar imagem
   */
  onImagemLoad(event: Event, produto: Produto): void {
    console.log(`✅ Imagem carregada com sucesso para produto ${produto.id}`);
  }

  async carregarProdutos(): Promise<void> {
    this.isLoadingProdutos.set(true);
    this.erroCarregarProdutos.set(null); // Limpar erro anterior
    
    try {
      const response = await this.produtoService
        .listarPaginado(0, 100) // Aumentar para 100 para carregar mais produtos
        .toPromise();
      
      if (!response) {
        console.warn('Resposta vazia ao carregar produtos');
        this.produtos.set([]);
        return;
      }

      const produtos = response.content || [];

      // Debug: verificar imagens recebidas
      console.log('🔍 DEBUG: Produtos recebidos:', produtos.length);
      console.log('🔍 DEBUG: Resposta completa:', JSON.stringify(produtos, null, 2));
      
      produtos.forEach((produto, index) => {
        console.log(`\n📦 Produto ${index + 1}/${produtos.length}:`, {
          id: produto.id,
          nome: produto.nome,
          temImagens: !!produto.imagens,
          tipoImagens: typeof produto.imagens,
          isArray: Array.isArray(produto.imagens),
          imagensRaw: produto.imagens,
          imagensLength: produto.imagens?.length
        });
        
        if (produto.imagens && Array.isArray(produto.imagens) && produto.imagens.length > 0) {
          console.log(`  ✅ Produto ${produto.id} tem ${produto.imagens.length} imagem(ns):`);
          produto.imagens.forEach((img, imgIndex) => {
            console.log(
              `    📸 Imagem ${imgIndex + 1}: ID=${img.id}, URL="${img.url}", Principal=${img.principal}, Ativa=${img.ativa}`
            );
          });
          // Testar URL construída
          const urlTeste = this.getImagemProduto(produto);
          console.log(`  🔗 URL construída para produto ${produto.id}: "${urlTeste}"`);
        } else {
          console.log(`  ⚠️ Produto ${produto.id} NÃO tem imagens no array ou não é array válido`);
          console.log(`     Tipo: ${typeof produto.imagens}, Valor:`, produto.imagens);
        }
      });

      this.produtos.set(produtos);
      this.erroCarregarProdutos.set(null); // Limpar erro em caso de sucesso
    } catch (error: any) {
      console.error('Erro completo ao carregar produtos:', error);
      console.error('Resposta do servidor:', error.error);
      console.error('Status:', error.status);
      console.error('Mensagem:', error.message);

      // Tratamento mais específico de erros
      let mensagemErro: string | null = null;
      
      if (error.status === 401) {
        mensagemErro = 'Erro de autenticação. Por favor, faça login novamente.';
      } else if (error.status === 403) {
        mensagemErro = 'Você não tem permissão para acessar esta funcionalidade.';
      } else if (error.status === 404) {
        mensagemErro = 'Endpoint não encontrado. Verifique se o servidor está rodando.';
      } else if (error.status === 500) {
        mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (error.status === 0 || error.status === undefined) {
        mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.error?.message) {
        mensagemErro = error.error.message;
      } else if (error.message) {
        mensagemErro = error.message;
      } else {
        mensagemErro = 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
      }

      // Definir mensagem de erro no signal
      this.erroCarregarProdutos.set(mensagemErro);
      
      // Definir array vazio em caso de erro para não quebrar a interface
      this.produtos.set([]);
    } finally {
      this.isLoadingProdutos.set(false);
    }
  }

  async abrirModalNovoProduto(): Promise<void> {
    // Garantir que fornecedores e segmentos estejam carregados
    if (this.fornecedores().length === 0) {
      await this.carregarFornecedores();
    }
    if (this.segmentos().length === 0) {
      await this.carregarSegmentos();
    }
    this.produtoForm.reset({
      unidadeMedida: 'UNIDADE',
      estoqueInicial: 0,
      destaque: false,
      maisVendido: false,
      atributos: this.fb.array([]),
    });
    this.limparAtributos();
    this.limparImagens();
    this.editProdutoId.set(null);
    this.showModalProduto.set(true);
  }

  async abrirModalEditarProduto(produto: Produto): Promise<void> {
    // Garantir que fornecedores e segmentos estejam carregados
    if (this.fornecedores().length === 0) {
      await this.carregarFornecedores();
    }
    if (this.segmentos().length === 0) {
      await this.carregarSegmentos();
    }

    // Limpar atributos anteriores
    this.limparAtributos();

    // Preencher atributos do produto
    if (produto.atributos && produto.atributos.length > 0) {
      produto.atributos.forEach((attr) => {
        this.atributosFormArray.push(
          this.fb.group({
            nome: [attr.nome, [Validators.required, Validators.minLength(2)]],
            valor: [attr.valor, [Validators.required]],
            ordem: [attr.ordem || this.atributosFormArray.length],
          })
        );
      });
    }

    this.produtoForm.patchValue({
      nome: produto.nome,
      descricao: produto.descricao || '',
      segmentoId: produto.segmentoId,
      fornecedorId: produto.fornecedorId,
      custoUnitario: produto.custoUnitario,
      margemLucro: produto.margemLucro || '',
      precoVenda: produto.precoVenda || '',
      precoDe: produto.precoDe || '',
      estoqueInicial: produto.estoqueAtual || 0,
      unidadeMedida: produto.unidadeMedida,
      destaque: produto.destaque || false,
      maisVendido: produto.maisVendido || false,
    });
    this.editProdutoId.set(produto.id || null);
    this.showModalProduto.set(true);
  }

  visualizarProduto(produto: Produto): void {
    // Abre o modal de edição em modo visualização (implementação futura com readonly)
    this.abrirModalEditarProduto(produto);
  }

  fecharModalProduto(): void {
    this.produtoForm.reset({
      unidadeMedida: 'UNIDADE',
      estoqueInicial: 0,
      destaque: false,
      maisVendido: false,
      atributos: this.fb.array([]),
    });
    this.limparAtributos();
    this.editProdutoId.set(null);
    this.showModalProduto.set(false);
    this.limparImagens();
  }

  // ========================================================================
  // UPLOAD DE IMAGENS
  // ========================================================================

  /**
   * Manipula a seleção de arquivos de imagem
   */
  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivos = Array.from(input.files);
    const imagensAtuais = this.imagensSelecionadas();

    // Limitar a 3 imagens
    const imagensRestantes = 3 - imagensAtuais.length;
    const novasImagens = arquivos.slice(0, imagensRestantes);

    if (arquivos.length > imagensRestantes) {
      alert(
        `Você pode adicionar no máximo 3 imagens. ${imagensRestantes} imagens serão adicionadas.`
      );
    }

    // Adicionar novas imagens
    this.imagensSelecionadas.set([...imagensAtuais, ...novasImagens]);

    // Gerar previews
    this.gerarPreviews(novasImagens);

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    input.value = '';
  }

  /**
   * Gera previews das imagens selecionadas
   */
  private gerarPreviews(arquivos: File[]): void {
    const previewsAtuais = this.previewImagens();

    arquivos.forEach((arquivo) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previews = this.previewImagens();
        this.previewImagens.set([...previews, e.target.result]);
      };
      reader.readAsDataURL(arquivo);
    });
  }

  /**
   * Remove uma imagem selecionada
   */
  removerImagem(index: number): void {
    const imagens = this.imagensSelecionadas();
    const previews = this.previewImagens();

    imagens.splice(index, 1);
    previews.splice(index, 1);

    this.imagensSelecionadas.set([...imagens]);
    this.previewImagens.set([...previews]);
  }

  /**
   * Limpa todas as imagens selecionadas
   */
  limparImagens(): void {
    this.imagensSelecionadas.set([]);
    this.previewImagens.set([]);
  }

  async salvarProduto(event?: Event): Promise<void> {
    // Prevenir submit padrão se o evento foi passado
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('🔵 Método salvarProduto chamado');
    console.log('Formulário válido?', this.produtoForm.valid);
    console.log('Valores do formulário:', this.produtoForm.value);
    console.log('Status dos campos:', {
      nome: this.produtoForm.get('nome')?.valid,
      segmentoId: this.produtoForm.get('segmentoId')?.valid,
      fornecedorId: this.produtoForm.get('fornecedorId')?.valid,
      custoUnitario: this.produtoForm.get('custoUnitario')?.valid,
      margemLucro: this.produtoForm.get('margemLucro')?.valid,
      precoVenda: this.produtoForm.get('precoVenda')?.valid,
      estoqueInicial: this.produtoForm.get('estoqueInicial')?.valid,
    });

    if (!this.produtoForm.valid) {
      this.produtoForm.markAllAsTouched();
      console.error('Formulário inválido:', this.produtoForm.value);
      console.error('Erros do formulário:', this.getFormValidationErrors());
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    // Validar campos numéricos antes de enviar
    const custoUnitario = Number(this.produtoForm.value.custoUnitario);
    const margemLucro = Number(this.produtoForm.value.margemLucro);
    const precoVenda = Number(this.produtoForm.value.precoVenda);
    const estoqueInicial = Number(this.produtoForm.value.estoqueInicial);

    if (isNaN(custoUnitario) || custoUnitario <= 0) {
      alert('❌ Custo Unitário deve ser um valor maior que zero.');
      return;
    }

    if (isNaN(margemLucro) || margemLucro < 0) {
      alert('❌ Margem de Lucro deve ser um valor válido.');
      return;
    }

    if (isNaN(precoVenda) || precoVenda <= 0) {
      alert('❌ Preço de Venda deve ser um valor maior que zero.');
      return;
    }

    if (isNaN(estoqueInicial) || estoqueInicial < 0) {
      alert('❌ Estoque Inicial deve ser um valor válido (0 ou maior).');
      return;
    }

    // Preparar dados, removendo campos vazios
    const precoDe = this.produtoForm.value.precoDe;

    const produtoData: any = {
      nome: this.produtoForm.value.nome?.trim(),
      segmentoId: Number(this.produtoForm.value.segmentoId),
      fornecedorId: Number(this.produtoForm.value.fornecedorId),
      custoUnitario: custoUnitario,
      margemLucro: margemLucro,
      precoVenda: precoVenda,
      estoqueAtual: estoqueInicial,
      unidadeMedida: this.produtoForm.value.unidadeMedida,
      destaque: this.produtoForm.value.destaque || false,
      maisVendido: this.produtoForm.value.maisVendido || false,
    };

    // Adicionar campos opcionais apenas se tiverem valor
    if (this.produtoForm.value.descricao?.trim()) {
      produtoData.descricao = this.produtoForm.value.descricao.trim();
    }

    if (precoDe && Number(precoDe) > 0) {
      produtoData.precoDe = Number(precoDe);
    }

    // Adicionar atributos dinâmicos
    const atributos = this.atributosFormArray.value
      .filter((attr: any) => attr.nome && attr.valor)
      .map((attr: any) => ({
        nome: attr.nome.trim(),
        valor: attr.valor.trim(),
        ordem: attr.ordem || 0,
      }));

    if (atributos.length > 0) {
      produtoData.atributos = atributos;
    }

    console.log('✅ Dados do produto a serem enviados:', JSON.stringify(produtoData, null, 2));

    try {
      const id = this.editProdutoId();
      if (id) {
        // Atualização (sem imagens por enquanto)
        console.log('📝 Atualizando produto ID:', id);
        await this.produtoService.atualizar(id, produtoData).toPromise();
        alert('✅ Produto atualizado com sucesso!');
      } else {
        // Criação: verificar se há imagens
        const imagens = this.imagensSelecionadas();
        if (imagens.length > 0) {
          // Criar com imagens usando FormData
          console.log('📸 Criando produto com', imagens.length, 'imagem(ns)');
          await this.criarProdutoComImagens(produtoData, imagens);
        } else {
          // Criar sem imagens
          console.log('📦 Criando produto sem imagens');
          const produtoCriado = await this.produtoService.criar(produtoData).toPromise();
          console.log('✅ Produto criado:', produtoCriado);
          alert('✅ Produto criado com sucesso!');
        }
      }
      // Recarregar produtos antes de fechar o modal para garantir que apareça na lista
      await this.carregarProdutos();
      this.fecharModalProduto();
    } catch (error: any) {
      console.error('❌ Erro completo ao salvar produto:', error);
      console.error('Resposta do servidor:', error.error);
      console.error('Status:', error.status);
      console.error('Headers:', error.headers);

      // Tratamento mais específico de erros
      let mensagemErro = 'Erro ao salvar produto';
      
      if (error.status === 400) {
        mensagemErro = 'Dados inválidos. Verifique os campos preenchidos.';
        if (error.error?.message) {
          mensagemErro += ` ${error.error.message}`;
        }
        // Mostrar detalhes dos erros de validação se disponíveis
        if (error.error?.errors) {
          const erros = error.error.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
          mensagemErro += ` Detalhes: ${erros}`;
        }
      } else if (error.status === 401) {
        mensagemErro = 'Erro de autenticação. Por favor, faça login novamente.';
      } else if (error.status === 403) {
        mensagemErro = 'Você não tem permissão para realizar esta ação.';
      } else if (error.status === 404) {
        mensagemErro = 'Recurso não encontrado. Verifique se o produto ainda existe.';
      } else if (error.status === 500) {
        mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
        if (error.error?.message) {
          mensagemErro += ` ${error.error.message}`;
        }
      } else if (error.status === 0 || error.status === undefined) {
        mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.error?.message) {
        mensagemErro = `Erro ao salvar produto: ${error.error.message}`;
      } else if (error.message) {
        mensagemErro = `Erro ao salvar produto: ${error.message}`;
      } else {
        mensagemErro = 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
      }

      alert('❌ ' + mensagemErro);
    }
  }

  /**
   * Helper para obter erros de validação do formulário
   */
  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.produtoForm.controls).forEach(key => {
      const control = this.produtoForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  /**
   * Cria produto com upload de imagens
   */
  private async criarProdutoComImagens(
    produtoData: any,
    imagens: File[]
  ): Promise<void> {
    const formData = new FormData();

    // Adicionar dados do produto (campos obrigatórios)
    formData.append('nome', produtoData.nome);
    formData.append('segmentoId', produtoData.segmentoId.toString());
    formData.append('fornecedorId', produtoData.fornecedorId.toString());
    formData.append('custoUnitario', produtoData.custoUnitario.toString());
    formData.append('margemLucro', produtoData.margemLucro.toString());
    formData.append('precoVenda', produtoData.precoVenda.toString()); // IMPORTANTE: Adicionar precoVenda
    formData.append('unidadeMedida', produtoData.unidadeMedida);
    formData.append('estoqueInicial', produtoData.estoqueAtual.toString());
    formData.append('destaque', produtoData.destaque.toString());
    formData.append('maisVendido', produtoData.maisVendido.toString());

    // Campos opcionais
    if (produtoData.descricao) {
      formData.append('descricao', produtoData.descricao);
    }
    if (produtoData.precoDe && Number(produtoData.precoDe) > 0) {
      formData.append('precoDe', produtoData.precoDe.toString());
    }

    // Adicionar atributos dinâmicos (JSON string)
    if (produtoData.atributos && produtoData.atributos.length > 0) {
      formData.append('atributos', JSON.stringify(produtoData.atributos));
    }

    // Adicionar imagens
    imagens.forEach((imagem, index) => {
      formData.append('imagens', imagem, imagem.name);
      // Descrição padrão para cada imagem
      formData.append(
        `imagemDesc${index + 1}`,
        `Imagem ${index + 1} - ${produtoData.nome}`
      );
    });

    // Log do FormData (sem mostrar arquivos)
    console.log('📤 Enviando produto com imagens...');
    console.log('Dados do FormData:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [Arquivo] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    try {
      const produtoCriado = await this.produtoService.criarComImagens(formData).toPromise();
      console.log('✅ Produto criado com imagens:', produtoCriado);
      alert('✅ Produto criado com imagens com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao criar produto com imagens:', error);
      throw error; // Re-lançar para ser tratado no método salvarProduto
    }
  }

  async excluirProduto(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return;
    }

    try {
      await this.produtoService.deletar(id).toPromise();
      alert('Produto removido com sucesso!');
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  }

  async ativarProduto(): Promise<void> {
    const id = this.editProdutoId();
    if (!id) {
      alert('Nenhum produto selecionado');
      return;
    }

    if (!confirm('Deseja ativar este produto?')) {
      return;
    }

    try {
      await this.produtoService.ativar(id).toPromise();
      alert('Produto ativado com sucesso!');
      this.fecharModalProduto();
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao ativar produto:', error);
      alert('Erro ao ativar produto');
    }
  }

  async desativarProduto(): Promise<void> {
    const id = this.editProdutoId();
    if (!id) {
      alert('Nenhum produto selecionado');
      return;
    }

    if (!confirm('Deseja desativar este produto?')) {
      return;
    }

    try {
      await this.produtoService.desativar(id).toPromise();
      alert('Produto desativado com sucesso!');
      this.fecharModalProduto();
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao desativar produto:', error);
      alert('Erro ao desativar produto');
    }
  }

  // ========================================================================
  // CONTROLE DE CARROSSEL DE DESTAQUES
  // ========================================================================

  /**
   * Carrega todos os itens do carrossel de destaques
   */
  async carregarCarrosselDestaques(): Promise<void> {
    this.isLoadingCarrosselDestaques.set(true);
    try {
      const itens = await this.carrosselDestaqueService.listarTodos().toPromise();
      this.carrosselDestaques.set(itens || []);
    } catch (error) {
      console.error('Erro ao carregar carrossel de destaques:', error);
      alert('Erro ao carregar itens do carrossel');
    } finally {
      this.isLoadingCarrosselDestaques.set(false);
    }
  }

  /**
   * Abre modal para criar novo item do carrossel
   */
  abrirModalNovoCarrosselDestaque(): void {
    this.carrosselDestaqueForm.reset({
      imageUrl: '',
      title: '',
      description: '',
      ordem: this.carrosselDestaques().length,
      ativo: true,
    });
    this.editCarrosselDestaqueId.set(null);
    this.imagemCarrosselSelecionada.set(null);
    this.previewImagemCarrossel.set(null);
    this.showModalCarrosselDestaque.set(true);
  }

  /**
   * Abre modal para editar item do carrossel
   */
  abrirModalEditarCarrosselDestaque(item: CarrosselDestaque): void {
    this.carrosselDestaqueForm.patchValue({
      imageUrl: item.imageUrl,
      title: item.title || '',
      description: item.description || '',
      ordem: item.ordem,
      ativo: item.ativo,
    });
    this.editCarrosselDestaqueId.set(item.id || null);
    this.imagemCarrosselSelecionada.set(null);
    this.previewImagemCarrossel.set(item.imageUrl);
    this.showModalCarrosselDestaque.set(true);
  }

  /**
   * Fecha modal do carrossel
   */
  fecharModalCarrosselDestaque(): void {
    this.carrosselDestaqueForm.reset();
    this.editCarrosselDestaqueId.set(null);
    this.imagemCarrosselSelecionada.set(null);
    this.previewImagemCarrossel.set(null);
    this.showModalCarrosselDestaque.set(false);
  }

  /**
   * Manipula seleção de imagem para upload
   */
  onImagemCarrosselSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    this.imagemCarrosselSelecionada.set(arquivo);

    // Gerar preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImagemCarrossel.set(e.target.result);
    };
    reader.readAsDataURL(arquivo);

    // Limpar input
    input.value = '';
  }

  /**
   * Faz upload da imagem e retorna a URL
   */
  private async fazerUploadImagem(arquivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('imagens', arquivo);

    try {
      const response = await fetch('http://localhost:8080/api/upload/imagens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.auth.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const urls: string[] = await response.json();
      return urls[0] || '';
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Salva item do carrossel (criar ou atualizar)
   */
  async salvarCarrosselDestaque(): Promise<void> {
    // Validar se há imagem (upload ou URL)
    const imagemSelecionada = this.imagemCarrosselSelecionada();
    const imageUrlForm = this.carrosselDestaqueForm.value.imageUrl;
    
    if (!imagemSelecionada && !imageUrlForm) {
      alert('Por favor, selecione uma imagem ou informe a URL da imagem.');
      this.carrosselDestaqueForm.get('imageUrl')?.markAsTouched();
      return;
    }

    // Validar outros campos obrigatórios
    if (this.carrosselDestaqueForm.get('ordem')?.invalid || 
        this.carrosselDestaqueForm.get('ativo')?.invalid) {
      this.carrosselDestaqueForm.markAllAsTouched();
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      let imageUrl = imageUrlForm;

      // Se houver imagem selecionada, fazer upload
      if (imagemSelecionada) {
        imageUrl = await this.fazerUploadImagem(imagemSelecionada);
      }

      if (!imageUrl) {
        alert('Erro: Não foi possível obter a URL da imagem.');
        return;
      }

      const itemData: CarrosselDestaque = {
        imageUrl: imageUrl,
        title: this.carrosselDestaqueForm.value.title || undefined,
        description: this.carrosselDestaqueForm.value.description || undefined,
        ordem: this.carrosselDestaqueForm.value.ordem,
        ativo: this.carrosselDestaqueForm.value.ativo,
      };

      const id = this.editCarrosselDestaqueId();
      if (id) {
        await this.carrosselDestaqueService.atualizar(id, itemData).toPromise();
        alert('Item do carrossel atualizado com sucesso!');
      } else {
        await this.carrosselDestaqueService.criar(itemData).toPromise();
        alert('Item do carrossel criado com sucesso!');
      }

      this.fecharModalCarrosselDestaque();
      this.carregarCarrosselDestaques();
    } catch (error) {
      console.error('Erro ao salvar item do carrossel:', error);
      alert('Erro ao salvar item do carrossel');
    }
  }

  /**
   * Remove item do carrossel
   */
  async excluirCarrosselDestaque(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este item do carrossel?')) {
      return;
    }

    try {
      await this.carrosselDestaqueService.deletar(id).toPromise();
      alert('Item removido com sucesso!');
      this.carregarCarrosselDestaques();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item do carrossel');
    }
  }

  /**
   * Ativa item do carrossel
   */
  async ativarCarrosselDestaque(id: number): Promise<void> {
    try {
      await this.carrosselDestaqueService.ativar(id).toPromise();
      this.carregarCarrosselDestaques();
    } catch (error) {
      console.error('Erro ao ativar item:', error);
      alert('Erro ao ativar item');
    }
  }

  /**
   * Desativa item do carrossel
   */
  async desativarCarrosselDestaque(id: number): Promise<void> {
    try {
      await this.carrosselDestaqueService.desativar(id).toPromise();
      this.carregarCarrosselDestaques();
    } catch (error) {
      console.error('Erro ao desativar item:', error);
      alert('Erro ao desativar item');
    }
  }

  /**
   * Formata URL da imagem para exibição
   */
  formatarUrlImagemCarrossel(url: string): string {
    if (!url) return '/assets/logo/Logo-Thiers.png';
    // Se já é uma URL completa (http/https), mantém
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Se começa com /assets, retorna como está (URL local)
    if (url.startsWith('/assets')) return url;
    // Se começa com /, assume que é relativo ao assets
    if (url.startsWith('/')) return url;
    // Caso contrário, assume que é um caminho de assets
    return `/assets/${url}`;
  }

  /**
   * Abre modal para criar novo item de carrossel (método antigo - mantido para compatibilidade)
   */
  abrirModalNovoCarrossel(): void {
    this.abrirModalNovoCarrosselDestaque();
  }

  /**
   * Trata erro ao carregar imagem, definindo uma imagem padrão
   */
  tratarErroImagem(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/logo/Logo-Thiers.png';
    }
  }

  /**
   * Trata erro ao carregar imagem de produto
   */
  tratarErroImagemProduto(event: Event): void {
    this.tratarErroImagem(event);
  }

  /**
   * Formata URL da imagem do produto
   */
  formatarUrlImagemProduto(url?: string): string {
    if (!url) return '/assets/logo/Logo-Thiers.png';
    // Se já é uma URL completa (http/https), mantém
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Se começa com /assets, retorna como está (URL local)
    if (url.startsWith('/assets')) return url;
    // Se começa com /, assume que é relativo ao assets
    if (url.startsWith('/')) return url;
    // Caso contrário, assume que é um caminho de assets
    return `/assets/${url}`;
  }

  /**
   * Formata preço para exibição
   */
  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  }

  /**
   * Retorna a URL da imagem principal do produto
   */
  getImagemPrincipalProduto(produto: Produto): string | undefined {
    if (!produto.imagens || produto.imagens.length === 0) {
      return undefined;
    }
    // Busca a imagem principal primeiro
    const imagemPrincipal = produto.imagens.find(img => img.principal === true);
    if (imagemPrincipal) {
      return imagemPrincipal.url;
    }
    // Se não houver principal, retorna a primeira
    return produto.imagens[0].url;
  }

  /**
   * Retorna o título da subseção ativa
   */
  getSubsectionTitle(): string {
    if (!this.activeSubsection) return 'Painel Administrativo';

    const titles: { [key: string]: string } = {
      // Dashboard
      'dashboard-vendas': 'Dashboard - Vendas',
      'dashboard-produtos': 'Dashboard - Produtos',
      'dashboard-clientes': 'Dashboard - Clientes',
      // Estoque
      'estoque-gerenciar': 'Estoque - Gerenciar Estoque',
      'estoque-entrada': 'Estoque - Entrada de Produtos',
      'estoque-saida': 'Estoque - Saída de Produtos',
      // Fornecedores
      'fornecedores-listar': 'Fornecedores - Listar Fornecedores',
      'fornecedores-novo': 'Fornecedores - Novo Fornecedor',
      // Categorias
      'categorias-listar': 'Categorias - Listar Categorias',
      'categorias-nova': 'Categorias - Nova Categoria',
      // Subcategorias
      'subcategorias-listar': 'Subcategorias - Listar Subcategorias',
      'subcategorias-nova': 'Subcategorias - Nova Subcategoria',
      // Segmentos
      'segmentos-listar': 'Segmentos - Listar Segmentos',
      'segmentos-novo': 'Segmentos - Novo Segmento',
      // Produtos
      'produtos-listar': 'Produtos - Listar Produtos',
      'produtos-novo': 'Produtos - Novo Produto',
    };

    return titles[this.activeSubsection] || this.activeSubsection;
  }
}
