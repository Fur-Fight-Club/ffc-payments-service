import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";

export class StripeCallbackValidationPipe implements PipeTransform {
  readonly allowedStatuses = ["error", "success"];
  constructor() {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`"${value}" is an invalid callback"`);
    }

    return value;
  }

  private isStatusValid(status: any) {
    const idx = this.allowedStatuses.indexOf(status);
    return idx !== -1;
  }
}
