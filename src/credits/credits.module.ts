import { Module } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { CreditsController } from "./credits.controller";
import { StripeService } from "src/services/stripe.service";
import { PrismaService } from "src/services/prisma.service";
import { InvoicesService } from "src/services/invoices.service";

@Module({
  controllers: [CreditsController],
  providers: [CreditsService, StripeService, PrismaService, InvoicesService],
})
export class CreditsModule {}
