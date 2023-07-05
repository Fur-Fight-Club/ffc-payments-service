import { Test, TestingModule } from "@nestjs/testing";
import { BankAccountService } from "./bank-account.service";
import { PrismaService } from "src/services/prisma.service";
import { StripeService } from "src/services/stripe.service";

describe("BankAccountService", () => {
  let service: BankAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankAccountService, StripeService, PrismaService],
    }).compile();

    service = module.get<BankAccountService>(BankAccountService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
