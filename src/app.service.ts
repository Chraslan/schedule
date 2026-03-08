import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; 

@Injectable()
export class AppService implements OnModuleInit {
  private fallback = new Map<string, any[]>();

  constructor(@Inject(CACHE_MANAGER) private redis: Cache) {}

  async onModuleInit() {
    console.log('🚀 AppService iniciando...');
    console.log('📋 Variables de entorno:');
    console.log(`   - API_BASE_URL: ${process.env.API_BASE_URL || 'no definida'}`);
    console.log(`   - REDIS_HOST: ${process.env.REDIS_HOST || 'no definida'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'no definida'}`);
    
    await this.update();
    const intervalTime = parseInt(process.env.UPDATE_INTERVAL || '60000');
    setInterval(() => this.update(), intervalTime);
  }

  private async update() {
    console.log('=================================');
    console.log(`🕒 ${new Date().toISOString()} - Actualizando`);
    
    try {
      const baseUrl = process.env.API_BASE_URL || 'https://cloud.urbe.edu/web/v1/core/labComp/rotafolio';
      
      // Versión con headers para simular un navegador real
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      console.log(`📡 Fetching F desde: ${baseUrl}?idBloque=6`);
      console.log(`📋 Headers: ${JSON.stringify(headers)}`);
      
      const fResponse = await fetch(`${baseUrl}?idBloque=6`, { headers });
      console.log(`📊 Status F: ${fResponse.status} ${fResponse.statusText}`);
      
      console.log(`📡 Fetching G desde: ${baseUrl}?idBloque=7`);
      const gResponse = await fetch(`${baseUrl}?idBloque=7`, { headers });
      console.log(`📊 Status G: ${gResponse.status} ${gResponse.statusText}`);

      // Leer el texto de la respuesta para debug
      const fText = await fResponse.text();
      const gText = await gResponse.text();
      
      console.log(`📝 Respuesta F (primeros 200 chars): ${fText.substring(0, 200)}`);
      console.log(`📝 Respuesta G (primeros 200 chars): ${gText.substring(0, 200)}`);

      // Intentar parsear JSON
      let f, g;
      try {
        f = JSON.parse(fText);
        g = JSON.parse(gText);
      } catch (e) {
        console.error('❌ Error parseando JSON:', e.message);
        return;
      }

      console.log(`✅ Datos OK - F: ${f?.length || 0} items, G: ${g?.length || 0} items`);

      const ttl = parseInt(process.env.CACHE_TTL || '60000');
      
      await Promise.allSettled([
        this.redis.set('F', f, ttl),
        this.redis.set('G', g, ttl)
      ]);
      
      this.fallback.set('F', f).set('G', g);
      console.log('✅ Guardado en Redis y fallback');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    console.log('=================================');
  }

  private async get(key: string, fallbackKey: string) {
    try {
      const cached = await this.redis.get(key);
      if (cached) return cached;
      return this.fallback.get(fallbackKey) || [];
    } catch {
      return this.fallback.get(fallbackKey) || [];
    }
  }

  getscheduleF = () => this.get('F', 'F');
  getscheduleG = () => this.get('G', 'G');
}
