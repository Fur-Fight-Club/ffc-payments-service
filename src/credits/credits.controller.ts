import { Body, Controller, Post } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { BuyCreditDto } from "./credits.schema";
import { ZodValidationPipe } from "nestjs-zod";

@Controller("credits")
@ApiTags("Credits controller")
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post("buy")
  @ApiBody({
    type: BuyCreditDto,
  })
  async buyCredits(@Body(ZodValidationPipe) body: BuyCreditDto) {
    return this.creditsService.buyCredits(body.credits, body.user);
  }
}
