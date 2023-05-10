import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(userId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        fk_user: userId,
      },
    });

    const invoices = await this.prisma.invoice.findMany({
      where: {
        fk_user: userId,
      },
    });

    const transaction = await this.prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
      },
    });

    return {
      wallet: wallet,
      invoices: invoices,
      transaction: transaction,
    };
  }
}
