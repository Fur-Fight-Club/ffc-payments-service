import { Test, TestingModule } from "@nestjs/testing";
import { BankAccountService } from "./bank-account.service";
import { PrismaService } from "src/services/prisma.service";
import { StripeService } from "src/services/stripe.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  Roles,
  StripeAccount,
  StripeBankAccount,
  User,
} from "ffc-prisma-package/dist/client";
import { CreateBankAccountDto } from "./bank-account.schema";

const stripeCustomer = { id: "cus_123" } as any;

describe("BankAccountService", () => {
  let service: BankAccountService;
  let prismaService: PrismaService;
  let stripeService: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankAccountService, StripeService, PrismaService],
    }).compile();

    service = module.get<BankAccountService>(BankAccountService);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeService = module.get<StripeService>(StripeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getBankAccount", () => {
    it("should throw NotFoundException if bank account is not found", async () => {
      // Mock the PrismaService
      jest
        .spyOn(prismaService.stripeAccount, "findFirst")
        .mockResolvedValueOnce(null);

      await expect(service.getBankAccount(1)).rejects.toThrowError(
        NotFoundException
      );
    });

    it("should return the first StripeBankAccount", async () => {
      const userId = 1;
      const stripeBankAccount = {
        id: 1,
        bank_account_id: "bank_account_id",
        country: "FR",
        fk_stripe_account: 1,
        fringerprint: "ba_fingerprint",
        last4: "1234",
      } as StripeBankAccount;
      const stripeAccount = { StripeBankAccount: [stripeBankAccount] } as any;

      // Mock the PrismaService
      jest
        .spyOn(prismaService.stripeAccount, "findFirst")
        .mockResolvedValueOnce(stripeAccount);

      const result = await service.getBankAccount(userId);

      expect(result).toEqual(stripeBankAccount);
    });
  });

  describe("addBankAccount", () => {
    const user = {
      id: 1,
      email: "test@example.com",
      firstname: "John",
      lastname: "Doe",
      StripeAccount: [],
      email_token: null,
      is_email_verified: true,
      password: "hashed_password",
      role: Roles.USER,
    } as User;

    it("should create a new bank account", async () => {
      const createBankAccountDto = {
        iban: "IBAN",
        userId: 1,
      } as CreateBankAccountDto;
      const stripeAccount = {
        id: 1,
        customer_id: stripeCustomer.id,
        customer_object: stripeCustomer,
        fk_user: 1,
      } as StripeAccount;
      const bankAccountObject = { id: 1 } as any;

      // Mock the PrismaService
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValueOnce(user);
      jest
        .spyOn(prismaService.stripeAccount, "create")
        .mockResolvedValueOnce(stripeAccount);
      jest
        .spyOn(prismaService.stripeBankAccount, "findFirst")
        .mockResolvedValueOnce(null);
      jest
        .spyOn(prismaService.stripeBankAccount, "create")
        .mockResolvedValueOnce(bankAccountObject);

      // Mock the StripeService
      jest
        .spyOn(stripeService, "createStripeCustomer")
        .mockResolvedValueOnce(stripeCustomer);
      jest
        .spyOn(stripeService, "addBankAccountToCustomer")
        .mockResolvedValueOnce({
          id: "bank_account_id",
          sepa_debit: {
            bank_code: "bank_code",
            branch_code: "branch_code",
            country: "FR",
            fingerprint: "ba_fingerprint",
            last4: "1234",
            generated_from: {
              charge: "charge",
              setup_attempt: "setup_attempt",
            },
          },
          billing_details: {
            name: "John Doe",
            address: {
              line1: "line1",
              line2: "line2",
              city: "city",
              postal_code: "postal_code",
              country: "FR",
              state: "state",
            },
            email: "email",
            phone: "phone",
          },
          created: 123456789,
          customer: stripeCustomer.id,
          lastResponse: {
            headers: {},
            requestId: "requestId",
            statusCode: 200,
          },
          metadata: {},
          object: "payment_method",
          type: "us_bank_account",
          livemode: false,
        });

      const result = await service.addBankAccount(createBankAccountDto);

      expect(result).toEqual(bankAccountObject);
    });
  });

  describe("deleteBankAccount", () => {
    it("should throw BadRequestException if bank account deletion from Stripe fails", async () => {
      const userId = 1;
      const stripeAccount = {
        StripeBankAccount: [{ bank_account_id: "ba_123", id: 1 }],
      } as any;

      // Mock the PrismaService
      jest
        .spyOn(prismaService.stripeAccount, "findFirst")
        .mockResolvedValueOnce(stripeAccount);

      // Mock the StripeService
      jest
        .spyOn(stripeService, "deleteBankAccountFromCustomer")
        .mockRejectedValueOnce(new Error("Stripe error"));

      await expect(service.deleteBankAccount(userId)).rejects.toThrowError(
        BadRequestException
      );
    });

    it("should delete the bank account from Stripe and the database", async () => {
      const userId = 1;
      const stripeAccount = {
        id: 1,
        customer_id: stripeCustomer.id,
        customer_object: stripeCustomer,
        fk_user: 1,
        StripeBankAccount: [{ bank_account_id: "ba_123", id: 1 }],
      } as StripeAccount;
      const deletedBankAccount = {
        id: 1,
        bank_account_id: "ba_1234",
        country: "FR",
        fk_stripe_account: 1,
        fringerprint: "ba_fingerprint",
        last4: "1234",
      } as StripeBankAccount;

      jest
        .spyOn(prismaService.stripeAccount, "findFirst")
        .mockResolvedValueOnce(stripeAccount);
      jest
        .spyOn(prismaService.stripeBankAccount, "delete")
        .mockResolvedValueOnce(deletedBankAccount);

      // Mock the StripeService
      jest
        .spyOn(stripeService, "deleteBankAccountFromCustomer")
        .mockResolvedValueOnce(null);

      const result = await service.deleteBankAccount(userId);

      expect(result).toEqual(deletedBankAccount);
    });
  });
});
