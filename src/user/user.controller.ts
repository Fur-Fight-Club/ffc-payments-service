import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiTags } from "@nestjs/swagger";

@Controller("user")
@ApiTags("User controller")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }
}
