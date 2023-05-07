import { Injectable } from "@nestjs/common";
import { BuyCreditReturn, CreditsToMoney } from "./credits.schema";
import {
  StripeCheckoutSessionResponse,
  StripeService,
} from "src/services/stripe.service";
import { generateUUID } from "src/utils/functions.utils";
import { InvoicesService } from "src/services/invoices.service";
import { PrismaService } from "src/services/prisma.service";
import { StripePaymentStatus } from "ffc-prisma-package/dist/client";

@Injectable()
export class CreditsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly invoices: InvoicesService,
    private readonly prisma: PrismaService
  ) {}

  async buyCredits(
    credits: string,
    user: number,
    session_uuid: string = generateUUID()
  ): Promise<BuyCreditReturn> {
    // Get user
    const userObject = await this.prisma.user.findUnique({
      where: {
        id: user,
      },
    });

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
    const invoice = await this.prisma.invoice.create({
      data: {
        amount,
        fk_user: userObject.id,
        url: uploadedInvoice.url,
        uuid: session_uuid,
      },
    });

    // Create transaction in database
    const userWallet = await this.prisma.wallet.findFirst({
      where: {
        fk_user: userObject.id,
      },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        type: "IN",
        tag: "BUY_CREDIT",
        amount,
        walletId: userWallet.id,
        invoiceId: invoice.id,
      },
    });

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession(
      amount,
      `${credits} credits`,
      `Acheter ${credits} credits pour ${amount / 100}€`
    );

    const stripePayment = await this.prisma.stripePayments.create({
      data: {
        fk_transaction: transaction.id,
        session_id: session.id,
        session: JSON.stringify(session),
        status: StripePaymentStatus.PENDING,
      },
    });

    return {
      invoice,
      transaction,
      payment_url: session.url,
    };
  }
}
