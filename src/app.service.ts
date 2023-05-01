import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { ServerHealthcheck } from './app.model';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }
  async healthcheck(): Promise<ServerHealthcheck> {
    return {
      server_status: HttpStatus.OK,
      prisma_status: await this.prismaHealthcheck(),
      timestamp: new Date(),
    }
  }

  private async prismaHealthcheck(): Promise<number> {
    try {
      await this.prisma.$executeRaw`SELECT 1;`;
      return HttpStatus.OK;
    } catch (error) {
      // Log to logger service the error
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
