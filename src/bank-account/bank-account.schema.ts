import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const createBankAccount = z.object({
  userId: z.number(),
  iban: z.string(),
});

export class CreateBankAccountDto extends createZodDto(createBankAccount) {
  @ApiProperty({
    description: "The id of the user",
    example: 1,
    type: Number,
  })
  userId: number;

  @ApiProperty({
    description: "The IBAN of the user",
    example: "DE89370400440532013000",
  })
  iban: string;
}
