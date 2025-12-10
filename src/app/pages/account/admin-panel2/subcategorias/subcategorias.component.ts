import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Subcategoria } from '../../../../core/models/subcategoria.model';
import { Categoria } from '../../../../core/models/categoria.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-subcategorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subcategorias.component.html',
  styleUrl: './subcategorias.component.scss',
})
export class SubcategoriasComponent implements OnInit {
  private readonly subcategoriaService = inject(SubcategoriaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly subcategorias = signal<Subcategoria[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly isLoading = signal(false);
  readonly busca = signal<string>('');

  // Modal
  readonly showModal = signal(false);
  readonly editId = signal<number | null>(null);

  // Form
  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: [''],
    categoriaId: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.carregarSubcategorias();
    this.carregarCategorias();
  }

  async carregarCategorias(): Promise<void> {
    try {
      const categorias = await firstValueFrom(this.categoriaService.listar());
      this.categorias.set(categorias);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  async carregarSubcategorias(): Promise<void> {
    this.isLoading.set(true);
    try {
      const subcategorias = await firstValueFrom(
        this.subcategoriaService.listar()
      );
      this.subcategorias.set(subcategorias);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      alert('Erro ao carregar subcategorias');
      this.subcategorias.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onBuscar(): void {
    // TODO: Implementar busca quando serviço suportar
    this.carregarSubcategorias();
  }

  limparBusca(): void {
    this.busca.set('');
    this.carregarSubcategorias();
  }

  abrirModalNovo(): void {
    this.form.reset({ categoriaId: null });
    this.editId.set(null);
    this.showModal.set(true);
  }

  abrirModalEditar(subcategoria: Subcategoria): void {
    this.form.patchValue({
      nome: subcategoria.nome,
      descricao: subcategoria.descricao || '',
      categoriaId: subcategoria.categoriaId,
    });
    this.editId.set(subcategoria.id || null);
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
    const subcategoriaData: Subcategoria = {
      nome: formValue.nome!,
      descricao: formValue.descricao || undefined,
      categoriaId: formValue.categoriaId!,
    };

    try {
      const id = this.editId();
      if (id) {
        await firstValueFrom(
          this.subcategoriaService.atualizar(id, subcategoriaData)
        );
        alert('Subcategoria atualizada com sucesso!');
      } else {
        await firstValueFrom(
          this.subcategoriaService.criar(subcategoriaData)
        );
        alert('Subcategoria criada com sucesso!');
      }
      this.fecharModal();
      this.carregarSubcategorias();
    } catch (error) {
      console.error('Erro ao salvar subcategoria:', error);
      alert('Erro ao salvar subcategoria');
    }
  }

  async excluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover esta subcategoria?')) {
      return;
    }

    try {
      await firstValueFrom(this.subcategoriaService.deletar(id));
      alert('Subcategoria removida com sucesso!');
      this.carregarSubcategorias();
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
      alert('Erro ao excluir subcategoria');
    }
  }

  async ativar(id: number): Promise<void> {
    if (!confirm('Deseja ativar esta subcategoria?')) {
      return;
    }

    try {
      await firstValueFrom(this.subcategoriaService.ativar(id));
      alert('Subcategoria ativada com sucesso!');
      this.carregarSubcategorias();
    } catch (error) {
      console.error('Erro ao ativar subcategoria:', error);
      alert('Erro ao ativar subcategoria');
    }
  }

  async desativar(id: number): Promise<void> {
    if (!confirm('Deseja desativar esta subcategoria?')) {
      return;
    }

    try {
      await firstValueFrom(this.subcategoriaService.desativar(id));
      alert('Subcategoria desativada com sucesso!');
      this.carregarSubcategorias();
    } catch (error) {
      console.error('Erro ao desativar subcategoria:', error);
      alert('Erro ao desativar subcategoria');
    }
  }
}


