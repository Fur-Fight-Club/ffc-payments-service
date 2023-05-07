import { Body, Controller, Param, ParseIntPipe, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { WithdrawWalletDto } from "./wallet.schema";
import { ZodValidationPipe } from "nestjs-zod";

@Controller("wallet")
@ApiTags("Wallet controller")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post("user/:id/withdraw")
  @ApiParam({
    description: "The id of the user",
    name: "id",
    type: Number,
  })
  @ApiBody({
    description: "Withdraw money from the user's wallet",
    type: WithdrawWalletDto,
  })
  transferMoney(
    @Param("id", ParseIntPipe) id: string,
    @Body(ZodValidationPipe) body: WithdrawWalletDto
  ) {
    return this.walletService.transferMoney(+id, body.amount);
  }
}
