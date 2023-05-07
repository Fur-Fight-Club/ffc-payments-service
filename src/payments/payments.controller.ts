import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { StripeCallbackValidationPipe } from "src/pipes/stripe-callback.pipe";
import { UUIDValidationPipe } from "src/pipes/uuid.pipe";
import { StripeCallback } from "./payments.schema";
import { ServiceGuard } from "src/auth/auth-service.guard";

@Controller("payments")
@ApiTags("Payments controller")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(":callback/:session_id")
  @UseGuards(ServiceGuard)
  @ApiParam({
    name: "callback",
    description: "Callback type",
    enum: ["success", "error"],
  })
  @ApiParam({
    name: "session_id",
    description: "Stripe session ID",
  })
  async stripeCallback(
    @Param("callback", StripeCallbackValidationPipe) callback: StripeCallback,
    @Param("session_id", UUIDValidationPipe) session_id: string
  ) {
    switch (callback) {
      case "success":
        return this.paymentsService.stripeSuccessCallback(session_id);
        break;
      case "error":
        return this.paymentsService.stripeErrorCallback(session_id);
      default:
        break;
    }
  }
}
