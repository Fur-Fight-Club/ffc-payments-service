import { Injectable } from "@nestjs/common";
import {
  Invoice,
  StripePaymentStatus,
  Transaction,
  User,
} from "ffc-prisma-package/dist/client";
import { PrismaService } from "src/services/prisma.service";
import { StripeCheckoutSessionResponse } from "src/services/stripe.service";

@Injectable()
export class CreditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(
    amount: number,
    user: User,
    url: string,
    uuid: string
  ): Promise<Invoice> {
    const invoice = await this.prisma.invoice.create({
      data: {
        amount,
        fk_user: user.id,
        url,
        uuid,
      },
    });

    return invoice;
  }

  async createCreditTransaction(amount: number, user: User, invoice: Invoice) {
    const userWallet = await this.prisma.wallet.findFirst({
      where: {
        fk_user: user.id,
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

    return transaction;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async createStripePayment(
    transaction: Transaction,
    session: StripeCheckoutSessionResponse
  ) {
    const stripePayment = await this.prisma.stripePayments.create({
      data: {
        fk_transaction: transaction.id,
        session_id: session.id,
        session: JSON.stringify(session),
        status: StripePaymentStatus.PENDING,
      },
    });

    return stripePayment;
  }
}
