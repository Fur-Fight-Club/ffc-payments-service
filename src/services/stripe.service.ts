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
    customer: string,
    successUrl = `${process.env.FRONTEND_URL}/payments/success`,
    cancelUrl = `${process.env.FRONTEND_URL}/payments/error`
  ) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card", "sepa_debit"],
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
      customer,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }

  async createStripeCustomer(
    email: string,
    name: string
  ): Promise<Stripe.Response<Stripe.Customer>> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      description: `Customer for ${email} on Fury Fight Club`,
    });

    return customer;
  }

  async addBankAccountToCustomer(
    customer_id: string,
    fullname: string,
    email: string,
    iban: string
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    const bankAccountPM = await this.stripe.paymentMethods.create({
      type: "sepa_debit",
      sepa_debit: {
        iban,
      },
      billing_details: {
        name: fullname,
        email,
      },
    });

    const paymentMethod = await this.stripe.paymentMethods.attach(
      bankAccountPM.id,
      {
        customer: customer_id,
      }
    );

    return paymentMethod;
  }

  async deleteBankAccountFromCustomer(
    paymentMethodId: string
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    return await this.stripe.paymentMethods.detach(paymentMethodId);
  }
}

export type StripeCheckoutSessionResponse =
  Stripe.Response<Stripe.Checkout.Session>;
