import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ProdutoService, PageResponse } from '../../../../core/services/produto.service';
import { FornecedorService } from '../../../../core/services/fornecedor.service';
import { SegmentoService } from '../../../../core/services/segmento.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { Produto } from '../../../../core/models/produto.model';
import { ProdutoAtributo } from '../../../../core/models/produto-atributo.model';
import { Fornecedor } from '../../../../core/models/fornecedor.model';
import { Segmento } from '../../../../core/models/segmento.model';
import { Categoria } from '../../../../core/models/categoria.model';
import { Subcategoria } from '../../../../core/models/subcategoria.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
})
export class ProdutosComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly segmentoService = inject(SegmentoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly subcategoriaService = inject(SubcategoriaService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly produtos = signal<Produto[]>([]);
  readonly produtosPage = signal<PageResponse<Produto> | null>(null);
  readonly isLoading = signal(false);
  readonly busca = signal<string>('');
  readonly filtroAtivos = signal<boolean | null>(null);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(10);

  // Modal
  readonly showModal = signal(false);
  readonly showModalVisualizar = signal(false);
  readonly editId = signal<number | null>(null);
  readonly produtoVisualizar = signal<Produto | null>(null);

  // Dados para formulário
  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly subcategorias = signal<Subcategoria[]>([]);
  readonly segmentos = signal<Segmento[]>([]);
  readonly segmentosFiltrados = signal<Segmento[]>([]);

  // Imagens
  readonly imagensSelecionadas = signal<File[]>([]);
  readonly previewImagens = signal<string[]>([]);

  // Form
  readonly form = this.fb.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    categoriaId: [null as number | null],
    subcategoriaId: [null as number | null],
    segmentoId: [null as number | null, [Validators.required]],
    fornecedorId: [null as number | null, [Validators.required]],
    custoUnitario: [0, [Validators.required, Validators.min(0.01)]],
    margemLucro: [0, [Validators.min(0)]],
    precoVenda: [0, [Validators.required, Validators.min(0.01)]],
    precoDe: [0, [Validators.min(0)]],
    estoqueAtual: [0, [Validators.min(0)]],
    unidadeMedida: ['UNIDADE' as 'UNIDADE' | 'PACOTE' | 'CAIXA' | 'METRO' | 'KILO', [Validators.required]],
    destaque: [false],
    maisVendido: [false],
    atributos: this.fb.array<FormArray>([]),
  });

  readonly Math = Math;
  
  // Signal para rastrear o valor formatado do Preço De
  readonly precoDeFormatado = signal<string>('');

  // Atualizar o signal quando o precoDe mudar
  private atualizarPrecoDeFormatado(): void {
    const precoDe = this.form.get('precoDe')?.value ?? 0;
    if (precoDe > 0) {
      this.precoDeFormatado.set(this.formatarMoeda(precoDe).replace('R$', '').trim());
    } else {
      this.precoDeFormatado.set('');
    }
  }

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarFornecedores();
    this.carregarCategorias();
    this.carregarSegmentos();
    this.configurarCalculos();
  }

  // Flag para controlar se o preço de venda foi editado manualmente
  private precoVendaEditadoManual = false;

  // Configurar listeners para cálculos automáticos
  private configurarCalculos(): void {
    // Quando margem de lucro ou custo unitário mudar, calcular preço de venda (se não foi editado manualmente)
    this.form.get('margemLucro')?.valueChanges.subscribe(() => {
      if (!this.precoVendaEditadoManual) {
        this.calcularPrecoVenda();
      }
    });
    this.form.get('custoUnitario')?.valueChanges.subscribe(() => {
      if (!this.precoVendaEditadoManual) {
        this.calcularPrecoVenda();
      } else {
        // Se o preço de venda foi editado manualmente e o custo mudou, recalcular margem
        this.calcularMargemLucro();
      }
    });

    // Quando preço de venda mudar, recalcular margem de lucro (se editado manualmente) e preço de
    this.form.get('precoVenda')?.valueChanges.subscribe(() => {
      // Se foi editado manualmente, recalcular margem de lucro imediatamente
      if (this.precoVendaEditadoManual) {
        this.calcularMargemLucro();
      }
      // Sempre recalcular preço de quando preço de venda mudar
      setTimeout(() => this.calcularPrecoDe(), 0);
    });

    // Quando preço de mudar, atualizar o valor formatado
    this.form.get('precoDe')?.valueChanges.subscribe(() => {
      this.atualizarPrecoDeFormatado();
    });
  }

  calcularPrecoVenda(): void {
    const custoUnitario = this.form.get('custoUnitario')?.value || 0;
    const margemLucro = this.form.get('margemLucro')?.value || 0;

    if (custoUnitario > 0 && margemLucro >= 0) {
      const precoVenda = custoUnitario * (1 + margemLucro / 100);
      this.precoVendaEditadoManual = false;
      this.form.patchValue({ precoVenda: Number(precoVenda.toFixed(2)) }, { emitEvent: false });
      // Calcular Preço De após calcular Preço Venda
      setTimeout(() => this.calcularPrecoDe(), 0);
    }
  }

  calcularMargemLucro(): void {
    const custoUnitario = this.form.get('custoUnitario')?.value || 0;
    const precoVenda = this.form.get('precoVenda')?.value || 0;

    if (custoUnitario > 0 && precoVenda > 0) {
      const margemLucro = ((precoVenda - custoUnitario) / custoUnitario) * 100;
      this.form.patchValue({ margemLucro: Number(margemLucro.toFixed(2)) }, { emitEvent: false });
    }
  }

  calcularPrecoDe(): void {
    const precoVenda = this.form.get('precoVenda')?.value || 0;

    if (precoVenda > 0) {
      // Gera um percentual aleatório entre 15% e 20%
      const percentual = 15 + Math.random() * 5; // 15 a 20%
      const precoDe = precoVenda * (1 + percentual / 100);
      // Usar setValue para garantir que o valueChanges seja disparado
      this.form.get('precoDe')?.setValue(Number(precoDe.toFixed(2)), { emitEvent: true });
    } else {
      // Se preço de venda for 0, limpar preço de
      this.form.get('precoDe')?.setValue(0, { emitEvent: true });
    }
  }

  // Extrai valor numérico de string formatada (ex: "R$ 100,00" -> 100.00)
  private extrairValorNumerico(valor: any): number {
    if (typeof valor === 'number') return valor;
    if (!valor) return 0;
    const str = String(valor).replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(str) || 0;
  }

  // Formata valor para exibição com R$
  formatarMoeda(valor: number | null | undefined): string {
    if (!valor && valor !== 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  // Formata percentual para exibição
  formatarPercentual(valor: number | null | undefined): string {
    if (!valor && valor !== 0) return '';
    return `${Number(valor).toFixed(2)}%`;
  }

  // Handler para input de Custo Unitário
  onCustoUnitarioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const numValor = parseFloat(valor) || 0;
    
    if (numValor >= 0) {
      this.form.patchValue({ custoUnitario: numValor }, { emitEvent: true });
      // Atualizar display formatado
      setTimeout(() => {
        if (numValor > 0) {
          input.value = this.formatarMoeda(numValor).replace('R$', '').trim();
        } else {
          input.value = '';
        }
      }, 0);
    }
  }

  // Handler para blur de Custo Unitário (formatar ao sair do campo)
  onCustoUnitarioBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = this.form.get('custoUnitario')?.value || 0;
    if (valor > 0) {
      input.value = this.formatarMoeda(valor).replace('R$', '').trim();
    }
  }

  // Handler para input de Margem de Lucro
  onMargemLucroInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const numValor = parseFloat(valor) || 0;
    
    if (numValor >= 0) {
      this.form.patchValue({ margemLucro: numValor }, { emitEvent: true });
      // Atualizar display formatado
      setTimeout(() => {
        if (numValor > 0) {
          input.value = this.formatarPercentual(numValor).replace('%', '').trim();
        } else {
          input.value = '';
        }
      }, 0);
    }
  }

  // Handler para blur de Margem de Lucro (formatar ao sair do campo)
  onMargemLucroBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = this.form.get('margemLucro')?.value || 0;
    if (valor > 0) {
      input.value = this.formatarPercentual(valor).replace('%', '').trim();
    }
  }

  // Handler para quando o usuário começar a editar o Preço Venda manualmente
  onPrecoVendaFocus(): void {
    // Marcar que o usuário está editando manualmente
    this.precoVendaEditadoManual = true;
  }

  // Handler para quando o usuário sair do campo Preço Venda
  onPrecoVendaBlur(): void {
    // Se o preço de venda foi editado manualmente, recalcular margem de lucro
    const precoVenda = this.form.get('precoVenda')?.value || 0;
    if (precoVenda > 0 && this.precoVendaEditadoManual) {
      this.calcularMargemLucro();
    }
  }

  // Handler para input de Preço De (tornar editável)
  onPrecoDeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const numValor = parseFloat(valor) || 0;
    
    if (numValor >= 0) {
      this.form.patchValue({ precoDe: numValor }, { emitEvent: false });
    }
  }

  // Handler para blur de Preço De (formatar ao sair do campo)
  onPrecoDeBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = this.form.get('precoDe')?.value || 0;
    if (valor > 0) {
      input.value = this.formatarMoeda(valor).replace('R$', '').trim();
      this.atualizarPrecoDeFormatado();
    }
  }

  get atributosFormArray(): FormArray {
    return this.form.get('atributos') as FormArray;
  }

  adicionarAtributo(): void {
    const atributoForm = this.fb.group({
      nome: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      ordem: [this.atributosFormArray.length],
    });
    this.atributosFormArray.push(atributoForm);
  }

  removerAtributo(index: number): void {
    this.atributosFormArray.removeAt(index);
    // Reordenar
    this.atributosFormArray.controls.forEach((control, i) => {
      control.patchValue({ ordem: i });
    });
  }

  onCategoriaChange(): void {
    const categoriaId = this.form.get('categoriaId')?.value;
    this.form.patchValue({ subcategoriaId: null, segmentoId: null });
    this.subcategorias.set([]);
    this.segmentosFiltrados.set([]);

    if (categoriaId) {
      this.carregarSubcategorias(categoriaId);
    }
  }

  onSubcategoriaChange(): void {
    const subcategoriaId = this.form.get('subcategoriaId')?.value;
    this.form.patchValue({ segmentoId: null });
    this.segmentosFiltrados.set([]);

    if (subcategoriaId) {
      this.carregarSegmentosPorSubcategoria(subcategoriaId);
    }
  }

  async carregarProdutos(): Promise<void> {
    this.isLoading.set(true);
    try {
      const busca = this.busca().trim();
      const filtroAtivos = this.filtroAtivos();
      const page = this.paginaAtual();
      const size = this.tamanhoPagina();

      let response: PageResponse<Produto>;
      if (busca) {
        response = await firstValueFrom(
          this.produtoService.buscarPorNome(busca, page, size)
        );
      } else if (filtroAtivos === true) {
        response = await firstValueFrom(
          this.produtoService.listarAtivos(page, size)
        );
      } else {
        response = await firstValueFrom(
          this.produtoService.listarPaginado(page, size)
        );
      }

      this.produtosPage.set(response);
      this.produtos.set(response.content || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
      this.produtos.set([]);
      this.produtosPage.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async carregarFornecedores(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.fornecedorService.listarAtivosSemPaginacao()
      );
      this.fornecedores.set(response);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  }

  async carregarCategorias(): Promise<void> {
    try {
      const categorias = await firstValueFrom(this.categoriaService.listar());
      this.categorias.set(categorias);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  async carregarSubcategorias(categoriaId: number): Promise<void> {
    try {
      const subcategorias = await firstValueFrom(
        this.subcategoriaService.listarPorCategoria(categoriaId)
      );
      this.subcategorias.set(subcategorias);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      this.subcategorias.set([]);
    }
  }

  async carregarSegmentos(): Promise<void> {
    try {
      const segmentos = await firstValueFrom(this.segmentoService.listar());
      this.segmentos.set(segmentos);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
    }
  }

  async carregarSegmentosPorSubcategoria(subcategoriaId: number): Promise<void> {
    try {
      const segmentos = await firstValueFrom(
        this.segmentoService.listarPorSubcategoria(subcategoriaId)
      );
      this.segmentosFiltrados.set(segmentos);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      this.segmentosFiltrados.set([]);
    }
  }

  onBuscar(): void {
    this.paginaAtual.set(0);
    this.carregarProdutos();
  }

  limparBusca(): void {
    this.busca.set('');
    this.paginaAtual.set(0);
    this.carregarProdutos();
  }

  filtrarPorStatus(status: boolean | null): void {
    this.filtroAtivos.set(status);
    this.paginaAtual.set(0);
    this.carregarProdutos();
  }

  paginaAnterior(): void {
    const page = this.paginaAtual();
    if (page > 0) {
      this.paginaAtual.set(page - 1);
      this.carregarProdutos();
    }
  }

  proximaPagina(): void {
    const page = this.paginaAtual();
    const totalPages = this.produtosPage()?.totalPages || 0;
    if (page < totalPages - 1) {
      this.paginaAtual.set(page + 1);
      this.carregarProdutos();
    }
  }

  irParaPagina(page: number): void {
    const totalPages = this.produtosPage()?.totalPages || 0;
    if (page >= 0 && page < totalPages) {
      this.paginaAtual.set(page);
      this.carregarProdutos();
    }
  }

  getPaginas(): number[] {
    const totalPages = this.produtosPage()?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.imagensSelecionadas.set([...this.imagensSelecionadas(), ...files]);
      
      // Criar previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          this.previewImagens.set([...this.previewImagens(), result]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removerImagem(index: number): void {
    const imagens = [...this.imagensSelecionadas()];
    const previews = [...this.previewImagens()];
    imagens.splice(index, 1);
    previews.splice(index, 1);
    this.imagensSelecionadas.set(imagens);
    this.previewImagens.set(previews);
  }

  abrirModalNovo(): void {
    this.precoVendaEditadoManual = false;
    this.form.reset({
      unidadeMedida: 'UNIDADE',
      custoUnitario: 0,
      margemLucro: 0,
      precoVenda: 0,
      precoDe: 0,
      estoqueAtual: 0,
      destaque: false,
      maisVendido: false,
    });
    this.precoDeFormatado.set('');
    this.editId.set(null);
    this.imagensSelecionadas.set([]);
    this.previewImagens.set([]);
    this.atributosFormArray.clear();
    this.subcategorias.set([]);
    this.segmentosFiltrados.set([]);
    this.showModal.set(true);
  }

  abrirModalEditar(produto: Produto): void {
    // Buscar categoria e subcategoria através do segmento
    const segmento = this.segmentos().find(s => s.id === produto.segmentoId);
    
    this.precoVendaEditadoManual = false;
    this.form.patchValue({
      nome: produto.nome,
      descricao: produto.descricao || '',
      categoriaId: produto.categoriaId || segmento?.categoriaId || null,
      subcategoriaId: produto.subcategoriaId || segmento?.subcategoriaId || null,
      segmentoId: produto.segmentoId,
      fornecedorId: produto.fornecedorId,
      custoUnitario: produto.custoUnitario || 0,
      margemLucro: produto.margemLucro || 0,
      precoVenda: produto.precoVenda || 0,
      precoDe: produto.precoDe || 0,
      estoqueAtual: produto.estoqueAtual || 0,
      unidadeMedida: produto.unidadeMedida as 'UNIDADE' | 'PACOTE' | 'CAIXA' | 'METRO' | 'KILO',
      destaque: produto.destaque || false,
      maisVendido: produto.maisVendido || false,
    });

    // Carregar subcategorias e segmentos se necessário
    if (produto.categoriaId) {
      this.carregarSubcategorias(produto.categoriaId);
    }
    if (produto.subcategoriaId) {
      this.carregarSegmentosPorSubcategoria(produto.subcategoriaId);
    }

    // Carregar atributos
    this.atributosFormArray.clear();
    if (produto.atributos && produto.atributos.length > 0) {
      produto.atributos.forEach((attr, index) => {
        const attrForm = this.fb.group({
          nome: [attr.nome, [Validators.required]],
          valor: [attr.valor, [Validators.required]],
          ordem: [attr.ordem || index],
        });
        this.atributosFormArray.push(attrForm);
      });
    }

    this.editId.set(produto.id || null);
    this.imagensSelecionadas.set([]);
    this.previewImagens.set([]);
    this.showModal.set(true);
    
    // Atualizar o valor formatado do Preço De
    setTimeout(() => {
      this.atualizarPrecoDeFormatado();
      const precoVenda = this.form.get('precoVenda')?.value || 0;
      if (precoVenda > 0 && !produto.precoDe) {
        // Só recalcular se não houver precoDe já salvo
        this.calcularPrecoDe();
      }
    }, 100);
  }

  async visualizarProduto(id: number): Promise<void> {
    try {
      const produto = await firstValueFrom(this.produtoService.buscarPorId(id));
      this.produtoVisualizar.set(produto);
      this.showModalVisualizar.set(true);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      alert('Erro ao carregar produto');
    }
  }

  fecharModal(): void {
    this.form.reset();
    this.editId.set(null);
    this.imagensSelecionadas.set([]);
    this.previewImagens.set([]);
    this.atributosFormArray.clear();
    this.subcategorias.set([]);
    this.segmentosFiltrados.set([]);
    this.showModal.set(false);
  }

  fecharModalVisualizar(): void {
    this.produtoVisualizar.set(null);
    this.showModalVisualizar.set(false);
  }

  async salvar(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const imagens = this.imagensSelecionadas();
    const atributos = this.atributosFormArray.value as ProdutoAtributo[];

    // Se houver imagens, usar o endpoint com upload
    if (imagens.length > 0) {
      await this.salvarComImagens(formValue, atributos, imagens);
    } else {
      await this.salvarSemImagens(formValue, atributos);
    }
  }

  private async salvarComImagens(formValue: any, atributos: ProdutoAtributo[], imagens: File[]): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('nome', formValue.nome);
      if (formValue.descricao) formData.append('descricao', formValue.descricao);
      formData.append('segmentoId', formValue.segmentoId.toString());
      formData.append('fornecedorId', formValue.fornecedorId.toString());
      formData.append('custoUnitario', formValue.custoUnitario.toString());
      if (formValue.precoVenda) formData.append('precoVenda', formValue.precoVenda.toString());
      if (formValue.precoDe) formData.append('precoDe', formValue.precoDe.toString());
      if (formValue.margemLucro) formData.append('margemLucro', formValue.margemLucro.toString());
      formData.append('unidadeMedida', formValue.unidadeMedida);
      if (formValue.estoqueAtual) formData.append('estoqueInicial', formValue.estoqueAtual.toString());
      formData.append('destaque', (formValue.destaque || false).toString());
      formData.append('maisVendido', (formValue.maisVendido || false).toString());

      // Adicionar imagens
      imagens.forEach((file, index) => {
        formData.append('imagens', file);
        if (index === 0) formData.append('imagemDesc1', file.name);
        if (index === 1) formData.append('imagemDesc2', file.name);
        if (index === 2) formData.append('imagemDesc3', file.name);
      });

      // Adicionar atributos como JSON
      if (atributos.length > 0) {
        formData.append('atributos', JSON.stringify(atributos));
      }

      const id = this.editId();
      if (id) {
        // Para edição, primeiro atualizar o produto, depois as imagens
        await this.salvarSemImagens(formValue, atributos);
        // TODO: Implementar atualização de imagens separadamente se necessário
        alert('Produto atualizado com sucesso!');
      } else {
        await firstValueFrom(this.produtoService.criarComImagens(formData));
        alert('Produto criado com sucesso!');
      }
      this.fecharModal();
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  }

  private async salvarSemImagens(formValue: any, atributos: ProdutoAtributo[]): Promise<void> {
    try {
      // Extrair valores numéricos corretamente
      const custoUnitario = this.extrairValorNumerico(formValue.custoUnitario);
      const precoVenda = this.extrairValorNumerico(formValue.precoVenda) || formValue.precoVenda;
      const margemLucro = this.extrairValorNumerico(formValue.margemLucro) || formValue.margemLucro || 0;
      const precoDe = formValue.precoDe || 0;

      const produtoData: Produto = {
        nome: formValue.nome!,
        descricao: formValue.descricao ? formValue.descricao : undefined,
        segmentoId: formValue.segmentoId!,
        fornecedorId: formValue.fornecedorId!,
        custoUnitario: custoUnitario,
        precoDe: precoDe > 0 ? precoDe : undefined,
        precoVenda: precoVenda!,
        margemLucro: margemLucro, // Sempre enviar (backend requer @NotNull)
        estoqueAtual: formValue.estoqueAtual || 0,
        unidadeMedida: formValue.unidadeMedida!,
        destaque: formValue.destaque || false,
        maisVendido: formValue.maisVendido || false,
        atributos: atributos.length > 0 ? atributos : undefined,
      };

      const id = this.editId();
      if (id) {
        await firstValueFrom(this.produtoService.atualizar(id, produtoData));
        alert('Produto atualizado com sucesso!');
      } else {
        await firstValueFrom(this.produtoService.criar(produtoData));
        alert('Produto criado com sucesso!');
      }
      this.fecharModal();
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  }

  async excluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return;
    }

    try {
      await firstValueFrom(this.produtoService.excluir(id));
      alert('Produto removido com sucesso!');
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  }

  async ativar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.produtoService.ativar(id));
      alert('Produto ativado com sucesso!');
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao ativar produto:', error);
      alert('Erro ao ativar produto');
    }
  }

  async desativar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.produtoService.desativar(id));
      alert('Produto desativado com sucesso!');
      this.carregarProdutos();
    } catch (error) {
      console.error('Erro ao desativar produto:', error);
      alert('Erro ao desativar produto');
    }
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  getImagemPrincipal(produto: Produto | null | undefined): string {
    if (!produto) {
      return '/assets/logo/Logo-Thiers.png';
    }
    if (produto.imagens && produto.imagens.length > 0) {
      const imagemPrincipal = produto.imagens.find(img => img.principal) || produto.imagens[0];
      if (imagemPrincipal?.url) {
        return this.formatarUrlImagem(imagemPrincipal.url);
      }
    }
    return '/assets/logo/Logo-Thiers.png';
  }

  /**
   * Formata URL da imagem para exibição
   */
  formatarUrlImagem(url: string): string {
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
   * Trata erro ao carregar imagem
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/logo/Logo-Thiers.png';
  }
}
