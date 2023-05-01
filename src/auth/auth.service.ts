import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as fs from "fs"

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private config: ConfigService) { }

  signinService(): { access_token: string } {
    const payload = {
      iss: this.config.get<string>('issuer'),
      aud: "*",
      sub: this.config.get<string>('service'),
    };
    return {
      access_token: this.jwtService.sign(payload, {
        algorithm: 'RS256',
        expiresIn: '60s',
        privateKey: fs.readFileSync("ssl/service-auth-private.pem"),
      }),
    };
  }
}
