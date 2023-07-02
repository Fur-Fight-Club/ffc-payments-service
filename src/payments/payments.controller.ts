import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { ServiceGuard } from "src/auth/auth-service.guard";
import { StripeCallbackValidationPipe } from "src/pipes/stripe-callback.pipe";
import { UUIDValidationPipe } from "src/pipes/uuid.pipe";
import { StripeCallback } from "./payments.schema";
import { PaymentsService } from "./payments.service";

@Controller("payments")
@ApiTags("Payments controller")
@ApiBearerAuth()
@UseGuards(ServiceGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("all")
  async getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get(":callback/:session_id")
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
