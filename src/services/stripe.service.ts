import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15",
    });
  }

  async createCheckoutSession(
    price: number,
    productName: string,
    productDescription: string,
    successUrl: string = `${process.env.FRONTEND_URL}/payments/success`,
    cancelUrl: string = `${process.env.FRONTEND_URL}/payments/error`
  ) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }
}

export type StripeCheckoutSessionResponse =
  Stripe.Response<Stripe.Checkout.Session>;
