import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiTags, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { ServiceGuard } from "src/auth/auth-service.guard";

@Controller("user")
@ApiTags("User controller")
@UseGuards(ServiceGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  @ApiParam({
    description: "The id of the user",
    name: "id",
    type: Number,
  })
  async getUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }
}
