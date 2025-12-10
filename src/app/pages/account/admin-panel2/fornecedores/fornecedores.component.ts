import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FornecedorService, PageResponse } from '../../../../core/services/fornecedor.service';
import { Fornecedor } from '../../../../core/models/fornecedor.model';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fornecedores.component.html',
  styleUrl: './fornecedores.component.scss',
})
export class FornecedoresComponent implements OnInit {
  private readonly fornecedorService = inject(FornecedorService);
  private readonly viaCepService = inject(ViaCepService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly fornecedoresPage = signal<PageResponse<Fornecedor> | null>(null);
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
    cnpj: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required]],
    observacoes: [''],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    complemento: [''],
    bairro: ['', [Validators.required]],
    cidade: ['', [Validators.required]],
    estado: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
    tipoEndereco: ['MATRIZ' as const, [Validators.required]],
  });

  readonly Math = Math;

  ngOnInit(): void {
    this.carregarFornecedores();
    this.configurarBuscaCep();
  }

  private configurarBuscaCep(): void {
    this.form
      .get('cep')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((cep) => {
        if (cep) {
          this.buscarCep(cep);
        }
      });
  }

  async carregarFornecedores(): Promise<void> {
    this.isLoading.set(true);
    try {
      const busca = this.busca().trim();
      const filtroAtivos = this.filtroAtivos();
      const page = this.paginaAtual();
      const size = this.tamanhoPagina();

      let response: PageResponse<Fornecedor>;
      if (busca) {
        response = await firstValueFrom(
          this.fornecedorService.buscarPorNome(busca, page, size)
        );
      } else if (filtroAtivos === true) {
        response = await firstValueFrom(
          this.fornecedorService.listarAtivos(page, size)
        );
      } else {
        response = await firstValueFrom(
          this.fornecedorService.listar(page, size)
        );
      }

      this.fornecedoresPage.set(response);
      this.fornecedores.set(response.content || []);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      alert('Erro ao carregar fornecedores');
      this.fornecedores.set([]);
      this.fornecedoresPage.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  onBuscar(): void {
    this.paginaAtual.set(0);
    this.carregarFornecedores();
  }

  limparBusca(): void {
    this.busca.set('');
    this.paginaAtual.set(0);
    this.carregarFornecedores();
  }

  filtrarPorStatus(status: boolean | null): void {
    this.filtroAtivos.set(status);
    this.paginaAtual.set(0);
    this.carregarFornecedores();
  }

  paginaAnterior(): void {
    const page = this.paginaAtual();
    if (page > 0) {
      this.paginaAtual.set(page - 1);
      this.carregarFornecedores();
    }
  }

  proximaPagina(): void {
    const page = this.paginaAtual();
    const totalPages = this.fornecedoresPage()?.totalPages || 0;
    if (page < totalPages - 1) {
      this.paginaAtual.set(page + 1);
      this.carregarFornecedores();
    }
  }

  irParaPagina(page: number): void {
    const totalPages = this.fornecedoresPage()?.totalPages || 0;
    if (page >= 0 && page < totalPages) {
      this.paginaAtual.set(page);
      this.carregarFornecedores();
    }
  }

  getPaginas(): number[] {
    const totalPages = this.fornecedoresPage()?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  abrirModalNovo(): void {
    this.form.reset({ tipoEndereco: 'MATRIZ' });
    this.editId.set(null);
    this.showModal.set(true);
  }

  abrirModalEditar(fornecedor: Fornecedor): void {
    const endereco = fornecedor.enderecos?.[0];
    this.form.patchValue({
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
      tipoEndereco: (endereco?.tipo as any) || 'MATRIZ',
    });
    this.editId.set(fornecedor.id || null);
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
    const fornecedorData: Fornecedor = {
      nome: formValue.nome!,
      cnpj: formValue.cnpj!,
      email: formValue.email!,
      telefone: formValue.telefone!,
      observacoes: formValue.observacoes || undefined,
      enderecos: [
        {
          logradouro: formValue.logradouro!,
          numero: formValue.numero!,
          complemento: formValue.complemento || undefined,
          bairro: formValue.bairro!,
          cidade: formValue.cidade!,
          estado: formValue.estado!,
          cep: formValue.cep!,
          tipo: formValue.tipoEndereco!,
        },
      ],
    };

    try {
      const id = this.editId();
      if (id) {
        await firstValueFrom(
          this.fornecedorService.atualizar(id, fornecedorData)
        );
        alert('Fornecedor atualizado com sucesso!');
      } else {
        await firstValueFrom(this.fornecedorService.criar(fornecedorData));
        alert('Fornecedor criado com sucesso!');
      }
      this.fecharModal();
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor');
    }
  }

  async excluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este fornecedor?')) {
      return;
    }

    try {
      await firstValueFrom(this.fornecedorService.deletar(id));
      alert('Fornecedor removido com sucesso!');
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro ao excluir fornecedor');
    }
  }

  async ativar(id: number): Promise<void> {
    if (!confirm('Deseja ativar este fornecedor?')) {
      return;
    }

    try {
      await firstValueFrom(this.fornecedorService.ativar(id));
      alert('Fornecedor ativado com sucesso!');
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao ativar fornecedor:', error);
      alert('Erro ao ativar fornecedor');
    }
  }

  async desativar(id: number): Promise<void> {
    if (!confirm('Deseja desativar este fornecedor?')) {
      return;
    }

    try {
      await firstValueFrom(this.fornecedorService.desativar(id));
      alert('Fornecedor desativado com sucesso!');
      this.carregarFornecedores();
    } catch (error) {
      console.error('Erro ao desativar fornecedor:', error);
      alert('Erro ao desativar fornecedor');
    }
  }

  async buscarCep(cep: string): Promise<void> {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      return;
    }

    this.form.patchValue(
      { cep: this.formatarCep(cepLimpo) },
      { emitEvent: false }
    );

    try {
      const dados = await firstValueFrom(
        this.viaCepService.buscarCep(cepLimpo)
      );
      if (dados) {
        this.form.patchValue({
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  }

  private formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
    }
    return cep;
  }
}

