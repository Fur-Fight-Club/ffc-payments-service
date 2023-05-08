import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { BankAccountService } from "./bank-account.service";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateBankAccountDto } from "./bank-account.schema";
import { ServiceGuard } from "src/auth/auth-service.guard";

@Controller("bank-account")
@ApiTags("Bank Account Controller")
@ApiBearerAuth()
@UseGuards(ServiceGuard)
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @ApiBody({
    description: "Add a bank account to the user",
    type: CreateBankAccountDto,
  })
  addBankAccount(@Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountService.addBankAccount(createBankAccountDto);
  }

  @Get("user/:id")
  @ApiParam({
    description: "The id of the user",
    name: "id",
    type: Number,
  })
  getBankAccount(@Param("id", ParseIntPipe) id: string) {
    return this.bankAccountService.getBankAccount(+id);
  }

  @Delete("user/:id")
  @ApiParam({
    description: "The id of the user",
    name: "id",
    type: Number,
  })
  deleteBankAccount(@Param("id", ParseIntPipe) id: string) {
    return this.bankAccountService.deleteBankAccount(+id);
  }
}
