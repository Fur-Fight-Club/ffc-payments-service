import { ApiProperty } from "@nestjs/swagger";

export class ServerHealthcheck {
  @ApiProperty({ type: 'number', format: 'binary', default: 200 })
  server_status: number;
  @ApiProperty({ type: 'number', format: 'binary', default: 200 })
  prisma_status: number;
  @ApiProperty({ type: Date, format: 'binary', default: new Date() })
  timestamp: Date;
}