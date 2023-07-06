import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import { PrismaService } from "src/services/prisma.service";
import { InvoicesService } from "src/services/invoices.service";
import { NotFoundException } from "@nestjs/common";
import { exchangeRate } from "src/credits/credits.schema";
import { Wallet } from "ffc-prisma-package/dist/client";

const userId = 1;
const amount = 1000;
const updatedAmount = 2000;
const wallet: Wallet = {
  id: 1,
  fk_user: userId,
  amount: amount,
};

describe("WalletService", () => {
  let service: WalletService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, PrismaService, InvoicesService],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getBalance", () => {
    it("should throw NotFoundException if wallet is not found", async () => {
      // Mock the PrismaService to return null, indicating no wallet found
      jest.spyOn(prismaService.wallet, "findFirst").mockResolvedValueOnce(null);

      await expect(service.getBalance(userId)).rejects.toThrowError(
        NotFoundException
      );
    });

    it("should return the balance of the user's wallet in credits and euro", async () => {
      // Mock the PrismaService
      jest
        .spyOn(prismaService.wallet, "findFirst")
        .mockResolvedValueOnce(wallet);

      const result = await service.getBalance(userId);

      expect(prismaService.wallet.findFirst).toHaveBeenCalledWith({
        where: {
          fk_user: userId,
        },
      });
      expect(result).toEqual({
        credits: amount,
        euro: +(amount * exchangeRate).toFixed(2),
      });
    });
  });

  describe("updateUsersWalletBalance", () => {
    it("should throw NotFoundException if wallet is not found", async () => {
      const userId = 1;
      const amount = 1000;

      // Mock the PrismaService to return null, indicating no wallet found
      jest.spyOn(prismaService.wallet, "findFirst").mockResolvedValueOnce(null);

      await expect(
        service.updateUsersWalletBalance(userId, amount)
      ).rejects.toThrowError(NotFoundException);
    });

    it("should update the user's wallet balance and return the updated balance in credits and euro", async () => {
      // Mock the PrismaService
      jest
        .spyOn(prismaService.wallet, "findFirst")
        .mockResolvedValueOnce(wallet);
      jest
        .spyOn(prismaService.wallet, "update")
        .mockResolvedValueOnce({ ...wallet, amount: updatedAmount });

      const result = await service.updateUsersWalletBalance(userId, amount);

      expect(prismaService.wallet.findFirst).toHaveBeenCalledWith({
        where: {
          fk_user: userId,
        },
      });
      expect(prismaService.wallet.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          amount,
        },
      });
      expect(result).toEqual({
        credits: updatedAmount,
        euro: +(updatedAmount * exchangeRate).toFixed(2),
      });
    });
  });
});
