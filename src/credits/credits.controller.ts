import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { BuyCreditDto } from "./credits.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ServiceGuard } from "src/auth/auth-service.guard";
import { generateUUID } from "src/utils/functions.utils";

@Controller("credits")
@ApiTags("Credits controller")
@ApiBearerAuth()
@UseGuards(ServiceGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post("buy")
  @ApiBody({
    type: BuyCreditDto,
  })
  async buyCredits(@Body(ZodValidationPipe) body: BuyCreditDto) {
    return this.creditsService.buyCredits(
      body.credits,
      body.user,
      generateUUID(),
      body.requestFrom
    );
  }
}
