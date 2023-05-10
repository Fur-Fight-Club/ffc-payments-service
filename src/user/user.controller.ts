import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiTags, ApiParam } from "@nestjs/swagger";

@Controller("user")
@ApiTags("User controller")
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
