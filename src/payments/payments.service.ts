import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { StripePaymentStatus } from "ffc-prisma-package/dist/client";
import { MoneyToCredits } from "src/credits/credits.schema";
import { PrismaService } from "src/services/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async stripeSuccessCallback(session_id: string) {
    // Basic payements checks operations
    const checks = await this.basicPaymentsChecks(session_id);
    if (checks === "not_found") {
      throw new NotFoundException("Payment not found");
    } else if (checks === "already_processed") {
      throw new BadRequestException("Payment already processed");
    }

    // Update stripe payment status
    await this.prisma.stripePayments.update({
      where: {
        session_id,
      },
      data: {
        status: StripePaymentStatus.SUCCEEDED,
      },
    });

    // Get the user's wallet via the transaction
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        StripePayments: {
          session_id,
        },
      },
    });

    // Get the user wallet
    const userWallet = await this.prisma.wallet.findFirst({
      where: {
        id: transaction.walletId,
      },
    });

    // Get the corresponding amout and credits
    const creditsAmount: number =
      +MoneyToCredits[+(transaction.amount / 100).toFixed(0)];

    // Update the user's wallet
    await this.prisma.wallet.update({
      where: {
        id: userWallet.id,
      },
      data: {
        amount: userWallet.amount + creditsAmount,
      },
    });

    return { status: StripePaymentStatus.SUCCEEDED, session_id };
  }

  async stripeErrorCallback(session_id: string) {
    // Basic payements checks operations
    const checks = await this.basicPaymentsChecks(session_id);
    if (checks === "not_found") {
      throw new NotFoundException("Payment not found");
    } else if (checks === "already_processed") {
      throw new BadRequestException("Payment already processed");
    }

    // Update stripe payment status
    await this.prisma.stripePayments.update({
      where: {
        session_id,
      },
      data: {
        status: StripePaymentStatus.FAILED,
      },
    });
    return { status: StripePaymentStatus.FAILED, session_id };
  }

  private async basicPaymentsChecks(
    session_id: string
  ): Promise<null | "not_found" | "already_processed"> {
    const stripePayment = await this.prisma.stripePayments.findFirst({
      where: {
        session_id,
      },
    });

    if (!stripePayment) {
      return "not_found";
    }

    if (stripePayment.status !== StripePaymentStatus.PENDING) {
      return "already_processed";
    }
    return null;
  }
}
