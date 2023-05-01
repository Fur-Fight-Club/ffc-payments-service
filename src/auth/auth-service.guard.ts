import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWTServicePayload } from "./auth.model";
import * as fs from "fs"
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";


@Injectable()
export class ServiceGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractServiceToken(request);
    if (!token) {
      throw new UnauthorizedException("Service token not found");
    }

    try {
      const tokenPayload = await this.jwtService.verifyAsync(token, {
        algorithms: ['RS256'],
        publicKey: fs.readFileSync("ssl/service-auth-public.pem"),

      }) as JWTServicePayload;

      if (!this.configService.get<string[]>('authorizedServices').includes(tokenPayload.sub)) {
        throw new UnauthorizedException(`Service "${tokenPayload.sub}" is not authorized`);
      }

      request['service'] = tokenPayload;
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private extractServiceToken(request: Request): string | undefined {
    // Get the header 'x-service-auth'
    const [type, token] = (request.headers['x-service-auth'] as string | undefined)?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}