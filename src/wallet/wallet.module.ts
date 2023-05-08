import { Module } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { PrismaService } from "src/services/prisma.service";
import { InvoicesService } from "src/services/invoices.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService, InvoicesService],
})
export class WalletModule {}
