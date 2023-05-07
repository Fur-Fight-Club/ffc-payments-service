import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const withdrawWallet = z.object({
  amount: z.number().int().min(10000),
});

export class WithdrawWalletDto extends createZodDto(withdrawWallet) {
  @ApiProperty({
    description: "Amount to withdraw",
    type: Number,
    default: 10000,
  })
  amount: number;
}
