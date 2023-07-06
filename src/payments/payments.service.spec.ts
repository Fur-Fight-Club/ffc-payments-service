import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "src/services/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  StripePaymentStatus,
  StripePayments,
  Transaction,
  TransactionTag,
  TransactionType,
  Wallet,
} from "ffc-prisma-package/dist/client";

const userId = 1;

const stripePayment: StripePayments = {
  id: 1,
  status: StripePaymentStatus.SUCCEEDED,
  session_id: "session-id",
  fk_transaction: 1,
  session: "session",
};

const wallet: Wallet = {
  id: 1,
  fk_user: userId,
  amount: 0,
};

const transaction: Transaction = {
  id: 1,
  amount: 1000,
  createdAt: new Date(),
  invoiceId: 1,
  matchId: null,
  monsterId: null,
  tag: TransactionTag.BUY_CREDIT,
  walletId: wallet.id,
  type: TransactionType.IN,
};

describe("PaymentsService", () => {
  let service: PaymentsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService, PrismaService],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("stripeSuccessCallback", () => {
    it("should throw NotFoundException if payment is not found", async () => {
      const session_id = "session-id";

      // Mock the PrismaService to return null, indicating no payment found
      jest
        .spyOn(prismaService.stripePayments, "findFirst")
        .mockResolvedValueOnce(null);

      await expect(
        service.stripeSuccessCallback(session_id)
      ).rejects.toThrowError(NotFoundException);
    });

    it("should throw BadRequestException if payment has already been processed", async () => {
      const session_id = "session-id";

      // Mock the PrismaService to return a processed payment
      jest
        .spyOn(prismaService.stripePayments, "findFirst")
        .mockResolvedValueOnce(stripePayment);

      await expect(
        service.stripeSuccessCallback(session_id)
      ).rejects.toThrowError(BadRequestException);
    });

    it("should update the payment status and user's wallet, and return the updated status and session ID", async () => {
      const session_id = "session-id";
      const amount = 1000;

      // Mock the PrismaService
      jest
        .spyOn(prismaService.stripePayments, "findFirst")
        .mockResolvedValueOnce({
          ...stripePayment,
          status: StripePaymentStatus.PENDING,
        });
      jest
        .spyOn(prismaService.stripePayments, "update")
        .mockResolvedValueOnce(stripePayment);
      jest
        .spyOn(prismaService.transaction, "findFirst")
        .mockResolvedValueOnce(transaction);
      jest
        .spyOn(prismaService.wallet, "findFirst")
        .mockResolvedValueOnce(wallet);
      jest.spyOn(prismaService.wallet, "update").mockResolvedValueOnce(wallet);

      const result = await service.stripeSuccessCallback(session_id);

      expect(prismaService.stripePayments.update).toHaveBeenCalledWith({
        where: {
          session_id,
        },
        data: {
          status: "SUCCEEDED",
        },
      });
      expect(prismaService.wallet.update).toHaveBeenCalledWith({
        where: {
          id: wallet.id,
        },
        data: {
          amount: wallet.amount + amount,
        },
      });
      expect(result).toEqual({ status: "SUCCEEDED", session_id });
    });
  });

  describe("stripeErrorCallback", () => {
    it("should throw NotFoundException if payment is not found", async () => {
      const session_id = "session-id";

      // Mock the PrismaService to return null, indicating no payment found
      jest
        .spyOn(prismaService.stripePayments, "findFirst")
        .mockResolvedValueOnce(null);

      await expect(
        service.stripeErrorCallback(session_id)
      ).rejects.toThrowError(NotFoundException);
    });

    it("should throw BadRequestException if payment has already been processed", async () => {
      const session_id = "session-id";

      // Mock the PrismaService to return a processed payment
      jest
        .spyOn(prismaService.stripePayments, "findFirst")
        .mockResolvedValueOnce(stripePayment);

      await expect(
        service.stripeErrorCallback(session_id)
      ).rejects.toThrowError(BadRequestException);
    });

    it("should update the payment status and return the updated status and session ID", async () => {
      const session_id = "session-id";

      // Mock the PrismaService
      jest
        .spyOn(prismaService.stripePayments, "findFirst")
        .mockResolvedValueOnce({
          ...stripePayment,
          status: StripePaymentStatus.PENDING,
        });
      jest.spyOn(prismaService.stripePayments, "update").mockResolvedValueOnce({
        ...stripePayment,
        status: StripePaymentStatus.FAILED,
      });

      const result = await service.stripeErrorCallback(session_id);

      expect(prismaService.stripePayments.update).toHaveBeenCalledWith({
        where: {
          session_id,
        },
        data: {
          status: "FAILED",
        },
      });
      expect(result).toEqual({ status: "FAILED", session_id });
    });
  });
});
