import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { exchangeRate, exchangeFees } from "src/credits/credits.schema";
import { InvoicesService } from "src/services/invoices.service";
import { PrismaService } from "src/services/prisma.service";
import { addDotEveryThreeChars, generateUUID } from "src/utils/functions.utils";

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService
  ) {}
  async transferMoney(
    userId: number,
    amount: number,
    session_uuid: string = generateUUID()
  ) {
    // Get the user
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Check if the user had a bank account
    const stripeAccount = await this.prisma.stripeAccount.findFirst({
      where: {
        User: user,
      },
      include: {
        StripeBankAccount: true,
      },
    });

    if (!stripeAccount || stripeAccount.StripeBankAccount.length === 0) {
      throw new NotFoundException(
        "You need to add a bank account before withdrawing your bets"
      );
    }

    // get user's wallet
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        User: user,
      },
    });

    // Check if user's wallet has enough money
    if (wallet.amount < 10000) {
      throw new BadRequestException(
        "Not enough credits, you need at least 10.000 credits to withdraw your bets"
      );
    }

    const moneyWorth = +(amount * exchangeRate).toFixed(2);
    const moneyToWithdraw =
      +moneyWorth - +(moneyWorth * exchangeFees).toFixed(2);

    // Create invoice
    const invoiceBuffer = await this.invoices.generatePDFInvoice(
      [
        {
          name: `Retrait de ${addDotEveryThreeChars(`${amount}`)} crédits`,
          price: moneyWorth,
        },
        {
          name: `Frais de retrait (${exchangeFees * 100}%)`,
          price: +(moneyWorth * exchangeFees).toFixed(2),
        },
        {
          name: `Montant à retirer`,
          price: +moneyToWithdraw.toFixed(2),
        },
      ],
      user,
      session_uuid,
      false
    );

    // Upload invoice to S3
    const uploadedWithdrawInvoice = await this.invoices.uploadPDFInvoice(
      invoiceBuffer,
      `withdraw-${session_uuid}.pdf`
    );

    // Create invoice in database
    const withdrawInvoice = await this.prisma.invoice.create({
      data: {
        amount: +(moneyToWithdraw * 100).toFixed(2),
        fk_user: user.id,
        url: uploadedWithdrawInvoice.url,
        uuid: session_uuid,
      },
    });

    // Create transaction in database
    const withdrawTransaction = await this.prisma.transaction.create({
      data: {
        type: "OUT",
        tag: "WITHDRAW",
        amount: +(moneyToWithdraw * 100).toFixed(2),
        Wallet: {
          connect: {
            id: wallet.id,
          },
        },
        Invoice: {
          connect: {
            id: withdrawInvoice.id,
          },
        },
      },
    });

    // Update user's wallet
    await this.prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        amount: wallet.amount - amount,
      },
    });

    return {
      transaction: withdrawTransaction,
      invoice: withdrawInvoice,
      withdraw: {
        feesPercentage: `${exchangeFees * 100}%`,
        fees: +(moneyWorth * exchangeFees).toFixed(2),
        amount: +moneyToWithdraw.toFixed(2),
        bank_account: stripeAccount.StripeBankAccount[0],
      },
      session_uuid,
    };
  }
}
