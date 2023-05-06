import { Injectable } from "@nestjs/common";
import { BuyCreditReturn, CreditsToMoney } from "./credits.schema";
import {
  StripeCheckoutSessionResponse,
  StripeService,
} from "src/services/stripe.service";
import { CreditRepository } from "./credits.repository";
import { generateUUID } from "src/utils/functions.utils";
import { InvoicesService } from "src/services/invoices.service";

@Injectable()
export class CreditsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly creditRepository: CreditRepository,
    private readonly invoices: InvoicesService
  ) {}

  async buyCredits(
    credits: string,
    user: number,
    session_uuid: string = generateUUID()
  ): Promise<BuyCreditReturn> {
    // Get user
    const userObject = await this.creditRepository.getUserById(user);

    // Parse credits to money
    const amount = CreditsToMoney[credits] * 100;

    // Create invoice
    const invoiceBuffer = await this.invoices.generatePDFInvoice(
      [
        {
          name: `Achat de ${credits} crédits`,
          price: Number((amount / 100).toFixed(2)),
        },
      ],
      userObject,
      session_uuid
    );

    // Upload invoice to S3
    const uploadedInvoice = await this.invoices.uploadPDFInvoice(
      invoiceBuffer,
      `invoice-${session_uuid}.pdf`
    );

    // Create invoice in database
    const invoice = await this.creditRepository.createInvoice(
      amount,
      userObject,
      uploadedInvoice.url,
      session_uuid
    );

    // Create transaction in database
    const transaction = await this.creditRepository.createCreditTransaction(
      amount,
      userObject,
      invoice
    );

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession(
      amount,
      `${credits} credits`,
      `Acheter ${credits} credits pour ${amount / 100}€`
    );

    const stripePayment = await this.creditRepository.createStripePayment(
      transaction,
      session
    );

    return {
      invoice,
      transaction,
      payment_url: session.url,
    };
  }
}
