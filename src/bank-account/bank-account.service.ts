import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { StripeService } from "src/services/stripe.service";
import { CreateBankAccountDto } from "./bank-account.schema";
import { PrismaService } from "src/services/prisma.service";
import {
  StripeAccount,
  StripeBankAccount,
} from "ffc-prisma-package/dist/client";

@Injectable()
export class BankAccountService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService
  ) {}

  async getBankAccount(userId: number) {
    // get user's strip account
    const stripeAccount = await this.prisma.stripeAccount.findFirst({
      where: {
        User: {
          id: userId,
        },
      },
      include: {
        StripeBankAccount: true,
      },
    });

    if (!stripeAccount || stripeAccount.StripeBankAccount.length === 0) {
      throw new NotFoundException("Bank account not found");
    }

    return stripeAccount.StripeBankAccount[0];
  }

  async addBankAccount(createBankAccountDto: CreateBankAccountDto) {
    // Get the user from the database
    const user = await this.prisma.user.findUnique({
      where: {
        id: createBankAccountDto.userId,
      },
      include: {
        StripeAccount: true,
      },
    });

    // Check if user has a stripe customer
    let stripeAccount: StripeAccount;
    if (user.StripeAccount.length === 0) {
      const stripeCustomer = await this.stripeService.createStripeCustomer(
        user.email,
        `${user.firstname} ${user.lastname}`
      );

      stripeAccount = await this.prisma.stripeAccount.create({
        data: {
          customer_id: stripeCustomer.id,
          customer_object: JSON.stringify(stripeCustomer),
          User: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    } else {
      stripeAccount = user.StripeAccount[0];
    }

    // Create bank account
    let bankAccount: StripeBankAccount =
      await this.prisma.stripeBankAccount.findFirst({
        where: {
          StripeAccount: {
            id: stripeAccount.id,
          },
        },
      });

    if (bankAccount) {
      throw new BadRequestException("Bank account already exists");
    }

    const stripeBankAccount = await this.stripeService.addBankAccountToCustomer(
      stripeAccount.customer_id,
      `${user.firstname} ${user.lastname}`,
      user.email,
      createBankAccountDto.iban
    );

    const bankAccountObject = await this.prisma.stripeBankAccount.create({
      data: {
        bank_account_id: stripeBankAccount.id,
        country: stripeBankAccount.sepa_debit.country,
        fringerprint: stripeBankAccount.sepa_debit.fingerprint,
        last4: stripeBankAccount.sepa_debit.last4,
        StripeAccount: {
          connect: {
            id: stripeAccount.id,
          },
        },
      },
    });

    return bankAccountObject;
  }

  async deleteBankAccount(userId: number) {
    // get user's strip account
    const stripeAccount = await this.prisma.stripeAccount.findFirst({
      where: {
        User: {
          id: userId,
        },
      },
      include: {
        StripeBankAccount: true,
      },
    });

    // Delete bank account from stripe
    try {
      await this.stripeService.deleteBankAccountFromCustomer(
        stripeAccount.StripeBankAccount[0].bank_account_id
      );
    } catch (error) {
      throw new BadRequestException(error);
    }

    // Delete bank account from database
    const bankAccount = await this.prisma.stripeBankAccount.delete({
      where: {
        id: stripeAccount.StripeBankAccount[0].id,
      },
    });

    return bankAccount;
  }
}
