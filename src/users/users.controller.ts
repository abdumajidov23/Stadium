import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  HttpCode,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request, Response } from "express";
import { SignInDto } from "./dto/sign-in.dto";
import { UserGuard } from "../guards/user.guard";
import { Admin } from "../admin/model/admin.model";
import { AdminGuard } from "../guards/admin.guard";
import { CreatorGuard } from "../guards/creator.guard";
import { PhoneVerifcationUserDto } from "./dto/phone-user.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
// import { CookieGetter } from "../decorators/cookie_getter.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("signup")
  signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.signUp(createUserDto, res);
  }

  @HttpCode(200)
  @Post("signin")
  async signIn(
    @Body() signinDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.signIn(signinDto, res);
  }

  @UseGuards(UserGuard)
  @HttpCode(200)
  @Post("signout")
  signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.usersService.signOut(req, res);
  }

  @UseGuards(UserGuard)
  @HttpCode(200)
  @Post(":id/refresh")
  refresh(
    @Param("id") id: number,
    // @CookieGetter("refresh_token") refresh_token: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.usersService.refreshToken(+id, res, req);
  }

  @UseGuards(UserGuard)
  @Get("activate/:link")
  activate(@Param("link") link: string) {
    return this.usersService.activateAccount(link);
  }

  @UseGuards(UserGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(UserGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(CreatorGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  @HttpCode(200)
  @Post("newotp")
  newOtp(@Body() phoneuserDto: PhoneVerifcationUserDto) {
    return this.usersService.newOtp(phoneuserDto);
  }

  @HttpCode(200)
  @Post("verifyotp")
  verifyotp(@Body() verifyotp: VerifyOtpDto) {
    return this.usersService.verifyOtp(verifyotp);
  }
}
