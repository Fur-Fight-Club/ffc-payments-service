import { Module } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { CreditsController } from "./credits.controller";
import { StripeService } from "src/services/stripe.service";

@Module({
  controllers: [CreditsController],
  providers: [CreditsService, StripeService],
})
export class CreditsModule {}
