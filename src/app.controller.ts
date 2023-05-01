import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServerHealthcheck } from './app.model';

@Controller()
@ApiTags('Utils')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiResponse({
    description: 'Checking the health of the server and database. Mainly for AWS healthchecks.',
    type: ServerHealthcheck,
  })
  @Get("ping")
  async healthcheck(): Promise<object> {
    return await this.appService.healthcheck()
  }
}
