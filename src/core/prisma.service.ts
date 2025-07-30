import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Opcional: super() pode receber configurações do PrismaClient,
    // como logs para debug durante o desenvolvimento.
    super({
      log: ['warn', 'error'],
    });
  }

  /**
   * Este método é chamado automaticamente pelo NestJS quando o módulo
   * que contém este serviço é inicializado.
   * É o lugar perfeito para conectar ao banco de dados.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Este método é chamado automaticamente pelo NestJS quando a aplicação
   * está sendo encerrada (shutdown).
   * Garante que a conexão com o banco de dados seja fechada graciosamente.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
