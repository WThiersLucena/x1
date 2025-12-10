import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrosselDestaqueService } from '../../../../core/services/carrossel-destaque.service';
import { CarrosselDestaque } from '../../../../core/models/carrossel-destaque.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrossel-destaque',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carrossel-destaque.component.html',
  styleUrl: './carrossel-destaque.component.scss',
})
export class CarrosselDestaqueComponent implements OnInit {
  private readonly service = inject(CarrosselDestaqueService);
  private readonly fb = inject(FormBuilder);

  readonly itens = signal<CarrosselDestaque[]>([]);
  readonly isLoading = signal(false);
  readonly showModal = signal(false);
  readonly editId = signal<number | null>(null);
  readonly imagemSelecionada = signal<File | null>(null);
  readonly previewImagem = signal<string | null>(null);

  readonly form = this.fb.group({
    imageUrl: ['', [Validators.required]],
    title: [''],
    description: [''],
    ordem: [0, [Validators.required, Validators.min(0)]],
    ativo: [true],
  });

  ngOnInit(): void {
    this.carregarItens();
  }

  async carregarItens(): Promise<void> {
    this.isLoading.set(true);
    try {
      const itens = await firstValueFrom(this.service.listarTodos());
      this.itens.set(itens);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      this.itens.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imagemSelecionada.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImagem.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  abrirModalNovo(): void {
    this.form.reset({ ordem: 0, ativo: true });
    this.editId.set(null);
    this.imagemSelecionada.set(null);
    this.previewImagem.set(null);
    this.showModal.set(true);
  }

  abrirModalEditar(item: CarrosselDestaque): void {
    this.form.patchValue({
      imageUrl: item.imageUrl,
      title: item.title || '',
      description: item.description || '',
      ordem: item.ordem,
      ativo: item.ativo,
    });
    this.editId.set(item.id || null);
    this.previewImagem.set(item.imageUrl);
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.form.reset();
    this.editId.set(null);
    this.imagemSelecionada.set(null);
    this.previewImagem.set(null);
    this.showModal.set(false);
  }

  async salvar(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const itemData: CarrosselDestaque = {
      imageUrl: formValue.imageUrl!,
      title: formValue.title || undefined,
      description: formValue.description || undefined,
      ordem: formValue.ordem!,
      ativo: formValue.ativo!,
    };

    try {
      const id = this.editId();
      if (id) {
        await firstValueFrom(this.service.atualizar(id, itemData));
        alert('Item atualizado com sucesso!');
      } else {
        await firstValueFrom(this.service.criar(itemData));
        alert('Item criado com sucesso!');
      }
      this.fecharModal();
      this.carregarItens();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      alert('Erro ao salvar item');
    }
  }

  async excluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este item?')) {
      return;
    }

    try {
      await firstValueFrom(this.service.deletar(id));
      alert('Item removido com sucesso!');
      this.carregarItens();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item');
    }
  }

  async ativar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.service.ativar(id));
      alert('Item ativado com sucesso!');
      this.carregarItens();
    } catch (error) {
      console.error('Erro ao ativar item:', error);
      alert('Erro ao ativar item');
    }
  }

  async desativar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.service.desativar(id));
      alert('Item desativado com sucesso!');
      this.carregarItens();
    } catch (error) {
      console.error('Erro ao desativar item:', error);
      alert('Erro ao desativar item');
    }
  }
}


