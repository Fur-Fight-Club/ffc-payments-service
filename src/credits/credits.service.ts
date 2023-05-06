import { Injectable } from "@nestjs/common";
import { CreditsToMoney } from "./credits.schema";
import {
  StripeCheckoutSessionResponse,
  StripeService,
} from "src/services/stripe.service";

@Injectable()
export class CreditsService {
  constructor(private readonly stripeService: StripeService) {}

  async buyCredits(
    credits: string,
    user: number
  ): Promise<StripeCheckoutSessionResponse> {
    // Parse credits to money
    const amount = CreditsToMoney[credits] * 100;

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession(
      amount,
      `${credits} credits`,
      `Acheter ${credits} credits pour ${amount / 100}€`
    );

    return session;
  }
}
