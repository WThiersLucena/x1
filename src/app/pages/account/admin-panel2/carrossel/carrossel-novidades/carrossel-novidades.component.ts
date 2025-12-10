import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrosselDestaqueService } from '../../../../../core/services/carrossel-destaque.service';
import { UploadService } from '../../../../../core/services/upload.service';
import { CarrosselDestaque } from '../../../../../core/models/carrossel-destaque.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrossel-novidades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carrossel-novidades.component.html',
  styleUrl: './carrossel-novidades.component.scss',
})
export class CarrosselNovidadesComponent implements OnInit {
  private readonly service = inject(CarrosselDestaqueService);
  private readonly uploadService = inject(UploadService);
  private readonly fb = inject(FormBuilder);

  readonly itens = signal<CarrosselDestaque[]>([]);
  readonly isLoading = signal(false);
  readonly showModal = signal(false);
  readonly editId = signal<number | null>(null);
  readonly imagemSelecionada = signal<File | null>(null);
  readonly previewImagem = signal<string | null>(null);
  readonly isUploading = signal(false);

  readonly form = this.fb.group({
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
      alert('Erro ao carregar itens do carrossel');
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
      
      // Criar preview
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
      title: item.title || '',
      description: item.description || '',
      ordem: item.ordem,
      ativo: item.ativo,
    });
    this.editId.set(item.id || null);
    // Formatar a URL da imagem para o preview
    this.previewImagem.set(this.formatarUrlImagem(item.imageUrl));
    this.imagemSelecionada.set(null); // Limpar arquivo selecionado ao editar
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
    // Validar se há imagem selecionada (apenas para novo item)
    if (!this.editId() && !this.imagemSelecionada()) {
      alert('Por favor, selecione uma imagem');
      return;
    }

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      let imageUrl = '';

      // Se é um novo item ou se uma nova imagem foi selecionada
      if (this.imagemSelecionada()) {
        this.isUploading.set(true);
        try {
          // Fazer upload da imagem
          imageUrl = await firstValueFrom(
            this.uploadService.uploadImagem(this.imagemSelecionada()!)
          );
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          alert('Erro ao fazer upload da imagem');
          this.isUploading.set(false);
          return;
        } finally {
          this.isUploading.set(false);
        }
      } else if (this.editId()) {
        // Se está editando e não selecionou nova imagem, usar a URL existente
        const itemExistente = this.itens().find(
          (item) => item.id === this.editId()
        );
        imageUrl = itemExistente?.imageUrl || '';
      }

      if (!imageUrl) {
        alert('Erro: URL da imagem não disponível');
        return;
      }

      const formValue = this.form.value;
      const itemData: CarrosselDestaque = {
        imageUrl: imageUrl,
        title: formValue.title || undefined,
        description: formValue.description || undefined,
        ordem: formValue.ordem!,
        ativo: formValue.ativo!,
      };

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
    // Usar logo como fallback se placeholder não existir
    img.src = '/assets/logo/Logo-Thiers.png';
  }
}
