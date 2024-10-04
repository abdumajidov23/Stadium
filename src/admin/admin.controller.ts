import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpCode,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { Request, Response } from "express";
import { SignInDto } from "./dto/signin.dto";
import { CreatorGuard } from "../guards/creator.guard";
import { AdminGuard } from "../guards/admin.guard";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(CreatorGuard)
  @Post("signup")
  signUp(
    @Body() createAdminDto: CreateAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.signUp(createAdminDto, res);
  }

  // @UseGuards()
  @HttpCode(200)
  @Post("signin")
  signIn(
    @Body() signinDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.signIn(signinDto, res);
  }

  @UseGuards(AdminGuard)
  @HttpCode(200)
  @Post(":id/refresh")
  refresh(
    @Param("id") id: number,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.adminService.refreshToken(+id, res, req);
  }

  // signOut is left.

  // and i want to add PASSWORD_RESET.
  // and after some smart queries.

  // and i guess there should be some kind of activation.

  @UseGuards(CreatorGuard)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adminService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @UseGuards(CreatorGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminService.remove(+id);
  }
}
