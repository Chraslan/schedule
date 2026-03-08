import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; 

@Injectable()
export class AppService implements OnModuleInit {
  private fallback = new Map<string, any[]>();

  constructor(@Inject(CACHE_MANAGER) private redis: Cache) {}

  async onModuleInit() {
    await this.update();
    // Usar variable de entorno para el intervalo o valor por defecto
    const intervalTime = parseInt(process.env.UPDATE_INTERVAL || '60000');
    setInterval(() => this.update(), intervalTime);
  }

  private async update() {
    try {
      // Usar variables de entorno para las URLs
      const baseUrl = process.env.API_BASE_URL || 'https://cloud.urbe.edu/web/v1/core/labComp/rotafolio';
      console.log( process.env.API_BASE_URL);
      const [f, g] = await Promise.all([
        fetch(`${baseUrl}?idBloque=6`).then(r => r.ok && r.json()),
        fetch(`${baseUrl}?idBloque=7`).then(r => r.ok && r.json())
      ]);

      if (f && g) {
        // Usar variable de entorno para TTL o valor por defecto
        const ttl = parseInt(process.env.CACHE_TTL || '60000');
        
        await Promise.allSettled([
          this.redis.set('F', f, ttl),
          this.redis.set('G', g, ttl)
        ]);
        this.fallback.set('F', f).set('G', g);
      }
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  }

  private async get(key: string, fallbackKey: string) {
    try {
      return (await this.redis.get(key)) || this.fallback.get(fallbackKey) || [];
    } catch {
      return this.fallback.get(fallbackKey) || [];
    }
  }

  getscheduleF = () => this.get('F', 'F');
  getscheduleG = () => this.get('G', 'G');
}
