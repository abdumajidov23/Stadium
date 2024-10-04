import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./model/user.model";

import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { SignInDto } from "./dto/sign-in.dto";
import { MailService } from "../mail/mail.service";
import { PhoneVerifcationUserDto } from "./dto/phone-user.dto";

import * as otpGenerator from "otp-generator";
import { BotService } from "../bot/bot.service";
import { Otp } from "../otp/otp.model";
import { AddMinutesToDate } from "../helpers/addMinutes";
import { timestamp } from "rxjs";
import { decode, encode } from "../helpers/crypto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Otp) private otpModel: typeof Otp,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly botService: BotService,
  ) {}

  async generateTokens(user: User) {
    const payload = {
      id: user.id,
      is_active: user.is_active,
      is_owner: user.is_owner,
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

  async signUp(createUserDto: CreateUserDto, res: Response) {
    const user = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });

    if (user) {
      throw new BadRequestException("User already exists");
    }
    if (createUserDto.password !== createUserDto.confirm_password) {
      throw new BadRequestException("Passwords do not match");
    }

    const hashed_password = await bcrypt.hash(createUserDto.password, 10);
    const new_user = await this.userModel.create({
      ...createUserDto,
      hashed_password,
    });
    const tokens = await this.generateTokens(new_user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    const activation_link = uuid.v4();

    const updated_user = await this.userModel.update(
      {
        hashed_refresh_token,
        activation_link,
      },
      { where: { id: new_user.id }, returning: true },
    );
    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      maxAge: +process.env.REFRESH_TIME_MS,
    });

    try {
      await this.mailService.sendConfirmationMail(updated_user[1][0]);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error while sending mail");
    }

    const response = {
      message: "User registered",
      user: updated_user[1][0],
      access_token: tokens.access_token,
    };

    return response;
  }

  async activateAccount(link: string) {
    if (!link) {
      throw new BadRequestException("Activation link not found");
    }

    const updated_user = await this.userModel.update(
      { is_active: true },
      { where: { activation_link: link, is_active: false }, returning: true },
    );

    if (!updated_user) {
      throw new BadRequestException("User already exists");
    }

    const response = {
      message: "User activated successfully",
      user: updated_user[1][0],
    };
    return response;
  }

  async signIn(signinDto: SignInDto, res: Response) {
    const user = await this.userModel.findOne({
      where: { email: signinDto.email },
    });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.is_active) {
      throw new BadRequestException("User is not active");
    }

    const valid_password = bcrypt.compareSync(
      signinDto.password,
      user.hashed_password,
    );

    if (!valid_password) {
      // this message is just for me.
      throw new BadRequestException("Wrong password");
    }
    const tokens = await this.generateTokens(user);
    user.hashed_refresh_token = bcrypt.hashSync(tokens.refresh_token, 10);
    // const updated_user = await this.userModel.update(
    //   { hashed_refresh_token },
    //   { where: { id: user.id }, returning: true },
    // );
    await user.save();

    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      maxAge: +process.env.REFRESH_TIME_MS,
    });

    const response = {
      message: "User signed in",
      user: user,
      access_token: tokens.access_token,
    };

    return response;
  }

  async signOut(req: Request, res: Response) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return { message: "No cookies found" };
    }
    console.log(cookieHeader);

    const refresh_token = cookieHeader.split("=")[1];
    // console.log(refresh_token);
    const userData = await this.jwtService.verify(refresh_token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    console.log(userData);
    if (!userData) {
      throw new ForbiddenException("User not verified");
    }

    const updated_user = this.userModel.update(
      { hashed_refresh_token: null },
      { where: { id: userData.id }, returning: true },
    );
    // do, i have to check whether person logging out is the same person.

    res.clearCookie("refresh_token");
    const response = {
      message: "User signed out successfully",
    };
    return response;
  }

  async refreshToken(user_id: number, res: Response, req: Request) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return { message: "No cookies found" };
    }

    const refresh_token = cookieHeader.split("=")[1];
    const decoded_token = await this.jwtService.decode(refresh_token);

    if (user_id !== decoded_token["id"]) {
      throw new BadRequestException("No access");
    }

    const user = await this.userModel.findOne({ where: { id: user_id } });

    if (!user || !user.hashed_refresh_token) {
      throw new BadRequestException("User not found");
    }

    const token_check = await bcrypt.compare(
      refresh_token,
      user.hashed_refresh_token,
    );

    if (!token_check) {
      throw new ForbiddenException("Forbidden");
    }

    const tokens = await this.generateTokens(user);

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    const updated_user = await this.userModel.update(
      {
        hashed_refresh_token,
      },
      { where: { id: user.id }, returning: true },
    );

    res.cookie("refresh_token", tokens.refresh_token, {
      maxAge: +process.env.REFRESH_TIME_MS,
      httpOnly: true,
    });

    const response = {
      messsage: "User refreshed",
      user: updated_user[1][0],
      access_token: tokens.access_token,
    };
    return response;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { verification_key, otp, phone_number } = verifyOtpDto;
    const current_time = new Date();
    const decodedData = await decode(verification_key);
    const details = JSON.parse(decodedData);
    if (details.phone_number !== phone_number) {
      throw new BadRequestException("OTP is not send to this number");
    }
    const resultOtp = await this.otpModel.findOne({
      where: { id: details.otp_id },
    });

    if (!resultOtp) {
      throw new BadRequestException("OTP not found");
    }

    if (resultOtp.verified) {
      throw new BadRequestException("OTP used before");
    }

    if (resultOtp.expiration_time < current_time) {
      throw new BadRequestException("OTP time expired");
    }

    if (resultOtp.otp !== otp) {
      throw new BadRequestException("OTP does not match");
    }

    const user = await this.userModel.update(
      {
        is_owner: true,
      },
      { where: { phone: phone_number }, returning: true },
    );

    if (!user[1][0]) {
      throw new BadRequestException("User not found");
    }
    await this.otpModel.update(
      { verified: true },
      { where: { id: details.otp_id } },
    );

    const response = {
      message: "You successfully verified yourself as owner",
      owner: user[1][0].is_owner,
    };

    return response;
  }

  


  findAll() {
    return this.userModel.findAll();
  }

  findOne(id: number) {
    return this.userModel.findByPk(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const is_avaliable = await this.userModel.findByPk(id);
    if (!is_avaliable) {
      return { message: "Update object not found" };
    }
    const updated_user = await this.userModel.update(updateUserDto, {
      where: { id },
      returning: true,
    });
    return updated_user[1][0];
  }

  remove(id: number) {
    return this.userModel.destroy({ where: { id } });
  }

  async newOtp(phoneUserDto: PhoneVerifcationUserDto) {
    const phone_number = phoneUserDto.phone;

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const isSend = await this.botService.sendOtp(phone_number, otp);

    if (!isSend) {
      throw new BadRequestException("First register in Telegram bot");
    }

    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 5);
    await this.otpModel.destroy({ where: { phone_number } });

    const newOtp = await this.otpModel.create({
      id: uuid.v4(),
      otp,
      expiration_time,
      phone_number,
    });

    const details = {
      timestamp: now,
      phone_number,
      otp_id: newOtp.id,
    };

    const encodedData = await encode(JSON.stringify(details));

    return { message: "OTP send to Telegram", details: encodedData };
  }
}
