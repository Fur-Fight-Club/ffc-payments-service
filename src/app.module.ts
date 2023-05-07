import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './services/prisma.service';
import { PaymentsModule } from './payments/payments.module';
import { CreditsModule } from './credits/credits.module';
import { BankAccountModule } from './bank-account/bank-account.module';

@Module({
  imports: [ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
  }), AuthModule, PaymentsModule, CreditsModule, BankAccountModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
