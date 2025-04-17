
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configurações do Supabase
const SUPABASE_URL = "https://zghthguqsravpcvrgahe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHRoZ3Vxc3JhdnBjdnJnYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzkxNTQsImV4cCI6MjA2MDQxNTE1NH0.1NaMBtnpxGksfayFK3Pul6_UUcDAFalSUdXWgppkUbw";

// Variáveis para controle de reconexão
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient<Database>;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private retryCount = 0;

  private constructor() {
    this.client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'business-manager-auth',
      },
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient<Database> {
    return this.client;
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public async testConnection(): Promise<boolean> {
    try {
      this.connectionStatus = 'connecting';
      console.log('Testando conexão com Supabase...');
      
      // Tenta uma operação simples para verificar se a conexão está ativa
      const startTime = performance.now();
      
      // Use @ts-ignore to bypass TypeScript's error on this line
      // @ts-ignore
      const { data, error } = await this.client.rpc('postgres_version');
      
      const responseTime = Math.round(performance.now() - startTime);
      
      if (error) {
        console.error('Erro ao conectar ao Supabase:', error);
        this.connectionStatus = 'disconnected';
        return this.retryConnection();
      }
      
      console.log(`Conexão com Supabase estabelecida em ${responseTime}ms. Versão PostgreSQL:`, data);
      this.connectionStatus = 'connected';
      this.retryCount = 0;
      return true;
    } catch (error) {
      console.error('Falha na conexão com Supabase:', error);
      this.connectionStatus = 'disconnected';
      return this.retryConnection();
    }
  }

  private async retryConnection(): Promise<boolean> {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(`Tentando reconexão (${this.retryCount}/${MAX_RETRIES}) em ${RETRY_DELAY}ms...`);
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await this.testConnection();
          resolve(result);
        }, RETRY_DELAY * this.retryCount);
      });
    }
    
    console.error(`Falha após ${MAX_RETRIES} tentativas de conexão com Supabase.`);
    return false;
  }
}

// Exporta uma instância única do cliente Supabase
export const supabaseService = SupabaseService.getInstance();
export const supabase = supabaseService.getClient();

// Exporta função para teste de conexão
export const testSupabaseConnection = async (): Promise<boolean> => {
  return await supabaseService.testConnection();
};
