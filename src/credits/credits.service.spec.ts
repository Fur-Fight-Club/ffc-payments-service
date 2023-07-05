import { Test, TestingModule } from "@nestjs/testing";
import { CreditsService } from "./credits.service";
import { InvoicesService } from "src/services/invoices.service";
import { PrismaService } from "src/services/prisma.service";
import { StripeService } from "src/services/stripe.service";
import { ConfigService } from "@nestjs/config";

describe("CreditsService", () => {
  let service: CreditsService;

  beforeEach(async () => {
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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
