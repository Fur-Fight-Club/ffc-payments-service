import { Module } from "@nestjs/common";
import { BankAccountService } from "./bank-account.service";
import { BankAccountController } from "./bank-account.controller";
import { StripeService } from "src/services/stripe.service";
import { PrismaService } from "src/services/prisma.service";

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService, StripeService, PrismaService],
})
export class BankAccountModule {}
