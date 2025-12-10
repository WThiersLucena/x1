import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { firstValueFrom } from 'rxjs';
import { HttpParams } from '@angular/common/http';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss',
})
export class CategoriasComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly categorias = signal<Categoria[]>([]);
  readonly categoriasPage = signal<PageResponse<Categoria> | null>(null);
  readonly isLoading = signal(false);
  readonly busca = signal<string>('');
  readonly filtroAtivos = signal<boolean | null>(null);
  readonly paginaAtual = signal<number>(0);
  readonly tamanhoPagina = signal<number>(10);

  // Modal
  readonly showModal = signal(false);
  readonly editId = signal<number | null>(null);

  // Form
  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: [''],
    categoriaPaiId: [null as number | null],
  });

  readonly Math = Math;

  ngOnInit(): void {
    this.carregarCategorias();
  }

  async carregarCategorias(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Por enquanto, usar listar() que retorna lista simples
      // TODO: Implementar paginação quando o serviço suportar
      const categorias = await firstValueFrom(this.categoriaService.listar());
      this.categorias.set(categorias);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias');
      this.categorias.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onBuscar(): void {
    this.paginaAtual.set(0);
    this.carregarCategorias();
  }

  limparBusca(): void {
    this.busca.set('');
    this.paginaAtual.set(0);
    this.carregarCategorias();
  }

  filtrarPorStatus(status: boolean | null): void {
    this.filtroAtivos.set(status);
    this.paginaAtual.set(0);
    this.carregarCategorias();
  }

  abrirModalNovo(): void {
    this.form.reset({ categoriaPaiId: null });
    this.editId.set(null);
    this.showModal.set(true);
  }

  abrirModalEditar(categoria: Categoria): void {
    this.form.patchValue({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      categoriaPaiId: categoria.categoriaPaiId || null,
    });
    this.editId.set(categoria.id || null);
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.form.reset();
    this.editId.set(null);
    this.showModal.set(false);
  }

  async salvar(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const categoriaData: Categoria = {
      nome: formValue.nome!,
      descricao: formValue.descricao || undefined,
      categoriaPaiId: formValue.categoriaPaiId || null,
    };

    try {
      const id = this.editId();
      if (id) {
        await firstValueFrom(
          this.categoriaService.atualizar(id, categoriaData)
        );
        alert('Categoria atualizada com sucesso!');
      } else {
        await firstValueFrom(this.categoriaService.criar(categoriaData));
        alert('Categoria criada com sucesso!');
      }
      this.fecharModal();
      this.carregarCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  }

  async excluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) {
      return;
    }

    try {
      await firstValueFrom(this.categoriaService.deletar(id));
      alert('Categoria removida com sucesso!');
      this.carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria');
    }
  }

  async ativar(id: number): Promise<void> {
    if (!confirm('Deseja ativar esta categoria?')) {
      return;
    }

    try {
      await firstValueFrom(this.categoriaService.ativar(id));
      alert('Categoria ativada com sucesso!');
      this.carregarCategorias();
    } catch (error) {
      console.error('Erro ao ativar categoria:', error);
      alert('Erro ao ativar categoria');
    }
  }

  async desativar(id: number): Promise<void> {
    if (!confirm('Deseja desativar esta categoria?')) {
      return;
    }

    try {
      await firstValueFrom(this.categoriaService.desativar(id));
      alert('Categoria desativada com sucesso!');
      this.carregarCategorias();
    } catch (error) {
      console.error('Erro ao desativar categoria:', error);
      alert('Erro ao desativar categoria');
    }
  }
}

