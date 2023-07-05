import { Test, TestingModule } from "@nestjs/testing";
import { CreditsService } from "./credits.service";
import { InvoicesService } from "src/services/invoices.service";
import { PrismaService } from "src/services/prisma.service";
import {
  StripeCheckoutSessionResponse,
  StripeService,
} from "src/services/stripe.service";
import { ConfigService } from "@nestjs/config";
import {
  Invoice,
  Roles,
  StripeAccount,
  Transaction,
  TransactionTag,
  TransactionType,
  User,
  Wallet,
} from "ffc-prisma-package/dist/client";

describe("CreditsService", () => {
  let service: CreditsService;
  let prismaService: PrismaService;
  let stripeService: StripeService;
  let invoicesService: InvoicesService;

  const credits = "1000";
  const user: User = {
    id: 1,
    email: "email",
    email_token: null,
    firstname: "firstname",
    lastname: "lastname",
    password: "password",
    role: Roles.ADMIN,
    is_email_verified: true,
  };
  const session_uuid = "session-uuid";
  const requestFrom = "web";
  const stripeAccount: StripeAccount = {
    id: 1,
    fk_user: user.id,
    customer_id: "customer-id",
    customer_object: {},
  };
  const invoice: Invoice = {
    id: 1,
    amount: +credits,
    createdAt: new Date(),
    fk_user: user.id,
    url: "https://example.com/invoice",
    uuid: session_uuid,
  };
  const wallet: Wallet = {
    id: 1,
    fk_user: user.id,
    amount: 0,
  };
  const transaction: Transaction = {
    id: 1,
    amount: 1000,
    createdAt: new Date(),
    invoiceId: invoice.id,
    matchId: null,
    monsterId: null,
    tag: TransactionTag.BUY_CREDIT,
    walletId: wallet.id,
    type: TransactionType.IN,
  };

  beforeEach(async () => {
    jest.setTimeout(60000);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        StripeService,
        PrismaService,
        InvoicesService,
        ConfigService,
      ],
    }).compile();

    service = module.get<CreditsService>(CreditsService);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeService = module.get<StripeService>(StripeService);
    invoicesService = module.get<InvoicesService>(InvoicesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a new invoice and transaction, and return the payment URL", async () => {
    // Mock the PrismaService
    jest.spyOn(prismaService.user, "findUnique").mockResolvedValueOnce(user);
    jest
      .spyOn(prismaService.stripeAccount, "findFirst")
      .mockResolvedValueOnce(stripeAccount);
    jest.spyOn(prismaService.wallet, "findFirst").mockResolvedValueOnce(wallet);
    jest.spyOn(prismaService.invoice, "create").mockResolvedValueOnce(invoice);
    jest.spyOn(prismaService.stripePayments, "create").mockResolvedValueOnce({
      id: 2,
      fk_transaction: transaction.id,
      session: session_uuid,
      session_id: session_uuid,
      status: "PENDING",
    });
    jest
      .spyOn(prismaService.transaction, "create")
      .mockResolvedValueOnce(transaction);

    jest.spyOn(invoicesService, "uploadPDFInvoice").mockResolvedValueOnce({
      url: "https://example.com/invoice",
      name: "invoice.pdf",
    });

    // Mock the StripeService
    const stripeCheckoutSessionResponse = {
      url: "https://example.com/checkout-session",
    };
    jest.spyOn(stripeService, "createCheckoutSession").mockResolvedValueOnce({
      url: "https://example.com/checkout-session",
    } as StripeCheckoutSessionResponse);

    const result = await service.buyCredits(
      credits,
      user.id,
      session_uuid,
      requestFrom
    );

    expect(result.invoice).toEqual(invoice);
    expect(result.transaction).toEqual(transaction);
    expect(result.payment_url).toEqual(stripeCheckoutSessionResponse.url);
  });
});
