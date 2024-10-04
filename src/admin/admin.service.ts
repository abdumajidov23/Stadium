import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Admin } from "./model/admin.model";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { SignInDto } from "./dto/signin.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private adminModel: typeof Admin,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(admin: Admin) {
    const payload = {
      id: admin.id,
      is_active: admin.is_active,
      is_creator: admin.is_creator,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return { access_token, refresh_token };
  }

  async signUp(createAdminDto: CreateAdminDto, res: Response) {
    const admin = await this.adminModel.findOne({
      where: { username: createAdminDto.username },
    });

    if (admin) {
      throw new BadRequestException("Admin already exists");
    }
    if (createAdminDto.password !== createAdminDto.confirm_password) {
      throw new BadRequestException("Passwords do not match");
    }

    const hashed_password = await bcrypt.hash(createAdminDto.password, 10);
    const new_admin = await this.adminModel.create({
      ...createAdminDto,
      hashed_password,
    });
    const tokens = await this.generateTokens(new_admin);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    const updated_admin = await this.adminModel.update(
      {
        hashed_refresh_token,
      },
      { where: { id: new_admin.id }, returning: true },
    );

    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      maxAge: +process.env.REFRESH_TIME_MS,
    });

    const response = {
      message: "Admin registered",
      admin: updated_admin[1][0],
      access_token: tokens.access_token,
    };

    return response;
  }

  async signIn(signinDto: SignInDto, res: Response) {
    const admin = await this.adminModel.findOne({
      where: { username: signinDto.username },
    });
    if (!admin) {
      throw new UnauthorizedException("Admin not found");
    }

    // if (!admin.is_active) {
    //   throw new BadRequestException("User is not active");
    // }

    const valid_password = bcrypt.compareSync(
      signinDto.password,
      admin.hashed_password,
    );

    if (!valid_password) {
      throw new BadRequestException("Wrong password");
    }
    const tokens = await this.generateTokens(admin);
    admin.hashed_refresh_token = bcrypt.hashSync(tokens.refresh_token, 10);
    // const updated_user = await this.userModel.update(
    //   { hashed_refresh_token },
    //   { where: { id: user.id }, returning: true },
    // );
    await admin.save();

    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      maxAge: +process.env.REFRESH_TIME_MS,
    });

    const response = {
      message: "User signed in",
      admin: admin,
      access_token: tokens.access_token,
    };

    return response;
  }

  async refreshToken(admin_id: number, res: Response, req: Request) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return { message: "No cookies found" };
    }

    const refresh_token = cookieHeader.split("=")[1];
    const decoded_token = await this.jwtService.decode(refresh_token);

    if (admin_id !== decoded_token["id"]) {
      throw new BadRequestException("No access");
    }

    const admin = await this.adminModel.findOne({ where: { id: admin_id } });

    if (!admin || !admin.hashed_refresh_token) {
      throw new BadRequestException("Admin not found");
    }

    const token_check = await bcrypt.compare(
      refresh_token,
      admin.hashed_refresh_token,
    );

    if (!token_check) {
      throw new ForbiddenException("Forbidden");
    }

    const tokens = await this.generateTokens(admin);

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    const updated_admin = await this.adminModel.update(
      {
        hashed_refresh_token,
      },
      { where: { id: admin.id }, returning: true },
    );

    res.cookie("refresh_token", tokens.refresh_token, {
      maxAge: +process.env.REFRESH_TIME_MS,
      httpOnly: true,
    });

    const response = {
      messsage: "Admin refreshed",
      user: updated_admin[1][0],
      access_token: tokens.access_token,
    };
    return response;
  }

  findAll() {
    return this.adminModel.findAll();
  }

  findOne(id: number) {
    return this.adminModel.findByPk(id);
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const updated_admin = await this.adminModel.update(updateAdminDto, {
      where: { id },
      returning: true,
    });
    return updated_admin[1][0];
  }

  remove(id: number) {
    return this.adminModel.destroy({ where: { id } });
  }
}
