import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MOCK_USUARIOS } from './core/data/mock-data';

/**
 * Interface para os dados de geolocalização retornados pela API
 */
interface GeoLocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  timezone: string;
  org: string;
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'casasanchesFront';
  private readonly LOCATION_INFO_KEY = 'user_location_info_shown';

  ngOnInit(): void {
    // Exibe as contas e senhas cadastradas no console
    this.exibirContasCadastradas();

    // Busca informações do usuário APENAS na primeira vez que acessa o site
    this.getUserLocationInfo();
  }

  /**
   * Exibe no console as contas e senhas cadastradas
   */
  private exibirContasCadastradas(): void {
    console.log('\n');
    console.log(
      '╔═══════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║          🔐 CONTAS CADASTRADAS PARA LOGIN                 ║'
    );
    console.log(
      '╚═══════════════════════════════════════════════════════════╝'
    );
    console.log('');

    MOCK_USUARIOS.forEach((usuario, index) => {
      console.log(`📧 Conta ${index + 1}:`);
      console.log(`   • Nome: ${usuario.name}`);
      console.log(`   • Email: ${usuario.email}`);
      console.log(`   • Senha: ${usuario.password}`);
      console.log(`   • Perfil: ${usuario.role}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 Use essas credenciais para fazer login no sistema');
    console.log('\n');
  }

  /**
   * Busca o IP e informações de geolocalização do usuário
   * Exibe no console do navegador APENAS na primeira vez
   */
  private async getUserLocationInfo(): Promise<void> {
    // Verifica se já foi executado antes
    const alreadyShown = localStorage.getItem(this.LOCATION_INFO_KEY);

    if (alreadyShown === 'true') {
      console.log(
        'ℹ️ Informações de localização já foram exibidas nesta sessão.'
      );
      return;
    }

    try {
      console.log(
        '🌍 Iniciando busca de informações do usuário (primeira vez)...'
      );
      console.log('⏳ Aguarde...');

      // Busca dados de IP + Geolocalização usando a API ipapi.co (gratuita)
      const response = await fetch('https://ipapi.co/json/');
      const data: GeoLocationData = await response.json();

      // Exibe as informações no console com formatação
      console.log('\n');
      console.log(
        '╔═══════════════════════════════════════════════════════════╗'
      );
      console.log(
        '║          📍 INFORMAÇÕES DE ACESSO DO USUÁRIO              ║'
      );
      console.log(
        '╚═══════════════════════════════════════════════════════════╝'
      );
      console.log('');
      console.log('🌐 CONEXÃO:');
      console.log(`   • IP Público: ${data.ip}`);
      console.log(`   • Provedor: ${data.org || 'Não identificado'}`);
      console.log('');
      console.log('📍 LOCALIZAÇÃO:');
      console.log(`   • País: ${data.country_name} (${data.country})`);
      console.log(`   • Estado/Região: ${data.region}`);
      console.log(`   • Cidade: ${data.city}`);
      console.log(`   • Fuso Horário: ${data.timezone}`);
      console.log(`   • Geolocalização do Ip: restricted `);
      if (data.latitude && data.longitude) {
        console.log(
          `   • Coordenadas Provedor: ${data.latitude}, ${data.longitude}`
        );
      }
      console.log('');
      console.log('💻 NAVEGADOR:');
      console.log(`   • User Agent: ${navigator.userAgent}`);
      console.log(`   • Idioma: ${navigator.language}`);
      console.log(`   • Plataforma: ${navigator.platform}`);
      console.log('');
      console.log('⏰ ACESSO:');
      console.log(
        `   • Data/Hora Local: ${new Date().toLocaleString('pt-BR')}`
      );
      console.log(`   • Timestamp: ${new Date().toISOString()}`);
      console.log('');
      console.log(
        '═══════════════════════════════════════════════════════════'
      );
      console.log('✅ Informações carregadas com sucesso!');
      console.log('✅ By Crowdstrike');
      console.log('\n');

      // Salva no localStorage que já foi exibido
      localStorage.setItem(this.LOCATION_INFO_KEY, 'true');
    } catch (error) {
      console.error('❌ Erro ao buscar informações de geolocalização:', error);
      console.warn('⚠️ Tentando método alternativo...');

      // Fallback: usa apenas ipify se ipapi.co falhar
      try {
        const fallbackResponse = await fetch(
          'https://api.ipify.org?format=json'
        );
        const fallbackData = await fallbackResponse.json();

        console.log(
          '╔═══════════════════════════════════════════════════════════╗'
        );
        console.log(
          '║          📍 INFORMAÇÕES BÁSICAS DO USUÁRIO                ║'
        );
        console.log(
          '╚═══════════════════════════════════════════════════════════╝'
        );
        console.log('');
        console.log(`🌐 IP Público: ${fallbackData.ip}`);
        console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
        console.log(`💻 Navegador: ${navigator.userAgent}`);
        console.log('');
        console.log(
          '═══════════════════════════════════════════════════════════'
        );

        // Salva no localStorage que já foi exibido (mesmo no fallback)
        localStorage.setItem(this.LOCATION_INFO_KEY, 'true');
      } catch (fallbackError) {
        console.error('❌ Falha ao buscar informações básicas:', fallbackError);
      }
    }
  }
}
