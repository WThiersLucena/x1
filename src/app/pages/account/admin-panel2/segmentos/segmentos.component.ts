import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SegmentoService } from '../../../../core/services/segmento.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { Segmento } from '../../../../core/models/segmento.model';
import { Subcategoria } from '../../../../core/models/subcategoria.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-segmentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './segmentos.component.html',
  styleUrl: './segmentos.component.scss',
})
export class SegmentosComponent implements OnInit {
  private readonly segmentoService = inject(SegmentoService);
  private readonly subcategoriaService = inject(SubcategoriaService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly segmentos = signal<Segmento[]>([]);
  readonly subcategorias = signal<Subcategoria[]>([]);
  readonly isLoading = signal(false);
  readonly busca = signal<string>('');

  // Modal
  readonly showModal = signal(false);
  readonly editId = signal<number | null>(null);

  // Form
  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: [''],
    subcategoriaId: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.carregarSegmentos();
    this.carregarSubcategorias();
  }

  async carregarSubcategorias(): Promise<void> {
    try {
      const subcategorias = await firstValueFrom(
        this.subcategoriaService.listar()
      );
      this.subcategorias.set(subcategorias);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
    }
  }

  async carregarSegmentos(): Promise<void> {
    this.isLoading.set(true);
    try {
      const segmentos = await firstValueFrom(this.segmentoService.listar());
      this.segmentos.set(segmentos);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      alert('Erro ao carregar segmentos');
      this.segmentos.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onBuscar(): void {
    this.carregarSegmentos();
  }

  limparBusca(): void {
    this.busca.set('');
    this.carregarSegmentos();
  }

  abrirModalNovo(): void {
    this.form.reset({ subcategoriaId: null });
    this.editId.set(null);
    this.showModal.set(true);
  }

  abrirModalEditar(segmento: Segmento): void {
    this.form.patchValue({
      nome: segmento.nome,
      descricao: segmento.descricao || '',
      subcategoriaId: segmento.subcategoriaId,
    });
    this.editId.set(segmento.id || null);
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
    const segmentoData: Segmento = {
      nome: formValue.nome!,
      descricao: formValue.descricao || undefined,
      subcategoriaId: formValue.subcategoriaId!,
    };

    try {
      const id = this.editId();
      if (id) {
        await firstValueFrom(
          this.segmentoService.atualizar(id, segmentoData)
        );
        alert('Segmento atualizado com sucesso!');
      } else {
        await firstValueFrom(this.segmentoService.criar(segmentoData));
        alert('Segmento criado com sucesso!');
      }
      this.fecharModal();
      this.carregarSegmentos();
    } catch (error) {
      console.error('Erro ao salvar segmento:', error);
      alert('Erro ao salvar segmento');
    }
  }

  async excluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este segmento?')) {
      return;
    }

    try {
      await firstValueFrom(this.segmentoService.deletar(id));
      alert('Segmento removido com sucesso!');
      this.carregarSegmentos();
    } catch (error) {
      console.error('Erro ao excluir segmento:', error);
      alert('Erro ao excluir segmento');
    }
  }

  async ativar(id: number): Promise<void> {
    if (!confirm('Deseja ativar este segmento?')) {
      return;
    }

    try {
      await firstValueFrom(this.segmentoService.ativar(id));
      alert('Segmento ativado com sucesso!');
      this.carregarSegmentos();
    } catch (error) {
      console.error('Erro ao ativar segmento:', error);
      alert('Erro ao ativar segmento');
    }
  }

  async desativar(id: number): Promise<void> {
    if (!confirm('Deseja desativar este segmento?')) {
      return;
    }

    try {
      await firstValueFrom(this.segmentoService.desativar(id));
      alert('Segmento desativado com sucesso!');
      this.carregarSegmentos();
    } catch (error) {
      console.error('Erro ao desativar segmento:', error);
      alert('Erro ao desativar segmento');
    }
  }
}


