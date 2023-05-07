import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";

export class UUIDValidationPipe implements PipeTransform {
  private readonly uuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  constructor() {}

  transform(value: string, metadata: ArgumentMetadata) {
    if (!this.isUUIDv4(value)) {
      throw new BadRequestException(`"${value}" is an invalid uuid"`);
    }

    return value;
  }

  private isUUIDv4(uuid: string) {
    return this.uuidRegex.test(uuid);
  }
}
