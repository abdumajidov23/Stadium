import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { ComfortModule } from "./comfort/comfort.module";
import { RegionModule } from "./region/region.module";
import { DistrictModule } from "./district/district.module";
import { CategoriesModule } from "./categories/categories.module";
import { UsersModule } from "./users/users.module";
import { UserWalletModule } from "./user_wallet/user_wallet.module";
import { UserCardModule } from "./user_card/user_card.module";
import { CountryModule } from "./country/country.module";
import { MailModule } from "./mail/mail.module";
import { BotModule } from "./bot/bot.module";
import { TelegrafModule } from "nestjs-telegraf";
import { BOT_NAME } from "./app.constants";
// import { OrderModule } from './order/order.module';
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN,
        include: [BotModule],
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      retryAttempts: 5,
      autoLoadModels: true,
      sync: { alter: true },
      logging: false,
    }),
    ComfortModule,
    RegionModule,
    DistrictModule,
    CategoriesModule,
    UsersModule,
    UserWalletModule,
    UserCardModule,
    CountryModule,
    MailModule,
    BotModule,
    AdminModule,
    AuthModule,
    OtpModule,
    // OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
