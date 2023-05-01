import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientPackage } from "ffc-prisma-package/dist/client"

@Injectable()
export class PrismaService extends PrismaClientPackage implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}