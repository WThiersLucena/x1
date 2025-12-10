import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/upload';

  /**
   * Faz upload de uma ou mais imagens
   */
  uploadImagens(imagens: File[]): Observable<string[]> {
    const formData = new FormData();
    imagens.forEach((imagem) => {
      formData.append('imagens', imagem);
    });

    const token = this.auth.getToken() || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // Não definir Content-Type, o browser define automaticamente com boundary
    });

    return this.http.post<string[]>(`${this.baseUrl}/imagens`, formData, {
      headers,
    });
  }

  /**
   * Faz upload de uma única imagem
   */
  uploadImagem(imagem: File): Observable<string> {
    return new Observable((observer) => {
      this.uploadImagens([imagem]).subscribe({
        next: (urls) => {
          if (urls && urls.length > 0) {
            observer.next(urls[0]);
            observer.complete();
          } else {
            observer.error('Nenhuma URL retornada do upload');
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }
}

