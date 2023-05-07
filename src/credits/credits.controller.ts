import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { BuyCreditDto } from "./credits.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ServiceGuard } from "src/auth/auth-service.guard";

@Controller("credits")
@ApiTags("Credits controller")
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post("buy")
  @UseGuards(ServiceGuard)
  @ApiBody({
    type: BuyCreditDto,
  })
  async buyCredits(@Body(ZodValidationPipe) body: BuyCreditDto) {
    return this.creditsService.buyCredits(body.credits, body.user);
  }
}
