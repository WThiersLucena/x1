// ============================================================================
// CONFIGURAÇÃO DA APLICAÇÃO ANGULAR
// ============================================================================

/**
 * Este arquivo contém a configuração principal da aplicação Angular.
 * 
 * PROVIDERS:
 * Lista de provedores (services, configurations) que estarão disponíveis
 * em toda a aplicação.
 * 
 * É o equivalente ao antigo AppModule em aplicações standalone.
 */

// Imports do Angular Core
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

// Import do provedor de rotas
import { provideRouter } from '@angular/router';

// Import do provedor HTTP Client
import { provideHttpClient } from '@angular/common/http';

// Import das rotas da aplicação
import { routes } from './app.routes';

/**
 * Configuração da aplicação
 * 
 * PROVIDERS CONFIGURADOS:
 * 
 * 1. provideZoneChangeDetection({ eventCoalescing: true })
 *    Configura o sistema de detecção de mudanças do Angular
 *    eventCoalescing: true = melhora performance agrupando eventos
 * 
 * 2. provideRouter(routes)
 *    Configura o sistema de rotas da aplicação
 *    Recebe as rotas definidas em app.routes.ts
 * 
 * 3. provideHttpClient()
 *    Habilita o uso de HttpClient em toda a aplicação
 *    Necessário para fazer requisições HTTP (GET, POST, etc)
 *    Usado por ApiAuthService para comunicação com o backend
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Configuração de detecção de mudanças
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configuração de rotas
    provideRouter(routes),
    
    // Configuração de HTTP Client (NECESSÁRIO para requisições HTTP)
    provideHttpClient(),
  ],
};
