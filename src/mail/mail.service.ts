import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "../users/model/user.model";
import { log } from "console";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationMail(user: User) {
    const url = `${process.env.API_URL}:${process.env.PORT}/users/activate/${user.activation_link}`;
   //  console.log(url);
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Stadiator member account activation.!",
      template: "./confirm",
      context: {
        full_name: user.full_name,
        activation_link: url,
      },
    });
  }
}
