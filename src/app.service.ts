import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; 
import axios from 'axios';

@Injectable()
export class AppService implements OnModuleInit {
  private fallback = new Map<string, any[]>();
  private readonly API_TIMEOUT = 300000; // 300 segundos (5 minutos)

  constructor(@Inject(CACHE_MANAGER) private redis: Cache) {}

  async onModuleInit() {
    console.log('🚀 AppService iniciado');
    console.log(`⏰ Timeout configurado: ${this.API_TIMEOUT}ms`);
    console.log(`🌐 API Base URL: ${process.env.API_BASE_URL || 'https://cloud.urbe.edu/web/v1/core/labComp/rotafolio'}`);
    
    // Primera actualización al iniciar
    console.log('📡 Ejecutando primera actualización...');
    await this.update();
    
    // Actualizaciones periódicas
    const intervalTime = parseInt(process.env.UPDATE_INTERVAL || '60000');
    console.log(`⏰ Actualizaciones programadas cada ${intervalTime}ms`);
    setInterval(() => this.update(), intervalTime);
  }

  private async update() {
    console.log('=================================');
    console.log(`🕒 ${new Date().toLocaleString()} - Iniciando actualización`);
    
    try {
      const baseUrl = process.env.API_BASE_URL || 'https://cloud.urbe.edu/web/v1/core/labComp/rotafolio';
      
      console.log(`📡 Solicitando BLOQUE F (idBloque=6)...`);
      const startF = Date.now();
      const fResponse = await axios.get(`${baseUrl}?idBloque=6`, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: this.API_TIMEOUT 
      });
      
      console.log(`📡 Solicitando BLOQUE G (idBloque=7)...`);
      const startG = Date.now();
      const gResponse = await axios.get(`${baseUrl}?idBloque=7`, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: this.API_TIMEOUT 
      });
      

      const f = Array.isArray(fResponse.data) ? fResponse.data : [];
      const g = Array.isArray(gResponse.data) ? gResponse.data : [];

      const ttl = parseInt(process.env.CACHE_TTL || '60000');
      
      // Guardar en Redis
      await Promise.allSettled([
        this.redis.set('F', f, ttl),
        this.redis.set('G', g, ttl)
      ]);
      
      // Guardar en fallback local
      this.fallback.set('F', f);
      this.fallback.set('G', g);
      
      console.log(`✅ Datos guardados - F: ${f.length} items, G: ${g.length} items`);
      
    } catch (error) {
      console.error('❌ Error en actualización:', error.message);
      if (error.code === 'ECONNABORTED') {
        console.error('   ⏰ Tiempo de espera agotado. La API tardó más de 30 segundos en responder.');
      }
      console.log('   ℹ️ Usando datos del fallback local');
      
      // Mostrar tamaño del fallback
      console.log(`   📦 Fallback actual: F=${this.fallback.get('F')?.length || 0} items, G=${this.fallback.get('G')?.length || 0} items`);
    }
    console.log('=================================');
  }

  private async get(key: string, fallbackKey: string) {
    console.log(`🔍 GET /schedule/${key} - ${new Date().toLocaleString()}`);
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        
        return cached;
      }
      const fallback = this.fallback.get(fallbackKey) || [];
      console.log(`⚠️ Usando fallback local: ${fallback.length} items`);
      return fallback;
    } catch (error) {
      console.error(`❌ Error en Redis:`, error.message);
      const fallback = this.fallback.get(fallbackKey) || [];
      return fallback;
    }
  }

  getscheduleF = () => this.get('F', 'F');
  getscheduleG = () => this.get('G', 'G');
}
