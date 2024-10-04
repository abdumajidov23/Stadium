import { Injectable } from "@nestjs/common";
import { CreateBotDto } from "./dto/create-bot.dto";
import { UpdateBotDto } from "./dto/update-bot.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./models/bot.model";
import { InjectBot } from "nestjs-telegraf";
import { BOT_NAME } from "../app.constants";
import { Context, Markup, Telegraf } from "telegraf";
import { Address } from "./models/address.model";
import { Car } from "./models/car.model";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private botModel: typeof Bot,
    @InjectModel(Address) private addressModel: typeof Address,
    @InjectModel(Car) private carModel: typeof Car,
    @InjectBot(BOT_NAME) private bot: Telegraf<Context>,
  ) {}

  async start(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botModel.findByPk(userId);
    if (!user) {
      await this.botModel.create({
        user_id: userId,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        lang: ctx.from.language_code,
      });

      await ctx.reply("Please, press <b>📞 Send my phone number.</b> button", {
        parse_mode: "HTML",
        ...Markup.keyboard([
          [Markup.button.contactRequest("📞 Send my phone number.")],
        ])
          .resize()
          .oneTime(),
      });
    } else if (!user.status) {
      await ctx.reply("Please, press <b>📞 Send my phone number.</b> button", {
        parse_mode: "HTML",
        ...Markup.keyboard([
          [Markup.button.contactRequest("📞 Send my phone number.")],
        ])
          .resize()
          .oneTime(),
      });
    } else {
      await ctx.reply(
        "This bot works for verifying Stadium owners account in application called Stadiator",
        {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
        },
      );
    }
  }

  async onContact(ctx: Context) {
    if ("contact" in ctx.message) {
      const userId = ctx.from.id;
      const user = await this.botModel.findByPk(userId);
      if (!user) {
        await ctx.reply(`Please, press start button`, {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .resize()
            .oneTime(),
        });
      } else if (ctx.message.contact.user_id != userId) {
        await ctx.reply("Please, enter your phone number.!!", {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.contactRequest("📞 Send my phone number.")],
          ])
            .resize()
            .oneTime(),
        });
      } else {
        await this.botModel.update(
          {
            phone_number: ctx.message.contact.phone_number,
            status: true,
          },
          { where: { user_id: userId } },
        );
        await ctx.reply("Congratulations, your account is activated.!!", {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
        });
      }
    }
  }

  async onStop(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botModel.findByPk(userId);
    if (!user) {
      await ctx.reply(`You haven't registered.`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["/start"]])
          .resize()
          .oneTime(),
      });
    } else if (user.status) {
      await this.botModel.update(
        { status: false, phone_number: null },
        { where: { user_id: userId } },
      );
      await ctx.reply("You exited the bot.!!", {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
      });
    }
  }

  async onAddress(ctx: Context) {
    await ctx.reply("My addresses", {
      parse_mode: "HTML",
      ...Markup.keyboard([["My Addresses", "Adding new address"]]).resize(),
    });
  }

  async addNewAddress(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botModel.findByPk(userId);
    if (!user) {
      await ctx.reply(`Please, press start button`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["/start"]])
          .resize()
          .oneTime(),
      });
    } else {
      await this.addressModel.create({
        user_id: userId,
        last_state: "address_name",
      });
      await ctx.reply(`Name the new address: `, {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
      });
    }
  }

  async onText(ctx: Context) {
    if ("text" in ctx.message) {
      const userId = ctx.from.id;
      const user = await this.botModel.findByPk(userId);
      if (!user) {
        await ctx.reply(`Please, press start button`, {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .resize()
            .oneTime(),
        });
      } else {
        const address = await this.addressModel.findOne({
          where: { user_id: userId },
          order: [["id", "DESC"]],
        });
        if (address) {
          if (address.last_state == "address_name") {
            address.address_name = ctx.message.text;
            address.last_state = "address";
            await address.save();
            await ctx.reply(`Enter your address:`, {
              parse_mode: "HTML",
              ...Markup.removeKeyboard(),
            });
          } else if (address.last_state == "address") {
            address.address = ctx.message.text;
            address.last_state = "location";
            await address.save();
            await ctx.reply(`Enter your location:`, {
              parse_mode: "HTML",
              ...Markup.keyboard([
                [Markup.button.locationRequest("Send location")],
              ]),
            });
          }
        }
      }
    }
  }

  async onLocation(ctx: Context) {
    if ("location" in ctx.message) {
      const userId = ctx.from.id;
      const user = await this.botModel.findByPk(userId);
      if (!user) {
        await ctx.reply(`Please, press start button`, {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .resize()
            .oneTime(),
        });
      } else {
        const address = await this.addressModel.findOne({
          where: { user_id: userId },
          order: [["id", "DESC"]],
        });
        if (address) {
          if (address.last_state == "location") {
            address.location = `${ctx.message.location.latitude}, ${ctx.message.location.longitude}`;
            address.last_state = "finish";
            await address.save();
            await ctx.reply(`New address added`, {
              parse_mode: "HTML",
              ...Markup.keyboard([
                ["My Addresses", "Adding new address"],
              ]).resize(),
            });
          }
        }
      }
    }
  }

  async myAddresses(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botModel.findByPk(userId);
    if (!user) {
      await ctx.reply(`Please, press start button`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["/start"]])
          .resize()
          .oneTime(),
      });
    } else {
      const user_addresses = await this.addressModel.findAll({
        where: { user_id: userId },
      });
      // console.log(user_addresses);
      user_addresses.forEach(async (address) => {
        await ctx.replyWithHTML(
          `<b>Address name: </b> ${address.address_name}\n<b>Address: </b> ${address.address}`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Show locations",
                    callback_data: `location_${address.id}`,
                  },
                ],
              ],
            },
          },
        );
      });
    }
  }

  async onClickLocation(ctx: Context) {
    try {
      const actText: string = ctx.callbackQuery["data"];
      const address_id = Number(actText.split("_")[1]);
      const address = await this.addressModel.findByPk(address_id);
      await ctx.replyWithLocation(
        Number(address.location.split(",")[0]),
        Number(address.location.split(",")[1]),
      );
    } catch (error) {
      console.log("onClickLocation", error);
    }
  }

  async onCar(ctx: Context) {
    await ctx.reply("My cars", {
      parse_mode: "HTML",
      ...Markup.keyboard([["My cars", "Adding new car"]]).resize(),
    });
  }

  async addNewCar(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botModel.findByPk(userId);
    if (!user) {
      await ctx.reply(`Please, press start button`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["/start"]])
          .resize()
          .oneTime(),
      });
    } else {
      await this.carModel.create({
        user_id: userId,
        current_status: "brand",
      });
      await ctx.reply(`Enter car brand: `, {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
      });
    }
  }

  async comingText(ctx: Context) {
    if ("text" in ctx.message) {
      const userId = ctx.from.id;
      const user = await this.botModel.findByPk(userId);
      if (!user) {
        await ctx.reply(`Please, press start button`, {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .resize()
            .oneTime(),
        });
      } else {
        const car = await this.carModel.findOne({
          where: { user_id: userId },
          order: [["id", "DESC"]],
        });
        if (car) {
          if (car.current_status == "brand") {
            car.brand = ctx.message.text;
            car.current_status = "model";
            await car.save();
            await ctx.reply(`Enter your model:`, {
              parse_mode: "HTML",
              ...Markup.removeKeyboard(),
            });
          } else if (car.current_status == "model") {
            car.model = ctx.message.text;
            car.current_status = "color";
            await car.save();
            await ctx.reply(`Enter your color:`, {
              parse_mode: "HTML",
              ...Markup.removeKeyboard(),
            });
          } else if (car.current_status == "color") {
            car.color = ctx.message.text;
            car.current_status = "year";
            await car.save();
            await ctx.reply(`Enter the year your car was manufactured:`, {
              parse_mode: "HTML",
              ...Markup.removeKeyboard(),
            });
          } else if (car.current_status == "year") {
            car.year = +ctx.message.text;
            car.current_status = "licence_plate";
            await car.save();
            await ctx.reply(`Enter your car's licence plate:`, {
              parse_mode: "HTML",
              ...Markup.removeKeyboard(),
            });
          } else if (car.current_status == "licence_plate") {
            car.licence_plate = ctx.message.text;
            car.current_status = "finished";
            await car.save();
            await ctx.reply(`New car registered successfully`, {
              parse_mode: "HTML",
              ...Markup.keyboard([["My cars", "Adding new car"]]).resize(),
            });
          }
        }
      }
    }
  }

  async myCars(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botModel.findByPk(userId);
    if (!user) {
      await ctx.reply(`Please, press start button`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["/start"]])
          .resize()
          .oneTime(),
      });
    } else {
      const user_cars = await this.carModel.findAll({
        where: { user_id: userId },
      });

      const finishedCars = user_cars.filter(
        (car) => car.current_status === "finished",
      );

      finishedCars.forEach(async (car) => {
        await ctx.replyWithHTML(
          `<b>🚗 Brand: </b> ${car.brand}\n` +
            `<b>📄 Model: </b> ${car.model}\n` +
            `<b>🎨 Color: </b> ${car.color}\n` +
            `<b>📅 Year: </b> ${car.year}\n` +
            `<b>🔖 License Plate: </b> ${car.licence_plate}\n\n` +
            // `<b>⚙️ Status: </b> ${car.current_status}`,
            `📌<i>Functionality of buttons will be added later.</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  // {
                  //   text: "🛠️ Service History",
                  //   callback_data: `service_history_${car.user_id}`,
                  // },
                  // {
                  //   text: "📋 Edit Details",
                  //   callback_data: `edit_car_${car.user_id}`,
                  // },
                ],
                [
                  {
                    text: "❌ Delete Car",
                    callback_data: `delete_car_${car.user_id}`,
                  },
                ],
              ],
            },
          },
        );
      });
    }
  }

  async sendOtp(phone_number: string, OTP: string): Promise<boolean> {
    const user = await this.botModel.findOne({ where: { phone_number } });
    if (!user || !user.status) {
      return false;
    }
    await this.bot.telegram.sendChatAction(user.user_id, "typing");

    await this.bot.telegram.sendMessage(user.user_id, "Verify OTP code:" + OTP);
    return true;
  }
}
