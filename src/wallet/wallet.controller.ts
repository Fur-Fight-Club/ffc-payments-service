import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { WalletService } from "./wallet.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  UpdateUsersWalletBalanceDto,
  WalletBalanceResponse,
  WalletBalanceResponseWithUser,
  WithdrawWalletDto,
} from "./wallet.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ServiceGuard } from "src/auth/auth-service.guard";

@Controller("wallet")
@ApiTags("Wallet controller")
@UseGuards(ServiceGuard)
@ApiBearerAuth()
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

  @Get("user/:id/balance")
  @ApiParam({
    description: "The id of the user",
    name: "id",
    type: Number,
  })
  @ApiResponse({
    description: "The user's wallet balance",
    type: WalletBalanceResponse,
  })
  getBalance(@Param("id", ParseIntPipe) id: string) {
    return this.walletService.getBalance(+id);
  }

  @Get("users")
  @ApiResponse({
    description: "Get all wallets",
    type: [WalletBalanceResponseWithUser],
  })
  getAllWallets() {
    return this.walletService.getAllWallets();
  }

  @Patch("user/:id/balance")
  @ApiParam({
    description: "The id of the user",
    name: "id",
    type: Number,
  })
  @ApiBody({
    description: "Add money to the user's wallet",
    type: UpdateUsersWalletBalanceDto,
  })
  @ApiResponse({
    description: "The user's wallet balance",
    type: WalletBalanceResponse,
  })
  updateUsersWalletBalance(
    @Param("id", ParseIntPipe) id: string,
    @Body(ZodValidationPipe) body: UpdateUsersWalletBalanceDto
  ) {
    return this.walletService.updateUsersWalletBalance(+id, body.amount);
  }
}
