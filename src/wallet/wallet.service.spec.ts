import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import { PrismaService } from "src/services/prisma.service";
import { InvoicesService } from "src/services/invoices.service";

describe("WalletService", () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, PrismaService, InvoicesService],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
